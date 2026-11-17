# Brief: group 5 — Step 1 stops, open questions one option per line, and the installed copies

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
- Group 4: The debug Loop Question's recommendation agrees with its trend line — done
  - TASK 12: Give the debug Loop Question's non-limit recommendation a reason that holds on every trend that reaches the question — done
- Group 5: Step 1 stops, open questions one option per line, and the installed copies — this group
  - TASK 9: Put the five workflows' Step 1 issue-and-branch stops in the shared shape (Q5, option A) — open
  - TASK 10: Write plan and design open questions one option per line, in plain English — open
  - TASK 11: Re-render the installed copies, the build output and the graph register — open

## The work

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Put the five workflows' Step 1 issue-and-branch stops in the shared shape (Q5, option A)
  - **UPDATE:** `.bkit/instructions.md`: § Clauses `workflow-issue-id-parse-ambiguous` (exit 8) → `**Q1 — Issue:**` with one option per issue `fids parse` prints under `ambiguous` (`Use {issue} — the run works on {issue}`) and `Stop — nothing changes; the run can be started again`, `Recommended: none — only you know which issue you meant`, `Default if unanswered: the run waits for you; the run stops when nobody can be asked`, and the reply line `Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.` (Q2); on a pick, write the issue reference to `{SESSION_DIR}/owner-answer.md` with the file-write tool and re-run `fids parse --prompt-file="{SESSION_DIR}/owner-answer.md"`; old text in `retired`
  - **UPDATE:** `.bkit/instructions.md`: § Clauses `workflow-issue-id-parse-slug` (exit 3) → ``**Action needed — Branch name:** rename `BRANCH` to `feat/{lowercase-slug}`, or name an issue. Then say "continue".``; on "continue" the block re-runs; old text in `retired`
  - **UPDATE:** `.bkit/instructions.md`: § Clauses `workflow-fid-bare-number` (exit 9) → ``**Action needed — Issue reference:** name the issue as `#N`, its key or its URL. Then say "continue".``; the named reference goes to `{SESSION_DIR}/owner-answer.md` and the block re-runs on it; old text in `retired`
  - **UPDATE:** `.bkit/instructions.md`: each of the three routes waits with `end turn → wait for the answer; no status file yet`, writes no status row and never routes to the **Failure Path**; `pnpm instructions:sync` rewrites the carriers `bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md`; § Local Instructions entries edited by hand for any carrier line the sync leaves stale
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: any line that describes a Step 1 `fids parse` exit 3, 8 or 9 stop matches the reworded clauses
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`: regenerated with `-u`, its diff matching the clause sync
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: regenerated with `-u`, its diff matching the clause sync
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `-u`, its diff matching the clause sync
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with `-u`, its diff matching the clause sync
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated with `-u`, its diff matching the clause sync
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the four tests below
  - **READ:** `.bkit/core/engine/commands/workflow/fids.ts`: the `parse` verb's exit 8 prints the named issues under `ambiguous` (`:744`, `:781`)
  - **READ:** `docs/knowledge.jsonl`: `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e`, `wording-retired-prefix-of-new-text-and-loose-list-items` and `tracker-true-block-between-group-and-false-block-breaks-none-render`; no blank line inside an edited list item
  - **DEPENDS ON:** 3, 4, 6
  - **DONE WHEN:** the four tests below pass; the clause entries were edited before `pnpm instructions:sync` ran, the no-flag check reported nothing to fix, and a second `pnpm instructions:sync` changes nothing; `owner-wait-rows.test.ts` passes, with every new Step 1 wait before its file's `workflows start` block; `pnpm vitest run .bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/` passes; `pnpm prettier --check` passes on the five workflow sources; each regenerated `*.none.txt` keeps its `No tracker connected` count
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every workflow's Step 1 ambiguous-issue stop asks a formatted question` fails on the exit 8 route being a bare **STOP** with no "**Q1 — Issue:**" in any of the five workflows
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every workflow's Step 1 issue question shows Recommended: none and a Default if unanswered line` fails on the exit 8 question having no "Recommended: none — only you know which issue you meant" line and no "the run stops when nobody can be asked" default in any of the five workflows
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every workflow's Step 1 slug and bare-number stops show the Action needed line` fails on the exit 3 and exit 9 routes having no "**Action needed — "
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the Step 1 issue question re-runs fids parse on the owner's answer file` fails on no `fids parse --prompt-file="{SESSION_DIR}/owner-answer.md"` re-run after the exit 8 question

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Write plan and design open questions one option per line, in plain English
  - **UPDATE:** `.bkit/instructions.md`: § Clauses `plan-open-questions` asks for one lettered option per line (`A) {option} — {trade-off}`), then `Recommended`, then `Default if unanswered:` from the closed set (`the plan assumes A`, or `the plan stops at Gate 1 until you answer` when no assumption is safe); the old text moves to `retired`; `pnpm instructions:sync` rewrites it into `bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check` and `bkit-plan-update`
  - **UPDATE:** `.bkit/instructions.md`: § Clauses — add `prompt-open-questions-plain` (prompt, where-used; carriers `bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check`, `bkit-plan-update`, `bkit-design-generate`, `bkit-design-update`) with the text `Write each open question, what each option does and the reason for the recommendation in plain English, before naming any file, test or identifier.`; add the entry first, place the six carrier lines below, run the no-flag check, then `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-generate.md`: the line right after the `plan-open-questions` clause carries `prompt-open-questions-plain`
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-review-1.md`: the line right after the `plan-open-questions` clause carries `prompt-open-questions-plain`
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-scope-check.md`: the line right after the `plan-open-questions` clause carries `prompt-open-questions-plain`
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-update.md`: the line right after the `plan-open-questions` clause carries `prompt-open-questions-plain`
  - **UPDATE:** `.bkit/core/prompts/bkit-design-generate.md`: the `Risks & Open Questions` placeholder rule asks for one lettered option per line
  - **UPDATE:** `.bkit/core/prompts/bkit-design-generate.md`: the line next to the `Risks & Open Questions` placeholder rule carries `prompt-open-questions-plain`
  - **UPDATE:** `.bkit/core/prompts/bkit-design-update.md`: step 9's open-question rule asks for one lettered option per line
  - **UPDATE:** `.bkit/core/prompts/bkit-design-update.md`: the line next to step 9's open-question rule carries `prompt-open-questions-plain`
  - **UPDATE:** `.bkit/core/prompts/bkit-design-review-2.md`: step 8's `OPTIONAL` finding also covers options that share one line
  - **UPDATE:** `.bkit/core/docs/templates/bkit-plan.md`: the `Open Questions & Assumptions` placeholder uses `**Q{n} — [title]:**` with sub-bullets `A) [option] — [trade-off]`, `B) …`, `C) … (optional)`, `Recommended: A) [option] — [why]`, `Default if unanswered: [the plan assumes A | the plan stops at Gate 1 until you answer]`; the `👤 ✅ Human Confirmation` checkbox is untouched
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-models.md`: the `Proposal` question rule (`:119`) asks for one lettered option per line (`A) {option} — {what happens}`), then `Recommended: A) … — {reason}` and `Default if unanswered:`, plus what would settle it
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the `bkit-design-generate` (`:309`), `bkit-design-review-2` (`:311`), `bkit-design-update` (`:313`), `bkit-plan-generate` (`:321`), `bkit-plan-scope-check` (`:324`) and `bkit-plan-update` (`:325`) rows describe one lettered option per line instead of "the lettered `Options: A) …`"
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the `bkit-design-generate`, `bkit-design-update`, `bkit-plan-generate`, `bkit-plan-scope-check` and `bkit-plan-update` rows also say open questions are written in plain English, because each row describes the open-question rule and its prompt carries `prompt-open-questions-plain`; the `bkit-design-review-2` row does not, because that prompt does not carry the clause
  - **READ:** `.bkit/core/.bkit/prompts.md`: the § Audit `bkit-audit-models` row (`:401`) stays as it is, because the template's title and purpose do not change
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions entries for every edited prompt and template line, including the `Audit templates` entry for the `bkit-audit-models.md` `Proposal` line (`:14016`) and each placed `prompt-open-questions-plain` line
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: `the plan template letters every option of its Open Questions placeholder` reads the per-line placeholder; the six tests below
  - **READ:** `.bkit/core/engine/tools/instructions.ts`: `SHARED_MIN` (`:90-95`) and `unlistedShared` (`:917-941`), the check that makes a shared prompt sentence with no clause a finding
  - **DEPENDS ON:** 3, 4, 5, 6, 7, 8, 9
  - **DONE WHEN:** the six tests below and every test in `question-option-format.test.ts` pass; the `prompt-open-questions-plain` entry was added before `pnpm instructions:sync` ran, and the no-flag check reported no near-copy and no unlisted shared sentence; `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/prompts.md`, the five `bkit-design-review-2` mirrors and `docs/templates/bkit-plan.md`, so the mirror checks in that file pass; the `plan-open-questions` old text is not a prefix of its new text, and a second `pnpm instructions:sync` changes nothing; `pnpm vitest run .bkit/core/engine/tools/` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the plan template puts each open-question option on its own line` fails on the inline "· B)" placeholder, where the per-line placeholder's default line must offer both `the plan assumes A` and `the plan stops at Gate 1 until you answer`
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every open-question rule in the prompts asks for one option per line` fails on the rules naming the inline "`Options: A) {option} — {trade-off} · B) …`"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the design review flags an open question whose options share one line` fails on `bkit-design-review-2.md` naming no one-per-line check
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the prompts index describes one option per line` fails on the six rows naming "the lettered `Options: A) …`"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `no workflow, prompt, template or authoring doc carries an inline Options: list` fails on any inline lettered "Options: A)" list left in the scanned directories, including `bkit-audit-models.md:119`; it matches only lettered lists, so `X-Content-Type-Options: nosniff` (`bkit-audit-security.md:124`, `:159`) does not trip it
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every open-question writer asks for plain English` fails on `bkit-plan-generate.md`, `bkit-plan-update.md`, `bkit-design-generate.md` and `bkit-design-update.md` naming no "in plain English" rule for open questions

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Re-render the installed copies, the build output and the graph register
  - **UPDATE:** `.bkit/authoring.md`: re-rendered by `pnpm tsx .bkit/core/engine/cli.ts upgrade`, along with every other host mirror of the edited sources (`.cursor/`, `.opencode/`, `.codex/`, `.agents/`)
  - **UPDATE:** `.bkit/workflows.md`: re-rendered by the same upgrade
  - **UPDATE:** `.bkit/prompts.md`: re-rendered by the same upgrade
  - **UPDATE:** `docs/templates/bkit-plan.md`: re-rendered by the same upgrade
  - **UPDATE:** `.claude/commands/bkit-build.md`: re-rendered by the same upgrade
  - **UPDATE:** `.claude/commands/bkit-debug.md`: re-rendered by the same upgrade
  - **UPDATE:** `.claude/commands/bkit-ship.md`: re-rendered by the same upgrade
  - **UPDATE:** `.claude/commands/bkit-design.md`: re-rendered by the same upgrade
  - **UPDATE:** `.claude/commands/bkit-plan.md`: re-rendered by the same upgrade
  - **UPDATE:** `docs/capabilities.md`: refreshed by `pnpm bkit:graph:refresh` once the engine edit is staged
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  - **DONE WHEN:** `pnpm build` rebuilds the build output; `pnpm bkit check` reports no drift; `pnpm bkit:check:dist` passes; `pnpm bkit:graph:check` passes; `grep -rn 'Reply per question\|No recommendation\|Options: A)' .bkit/core/workflows .bkit/core/prompts .bkit/core/docs/templates .bkit/core/.bkit .claude/commands` finds nothing
  - **TEST FIRST:** n/a — regenerated installed copies, build output and graph register only; no behaviour change

<!-- bkit:task 11 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Read one option per line and `Recommended: none` in `parseDecisionItems`, keeping the old `Options:` line — `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/engine/commands/workflow/decisions.test.ts`, `.bkit/core/engine/commands/workflow/summary.test.ts`, `.bkit/core/engine/commands/workflow/challenge.test.ts`
- TASK 2 (group 1, done): Write the shared shape with `decisions compose`, from options that each carry an `effect` — `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/engine/commands/workflow/decisions.test.ts`, `.bkit/core/.bkit/cli.md`
- TASK 3 (group 2, done): Define the shared question shape once in `.bkit/authoring.md` § Human questions, and point § Question layout at it — `.bkit/core/.bkit/authoring.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/engine/audits/workflows/question-option-format.test.ts`
- TASK 4 (group 2, done): Put the reply line's wording and the widened plain-English rule into their clauses before any carrier edit — `.bkit/instructions.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`, `.bkit/core/engine/audits/workflows/question-option-format.test.ts`
- TASK 5 (group 3, done): Put the build's Decision Pause (#5) in the shared shape — `.bkit/core/workflows/bkit-build.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/instructions.md`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, `.bkit/core/engine/audits/workflows/question-option-format.test.ts`
- TASK 6 (group 3, done): Put debug's Loop Question (#6), branch check (#7) and CI-run lookup (#8) in the shared shape, and give the foreign-path stop (#9) the `Action needed` line — `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts`, `.bkit/instructions.md`, `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`, `.bkit/core/engine/audits/workflows/question-option-format.test.ts`
- TASK 7 (group 3, done): Put ship's Confirm Assumed Items (#10) and Merge Question (#11) in the shared shape — `.bkit/core/workflows/bkit-ship.md`, `.bkit/instructions.md`, `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`, `.bkit/core/engine/audits/workflows/question-option-format.test.ts`
- TASK 8 (group 3, done): Put the design grill (#1), draft scenario (#2) and the design and plan one-by-one pass (#3, #4) in the shared shape, and add `bkit-design` to the reply-line clause — `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/instructions.md`, `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`, `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

Reuse Inventory rows left out: 6; Architecture entries left out: 9 — read them in docs/plans/202611/895-one-question-format-plan.md § Reuse Inventory and § Architecture & Component Changes.
