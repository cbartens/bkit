# Brief: group 2 — One definition of the question shape and its reply-line clauses

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
  - TASK 4: Put the reply line's wording and the widened plain-English rule into their clauses before any carrier edit — done
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

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Define the shared question shape once | `.bkit/core/.bkit/authoring.md` | `grep -n 'Human questions' .bkit/authoring.md .bkit/core/.bkit/authoring.md`; `grep -n 'Question layout' .bkit/core/.bkit/workflows.md` | § Human questions (inline `Options:` shape, `No recommendation`, debug Loop Question example); `.bkit/core/.bkit/workflows.md` § Question layout restates it | EXTEND | Rewrite § Human questions to the new shape, footer, default set, hard-blocker line, one-by-one route and `Action needed` line; point § Question layout at it instead of restating it |
| Ask a round one question at a time on request | `.bkit/core/.bkit/authoring.md` | `grep -rn 'one by one' .bkit/core/workflows .bkit/instructions.md` | `workflow-open-questions-one-by-one` clause (design and plan open questions only; asks each item "verbatim") | EXTEND | § Human questions states the one-by-one route for every round; the clause keeps its design / plan role, gains the shared-shape wording, and replaces "verbatim" with "keeping its options, `Recommended` and `Default if unanswered` as written", so the orchestrator may restate the question line in plain English without changing the decision (Task 8) |
| Plain English for the question, each option and the recommendation's reason in every workflow that asks the owner | `.bkit/instructions.md` (`workflow-question-plain`), `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/.bkit/authoring.md` | `grep -n 'in plain English' .bkit/instructions.md .bkit/core/workflows/*.md .bkit/core/.bkit/authoring.md`; `grep -n -A3 '^### workflow-question-plain' .bkit/instructions.md` | `workflow-question-plain` clause (carriers all but `bkit-auto`, `bkit-plan`; copies at `bkit-build.md:134`, `bkit-debug.md:131`, `bkit-ship.md:372`, `bkit-design.md:273`), which names the decision and each option but not the recommendation's reason; § Human questions plain-English bullet (`authoring.md:641`), same gap | EXTEND | Widen the clause text to the recommendation's reason (old text in `retired`) and its carriers to `bkit-plan` (Task 4); widen the § Human questions bullet to match (Task 3) |
| Check the shape across the shipped text | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | `grep -rln 'Options:' .bkit/core/engine --include='*.test.ts'`; read the whole file | `question-option-format.test.ts` — scans workflows, prompts, templates and authoring docs for inline lettered `Options:` lists and lettered `Recommended:` lines | EXTEND | Add per-line option blocks, the default line, the reply line and `Recommended: none` to the scan; keep the RED-PROOF style |

Reuse Inventory rows left out: 0; Architecture entries left out: 3 — read them in docs/plans/202611/895-one-question-format-plan.md § Reuse Inventory and § Architecture & Component Changes.
