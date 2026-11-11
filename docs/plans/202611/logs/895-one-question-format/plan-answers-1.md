## Owner answers

- **Open Question Q5 — The form of Step 1's issue-and-branch stops (Task 9):** Make the exit 8 stop a formatted question, the exit 3 and 9 stops `**Action needed**` lines, leave them, or make all three `Action needed` lines?
  - **Answer:** A) Include them
  - Decision: 895-start-step-issue-stops-question-and-action-lines
- **Open Question Q4 — The Acceptance Scenario's Narrative and Success Criteria:** Adopt the issue's `Outcome` as the `Narrative` and its `Success criteria` as the `Success Criteria`, word for word?
  - **Answer:** A) Adopt issue text
  - **Amendment (accepted in the next round, "Yes, all four"):** the first Success Criteria bullet reads "The shared question shape (below) is defined once in `.bkit/authoring.md` § Human questions plus a shared clause in `.bkit/instructions.md`, and every row in the audit table, and the Step 1 issue stops, use it." so the contract covers Task 9 (Q5 A). Every other Success Criteria bullet and the `Narrative` stay word for word.
  - Decision: none
- **Open Question Q1 — Default-line wording beyond the four fixed phrases:** Allow two fixed phrases joined with `; ` and add `the design assumes A` for the grill?
  - **Answer:** Yes, all four (takes Recommended A)
  - Decision: 895-shared-question-shape
- **Open Question Q2 — The reply line where "stop" does not write a handover:** Same lead sentence everywhere, with a second sentence that says what "stop" does at that point?
  - **Answer:** Yes, all four (takes Recommended A)
  - Decision: 895-shared-question-shape
- **Open Question Q3 — How a debug branch or CI-run answer reaches the re-run (#7, #8):** Write the owner's pick to `{SESSION_DIR}/owner-answer.md` and re-run the same command with `--prompt-file`?
  - **Answer:** Yes, all four (takes Recommended A)
  - Decision: 895-debug-branch-and-ci-stops-become-questions

## Review of rendered samples

The owner reviewed sample questions rendered from the plan and answered "fix the gaps in the plan now".

- **Gap 1 — Branch check (#7), CI-run lookup (#8) and Step 1 issue question had no recommendation or default line:** each now carries `Recommended: none — only you know which {branch | run | issue} you meant` and `Default if unanswered: the run waits for you; the run stops when nobody can be asked`; the reply line drops its "yes" half; the CI-run candidate option reads `Use {reference} — debug reads that run's failures instead of running the tests itself`.
  - Decision: 895-debug-branch-and-ci-stops-become-questions, 895-start-step-issue-stops-question-and-action-lines
- **Gap 2 — The debug Loop Question's reason was false when the soak limit fired:** that branch now reads `Recommended: A) Stop — the attempts set aside for this are used up`.
  - Decision: 895-debug-branch-and-ci-stops-become-questions
- **Gap 3 — `Stop` was worded four ways:** every mid-run `Stop` option reads `Stop — the run stops with a handover; the next run resumes here`.
  - Decision: 895-shared-question-shape
- **Gap 4 — The closed default set had no phrase for a stop or a blocked gate:** it gains `the run stops when nobody can be asked` (build hard blockers, with `the run waits for you; `) and `the plan stops at Gate 1 until you answer`.
  - Decision: 895-shared-question-shape
- **Gap 5 — Assumption A2 (each option line shows on its own line):** unchanged; still unverified.
  - Decision: none

## Stop wording and default lines

- **The mid-run `Stop` option and the reply line's stop sentence said it differently:** the owner answered "align as well". Both now read "ends here with a handover; the next run resumes here": the option `Stop — the run ends here with a handover; the next run resumes here`, the sentence `"stop" ends here with a handover; the next run resumes here.`
  - Decision: 895-shared-question-shape
- **The Loop Question and Merge Question each carry a `Default if unanswered: the run waits for you` line, though they are only asked when someone can answer:** the owner answered "that is ok". No change.
  - Decision: none

## Plain English

- **The shape did not require the recommendation's reason, or the open questions subagents write, to be plain English:** the owner answered "Yes, add them" to three fixes.
  - `workflow-question-plain` widens to `State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.` and gains `bkit-plan` as a carrier (Task 4).
  - A new prompt clause `prompt-open-questions-plain` carries the same rule in `bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check`, `bkit-plan-update`, `bkit-design-generate` and `bkit-design-update` (Task 10). A clause, not local lines, because a sentence two prompt files share with no clause covering it is an `unlistedShared` finding.
  - § Human questions keeps its plain-English bullet, widened to the same three parts (Task 3).
  - The one-by-one open-questions pass keeps each item's options, `Recommended` and `Default if unanswered` as written instead of "verbatim", so the question sentence can be restated plainly (Task 8).
  - Decision: 895-shared-question-shape
