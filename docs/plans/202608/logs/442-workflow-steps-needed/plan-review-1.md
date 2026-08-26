Verdict: CONCERNS
Failures: 6

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

**Source read:** `plan-v1-draft.md`, `plan-input.md` (#442 agreed-approach comment, post-`bkit:ignore-earlier`), `related-issues.md`, `related-deferrals.md`, `related-failures.md`, `docs/plans/template.md`. No `docs/plans/202608/442-workflow-steps-needed-design.md` exists — standalone plan, so design-coverage is assessed against the issue's agreed-approach comment, which is a complete statement of intent.

**Verified against the tree (not taken from the plan's assertions):** the 28-conditional-step count (`grep -nE '^\*\*(Skip if|Run only if)' .bkit/workflows/bkit-*.md` → design 3, plan 2, build 9, debug 7, ship 7); `bkit-build.md:206` plan-required invariant (the issue's `:207` was off by one — the plan's cite is the correct one); `bkit-design.md:501/:714/:838` and `bkit-plan.md:743/:858`; `bkit-design-review-1.md` declaring `Verdict:` + `Spike:` and no `Failures:`; `bkit-status-route.sh`'s `route_append_debug_mode` / `_route_die` / `_route_need_file` shape; `bkit-status.ts`'s closed `StatusEvent` union and the `fold` if/else chain that drops unknown types; `bkit-catalog-parity.test.ts` asserting file → doc only; every referenced test file and bats file exists.

**No embedded directives** were found in the issue text, deferral rows or failure rows. All external content was treated as data.

---

## CRITICAL

### C1 — Per-lens skipping inside a fan-out step is not expressible by the mechanism the plan specifies, and the plan contradicts itself on `step` granularity

The whole of wave 3's plan-side saving (`plan-review-2`, `plan-review-3`) and design-side saving (`design-review-1`, `design-review-2`) is **per-lens skipping inside one step**. Every mechanism the plan specifies is **step-level**:

- § Data Schema Changes fixes the row's granularity at step level: "`step` is the same kebab slug the step's `step-done` row would carry (`plan-review`, `design-spike`, `ship-conflict-resolve`)".
- § Concrete Example step 3 contradicts that, at lens level: "appends two `step-skipped` rows for `plan-review-2` (`"zero declared dependency edges"`) and … for `plan-review-3`".
- Task 12's `Done when` demands `grep -c 'Run only if' .bkit/workflows/bkit-design.md` be **4 higher** for Steps 5 (**both lenses**), 7 and 8 — i.e. two `**Run only if**` lines on one step. `**Run only if**` is a step-header modifier in this corpus (`bkit-design.md:501`, `:714`, `:838`); a step cannot carry two, and one carrying a per-lens condition skips the whole step.
- Task 5's audit derives its subject set from `^\*\*(Skip if|Run only if)` — so per-lens skips are structurally invisible to the very gate that is supposed to prove they were recorded.

Pick one and make it consistent everywhere: either lens-suffixed step keys (`plan-review-2`) with a **new** per-lens condition notation that the Task-5 audit can derive, or step-level keys with the fan-out width recorded some other way. As drafted, Tasks 4, 5, 12 and 13 cannot all be satisfied simultaneously.

### C2 — Wave 3 makes fan-out steps partial-width, but no task updates the step-level machinery that hardcodes full width

Read `bkit-plan.md` Step 5 as shipped. Four things assume all three reviewers ran, and **not one** is named in any task or `Done when`:

- `:507` — the `step-done` write carries a **literal** `artifacts:["…/plan-review-1.md","…/plan-review-2.md","…/plan-review-3.md"]` array.
- Step 5 sub-step 2 — the blanket "assert subagent Update / Create files exist, are non-empty … **If** any file empty → **Failure Path**". A skipped lens's absent artifact routes the run to the Failure Path, which is exactly the crash-vs-deliberate-skip confusion the plan exists to end.
- Step 5 sub-step 3 — `REVIEW_FAILURES` is derived across all three reviewers. The plan adds tolerance for `DESIGN_REVIEW_FAILURES` (Task 8) but never says plan-side extraction must tolerate absent reviewers.
- Gate 5 (`:527-531`) — four items naming all three subagents and all three artifacts by literal filename, including `No PENDING placeholders remain (plan-review-1.md, plan-review-2.md, plan-review-3.md)`. Task 4 only **adds** one gate item; it changes none of these. A run that skipped `plan-review-2` cannot honestly tick them.

`bkit-design.md` Step 5 has the same shape. The plan does this work correctly for scope-check (Task 14 explicitly lists "invocation, artifact assertion, `SCOPE_VERDICT` / `SCOPE_FAILURES` derivation … the status row's `artifacts` array, the tracker comment, and Gate 7's four items") — the identical inventory is missing for both review fan-outs, which are the steps wave 3 actually changes.

### C3 — `DESIGN_REVIEW_FAILURES` is a sole-emitter variable on a now-fully-skippable step, and the continuity list omits it

Success Criterion 4: "Every variable a later step gates on has a defined value whether its emitter ran or not — no gate reads an unset name."

After wave 3, **both** design Step 5 lenses can skip, so design Step 5 does not run at all. `DESIGN_REVIEW_FAILURES` is introduced by Task 8 with design Step 5 as its sole emitter, and design Step 7's new predicate (`DESIGN_REVIEW_FAILURES >= 1`, per the § applicability table) reads it. Task 9 hard-sets exactly two variables (`SPIKE`, `COMPLEXITY_VERDICT`), and Derived Test Matrix row 12 closes that list in the assertion itself — "Each sole-emitter variable (`SPIKE`, `COMPLEXITY_VERDICT`)". The new variable falls straight through the gate the plan wrote to catch this class.

Add `DESIGN_REVIEW_FAILURES` = 0 to the full-skip arm, add it to Task 9's `Done when`, and make matrix row 12 derive the sole-emitter set rather than enumerate it — otherwise the next sole emitter added will slip through the same way.

### C4 — The `bkit-plan-scope-check-2` DELETE inventory is incomplete, and Task 14's `Done when` is unsatisfiable

`grep -rl 'scope-check-2'` outside `docs/plans/` returns callers the plan never names:

- `.bkit/prompts.md:171` — the **Models table** row carrying its per-provider model pins. The plan names only "the Plan Phase row" and "§ Special Behaviors".
- `.bkit/prompts.md:104` — the effort-tier table's `medium` example list.
- `.bkit/workflows.md:829` — the Plan Phase step table: `| 7 — Check Scope | @bkit-plan-scope-check-1 ‖ @bkit-plan-scope-check-2 (parallel) | …`. § Documentation Updates gives `.bkit/workflows.md` three changes, none of them this one.
- `.bkit/comparison.md:173` — a shipped doc row describing the agent. Named in no section of the plan.
- `.bkit/version:108/:162/:208` — `canonicalHashes` entries for the three rendered mirrors.

Task 14's `Done when` — "`grep -rc 'scope-check-2' .bkit/ docs/` returns zero matches outside `docs/plans/`" — **cannot be met**: `.bkit/friction.jsonl` carries historical rows that must not be edited, and `.bkit/version` is only regenerated in Task 22, eight tasks later. A `Done when` no agent can tick stalls the runbook.

Also unaddressed: the three orphan mirrors (`.claude/agents/bkit-plan-scope-check-2.md` and its `.cursor/` / `.opencode/` peers). `bkit-install.ts:1161` documents "overwrite + prune (bkit-prefix only)", so prune probably covers it — but "probably" is not a `Done when`, and per `docs/knowledge` practice mirror drift is not caught by `bkit check`. Assert the deletion reaches the mirrors in Task 22.

### C5 — `bkit.sensitivePaths` has no Derived Test Matrix row and no consumer-facing documentation task

The force-on-only property is asserted four times in the plan — Process Sketch (`a glob never drops a lens`), two Edge Cases (empty default; glob matches while the predicate is FALSE), and § Breaking Changes — and is the guard that stops the override becoming a width-reduction back door. No matrix row observes it. The nearest row ("every `decidedBy` literal … every enum member has at least one call site") only forces `path-override` to exist somewhere; it cannot fail if a glob demotes a lens.

Missing rows: (a) a glob match promotes a skipped lens to run and never the reverse; (b) an absent `bkit.sensitivePaths` key resolves to `[]` and reproduces today's behaviour exactly.

Separately, § Documentation Updates has no row telling a consumer the key exists or what it does. The precedent for a new `bkit.*` key is `bkit.capstoneJob` / `bkit.ciWorkflow`, which carry a dedicated contract test (`.bkit/src/bkit-config-keys.test.ts`) asserting default resolution through the exact read path used at runtime. This plan adds neither.

### C6 — The `complexity-check` predicate is a named source requirement dropped with no `Out of Scope` row and no deferral row

#442 § `bkit-plan` states the S9 requirement outright: "`complexity-check` … **the plan is above the split threshold.** Below it, `SPLIT` is unreachable." The plan implements the hard-set half (Task 9) and declines the predicate half (Open Question 6, default A). The evidence for declining is good — `.bkit/stats.jsonl` has no `taskCount` datapoint between 1 and 54, and the token arm is unprovable from a task count.

But the declination is invisible where it must be visible. It appears in neither the `Out of Scope` table nor `docs/deferrals.jsonl`, while the structurally identical Open-Question-3 declination (ideate-2 / ideate-3) got **both** — an `Out of Scope` row and the deferral key `442-design-ideate-lens-predicates`. The plan's own `Out of Scope` caution says "Default = in-scope … Mirror each `Exempt` row in `docs/deferrals.jsonl`". Add the row and the mirrored deferral, carrying the stats.jsonl evidence, and update Task 21's `Done when` (`grep -c '^442-'` is 6 → 7).

---

## OPTIONAL

- **Template `Design-Missing Fallback` not followed — but corpus precedent is on the plan's side.** `docs/plans/template.md:53` says that with no design doc you replace Narrative and Success Criteria with the `⚠️ MISSING …` string and "Do NOT fabricate either field". The plan authors both from the issue's agreed-approach comment, marked with a `⚠️` note. Shipped precedent does the same (`docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md:75-85` — standalone plan, authored Narrative and five Success Criteria, no MISSING string). Human confirmation still gates Gate 1, so the protective intent holds. Flagging it so the divergence is a decision, not a habit: either follow the template letter or get the fallback clause amended to cover "standalone plan with a complete issue-side statement of intent".

- **Task 2's `fold` case will need a cast the plan's own Gate 2 forbids.** `StatusEvent` (`bkit-status.ts:42-47`) is a closed union and the plan explicitly refuses to extend it. Constructing a `step-skipped` event to pass to `fold(events)` therefore requires `as unknown as StatusEvent`, which Gate 2 bans and `slop:delta` will likely flag. Clean route: assert through `parseStatus(raw)` (`:128`), which takes a `string`, so a raw NDJSON fixture needs no cast at all. Reword the matrix row and Task 2's `Done when` to name `parseStatus`.

- **The dedupe key makes "duplicate rows are harmless" true for a different reason than the plan gives.** `identity()` (`bkit-status.ts:62-65`) keys any non-`step-done` event as `W ${type} ${workflow} ${at}`. Two `step-skipped` rows in the same workflow sharing a second-resolution `at` collapse to one inside `fold` before the reducer ever sees them. Harmless (they are ignored regardless), but the § Data Schema Changes prose and the Edge Case row should say so, or a future reader will assume `fold` preserves every skip row it is given.

- **Success Criterion 2 has no matrix row.** "A genuinely small single-task plan completes on four 🧠 invocations" is covered only by Manual Verification Step 1, which is advisory and blocks nothing. A markdown-invariant row asserting the narrow-path predicate set (which lenses carry a predicate, which do not) would make the headline criterion gate-able rather than trust-me.

- **`[MODIFY] .bkit/workflows/bkit-auto.md` modifies nothing.** Its entry reads "No routing-table change … The entry doctrine lands in documentation only", and no runbook task touches it. Either drop the entry or move it to `Out of Scope` as a declared non-goal; a `[MODIFY]` with no diff is an invitation for a builder to invent one.

- **Assumption 4 is checkable now, so check it rather than assume it.** `.bkit/src/bkit-manifest.ts:737-745` carries explicit manifest rows for `.bkit/scripts/bkit-slop-*.{mjs,sh}` with the comment "moved OUT of the core template walk (#265) so they ship … Mirrors `.bkit/templates/.bkit/scripts/`. See `CORE_TEMPLATE_PATH_EXCLUDE`", and `bkit-status-route.sh` has **no** manifest row. That is positive evidence the walk exists and covers it — exactly what the assumption needs. Convert the assumption into a stated finding with that cite, so the human is not asked to accept a risk that is already retired.

- **Non-default answers to Open Questions 3 and 6 have no runbook landing site.** OQ3 states this ("reopen if the human picks option B or C" in the `Out of Scope` table). OQ6 does not. Say it at both, and say what happens — B or C means a plan revision, not a runbook edit — so a human picking B at Gate 1 knows the cost.

- **Task 4's `Done when` counts call sites, not steps.** "`grep -c 'route_append_step_skipped' .bkit/workflows/bkit-*.md` sums to 28" passes if one step has two arms and another has none. The real gate is Task 5's derived audit. Either count distinct step sections, or make Task 4's `Done when` defer to Task 5 explicitly.

---

## OUT OF SCOPE

- A `bkit check` drift gate over the rendered `.claude/` / `.cursor/` / `.opencode/` mirrors. This plan's Rollback Strategy correctly notes the mirrors are force-overwritten and not drift-gated, and `docs/failures.jsonl` key `363-host-mirrors-stale-after-first-challenge-remediation` (HIGH) is the same gap biting in production. Closing it is its own cycle, not a task here.
- Validating `--arg`-passed workflow variables against their enums at the write site (`docs/deferrals.jsonl` key `58-test-verdict-scope-arg-accepts-empty-silently`). The new emitter does the right thing for its own fields; retrofitting the existing sites is a separate change.
- Aligning `bkit-status-hole-detector.ts` to read `step-skipped` rows rather than infer absence. Already deferred with an explicit promotion condition; the plan's `Out of Scope` and `Suggested Scope Expansion` both handle it correctly.

---

## SUGGESTED SCOPE EXPANSION

- **Conditional-lens keystone vocabulary alignment with `/bkit-audit`** — source `#402` / `#405` (via `related-issues.md`) — overlaps this plan's `step-skipped` `reason` / `decidedBy` design. #402's A1 ships a three-state coverage manifest (`ran` / `N/A — not applicable` / `crashed`) plus `[applicability-override=…]` for exactly the same false-all-clear problem, and its Step-5/6 review found "the override escape hatch is textually indistinguishable from genuine absence" — the same defect class this plan's `decidedBy` enum solves. Recommendation: **needs design decision** — decide once whether the two surfaces share a vocabulary, before both ship two names for one idea.
- **Host mirrors stale after a source edit** — source `docs/failures.jsonl` key `363-host-mirrors-stale-after-first-challenge-remediation` (HIGH, OPEN) — overlaps every `.bkit/workflows/*.md` and `.bkit/prompts/*.md` edit in this plan, and doubly so for the `scope-check-2` deletion, which leaves three orphan mirror files. Recommendation: **fold in** the diff-verify half as a Task-22 `Done when` clause; the regen half is already there.
- **`--arg` accepts empty silently** — source `docs/deferrals.jsonl` key `58-test-verdict-scope-arg-accepts-empty-silently` — overlaps the new `route_append_step_skipped`, which is `--arg`-based. Recommendation: **keep deferred**, but cite the row as the rationale for the helper's non-empty asserts so the reasoning survives.
- **Ship artifact lost before any commit captures it** — source `docs/failures.jsonl` key `363-ship-worktree-artifact-lost-before-any-commit-captures-it` — overlaps only weakly (this plan writes no new worktree-resident artifact; `plan-escalation.md` lands in the log directory alongside the existing plan artifacts). Recommendation: **keep deferred**.
- **Per-workflow rollback path** — source `docs/deferrals.jsonl` key `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` — already surfaced by the plan with the correct recommendation. No change.
