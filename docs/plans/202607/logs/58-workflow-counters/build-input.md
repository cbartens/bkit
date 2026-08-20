# Build Input — 58-workflow-counters

## Session Prompt

```
/bkit-build issue 58
```

### Gate 1 sign-off (2026-07-16)

Plan gated on two human checkboxes (`58-workflow-counters-plan-1.md`); orchestrator surfaced decisions to owner:

1. **Narrowed prose** (Breaking Changes item 5) — CONFIRMED: "ok". Bare `X_ATTEMPT` banned; `{X_ATTEMPT}`/`MAX_*` exempt; `${X_ATTEMPT}` not.
2. **Narrative** — REJECTED/REPLACED. Verbatim: _"we're replacing existing in context counters with status.jsonl based counter no? that's what the acceptance should describe, no business rule changes just where counts come from, more deterministic more reliable not based on context memory"_. Framing = provenance (not loop-termination). Item 11 RESOLVED.
3. **Breaking changes** — CONFIRMED conditionally: _"ok if it makes the counters and their business rules more reliable"_. Out of scope: item 10b, item 10c.

## Issue #58 — Workflow counters status.json shell

State: open · Labels: enhancement, bkit:build · Milestone: Workflow Optimisation
URL: https://github.com/cbartens/bkit/issues/58

---

## Issue Description (verbatim)

<!-- linear-import: BAR-147 -->

**Linear:** [BAR-147](https://linear.app/bartens/issue/BAR-147) · **Created:** 2026-05-08 · **Linear assignee:** christian@bartens.biz

---

> [!IMPORTANT]
> **Body rewritten 2026-07-15 to match the agreed design.** Problem and Goal are the originals and were correct. The original **Sketch** — a `counters` object stored in `status.json`, helpers at `.agents/lib/workflow-counters.sh` — is **SUPERSEDED**. It was written against the old `status.json` array, before #209 turned the log into an append-only NDJSON event stream with a fold. The agreed design is **derivation**: `docs/decisions.jsonl` → key `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`. Verified evidence and traps: [findings comment](https://github.com/cbartens/bkit/issues/58#issuecomment-4976574155). The original body is preserved verbatim as an archive comment on #234.

## Problem

Orchestrators (`bkit-build`, `bkit-debug`, `bkit-ship`) track retry counters (`VERIFY_ATTEMPT`, `TEST_ATTEMPT`, `CHALLENGE_REMEDIATE_ATTEMPT`, `DEBUG_ATTEMPT`, `NORMAL_ATTEMPT`, `SOAK_ATTEMPT`, `MERGE_ATTEMPT`) as NL instructions the LLM executes — `Init counters: TEST_ATTEMPT = 0` (`bkit-build.md:316`), `Increment TEST_ATTEMPT + 1` (`bkit-build.md:909`).

Unreliable: LLMs miscount, lose track across long contexts, miscompare integers. Failures silent — workflow proceeds past `MAX_*` until artifacts pile up.

**bkit telemetry records this:**

```
$ jq -r 'select(.kind=="counter") | .counterSource' stats.jsonl | sort | uniq -c
  10 model-self-report
   0 shell-bus
```

`counterSource` (`bkit-telemetry.ts:239`, enum enforced at `:477`) is provenance. Every live counter row = model self-report; zero shell-sourced.

## Goal

Move numeric counter tracking and threshold comparison out of orchestrator context → deterministic read of `status.jsonl`. Keep narrative branches (`PASS` / `FAIL` / `CONCERNS`, `STANDARD` / `PIVOT` / `FINAL`) in orchestrator — those need judgment.

## What shipped (WS3), and what did not

<!-- prettier-ignore -->
| Original acceptance criterion | Status |
| --- | --- |
| All `MAX_*` constants in one config file | 🟡 `bkit-counter-bus-config.sh` exists — but see constraint 6 |
| Threshold comparison out of prose, into shell | 🟡 6 of 7 counters; `CHALLENGE_REMEDIATE_ATTEMPT` never converted |
| Counters stored in status and read from it | ❌ never shipped |
| No `*_ATTEMPT` referenced in prose outside fenced shell | ❌ still prose |
| Exceeding `MAX_*` cannot silently continue | ❌ `decide_next` fails **open** |

`counter_init` / `counter_inc` / `counter_get` called from **zero** workflow sites.

## Design — derive, do not store

**Contract:** `attempt(step) = count(step-done rows for that step, status DONE, in the ACTIVE run of that workflow) + 1`, evaluated at step START — the number artifact filenames embed and the row records. Once the step appends its row, that same count **is** the attempt → post-write routing re-derives the identical value with no field read and no carried state.

- **Scope to the active run** (`fold | map(select(.workflow==$w)) | last | .steps`). `VERIFY_ATTEMPT` additionally filters on `subPlan`.
- **Every fenced block re-derives.** Shell state does not survive between orchestrator Bash calls → counter never carried — only re-read. `BKIT_COUNTER_*` primitives inert; re-derivation makes that class of bug structurally impossible.
- **`attempt` on the row = telemetry-only** (feeds #234 counter rows). Routing counts rows → missing/wrong `attempt` cannot corrupt control flow.
- **No counter originates in prose.** Remove `Init counters:` and `Increment X + 1`.
- **`decide_next` / `check_max` fail closed** — reject empty / non-integer (exit 2, print nothing), route any non-0/1 exit to Failure Path, drop `2>/dev/null`.

Why derivation vs stored-`counters` sketch: stored counter drifts from rows → needed policing invariant. Counting rows = invariant true by construction. `PRIOR_STRATEGY` (`bkit-build.md:988`) already folds-and-reads same log for `strategy`; data was always in the log, only the read was missing.

## Constraints (load-bearing — all verified, see findings comment)

1. **Fail-closed cannot ship alone.** Unset counter routes to _continue_ today. Hardening `decide_next` without derivation → **never-retries**. Both halves land in same change (KN-26 "two complementary defences land together").
2. **Do NOT copy `PRIOR_STRATEGY`'s scoping.** Read (`[.[] | .steps[] | ...] | last`) spans **all** runs — correct for strategy, wrong for attempts (resumed run inherits spent budget; DE-25 starvation fix for SOAK). Two reads, deliberately opposite scoping — comment both sites.
3. **Row-counting depends on `parentSha` advancing per attempt.** Fold dedups on `"S {workflow} {step} {parentSha} {at}"`; retries survive via each attempt's `--allow-empty` commit moving HEAD. Drop per-attempt commit → attempts silently collapse. Test both directions.
4. **`SOAK_ATTEMPT` needs more than row-counting.** Resets on every SOAK entry → counts rows _since last SOAK-entry marker event_. Precedent: `debugAttempt` `workflow-meta` event.
5. **Delete inert primitives last.** `bkit-debug.md:432` still calls `counter_reset`; `counter_init` / `inc` / `get` / `reset` and `BKIT_COUNTER_*` out only once every site converted.
6. **`CHALLENGE_REMEDIATE_ATTEMPT` is not shell-gated at all.** `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` in `bkit-counter-bus-config.sh`, referenced **nowhere** — real gate = prose comparison against literal `1` (`bkit-build.md:780-783`, `804`). Prose audit regex matches `ATTEMPT … MAX_` only → misses this. Violated both directions: literal duplicated in prose, constant dead.

## Call sites (7)

<!-- prettier-ignore -->
| Counter | Site | Today |
| --- | --- | --- |
| `VERIFY_ATTEMPT` | `bkit-build.md:563` | `decide_next` |
| `TEST_ATTEMPT` | `bkit-build.md:960` | `decide_next` |
| `CHALLENGE_REMEDIATE_ATTEMPT` | `bkit-build.md:780-783`, `804` | **prose vs literal `1`** |
| `DEBUG_ATTEMPT` | `bkit-debug.md:194` | `decide_next` |
| `NORMAL_ATTEMPT` | `bkit-debug.md:424` | `decide_next` |
| `SOAK_ATTEMPT` | `bkit-debug.md:432`, `440` | `counter_reset` + `check_max` |
| `MERGE_ATTEMPT` | `bkit-ship.md:586` | `decide_next` |

Adjacent: `FOLD` blob byte-identical across all three workflows (md5 `d04a2499ad1900d9757b00774dd87866`, 1079 bytes) — three hand-synced copies. Single-source from counter-bus → derivation and workflows agree by construction.

## Out of scope

- Verdict semantics, strategy selection, sub-plan iteration logic.
- Renaming/restructuring step IDs; artifact file formats.
- `counterSource` enum question (`"derived"` vs `"shell-bus"`) — #234 owns schema.
- `TEST_VERDICT` / `TEST_SCOPE` pass via `--arg`, accept empty silently (unlike counters' `--argjson` hard-stop). Model judgments — keep verdict interpretation in orchestrator.

## Acceptance

- No `*_ATTEMPT` in orchestrator markdown except inside fenced shell — **including assignment and increment**, not only comparisons. Widen prose audit (`bkit-counter-prose-audit.test.ts`).
- No counter originates in orchestrator context — every one read from `status.jsonl` at point of use.
- All `MAX_*` from `bkit-counter-bus-config.sh`; no literal duplicated in prose (closes constraint 6).
- Exceeding `MAX_*` cannot silently continue; unusable counter cannot silently continue. Both → Failure Path.
- Resume re-derives every counter: no restored state, no fresh budget.
- Integration tests across **separate processes** (not one `bash -c`): over-cap → `failure-path`; unset/empty → refused; per-attempt row counting; active-run scoping; subPlan isolation; fold dedup both directions. `tests/counter-bus.bats` exercises helpers in single `bash -c` — green is not evidence.
- Every emitted counter row claims non-`model-self-report` provenance.

---

## Issue Comments (verbatim)

### Comment by cbartens — 2026-06-06T06:59:33Z

Closing as duplicate of #234 (consolidates #232, #183, #233). Full body preserved as archive comment on #234.

---

### Comment by cbartens — 2026-07-15T01:40:49Z

## Reopened — the correctness half never shipped, and the guard is fail-open today

Closed 2026-06-06 as duplicate of #234. Reopening: #234 absorbed **measurement** slice, not **control-flow correctness**. Counters branch retry loops — stats harvest does not make them authoritative at branch point.

Verified against `dev` @ 5478fa08.

### What shipped vs. what this issue asked for

<!-- prettier-ignore -->
| Acceptance criterion (original body) | Status |
| --- | --- |
| All `MAX_*` constants live in one config file | ✅ `.bkit/scripts/bkit-counter-bus-config.sh` |
| Threshold comparison moved out of prose into shell | ✅ `decide_next` / `check_max` |
| **Counters stored in status + read from it; orchestrator no longer tracks "this is attempt N"** | ❌ never shipped |
| **No `*_ATTEMPT` variable referenced in orchestrator markdown except inside fenced shell blocks** | ❌ still prose |
| **A workflow that exceeds `MAX_*` cannot silently continue** | ❌ **regressed — it now silently continues** |

Helper `.bkit/scripts/bkit-counter-bus.sh` written with full contract (`counter_init` / `counter_inc` / `counter_get` / `counter_reset`), but **`counter_init`, `counter_inc` and `counter_get` called from zero workflow sites.** Only call sites:

- `.bkit/workflows/bkit-debug.md:432` — `counter_reset SOAK_ATTEMPT`
- `.bkit/workflows/bkit-debug.md:440` — `check_max SOAK_ATTEMPT ...`
- 5 × `decide_next` (build:563, build:960, debug:194, debug:424, ship:586)

Counter storage stayed in orchestrator prose. `.bkit/workflows/bkit-build.md:316` — ``Init counters: `VERIFY_ATTEMPT` = 0, `TEST_ATTEMPT` = 0, `CHALLENGE_REMEDIATE_ATTEMPT` = 0``; `bkit-build.md:909` — ``Increment `TEST_ATTEMPT` + 1``.

### Defect 1 — `decide_next` fails **open**: the cap never fires (critical)

Every call site passes shell variable **never assigned in that block**:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
. "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
. "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
decide_next TEST_ATTEMPT "$TEST_ATTEMPT" "$MAX_TEST_ATTEMPT" step-14 failure-path 2>/dev/null
```

`$MAX_TEST_ATTEMPT` from config. `$TEST_ATTEMPT` from nowhere. Counter-bus stores `BKIT_COUNTER_*`; shell state does not persist between Bash calls → block only works if model substitutes remembered literal.

Unset → `$TEST_ATTEMPT` empty → `[ "" -gt 3 ]` non-zero → **indistinguishable from "condition false"** → continue branch. Reproduced all four shells:

```
=== bash ===
  unset counter    -> stdout=step-14      exit=0   # retry, cap ignored
  TEST_ATTEMPT=99  -> stdout=failure-path exit=1
=== zsh ===  / === dash === / === sh ===   (identical)
```

Unset counter routes to **retry, forever**. `2>/dev/null` suppresses `[: : integer expression expected`.

Verbatim reproduction of filed failure: _"Failures are silent — the workflow proceeds past `MAX_*` without anyone noticing until artifacts pile up."_

### Defect 2 — helper writes and call sites use different variable names

`counter_init` / `counter_inc` / `counter_reset` write `BKIT_COUNTER_{NAME}`. Call sites read `${NAME}`. Never meet:

```
counter_reset SOAK_ATTEMPT
BKIT_COUNTER_SOAK_ATTEMPT='0'   <- what the helper wrote
SOAK_ATTEMPT=''                 <- what bkit-debug.md:440 then reads
```

SOAK budget reset inert; `check_max` reads empty → same fail-open as Defect 1.

### Defect 3 — resume silently restores a fresh retry budget

**Resume** contract (`bkit-build.md:24`): fold status.jsonl — pick up after last `DONE` step in active `IN_PROGRESS` workflow. Restores no counters. `attempt` written on every `status.jsonl` row but never read back — only `strategy` round-trips via `PRIOR_STRATEGY` (`bkit-build.md:988`). Resumed run re-enters retry loop with budget silently reset. Data already in log; only read missing.

### Defect 4 — the tests encode the narrowed criterion as the expectation

- `tests/counter-bus.bats` — helpers in single `bash -c`; workflows use separate processes. Unit green; integration never tested.
- `.bkit/src/bkit-counter-prose-audit.test.ts` — regex `/\bATTEMPT\b.*(?:<=|>=|<|>)\s*(?:`?)MAX_|MAX_\w+\s*(?:<=|>=|<|>)\s*\d/` comparisons only. Cannot match ``Init counters:`VERIFY_ATTEMPT`= 0`` or ``Increment`TEST_ATTEMPT`+ 1``. Criterion narrowed to "no _comparisons_ in prose".

Same class as `feedback_validate_shipped_config_with_real_tool` / #179 / #195.

### What must be true to close this

1. Counters read from `status.jsonl` at branch point. Fold log, derive attempt. No counter from orchestrator context.
2. **`decide_next` fails closed.** Reject empty/non-integer (`case $_val in ''|*[!0-9]*) return 2`); route non-0/1 exit to Failure Path. Drop `2>/dev/null`.
3. Reconcile helper contract with call sites — `counter_get` or delete unused `BKIT_COUNTER_*` primitives.
4. Resume restores counters from folded log.
5. Remove `Init counters:` / `Increment X + 1`; widen prose audit for any `*_ATTEMPT` outside fenced block.
6. Integration test across separate processes: over-cap → `failure-path`; unset/empty → NOT continue. Both must fail against today's `dev`.

---

### Comment by cbartens — 2026-07-15T02:48:13Z

## Correction to the comment above — Defect 1's severity was overstated

Fail-open in `decide_next` is real but **reachability narrower** than implied.

**What I missed:** retry steps write status row _before_ routing; write passes counter via `jq --argjson`, hard-fails on empty:

```
$ jq -nc --argjson a "$TEST_ATTEMPT" '{attempt:$a}'      # TEST_ATTEMPT unset
jq: invalid JSON text passed to --argjson
exit=2
```

Guards **20 call sites** (`VERIFY_ATTEMPT` ×2, `CHALLENGE_REMEDIATE_ATTEMPT` ×3, `TEST_ATTEMPT` ×3, `CI_ATTEMPTS` ×3, `NORMAL_ATTEMPT` ×5, `DEBUG_ATTEMPT`, `MERGE_ATTEMPT` ×3). Unset counter kills step at write → Failures rule → loud abort.

**Live picture:** "mostly works, or fails loudly" — not "silently overruns".

**What survives:**

1. **Fail-open = real trap, narrow.** Needs _inconsistent_ substitution — literal in `--argjson`, `$VAR` bare in `decide_next`. Plausible LLM failure → silent overrun. `2>/dev/null` hides diagnostic.
2. **Core complaint untouched.** Counter reaching shell = number model remembered. `decide_next` launders model-supplied number. Wrong integer still valid JSON → `--argjson` won't catch miscount. **Model-authored counters = actual defect.**
3. **Defects 2, 3 and 4 unaffected.**

Net: Defect 1 downgraded "critical, live" → "latent trap"; priority rests on point 2.

---

### Comment by cbartens — 2026-07-15T03:13:46Z

## Decision: counters are **derived** from `status.jsonl`, not stored — and bkit's own telemetry has been recording this defect all along

Recorded in `docs/decisions.jsonl` → key `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored` (status ACTIVE; validated against shipped codec).

### The evidence that settles it

`.bkit/jsonl.md`: `counterSource: "model-self-report" | "shell-bus"` — enforced at `bkit-telemetry.ts:477`. Every live row:

```
$ jq -r 'select(.kind=="counter") | .counterSource' stats.jsonl | sort | uniq -c
  10 model-self-report
   0 shell-bus
```

All self-reported, none shell-sourced. Telemetry anticipated the problem.

### The decision

**Derive, don't store.** Same contract as Design section. Supersedes original `counters` object sketch. `attempt` field → telemetry-only.

`PRIOR_STRATEGY` (`bkit-build.md:988`) already fold-and-reads for `strategy`. `status.jsonl` shape arrived at #209 after #58 filed.

### Sequencing constraint (load-bearing)

**Fail-closed cannot ship alone.** KN-26 "two complementary defences land together — cannot be split".

### Rollout notes

- Every fenced block **re-derives**. Shell state does not persist — root cause of Defect 2.
- `SOAK_ATTEMPT`: counts since last SOAK-entry marker (`debugAttempt` `workflow-meta` event).
- Delete inert primitives deferred — `bkit-debug.md:432` still calls `counter_reset`.

Spiking `TEST_ATTEMPT` (build Step 13) end-to-end with cross-process integration test that must fail against today's `dev`.

---

### Comment by cbartens — 2026-07-15T03:28:41Z

## Spike findings — derivation verified end-to-end, then reverted (no code change on `dev`)

Prototyped derived-counter on `TEST_ATTEMPT` (build Step 13), **reverted in full** — workflows, `bkit-counter-bus.sh`, `tests/counter-bus.bats` byte-identical to HEAD.

### 1. The contract works, and resume falls out for free

Separate-process simulation:

```
iteration 1: derive -> 1 | write row | route -> step-14  (retry)
iteration 2: derive -> 2 | write row | route -> step-14  (retry)
iteration 3: derive -> 3 | write row | route -> step-14  (retry)
iteration 4: derive -> 4 | write row | route -> failure-path (exit 1)
             [bkit-telemetry] counter TEST_ATTEMPT exceeded max=3 (value=4)
```

Two-position semantics with one helper. Defect 3 needs no separate fix.

### 2. `PRIOR_STRATEGY` and attempt counters need OPPOSITE run-scoping — do not copy its shape

```jq
[.[] | .steps[] | select(.step==$s and .status=="DONE")] | last.strategy   # .[] = ALL runs
```

Completed run with `PIVOT` + fresh second run → shipped read returns `PIVOT`; active-run-scoped returns empty. Correct for strategy; **wrong for attempts** (DE-25 starvation). Derivation scopes to active run; `PRIOR_STRATEGY` deliberately does not.

### 3. Row-counting safe only because `parentSha` moves — load-bearing

Fold dedups on `"S {workflow} {step} {parentSha} {at}"`. Each attempt's `--allow-empty` commit advances HEAD. Drop commit → silent under-count. Test both directions.

### 4. The fold is byte-identical across all three workflows

1079-byte `FOLD` blob (md5 `d04a2499ad1900d9757b00774dd87866`) inlined 3×. Single-source from counter-bus worth doing regardless.

### 5. Cost, for scoping

One call site ~120 lines shell + ~25 workflow + ~220 tests. Five sites mostly mechanical except `SOAK_ATTEMPT`. `shellcheck -s sh` needs `disable=SC2016` for embedded fold. bats gated in CI (`ci.yml:500`).

### 6. Adjacent gap, not part of this issue

`TEST_VERDICT` / `TEST_SCOPE` via `--arg` accept empty silently — quieter failure mode, same substitution assumption.

**Status: nothing implemented.** Decision record stands; this comment = evidence.

---

### Comment by cbartens — 2026-07-15T05:45:23Z

## Plan Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
Parent design: None

---

### Comment by cbartens — 2026-07-15T05:48:33Z

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/58-workflow-counters/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/58-workflow-counters/status.jsonl)

---

### Comment by cbartens — 2026-07-15T06:08:59Z

### Step 3 — Generate Plan

[plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/58-workflow-counters/plan-v1-draft.md)

---

### Comment by cbartens — 2026-07-15T06:29:50Z

### Step 4 — Review Plan - Verdict: FAIL - Failures: 11

---

### Comment by cbartens — 2026-07-15T06:46:16Z

### Step 5 — Apply Review - Verdict: CONCERNS

[plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/58-workflow-counters/plan-v2-reviewed.md)

---

### Comment by cbartens — 2026-07-15T06:53:16Z

### Step 6 — Scope Check - Verdict: CONCERNS - Failures: 4

---

### Comment by cbartens — 2026-07-15T07:06:10Z

### Step 7 — Apply Scope - Verdict: PASS

[plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/58-workflow-counters/plan-v3-checked.md)

---

### Comment by cbartens — 2026-07-15T07:08:33Z

### Step 8 — Complexity Check - Verdict: SPLIT

---

### Comment by cbartens — 2026-07-15T07:28:53Z

### Step 9 — Complexity Split - Verdict: PASS

[plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/58-workflow-counters/plan-v4-split.md)

---

### Comment by cbartens — 2026-07-15T07:36:22Z

### Step 10 — Summary - Verdict: CONCERNS

[plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/58-workflow-counters/plan-summary.md)

Verdict: CONCERNS

<!-- verdict:end -->

# Plan Summary — Issue #58: Workflow Attempt Counters

## Overview

**What's planned:** Move retry counters from orchestrator prose to deterministic shell reads of `status.jsonl`. Three sub-plans (15 / 14 / 8 tasks = 37 total). Sub-plan 2 = 14 tasks (justified over 12-task cap) — KN-26 atomic core (derivation + fail-closed). All three sub-plans → ONE PR, squash merge.

**Key gates:**

- Gate 1: Human confirmation narrowed Acceptance Scenario (two checkboxes in sub-plan 1)
- Gate 2a: Derivation helpers available before call-site conversion
- Gate 2b: All 18 `--argjson` sites converted before hardening ships
- Gate 2–4: Code, testing, automated verification; manual verification (8 steps)

**Load-bearing constraints:**

- T3.0–T3.7 (derivation) + T3.8 (fail-closed) ship together in sub-plan 2
- Hardening alone → "never retries" (KN-26 regression)
- WS-6 (delete inert primitives) last, after every site converts
- Cross-run scoping for `DEBUG_ATTEMPT`; active-run for all others

## Plan Quality

**Well-scoped.** Complete design-coverage; clean out-of-scope discipline. Dependencies sequenced: additive sub-plan 1 → atomic sub-plan 2 → cleanup sub-plan 3.

**Split sound.** KN-26 seam respected (Gate 2a after T2.10 before T3.0; sub-plan 2→3 after T3.8). 37 unique tasks; 19-row derived test matrix (11+5+3).

**Critical tensions:**

- Sub-plan 2 exceeds 12-task heuristic by 2 — justified in plan CAUTION
- Two acceptance criteria narrowed (Breaking Changes items 5, 10a) — human sign-off required
- Workflow health: 3 friction rows (MCP search unavailable recurrence 2; subagent Verdict PENDING; API error incomplete verification)

## Completeness

**Scope:** 37 tasks. WS-1 fold single-source; WS-2 helpers alongside inert primitives; WS-3 convert + harden; WS-4 delete prose; WS-5 validate; WS-6 delete primitives; WS-7 telemetry honesty; WS-8 docs + mirrors.

**Testing:** Cross-process integration mandatory (T2.2–T2.10). RED-before proofs (T5.1, T5.3). T5.4 mapping via temporary edits. Manual verification 8 steps.

**Docs:** Sub-plan 3 (T8.2); ledger appends in plan (6 deferrals, 3 total `58-`-keyed decisions of which 2 new).

## Acceptance Scenario

**Narrative (agent-synthesised):** Engineer runs `/bkit-build`; retries bounded by shell count from event log; unusable counter → loud stop.

**Success Criteria (inherited from issue #58, re-worded per Breaking Changes item 5):**

- No bare `*_ATTEMPT` outside fenced blocks (exemptions: `{X_ATTEMPT}`, `MAX_*`)
- Every counter read from `status.jsonl` at point of use — rule-enforced, no bare `$X_ATTEMPT` undervived
- All `MAX_*` from `bkit-counter-bus-config.sh`; no literal in prose
- No legitimate first-attempt route (0 legal) → Failure Path; only post-own-write position may refuse 0
- Over-cap AND unusable counter → Failure Path
- Resume re-derives; no restored state
- Honest non-`model-self-report` provenance

**Concrete example:** Step 13 derives TEST_ATTEMPT=1 → write → re-derive 1 → continue. Attempt 4 → `failure-path` exit 1, telemetry exceeded max=3. Resume: fresh process re-derives 3.

**Edge cases:** Empty/non-integer → `decide_next` return 2 → Failure Path. Unreadable log → `counter_count` return 2. First-attempt 0 at prior-step routing → `counter_count` prints 0 exit 0 → continue.

**Template adherence (items 10–11):** No parent design; Narrative agent-synthesised vs `docs/plans/template.md:46` blocking fallback. Deviation flagged for human confirmation.

## Breaking Changes

1. **WS-3 + WS-5 ship atomically in sub-plan 2, one PR.** KN-26 non-negotiable.
2. **Sub-plan 2 = 14 tasks** (2 over ceiling). Cutting to 12 lands on KN-26 seam.
3. **`DEBUG_ATTEMPT` stays CROSS-run.** Active-run scope starves budget on resume. Fold copied, not moved, at `bkit-debug.md:432`.
4. **Derivation rule self-polices completeness.** T5.3 audit; unconverted site → RED → T4.1 blocked.
5. **"No `*_ATTEMPT` in prose" narrowed.** ~62 lines carry `{PLACEHOLDER}` / `MAX_*` names. Ban bare tokens; exempt placeholders/constants. **Human confirmation required.**
6. **`CHALLENGE_REMEDIATE_ATTEMPT` violation live.** Literal `1` in prose; config constant dead until T3.3.
7. **`BKIT_STATUS_FOLD` single-sourced** in `.bkit/scripts/bkit-status-fold.sh`. Today inlined 15× (md5 `d04a2499…`, 1079 bytes).
8. **No per-edit `bkit install`** until T8.3.
9. **Related-issues MCP search unavailable.** Refs from issue body, not re-confirmed. Recurrence 2; #341 fix path.
10. **Acceptance Narrative agent-synthesised.** (10a = narrowed prose; 10b = narrative deviation.)

## Design Alignment

Issue acceptance → plan tasks: orchestrator-context ban → WS-3 + T5.3; status.jsonl reads → T2.1 + WS-3; prose audit → T5.1 + T4.1; fail-closed → T3.8; resume → T2.2/T2.10; derive-not-store → comments 3–4.

Items 5 and 10 = explicit deviations requiring sign-off.

## Risks

- **T5.4 mapping:** Pins mechanically; mis-map identically in derive + map goes green. Green T5.3 necessary, not sufficient.
- **Unconverted sites:** T5.3 inside fences only; T5.1 outside only. Rule blind spot → silent pass.
- **Workflow health:** MCP unavailable; subagent anomalies. Integration depends on live runs.
- **Execution discipline:** KN-26 seam protected by gates; split mid-sub-plan 2 reproduces regression.

## Action Items

**Before `/bkit-build`:**

1. **Human confirm § Acceptance Scenario.** Two checkboxes gate Gate 1. Narrowed prose criterion + Narrative.
2. **Execution order:** Sub-plans 1 → 2 → 3. Sub-plan 2 one uninterrupted session. ONE squash PR.
3. **Monitor T5.3.** RED after WS-3 → incomplete. Independent grep audit if rule passes suspiciously.
4. **T3.3/T3.6 edge case:** Use `counter_count` not `counter_current` at position-4 sites.
5. **`DEBUG_ATTEMPT` cross-run scope.** Intentional; do not scope to active-run.

## Recommended Next Step

```
/bkit-build 58
Brief: Three-sub-plan feature (15 + 14 + 8 tasks) to move workflow retry counters from orchestrator prose to deterministic status.jsonl reads. KN-26 atomic core: sub-plan 2 (14 tasks, justified over-cap exception) combines derivation + fail-closed hardening in one uninterrupted session, one PR. Requires human sign-off: narrowed acceptance criterion on `*_ATTEMPT` prose references (exempts placeholders & constants) and agent-synthesised Acceptance Narrative. Residual risk: mapping rule pins but does not prove correctness; completeness detected by rule only. Read § Acceptance Scenario and § Breaking Changes items 5–10 first. Ledger: 6 deferrals / 0 deletions, 2 decisions / 0 deletions, byte-identical.
```

## Telemetry Summary

```

> @cbartens/bkit@4.5.0 bkit /Users/christian/Documents/GitHub/bkit/.worktrees/58-workflow-counters
> node dist/bkit-install.js telemetry summary --phase=plan

[bkit-telemetry] rows: 5 | malformed: 0 | versions: 4.1.4=2, 4.5.0=3
[bkit-telemetry] plan: 1 | design→ship chain total: 4 (from 5 rows)
```

---

### Comment by cbartens — 2026-07-15T11:01:37Z

### Step 11 — Close Workflow

Artifacts: `58-workflow-counters-plan-1.md`, `58-workflow-counters-plan-2.md`, `58-workflow-counters-plan-3.md`, `58-workflow-counters-plan.md`, `plan-complexity-check.md`, `plan-input.md`, `plan-review-1.md`, `plan-review-2.md`, `plan-review-3.md`, `plan-scope-check-1.md`, `plan-scope-check-2.md`, `plan-summary.md`, `plan-v1-draft.md` through `plan-v4-split.md` (all under `docs/plans/202607/`).

Merged to `dev` as `16d4192a`. Worktree removed, `feat/58-workflow-counters` deleted, lock released.

**Friction rows:** 3 appended to `.bkit/friction.jsonl` conformed to schema as of `b953237c` (`recovery` dropped) before merge.

---

### Comment by cbartens — 2026-07-16T04:44:39Z

## Build Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

---

## Master Plan — docs/plans/202607/58-workflow-counters-plan.md

Verdict: PASS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket, set at design start = 202607). Logs sit at `docs/plans/202607/logs/58-workflow-counters/` and are delete-eligible. -->

# Workflow Attempt Counters — Derived from `status.jsonl` — Parent Index (split of `plan-v3-checked.md`)

> [!CAUTION]
> **This is an INDEX, not an executable plan. It carries NO tasks, NO gates, NO constraints of its own.**
> Every task, gate and constraint lives in exactly one sub-plan below. Execute the sub-plans, in order. Do not execute from this file.
>
> **Source:** [`plan-v3-checked.md`](plan-v3-checked.md) (37 tasks, 8 workstreams, 740 lines) — partitioned per [`plan-complexity-check.md`](plan-complexity-check.md)'s `SPLIT` verdict.

> [!NOTE]
> **Line references re-verified 2026-07-16 against `dev` @ `67e427b6`.** #99 (`b953237c`…`67e427b6`) rewrote ~600 lines across five workflows; every reference remapped **by content, not offset**; 31/31 load-bearing sites re-confirmed.
>
> **Every measured count unchanged:** 18 `--argjson` sites / 19 counter references (`bkit-build.md` 8, `bkit-debug.md` 7 — `:759` carries two — `bkit-ship.md` 3); 62 placeholder lines (26/26/10); 15 FOLD sites, blob byte-identical. #99 left untouched: `bkit-counter-bus.sh`, config, `bkit-counter-prose-audit.test.ts`, `tests/counter-bus.bats`; per-attempt `--allow-empty` commit cadence (18/10/10); debug "Update status:"-without-commit asymmetry (`:399`); step name set (18/11/14) — **T5.4 `COUNTER_STEP_MAP` keys unaffected**.
>
> Line numbers = convenience index. T3.0 regenerates worklist by rule; hard-stops on count ≠ 18/19.

## Context & Goals

Orchestrators branch retry loops on model-tracked prose counters — `Init counters: TEST_ATTEMPT = 0` (`bkit-build.md:319`), `Increment TEST_ATTEMPT + 1` (`bkit-build.md:914`). `decide_next` launders model-supplied numbers. Telemetry: all 10 `counter` rows = `counterSource: "model-self-report"`, zero `shell-bus`.

Fix (`docs/decisions.jsonl` → `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`): **derivation, not storage**. Re-derive in every fenced block. Shell state does not persist → never carried. Resume free.

**Success Criteria (whole feature):**

- No counter from orchestrator context; re-derive from `status.jsonl` in-block; no bare `*_ATTEMPT` in prose outside fences (`{PLACEHOLDER}` and `MAX_*` only exemptions)
- **Completeness machine-checked:** no fenced block reads bare `$X_ATTEMPT` unless same block derives it (T5.3 — only artifact detecting unconverted sites)
- Over-cap AND unusable counter → Failure Path; `decide_next`/`check_max` fail closed; no `2>/dev/null`
- Cross-process integration tests: over-cap, unset/empty, row counting, active-run scoping, subPlan isolation, SOAK marker reset, fold dedup both directions; fail-closed pair fails against today's `dev`

**Related Issues:**

- `#234` — telemetry master (measurement slice only; not control-flow)
- `#209` — status.jsonl + fold (closed)
- `#232`, `#183`, `#233` — consolidated into #234
- `#341` — MCP/gh fallback (open); related-issues search failure fix path

> [!CAUTION]
> **Related-issues scan NOT performed — missing context, not "nothing related".** `mcp__github__search_issues` returned `total_count: 0` including control `repo:cbartens/bkit telemetry`. Refs from issue body/comments. Recurrence logged to `.bkit/friction.jsonl` (`design-step-3-related-issues-search-silently-empty-on-private-repo`, `recurrenceCount: 2`).

---

## Sub-Plan Index

> Execute **in order**. Each child self-contained.

<!-- prettier-ignore -->
| # | Sub-plan | Tasks | Scope | Ends at | Depends on |
| --- | --- | --- | --- | --- | --- |
| 1 | [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md) | **15** | WS-1 (T1.1–T1.3) + WS-2 (T2.0–T2.10) + T5.2. Single-source fold; add `counter_count`/`counter_next`/`counter_current` **alongside** live primitives; template-relative tests; cross-process suites; no-dead-constant rule. **Purely additive.** | Gate 2a | — |
| 2 | [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) | **14** | T5.1 + T5.3 + WS-3 (T3.0–T3.9) + T5.4. RED-first rules; convert **all 18 `--argjson` / 19 refs**; pin mapping; harden guard. **KN-26 atomic core.** | Gate 2b → T3.8 → T3.9 | Sub-plan 1 Gate 2a |
| 3 | [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md) | **8** | WS-4 (T4.1–T4.2) + WS-6 (T6.1–T6.2) + WS-7 (T7.1) + WS-8 (T8.1–T8.3). Delete prose; delete inert primitives (**last**); honest telemetry; docs + batched `bkit install`. | Gate 2 → Gate 3 → Gate 4 → Manual Verification | Sub-plan 2 Gate 2b + T3.8/T3.9 |

**Task accounting: 15 + 14 + 8 = 37.** Every `Done when` verbatim.

**Gate ownership:** Gate 1 + Gate 2a → sub-plan 1 · Gate 2b → sub-plan 2 · Gate 2/3/4 + Manual (8 steps) → sub-plan 3.

**Derived Test Matrix (19 rows):** 11 → sub-plan 1 · 5 → sub-plan 2 · 3 → sub-plan 3. **11 + 5 + 3 = 19.**

**Human sign-off:** two 👤 sections in [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md) gate Gate 1. Sub-plans 2/3 inherit, no second checkbox.

---

## Where each partition line falls — and proof that none of them is the KN-26 seam

**Seam (KN-26):** fail-closed hardening **cannot ship without derivation in same change**. Hardening alone → "**never retries**". Seam = edge **T3.1–T3.7 → T3.8**.

**Both partition lines at plan's own gates** (Gate 2a, Gate 2b from `plan-v3-checked.md`).

<!-- prettier-ignore -->
| Line | Falls between | Is it the seam? | Proof |
| --- | --- | --- | --- |
| **1 → 2** | T5.2 → T5.1, at **Gate 2a** | **No.** | Pure-addition checkpoint: no call site converted, guard not hardened. Sub-plan 1 contains neither T3.1–T3.7 nor T3.8. |
| **2 → 3** | T3.9 → T4.1, after **Gate 2b + T3.8 + T3.9** | **No.** | Derivation + hardening already shipped from sub-plan 2. Boundary after the pair. |

**Positive proof:** T3.0–T3.9, Gate 2b, T3.8 all in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) — one file, one session, one PR. Gate 2b immediately before T3.8.

### The 12-task cap yields to the seam — deliberately, in sub-plan 2

Sub-plan 2 = **14 tasks, 2 over heuristic.** Cut to 12 → cut on KN-26 seam → KN-26 regression. _"Task order is load-bearing… do not reorder, do not split the PR along that seam."_

### Why T5.1 / T5.3 / T5.4 travel WITH WS-3

- **T5.1/T5.3 RED before conversion, green after.** REDs = worklists (`unconverted-sites.txt`, `prose-violations.txt`).
- **T5.4 not RED-first** — nothing to map pre-WS-3. Runs after T3.7, before Gate 2b.
- **T5.2 in sub-plan 1** — polices config, no WS-3 coupling. Dead `MAX_CHALLENGE_REMEDIATE_ATTEMPT` RED re-verified at Gate 2b.

### Other ordering constraints

- **WS-6 last** (constraint 5) — sub-plan 3, after all sites converted.
- **WS-4 gated on T5.3 green** — deleting prose while blocks unconverted → worse than status quo.
- **T8.3 single batched `bkit install` last.** Sub-plans 1/2 prohibit early install.
- **RED window spans sub-plan boundary:** `counter-failclosed.bats` RED from Gate 2a until T3.8; no-push vs skip-tag choice at Gate 2a.

---

## The split is an execution boundary, NOT a PR boundary

> [!CAUTION]
> **Merge method: always squash. All three sub-plans → ONE PR.** KN-26 pair must not be separable at merge. Do not open PR after sub-plan 1 or 2. `bkit-ship.md` Step 5: `gh pr merge --squash --delete-branch --body ""`.

**Rollback:** `git revert {SQUASH_SHA}` then `pnpm bkit install`. Single squash; revert restores prose counters + fail-open guard together.

## Handoff chain

<!-- prettier-ignore -->
| Artifact | Produced by | Consumed by |
| --- | --- | --- |
| `red-vs-dev.txt` | Sub-plan 1, T2.7 | Sub-plan 2 T3.9; sub-plan 3 Gate 4 / Manual Step 1. **Evidence, never regenerate.** |
| T1.1 `{MEASURED_BYTES}` / `{MEASURED_MD5}` | Sub-plan 1, T1.1 | T1.3. Measured from tree, not inherited from #58's `1079`/`d04a2499…`. |
| RED-window option (no-push vs skip-tag) | Sub-plan 1, Gate 2a | Sub-plan 2 T3.8 |
| Documented REDs (T2.7 fail-open · T2.9 unhardened · T5.2 dead constant) | Sub-plan 1 | Sub-plan 2 — expected; re-verified Gate 2b |
| `unconverted-sites.txt` (18/19) | Sub-plan 2, T3.0 | T3.1–T3.7; Manual Step 4d |
| `prose-violations.txt` | Sub-plan 2, T5.1 | Sub-plan 3 T4.1. Absent → **stop** |
| Gate 2b `[x]` | Sub-plan 2 | Sub-plan 3 T4.1 prerequisite |
| `:335` converted | Sub-plan 2, T3.4 | Sub-plan 3 T7.1 |

## Patterns and doctrine carried into every child

- **Edit SOURCE, never mirror.** `.bkit/templates/.bkit/scripts/*.sh` → `.bkit/scripts/*.sh`; `.bkit/workflows/*.md` → `.claude/` / `.cursor/` / `.opencode/`.
- **Rule = authority; line numbers = index.**
- **Four positions:** `counter_next` at start · `counter_current` after own write · `counter_count` when routing on prior step (**0 legal**) · commit-subject clause only where block already commits.
- **`bkit-debug.md:399` must NOT gain commit** (KN-26) — `debug-run-tests` `parentSha` advances via Steps 4/5/6.
- **`DEBUG_ATTEMPT` CROSS-run; fold copied, not moved.**
- **ASCII operators only** in `.bkit/workflows/*.md` and `.bkit/prompts/*.md`.
- **No Architectural Downgrades:** no re-add `2>/dev/null`; no default failed derivation to `0`; no weaken prose audit; no `counter_current` at position-4.

## Superseded artifacts

- [`plan-v3-checked.md`](plan-v3-checked.md) — 37-task master, retained as source of record. Do not execute directly.
- [`plan-complexity-check.md`](plan-complexity-check.md) — `SPLIT` verdict and 3-way partition.
