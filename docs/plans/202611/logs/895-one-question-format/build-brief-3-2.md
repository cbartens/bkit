# Brief: group 3 — Every workflow question point in the shape

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
- Group 3: Every workflow question point in the shape — this group
  - TASK 5: Put the build's Decision Pause (#5) in the shared shape — open
  - TASK 6: Put debug's Loop Question (#6), branch check (#7) and CI-run lookup (#8) in the shared shape, and give the foreign-path stop (#9) the `Action needed` line — open
  - TASK 7: Put ship's Confirm Assumed Items (#10) and Merge Question (#11) in the shared shape — open
  - TASK 8: Put the design grill (#1), draft scenario (#2) and the design and plan one-by-one pass (#3, #4) in the shared shape, and add `bkit-design` to the reply-line clause — open
- Group 4: Step 1 stops, open questions one option per line, and the installed copies — next
  - TASK 9: Put the five workflows' Step 1 issue-and-branch stops in the shared shape (Q5, option A) — open
  - TASK 10: Write plan and design open questions one option per line, in plain English — open
  - TASK 11: Re-render the installed copies, the build output and the graph register — open

## The work

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Put the build's Decision Pause (#5) in the shared shape
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 2 writes `decision-items.json` options as `{"name", "effect"}` objects, with the default effects for `Accept`, `Fix now` and `Stop` (Architecture; `Stop` reads `Stop — the run ends here with a handover; the next run resumes here`) and leave to sharpen an effect to the item
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 4 shows each unanswered item's option lines, its `Recommended:` line and its `Default if unanswered:` line, then the reply line; "yes" never answers a `Recommended: none` question; a "one by one" reply asks each unanswered question in its own message, per § Human questions
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 4 shows the "one by one" line only when the message asks 3 or more questions, because after a headless apply it asks only the `hardBlockers` subset (`:175`)
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: `/bkit-build` § Hard blockers (`:989`) reads `Recommended: none — {why}`; "yes" never answers one, in place of "No recommendation; "yes" never answers one."
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions `bkit-build` entries for every edited standing line
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `pnpm vitest run .bkit/core/engine/render/trackers.test.ts -u`, its diff matching the source edit
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the four tests below
  - **READ:** `docs/knowledge.jsonl`: `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e`, `wording-retired-prefix-of-new-text-and-loose-list-items` and `tracker-true-block-between-group-and-false-block-breaks-none-render`; no blank line inside an edited list item
  - **DEPENDS ON:** 2, 3, 4
  - **DONE WHEN:** the four tests below pass; `pnpm vitest run .bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/` passes; § Decision Pause names no bare-string option list and no `No recommendation`; `.bkit/core/.bkit/workflows.md` names no `No recommendation`; `pnpm prettier --check .bkit/core/workflows/bkit-build.md` passes; `grep -c 'No tracker connected' .bkit/core/engine/render/__snapshots__/bkit-build.none.txt` equals its count before the edit
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-build: every decision item option carries an effect` fails on the Decision Pause items shape listing bare strings such as `["Accept", "Fix now"]` with no "effect"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-build: the pause message shows the default line and Recommended: none` fails on step 4 naming "No recommendation" and no `Default if unanswered:` line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-build: a one-by-one reply asks the questions one at a time` fails on Decision Pause step 4 having no "one by one" route
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-build: the one-by-one offer follows the asked count` fails on step 4 having no rule tying the "one by one" line to "3 or more questions" asked in the message

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Put debug's Loop Question (#6), branch check (#7) and CI-run lookup (#8) in the shared shape, and give the foreign-path stop (#9) the `Action needed` line
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Loop Question step 3 writes `A) Stop — the run ends here with a handover; the next run resumes here` and `B) Try again — …` lines, `Default if unanswered: the run waits for you` and the shared reply line
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Loop Question step 3's recommendation follows the question's first-match branch: **If** `LOOP_LIMIT` = true → `Recommended: A) Stop — the attempts set aside for this are used up`; every other branch → `Recommended: A) Stop — the last attempt left no fewer failures`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Step 1 sub-step 2, `branches parse` exit 3 or 8 → `**Q1 — Branch:**` with one option per candidate, `Name another branch` and `Stop — nothing changes; the run can be started again`, `Recommended: none — only you know which branch you meant`, `Default if unanswered: the run waits for you; the run stops when nobody can be asked`, and the reply line `Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.` (Architecture); the answer goes to `{SESSION_DIR}/owner-answer.md` (written with the file-write tool) and `branches parse` re-runs on it (Q3); no status rows (A5); the wait reads `end turn → wait for the answer; no status file yet`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Step 2 `runs locate` exit 8 or 82 → `**Q1 — CI run:**` with one option per candidate reference (`Use {reference} — debug reads that run's failures instead of running the tests itself`), `Use local discovery — debug runs the tests itself instead of reading CI` and `Stop — the run ends here with a handover; the next run resumes here`, `Recommended: none — only you know which run you meant`, `Default if unanswered: the run waits for you; the run stops when nobody can be asked`, and the reply line `Reply with a letter per question. "stop" ends here with a handover; the next run resumes here.`; the engine's message carried word for word (including `Supply branch={x} in its checkout`), and only `Use local discovery` and `Stop` when exit 82 printed no candidate; keeps the `owner-pause reason=decision` row
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Step 2 exit 8 or 82 keeps the workflow lock held while the owner answers and releases it (`locks release`, today at `:342`) only on the `Stop` answer, as the Loop Question does (`:131-147`)
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Step 2 exit 8 or 82, on a pick, records `owner-answer`, writes `{SESSION_DIR}/owner-answer.md` and re-runs `runs locate` with that `--prompt-file`; the re-run line sits after the original `"{BKIT}" runs locate` line, which `debug-ci-evidence.integration.test.ts:28-35` executes
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the `Foreign path` header bullet writes `**Action needed — Foreign path:** commit or revert {file}. Then say "continue".` and keeps its `owner-pause reason=foreign-path` / `owner-answer` rows
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `Foreign path` contract row (`:244`) names the `**Action needed — Foreign path:**` line in place of "**STOP** and ask the human to commit or revert it"; any debug Step 1 / Step 2 stop description matches the new questions
  - **UPDATE:** `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts`: `waits` leaves out lines with the fixed wording `end turn → wait for the answer; no status file yet`; the test below
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions `bkit-debug` entries for every edited standing line
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with `-u`, its diff matching the source edit
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the nine `question-option-format.test.ts` tests below
  - **READ:** `branchesCommand` in `.bkit/core/engine/commands/workflow/branches.ts`: the `parse` verb's exit 3 names the invalid branch, and its exit 8 lists the candidates
  - **READ:** `locateCi` in `.bkit/core/engine/commands/workflow/runs.ts`: exit 8 asks for one reference, exit 82 names the evidence problem (`:164-168` for the branch conflict)
  - **READ:** `runsCommand` in `.bkit/core/engine/commands/workflow/runs.ts`: the `locate` verb's flags, including `--prompt-file` (A7)
  - **READ:** `.bkit/core/engine/commands/workflow/locks.ts`: the `release` verb (`:429-482`) removes the shared-checkout record (`:470-471`), and a later release by a non-owner exits `EXIT_NOT_OWNER` (`:477-479`)
  - **READ:** `docs/knowledge.jsonl`: `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e`, `wording-retired-prefix-of-new-text-and-loose-list-items` and `tracker-true-block-between-group-and-false-block-breaks-none-render`; `:200` sits in a list item with tracker `false` / `true` blocks (`:201-214`) and `:48` ends in an inline tracker `true` block, so no blank line goes inside either list item
  - **DEPENDS ON:** 3, 4
  - **DONE WHEN:** the ten tests below pass; `pnpm vitest run .bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/` passes, including `debug-ci-evidence.integration.test.ts` and `owner-wait-rows.test.ts`; the existing `every answer branch after a lettered question accepts the option letter` still passes for every new answer route; `pnpm prettier --check .bkit/core/workflows/bkit-debug.md` passes; `grep -c 'No tracker connected' .bkit/core/engine/render/__snapshots__/bkit-debug.none.txt` equals its count before the edit
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the CI-run question releases the lock only on Stop` fails on the exit 8 or 82 route releasing the workflow lock before the owner answers
    - `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` `a pre-status wait sits before workflows start and names no owner-pause row` fails on no "no status file yet" wait being found in `bkit-debug.md` Step 1
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the loop question gives each option its effect and the recommendation a reason` fails on "Options: A) Stop / B) Try again" with a bare "Recommended: A) Stop"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the loop question's recommendation reason matches its trigger` fails on the `LOOP_LIMIT` = true branch having no "the attempts set aside for this are used up" reason
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: every question shows a Default if unanswered line` fails on the Loop Question having no "Default if unanswered:" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the branch check asks a formatted question` fails on the `branches parse` exit 3 or 8 route being a bare **STOP** with no "**Q1 — Branch:**"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the CI-run stop asks a formatted question` fails on the `runs locate` exit 8 or 82 route having no "**Q1 — CI run:**"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the branch check and CI-run question show Recommended: none and a Default if unanswered line` fails on the branch and CI-run routes having no "Recommended: none — only you know which" line and no "the run stops when nobody can be asked" default
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the foreign-path stop shows the Action needed line` fails on the bullet having no "**Action needed — "
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: every question message ends with the reply line its point uses` fails on the branch and CI-run routes having no question message that ends in "Reply with a letter per question" (Task 4 already moved the Loop Question's line off the old "Reply per question."), where the branch and CI-run reply lines carry no "yes" half

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Put ship's Confirm Assumed Items (#10) and Merge Question (#11) in the shared shape
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: § Confirm Assumed Items step 2 writes `A) Confirm — …` and `B) Reject — …` lines, `Recommended: none — only you can accept it`, `Default if unanswered: written as a needs-decision deferral`, and the #10 reply line (Q2); the `Confirm` / `Reject` / `**Else** → ask again` routes of step 3 stay as they are
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: § Merge Question step 1 writes `A) Stop — the run ends here with a handover; the next run resumes here` and `B) Try again — …` lines, `Recommended: A) Stop — {reason}`, `Default if unanswered: the run waits for you` and the shared reply line (its two sentences already from Task 4's clauses)
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions `bkit-ship` entries for every edited standing line
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated with `-u`, its diff matching the source edit
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the five tests below
  - **READ:** `docs/knowledge.jsonl`: `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e`, `wording-retired-prefix-of-new-text-and-loose-list-items` and `tracker-true-block-between-group-and-false-block-breaks-none-render`; no blank line inside an edited list item
  - **DEPENDS ON:** 3, 4
  - **DONE WHEN:** the five tests below pass; the existing `every answer-routing step maps a lettered reply to its option name` passes unchanged; `pnpm vitest run .bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/` passes; `pnpm prettier --check .bkit/core/workflows/bkit-ship.md` passes; `grep -c 'No tracker connected' .bkit/core/engine/render/__snapshots__/bkit-ship.none.txt` equals its count before the edit
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-ship: the assumed-item question gives each option its effect` fails on "Options: A) Confirm / B) Reject"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-ship: an assumed item is a hard blocker with Recommended: none` fails on "No recommendation — only you can accept it"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-ship: every question shows a Default if unanswered line` fails on Confirm Assumed Items and Merge Question having no "Default if unanswered:" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-ship: the merge question gives each option its effect` fails on "Options: A) Stop / B) Try again"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-ship: every question message ends with the reply line its point uses` fails on the old "Reply per question. Ship merges either way" line at Confirm Assumed Items

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Put the design grill (#1), draft scenario (#2) and the design and plan one-by-one pass (#3, #4) in the shared shape, and add `bkit-design` to the reply-line clause
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: § Step 3 sub-step 2 writes each grill question with option lines, `Recommended: A) {answer} — {why}` and `Default if unanswered: the design assumes A`; the turn's message ends with the reply line whose second sentence is the grill's "stop" sentence (Q2), plus the "one by one" line from 3 questions on
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: § Step 3 states that a "one by one" round counts as the single grill turn it replaces against `GRILL_TURNS` (`:252`, `:286`, `:300`)
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: § Step 3 sub-step 4 asks the draft question with `A) Yes — the draft becomes the design's starting point`, `B) No — the draft is revised from your reply before the design starts`, `Recommended: A) Yes — {why}` and `Default if unanswered: the design assumes A`
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: Step 12 sub-step 7 carries the reworded `workflow-open-questions-one-by-one` clause (shared shape, `plain text, not through a host question tool.`, and "keeping its options, `Recommended` and `Default if unanswered` as written" in place of "verbatim", so the orchestrator may restate the question line in plain English without changing the decision)
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: Step 8 sub-step 7 carries the same reworded clause, with the `workflow-question-plain` sentence Task 4 placed still right after it
  - **UPDATE:** `.bkit/instructions.md`: § Clauses — `workflow-question-reply-line` (created by Task 4) carriers gain `bkit-design`; `workflow-plain-text-questions` carriers gain `bkit-plan`; `workflow-open-questions-one-by-one` reworded to the shared shape with "verbatim" replaced by "keeping its options, `Recommended` and `Default if unanswered` as written", old text in `retired` (never a wording that is a prefix of its new text); § Local Instructions `bkit-design` and `bkit-plan` entries for every edited standing line
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`: regenerated with `-u`, its diff matching the source edit
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: regenerated with `-u`, its diff matching the source edit
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the six tests below
  - **READ:** `docs/knowledge.jsonl`: `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e`, `wording-retired-prefix-of-new-text-and-loose-list-items` and `tracker-true-block-between-group-and-false-block-breaks-none-render`; no blank line inside an edited list item
  - **DEPENDS ON:** 3, 4
  - **DONE WHEN:** the six tests below pass; the clause entries were added before `pnpm instructions:sync` ran, and the no-flag check reported nothing to fix, including no near-copy or double count from the reworded `workflow-open-questions-one-by-one` holding the full `workflow-plain-text-questions` text (`plain text, not through a host question tool.`); a second `pnpm instructions:sync` changes nothing; `pnpm vitest run .bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/` passes; `pnpm prettier --check .bkit/core/workflows/bkit-design.md .bkit/core/workflows/bkit-plan.md` passes; the `No tracker connected` counts of `bkit-design.none.txt` and `bkit-plan.none.txt` equal their counts before the edit
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-design: the grill question gives each option its effect and the recommendation a reason` fails on "`Recommended: A) {answer}`" carrying no reason
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-design: the draft-scenario question gives each option its effect` fails on "Options: A) yes / B) no"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-design: every question shows a Default if unanswered line` fails on the grill and draft questions having no "Default if unanswered:" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-design: the grill message ends with the reply line and the one-by-one offer` fails on the grill turn having no "Reply with a letter per question" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the one-by-one open-questions pass forbids the host question tool in design and plan` fails on `bkit-plan.md`'s one-by-one step lacking "not through a host question tool", and on "verbatim" still standing in the design or plan one-by-one step
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-design: a one-by-one grill round counts as one grill turn` fails on Step 3 saying nothing about how a "one by one" round counts against `GRILL_TURNS`

<!-- bkit:task 8 end -->

### Earlier tasks this group depends on

- TASK 2 (group 1, done): Write the shared shape with `decisions compose`, from options that each carry an `effect` — `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/engine/commands/workflow/decisions.test.ts`, `.bkit/core/.bkit/cli.md`
- TASK 3 (group 2, done): Define the shared question shape once in `.bkit/authoring.md` § Human questions, and point § Question layout at it — `.bkit/core/.bkit/authoring.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/engine/audits/workflows/question-option-format.test.ts`
- TASK 4 (group 2, done): Put the reply line's wording and the widened plain-English rule into their clauses before any carrier edit — `.bkit/instructions.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`, `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

Reuse Inventory rows left out: 9; Architecture entries left out: 9 — read them in docs/plans/202611/895-one-question-format-plan.md § Reuse Inventory and § Architecture & Component Changes.
