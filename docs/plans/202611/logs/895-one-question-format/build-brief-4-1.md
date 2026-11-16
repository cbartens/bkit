# Brief: group 4 — The debug Loop Question's recommendation agrees with its trend line

Plan: One Shared Question Format Implementation Plan

## Why and what

### Context & Goals

bkit asks its owner questions at 11 points across `/bkit-design`, `/bkit-plan`, `/bkit-build`, `/bkit-debug` and `/bkit-ship` (the audit table in #895). The points use four different layouts:

<!-- prettier-ignore -->
| Layout today | Points | What the owner cannot see on the page |
| --- | --- | --- |
| One question at a time, an inline `Options: A) {option} — {trade-off} · B) …` list, `Recommended`, `Default if unanswered` | #3, #4 (design and plan open questions) | Nothing missing; this is the layout the issue keeps |
| One message, bare labels (`Options: A) Accept / B) Fix now`), `Recommended:` or `No recommendation` | #1, #2, #5, #6, #10, #11 | What each option does, and what happens when nobody answers |
| A **STOP** that names the problem and asks for a branch or reference | #7, #8 | The options, the recommendation and how to resume |
| A **STOP** that asks for a commit or a revert | #9 | What to type to continue |

The build's decision files are read back by code. `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts` splits one `Options:` line on `/` and matches the bare option names (`Accept`, `Fix now`, `Try again`), and `apply`, `pending`, `summary.ts`, `summary-findings.ts` and `challenge.ts` all read its output. The layout change therefore has to keep those names parseable, and has to keep reading decision files that runs already in progress wrote in the old layout.

Goals:

- One question shape, defined once in `.bkit/authoring.md` § Human questions (source `.bkit/core/.bkit/authoring.md`), used at all 11 points.
- `bkit decisions compose` writes the shape from a `decision-items.json` whose options each carry an `effect`; `parseDecisionItems` reads both layouts.
- The plan and design open-question writers (`bkit-plan-*`, `bkit-design-*` prompts and the plan template) write one option per line.
- The question-format audit (`.bkit/core/engine/audits/workflows/question-option-format.test.ts`) checks the new shape across workflows, prompts, templates and authoring docs.
- The five workflows' Step 1 issue-and-branch stops (`fids parse` exit 3, 8 and 9) take the shape too: the exit 8 stop becomes a formatted question, and the exit 3 and 9 stops become `**Action needed**` lines (Q5, option A).

The shared shape, from #895:

```
**Q{n} — {title}:** {what you are deciding, in plain English, worded so "yes" takes the recommendation}
A) {option} — {what happens if you pick it}
B) {option} — {what happens if you pick it}
Recommended: A) {option} — {why}
Default if unanswered: {what happens}
```

Once at the end of every message: `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.` When a round has 3 or more questions, the footer adds `Or say "one by one" and I'll ask them one at a time.`

**Related Issues:**

- #895 — One question format for every owner question in the workflows (OPEN)
- #703 — Standardise question and option labels in prompts and workflows (CLOSED)
- #798 — Record owner answers to open questions after design and plan close (CLOSED)
- #750 — Workflow optimisation (OPEN)

---

### Narrative

Every question point in every workflow uses one shared question shape. The owner can answer any of them from the page alone: what is being decided, what each option does and costs, what is recommended and why, and what happens if they don't answer.

### Success Criteria

- The shared question shape (below) is defined once in `.bkit/authoring.md` § Human questions plus a shared clause in `.bkit/instructions.md`, and every row in the audit table, and the Step 1 issue stops, use it.
- Each option is on its own line with what happens if it is picked, including the fixed-option pauses (#5, #6, #10, #11).
- Each question has a `Default if unanswered:` line saying what actually happens.
- Each recommendation carries a reason.
- `bkit decisions apply` and `decisions pending` read decision files in both the new layout and the old single `Options:` line layout.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The plan template's `👤 ✅ Human Confirmation` checkboxes (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions confirmed) | No Success Criterion or matrix row needs them: the owner ticks them in the plan file, so they are a document gate, not a chat question | #895 § Constraints and non-goals; `docs/deferrals.jsonl` `895-plan-human-confirmation-checkboxes-stay-a-document-gate` |
| When the workflows pause, the `bkit.workflows.*` limits, and what an answered decision does (including what "stop" does at the grill and at ship's Confirm Assumed Items) | The change is the question layout only; no Success Criterion needs a routing change | #895 § Constraints and non-goals; `docs/deferrals.jsonl` `895-pause-timing-limits-and-answer-effects-unchanged` |

Not questions, so outside the shape by #895's own audit: the `--suggest` "ask me one by one" offer and the "plain English explanation" offer in the final returns, and every subagent prompt (subagents cannot reach the owner).

## Where it fits

- Group 1: Decision files in the shared shape — done
  - TASK 1: Read one option per line and `Recommended: none` in `parseDecisionItems`, keeping the old `Options:` line — done
  - TASK 2: Write the shared shape with `decisions compose`, from options that each carry an `effect` — done
- Group 2: One definition of the question shape and its reply-line clauses — done
  - TASK 3: Define the shared question shape once in `.bkit/authoring.md` § Human questions, and point § Question layout at it — done
  - TASK 4: Put the reply line's wording and the widened plain-English rule into their clauses before any carrier edit — done
- Group 3: Every workflow question point in the shape — done
  - TASK 5: Put the build's Decision Pause (#5) in the shared shape — done
  - TASK 6: Put debug's Loop Question (#6), branch check (#7) and CI-run lookup (#8) in the shared shape, and give the foreign-path stop (#9) the `Action needed` line — done
  - TASK 7: Put ship's Confirm Assumed Items (#10) and Merge Question (#11) in the shared shape — done
  - TASK 8: Put the design grill (#1), draft scenario (#2) and the design and plan one-by-one pass (#3, #4) in the shared shape, and add `bkit-design` to the reply-line clause — done
- Group 4: The debug Loop Question's recommendation agrees with its trend line — this group
  - TASK 12: Give the debug Loop Question's non-limit recommendation a reason that holds on every trend that reaches the question — open
- Group 5: Step 1 stops, open questions one option per line, and the installed copies — next
  - TASK 9: Put the five workflows' Step 1 issue-and-branch stops in the shared shape (Q5, option A) — open
  - TASK 10: Write plan and design open questions one option per line, in plain English — open
  - TASK 11: Re-render the installed copies, the build output and the graph register — open

## The work

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Give the debug Loop Question's non-limit recommendation a reason that holds on every trend that reaches the question
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Loop Question step 3's recommendation, first match wins: **If** `LOOP_LIMIT` = true → `Recommended: A) Stop — the attempts set aside for this are used up` (unchanged); **Else** → `Recommended: A) Stop — the attempts so far have not brought the failures down through a code change`. The **Else** branch is reached only on the `stuck` trend (the count did not fall, or it fell with no source code change) and the `worse` trend, and this reason is true on all three
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: `bkit-debug: the loop question's recommendation reason matches its trigger` expects the new **Else** reason and that the Loop Question holds no `left no fewer failures`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: `debug Loop Question states the engine's trend line, never a fixed claim` checks the whole Loop Question section for `left no fewer failures` again, not only its `**Q1 — ` lines (`:2145-2151`)
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions `bkit-debug` entry for the edited recommendation line, when one carries it
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with `-u`, its diff matching the source edit
  - **READ:** `loopTrend` in `.bkit/core/engine/commands/workflow/counters.ts`: `stuck` covers both an unchanged count and a fall with no code change, and the trend lines at `:465-480` word each case
  - **READ:** `docs/plans/202611/logs/895-one-question-format/build-decision-1-3.md`: the owner's decision on this gap
  - **DEPENDS ON:** 6
  - **DONE WHEN:** the two tests below pass; `pnpm vitest run .bkit/core/engine/audits/workflows/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/tools/` passes; `pnpm prettier --check .bkit/core/workflows/bkit-debug.md` passes; `grep -c 'left no fewer failures' .bkit/core/workflows/bkit-debug.md` prints 0
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the loop question's recommendation reason matches its trigger` fails on the **Else** recommendation still saying "the last attempt left no fewer failures", which is false when the count fell with no code change
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Loop Question states the engine's trend line, never a fixed claim` fails on the Loop Question section still holding the fixed "left no fewer failures" claim on its recommendation line

<!-- bkit:task 12 end -->

### Earlier tasks this group depends on

- TASK 6 (group 3, done): Put debug's Loop Question (#6), branch check (#7) and CI-run lookup (#8) in the shared shape, and give the foreign-path stop (#9) the `Action needed` line — `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts`, `.bkit/instructions.md`, `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`, `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Shared reply line across workflows | `.bkit/instructions.md` | `grep -n 'Reply per question\|host question tool\|"yes" takes every\|"stop" writes a handover' .bkit/instructions.md`; `pnpm instructions:show --file bkit-debug` | `workflow-yes-takes-all` clause (`"yes" takes every recommendation.`, carriers `bkit-build`, `bkit-debug`, `bkit-ship`) and `workflow-stop-writes-handover` clause (`"stop" writes a handover; the run can be resumed.`, carriers `bkit-debug`, `bkit-ship`) hold the old reply line's sentences; `workflow-plain-text-questions` (carriers all but `bkit-auto`, `bkit-plan`), `workflow-letter-reply` and `workflow-record-reply` clauses | EXTEND | Fold `workflow-yes-takes-all` into a `workflow-question-reply-line` clause carrying the new lead sentence (old text in `retired`); reword `workflow-stop-writes-handover` to the new stop sentence (its current text and the previous wording `"stop" ends here with a handover; the run can be resumed.` in `retired`); both before the first carrier edit (Task 4); widen `workflow-plain-text-questions` to `bkit-plan` |
| Formatted Step 1 issue-and-branch stops in the five phase workflows | `.bkit/instructions.md` | `grep -n 'names more than one issue\|lowercase-slug\|only a bare number' .bkit/instructions.md .bkit/core/workflows/*.md`; read `fids parse` exit 8 output (`fids.ts:744`, `:781`, prints `ambiguous`) | `workflow-issue-id-parse-ambiguous`, `workflow-issue-id-parse-slug` and `workflow-fid-bare-number` clauses (carriers all but `bkit-auto`) | EXTEND | Reword the three clauses (old text in `retired`); `pnpm instructions:sync` rewrites all five carriers |
| Plain English for the question, each option and the recommendation's reason in every workflow that asks the owner | `.bkit/instructions.md` (`workflow-question-plain`), `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/.bkit/authoring.md` | `grep -n 'in plain English' .bkit/instructions.md .bkit/core/workflows/*.md .bkit/core/.bkit/authoring.md`; `grep -n -A3 '^### workflow-question-plain' .bkit/instructions.md` | `workflow-question-plain` clause (carriers all but `bkit-auto`, `bkit-plan`; copies at `bkit-build.md:134`, `bkit-debug.md:131`, `bkit-ship.md:372`, `bkit-design.md:273`), which names the decision and each option but not the recommendation's reason; § Human questions plain-English bullet (`authoring.md:641`), same gap | EXTEND | Widen the clause text to the recommendation's reason (old text in `retired`) and its carriers to `bkit-plan` (Task 4); widen the § Human questions bullet to match (Task 3) |
| Plain English in subagent-written open questions | `.bkit/instructions.md` (`prompt-open-questions-plain`), `.bkit/core/prompts/bkit-plan-generate.md`, `bkit-plan-review-1.md`, `bkit-plan-scope-check.md`, `bkit-plan-update.md`, `bkit-design-generate.md`, `bkit-design-update.md` | `grep -ln 'plain English' .bkit/core/prompts/*.md` (hits only `bkit-audit-generate` and the `bkit-utility-update-*` prompts, none about open questions); `grep -n '^### .*plain' .bkit/instructions.md` (`plain-english-answers`, `plain-english-append`, `workflow-plain-english-offer`, `workflow-question-plain`, `workflow-plain-text-questions`: none is a prompt clause for open questions) | None covers open questions in prompts; the `plan-open-questions` clause sets the open-question shape for the four plan prompts | EXTEND | Add the `prompt-open-questions-plain` clause to `.bkit/instructions.md` § Clauses, because one sentence shared by two or more prompt files with no clause is an `unlistedShared` finding (`SHARED_MIN.prompt` = 2, `.bkit/core/engine/tools/instructions.ts:90-95`, `:917-941`); place one carrier line in each of the six prompts (Task 10) |
| Formatted questions at the debug branch and CI-run stops (#7, #8) | `.bkit/core/workflows/bkit-debug.md` | `grep -n 'STOP' .bkit/core/workflows/bkit-debug.md`; read `branches parse` (`.bkit/core/engine/commands/workflow/branches.ts`) and `runs locate` (`.bkit/core/engine/commands/workflow/runs.ts`) exit codes | `branches parse` exit 3 / 8 and `runs locate` exit 8 / 82 already print the candidates and validate a named branch or reference | EXTEND | Reword the two routes as questions; re-run the same verbs on the owner's answer (Q3), so no new engine verb |

Reuse Inventory rows left out: 3; Architecture entries left out: 3 — read them in docs/plans/202611/895-one-question-format-plan.md § Reuse Inventory and § Architecture & Component Changes.
