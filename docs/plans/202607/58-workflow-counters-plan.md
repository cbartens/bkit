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
> **Line references re-verified 2026-07-16 against `dev` @ `67e427b6`.** #99 (`b953237c`…`67e427b6`) rewrote ~600 lines across the five workflows and shifted every cited line number. Every reference in this index and its sub-plans was remapped **by content, not by offset**, and 31/31 load-bearing sites re-confirmed against the tree.
>
> **Every measured count is unchanged and still holds:** 18 `--argjson` sites / 19 counter references (`bkit-build.md` 8, `bkit-debug.md` 7 — `:759` carries two — `bkit-ship.md` 3); 62 placeholder lines (26/26/10); 15 FOLD sites across 5 files, blob still byte-identical. #99 also left untouched: `bkit-counter-bus.sh`, its config, `bkit-counter-prose-audit.test.ts` and `tests/counter-bus.bats` (so the vacuous-audit finding stands); the per-attempt `--allow-empty` commit cadence (18/10/10) that row-counting depends on; the `debug` "Update status:"-without-commit asymmetry (now `:399`); and the `step:"…"` name set (18/11/14, none added or removed) — so **T5.4's `COUNTER_STEP_MAP` keys are unaffected**, which is precisely why it was keyed on step names rather than line numbers.
>
> Line numbers remain a convenience index. T3.0 regenerates the worklist by rule and hard-stops on any count that is not 18/19; that rule, not this prose, is the authority.

## Context & Goals

Workflow orchestrators (`bkit-build`, `bkit-debug`, `bkit-ship`) branch their retry loops on attempt counters the **model** tracks in prose — `Init counters: TEST_ATTEMPT = 0` (`bkit-build.md:319`), `Increment TEST_ATTEMPT + 1` (`bkit-build.md:914`). The counter reaching the shell is a number the model remembered and typed in. `decide_next` does not make that deterministic: it launders a model-supplied number through shell and returns it wearing a uniform, then faithfully enforces the cap against the wrong number. bkit's own telemetry has recorded this since the schema landed — all 10 `counter` rows in `stats.jsonl` declare `counterSource: "model-self-report"`, zero `shell-bus`.

The fix (agreed, `docs/decisions.jsonl` → `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`) is **derivation, not storage**: `attempt(step) = count(step-done rows for that step, status DONE, in the ACTIVE run of that workflow) + 1`, evaluated at step START and **re-derived** in every fenced block that needs it. Shell state does not survive between orchestrator Bash calls, so a counter is never carried — only re-read. That makes the whole class of bug structurally impossible rather than merely fixed, and makes resume free (a fresh process reading the same log lands on the same attempt because there is nothing to restore).

`status.jsonl` only became an append-only event log with a fold at #209 — after #58 was filed against the old `status.json` array. The data was always in the log; only the read was missing.

**Success Criteria (whole feature):**

- No counter value originates in orchestrator context — every branch point re-derives it from `status.jsonl` in the fenced block that uses it, and no `*_ATTEMPT` name is referenced in orchestrator prose outside a fenced block (a `{PLACEHOLDER}` substitution token and a bare `MAX_*` constant name are the only exemptions).
- **The conversion's completeness is machine-checked, not hand-asserted.** The site list is produced by a rule over the corpus, not enumerated by hand: **no fenced block may read a bare `$X_ATTEMPT` unless that same block derives it**. Because this rule looks _inside_ fenced blocks — where the existing prose audit is blind by construction (`stripFencedBlocks`) — it is the only artifact in the plan that can detect an unconverted site. Every hand-written line number is a convenience index into that rule's output, never the authority.
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

## Sub-Plan Index

> Execute **in order**. Each child is self-contained: it carries its own Context & Goals, its dependencies on prior children stated explicitly, its slice of the 19-row Derived Test Matrix, its gates, and its verification plan.

<!-- prettier-ignore -->
| # | Sub-plan | Tasks | Scope | Ends at | Depends on |
| --- | --- | --- | --- | --- | --- |
| 1 | [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md) | **15** | WS-1 (T1.1–T1.3) + WS-2 (T2.0–T2.10) + T5.2. Single-source the fold into a shipped script; add `counter_count`/`counter_next`/`counter_current` **alongside** the still-live primitives; repoint the whole test corpus template-relative; land the cross-process derivation suites; add the no-dead-constant rule. **Purely additive — touches no call site, hardens no guard, deletes nothing.** | Gate 2a | — (first) |
| 2 | [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) | **14** | T5.1 + T5.3 + WS-3 (T3.0–T3.9) + T5.4. Ship the completeness + prose rules RED-first, generate the worklist by rule, convert **all 18 `--argjson` sites / 19 counter references** across build/debug/ship, pin the mapping, **then** harden the guard. **The KN-26 atomic core.** | Gate 2b → T3.8 → T3.9 | Sub-plan 1's Gate 2a |
| 3 | [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md) | **8** | WS-4 (T4.1–T4.2) + WS-6 (T6.1–T6.2) + WS-7 (T7.1) + WS-8 (T8.1–T8.3). Delete the substitution prose (worklist = T5.1's output); delete the inert primitives (**last**, constraint 5); make emitted telemetry honest; docs, ledgers, and the single batched `bkit install`. | Gate 2 → Gate 3 → Gate 4 → Manual Verification | Sub-plan 2's Gate 2b **and** T3.8/T3.9 |

**Task accounting: 15 + 14 + 8 = 37** — matches `plan-v3-checked.md`'s 37 exactly. Every task's `Done when` travelled verbatim.

**Gate ownership (each defined exactly once):** Gate 1 + Gate 2a → sub-plan 1 · Gate 2b → sub-plan 2 · Gate 2 + Gate 3 + Gate 4 + Manual Verification (8 steps) → sub-plan 3.

**Derived Test Matrix (19 rows, each in exactly one child):** 11 rows → sub-plan 1 (T1.3, T2.2–T2.10, T5.2) · 5 rows → sub-plan 2 (T5.1, T5.3, T5.4, T3.4b, T3.6) · 3 rows → sub-plan 3 (T6.2, T7.1, T8.3). **11 + 5 + 3 = 19.**

**Human sign-off:** the two 👤 `HUMAN REVIEW REQUIRED` sections (§ Acceptance Scenario, § Breaking Changes & Naming Review) and their confirmation checkboxes live **in [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)** — they gate Gate 1, which gates the whole feature. Sub-plans 2 and 3 carry an **inherited sign-off block** restating the items that govern their own tasks (notably the narrowing of the "no `*_ATTEMPT` in prose" criterion) and add **no second checkbox**. One sign-off, one place.

---

## Where each partition line falls — and proof that none of them is the KN-26 seam

**The seam, stated exactly:** issue #58's central rule (KN-26 shape) is that fail-closed hardening **cannot ship without the derivation in the same change**. Hardening `decide_next`/`check_max` while any site still supplies a model-authored value converts "may silently overrun" into "**never retries**" — every retry route hard-fails. That is a _different wrong_, not a partial fix. The seam is therefore the edge **T3.1–T3.7 → T3.8**.

**Both partition lines were taken at gates the plan already contained** (Gate 2a and Gate 2b were authored in `plan-v3-checked.md`, not invented for this split), so the split lines are the plan's own seams.

<!-- prettier-ignore -->
| Line | Falls between | Is it the seam? | Proof |
| --- | --- | --- | --- |
| **1 → 2** | T5.2 (end of sub-plan 1) → T5.1 (start of sub-plan 2), at **Gate 2a** | **No.** | Gate 2a is by construction a **pure-addition** checkpoint: "primitives untouched", guard not yet hardened, no call site converted. Sub-plan 1 contains **neither half** of the pair — not T3.1–T3.7 and not T3.8. A boundary between two things cannot fall inside a pair that is entirely on one side of it. This is also the plan's only genuinely reversible-in-isolation block, which is why it absorbs the excess at 15 tasks. |
| **2 → 3** | T3.9 (end of sub-plan 2) → T4.1 (start of sub-plan 3), after **Gate 2b + T3.8 + T3.9** | **No.** | By the time sub-plan 3 starts, derivation **and** hardening have both already shipped, together, from sub-plan 2. Nothing downstream can re-separate them. The boundary sits *after* the pair, not through it. |

**Positive proof the seam is intact:** T3.0, T3.1, T3.2, T3.3, T3.4, T3.4b, T3.5, T3.6, T3.7, **Gate 2b**, **T3.8** and T3.9 are all in [`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) — one file, one execution session, one PR. Gate 2b is positioned **immediately before T3.8**, exactly as `plan-v3-checked.md` placed it, so it blocks at the seam it names rather than merely preceding T3.1.

### The 12-task cap yields to the seam — deliberately, in sub-plan 2

[`58-workflow-counters-plan-2.md`](58-workflow-counters-plan-2.md) is **14 tasks, 2 over the 12-task heuristic. This is a justified exception, not a quality miss.** Cutting it to 12 would put the cut somewhere inside T3.0–T3.9 — i.e. **exactly on the seam** — reproducing the precise regression #58/KN-26 exists to prevent. `plan-v3-checked.md`'s own text is explicit: _"Task order is load-bearing… do not reorder, do not split the PR along that seam."_ The ceiling yields; the seam does not. The child states this justification in its own opening CAUTION and instructs that it run as one uninterrupted session. **This tension is surfaced here for the human rather than silently resolved by cutting further.**

### Why T5.1 / T5.3 / T5.4 travel WITH WS-3 rather than ahead of it

A partition separating the rules from the conversion they police leaves **each half unverifiable**:

- **T5.1 and T5.3 must be RED before the conversion and green after.** A rule that has never fired is a rule with no evidence behind it — the Defect-4 shape (§ Breaking Changes item 6) the plan exists to indict. Their REDs _are_ the worklists: T5.3's → `unconverted-sites.txt` (T3.0's authority), T5.1's → `prose-violations.txt` (T4.1's authority).
- **T5.4 carries a recorded asymmetry: it cannot be RED-first like T5.1/T5.3.** Before WS-3 no block derives at all, so it has nothing to map. Its evidence is instead the **three temporary edits** its Done-when mandates (wrong step; short map; unmapped deriving block), each verified to red one at a time then restored. It therefore runs **after T3.7, before Gate 2b**, so its `COUNTER_STEP_MAP` can be diffed against `unconverted-sites.txt` at the gate.
- **T5.2 is the exception and lands in sub-plan 1**, because it polices the **config**, not the conversion, and has no RED-first coupling to WS-3. Its cross-sub-plan clause (the dead `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reference that T3.3 adds) is recorded as an expected RED and re-verified at sub-plan 2's Gate 2b.

### Other ordering constraints preserved across the split

- **WS-6 (delete the inert primitives) comes LAST** — issue constraint 5. It is in sub-plan 3, after every site is converted. Deletion before conversion is unsafe; its prerequisite is stated as a hard checkbox in that child.
- **WS-4 must not run early.** T4.1 deletes the prose instructing the model to substitute values; doing that while any of the 18 blocks is unconverted is **worse than the status quo** (`jq: invalid JSON text` → hard failure). It is gated on **T5.3 going green**, not merely on T3.1–T3.7 being ticked — recorded as a hard prerequisite in sub-plan 3.
- **T8.3's single batched `bkit install` is the last thing.** Several test paths were deliberately repointed template-relative (sub-plan 1's T2.0) **precisely so no per-edit `bkit install` is needed**. Sub-plans 1 and 2 each carry an explicit prohibition against running it to make their own gates pass; sub-plan 3 states T8.3 is the only install in the whole feature, and that a task appearing to need one earlier indicates a repoint defect, not a batching problem.
- **The RED window now spans a sub-plan boundary.** `tests/counter-failclosed.bats` is RED from sub-plan 1's Gate 2a until sub-plan 2's T3.8, and CI runs bats on every push. The no-push-vs-skip-tag choice is made at Gate 2a, recorded in sub-plan 1's handoff, and honoured (and the skip-tag removed) by T3.8 in sub-plan 2.

---

## The split is an execution boundary, NOT a PR boundary

> [!CAUTION]
> **Merge method: always squash. All three sub-plans land in ONE PR.** Non-negotiable per Breaking Changes item 1: WS-3's derivation and T3.8's fail-closed hardening are the two halves of the KN-26 pair and **must not be separable at the merge boundary**. Do not open a PR at the end of sub-plan 1 or 2. `bkit-ship.md` Step 5 is hardcoded to `gh pr merge --squash --delete-branch --body ""`.
>
> Each child repeats this rule in its own § Merge Method so no session can conclude otherwise from reading only its own file.

**Rollback (whole feature):** `git revert {SQUASH_SHA}` then `pnpm bkit install` to regenerate mirrors + `.bkit/version` hashes. Single squash commit; the revert restores the prose counters and the fail-open guard **together** — the KN-26 pair inverts cleanly, which is only true because both halves are in one sub-plan and one PR. No DB, no migration, no deploy, no risk window. Code-only.

## Handoff chain

Each child ends with a **Handoff** checklist naming exactly what the next session needs. The artifacts that cross boundaries:

<!-- prettier-ignore -->
| Artifact | Produced by | Consumed by |
| --- | --- | --- |
| `red-vs-dev.txt` | Sub-plan 1, T2.7 | Sub-plan 2's T3.9 (must still show the same failure) and sub-plan 3's Gate 4 / Manual Step 1. **Evidence, not a test — never regenerate it.** |
| T1.1's measured `{MEASURED_BYTES}` / `{MEASURED_MD5}` | Sub-plan 1, T1.1 | Sub-plan 1's T1.3 (asserts them). Measured from the tree, **not inherited** from #58's `1079` / `d04a2499…`. |
| RED-window option (no-push vs skip-tag) | Sub-plan 1, Gate 2a | Sub-plan 2's T3.8 (removes the skip-tag if one was used). |
| Documented REDs (T2.7 fail-open · T2.9 unhardened guard · T5.2 dead constant) | Sub-plan 1 | Sub-plan 2 — recognise as expected; **do not "fix" by hardening early or hardcoding a list.** Re-verified at Gate 2b. |
| `unconverted-sites.txt` (18 sites / 19 refs) | Sub-plan 2, T3.0 (generated by rule, not typed) | Sub-plan 2's T3.1–T3.7 (the authority for what to convert) and sub-plan 3's Manual Step 4d. |
| `prose-violations.txt` | Sub-plan 2, T5.1 (captured RED) | Sub-plan 3's T4.1 (the removal worklist). If absent, **stop** — a hand-list is what this plan rejects. |
| Gate 2b `[x]` | Sub-plan 2 | Sub-plan 3's T4.1 hard prerequisite. |
| `:335` converted | Sub-plan 2, T3.4 | Sub-plan 3's T7.1 (without it, honest provenance is grounded in a model-supplied value). |

## Patterns and doctrine carried into every child

These are restated in each child where they bite, so no session must read a sibling to act correctly:

- **Edit the SOURCE, never the mirror.** `.bkit/templates/.bkit/scripts/*.sh` → `.bkit/scripts/*.sh`; `.bkit/workflows/*.md` → `.claude/` / `.cursor/` / `.opencode/`.
- **The rule is the authority; hand-written line numbers are a convenience index.** A hand-list cannot be complete-by-construction and its blind spots correlate with the defect's (the shipped `EXPECTED_CONSTANTS` omits 6-of-7 — precisely the dead constant).
- **Four positions, not "repeat verbatim".** `counter_next` at start · `counter_current` after own write · `counter_count` when routing on a prior/not-yet-run step (**`0` is a legal answer**) · commit-subject clause **only** where the block already commits.
- **`bkit-debug.md:399` must NOT gain a commit** (KN-26, critical) — `debug-run-tests`'s `parentSha` advances transitively via Steps 4/5/6.
- **`DEBUG_ATTEMPT` stays CROSS-run** and its fold is **copied, not moved** (moving it kills every debug run at `debug-worktree-setup`).
- **ASCII operators only** in `.bkit/workflows/*.md` and `.bkit/prompts/*.md`.
- **No Architectural Downgrades:** never re-add `2>/dev/null`, never default a failed derivation to `0`, never weaken the prose audit to pass a stubborn line, never use `counter_current` at a position-4 site to make a `0` go away.

## Superseded artifacts

- [`plan-v3-checked.md`](plan-v3-checked.md) — the 37-task master this split partitions. **Retained as the source of record**; its content now lives across the three children. Do not execute it directly (it does not fit one session — see [`plan-complexity-check.md`](plan-complexity-check.md)).
- [`plan-complexity-check.md`](plan-complexity-check.md) — the `SPLIT` verdict and the 3-way partition this index adopts.
