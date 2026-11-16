# Brief: group 2 — One definition of the question shape and its reply-line clauses (tests)

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
- Group 2: One definition of the question shape and its reply-line clauses — this group
  - TASK 3: Define the shared question shape once in `.bkit/authoring.md` § Human questions, and point § Question layout at it — open
  - TASK 4: Put the reply line's wording and the widened plain-English rule into their clauses before any carrier edit — open
- Group 3: Every workflow question point in the shape — next
  - TASK 5: Put the build's Decision Pause (#5) in the shared shape — open
  - TASK 6: Put debug's Loop Question (#6), branch check (#7) and CI-run lookup (#8) in the shared shape, and give the foreign-path stop (#9) the `Action needed` line — open
  - TASK 7: Put ship's Confirm Assumed Items (#10) and Merge Question (#11) in the shared shape — open
  - TASK 8: Put the design grill (#1), draft scenario (#2) and the design and plan one-by-one pass (#3, #4) in the shared shape, and add `bkit-design` to the reply-line clause — open
- Group 4: Step 1 stops, open questions one option per line, and the installed copies — later
  - TASK 9: Put the five workflows' Step 1 issue-and-branch stops in the shared shape (Q5, option A) — open
  - TASK 10: Write plan and design open questions one option per line, in plain English — open
  - TASK 11: Re-render the installed copies, the build output and the graph register — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Define the shared question shape once in `.bkit/authoring.md` § Human questions, and point § Question layout at it
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: § Human questions states, one bullet each, who asks and how (orchestrator only, plain text, never a subagent or a host question tool, at every point); the shape; the plain-English rule `Say what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.`; the closed `Default if unanswered:` set (`the run waits for you`, `taken as A when nobody can be asked`, `the run stops when nobody can be asked`, `the plan assumes A`, `the plan stops at Gate 1 until you answer`, `the design assumes A`, `written as a needs-decision deferral`) and the `; ` join (Q1); the dropped "yes" half at a point that never has a recommendation (Q2); the one mid-run `Stop` wording `Stop — the run ends here with a handover; the next run resumes here`, and the Step 1 `Stop — nothing changes; the run can be started again`; `Recommended: none — {why}` and that "yes" never answers it; the reply line and the "one by one" line from 3 questions on, with the point-true "stop" sentence (Q2); the "one by one" route, which counts as the one turn or pause it replaces and follows the count of questions asked in the message; the `**Action needed — {title}:** {what to do}. Then say "continue".` line; no status rows before a status file exists, with the fixed wait wording `end turn → wait for the answer; no status file yet`; the build verify-gap and debug Loop Question examples in the new shape
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `**Question layout**` bullet under `/bkit-build` § Ask points keeps the attempt line, the option names and the `optionAnswer` sentence, and points to `.bkit/authoring.md` § Human questions instead of restating `Options: A) … / B) …` and the old reply line
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: `optionLists` and `scanCounts` also count per-line option blocks, so `counts the option lines found per directory` holds while the text moves over; `RECOMMENDED_LETTER` accepts `none — `; `layoutBullet` and `the canonical layout letters every option and recommendation` read § Human questions; the seven tests below
  - **READ:** `.bkit/core/.bkit/authoring.md`: § Which Sections Apply and § Before You Save, the authoring checklist for this edit
  - **DONE WHEN:** the seven tests below and every other test in `question-option-format.test.ts` pass; `pnpm tsx .bkit/core/engine/tools/instructions.ts` (no flag) reports nothing to fix, then `pnpm vitest run .bkit/core/engine/tools/` passes; § Human questions has no `Options:` line and no `No recommendation` line
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape puts each option on its own line with its effect` fails on § Human questions still showing the inline "Options: A) {option} / B) {option}" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape carries a Default if unanswered line from the fixed set` fails on § Human questions holding no "Default if unanswered:" line, where the set must hold all seven phrases, `the run stops when nobody can be asked` and `the plan stops at Gate 1 until you answer` among them
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape gives a hard blocker Recommended: none` fails on § Human questions naming "No recommendation" in its place
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape ends a message with the reply line and the one-by-one offer` fails on § Human questions having no "one by one" offer
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `RED-PROOF: an option line with no effect fires the option-line rule` fails on a synthetic `A) Accept` line with no `—` reporting no violation
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the Question layout bullet points to § Human questions` fails on the bullet restating "Options: A) … / B) …"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape keeps the plain-English rule for the question, each option and the recommendation's reason` fails on § Human questions not naming "the reason for the recommendation" with "in plain English"

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Put the reply line's wording and the widened plain-English rule into their clauses before any carrier edit
  - **UPDATE:** `.bkit/instructions.md`: § Clauses — add `workflow-question-reply-line` (workflow, where-used; carriers `bkit-build`, `bkit-debug`, `bkit-ship`) with the text `Reply with a letter per question, or "yes" to take every recommendation.`, and fold `workflow-yes-takes-all` into it (its text `"yes" takes every recommendation.` in the new clause's `retired`, the old entry removed)
  - **UPDATE:** `.bkit/instructions.md`: § Clauses — reword `workflow-stop-writes-handover` to `"stop" ends here with a handover; the next run resumes here.`, with both its current text (`"stop" writes a handover; the run can be resumed.`) and the previous wording (`"stop" ends here with a handover; the run can be resumed.`) in `retired`; neither retired text is a prefix of the new text, because each one differs from it before its end (`docs/knowledge.jsonl` `wording-retired-prefix-of-new-text-and-loose-list-items`)
  - **UPDATE:** `.bkit/instructions.md`: § Clauses — reword `workflow-question-plain` to `State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.`, with its current text (`State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier.`) in `retired`; the old text is not a prefix of the new text, because the two differ at "decide and" / "decide," (`docs/knowledge.jsonl` `wording-retired-prefix-of-new-text-and-loose-list-items`)
  - **UPDATE:** `.bkit/instructions.md`: § Clauses — `workflow-question-plain` carriers become `workflow all except bkit-auto`; the mode stays where-used, so the sentence appears exactly once per carrier; `pnpm instructions:sync` rewrites the copies in `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md` and `bkit-design.md`, and `bkit-design.md` keeps its single copy at the grill (`:273`)
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: Step 8 sub-step 7 (the one-by-one open-questions line, `:510`) carries the widened `workflow-question-plain` sentence right after that line's clause sentence, its one copy in the file
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the Loop Question reply line (`:139`) reads the two clause sentences, with no `Reply per question.` left before them
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the Merge Question reply line (`:696`) reads the two clause sentences, with no `Reply per question.` left before them
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 4's "yes" line (`:180`) carries the `workflow-question-reply-line` sentence
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions `bkit-build`, `bkit-debug` and `bkit-ship` entries for the three edited reply lines
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions `bkit-plan` entry for the Step 8 sub-step 7 line
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `-u`, its diff matching the clause sync and its `No tracker connected` count unchanged
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with `-u`, its diff matching the clause sync and its `No tracker connected` count unchanged
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated with `-u`, its diff matching the clause sync and its `No tracker connected` count unchanged
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`: regenerated with `-u`, its diff matching the clause sync and its `No tracker connected` count unchanged
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: regenerated with `-u`, its diff matching the carrier line and its `No tracker connected` count unchanged
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the three tests below
  - **READ:** `.bkit/core/engine/tools/instructions.ts`: `SHARED_MIN` (`:90-95`), `NEAR_COPY` (`:88`, `:815-821`) and `unlistedShared` (`:917-941`), the checks the clause change must pass
  - **READ:** `docs/knowledge.jsonl`: `instructions-store-clause-text-and-local-entries-need-hand-edits` and `wording-retired-prefix-of-new-text-and-loose-list-items` (never retire a wording that is a prefix of its new text)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the three tests below pass; the clause entries were added before `pnpm instructions:sync` ran, and `pnpm tsx .bkit/core/engine/tools/instructions.ts` (no flag) reported nothing to fix, with no clause below the carrier cut-off, no near-copy, and `workflow-question-plain` found exactly once in each of the five phase workflows; no `retired` text of `workflow-stop-writes-handover` is a prefix of `"stop" ends here with a handover; the next run resumes here.`, and the `workflow-question-plain` retired text is not a prefix of its new text; a second `pnpm instructions:sync` changes nothing; `pnpm prettier --check .bkit/core/workflows/bkit-build.md .bkit/core/workflows/bkit-debug.md .bkit/core/workflows/bkit-ship.md .bkit/core/workflows/bkit-design.md .bkit/core/workflows/bkit-plan.md` passes; `pnpm vitest run .bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `no workflow carries the retired reply wording` fails on "\"stop\" writes a handover" still standing in `bkit-debug.md` and `bkit-ship.md`
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-build: the Decision Pause yes line uses the shared reply wording` fails on step 4 still reading "\"yes\" takes every recommendation" instead of "Reply with a letter per question"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every workflow that asks the owner states the question, each option and the recommendation's reason in plain English` fails on `bkit-plan.md` carrying no "in plain English" question sentence, and on the carriers not naming "the reason for the recommendation"

<!-- bkit:task 4 end -->

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
