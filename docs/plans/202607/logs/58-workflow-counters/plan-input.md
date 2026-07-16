# Plan Input — 58-workflow-counters

## Session Prompt

`/bkit-plan #58`

Plan Feature (Workflow 2/6) for GitHub issue #58 — "Workflow counters status.json shell" (cbartens/bkit).

Parent design: None (standalone — no parent design FID referenced in the issue description).

---

## Issue #58 — Workflow counters status.json shell

- **URL:** https://github.com/cbartens/bkit/issues/58
- **State:** open (reopened)
- **Labels:** enhancement, bkit:plan
- **Milestone:** Workflow Optimisation
- **Created:** 2026-05-21T07:10:54Z
- **Updated:** 2026-07-15T03:36:29Z

### Description (body, verbatim)

**Linear:** [BAR-147](https://linear.app/bartens/issue/BAR-147) · **Created:** 2026-05-08 · **Linear assignee:** christian@bartens.biz

---

> [!IMPORTANT]
> **Body rewritten 2026-07-15 to match the agreed design.** Problem and Goal are the originals and were correct. The original **Sketch** — a `counters` object stored in `status.json`, helpers at `.agents/lib/workflow-counters.sh` — is **SUPERSEDED**. It was written against the old `status.json` array, before #209 turned the log into an append-only NDJSON event stream with a fold. The agreed design is **derivation**: `docs/decisions.jsonl` → key `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`. Verified evidence and traps: [findings comment](https://github.com/cbartens/bkit/issues/58#issuecomment-4976574155). The original body is preserved verbatim as an archive comment on #234.

## Problem

Workflow orchestrators (`bkit-build`, `bkit-debug`, `bkit-ship`) track retry counters (`VERIFY_ATTEMPT`, `TEST_ATTEMPT`, `CHALLENGE_REMEDIATE_ATTEMPT`, `DEBUG_ATTEMPT`, `NORMAL_ATTEMPT`, `SOAK_ATTEMPT`, `MERGE_ATTEMPT`) as natural-language instructions the LLM must execute — `Init counters: TEST_ATTEMPT = 0` (`bkit-build.md:316`), `Increment TEST_ATTEMPT + 1` (`bkit-build.md:909`).

This is unreliable: LLMs miscount, lose track of which attempt they're on across long contexts, and miscompare integers. Failures are silent — the workflow proceeds past `MAX_*` without anyone noticing until artifacts pile up.

**bkit's own telemetry has been recording this the whole time:**

```
$ jq -r 'select(.kind=="counter") | .counterSource' stats.jsonl | sort | uniq -c
  10 model-self-report
   0 shell-bus
```

`counterSource` (`bkit-telemetry.ts:239`, enum enforced at `:477`) is a provenance discriminator. Every live counter row is a model self-report; not one is shell-sourced.

## Goal

Move numeric counter tracking and threshold comparison out of orchestrator context and into a deterministic read of `status.jsonl`. Keep narrative branches (`PASS` / `FAIL` / `CONCERNS`, `STANDARD` / `PIVOT` / `FINAL`) in the orchestrator — those need judgment.

## What shipped (WS3), and what did not

| Original acceptance criterion                           | Status                                                            |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| All `MAX_*` constants in one config file                | 🟡 `bkit-counter-bus-config.sh` exists — but see constraint 6     |
| Threshold comparison out of prose, into shell           | 🟡 6 of 7 counters; `CHALLENGE_REMEDIATE_ATTEMPT` never converted |
| Counters stored in status and read from it              | ❌ never shipped                                                  |
| No `*_ATTEMPT` referenced in prose outside fenced shell | ❌ still prose                                                    |
| Exceeding `MAX_*` cannot silently continue              | ❌ `decide_next` fails **open**                                   |

`counter_init` / `counter_inc` / `counter_get` are called from **zero** workflow sites.

## Design — derive, do not store

**Contract:** `attempt(step) = count(step-done rows for that step, status DONE, in the ACTIVE run of that workflow) + 1`, evaluated at step START — the number artifact filenames embed and the row records. Once the step appends its row, that same count **is** the attempt, so post-write routing re-derives the identical value with no field read and no carried state.

- **Scope to the active run** (`fold | map(select(.workflow==$w)) | last | .steps`). `VERIFY_ATTEMPT` additionally filters on `subPlan`.
- **Every fenced block re-derives.** Shell state does not survive between orchestrator Bash calls, so a counter is never carried — only re-read. This is why the `BKIT_COUNTER_*` primitives are inert, and why re-derivation makes that class of bug structurally impossible rather than merely fixed.
- **`attempt` on the row becomes telemetry-only** (it feeds #234's counter rows). Routing counts rows, so a missing or wrong `attempt` cannot corrupt control flow.
- **No counter originates in prose.** `Init counters:` and `Increment X + 1` are removed.
- **`decide_next` / `check_max` fail closed** — reject empty / non-integer (exit 2, print nothing), route any non-0/1 exit to the Failure Path, and drop the `2>/dev/null` that hides the diagnostic.

Why derivation rather than the original stored-`counters` sketch: that sketch had to propose a policing invariant (_"`counters.verifyAttempt` must equal the count of `plan-verify` step entries"_) precisely because a stored counter drifts from the rows. Counting the rows makes that invariant true by construction — no drift, no check, and no dependence on every step faithfully writing its `attempt`. `PRIOR_STRATEGY` (`bkit-build.md:988`) already folds-and-reads the same log for `strategy`; the data was always in the log, only the read was missing.

## Constraints (load-bearing — all verified, see findings comment)

1. **Fail-closed cannot ship alone.** Today an unset counter routes to _continue_. Hardening `decide_next` without the derivation converts silent-overrun into **never-retries** — every retry route hard-fails. Both halves land in the same change (KN-26 "two complementary defences land together" shape).
2. **Do NOT copy `PRIOR_STRATEGY`'s scoping.** Verified: its read (`[.[] | .steps[] | ...] | last`) spans **all** runs — given a completed run recording `PIVOT` and a fresh second run with no diagnose rows of its own, it still returns `PIVOT`. That may well be correct for strategy; it is wrong for attempts, where a resumed run would inherit a spent budget (the starvation DE-25 had to fix for SOAK). Two reads over one log with deliberately opposite scoping — comment both sites.
3. **Row-counting depends on `parentSha` advancing per attempt.** The fold dedups on `"S {workflow} {step} {parentSha} {at}"`; retries survive only because each attempt's `--allow-empty` commit moves HEAD. This makes the counter implicitly dependent on the commit cadence — drop the per-attempt commit and attempts silently collapse into one. Test both directions: distinct retries must survive, byte-identical replays must collapse.
4. **`SOAK_ATTEMPT` needs more than row-counting.** It resets on every SOAK entry, so it counts rows _since the last SOAK-entry marker event_. Precedent: the existing `debugAttempt` `workflow-meta` event.
5. **Delete the inert primitives last.** `bkit-debug.md:432` still calls `counter_reset`; `counter_init` / `inc` / `get` / `reset` and `BKIT_COUNTER_*` come out only once every site is converted.
6. **`CHALLENGE_REMEDIATE_ATTEMPT` is not shell-gated at all.** `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` is defined in `bkit-counter-bus-config.sh` and referenced **nowhere** — the real gate is a prose comparison against a hardcoded literal `1` (`bkit-build.md:780-783`, `804`). The prose audit cannot see it: its regex matches `ATTEMPT … MAX_`, and this compares against `1`. So the "single source of truth, no duplication" criterion is violated in both directions — the literal is duplicated in prose and the constant is dead.

## Call sites (7)

| Counter                       | Site                           | Today                         |
| ----------------------------- | ------------------------------ | ----------------------------- |
| `VERIFY_ATTEMPT`              | `bkit-build.md:563`            | `decide_next`                 |
| `TEST_ATTEMPT`                | `bkit-build.md:960`            | `decide_next`                 |
| `CHALLENGE_REMEDIATE_ATTEMPT` | `bkit-build.md:780-783`, `804` | **prose vs literal `1`**      |
| `DEBUG_ATTEMPT`               | `bkit-debug.md:194`            | `decide_next`                 |
| `NORMAL_ATTEMPT`              | `bkit-debug.md:424`            | `decide_next`                 |
| `SOAK_ATTEMPT`                | `bkit-debug.md:432`, `440`     | `counter_reset` + `check_max` |
| `MERGE_ATTEMPT`               | `bkit-ship.md:586`             | `decide_next`                 |

Adjacent, worth folding in: the `FOLD` blob is byte-identical across all three workflows (md5 `d04a2499ad1900d9757b00774dd87866`, 1079 bytes) — three hand-synced copies of a non-trivial jq reducer. Sourcing it once from the counter-bus makes the derivation and the workflows agree by construction.

## Out of scope

- Verdict semantics, strategy selection, sub-plan iteration logic.
- Renaming or restructuring step IDs; artifact file formats.
- The `counterSource` enum question (is `"derived"` more accurate than `"shell-bus"`, which names the transport rather than the provenance?) — #234 owns that schema; flagged there.
- `TEST_VERDICT` / `TEST_SCOPE` pass via `--arg` and accept empty silently, unlike the counters' `--argjson` hard-stop. Legitimately model judgments — this issue keeps verdict interpretation in the orchestrator. Noted on the findings comment, not fixed here.

## Acceptance

- No `*_ATTEMPT` variable referenced in orchestrator markdown except inside fenced shell blocks — **including assignment and increment**, not only comparisons. The current prose audit (`bkit-counter-prose-audit.test.ts`) checks comparisons only and certifies the migration complete on that basis; widen it.
- No counter value originates in orchestrator context — every one is read from `status.jsonl` at the point of use.
- All `MAX_*` thresholds come from `bkit-counter-bus-config.sh`, with no literal duplicated in prose (closes constraint 6).
- A workflow exceeding a `MAX_*` threshold cannot silently continue — **and** an unusable counter cannot silently continue. Both route to the Failure Path.
- Resume re-derives every counter: no restored state, no fresh budget.
- Integration tests run across **separate processes**, not one `bash -c`, covering: over-cap → `failure-path`; unset/empty → refused rather than continue; per-attempt row counting; active-run scoping; subPlan isolation; fold dedup in both directions. `tests/counter-bus.bats` today exercises the helpers inside a single `bash -c` — the one condition the workflows never satisfy — so its green is not evidence.
- Every emitted counter row can honestly claim a non-`model-self-report` provenance.

---

## Comments (verbatim, chronological)

### Comment 1 — cbartens, 2026-06-06T06:59:33Z

https://github.com/cbartens/bkit/issues/58#issuecomment-4637746753

Closing as duplicate of #234, which consolidates this with #232, #183, and #233 into one master telemetry feature (`.bkit/stats.jsonl` + friction/deferrals/failures JSONL + harvest & analysis). This issue's full body is preserved verbatim as an archive comment on #234.

---

### Comment 2 — cbartens, 2026-07-15T01:40:49Z

https://github.com/cbartens/bkit/issues/58#issuecomment-4976001499

## Reopened — the correctness half never shipped, and the guard is fail-open today

Closed 2026-06-06 as a duplicate of #234. Reopening because #234 absorbed the **measurement** slice of this issue ("deterministic counters feeding stats") but not the **control-flow correctness** slice, which is what this issue was actually filed for. Counters are not primarily telemetry — the retry loops _branch_ on them. Recording attempts into `stats.jsonl` for later harvest does not make anything authoritative at the point of the branch.

Verified against `dev` @ 5478fa08.

### What shipped vs. what this issue asked for

| Acceptance criterion (original body)                                                              | Status                                        |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| All `MAX_*` constants live in one config file                                                     | ✅ `.bkit/scripts/bkit-counter-bus-config.sh` |
| Threshold comparison moved out of prose into shell                                                | ✅ `decide_next` / `check_max`                |
| **Counters stored in status + read from it; orchestrator no longer tracks "this is attempt N"**   | ❌ never shipped                              |
| **No `*_ATTEMPT` variable referenced in orchestrator markdown except inside fenced shell blocks** | ❌ still prose                                |
| **A workflow that exceeds `MAX_*` cannot silently continue**                                      | ❌ **regressed — it now silently continues**  |

The helper script `.bkit/scripts/bkit-counter-bus.sh` was written with the full contract (`counter_init` / `counter_inc` / `counter_get` / `counter_reset`), but **`counter_init`, `counter_inc` and `counter_get` are called from zero workflow sites.** The only helper call sites in the entire workflow corpus are:

- `.bkit/workflows/bkit-debug.md:432` — `counter_reset SOAK_ATTEMPT`
- `.bkit/workflows/bkit-debug.md:440` — `check_max SOAK_ATTEMPT ...`
- 5 × `decide_next` (build:563, build:960, debug:194, debug:424, ship:586)

Counter storage stayed exactly where this issue said it must not: orchestrator prose. `.bkit/workflows/bkit-build.md:316` — ``Init counters: `VERIFY_ATTEMPT` = 0, `TEST_ATTEMPT` = 0, `CHALLENGE_REMEDIATE_ATTEMPT` = 0``; `bkit-build.md:909` — ``Increment `TEST_ATTEMPT` + 1``.

### Defect 1 — `decide_next` fails **open**: the cap never fires (critical)

Every call site passes a shell variable that is **never assigned in that block**:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
. "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
. "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
decide_next TEST_ATTEMPT "$TEST_ATTEMPT" "$MAX_TEST_ATTEMPT" step-14 failure-path 2>/dev/null
```

`$MAX_TEST_ATTEMPT` arrives from the sourced config. `$TEST_ATTEMPT` arrives from nowhere. The counter-bus stores counters as `BKIT_COUNTER_*` shell variables, and **shell state does not persist between orchestrator Bash calls** — each fenced block is a fresh process. So the block only works if the orchestrating model silently substitutes a remembered literal before running it, which is nowhere instructed and is precisely the "LLM must execute the counter" mechanism this issue set out to delete.

When it is not substituted, `$TEST_ATTEMPT` expands empty and `[ "" -gt 3 ]` returns non-zero — **indistinguishable from "condition false"**, so `decide_next` takes the continue branch. Reproduced on all four shells:

```
=== bash ===
  unset counter    -> stdout=step-14      exit=0   # retry, cap ignored
  TEST_ATTEMPT=99  -> stdout=failure-path exit=1
=== zsh ===  / === dash === / === sh ===   (identical)
```

The routing table reads `exit 0 (printed step-14) -> Step 14`, so an unset counter routes to **retry, forever**. `MAX_TEST_ATTEMPT` is never enforced. The `2>/dev/null` on every call site suppresses bash's `[: : integer expression expected` — the only signal that anything is wrong.

This is a verbatim reproduction of the failure this issue was filed to prevent: _"Failures are silent — the workflow proceeds past `MAX_*` without anyone noticing until artifacts pile up."_ The counter-bus currently makes that failure **harder** to spot than the prose it replaced, because the guard looks deterministic and enforcing while enforcing nothing.

### Defect 2 — helper writes and call sites use different variable names

`counter_init` / `counter_inc` / `counter_reset` write to `BKIT_COUNTER_{NAME}`. Every call site reads `${NAME}`. These never meet:

```
counter_reset SOAK_ATTEMPT
BKIT_COUNTER_SOAK_ATTEMPT='0'   <- what the helper wrote
SOAK_ATTEMPT=''                 <- what bkit-debug.md:440 then reads
```

So `bkit-debug.md:432`'s SOAK budget reset is inert, and `check_max SOAK_ATTEMPT "$SOAK_ATTEMPT" ...` on the next line reads an empty value → same fail-open as Defect 1. Even with per-session shell persistence, the wiring would not connect.

### Defect 3 — resume silently restores a fresh retry budget

The **Resume** contract (`bkit-build.md:24`) is _"fold status.jsonl — pick up after last `DONE` step in active `IN_PROGRESS` workflow"_. It restores no counters. `attempt` **is** written into `status.jsonl` on every `step-done` row, but nothing ever reads it back — the only field that round-trips is `strategy` (via `PRIOR_STRATEGY`, `bkit-build.md:988`). A resumed run therefore re-enters a retry loop with its budget silently reset, which is the same overrun by a different door. The data needed to fix this is **already in the log**; only the read is missing.

### Defect 4 — the tests encode the narrowed criterion as the expectation

Both guards pass while the bug ships:

- `tests/counter-bus.bats` exercises the helpers **within a single `bash -c`** (`counter_init FOO && counter_get FOO`). That is the one condition the real workflow never satisfies — every workflow call site is a separate process. The unit is green; the integration was never tested.
- `.bkit/src/bkit-counter-prose-audit.test.ts` claims to confirm "the #58 prose→shell migration is complete", but its regex is `/\bATTEMPT\b.*(?:<=|>=|<|>)\s*(?:`?)MAX_|MAX_\w+\s*(?:<=|>=|<|>)\s*\d/`— comparisons only. It cannot match ``Init counters:`VERIFY_ATTEMPT`= 0`` or ``Increment`TEST_ATTEMPT`+ 1``. This issue's criterion ("no`*_ATTEMPT` **referenced** in prose") was quietly narrowed to "no _comparisons_ in prose", and the audit certifies the migration complete on that basis.

Same class as `feedback_validate_shipped_config_with_real_tool` / #179 / #195: the test asserts the shape that was built rather than the behaviour that was required, and stays green.

### What must be true to close this

1. **Counters read from `status.jsonl` at the branch point.** Fold the log for the current run and derive the attempt (`[.steps[] | select(.step==$s)] | last.attempt`), exactly as `PRIOR_STRATEGY` already does. No counter value may originate in orchestrator context.
2. **`decide_next` fails closed.** Reject empty / non-integer values explicitly (`case $_val in ''|*[!0-9]*) return 2`), and route a non-0/1 exit to the Failure Path. Drop `2>/dev/null`, or send stderr somewhere the run surfaces.
3. **Reconcile the helper contract with the call sites** — either have call sites read via `counter_get` (returning the folded value), or delete the unused `BKIT_COUNTER_*` primitives so the script stops implying persistence it cannot provide. Keeping dead helpers alongside a different live convention is what let Defect 2 hide.
4. **Resume restores counters** from the folded log.
5. **Prose stops assigning counters** — remove `Init counters:` / `Increment X + 1`, and widen the prose audit to match _any_ `*_ATTEMPT` reference outside a fenced block, per this issue's original wording.
6. **Integration test, not unit test.** Assert across _separate processes_ that an over-cap counter routes to `failure-path`, and — the case that matters — that an **unset/empty** counter does **not** route to continue. Both must fail against today's `dev`.

Filing back here rather than on #234: items 1-6 are correctness, and #234's own framing is _"This is all about **collecting stats**."_ Telemetry can consume the same folded counters afterwards; it cannot substitute for the read.

---

### Comment 3 — cbartens, 2026-07-15T02:48:13Z

https://github.com/cbartens/bkit/issues/58#issuecomment-4976361696

## Correction to the comment above — Defect 1's severity was overstated

Further checking shows my claim that `MAX_*` enforcement is _"silently absent on `dev` today"_ is **wrong**, and I want that off the record before anyone plans against it. The fail-open in `decide_next` is real and reproduces exactly as described, but its **reachability is much narrower** than I implied.

**What I missed:** every retry step writes its status row _before_ it routes, and that write passes the counter through `jq --argjson`, which hard-fails on an empty value:

```
$ jq -nc --argjson a "$TEST_ATTEMPT" '{attempt:$a}'      # TEST_ATTEMPT unset
jq: invalid JSON text passed to --argjson
exit=2
```

That pattern guards **20 call sites** across the three workflows (`VERIFY_ATTEMPT` ×2, `CHALLENGE_REMEDIATE_ATTEMPT` ×3, `TEST_ATTEMPT` ×3, `CI_ATTEMPTS` ×3, `NORMAL_ATTEMPT` ×5, `DEBUG_ATTEMPT`, `MERGE_ATTEMPT` ×3). In `bkit-build.md` Step 13 the status write is sub-step 5 and the routing is sub-step 7 — so an unset counter kills the step at the write, well before `decide_next` is reached, and the workflow's **Failures** rule (_"If any step, tool, command fails → Failure Path"_) turns that into a loud abort.

**What this implies:** the orchestrator must in practice be substituting counter literals into these blocks, or no build would ever get past its first `run-tests` step. So the live picture is "mostly works, or fails loudly" — not "silently overruns".

**What survives, and why this issue still stands:**

1. **The fail-open is a real trap, just a narrow one.** It needs an _inconsistent_ substitution — literal into `--argjson`, `$VAR` left bare in `decide_next`. Two different fenced blocks, two moments, long context between them. That's a plausible LLM failure, and it's the one case that overruns in silence. `2>/dev/null` still hides the only diagnostic.
2. **The core complaint is untouched and is the real point.** The counter reaching the shell is a number the model remembered and typed in. `decide_next` doesn't make that deterministic — it launders a model-supplied number through shell and returns it wearing a uniform. If the model miscounts (this issue's founding premise: _"LLMs miscount, lose track of which attempt they're on across long contexts"_), every guard downstream faithfully enforces the cap against the **wrong number**, and `--argjson` won't catch it because a wrong integer is still valid JSON. The `2>/dev/null` fail-open is a bug; **model-authored counters are the actual defect**, and they are exactly as present as they were in May.
3. **Defects 2, 3 and 4 are unaffected** — the `BKIT_COUNTER_*` name mismatch, resume restoring a fresh budget, and the tests certifying a narrowed criterion all stand as written.

Net: downgrade Defect 1 from "critical, live" to "latent trap"; the issue's priority rests on point 2, which is the thing it was filed about.

---

### Comment 4 — cbartens, 2026-07-15T03:13:46Z

https://github.com/cbartens/bkit/issues/58#issuecomment-4976505413

## Decision: counters are **derived** from `status.jsonl`, not stored — and bkit's own telemetry has been recording this defect all along

Recorded in `docs/decisions.jsonl` → key `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored` (status ACTIVE; validated against the shipped codec).

### The evidence that settles it

`.bkit/jsonl.md` documents a `counter` row as carrying `counterSource: "model-self-report" | "shell-bus"` — a provenance discriminator, enforced at `bkit-telemetry.ts:477`. Every live counter row in the repo says the same thing:

```
$ jq -r 'select(.kind=="counter") | .counterSource' stats.jsonl | sort | uniq -c
  10 model-self-report
   0 shell-bus
```

`DESIGN_ATTEMPT`, `PLAN_ATTEMPT`, `BUILD_ATTEMPT`, `DEBUG_ATTEMPT`, `SHIP_ATTEMPT` — all self-reported, none shell-sourced. The schema anticipated exactly this problem and has been faithfully recording it since it landed. This issue doesn't need to argue the counters are model-authored; the telemetry already says so, in a field built to say so.

### The decision

**Derive, don't store.** `attempt(step) = count(step-done rows for that step, DONE, in the ACTIVE run of that workflow) + 1`, evaluated at step start; after the step appends its row that same count _is_ the attempt, so post-write routing re-derives the identical number with no field read.

This supersedes the `counters` object in this issue's original sketch. That sketch had to propose a policing invariant — _"`counters.verifyAttempt` must equal the count of `plan-verify` step entries"_ — precisely because a stored counter can drift from the rows. Counting the rows makes that invariant **true by construction**: no drift, no check, and no dependence on every step faithfully writing its `attempt`. The `attempt` field then becomes telemetry-only (feeding #234's counter rows) rather than the source of truth.

Worth noting _why_ the original sketch reached for a stored object: it was written in May against the old `status.json` **array**. `status.jsonl` only became an append-only event log with a fold at #209 — and `PRIOR_STRATEGY` (`bkit-build.md:988`) already performs exactly this fold-and-read for `strategy`. The shape that makes derivation natural arrived after this issue was filed. The data was already in the log; only the read was missing.

### Sequencing constraint (load-bearing)

**Fail-closed cannot ship alone.** Today an unset counter routes to _continue_. Harden `decide_next` on its own and every retry route becomes a hard Failure Path — converting "may silently overrun" into "never retries", which is a different wrong. The derivation must supply a real value in the same change. Same shape as KN-26's "two complementary defences land together — cannot be split".

### Rollout notes

- Every fenced block that needs a counter **re-derives** it. Shell state does not persist across orchestrator Bash calls — that is the root cause of Defect 2, and re-derivation is what makes it structurally impossible rather than merely fixed.
- `SOAK_ATTEMPT` is the one counter that needs more than row-counting: it resets on every SOAK entry, so it counts rows _since the last SOAK-entry marker event_. Precedent: the existing `debugAttempt` `workflow-meta` event.
- Deleting the inert `counter_init`/`counter_inc`/`counter_get`/`BKIT_COUNTER_*` primitives is deferred to the full rollout — `bkit-debug.md:432` still calls `counter_reset`, so they come out once all six sites are converted, not before.

Spiking `TEST_ATTEMPT` (build Step 13) end-to-end now, with a cross-process integration test that must fail against today's `dev`.

---

### Comment 5 — cbartens, 2026-07-15T03:28:41Z

https://github.com/cbartens/bkit/issues/58#issuecomment-4976574155

## Spike findings — derivation verified end-to-end, then reverted (no code change on `dev`)

Prototyped the derived-counter contract on one call site (`TEST_ATTEMPT`, build Step 13) purely to test the design, then **reverted it in full** — `.bkit/workflows/bkit-build.md`, `.bkit/scripts/bkit-counter-bus.sh` and `tests/counter-bus.bats` are byte-identical to HEAD. Nothing here is implemented. Recording what the prototype proved so the eventual rollout doesn't rediscover it.

### 1. The contract works, and resume falls out for free

Simulated each fenced block as its own process with nothing shared but `status.jsonl` — the only condition the orchestrator ever runs in:

```
iteration 1: derive -> 1 | write row | route -> step-14  (retry)
iteration 2: derive -> 2 | write row | route -> step-14  (retry)
iteration 3: derive -> 3 | write row | route -> step-14  (retry)
iteration 4: derive -> 4 | write row | route -> failure-path (exit 1)
             [bkit-telemetry] counter TEST_ATTEMPT exceeded max=3 (value=4)
```

The two-position semantics hold with one helper: at step START `attempt = count + 1`; once the step appends its row, `count` **is** the attempt — so the post-write routing block re-derives the identical number without reading the `attempt` field or carrying any state. Defect 3 (resume) needs no separate fix: a fresh process reading the same log lands on the same attempt, because there is nothing to restore.

### 2. `PRIOR_STRATEGY` and attempt counters need OPPOSITE run-scoping — do not copy its shape

I proposed following `PRIOR_STRATEGY` as the precedent. Verified that its read is **not** scoped to the active run:

```jq
[.[] | .steps[] | select(.step==$s and .status=="DONE")] | last.strategy   # .[] = ALL runs
```

Given a completed run that recorded `PIVOT` and a **fresh second run with no diagnose rows of its own**, the shipped read returns `PIVOT`; an active-run-scoped read correctly returns empty.

This is plausibly **correct for strategy** — a resumed run arguably should not restart the STANDARD → PIVOT → FINAL ladder from scratch. But it is **wrong for attempts**: cross-run counting would hand a resumed workflow the previous run's attempts and starve its budget immediately (the same starvation DE-25 had to fix for SOAK). So the derivation must scope to the active run (`fold | map(select(.workflow==$w)) | last | .steps`) while `PRIOR_STRATEGY` deliberately does not. Two reads over the same log with deliberately different scoping — worth an explicit comment at both sites, since the asymmetry looks like a bug from either direction. Flagging rather than filing: I did not establish which behaviour strategy actually wants.

### 3. Row-counting is safe only because `parentSha` moves — that is now load-bearing

The fold dedups on `"S {workflow} {step} {parentSha} {at}"`. Counting rows therefore assumes two real retries never collide on that key. They don't, because each attempt's `--allow-empty` commit advances HEAD, so `parentSha` differs. But this is an **implicit dependency of the counter on the commit cadence** — drop the per-attempt commit and attempts silently collapse into one, which is a silent under-count of exactly the kind this issue exists to prevent.

My own test fixture hit this immediately (two byte-identical rows deduped to 1, which I initially misread as an implementation bug). The rollout wants tests from both directions: distinct retries must survive, byte-identical replays must collapse.

### 4. The fold is byte-identical across all three workflows

`bkit-build.md` / `bkit-debug.md` / `bkit-ship.md` all inline the same 1079-byte `FOLD` blob (md5 `d04a2499ad1900d9757b00774dd87866`) — three hand-synced copies of a non-trivial jq reducer. Sourcing it once from the counter-bus makes the derivation and the workflows agree by construction, and is worth doing on its own merits regardless of this issue.

### 5. Cost, for scoping

One call site cost ~120 lines of shell (helper + fail-closed guards), ~25 lines of workflow, ~220 lines of tests. The remaining five sites are mostly mechanical repetition of the same block, except `SOAK_ATTEMPT` (needs a reset-marker event). `shellcheck -s sh` needs a targeted `disable=SC2016` for the embedded fold (the `$w` are jq variables). bats is already gated in CI (`ci.yml:500`), so new tests would enforce automatically with no CI wiring.

### 6. Adjacent gap, not part of this issue

The same blocks pass `TEST_VERDICT` / `TEST_SCOPE` via `--arg` (not `--argjson`). Unlike the counter, these are legitimately model judgments and this issue explicitly keeps verdict interpretation in the orchestrator. But `--arg` accepts empty silently, so an unsubstituted verdict writes `verdict:""` into the log rather than failing — the counters' `--argjson` hard-stop has no equivalent here. Not a counter problem; noting it because it is the same substitution assumption with a quieter failure mode.

---

**Status: nothing implemented.** The decision record in `docs/decisions.jsonl` (`58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`) stands as the agreed target; this comment is the evidence behind it.
