<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket, set at design start = 202607). Logs sit at `docs/plans/202607/logs/58-workflow-counters/` and are delete-eligible. -->

# Workflow Attempt Counters — Sub-Plan 1: Single-source the fold + derivation helpers + cross-process tests

**Parent Plan:** [`58-workflow-counters-plan.md`](58-workflow-counters-plan.md)
**Sibling Sub-Plans:** [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) (the KN-26 atomic core) · [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md) (prose cleanup, deletion, provenance, docs)
**Scope:** WS-1 (T1.1–T1.3) + WS-2 (T2.0–T2.10) + T5.2 · **15 tasks** · ends at 🔒 Gate 2a.
**Position in order:** FIRST. No sub-plan may start before this one's Gate 2a is `[x]`.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this file natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

Orchestrators (`bkit-build`, `bkit-debug`, `bkit-ship`) branch retry loops on **model**-tracked prose counters — `Init counters: TEST_ATTEMPT = 0` (`bkit-build.md:319`), `Increment TEST_ATTEMPT + 1` (`bkit-build.md:914`). Shell receives a number the model remembered and typed. `decide_next` launders it through shell, then enforces the cap against the wrong number. Telemetry confirms: all 10 `counter` rows in `stats.jsonl` declare `counterSource: "model-self-report"`, zero `shell-bus`.

Fix (`docs/decisions.jsonl` → `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`): **derivation, not storage** — `attempt(step) = count(step-done rows for that step, status DONE, in the ACTIVE run of that workflow) + 1`, at step START, **re-derived** in every fenced block that needs it. Shell state does not survive between Bash calls → never carried, only re-read.

**This sub-plan = purely additive foundation:** single-source the `status.jsonl` fold, add three derivation helpers **alongside** live inert primitives, repoint test corpus template-relative, land cross-process suites. **No `--argjson` call site, guard hardening, or deletion** — reversible in isolation, off the KN-26 seam.

**Success Criteria (this sub-plan):**

- Fold blob once in `.bkit/templates/.bkit/scripts/bkit-status-fold.sh`; all 15 inline copies source it fail-closed.
- `counter_count` / `counter_next` / `counter_current` in counter-bus **template** with three-position contract documented; four inert primitives **untouched**.
- Every bats + Vitest suite resolves scripts **template-relative** — no suite reads `.bkit/scripts/` mirror.
- Cross-process derivation suites pass; `tests/counter-failclosed.bats` RED **for documented reason** (fail-open), proving detection.

**Related Issues:**

- `#234 — telemetry JSONL master feature (open)` — #58 measurement slice, not control-flow. Owns `counterSource` enum; plan uses existing `shell-bus`, adds no member.
- `#209 — status.json → append-only status.jsonl + fold (closed)` — derivation substrate.
- `#232`, `#183`, `#233` — consolidated into #234 with #58 (2026-06-06).
- `#341 — all-runtimes / gh fallback + trackers-stay-on-MCP (open)` — fix path for search failure below; no scope here.

> [!CAUTION]
> **Related-issues scan NOT performed — missing context, not "nothing related".** `mcp__github__search_issues` returned `total_count: 0` for every probe **including control** `repo:cbartens/bkit telemetry` (must match #234). Refs from issue body/comments, not re-confirmed. Logged `.bkit/friction.jsonl` (`design-step-3-related-issues-search-silently-empty-on-private-repo`, `recurrenceCount: 2`). See `related-issues.md`.

## Dependencies

- **Upstream:** None. First sub-plan. `#209` (status.jsonl + fold) shipped = substrate.
- **Downstream:** [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) blocked until 🔒 Gate 2a `[x]` — needs T2.1 helpers, T2.7/T2.9 `counter-failclosed.bats`.
- **Owns 🔒 Gate 1 and 🔒 Gate 2a** + two 👤 human checkboxes gating whole feature (all three sub-plans).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Testable contract for the feature; implementation/tests/verification derive from here. Wrong here → wrong downstream.
>
> **Sign-off for ALL THREE sub-plans.** `58-workflow-counters-plan-2.md` and `58-workflow-counters-plan-3.md` inherit; no second checkbox.
>
> **You do NOT need to read the rest of this plan.** Focus here; agent handles the rest.

### Narrative

> [!NOTE]
> **HUMAN-PROVIDED** (owner, 2026-07-16, Gate 1). Agent Narrative rejected/replaced. Template deviation (§ Breaking Changes 10/11) moot — `docs/plans/template.md:46` met. Rejected = loop terminates; owner = **provenance**. Tests follow owner framing.

Retry-loop counters: same caps/ladder/routes/verdicts. Change = **source**: model context → `status.jsonl` derive per fenced block.

**Corollary** (owner-confirmed): unusable counter (empty/non-integer/unreadable log) **stops the run** (was silent continue) — advertised cap enforced (§ Breaking Changes item 1).

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

**Outcome:** Run stops at advertised cap. Four `build-run-tests` rows, distinct `parentSha`; each `attempt` equals row ordinal; routing from shell count, not model memory.

### Edge Cases _(this sub-plan's slice; the full table lives in the parent index)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Counter expands empty / non-integer at a routing block | `decide_next` / `check_max`: **nothing** stdout, diagnostic stderr, `return 2` → exit 2 → **Failure Path**. Never continue. _(Guard hardening: `58-workflow-counters-plan-2.md` T3.8; suite: T2.7 here.)_ |
| `status.jsonl` missing or unreadable at a derive block | `counter_count` returns 2 → `|| exit 2` → **Failure Path**. Never default 0. |
| **Routing site reads `0` legitimately** (`bkit-build.md:781-787` challenge-remediate first CONCERNS/FAIL; `bkit-debug.md:443` SOAK budget Step 3, rows Step 7) | `counter_count` prints `0`, exit **0** → continue (Step 11 / Step 4). **NOT** Failure Path. Only `counter_current` (post-own-write) may refuse `0`. Issue constraint 1 regression — test, not prose. |
| **Resume** (latest run `IN_PROGRESS` for this workflow) | `bkit-build.md:337-340` / `bkit-debug.md:328-330` append `workflow-started` **only if** latest folded run is not (this workflow AND `IN_PROGRESS`) → no new run → active-run scoping continues. Spent budget inherited on purpose (acceptance bullet 5). |
| **Re-invoke** after DONE / FAILED | New `workflow-started` → new active run → **fresh budget** (DE-25 starvation). Opposite of resume row; correct for opposite reason. |
| `debug` run interleaves between two `build` invocations | **Flagged, not proven, load-bearing.** `bkit-build.md:338` tests `(.[-1] // {})` — last run **overall**, not last *build*. Finished `debug` at `.[-1]` → resuming build may append fresh `workflow-started` → budget reset (Defect 3 side door). Lock at `:141`; exclusion unestablished. T2.10 fixture pins today's behaviour; semantics = #209 substrate → deferral row. |
| `PRIOR_STRATEGY` reads same log, all-runs scoping | **Unchanged, deliberately opposite.** Both sites comment the asymmetry. |
| Two real retries of same step | Dedup key `"S {workflow} {step} {parentSha} {at}"` includes **`at`**. Retries differ if `parentSha` **or** wall-clock second differs. |
| Byte-identical row replay | Collapses to 1 — intended; counter coupled to per-attempt commit cadence. |
| Per-attempt `--allow-empty` commit dropped | Attempts collapse only when `parentSha` **and** same-second `at` collide — narrower than "no commit → collapse". Stated precisely for T1.1 header comment. |
| **Counted step, `parentSha` advances transitively** (`debug-run-tests`: `bkit-debug.md:399` no commit; Steps 4/5/6 commit `:576`/`:649`/`:710`) | **Deliberate (KN-26):** no intermediate `chore(...)` so `fix(...)` stays branch HEAD (Vercel-ignore → CI `partial` → no coverage). **Must NOT re-add commit** — per-site shape does not apply `:399-406`. T2.6 corpus audit. |
| SOAK re-entered after NORMAL exhaustion, mid-run | `workflow-meta` `soakEntryAt` at each SOAK entry; count only `debug-failure-soak` with `.at > soakEntryAt` → fresh budget. |
| Two SOAK entries same wall-clock second | Fold dedups `workflow-meta` on `"W {type} {workflow} {at}"` → one marker. Acceptable, asserted. |
| Log with no `soakEntryAt` (fresh SOAK or older bkit) | `.at > ""` true for every row → all soak rows in active run. Correct; additive, no migration. |
| Orchestrator mis-transcribes derived value into filename / comment | Artifact/`attempt` wrong; **routing unaffected** (re-derives). `attempt` telemetry-only by contract. |

### Derived Test Matrix — this sub-plan's slice (**11 of the master's 19 rows**)

> Tiering per `docs/testing.md` § "Which tier does a behaviour need?". Every row crosses a real boundary (`status.jsonl`, `jq`, `git`, processes) with non-mock ground-truth assertion. No `@live`/`E2E`/DB/UI rows. `bats` in CI `bkit-tests-unit` via `npx --yes bats tests/*.bats` (`ci.yml:500-502`) — no CI wiring.
>
> Rows 7, 8, 10, 14, 15 (T5.3, T5.4, T3.4b, T3.6, T5.1) → [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md). Rows 17, 18, 19 (T6.2, T7.1, T8.3) → [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md). **11 + 5 + 3 = 19.**

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
| **Run-boundary interleave:** a `build` run left `IN_PROGRESS`, a complete `debug` run appended after it, then a resuming build → pins whether `bkit-build.md:338`'s `(.[-1] // {})` resets the budget. Asserts today's actual behaviour (characterisation), so the derivation's dependence on `:338` is visible rather than latent | Integration (bats) | `tests/counter-derive.bats` | T2.10 |
| Fail-closed: unset / empty / non-integer counter → `decide_next` and `check_max` print nothing on stdout, exit 2 (**refused**, not continue); over-cap → prints `failure-path`, exit 1. Both **fail against `dev`'s counter-bus** via the `BKIT_COUNTER_BUS` override | Integration (bats, boundary: exit codes across processes) | `tests/counter-failclosed.bats` | T2.7 |
| SOAK marker: rows before `soakEntryAt` are excluded → a second SOAK entry gets a full fresh budget; absent marker counts all rows | Integration (bats) | `tests/counter-derive.bats` | T2.8 |
| Every `MAX_*` defined in `bkit-counter-bus-config.sh` is referenced by >=1 fenced shell block across the workflow corpus (no dead constant — closes constraint 6's second half) | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T5.2 |

> [!IMPORTANT]
> **T5.2 dependency runs the other way.** "No dead constant" goes green after T3.3 ([`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)) adds `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reference. T5.2 lands **here** (pure test, no conversion coupling); Done-when satisfiable now: dynamic enum, pass against corpus as-is. Constant still dead → RED for that one — record as expected RED into plan-2 T3.3 (like T2.7). **Do NOT hardcode a list to green** (reproduces `EXPECTED_CONSTANTS` 6-of-7 blind spot) or add reference here (T3.3's, far side of seam).

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!NOTE]
> **Owner (@cbartens) Gate 1, 2026-07-16** (orchestrator keyed; confirmation is owner's). Verbatim:
>
> - Narrowed prose (§ Breaking Changes item 5 — bare `X_ATTEMPT` banned; `{X_ATTEMPT}`/`MAX_*` exempt; `${X_ATTEMPT}` not): _"ok"_.
> - Narrative rejected/replaced — _"we're replacing existing in context counters with status.jsonl based counter no? that's what the acceptance should describe, no business rule changes just where counts come from, more deterministic more reliable not based on context memory"_.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked. **This checkbox gates all three sub-plans.**

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review names and breaking changes below — only other section needing your attention.
>
> **Sign-off for ALL THREE sub-plans.** Reproduced here because Gate 1 gates whole feature. Plan-2/3 restate governing items; **no second checkbox**.

**1. `decide_next` / `check_max` exit contract changes — BREAKING, and it is the point.**

`.bkit/scripts/bkit-counter-bus.sh` is **shipped consumer** (core template walk, `.bkit/version` canonicalHashes). Today unset counter → `[ "" -gt 3 ]` → non-zero → indistinguishable from "condition false" → **continue**. After → exit 2 → **Failure Path**. Any consumer with unset variable flips silent forever-retry to loud fail. Only callers = bkit workflows, converted same PR.

> [!WARNING]
> **Cannot ship alone (KN-26).** Hardening without derivation: "may silently overrun" → "**never retries**". **T3.1–T3.7 before T3.8**, same PR. Do not reorder or split PR on seam. **Both in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md); this sub-plan ships neither.**

**2. Inert primitives deleted from shipped script — BREAKING.** `counter_init` / `counter_inc` / `counter_get` / `counter_reset` + `BKIT_COUNTER_*` removed (WS-6, **last**, [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md)). One live site today (`bkit-debug.md:435`, inert — writes `BKIT_COUNTER_SOAK_ATTEMPT`, `:443` reads `$SOAK_ATTEMPT`). Safe only after every site converted.

**3. New shipped file: `.bkit/scripts/bkit-status-fold.sh`** exporting `BKIT_STATUS_FOLD`. Core template walk from `.bkit/templates/.bkit/scripts/` — no manifest (counter-bus has none); `bkit install` stamps `canonicalHashes`. **Renamed** from local `FOLD` → `BKIT_STATUS_FOLD` (sourced script must not claim generic name). 15 sites, 5 workflows. **T1.1/T1.2 — this sub-plan.**

**4. New `status.jsonl` field: `soakEntryAt`** on `workflow-meta`. Additive; fold merges `workflow-meta` last-wins. No marker → all soak rows count = fresh budget; no migration.

> [!IMPORTANT]
> Timestamp MUST be `soakEntryAt`, **not** event `at`: fold `del(.type,.workflow,.at)` on `workflow-meta` discards `at` before run object.

**5. Issue's "no `*_ATTEMPT` in prose" not literally achievable — two exemptions proposed.**

Filenames embed attempt (`build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`); Context lines carry `{VERIFY_ATTEMPT}`. Placeholders **must** stay — orchestrator substitutes from derive stdout.

**Measured:** `grep -rcE '(^|[^$])\{[A-Z][A-Z0-9_]*_ATTEMPT\}' .bkit/workflows/*.md` → **62 lines** (build 26, debug 26, ship 10). Separate **48** `${X_ATTEMPT}` expansions — _not_ placeholders, **must NOT** be exempted.

Enforceable rule (preserves intent — no counter **originates** in context):

- **BANNED** outside fenced block: bare `X_ATTEMPT` (assignments, increments, comparisons).
- **ALLOWED:** `{X_ATTEMPT}` (substitution token); `MAX_X_ATTEMPT` (constant **name**, no value).
- **NOT allowed:** `${X_ATTEMPT}` — _value_ reference. Exemption needs negative lookbehind on `$`; else 48 expansions widen silently. T5.1 negative-control: `${TEST_ATTEMPT}` in prose **caught**.

Transcription error mis-names artifact; cannot corrupt routing (re-derives). `attempt` telemetry-only.

> [!CAUTION]
> **Narrowing of #58 acceptance — needs sign-off.** Issue says "no `*_ATTEMPT` in prose" full stop; 62 placeholder lines must survive. Confirming = **narrowed** criterion above, not literal absolute. Rule at T5.1 ([`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)); enforcement T4.1/T4.2 ([`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md)); inherit this checkbox.

**6. Shipped prose audit vacuous — green proves nothing.**

`ATTEMPT_COMPARISON_PATTERN = /\bATTEMPT\b.*(?:<=|>=|<|>)\s*(?:`?)MAX_|MAX_\w+\s*(?:<=|>=|<|>)\s*\d/`. `\bATTEMPT\b`cannot match inside`VERIFY_ATTEMPT`(preceding`_`= word char). **Pattern matches no real counter name.** Same for`MAX_LITERAL_DEFINITION_PATTERN`. Both pass by matching nothing. Worse than #179/#195: asserts nothing. Widened audit **must** ship negative control (T5.1).

**7. Issue's 7-site table incomplete — 3 more prose comparisons.**

`bkit-debug.md:420` (`NORMAL_ATTEMPT > 1`), `:421` (`NORMAL_ATTEMPT = 1`), `:805` (`NORMAL_ATTEMPT > 1`) — not `MAX_` caps ("first try" vs "fixed something") but model-authored comparisons; widened audit flags. T3.5. Verdict semantics stay orchestrator; **number** moves to shell.

**8. `DEBUG_ATTEMPT` already derived; scoping must stay CROSS-run — do not "fix" to active-run.**

`bkit-debug.md:179-185` folds `last.debugAttempt` across **all** `debug` runs + 1. Correct: counts **invocations**, not in-run steps. Active-run would reset every invocation → disable SOAK escalation. Defect: derived Step 7, read Step 8 (`:197`) across process boundary.

> [!WARNING]
> **Draft "move `:184-185` into `:191-197`" self-contradictory, corrected.** `$DEBUG_ATTEMPT` assigned once `:184-185`, read cross-block **~18 places** — `:335` (`--argjson da`), `:337`, `:379`, `:476-576` fetch phase. _Moving_ starves all → `:335` hard-fails → every debug run dies at `debug-worktree-setup`. Draft Done-when ("no cross-block read") unsatisfiable. Fold **copied, not moved**: `:184-185` stays for placeholder substitution; consumers **re-derive** identical cross-run expression (item 10a completeness rule).
>
> **Circularity:** `:335` writes `debugAttempt` _from_ `$DEBUG_ATTEMPT`; fold reads marker back. Until `:335` re-derives, only cross-run counter is model-grounded → T7.1 would inherit. `:335` = unconverted **consumer**, not merely precedent.

**9. `counterSource` flips `model-self-report` → `shell-bus` on 5 emitters.** `.bkit/stats.jsonl` consumers (#234, #183) see distribution change. No new enum member — `"derived"` vs `"shell-bus"` is #234's question.

> [!IMPORTANT]
> 5 emitters pass `--argjson counterValue 1` — **hardcoded literal**, not remembered number. Flag-only flip = dishonest label swap. T7.1 derives from fold first; flag follows fact.
>
> **One definition:** `counterValue` = count of `workflow-started` for workflow, **all-runs** (cross-run invocation index like `DEBUG_ATTEMPT` — **not** active-run rule). `bkit-debug.md` same expression as other four; does **not** reuse `debugAttempt` fold (model-grounded — item 8). `counterName` pairing = #234 → deferral row.

**10. Site list rule-derived. Three findings hand-enumeration hid — central correction.**

**10a. Completeness rule (NEW, load-bearing).** Draft converted ~7 sites, cited #58 Comment 3 "20 `--argjson`" without reconciling. Measured: `grep -rnE '\-\-argjson [a-z]+ "\$[A-Z_]*ATTEMPT"' .bkit/workflows/` → **18 lines / 19 refs** (build 8, debug 7 — `:759` has `a`+`sa` — ship 3). Every one = fenced bare `$X_ATTEMPT`, no in-block derive.

Draft artifact agreed: `docs/decisions.jsonl` (ACTIVE) — _"every fenced block RE-DERIVES"_ / _"20 status-write sites"_. **Draft could not detect shortfall:** prose audit strips fences; T5.1/T5.2 blind; T7.1 = 5 telemetry rows only; T3.8 cannot help (`--argjson` hard-fails empty — defect is **miscount**, valid JSON). Could reach Gate 4 green with 12/18 still model-authored. **Defect-4 indictment reproduced one level up.**

Fix structural: **T5.3** block-scoped rule (no bare `$X_ATTEMPT` without derive) + **T3.0** worklist from rule. Line numbers = convenience index, never authority. **Both in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md).**

**10b. `counter_current` refuse-at-0 bricks two first-attempt routes — constraint 1 regression.** Two-position contract has no slot for **route on prior/not-yet-run step**. Both legitimately read `0`:

- `bkit-build.md:781-787` — routes on prior `build-challenge-remediate`. First CONCERNS/FAIL → 0 rows → refuse → **Failure Path** (today Step 11). Draft T3.3 Done-when demanded opposite.
- `bkit-debug.md:443` — `check_max SOAK` Step 3; soak rows Step 7. First failing run → 0 soak rows → Failure Path.

Both use **`counter_count`** (0 legal, exit 0) + `THRESHOLD=$((MAX_X - 1))`. `counter_current` 0-refusal = post-own-write **only**. Would ship green: no matrix row for valid `0`. **T2.9 — this sub-plan — exercises it.**

**10c. `debug-run-tests` no per-attempt commit — KN-26 deliberate; per-site shape would re-add.** `bkit-build.md:935` commits (`:942` `--allow-empty`); `bkit-debug.md:399` "**Update status:**" **no commit** — only step-done writer in debug without one. **KN-26 remediation:** `chore(...)` HEAD → Vercel-ignore → CI `partial` → no coverage. **Critical.** Per-site shape put value in commit subject → implementer at T3.5 `:403` re-enters broken pattern. Shape now **conditional** on block already committing; `:399-406` must-not-gain-one. **T2.6 — this sub-plan — audits.**

> [!WARNING]
> **WS-4 must not run early.** T4.1 deletes prose (`Init counters:`, `Increment X + 1`) instructing model substitution. Deleting while 18 blocks unconverted **worse than status quo**: no derive _and_ no substitution → empty `$TEST_ATTEMPT` → `jq: invalid JSON text` → hard fail on diagnose/soak/remediate + `debug-context-*`. WS-4 gated on T5.3 green, not T3.1–T3.7 ticked. **WS-4 in [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md), two sub-plans downstream.**

**11. Template deviation — RESOLVED 2026-07-16.** `docs/plans/template.md:46` wanted human Narrative. Owner **replaced** agent draft (§ Narrative). Met; deviation spent. Draft = loop terminates; owner = provenance.

> [!IMPORTANT]
> Draft claimed synthesised text _"verbatim from #58"_ — **false**. Success Criteria near-verbatim from #58 § Acceptance; only Narrative replaced.

**Proposed names** (all new): `.bkit/scripts/bkit-status-fold.sh`, `BKIT_STATUS_FOLD`, `counter_count`, `counter_next`, `counter_current`, `soakEntryAt`, `tests/counter-derive.bats`, `tests/counter-failclosed.bats`, `.bkit/src/bkit-status-fold.test.ts`, env override `BKIT_COUNTER_BUS`, env override `BKIT_STATUS_FOLD_SH`.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!NOTE]
> **Owner (@cbartens) Gate 1, 2026-07-16.** Verbatim: _"ok if it makes the counters and their business rules more reliable"_. Condition = **scope**: items 1–11 covered only insofar as they buy reliability.
>
> - Item 10b (0-refusal bricking first-attempt routes) **out** — T2.9.
> - Item 10c (do not restore `debug-run-tests` per-attempt commit) **out** — T2.6.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked. **This checkbox gates all three sub-plans.**

---

## Alternative Approaches & Recommendations _(inherited — full list in the parent index)_

- **Stored `counters` object in status (original #58 sketch) — REJECTED.** Required policing invariant (_"`counters.verifyAttempt` must equal count of `plan-verify` entries"_) because stored counter drifts. Counting rows = invariant by construction. Superseded by ACTIVE decision; written pre-#209 `status.json` array.
- **Persist `BKIT_COUNTER_*` across blocks — REJECTED, known impossible.** Each fenced block = fresh process. Wiring broken (helper writes `BKIT_COUNTER_{NAME}`, sites read `${NAME}`).
- **Read back `attempt` field instead of counting rows — REJECTED.** Depends on every step writing `attempt` faithfully. Row count needs no trust → `attempt` telemetry-only.
- **Copy `PRIOR_STRATEGY`'s fold-and-read shape — REJECTED.** All-runs correct-ish for strategy; wrong for attempts (resume inherits spent budget — DE-25). Two reads, one log, opposite scoping, commented both sites.
- **Harden `decide_next` now, derive later — REJECTED.** Silent-overrun → never-retries. KN-26. **Same inversion via side doors** — `counter_current` refuse-at-0 at `bkit-build.md:781-787`, `bkit-debug.md:443` (§ item 10b). Not only task-order; per-site property hiding at prior-step routes.

## Out of Scope _(this sub-plan)_

- Converting `--argjson` sites, hardening guards, deleting primitives, prose, `counterSource`. **All [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) + [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md).** Additive by construction.
- `PRIOR_STRATEGY` all-runs scoping — flagged/commented, not changed. Strategy intent never established. → deferral row. _(Also `bkit-build.md:596` sub-plan-scoped + `--argjson sp "$SUB_PLAN"` — third variant; one T1.2 comment clause.)_
- **`status.jsonl` run-boundary semantics** — `bkit-build.md:338` / `bkit-debug.md:328-330` key on `(.[-1] // {})`, last run overall not last _this workflow_. Load-bearing for budget inherit/reset; T2.10 characterises; change = #209. → deferral row.
- Shellcheck CI gate over `.bkit/scripts/*.sh`. → deferral row.
- **`debug-run-tests` regains per-attempt commit?** Collides KN-26 (§ item 10c); must not be answered by per-site shape. → deferral row.

## Merge Method

**Merge method: always squash.** All three sub-plans → **ONE PR** — non-negotiable (Breaking Changes item 1): WS-3 derivation + T3.8 hardening = KN-26 pair, inseparable at merge. Sub-plan split = execution boundary, **NOT PR boundary.** No PR at end of this sub-plan. `bkit-ship.md` Step 5: `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory _(this sub-plan's rows)_

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| 15 × inline `FOLD='def lastIdx…'` (`bkit-build.md` `:144`, `:336`, `:595`, `:990`; `bkit-debug.md` `:132`, `:183`, `:326`, `:627`; `bkit-ship.md` `:155`, `:332`, `:727`; `bkit-plan.md` `:104`, `:260`; `bkit-design.md` `:103`, `:256`) | `.bkit/scripts/bkit-status-fold.sh` (`BKIT_STATUS_FOLD`) | DELETE | 15 hand-synced 1079-byte copies across 5 workflows. Single source = derivation + workflows agree by construction. |
| `EXPECTED_CONSTANTS` (`bkit-counter-prose-audit.test.ts:144-151`) — **6 of 7** `MAX_*`, omits `MAX_CHALLENGE_REMEDIATE_ATTEMPT` | T5.2 dynamic enum from `bkit-counter-bus-config.sh` | DELETE | Omitted constant = dead one (constraint 6) — same blind spot as § item 10a in miniature. |

> Rows for the inert primitives, `tests/counter-bus.bats` §1-4/§8/§9, the two vacuous patterns, `EXPECTED_FUNCTIONS`, the 18 `--argjson` sites, the literal-`1` gate, the 5 telemetry emitters and the 6 `2>/dev/null` suppressions belong to [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) / [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md).

## Security & Privacy

- [x] **None — no new routes, DB writes, secrets, or user input.** No API route, no DB table/column, no role-gated mutation, no user input, no PII, no redirect, no webhook, no new env var.
- **New executable surface, assessed:** `.bkit/scripts/bkit-status-fold.sh` is sourced (`.`) by workflow bash blocks from `$REPO_ROOT` — identical trust boundary and idiom to the existing `bkit-counter-bus.sh` / `bkit-counter-bus-config.sh` sourcing. It defines one variable and no functions. No new `ask`/`deny` entry in `.claude/settings.json` is needed (no new destructive command; § Authoring Checklist item on destructive shell commands is satisfied vacuously).
- **Untrusted input:** counters are derived from `status.jsonl`, written only by the workflows themselves — not from issue/PR/comment bodies. The derivation adds no attacker-controlled path (#342 contract unaffected).

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [x] **Package Management:** No new packages added by this sub-plan — verified: no `package.json` / `pnpm-lock.yaml` diff from this session's work. `bats` used via `npx --yes bats` per `ci.yml:502`; `jq` confirmed present (`jq-1.7.1-apple`). `git status --porcelain pnpm-lock.yaml` is clean.
- [x] **Dependency Versions:** `pnpm` `10.34.3` (packageManager already pins 10.34.3 — not 10.34.1 hold-warn; pre-existing #176/#268, untouched). `tsc` 7.0.2 · `jq` 1.7.1-apple · `bats` 1.13.0.
- [x] **User Context:** Write access verified to `.bkit/templates/.bkit/scripts/`, `.bkit/workflows/`, `.bkit/src/`, `tests/` (all four already edited successfully in this session).
- [x] **Pending Blockers:** No `blocker`-labelled issue surfaced touching the counter-bus or `status.jsonl` during this session's work; none encountered as a hard stop.
- [x] **Project Context:** Confirmed present — `docs/decisions.jsonl` carries `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored` (ACTIVE), `de-24-143-soak-mode-reuses-max-debug-attempt-as-the-single-sh`, `de-25-143-observe-mode-removed-observation-logging-folds-into`; `docs/knowledge.jsonl` carries KN-26.
- [x] **Testing & Quality:** Aligns with `docs/testing.md` — suites (`bkit-status-fold.test.ts`, `counter-derive.bats`, `counter-failclosed.bats`, T2.6/T5.2 prose-audit) hit real `status.jsonl`/`git`/`jq` via `mktemp` fixtures; assert exit codes/printed values (no mocks, no "did not throw"). No empty suites.
- [x] **Prerequisite Plans:** None. #209 already shipped and is the substrate (its fold/dedup shape is what `bkit-status-fold.sh` sources verbatim). This is the first of three sub-plans; no sibling ran before it.
- [x] **Concurrency:** No second bkit workflow ran on this clone during this session.

### Conditional (verify only when applicable)

- [x] **Architecture:** `.bkit/workflows/` treated as canonical source throughout (edited directly); `.claude/`, `.cursor/`, `.opencode/` were NOT touched. `.bkit/templates/.bkit/scripts/*.sh` edited as the source for `.bkit/scripts/*.sh`; the installed mirror was NOT touched and `pnpm bkit install` was NOT run (T8.3 in sub-plan 3 is the only install).
- [x] **Observability:** No telemetry-append sites touched (T7.1 = sub-plan 3). `[bkit-telemetry]` prefix kept on fail-closed fold source diagnostic.

_Not applicable: Secrets & Env Vars, Schema State (no DB), UI/Design, Notifications._

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [x] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [x] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [x] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

No database. The "schema" here is the `status.jsonl` append-only event log (`.bkit/workflows.md` § Status; `docs/data-schema.md` is not applicable to bkit itself).

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `status.jsonl` folded run array → `.workflow`, `.status`, `.steps[].step`, `.steps[].status`, `.steps[].subPlan`, `.steps[].at`, `.steps[].parentSha`; run-level `.debugAttempt` (existing `workflow-meta` field, cross-run, `DEBUG_ATTEMPT` only).
- **Output (Write):** `step-done` rows (unchanged shape). _(The `attempt`-field derivation and `.bkit/stats.jsonl` `counter` rows are written in the downstream sub-plans; this one only reads.)_

### Data Schema Changes

- **ADD:** `workflow-meta.soakEntryAt` (type: string, ISO-8601 UTC) — appended at every SOAK entry in `bkit-debug.md`. Folds onto the run object via the existing `workflow-meta` merge branch. Additive and optional; absent → all soak rows in the active run count (fresh budget). No migration. _(The workflow-side writers are T3.6 in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md); T2.8 here tests the read against a hand-seeded fixture.)_
- **UNCHANGED:** `step-done.attempt` stays on every row and keeps its type, but is **re-classified as telemetry-only** — routing counts rows, so a missing or wrong `attempt` cannot corrupt control flow. Documented in `.bkit/workflows.md` (T8.1, [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md)).
- **UNCHANGED:** the fold reducer itself (byte-identical, just relocated). `soakEntryAt` needs no fold change.

## Architecture & Component Changes

### Shell — shipped scripts (source: `.bkit/templates/.bkit/scripts/`)

#### [NEW] `.bkit/templates/.bkit/scripts/bkit-status-fold.sh`

- Defines `BKIT_STATUS_FOLD` — jq prelude (`def lastIdx($w): …; def fold: …;`) **byte-identical** to 15× inline blob. Length/md5 **measured at T1.1** (§ Runbook T1.1).
- Header: single source for `status.jsonl` fold; dedup key `"S {workflow} {step} {parentSha} {at}"` includes **`at`** — collapse only when `parentSha` **and** second collide. Counting couples to per-attempt commit **or** different second. Do **not** assert "no commit → collapse" (false). Name transitive case: `debug-run-tests` no in-block commit (KN-26 — § item 10c); `parentSha` via Steps 4/5/6.
- `# shellcheck disable=SC2016` for single-quoted blob. No CI shellcheck gate — directive for local runs.
- Ships via core template walk (`bkit-modules.ts:349` `processCoreTemplateDir` → `writeTier2`). Installed copy + hash at T8.3 ([`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md)), never here.

#### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh` — **additive half only**

- **Existence Check:** exists (`.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`); installed copy `.bkit/scripts/bkit-counter-bus.sh` is byte-identical and hashed at `.bkit/version:65`.
- **ADD** `counter_count STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]` → prints the count of `step-done` rows for `STEP` with `status=="DONE"` in the **ACTIVE run** (`fold | map(select(.workflow==$w)) | last | .steps`). `--sub-plan` adds `and .subPlan==$sp`; `--since FIELD` adds `and .at > (run[FIELD] // "")`. Returns **2** (printing nothing on stdout) when the file is missing/unreadable, jq fails, or the result is not a non-negative integer. Requires `BKIT_STATUS_FOLD` to be sourced.
- **ADD** `counter_next …` = `counter_count` + 1 — the value at step **START** (what the artifact filename embeds and the row records).
- **ADD** `counter_current …` = `counter_count`, refusing (return 2) when the count is 0 — the value **after** the step appended its row (the row it just wrote _is_ this attempt). Its 0-refusal is a **post-own-write** assertion and is valid **only** at that position.
- **THREE positions, not two** (§ Breaking Changes item 10b — the draft's two-position contract had no slot for the third and bricked two live routes):
  1. **derive-at-START** → `counter_next`.
  2. **route-after-own-write** → `counter_current` (0 is impossible here; refusing it catches a dropped row).
  3. **route-on-a-prior/not-yet-executed-step** → `counter_count` directly. **`0` is a legal answer, exit 0**, routing to the continue branch. Live sites: `bkit-build.md:781-787`/`:807` (challenge-remediate, first pass) and `bkit-debug.md:443` (SOAK budget in Step 3; rows written in Step 7). Never `counter_current` here.
- **`counter_count` is public API**, not an internal of the other two. Its header documents position 3 and names both live sites, so the next reader does not reach for `counter_current` because it is "the routing helper".
- **ADD** a header comment naming the deliberate asymmetry with `PRIOR_STRATEGY`'s all-runs read.
- **NOT HERE — [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) T3.8:** hardening `check_max` / `decide_next`. **NOT HERE — [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md) T6.1:** deleting `counter_init`/`counter_inc`/`counter_get`/`counter_reset`. **Both are explicitly out of this sub-plan's scope and doing either here breaks the KN-26 ordering.**

#### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-counter-bus-config.sh`

- **Existence Check:** exists; all 7 `MAX_*` already defined. No value changes. Comment only: note `MAX_CHALLENGE_REMEDIATE_ATTEMPT` is consumed via the `THRESHOLD=$((MAX_X - 1))` idiom.

### Orchestrator workflows (canonical source: `.bkit/workflows/`) — **FOLD sites only in this sub-plan**

- `bkit-build.md` (`:144`, `:336`, `:595`, `:990`), `bkit-debug.md` (`:132`, `:183`, `:326`, `:627`), `bkit-ship.md` (`:155`, `:332`, `:727`), `bkit-plan.md` (`:104`, `:260`), `bkit-design.md` (`:103`, `:256`) — 15 sites, T1.2. Plus the `PRIOR_STRATEGY` all-runs comments at `bkit-build.md:595`, `:990`; `bkit-debug.md:627`; `bkit-ship.md:727`.
- **No `--argjson` counter site is touched here.** Those 18 sites are [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)'s.

### Tests

#### [MODIFY] `.bkit/src/bkit-counter-prose-audit.test.ts` — **T2.0's repoint + T2.6 + T5.2 only**

- **Existence Check:** exists (187 lines).
- **This sub-plan:** repoint both script reads template-relative (T2.0); add the commit-cadence corpus audit (T2.6); replace `EXPECTED_CONSTANTS` with T5.2's dynamic enumeration.
- **NOT this sub-plan:** the widened prose pattern + negative control (T5.1), the completeness rule (T5.3), the mapping rule (T5.4) → [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md); `EXPECTED_FUNCTIONS` + absent-primitives rule (T6.2), counter-row provenance rule (T7.1) → [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md). **The file is edited by all three sub-plans; each owns disjoint rules.**

#### [NEW] `.bkit/src/bkit-status-fold.test.ts` · [NEW] `tests/counter-derive.bats` · [NEW] `tests/counter-failclosed.bats`

- Colocation per `docs/testing.md` § Stack (test files under `.bkit/src/`); bats suites live in `tests/` beside `counter-bus.bats` / `telemetry-failopen.bats` and auto-run via `npx --yes bats tests/*.bats`.

> [!WARNING]
> **Test paths → TEMPLATE, not installed copy — inverted dependency; fix = T2.0, FIRST in WS-2.** `tests/counter-bus.bats:15` reads installed `.bkit/scripts/bkit-counter-bus.sh`; code tasks edit `.bkit/templates/.bkit/scripts/…`; `pnpm bkit install` **ONCE at T8.3** ([`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md)). Without T2.0: no `bkit-status-fold.sh` until T8.3; no `counter_count`/`counter_next`/`counter_current`; T3.8 unreachable; T6.2 grep fails; **Gate 2a unpassable** (`command not found`, not fail-open).
>
> **Also Vitest** — `bkit-counter-prose-audit.test.ts` `configPath` (`:143`) + `busPath` (`:166`) pointed at mirror. T6.2 rewrites `EXPECTED_FUNCTIONS` + absent-primitives rule against `busPath` — both halves red until T8.3. Same unpassable-gate shape → **prohibited per-edit `bkit install`**.
>
> **Fix — template-relative defaults (bats + Vitest):**
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
> Overrides keep RED-vs-`dev` proof (`BKIT_COUNTER_BUS` → `git show dev:` extract). **Installed** path exercised at T8.3 `diff` + Manual Step 6 ([`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md)). **Do NOT per-edit `pnpm bkit install`** — contradicts batching rule.
>
> **Scope:** only `.bkit/scripts/*.sh` **reads** affected. T5.3/T5.1/T2.6/T7.1 scan `.bkit/workflows/*.md` (canonical source). T6.2 _grep_ already source-scoped; only `busPath`/`configPath` **reads** move.

#### [MODIFY] `tests/counter-bus.bats` — **repoint only in this sub-plan**

- Repoint `COUNTER_BUS` / `COUNTER_CONFIG` (`:15-16`) to the template-relative defaults above — same override shape as the new suites, so the whole bats corpus resolves consistently and no suite silently tests a stale installed copy (T2.0).
- **NOT this sub-plan:** pruning §1-4, §8's primitive cases and §9 → T6.2 in [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md), which must run after the primitives are deleted.

### Database Migrations

None — bkit has no database.

### Cron Jobs & Scheduled Tasks

None.

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Append a `kind:"deferral"` (or `kind:"failure"`) row per `.bkit/jsonl.md` with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification and checking its box) before starting the exact next task.
> **Edit the SOURCE, never the mirror:** `.bkit/templates/.bkit/scripts/*.sh` → `.bkit/scripts/*.sh`; `.bkit/workflows/*.md` → `.claude/` / `.cursor/` / `.opencode/`. Run `pnpm bkit install` ONCE at T8.3 — **which is in [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md), not here. Do NOT run `bkit install` in this sub-plan for any reason**, including to make a gate pass; T2.0 exists precisely so you never need to.
> **ASCII operators only** in `.bkit/workflows/*.md` and `.bkit/prompts/*.md` — `!=` `>=` `<=`, never `≠ ≥ ≤`.
> **Do NOT open a PR at the end of this sub-plan.** One PR spans all three (§ Merge Method).

### WS-1 — Single-source the fold (prerequisite; pure refactor, green standalone)

- [x] **T1.1:** Create `.bkit/templates/.bkit/scripts/bkit-status-fold.sh` defining `BKIT_STATUS_FOLD` with the blob copied **byte-for-byte** from `.bkit/workflows/bkit-build.md:144` (do not retype it), plus the header comment (§ Architecture — the precise `at`-inclusive dedup key, the `debug-run-tests` transitive case, the `PRIOR_STRATEGY` asymmetry) and `# shellcheck disable=SC2016`. **MEASURE the invariant, do not inherit it:** the `1079` / `d04a2499ad1900d9757b00774dd87866` figures came from issue #58 and it was never established whether they measured the extracted **value** or the whole `FOLD='…'` assignment line (the `FOLD='` wrapper + closing `'` is 7 bytes). Compute both from the tree first, record the value-figures in this task, and only then let T1.3 assert them. A plan that lectures about inherited-and-unverified constants must not stall on one.
  - **Done when:** `.bkit/templates/.bkit/scripts/bkit-status-fold.sh` exists; the **measured** figures are recorded inline in this task (`{MEASURED_BYTES}` / `{MEASURED_MD5}`, from `sh -c '. ./.bkit/templates/.bkit/scripts/bkit-status-fold.sh; printf "%s" "$BKIT_STATUS_FOLD"' | wc -c` and `| md5`); the extracted value is byte-identical to the blob inside `bkit-build.md:144`'s quotes (`diff <(…extract…) <(…script…)` empty); if the measured length is not 1079, the issue's figure is noted as having measured the assignment line, not the value.
  - **MEASURED (not inherited):** fold **value** = **1078 bytes**, md5 **`ed1c4a236d35499f39033206d5b75480`** (byte-identical across all 15 sites). Whole assignment line = 1091 B; bare `FOLD='…'`+NL = 1085 B / md5 `26b814ea6d2e825ddc2b14db397f93de`. Issue's inherited `1079` / `d04a2499…` unreproducible → **T1.3 asserts measured 1078 / `ed1c4a236d35499f39033206d5b75480`**. `diff` vs `bkit-build.md:144` quotes and shipped `$BKIT_STATUS_FOLD` empty.
- [x] **T1.2:** Replace all 15 inline `FOLD='…'` assignments with a **fail-closed** source line and rename every use `"$FOLD"` → `"$BKIT_STATUS_FOLD"`, across `bkit-build.md` (`:144`, `:336`, `:595`, `:990`), `bkit-debug.md` (`:132`, `:183`, `:326`, `:627`), `bkit-ship.md` (`:155`, `:332`, `:727`), `bkit-plan.md` (`:104`, `:260`), `bkit-design.md` (`:103`, `:256`). Use the block's existing root variable where one exists (`$WT` at `bkit-build.md:336`, `bkit-debug.md:326`). The source line must name its own fix, because a consumer mid-upgrade whose workflows land before `bkit install` fails at **every fold block**, not just counters — and a bare `. missing` returns non-zero but leaves `BKIT_STATUS_FOLD` unset, so the block would carry on with an empty jq program (fail-open, the exact shape this plan exists to delete):

  ```bash
  . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
  ```

  Add the all-runs-scoping comment at each `PRIOR_STRATEGY` site (`bkit-build.md:595`, `:990`; `bkit-debug.md:627`; `bkit-ship.md:727`) — noting at `:654` that the build sub-plan read is all-runs **and** sub-plan-scoped (`--argjson sp "$SUB_PLAN"`), a third scoping variant the "two reads, deliberately opposite" framing does not otherwise name.
  - **Done when:** `grep -rc "FOLD='def lastIdx" .bkit/workflows/` reports 0 for all 5 files; `grep -rl 'BKIT_STATUS_FOLD' .bkit/workflows/ | wc -l` = 5; every source site carries the `|| { … exit 2; }` guard with the `[bkit-telemetry]` prefix (`grep -c 'missing bkit-status-fold.sh' .bkit/workflows/*.md` totals 15); every `PRIOR_STRATEGY` block carries a comment containing `all runs`.

- [x] **T1.3:** Add `.bkit/src/bkit-status-fold.test.ts` — asserts (a) zero `FOLD='def lastIdx` occurrences across `.bkit/workflows/*.md`, (b) the script's extracted blob length and md5 equal the figures **T1.1 measured** (not the inherited ones), (c) every workflow that uses `$BKIT_STATUS_FOLD` also sources `bkit-status-fold.sh`, (d) every source site is fail-closed (carries the `|| { … exit 2; }` guard).
  - **Done when:** `pnpm vitest run .bkit/src/bkit-status-fold.test.ts` passes with >0 tests; deleting the source line from any one workflow reds it (verify by temporary edit, then restore); dropping the `|| exit 2` guard from any one site reds it.
  - **Noted (G5):** dev-history cross-check soft-skips on shallow clone; T2.7 same. Vitest now `console.warn`s on skip; bats `skip` reason surfaces in TAP. Primary length/md5 assertion unaffected.

### WS-2 — Derivation helpers + cross-process tests (additive; primitives untouched)

> **Rule:** no counter crosses `bash -c` boundaries except via `status.jsonl`. Sequential `bash -c` = separate processes (the point); single `bash -c` with state = banned shape in `counter-bus.bats`.
>
> **All bats suites → template-relative** (`BKIT_COUNTER_BUS` / `BKIT_COUNTER_CONFIG` / `BKIT_STATUS_FOLD_SH`, default `.bkit/templates/.bkit/scripts/`). See § Architecture › Tests. Code edits template; install once T8.3. **Do NOT per-edit `bkit install`.** Installed copy exercised T8.3 + Manual Step 6 only.

- [x] **T2.0:** Repoint `tests/counter-bus.bats:15-16` to the template-relative overrides and adopt the same three-variable shape in the two new suites as they are created. **Repoint `.bkit/src/bkit-counter-prose-audit.test.ts`'s `configPath` (`:143`) and `busPath` (`:166`) to the same template-relative defaults** (`BKIT_COUNTER_CONFIG` / `BKIT_COUNTER_BUS` overrides — see § Architecture › Tests). The Vitest suite carries the identical installed-mirror defect and it lands **here**, not at T6.2, because T6.2's Done-when is the one that becomes unreachable without it (the mirror still lacks the new five helpers and still carries the four primitives until T8.3). Doing both here means the whole test corpus — bats and Vitest — resolves the scripts from one root before any suite consumes them.
  - **Done when:** `grep -rn 'BKIT_COUNTER_BUS\|BKIT_STATUS_FOLD_SH' tests/*.bats` shows every suite resolving via `${VAR:-$REPO_ROOT/.bkit/templates/.bkit/scripts/…}`; `grep -rc '\$REPO_ROOT/\.bkit/scripts/' tests/*.bats` = 0; **`grep -c '"\.bkit/scripts/' .bkit/src/bkit-counter-prose-audit.test.ts` = 0** (both script reads now resolve under `.bkit/templates/.bkit/scripts/`, honouring the `BKIT_COUNTER_BUS` / `BKIT_COUNTER_CONFIG` overrides); `npx bats tests/counter-bus.bats` **and** `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` still pass unchanged against the template (it is byte-identical to the installed copy today, so this repoint is behaviour-neutral **now** and correct **later** — verify with `diff .bkit/templates/.bkit/scripts/bkit-counter-bus.sh .bkit/scripts/bkit-counter-bus.sh` empty before the repoint).
- [x] **T2.1:** Add `counter_count` / `counter_next` / `counter_current` to `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh` per § Architecture — **including the three-position contract in the header** (`counter_count` is public; `0` is legal at a prior-step routing site; `counter_current`'s 0-refusal is post-own-write only, § Breaking Changes item 10b). POSIX `sh` only (no bashisms, no process substitution). Do NOT touch `counter_init`/`inc`/`get`/`reset` yet; do NOT harden `decide_next` yet.
  - **Done when:** `sh -c '. ./.bkit/templates/.bkit/scripts/bkit-status-fold.sh; . ./.bkit/templates/.bkit/scripts/bkit-counter-bus.sh; type counter_count counter_next counter_current'` exits 0 under `sh`, `bash`, `dash` and `zsh`; `counter_count /nonexistent build x; echo $?` prints `2` and no stdout; `counter_count` over a log with zero matching rows prints `0` and exits **0** (a valid answer, not an error); `counter_current` over the same log returns 2; the header documents all three positions and names `bkit-build.md:781-787` + `bkit-debug.md:443` as position-3 sites.
  - **Amended (build-plan-gaps-remediate-1-1, G6):** header + `tests/counter-failclosed.bats:160` (T2.9) now line-ref `bkit-build.md:786-787` (was description-only). Trivial — sub-plan 2 WS-3 may shift ref.
- [x] **T2.2:** `tests/counter-derive.bats` — per-attempt row counting across separate processes. Fixture: a tmp dir with `status.jsonl` seeded with one `workflow-started` row. Three sequential `bash -c` invocations, each derive→write→derive, distinct `parentSha` per attempt.
  - **Done when:** the suite asserts `counter_next` prints 1, 2, 3 on successive iterations **and** that the post-write `counter_current` equals the pre-write `counter_next` for the same iteration; `npx bats tests/counter-derive.bats` passes; no test carries a counter value between `bash -c` calls.
- [x] **T2.3:** Same file — active-run scoping. Fixture: run A (`workflow-started` + 3 `build-run-tests` DONE rows + `workflow-done`) then run B (`workflow-started`, no step rows).
  - **Done when:** `counter_next` returns `1` (not `4`) for run B; a sibling assertion runs the **shipped** `PRIOR_STRATEGY` jq expression over the same fixture and shows it returns the run-A value — the asymmetry is asserted, not merely commented.
- [x] **T2.4:** Same file — subPlan isolation. Fixture: 3 `build-plan-verify` rows with `subPlan:1`, 0 with `subPlan:2`.
  - **Done when:** `counter_next … --sub-plan 2` prints `1` while `--sub-plan 1` prints `4`.
  - **Reconciled (build-plan-gaps-remediate-1-1, G1):** fixture seeds **3** subPlan-1 rows, asserts **4** (not draft's 2/3). Toward **test** — stronger isolation proof for `counter_next` off-by-one regressions. Done-when substance unchanged.
- [x] **T2.5:** Same file — fold dedup, both directions. Fixture A: two rows identical except `parentSha`. Fixture B: two byte-identical rows.
  - **Done when:** fixture A counts `2` (distinct retries survive) and fixture B counts `1` (byte-identical replays collapse); both assertions are in the suite and both pass.
- [x] **T2.6:** **Corpus audit of the commit-cadence invariant** — in `.bkit/src/bkit-counter-prose-audit.test.ts`, **not** a temp-repo bats test. For every counted step (the steps the derive sites count), assert its row-writing block either (a) commits in-block, or (b) appears on an explicit, commented transitive-exemption list — today exactly `debug-run-tests`, whose `parentSha` advances via Steps 4/5/6 (`bkit-debug.md:576`/`:649`/`:710`) because **KN-26 deliberately removed its commit**. A counted step that neither commits nor is listed reds. **The draft's version of this task was vacuous:** "assert `git commit --allow-empty` advances HEAD in a real temp repo" tests a property of **git** — it cannot fail, and it cannot detect the one real gap in the corpus. That is the Defect-4 shape (evidence asserting the mechanism that was built rather than the behaviour required) which § Breaking Changes item 6 indicts.
  - **Done when:** the test enumerates counted steps from the derive call sites (not a hardcoded list) and passes; the transitive-exemption list contains `debug-run-tests` with a comment citing KN-26; **removing `debug-run-tests` from the exemption list reds the suite** (proving the audit actually inspects commit presence, verify by temporary edit then restore); adding a fake counted step with no commit and no exemption reds it.

  > [!NOTE]
  > **Sequencing:** T2.6 enumerates from derive call sites — none until plan-2 WS-3. Land rule + exemption list here; against today's corpus = empty set (vacuous pass). **Red-proofs** (remove `debug-run-tests` exemption; add fake uncommitted step) prove non-vacuity — run here; **re-run full Done-when at Gate 2b** ([`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)) once derive sites exist. Do not hardcode list for something to chew on.
  - **Added (G2) — non-vacuity guard** (same shape as T5.2 `expect(constants.length).toBeGreaterThan(0)`). Mismatch between loose presence regex and strict `DERIVE_CALL_PATTERN` → fail loudly. Today both zero (WS-3 pending); RED-PROOF on synthetic quoted-arg call. Gate 2b should still re-run T2.6 regardless.

- [x] **T2.7:** `tests/counter-failclosed.bats`, resolving the bus template-relative per T2.0. Cases: unset / empty / `abc` / `1.5` value → exit 2, **empty stdout**; unset/empty MAX → exit 2; over-cap → `failure-path` + exit 1; at-cap → continue + exit 0. Then capture the RED-vs-`dev` proof: `git show dev:.bkit/scripts/bkit-counter-bus.sh > "$TMP/dev-bus.sh"` → `BKIT_COUNTER_BUS="$TMP/dev-bus.sh" npx bats tests/counter-failclosed.bats`.
  - **Done when:** the RED run's output is saved to `docs/plans/202607/logs/58-workflow-counters/red-vs-dev.txt`; the failure is recorded **by reason, not merely by non-zero exit** — `dev` prints `step-14` on **stdout** and exits **0** (the fail-open) where the suite demands empty stdout + exit 2. A RED that reads `command not found` is **not** the proof and means the template-relative wiring (T2.0) is wrong. The suite also fails against the current tree for the same _reason_ (T3.8 has not hardened it yet). Both facts recorded.
  - **Amended (G3):** capture → per-run `$TMPD/red-vs-dev.txt`, diff tracked file (ignore timestamp/stderr lines) — suite no longer dirties working tree every CI run (`ci.yml:500-502`). Tracked file committed once by hand.
- [x] **T2.9:** `tests/counter-failclosed.bats` — **count-0 is legal, and `MAX=0` is a valid max** (§ Breaking Changes item 10b). Cases: `counter_count` over a log with zero rows for the target step → prints `0`, exit **0**; `decide_next X 0 0 step-11 failure-path` (the `THRESHOLD=$((MAX_CHALLENGE_REMEDIATE_ATTEMPT - 1))` = 0 case, the corpus's only live zero-threshold) → **continue** branch, exit 0; `decide_next X 1 0 …` → `failure-path`, exit 1. Assert the hardened guard's `case … in ''|*[!0-9]*)` accepts `0` as a non-negative integer rather than rejecting it as falsy — the obvious place for a "reject empty-or-zero" reflex to creep in.
  - **Done when:** all three cases pass; a deliberate `[ -z "$MAX" ] || [ "$MAX" -eq 0 ]`-style rejection introduced into the guard reds the suite (verify by temporary edit, then restore); the suite comments name the two live position-3 sites (`bkit-build.md:781-787`, `bkit-debug.md:443`).

  > [!NOTE]
  > **Sequencing:** T2.9 `decide_next` cases need hardened guard (T3.8, plan-2). Author here; `counter_count` count-0 passes now; `decide_next` cases RED like T2.7 until T3.8. Falsy-rejection red-proof runnable against T2.1 helpers. **Do not harden here** — KN-26 inversion.

- [x] **T2.10:** `tests/counter-derive.bats` — **run-boundary interleave characterisation** (§ Edge Cases). Fixture: `build` `workflow-started` + 2 `build-run-tests` rows, no `workflow-done`; then a complete `debug` run (`workflow-started` … `workflow-done`); then resume `build`. Run `bkit-build.md:338`'s **shipped** `(.[-1] // {})` condition over the fixture and assert what it actually does — whether it appends a fresh `workflow-started` (budget resets to 1) or not (derives 3).
  - **Done when:** the assertion pins **today's real behaviour** (characterisation, not aspiration) and its comment states the consequence either way; if the interleave **does** reset the budget, that fact is recorded in the deferral row `58-status-jsonl-run-boundary-keys-on-last-run-overall` rather than fixed here (run-boundary semantics are #209's substrate, out of scope). The derivation's dependence on `:338` is visible in a test rather than latent.
- [x] **T2.8:** `tests/counter-derive.bats` — SOAK marker. Fixture: 2 `debug-failure-soak` rows, a `workflow-meta` row carrying `soakEntryAt`, then 1 more soak row.
  - **Done when:** `counter_next … --since soakEntryAt` prints `2` (only the post-marker row counts) while the same call without `--since` prints `4`; a marker-absent fixture prints the all-rows count; a same-second double-marker fixture folds to one marker.

### WS-5 (partial) — the no-dead-constant rule

> T5.1 / T5.3 / T5.4 are **NOT here** — they travel with WS-3 in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md), because each must be RED before the conversion and green after, and separating a rule from the conversion it polices leaves both halves unverifiable. **T5.2 alone lands here:** it polices the config, not the conversion, and has no RED-first coupling to WS-3.

- [x] **T5.2:** Add the no-dead-constant rule: parse every `MAX_\w+=` from `bkit-counter-bus-config.sh` and assert each name appears >=1 time **inside a fenced block** across `.bkit/workflows/*.md`. Replaces the hardcoded `EXPECTED_CONSTANTS` list (`:144-151`), which lists **6 of 7** — omitting exactly `MAX_CHALLENGE_REMEDIATE_ATTEMPT`, the dead one. The hand-list's blind spot and the defect are the same shape.
  - **Done when:** the test enumerates all 7 constants dynamically (no hardcoded list) and passes; deleting the `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reference added in T3.3 reds it; no hardcoded constant list remains in the file.

  > [!IMPORTANT]
  > **Cross-sub-plan Done-when:** delete-reference red-proof waits for T3.3 (plan-2). Until then `MAX_CHALLENGE_REMEDIATE_ATTEMPT` dead → expected RED. Tick dynamic-enum + no-hardcoded-list; **re-run full Done-when at Gate 2b**. T3.3 requires >=1 fenced hit — cannot skip. **Do NOT hardcode/exempt to force green.**

### 🔒 Gate 2a: Derivation Available, Guard Not Yet Hardened

> Draft Gate 2a was **unpassable** (installed copy missing until T8.3 → `command not found`) and **misplaced** (between WS-2/WS-3, blocks T3.1 only). Now achievable here; seam enforced by **Gate 2b before T3.8** ([`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)).
>
> **Exit criterion for this sub-plan.** Plan-2 must not start until every box `[x]`.

- [x] **Gate 2a - Verified:** T1.1–T2.10 `[x]`. Template-relative (T2.0). `npx bats tests/*.bats` = 68 tests. `counter-failclosed.bats` RED **documented reason** on 7/14 — empty stdout + bats assertion failure, never `command not found`; `red-vs-dev.txt` proves same vs `dev` (unset → stdout `step-14`, exit 0). Other suites green; T5.2 `MAX_CHALLENGE_REMEDIATE_ATTEMPT` RED separate/expected.
- [x] **No push in RED window: NO-PUSH.** No `git push` this session — RED window never reached CI. No skip-tag. Carry to Handoff + plan-2.

> [!CAUTION]
> **RED window spans sub-plan boundary** — Gate 2a here → plan-2 T3.8. Record option in handoff; plan-2 inherits (skip-tag removed by T3.8, or honour no-push).
>
> **Split does NOT license PR here.** KN-26 pair lands whole in plan-2. One PR, one squash, all three sub-plans (§ Merge Method).

### Handoff to [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md)

Record before ending this session:

- [x] **T1.1's measured figures** — **1078 bytes**, md5 **`ed1c4a236d35499f39033206d5b75480`** (byte-identical all 15 sites). Issue's `1079` / `d04a2499…` unreconcilable (value, assignment token 1085/`26b814ea…`, whole line 1091). Plan-2/3 use **measured** figures only.
- [x] **RED-window option** — **NO-PUSH.** No skip-tag for plan-2 T3.8 to remove.
- [x] **Documented REDs** (do NOT "fix" early):
  - **T2.7 (7/14 RED):** unhardened `decide_next`/`check_max` — unset/empty/non-integer → continue/fail-open (`step-14`, exit 0). Hardening = T3.8 plan-2 (KN-26).
  - **T2.9 (4/4 GREEN — honest):** valid integers; fail-open = empty/non-integer only. Deviation from sequencing-note framing; no invented RED.
  - **T5.2 (1/38 RED — `MAX_CHALLENGE_REMEDIATE_ATTEMPT`):** zero fenced refs until T3.3. Expected; do not hardcode out of sequence.
- [x] **`red-vs-dev.txt`** at `docs/plans/202607/logs/58-workflow-counters/red-vs-dev.txt` — evidence. dev: unset → stdout `step-14`, exit 0. G3 fix: suite writes `$TMPD`, diffs tracked file — cannot regenerate.
- [x] **T2.6 re-run at Gate 2b** — vacuous until WS-3 derive sites; G2 non-vacuity guard also self-enforces pattern mismatch.

## Verification Plan _(this sub-plan)_

### Automated Tests

- [x] **Type Check & Lint:** `pnpm typecheck` + `pnpm format:check` + `pnpm lint:slop` (10 baseline, unchanged) + `pnpm lint:prose` (0 errors; 1 pre-existing warning `docs/architecture.md:156`, untouched).
- [x] **Slop delta:** `pnpm slop:delta` — fixed `defensive.error-obscuring` at `bkit-status-fold.test.ts:79` (`try/catch` → `spawnSync` + status check). Net 0.
- [x] **No stale installed copy:** `grep -rc '\$REPO_ROOT/\.bkit/scripts/' tests/*.bats` = 0 (4 suites, template-relative T2.0). No `bkit install` this sub-plan.
- [x] **Build Configuration:** No new mocks/configs; no `tsconfig.json` change.
- [x] **Shell suites:** `npx bats tests/*.bats` — 68 tests, 7 RED (`counter-failclosed.bats`, T2.7 documented reason). CI auto-gated; no wiring added.
- [x] **Vitest:** `pnpm test` — 2233 passed, 1 expected RED (T5.2), 2 skipped, 1 todo. Coverage branch 67.19% (≥65%). Fixed `bkit-ci-dispatch-gate-alignment.test.ts` `extractFoldJq` → read `BKIT_STATUS_FOLD` from template (G4: `__dirname`-anchored `REPO_ROOT`).
- [x] **Portability:** T2.1 `type counter_*` under `sh`/`bash`/`dash`/`zsh`. Full four-shell `counter-failclosed.bats` re-run → plan-3 Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** Never hot-fix errors via guard hardening (KN-26), default derivation to `0`, hardcode constant list (T5.2), or `bkit install` for paths. Halt if stuck.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database. | — |
| **Code** | `git revert {SQUASH_SHA}` then `pnpm bkit install` to regenerate mirrors + `.bkit/version` hashes. | Single squash commit spanning all three sub-plans; revert restores the prose counters and the fail-open guard together (the KN-26 pair inverts cleanly). **This sub-plan is not independently revertible because it is not independently merged.** |
| **Data** | None. `soakEntryAt` rows already in a `status.jsonl` are ignored by the reverted code; `counter` rows already emitted with `shell-bus` stay valid (documented enum member). Both are additive and forward-compatible. | No log migration either way. |
| **Risk window** | None — no deploy, no migration. A consumer only picks the change up on their next `bkit install` / version bump. | |

_Code-only — `git revert` sufficient._
