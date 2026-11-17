## Session Prompt — this run's, newer than everything below

/bkit-plan #895

## Issue description — oldest

### Problem

bkit asks the owner questions in 11 places across five of the six workflows, and they don't share one format. The open questions asked after design and plan close are the easiest to answer: one question at a time, each option with its trade-off, a recommendation and a default. Build's Decision Pause and every other pause put all questions in one message, with bare option labels such as `A) Accept / B) Fix now`, and give no default line. Three points in debug don't ask a formatted question at all. They only stop and say what is needed.

The house rule in `.bkit/authoring.md` § Human questions says "every question of the round in one plain-text message, never through a subagent or a host question tool". The open-questions pass (one by one, with trade-offs and a default) is therefore the exception to the house rule, yet it is the format that reads best in practice.

### Audit: every place a workflow asks the owner

Columns: **Writer** = who words the question. **Delivery** = one message for the whole round, or one question at a time. **Option detail** = whether each option says what it costs. **Default** = whether a `Default if unanswered` line is shown.

<!-- prettier-ignore -->
| # | Where | Writer | Delivery | Options | Option detail | Recommended | Default | Host question tool |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `.bkit/core/workflows/bkit-design.md` Step 3 Grill (sub-steps 2-4) | orchestrator | whole frontier in one message, several turns up to `GRILL_TURNS` | `A)` `B)` `C)` per decision | plain-English "what each option does" before identifiers; no per-option trade-off | `Recommended: A) {answer}` | none; at the cap unanswered items are recorded `Assumed, not confirmed` | forbidden |
| 2 | `.bkit/core/workflows/bkit-design.md` Step 3 sub-step 4, draft acceptance scenario | orchestrator | last grill turn, one message | `A) yes / B) no` | none | `A) yes` | none | forbidden |
| 3 | `.bkit/core/workflows/bkit-design.md` Step 12 sub-step 7, open questions one by one | `bkit-design-generate` / `bkit-design-update` write them; orchestrator asks | one at a time, only after the owner opts in to the `--suggest` line | `A) {option} — {trade-off} · B) …`, 2-3 options | trade-off per option | `Recommended` | `Default if unanswered` | not mentioned |
| 4 | `.bkit/core/workflows/bkit-plan.md` Step 8 sub-step 7, open questions one by one | `bkit-plan-generate` / `bkit-plan-update` write them (checked by `bkit-plan-scope-check`); orchestrator asks | one at a time, opt-in as #3 | as #3 | trade-off per option | `Recommended` | `Default if unanswered` | not mentioned |
| 5 | `.bkit/core/workflows/bkit-build.md` Decision Pause (`VERIFY_GAPS`, `CHALLENGE`, `UNPROVEN`, `TESTS_LOOP`) | orchestrator writes `decision-items.json`; `bkit decisions compose` (`.bkit/core/engine/commands/workflow/decisions.ts:225`) lays it out | all questions plus progress block in one message | `A) Accept / B) Fix now` (`/ C) Stop` on hard blockers; `Try again / Decide` on loop questions) | bare labels; the question text explains them | `Recommended: A) … — {reason}` or `No recommendation — {why}` | none shown; headless takes the recommendation (`decisions apply --by=headless`) | forbidden |
| 6 | `.bkit/core/workflows/bkit-debug.md` Loop Question (fix / soak attempts) | orchestrator, fixed wording | one question, one message | `A) Stop / B) Try again` | none | `A) Stop` (no reason) | none | forbidden |
| 7 | `.bkit/core/workflows/bkit-debug.md:200` Step 1 — Start Workflow, branch check (exit 3 or 8) | orchestrator | **STOP** naming the missing or ambiguous branch, asking the owner to name one; no Q format | none | none | none | none | not mentioned |
| 8 | `.bkit/core/workflows/bkit-debug.md:342` Step 2 — Worktree Setup, CI run lookup (exit 8 or 82) | orchestrator | records `owner-pause reason=decision`, releases the lock and **STOP**s naming the ambiguous references, branch conflict or unavailable evidence; the run resumes once answered; no Q format | none | none | none | none | not mentioned |
| 9 | `.bkit/core/workflows/bkit-debug.md:48` Foreign path rule (exit 10) | orchestrator | **STOP**, "ask the human to commit or revert the named file"; no Q format | none | none | none | none | not mentioned |
| 10 | `.bkit/core/workflows/bkit-ship.md` Confirm Assumed Items | orchestrator, fixed wording from `decisions pending` | all items in one message | `A) Confirm / B) Reject` | none | `No recommendation — only you can accept it` | none (unconfirmed → `needs-decision` deferral) | forbidden |
| 11 | `.bkit/core/workflows/bkit-ship.md` Merge Question | orchestrator, fixed wording | one question, one message | `A) Stop / B) Try again` | none | `A) Stop — {reason}` | none | forbidden |

Also in every workflow's final return: the `--suggest` offer ("ask me one by one", design and plan only) and "plain English explanation" (design, plan, build, debug, ship). These are follow-up offers, not questions. `bkit-auto` asks nothing itself. Subagent prompts ask the owner nothing, because subagents cannot reach the owner.

What the audit shows:

- **Only #3 and #4 give each option a trade-off and a default.** In #5, the owner has to find what `Fix now` costs in the question prose, and nothing on the page says what happens if they don't answer.
- **Only #3 and #4 are written by subagents.** Every other question is worded by the orchestrator or by fixed workflow text. So the prompt rule `.bkit/instructions.md` § plan-open-questions (and the design equivalent) reaches only the plan and design agents.
- **Build's questions are read back by code; plan and design questions are read only by agents.** `bkit decisions apply` and `decisions pending` (at ship) parse the decision file in `.bkit/core/engine/commands/workflow/decisions.ts:85-110`: one `Options:` line split on ` / `, bare option names (`Accept`, `Fix now`) that the apply logic matches, `Recommended: A) {option} — {reason}`, and a `Decision:` line. Plan and design open questions separate options with ` · ` instead and carry the trade-off inside the option. The shared format has to keep the option names parseable, and still read decision files from runs already in progress.
- **The footer is shared in three places, missing or different in the rest.** Build #5 (written by `decisions.ts:434`), debug #6 and ship #11 end with the same line: `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.` Ship #10 has its own line, and design #1 has none.
- **Recommendation reasons:** debug #6 gives none, ship #11 and build #5 do.
- **Points #7-#9 are not formatted questions.** The owner gets a stop message with no options, and the resume path depends on them knowing what to type next. #8 already records a resumable pause; #7 and #9 only stop.
- **The host question tool** is forbidden in #1, #2, #5, #6, #10 and #11 and not mentioned in #3, #4 and #7-#9. The design-grill reason is recorded (`docs/decisions.jsonl` key `design-grill-step`): the tool caps at 4 questions with 4 options each and exists only in Claude.

### Outcome

Every question point in every workflow uses one shared question shape. The owner can answer any of them from the page alone: what is being decided, what each option does and costs, what is recommended and why, and what happens if they don't answer.

### Success criteria

- The shared question shape (below) is defined once in `.bkit/authoring.md` § Human questions plus a shared clause in `.bkit/instructions.md`, and every row in the audit table uses it.
- Each option is on its own line with what happens if it is picked, including the fixed-option pauses (#5, #6, #10, #11).
- Each question has a `Default if unanswered:` line saying what actually happens.
- Each recommendation carries a reason.
- `bkit decisions apply` and `decisions pending` read decision files in both the new layout and the old single `Options:` line layout.

### Shared question shape

```
**Q{n} — {title}:** {what you are deciding, in plain English, worded so "yes" takes the recommendation}
A) {option} — {what happens if you pick it}
B) {option} — {what happens if you pick it}
Recommended: A) {option} — {why}
Default if unanswered: {what happens}
```

Once at the end of every message:

```
Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the run can be resumed.
```

When a round has 3 or more questions, the footer adds: `Or say "one by one" and I'll ask them one at a time.`

- `Default if unanswered:` takes one of: `the run waits for you`, `taken as A when nobody can be asked`, `the plan assumes A`, `written as a needs-decision deferral`.
- A hard blocker has `Recommended: none — {why only you can decide}`; "yes" never answers it.
- Rationale, a worked example and the touched files: https://github.com/cbartens/bkit/issues/895#issuecomment-6737321246

### Constraints and non-goals

- One-word replies must keep working: "yes" takes every recommendation, and a letter maps to exactly one option (`.bkit/authoring.md` § Human questions, Why).
- Decision files stay parseable by `decisions.ts`, including files written before the change.
- Must work on every host (OpenCode, Codex, Cursor, Antigravity), so no Claude-only mechanism is used.
- Headless runs route each pause the same way they do now.
- Not in scope: the `👤 ✅ Human Confirmation` checkboxes in `docs/templates/bkit-plan.md` (Acceptance Scenario confirmed, Breaking Changes confirmed, Open Questions & Assumptions confirmed). The owner ticks those in the plan file; they are a document gate, not a chat question.
- Not in scope: changing *when* the workflows pause, the limits in `bkit.workflows.*`, or what the decisions do once answered.

### Decisions already made

- **Delivery:** one message per round. When a round has 3 or more questions, the footer offers "one by one". (Owner, 2026-11-09.)
- **Per-option effect:** `decision-items.json` gains a per-option `effect`; `decisions compose` writes one option per line with it; `parseDecisionItems` splits the effect off the option name and still reads the old `Options:` line. (Owner, 2026-11-09.)
- **Host question tool:** forbidden at every question point, including #3, #4 and #7-#9, for the reasons in `docs/decisions.jsonl` key `design-grill-step`. (Owner, 2026-11-09.)
- **Stops:** #7 and #8 become formatted questions, because the answer (a branch, a reference) can be given in chat, for example `A) Use branch {x} — tests run there` / `B) Stop — handover; the run can be resumed`. #9 stays a stop with one fixed line: `**Action needed — {title}:** {what to do}. Then say "continue".` (Owner, 2026-11-09.)
- **Labels kept:** `Recommended:` and `Default if unanswered:` keep their current names, because `decisions.ts`, `bkit-plan-scope-check` and `bkit-design-review-2` already look for them. (Owner, 2026-11-09.)
- Plain-text rounds, not a host question tool, for the design grill: `docs/decisions.jsonl` key `design-grill-step` (4x4 cap, Claude-only).
- Question and option label wording was standardised in #703 — Standardise question and option labels in prompts and workflows (https://github.com/cbartens/bkit/issues/703).
- Owner answers to open questions are recorded after design and plan close: #798 — Record owner answers to open questions after design and plan close (https://github.com/cbartens/bkit/issues/798).

### Open questions

None.

### References

- `.bkit/authoring.md` § Human questions
- `.bkit/instructions.md` § plan-open-questions, § workflow-open-questions-one-by-one
- `.bkit/core/engine/commands/workflow/decisions.ts` (`parseDecisionItems`, `itemLines`, compose)
- `.bkit/core/workflows/bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`
- `.bkit/core/engine/render/__snapshots__/` (rendered workflow snapshots)
- `docs/decisions.jsonl` key `design-grill-step`
- Proposed format comment: https://github.com/cbartens/bkit/issues/895#issuecomment-6737321246
- #703 — Standardise question and option labels in prompts and workflows (https://github.com/cbartens/bkit/issues/703)
- #798 — Record owner answers to open questions after design and plan close (https://github.com/cbartens/bkit/issues/798)
- #750 — Workflow optimisation (https://github.com/cbartens/bkit/issues/750) (parent)

## Issue comment — posted 2026-11-09T10:04:50.000Z

### Proposed shared question format

One shape for all 11 points in the audit. It keeps the labels the code and the reviewers already look for, so the change is mostly layout.

```
**Q{n} — {title}:** {what you are deciding, in plain English, worded so "yes" takes the recommendation}
A) {option} — {what happens if you pick it}
B) {option} — {what happens if you pick it}
Recommended: A) {option} — {why}
Default if unanswered: {what happens}
```

Once at the end of every message:

```
Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the run can be resumed.
```

When a round has 3 or more questions, the footer adds: `Or say "one by one" and I'll ask them one at a time.`

**Why each part**

- **One option per line, each with what it does.** The per-option trade-off is what makes the plan and design open questions easy to answer. One line per option also removes both separators in use today: ` / ` in decision files and ` · ` in plan and design questions. Short lines read better on a phone.
- **`Recommended:` and `Default if unanswered:` keep their current labels.** `decisions.ts` already reads `Recommended: A) Accept — reason`. `bkit-plan-scope-check` and `bkit-design-review-2` already check for `Default if unanswered`. Keeping both avoids rewording those prompts.
- **The default line says what actually happens, from a fixed set:** `the run waits for you`, `taken as A when nobody can be asked`, `the plan assumes A`, or `written as a needs-decision deferral` (ship #10). Today "default" means "what the plan assumes" in #3 and #4, while in build it means "what a run with nobody to ask takes", and build never shows it.
- **Hard blockers:** `Recommended: none — {why only you can decide}`. "yes" skips them, which is already the rule.
- **Delivery:** one message per round, with one at a time on request (Q1 option C). This keeps "yes" taking every recommendation and keeps decision files written in one go, while long rounds still get the easier path.
- **No host question tool anywhere** (Q3 option A). The `design-grill-step` reasons (4x4 cap, Claude only) apply to every point.

**The three stops (Q4)**

- **#7 and #8 become questions,** because the answer can be given in chat. For example: `A) Use branch {x} — tests run there` / `B) Stop — handover; the run can be resumed`.
- **#9 stays a stop,** because the answer is an action, not a choice. It gets one fixed line: `**Action needed — {title}:** {what to do}. Then say "continue".`

**Example: a build verify gap in the new shape**

```
**Q1 — Missing retry test (Task 4):** The retry path has no test that failed before the code existed. Accept the gap as it is?
A) Accept — the gap is recorded as accepted and the build moves on
B) Fix now — one more fix round runs for this group before the build moves on
Recommended: A) Accept — the retry path is covered by the Task 5 integration test
Default if unanswered: the run waits for you; with nobody to ask, A is taken and ship asks you to confirm it
```

**What it touches**

- **`.bkit/core/engine/commands/workflow/decisions.ts`:**
  - `itemLines` writes one option per line and the default line.
  - `decision-items.json` gains a per-option `effect`.
  - `parseDecisionItems` reads both the new per-line options and the old single `Options:` line, because ship reads again the decision files of runs already in progress.
- **Shared wording:**
  - `.bkit/authoring.md` § Human questions defines the shape once.
  - The open-questions clause in `.bkit/instructions.md` moves from inline ` · ` to one option per line. Add the instructions entry first, and run the check before `instructions:sync --write`.
- **Workflow text:** the fixed questions in `bkit-design.md` (grill, draft scenario), `bkit-debug.md` (Loop Question, #7, #8, #9) and `bkit-ship.md` (#10, #11), plus the one-by-one step in the design and plan close.
- **Rendered mirrors and snapshots** (`.bkit/core/engine/render/__snapshots__/`), regenerated in the same change.
