# Brief: group 4 — The debug Loop Question's recommendation agrees with its trend line (tests)

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

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| The canonical shape in § Human questions puts each option on its own line with its effect | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The canonical shape carries a `Default if unanswered:` line from the fixed set, which holds `the run stops when nobody can be asked` and `the plan stops at Gate 1 until you answer` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The canonical shape gives a hard blocker `Recommended: none — {why}` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The canonical shape ends a message with the shared reply line and the "one by one" offer | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| RED-PROOF: a synthetic option line with no effect fires the option-line rule | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The `.bkit/workflows.md` § Question layout bullet points to § Human questions instead of restating the old layout | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The canonical shape keeps the plain-English rule for the question, each option and the recommendation's reason | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| No workflow carries the retired reply wording (`Reply per question. "yes" takes every recommendation.`, `"stop" writes a handover`) | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 4 |
| Build: the Decision Pause "yes" line uses the shared reply wording | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 4 |
| Every workflow that asks the owner (`bkit-design`, `bkit-plan`, `bkit-build`, `bkit-debug`, `bkit-ship`) states the question, each option and the recommendation's reason in plain English (`workflow-question-plain`) | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 4 |
| Build: every decision item option carries an effect | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 5 |
| Build: the pause message shows the default line and `Recommended: none` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 5 |
| Build: a "one by one" reply asks the questions one at a time | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 5 |
| Build: the "one by one" offer follows the count of questions asked in the message, not the count in the file | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 5 |
| Debug: the loop question gives each option its effect and the recommendation a reason | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Debug: when `LOOP_LIMIT` = true the loop question recommends `Stop` because the attempts set aside for this are used up, and every other branch because the last attempt left no fewer failures | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Debug: every question shows a `Default if unanswered:` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Debug: the branch check (exit 3 or 8) asks a formatted question | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Debug: the CI-reference stop (exit 8 or 82) asks a formatted question | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Debug: the branch check and the CI-run question each show `Recommended: none` and a `Default if unanswered:` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Debug: the CI-run question keeps the workflow lock held while the owner answers, and releases it only on `Stop` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Debug: the foreign-path stop shows the `**Action needed — {title}:**` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Debug: every question message ends with the reply line its point uses, the branch check and CI-run question with no "yes" half | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Ship: the assumed-item question gives each option its effect | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 7 |
| Ship: an assumed item is a hard blocker with `Recommended: none — {why}` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 7 |
| Ship: every question shows a `Default if unanswered:` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 7 |
| Ship: the merge question gives each option its effect | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 7 |
| Ship: every question message ends with the reply line its point uses | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 7 |
| Design: the grill question gives each option its effect and the recommendation a reason | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| Design: the draft-scenario question gives each option its effect | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| Design: every question shows a `Default if unanswered:` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| Design: the grill message ends with the shared reply line and the "one by one" offer | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| Design: a "one by one" grill round counts as the one grill turn it replaces | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| Design and plan: the one-by-one open-questions pass forbids the host question tool, and keeps each item's options, `Recommended` and `Default if unanswered` as written instead of asking the item verbatim | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| Every workflow's Step 1 ambiguous-issue stop (exit 8) asks a formatted question naming the issues | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 9 |
| Every workflow's Step 1 issue question shows `Recommended: none` and a `Default if unanswered:` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 9 |
| Every workflow's Step 1 slug stop (exit 3) and bare-number stop (exit 9) show the `**Action needed — {title}:**` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 9 |
| The Step 1 issue question re-runs `fids parse` on the owner's answer file | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 9 |
| The plan template puts each open-question option on its own line, and its default line offers `the plan assumes A` or `the plan stops at Gate 1 until you answer` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 10 |
| Every open-question rule in the prompts asks for one option per line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 10 |
| The design review flags an open question whose options share one line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 10 |
| The prompts index describes one option per line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 10 |
| No workflow, prompt, template or authoring doc carries an inline lettered `Options: A)` list | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 10 |
| Every open-question writer (`bkit-plan-generate`, `bkit-plan-update`, `bkit-design-generate`, `bkit-design-update`) asks for plain English | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 10 |
| bkit-debug: the loop question's recommendation reason matches its trigger | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 12 |
| debug Loop Question states the engine's trend line, never a fixed claim | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 12 |

### Planned tests that already exist

- TASK 12 `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the loop question's recommendation reason matches its trigger` — exists at `.bkit/core/engine/audits/workflows/question-option-format.test.ts:723`; update that test in place: add expectations, never remove or loosen one
- TASK 12 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Loop Question states the engine's trend line, never a fixed claim` — exists at `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:2145`; update that test in place: add expectations, never remove or loosen one
