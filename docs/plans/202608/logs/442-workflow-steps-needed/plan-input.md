# Plan Input — 442-workflow-steps-needed

## Session prompt

`/bkit-plan #442`

## Issue #442 — Run only workflow steps tasks actually need

State: open | Labels: enhancement, bkit:plan | Milestone: Workflow Optimisation
URL: https://github.com/cbartens/bkit/issues/442

> Content below the last `<!-- bkit:ignore-earlier -->` marker only. The original issue body and the earlier `SCALE` comment are superseded and were dropped per the marker rule.

---

<!-- bkit:ignore-earlier -->

# Agreed approach — supersedes everything above

This comment is the current, complete statement of the issue. The original body and the `SCALE` comment above it are historical; the `<!-- bkit:ignore-earlier -->` marker means a bkit run reads only from here down.

## The gap

Every feature costs the same number of subagent invocations regardless of how big it is. Design and plan together fire 21 for one feature; build fires 8 on a clean run. For a well-scoped small change most of those steps have nothing to look at, and they run anyway.

The cost that matters is not tokens. It is that the process is heavy enough that people route around it — and work done outside bkit leaves no artifacts, no ledger rows and no gates. That is the debt this issue is about.

## What is _not_ the gap

The five phases are already independently invocable. Nothing in bkit forces design → plan → build → ship:

- `bkit-auto.md:72` reads `{PHASE}` as a literal invocation argument and `:75-82` just lowercases it and picks the skill. It has never checked that design ran before plan.
- `bkit-plan.md:266`: "**If** `PARENT_FID` empty → standalone, do NOT append." A plan with no design doc is expected input, not a workaround.
- `bkit-debug` runs standalone; it takes an FID and makes its own worktree at Step 2.

So "the chain is all-or-nothing" is true _inside_ a phase and false _across_ phases. There is no lock to unlock. What is actually missing is that **nothing chooses the entry point and nothing records the choice** — you have to already know the map to pick, and once you have picked there is no artifact saying why design was skipped.

## Invariant: build always has a plan

`bkit-build.md:207` (`**If** existing docs/plans/{YYYYMM}/{FID}-plan.md → reuse FID. **Else** → **Failure Path**.`) stays exactly as it is. No comment-only plans, no materialise-into-a-file shim, no `→ build` route.

The consequence: **plan is the floor for all feature work.** Nothing routes around it, which is precisely why plan's cost is the thing worth attacking.

---

# Part 1 — Entry point: plan by default, escalating to design

**Default entry is `/bkit-plan` for anything that is not an already-failing test.** Design is entered only from plan, by escalation.

**New: plan can escalate to design.** After Step 3 Generate Plan and before the Step 5 fan-out, plan emits an escalation verdict. If the generated plan turns out to rest on open decisions with real alternatives, plan stops and hands to design.

**Why this needs no human approval gate.** An orchestrator with free choice of steps drifts toward the cheap path, and a skipped step leaves no artifact, so the drift is invisible. But that only bites on _downgrades_. Escalation is the expensive direction: an agent choosing "this needs a design phase" is never the lazy choice. And with build's plan requirement intact there is nothing below plan to downgrade into. So the only automatic move available is upward, and it needs no human standing in for it.

Cost when the entry guess is wrong: one wasted `bkit-plan-generate` run, since the verdict lands before the review fan-out.

**Debug keeps its own entry** — a red CI run already dispatches it through `bkit-auto`'s CI mode.

**But debug's entry has a real gap.** Debug is failure-driven, not bug-driven. `bkit-debug.md:500` routes `TEST_VERDICT = PASS` straight to Step 8 Push Remediation → Step 9 Summary → close, and `:577` gates Failure Diagnose on `**Run only if** `TEST_VERDICT` = FAIL`. So a bug a human just reported, with no failing test yet, gets a green no-op run: the workflow finishes clean having proved only that the existing suite still passes. Writing the failing test first is plan-and-build-shaped work, not debug work, so the routing rule must say: **a bug with no failing test goes to plan, not debug.** Debug is for a failure that already reproduces.

---

# Part 2 — Steps run when their input exists

## The rule

A step runs when the thing it inspects is present. Not when a size dial says so.

Every lens prompt names what it iterates over. When that is empty the lens does not produce a weaker answer — it reads, finds no instances, and returns `PASS` having looked at nothing. That is a machine-checkable condition and a far better justification for skipping than "this feels small".

## Why not a scale dial

A `NARROW | STANDARD | WIDE` scalar collapses several independent facts into one number, then lets arbitrary filename numbering decide which lens survives. On Step 5 Review Plan, "NARROW = run 1" keeps `bkit-plan-review-1` (tightness and scope discipline — the lens most duplicated by Step 7's scope check) and drops both dependency correctness and regression risk.

The parallel siblings are **not** redundant copies. Each carries an explicit `Lens:` line:

| Group     | Siblings              | Lenses                                                                  |
| --------- | --------------------- | ----------------------------------------------------------------------- |
| design S3 | `ideate-1/-2/-3`      | Pragmatic / Optimal-tradeoff ignoring legacy / Risk premortem           |
| design S5 | `design-review-1/-2`  | Buildability / Operability                                              |
| plan S5   | `plan-review-1/-2/-3` | Tightness + scope discipline / Dependency correctness / Regression risk |
| plan S7   | `scope-check-1/-2`    | **identical** — the two files differ only in `name:` and `model:`       |
| build S10 | `challenge-1/-2`      | Bugs / Security                                                         |

`bkit-plan-scope-check-2` is the only genuine duplicate in the set — a second-opinion sampler on a cheaper model, not a lens. Everywhere else, cutting width by count silently deletes a dimension.

---

## Audit: all five workflows

Only 🧠 steps (subagent-invoking) are candidates. 🤖 steps are orchestrator plumbing.

### `bkit-design` — 10 invocations at full width

| Step | Subagent                       | Today             | Runs when                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---- | ------------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S3   | `ideate-1` Pragmatic           | always            | always — the floor                                                                                                                                                                                                                                                                                                                                                                                                                |
| S3   | `ideate-2` Optimal-tradeoff    | always            | **the issue has a legacy constraint worth challenging.** On a bug fix or narrow refactor the constraint _is_ the deliverable; there is no greenfield alternative to propose                                                                                                                                                                                                                                                       |
| S3   | `ideate-3` Risk premortem      | always            | **there is a new runtime surface.** `:39` iterates 10x scale / 6 months later / on-call at 3am / author leaves — a tooling, test or docs change has none                                                                                                                                                                                                                                                                          |
| S4   | `design-generate`              | always            | mandatory                                                                                                                                                                                                                                                                                                                                                                                                                         |
| S5   | `design-review-1` Buildability | always            | **the design adds a dependency or a new system.** `:5` is "per major capability the design requires" → ecosystem search; `:6-8` are stack feasibility, library eval, integration risk. Zero new capabilities → all four empty. **Sole emitter of `SPIKE`** (`bkit-design.md:453`, Failure Path at `:455` if invalid) → skipping must hard-set `SPIKE=FALSE`, which is self-consistent: no new capability is also nothing to spike |
| S5   | `design-review-2` Operability  | always            | **there is a runtime behaviour change.** `:5` is "per major component / flow", `:7` "per anticipated alert"                                                                                                                                                                                                                                                                                                                       |
| S6   | `design-spike`                 | ✅ `SPIKE` = TRUE | unchanged                                                                                                                                                                                                                                                                                                                                                                                                                         |
| S7   | `design-update`                | always            | **at least one S5 finding exists.** Needs a `Failures:` count header first — see prerequisites                                                                                                                                                                                                                                                                                                                                    |
| S8   | `design-organise`              | always            | **more than one workstream, or `MILESTONE` set.** S10 at `:714` already gates on `MILESTONE`                                                                                                                                                                                                                                                                                                                                      |
| S9   | `design-summary`               | always            | mandatory — S10 and S11 gate on `SUMMARY_VERDICT`                                                                                                                                                                                                                                                                                                                                                                                 |

### `bkit-plan` — 11 invocations at full width

| Step | Subagent                               | Today                           | Runs when                                                                                                                                                                                                                      |
| ---- | -------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S3   | `plan-generate`                        | always                          | mandatory                                                                                                                                                                                                                      |
| S5   | `plan-review-1` Tightness              | always                          | always — its input is the plan                                                                                                                                                                                                 |
| S5   | `plan-review-2` Dependency correctness | always                          | **the plan declares dependency edges.** `:5` builds the graph from `Requires:` / `Blocked by:` / `After:` fields and `:9` looks for cycles — a one-task plan declares none. Countable straight off the runbook                 |
| S5   | `plan-review-3` Regression risk        | always                          | **the plan touches a consumed surface.** `:5` traces exported symbols with callers, schemas with downstream readers, endpoints and event names. Greppable — but force it on via the sensitive-path globs rather than inferring |
| S6   | `plan-update`                          | always                          | **at least one S5 finding.** All three reviewers already emit `Failures: <integer >= 0>`                                                                                                                                       |
| S7   | `scope-check-1`                        | always                          | always                                                                                                                                                                                                                         |
| S7   | `scope-check-2`                        | always                          | **never** — byte-identical file to `-1` bar `name:` and `model:`                                                                                                                                                               |
| S8   | `plan-update`                          | always                          | **at least one S7 finding**                                                                                                                                                                                                    |
| S9   | `complexity-check`                     | always                          | **the plan is above the split threshold.** Below it, `SPLIT` is unreachable. Must hard-set `COMPLEXITY_VERDICT = NOSPLIT` so S10's existing gate reads a real value                                                            |
| S10  | `complexity-split`                     | ✅ `COMPLEXITY_VERDICT` = SPLIT | unchanged                                                                                                                                                                                                                      |
| S11  | `plan-summary`                         | always                          | mandatory — S12 gates on it                                                                                                                                                                                                    |

A genuinely small, single-task plan then runs **four** invocations — generate, `plan-review-1`, `scope-check-1`, summary — instead of eleven, with no lens that had something to look at dropped.

### `bkit-build` — reviewed, no changes

| Step                                            | Verdict                                                                                                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S4 `build-plan-current`                         | **keep unconditional.** The obvious skip is "plan commit is an ancestor of the base", but Step 2 branching off a stale `origin/dev` is exactly the case this step exists to catch. Dropped from the candidate list |
| S5 `build-install-skills`                       | already flagged via `[skills=false]` (`:508`) — the existing precedent, unchanged                                                                                                                                  |
| S6 `build-plan-execute`, S7 `build-plan-verify` | mandatory                                                                                                                                                                                                          |
| S8, S9                                          | already conditional (`:698` on `VERIFY_VERDICT`, `:766` on `SUB_COUNT`)                                                                                                                                            |
| S10 `challenge-1` bugs / `challenge-2` security | **both always run.** Different dimensions, not copies; dropping `-2` deletes security coverage entirely. Sensitive-path globs may only _force_ width, never reduce it                                              |
| S11 `challenge-reconcile`                       | **stays unconditional** — a consequence of the row above. With both challengers always running there are always two reports to reconcile, so the "skip when only one ran" idea never fires                         |
| S12, S13, S15, S16, S17                         | already conditional                                                                                                                                                                                                |

Build is already half-conditional and the rest is load-bearing. Nothing to change here.

### `bkit-debug` — reviewed, no step changes

Every 🧠 step is already conditional: `:791` and `:871` on `DEBUG_MODE != SOAK`, `:937` on `DEBUG_MODE = SOAK`, `:1070` on `TEST_VERDICT = PASS`. The only change wanted is the entry-routing gap described in Part 1.

### `bkit-ship` — reviewed, no changes

Every 🧠 step is already conditional: `:555` (Path B only), `:860` / `:914` / `:1065` on merge state. Ship is the merge gate and stays maximally strict regardless of task size.

**All the opportunity is in design and plan.**

---

# Prerequisites

Three, and they land before any applicability predicate does.

## 1. `step-skipped` rows

`grep -rn 'step-skipped' .bkit/` returns nothing. A skipped step writes no row at all today, and its `🔒 Gate N` checklist has no defined outcome.

That is tolerable now because every current skip is derivable from a verdict already in the log. It stops being tolerable the moment skips are applicability-driven: in `status.jsonl` a deliberately skipped step becomes indistinguishable from one that crashed, "did this build ever get a security pass?" becomes unanswerable, and gate verification quietly means nothing.

- A `{type:"step-skipped", workflow, step, reason, decidedBy, at, parentSha}` row, where `decidedBy` is one of `caller-flag` | `upstream-verdict` | `applicability` | `path-override`, and `reason` names the absent input (`"zero declared dependency edges"`, `"no new capability required"`).
- Retrofit to all 28 existing conditional steps (`grep -nE '^\*\*(Skip if|Run only if)' .bkit/workflows/bkit-*.md`) so the log is complete rather than partial.
- A skipped step's gate is recorded as skipped, never as passed.

## 2. Verdict continuity

Every skippable step that is the **sole emitter** of a variable a later step reads must hard-set a defined value when skipped:

| Variable             | Sole emitter                             | Read by                                                   |
| -------------------- | ---------------------------------------- | --------------------------------------------------------- |
| `SPIKE`              | `design-review-1` (`bkit-design.md:453`) | S6 gate at `:501`; invalid value → Failure Path at `:455` |
| `COMPLEXITY_VERDICT` | plan S9                                  | S10 gate at `bkit-plan.md:743`                            |
| `CHALLENGE_VERDICT`  | build S11 reconcile                      | S12 `:952` and S13 `:1022`                                |

## 3. Input tolerance — the largest piece of actual work

Read lists are hardcoded filenames, so skipping a producer breaks its consumer:

- `bkit-design.md:559` — S7 reads `design-review-1.md` **and** `design-review-2.md`
- `bkit-design.md:607` — S8 reads `design-v2-reviewed.md`
- `bkit-plan.md:545` — S6 reads all three `plan-review-*.md`
- `bkit-plan.md:595` / `:599` — S7 reads `plan-v2-reviewed.md`
- `bkit-plan.md:648` — S8 reads `plan-v2-reviewed.md` plus both `plan-scope-check-*.md`

Two fixes, both patterns bkit already uses elsewhere:

- **Read lists become "whichever of these exist"** — the `(if present)` qualifier already used at `bkit-plan.md:488` for `related-issues.md`.
- **Version chains resolve to latest-present** rather than a fixed version number — exactly what design's close step already does at `bkit-design.md:846`: `DESIGN_FINAL=$(ls docs/plans/$YYYYMM/logs/{FID}/design-v*.md | sort -V | tail -1)`.

Also small and concrete: `bkit-design-review-1` and `-2` are the only reviewers with no `Failures: <integer >= 0>` header (every plan reviewer and scope checker has one). Design S7's zero-findings skip needs it added.

---

# Order of work

1. `step-skipped` rows + retrofit to the existing 28. Pure logging, no behaviour change.
2. Input tolerance + verdict continuity + the design `Failures:` header. Mechanical, still no behaviour change — this is what makes everything after it safe.
3. Applicability predicates in `bkit-design` and `bkit-plan`.
4. Plan → design escalation, and the debug entry rule.

Net new machinery for the whole issue: `step-skipped` rows, per-lens applicability predicates, and one escalation verdict. No new workflow, no skip-precondition enum, no human approval gate, no scale dial.

---

# Open questions

- **Who computes each predicate?** Some are countable by the orchestrator in bash (declared dependency edges, task count, touched paths). Others — "does this design add a dependency" — need the artifact read, so they want a header emitted by the upstream subagent instead. Probably a mix; the split needs deciding per row.
- **Is `Verdict: PASS` alone enough evidence for the apply-step skips**, or is the `Failures:` count load-bearing? Plan already has the count; design does not.
- **Where does the escalation verdict come from** — `bkit-plan-generate` emitting an extra header, or a separate cheap classifier before S3?
- **Thresholds for `complexity-check`.** What plan size makes `SPLIT` unreachable? Wants calibration against real runs in `.bkit/stats.jsonl` rather than a guess.
- **The sensitive-path glob list** for forcing `plan-review-3` and challenge width. Belongs in consumer config (`package.json` `bkit.*`, alongside `bkit.githubProject`), defaulting to empty — naming auth / migration / payment paths in bkit's own shipped surface would break stack-independence.
