# One Shared Question Format Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

bkit asks its owner questions at 11 points across `/bkit-design`, `/bkit-plan`, `/bkit-build`, `/bkit-debug` and `/bkit-ship` (the audit table in #895). The points use four different layouts:

<!-- prettier-ignore -->
| Layout today | Points | What the owner cannot see on the page |
| --- | --- | --- |
| One question at a time, an inline `Options: A) {option} — {trade-off} · B) …` list, `Recommended`, `Default if unanswered` | #3, #4 (design and plan open questions) | Nothing missing; this is the layout the issue keeps |
| One message, bare labels (`Options: A) Accept / B) Fix now`), `Recommended:` or `No recommendation` | #1, #2, #5, #6, #10, #11 | What each option does, and what happens when nobody answers |
| A **STOP** that names the problem and asks for a branch or reference | #7, #8 | The options, the recommendation and how to resume |
| A **STOP** that asks for a commit or a revert | #9 | What to type to continue |

The build's decision files are read back by code. `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts` splits one `Options:` line on ` / ` and matches the bare option names (`Accept`, `Fix now`, `Try again`), and `apply`, `pending`, `summary.ts`, `summary-findings.ts` and `challenge.ts` all read its output. The layout change therefore has to keep those names parseable, and has to keep reading decision files that runs already in progress wrote in the old layout.

Goals:

- One question shape, defined once in `.bkit/authoring.md` § Human questions (source `.bkit/core/.bkit/authoring.md`), used at all 11 points.
- `bkit decisions compose` writes the shape from a `decision-items.json` whose options each carry an `effect`; `parseDecisionItems` reads both layouts.
- The plan and design open-question writers (`bkit-plan-*`, `bkit-design-*` prompts and the plan template) write one option per line.
- The question-format audit (`.bkit/core/engine/audits/workflows/question-option-format.test.ts`) checks the new shape across workflows, prompts, templates and authoring docs.

**Related Issues:**

- #895 — One question format for every owner question in the workflows (OPEN)
- #703 — Standardise question and option labels in prompts and workflows (CLOSED)
- #798 — Record owner answers to open questions after design and plan close (CLOSED)
- #750 — Workflow optimisation (OPEN)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

Every question point in every workflow uses one shared question shape. The owner can answer any of them from the page alone: what is being decided, what each option does and costs, what is recommended and why, and what happens if they don't answer.

> Source: #895 § Outcome, word for word. The issue is idea-shaped and has no `Narrative` field, so the plan takes its `Outcome` section (Open Questions & Assumptions, A1).

### Success Criteria

- The shared question shape (below) is defined once in `.bkit/authoring.md` § Human questions plus a shared clause in `.bkit/instructions.md`, and every row in the audit table uses it.
- Each option is on its own line with what happens if it is picked, including the fixed-option pauses (#5, #6, #10, #11).
- Each question has a `Default if unanswered:` line saying what actually happens.
- Each recommendation carries a reason.
- `bkit decisions apply` and `decisions pending` read decision files in both the new layout and the old single `Options:` line layout.

The shared shape, from #895:

```
**Q{n} — {title}:** {what you are deciding, in plain English, worded so "yes" takes the recommendation}
A) {option} — {what happens if you pick it}
B) {option} — {what happens if you pick it}
Recommended: A) {option} — {why}
Default if unanswered: {what happens}
```

Once at the end of every message: `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the run can be resumed.` When a round has 3 or more questions, the footer adds `Or say "one by one" and I'll ask them one at a time.`

### Process Sketch

- **WHEN** a build pause reaches the owner **→ THEN** each question shows one option per line with what it does, a `Recommended:` line with its reason, and a `Default if unanswered:` line, and the message ends with the shared reply line.
- **WHEN** the owner replies "yes" **→ THEN** every recommendation is taken, and a `Recommended: none` question stays unanswered and is asked again.
- **WHEN** a round has 3 or more questions and the owner replies "one by one" **→ THEN** the questions are asked one at a time, in order.
- **IF** ship reads a decision file a run wrote before the change, with one `Options:` line **→ THEN** `decisions pending` and `decisions apply` read it as before.
- **IF** `/bkit-debug` cannot tell which branch or CI run to use **→ THEN** it asks a formatted question whose options name the candidates, instead of a bare stop.
- **IF** a file the run commits was changed before the run (foreign path) **→ THEN** debug shows one `**Action needed — {title}:**` line and waits for "continue".

### Concrete Example

**Setup:** The owner runs `/bkit-build #N` in a Claude Code session. Group 2's verify round finds that Task 4's retry path has no test that failed before its code existed, and the remediate round could not fix it. `build.verify.ask` is `true`.

**Steps:**

1. The build writes `decision-items.json` with one item whose options are `{"name": "Accept", "effect": "the gap is recorded as accepted and the build moves on"}` and `{"name": "Fix now", "effect": "one more fix round runs for this group before the build moves on"}` → `bkit decisions compose` writes `build-decision-1-1.md`.
2. The build shows the owner:
   ```
   **Q1 — Missing retry test (Task 4):** The retry path has no test that failed before the code existed. Accept the gap as it is?
   A) Accept — the gap is recorded as accepted and the build moves on
   B) Fix now — one more fix round runs for this group before the build moves on
   Recommended: A) Accept — the retry path is covered by the Task 5 integration test
   Default if unanswered: the run waits for you; taken as A when nobody can be asked
   Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the run can be resumed.
   ```
3. The owner replies `B` → the build reads it as `Fix now` and runs one more fix round for group 2.

**Outcome:** The owner decided from the message alone, without opening the decision file or the plan, and the build carried out the option the letter labels.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| The owner replies "yes" to a round that holds a `Recommended: none` question | Every other recommendation is taken; the `Recommended: none` question stays open and is asked again |
| The owner replies with a letter (`B`, `B)`, `B) Fix now`) | The letter maps to exactly one option, the same way it does today (`optionAnswer`) |
| Ship reads a decision file written before the change (one `Options: A) Accept / B) Fix now` line, `No recommendation — …`) | `parseDecisionItems` returns the same options, recommendation and decision as before; `pending` and `apply --by=owner` work unchanged |
| A headless run (`runtimeHeadless` true) or `ask: false` reaches a pause | `decisions apply --by=headless` takes each recommendation and leaves `Recommended: none` items as hard blockers (exit 4), as today |
| `decision-items.json` has an option with no `effect`, or an option given as a bare string | `decisions compose` exits 2 naming the item, and writes no file |
| A round has exactly 2 questions | The footer has no "one by one" line |
| A round has 3 or more questions (the loop question counts) | The footer adds `Or say "one by one" and I'll ask them one at a time.` |
| The owner replies "one by one" | Each unanswered question is asked in its own message, in order; routing waits for the last answer |
| `/bkit-debug` Step 1 cannot pick a branch (`branches parse` exit 3 or 8) | A formatted question names each candidate branch as an option; no status rows are written, because Step 1 has no status file yet |
| `/bkit-debug` Step 2 cannot pick a CI run (`runs locate` exit 8 or 82) | A formatted question names each candidate reference as an option, with the existing `owner-pause reason=decision` row |
| A foreign path stops `/bkit-debug` (exit 10) | One `**Action needed — {title}:** {what to do}. Then say "continue".` line; on "continue" the block re-runs |
| An option's own text contains ` / ` or ` · ` | It stays one option, because each option is on its own line |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. Tests that read shipped workflow, prompt and template text sit in `.bkit/core/engine/audits/workflows/` and run at the Unit tier (`docs/testing.md` § Stack). `decisions.test.ts` drives the `decisions` verbs in-process against a temporary git checkout (Unit, boundary: real temp git repo).

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| A decision file with one option per line parses to bare option names, with each effect dropped | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| `Recommended: none — {why}` parses as a hard blocker (no recommendation) | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| A lettered `Decision:` in a per-line file reads as the option its letter labels | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| `apply --by=headless` on a per-line file leaves a `Recommended: none` item for the owner (exit 4) | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| A decision file in the old single `Options:` line layout still parses (existing `parseDecisionItems keeps the bare option name, dropping the letter`, `a decision file written before the letters still parses`) | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| `compose` writes each option on its own line with its effect, and no `Options:` line | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` refuses an option with no effect or given as a bare string (exit 2, no file) | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` writes a `Default if unanswered:` line for each question | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` writes `Recommended: none — {why}` for a hard blocker | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` ends the file with the shared reply line | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` adds the "one by one" line from 3 questions on, and not for 2 | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose --loop` writes an effect for each loop option | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| An effect-carrying item round-trips through `compose` and `parseDecisionItems` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| The canonical shape in § Human questions puts each option on its own line with its effect | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The canonical shape carries a `Default if unanswered:` line from the fixed set | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The canonical shape gives a hard blocker `Recommended: none — {why}` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The canonical shape ends a message with the shared reply line and the "one by one" offer | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| RED-PROOF: a synthetic option line with no effect fires the option-line rule | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The `.bkit/workflows.md` § Question layout bullet points to § Human questions instead of restating the old layout | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| Build: every decision item option carries an effect | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 4 |
| Build: the pause message shows the default line and `Recommended: none` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 4 |
| Build: a "one by one" reply asks the questions one at a time | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 4 |
| Debug: the loop question gives each option its effect and the recommendation a reason | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 5 |
| Debug: every question shows a `Default if unanswered:` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 5 |
| Debug: the branch check (exit 3 or 8) asks a formatted question | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 5 |
| Debug: the CI-reference stop (exit 8 or 82) asks a formatted question | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 5 |
| Debug: the foreign-path stop shows the `**Action needed — {title}:**` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 5 |
| Debug: every question message ends with the shared reply line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 5 |
| Ship: the assumed-item question gives each option its effect | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Ship: an assumed item is a hard blocker with `Recommended: none — {why}` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Ship: every question shows a `Default if unanswered:` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Ship: the merge question gives each option its effect | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Ship: every question message ends with the reply line its point uses | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 6 |
| Design: the grill question gives each option its effect and the recommendation a reason | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 7 |
| Design: the draft-scenario question gives each option its effect | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 7 |
| Design: every question shows a `Default if unanswered:` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 7 |
| Design: the grill message ends with the shared reply line and the "one by one" offer | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 7 |
| Design and plan: the one-by-one open-questions pass forbids the host question tool | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 7 |
| The plan template puts each open-question option on its own line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| Every open-question rule in the prompts asks for one option per line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| The design review flags an open question whose options share one line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| The prompts index describes one option per line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| No workflow, prompt, template or authoring doc carries an inline `Options:` list | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| `bkit-build`: the none render matches its regenerated baseline (existing `bkit-build: the none render matches its baseline byte for byte`) | Unit | `.bkit/core/engine/render/trackers.test.ts` | 4 |
| `bkit-debug`: the none render matches its regenerated baseline (existing) | Unit | `.bkit/core/engine/render/trackers.test.ts` | 5 |
| `bkit-ship`: the none render matches its regenerated baseline (existing) | Unit | `.bkit/core/engine/render/trackers.test.ts` | 6 |
| `bkit-design` and `bkit-plan`: the none renders match their regenerated baselines (existing) | Unit | `.bkit/core/engine/render/trackers.test.ts` | 7 |
| The new reply-line clause and the widened `workflow-plain-text-questions` carriers match their masters (existing instruction tool suites) | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 7 |
| The `plan-open-questions` clause master and its four prompt copies match (existing instruction tool suites) | Unit | `.bkit/core/engine/tools/instructions-sources.test.ts` | 8 |
| The installed copies match their sources after `bkit upgrade` (drift gate) | Static | `pnpm bkit check` | 9 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

<!-- prettier-ignore -->
| Change | Who it breaks | Handling |
| --- | --- | --- |
| `decision-items.json` `options` changes from strings to `{"name", "effect"}` objects; `decisions compose` refuses a bare string (exit 2) | The build orchestrator's Decision Pause step 2, and any consumer script calling `bkit decisions compose` by hand (the verb is `use: workflow`) | `bkit-build.md` changes in the same release (Task 4); A3 covers a run caught mid-step |
| Decision file layout: one line per option, `Recommended: none — {why}` in place of `No recommendation — {why}`, a `Default if unanswered:` line, a new last line | Anything that greps decision files for `Options:` or `No recommendation` | `parseDecisionItems` reads both layouts; nothing else in the engine parses the file (language-server references) |
| Plan template `Open Questions & Assumptions` placeholder: `**Open Question:**` with an inline `**Options:**` list becomes `**Q{n} — [title]:**` with one option per sub-bullet | `bkit-plan-*` prompts and consumers' copies of `docs/templates/bkit-plan.md` (managed, re-rendered by `bkit upgrade`) | The prompts' clause moves in the same change (Task 8); `summary.ts` copies the section word for word, so it is layout-agnostic |
| The owner's reply line changes from `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.` to `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the run can be resumed.` | Owners used to the old wording; no parser reads it | None needed: "yes", "stop" and letters mean what they meant |

**Names introduced:**

- `effect` — the per-option field in `decision-items.json`.
- `workflow-question-reply-line` — the new `.bkit/instructions.md` clause.
- `{SESSION_DIR}/owner-answer.md` — the one-line answer file the debug branch and CI-run questions write (Q3, option A).
- `**Action needed — {title}:**` — the fixed line for a stop whose answer is an action.
- `Recommended: none` — the hard-blocker line.

No route, table, package script, CI check or public API name changes.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Assumption A1:** The issue's `Outcome` section is the plan's `Narrative`, because the issue is idea-shaped and has no `Narrative` field; `Success Criteria` come from its `Success criteria` section → if wrong, the owner supplies a `Narrative` and the Acceptance Scenario is re-confirmed; no task changes.
- **Assumption A2:** Chat hosts (Claude Code, OpenCode, Codex, Cursor, Antigravity) show each line of a question on its own line → if wrong, the options of a chat question run together into one paragraph, and § Human questions must switch the option lines to list bullets. Files (decision files, plans, designs) are unaffected: the plan template and design template use list bullets (Task 8), and decision files are read by code.
- **Assumption A3:** No build run is stopped between writing `decision-items.json` and calling `decisions compose` across a bkit upgrade → if wrong, `compose` exits 2 on the old bare-string options and the Decision Pause goes to the Failure Path; rewriting the items with effects and re-running the block recovers.
- **Assumption A4:** Ship, summary and challenge only re-read decision files that runs in progress wrote; nothing re-composes an old file → if wrong, a file could hold items in both layouts. `parseDecisionItems` reads the layout per item (Task 1), so a mixed file still parses.
- **Assumption A5:** `/bkit-debug` Step 1 has no `{STATUS}` yet when `branches parse` exits 3 or 8, so the branch question writes no `owner-pause` or `owner-answer` row → if wrong (a status file exists), the question records both rows as every other point does.
- **Assumption A6:** #891 (`docs/plans/202611/891-build-gate-stuck-plan.md`) also changes `decisions compose` (`--base-check`, the verify loop's progress line) and `apply` (`--by=rerun`). Whichever change merges second resolves the overlap in `decisions.ts` and `bkit-build.md`, and every loop option #891 adds gets an effect → if wrong, a loop option without an effect makes `compose` exit 2.
- **Open Question Q1 — Default-line wording beyond the four fixed phrases:** #895 lists four phrases (`the run waits for you`, `taken as A when nobody can be asked`, `the plan assumes A`, `written as a needs-decision deferral`). Build points behave differently with and without someone to ask, and the design grill assumes unanswered items into the design, not a plan. → The owner resolves it at plan review.
  - **Options:** A) Allow two fixed phrases joined with `; ` where a point behaves differently with and without someone to ask (`the run waits for you; taken as A when nobody can be asked`, as the #895 comment's worked example does), and add `the design assumes A` for the grill — every default stays from a closed set and says what really happens · B) Exactly the four phrases; build shows only `the run waits for you`, and the grill uses `the plan assumes A` — the shortest set, but a headless reader of a decision file cannot see what was taken, and the grill line names the wrong document · C) Free text per point — fits every case, but the audit test can no longer check the line against a closed set
  - **Recommended:** A) Two joined phrases plus `the design assumes A` — it matches the worked example in the issue comment and keeps the default checkable.
  - **Default if unanswered:** the plan assumes A.
- **Open Question Q2 — The reply line where "stop" does not write a handover:** At the design grill, "stop" ends the interview and the design goes on with what is settled. At ship's Confirm Assumed Items (#10) there is no stop route and no recommendation, so "yes" answers nothing. → The owner resolves it at plan review.
  - **Options:** A) Keep the lead sentence `Reply with a letter per question, or "yes" to take every recommendation.` wherever a point has a recommendation, and make the second sentence say what "stop" does there: the grill writes `"stop" ends the interview; the design goes on with what is settled.`, and #10 writes `Reply with a letter per question. Ship merges either way; anything you do not confirm is written as a needs-decision deferral.` — every footer is true, and no stop route changes · B) The identical footer everywhere, and add a handover route at the grill and at #10 — one footer, but it changes what the workflows do once answered, which #895 rules out · C) The identical footer everywhere with no route changes — one footer, but at the grill and #10 it promises a handover that never happens
  - **Recommended:** A) Same lead sentence, point-true second sentence — it keeps the shared wording where it is true and changes no routing.
  - **Default if unanswered:** the plan assumes A.
- **Open Question Q3 — How a debug branch or CI-run answer reaches the re-run (#7, #8):** `branches parse` and `runs locate` read the session prompt (`{SESSION_DIR}/prompt.md`), which still names every candidate after the owner answers. → The owner resolves it at plan review.
  - **Options:** A) Write the owner's pick to `{SESSION_DIR}/owner-answer.md` (`branch={x}` for #7; the chosen run or PR URL, or `[local]`, for #8) and re-run the same command with `--prompt-file="{SESSION_DIR}/owner-answer.md"` — the existing verbs validate the answer, and no engine change is needed · B) Append the pick to `{SESSION_DIR}/prompt.md` and re-run — no new file, but an ambiguous prompt still holds every candidate, so exit 8 repeats · C) Keep today's resume: the owner re-invokes `/bkit-debug` with a narrower prompt, and the question only tells them what to type — no in-session answer, which contradicts the decision that the answer can be given in chat
  - **Recommended:** A) A one-line answer file read by the same verb — the answer is validated exactly like a prompt token.
  - **Default if unanswered:** the plan assumes A.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Why rejected or chosen |
| --- | --- |
| **Chosen:** one option per line, `{L}) {name} — {effect}`; `parseDecisionItems` takes the name as the text before the first ` — ` and falls back to the `Options:` line per item | Keeps the bare names `apply`, `pending`, `summary.ts`, `summary-findings.ts` and `challenge.ts` match on, removes both separators (` / `, ` · `), and reads every file runs in progress already wrote |
| Keep the inline `Options:` line and explain each option's cost in the question text | The owner still has to find each option's cost in prose (the #5 problem in the audit) |
| Use the plan / design inline ` · ` list everywhere, effects inside each entry | Two separators stay in use, and an option whose own text holds ` / ` or ` · ` still splits into bogus entries |
| A host question tool (Claude's `AskUserQuestion`) | Caps at 4 questions of 4 options and exists only in Claude (`docs/decisions.jsonl` `design-grill-step`); the owner ruled it out at every point |
| `effects` as a parallel array beside `options` in `decision-items.json` | Two arrays can drift out of step (an effect lands on the wrong option); one `{name, effect}` object per option cannot |
| A migration that rewrites old decision files into the new layout | Not needed: the parser reads both layouts, and old files are only ever re-read (A4) |
| Compute each fixed option's effect in `compose` (`Accept`, `Fix now`, `Stop`) instead of the orchestrator writing it | The effect depends on the pause (verify gap vs challenge task vs unproven test), which only the orchestrator knows; `compose` fixes only the loop question's effects, which it already words itself |

**Future phase:** the five workflows' Step 1 issue-and-branch stops (`fids parse` exit 8 or 9, the `feat/{slug}` rename on exit 3) are not in the #895 audit; whether they become questions or `**Action needed**` lines is an owner decision (`Out of Scope`).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The plan template's `👤 ✅ Human Confirmation` checkboxes (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions confirmed) | No Success Criterion or matrix row needs them: the owner ticks them in the plan file, so they are a document gate, not a chat question | #895 § Constraints and non-goals; `docs/deferrals.jsonl` `895-plan-human-confirmation-checkboxes-stay-a-document-gate` |
| When the workflows pause, the `bkit.workflows.*` limits, and what an answered decision does (including what "stop" does at the grill and at ship's Confirm Assumed Items) | The change is the question layout only; no Success Criterion needs a routing change | #895 § Constraints and non-goals; `docs/deferrals.jsonl` `895-pause-timing-limits-and-answer-effects-unchanged` |
| Step 1's issue-and-branch stops in all five workflows (`fids parse` exit 8 and 9, the `feat/{slug}` rename on exit 3) | They are not rows of the #895 audit table, which is what the Success Criteria name; whether each becomes a question or an `**Action needed**` line is an owner decision | Follow-up issue; `docs/deferrals.jsonl` `895-start-step-issue-and-branch-stops-question-shape` (`needs-decision`) |

Not questions, so outside the shape by #895's own audit: the `--suggest` "ask me one by one" offer and the "plain English explanation" offer in the final returns, and every subagent prompt (subagents cannot reach the owner).

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| The question-format audit splits an option's own `/` into bogus entries | `docs/deferrals.jsonl` `703-standardise-question-option-challenge-low-bkit-core-engine-audits-workflows-question-option-format-test-ts-50` | Tasks 3 and 8 rewrite that scanner; once no inline `Options:` list remains (Task 8's end check), the splitting has nothing left to split | Close the row at ship after Task 8 lands, if the owner agrees; no extra task |
| #891 — Build: gate stuck on tests already red on dev, owner accept ignored (OPEN) | Tracker; `docs/plans/202611/891-build-gate-stuck-plan.md` | `decisions compose` (`--base-check`, verify-loop progress line), `apply --by=rerun`, `bkit-build.md` Decision Pause | Keep separate; sequence this build after #891 merges (Pre-Flight, A6) |
| Apply the base-commit check to `/bkit-debug`'s Loop Question | `docs/deferrals.jsonl` `891-debug-base-red-label` | `bkit-debug.md` § Loop Question (Task 5) | Keep deferred; it changes what the question says, not its layout |
| A Decision Pause composed before a renumber resumes with its old `Pause step` | `docs/deferrals.jsonl` `705-build-plan-convert-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-279` | Runs caught across a bkit upgrade (A3) | Keep deferred; this plan changes no step numbers |

## Security & Privacy

- [ ] **New API Route** — not applicable: no route.
- [ ] **New DB Table/Column** — not applicable: no database.
- [ ] **Role-Gated Mutation** — not applicable: no roles.
- [ ] **User Input** — applies: `decision-items.json` is orchestrator-written input to `decisions compose`. `composeItems` validates it in the handler (array shape, title, question, `{name, effect}` per option, at most 26 options, `recommended` among the names) and exits 2 on any failure before writing a file. The owner's answer files for the debug branch and CI-run questions (`{SESSION_DIR}/owner-answer.md`) are validated by `branches parse` (`git check-ref-format`, ref existence) and `runs locate` (exact identity checks), exactly as a prompt token is.
- [ ] **PII** — not applicable: no new log line; question text holds plan and test names only.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable.

Checked against `docs/security.md` § Untrusted Content & Prompt Injection and § Shell Injection:

- A reply is matched to a letter or option name (`optionAnswer` in code, the `workflow-letter-reply` clause in the workflows); any other reply is answered and asked again, never run as an instruction.
- The candidate branches and CI references that become debug question options come from `branches parse` / `runs locate` output, which already validates them; the question shows them as data.
- The workflow writes `{SESSION_DIR}/owner-answer.md` with the file-write tool, never by putting the owner's reply into a shell command (`echo "{reply}" > …`), so shell metacharacters in a reply cannot run.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added or removed; `package.json` and `pnpm-lock.yaml` stay as they are.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (run 2026-11-09) lists only dev dependencies behind: `oxlint` 1.89.0 → 1.90.0, `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5. None is used by the changed code paths, so none blocks the build. Toolchain: Node v24.16.0, pnpm 10.34.7. No stack CLI is involved (no deploy, no database).
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`: language-server references to `parseDecisionItems` (callers in `decisions.ts`, `summary.ts`, `summary-findings.ts`, `challenge.ts`), text search for `Options:`, `Recommended:`, `No recommendation`, `Default if unanswered`, `Reply per question`, `· B)`, `host question tool`, `Action needed` and `one by one` across `.bkit/core/` and `.bkit/instructions.md`.
- [ ] **User Context:** every file the runbook names was opened in this session and is writable in the worktree `/Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format`. The owner's answers to Q1-Q3 are the only missing information; each has a default.
- [ ] **Project Context:** read `docs/decisions.jsonl` `design-grill-step` (host question tool caps at 4 questions of 4 options and exists only in Claude), `891-resume-reruns-a-red-gate-pause` (#891 touches `decisions apply`); `docs/knowledge.jsonl` `instructions-store-clause-text-and-local-entries-need-hand-edits` and `renumbering-a-workflow-leaves-instructions-md-local-entries-stale` (every edited standing line needs its `.bkit/instructions.md` local entry edited by hand; `pnpm instructions:sync` does not drop stale entries); `docs/deferrals.jsonl` rows from #703 on `question-option-format.test.ts` and `decisions.ts`.
- [ ] **Testing & Quality:** shipped-text checks stay in `.bkit/core/engine/audits/workflows/` at the Unit tier; the `decisions` verbs are tested in-process against a temporary git checkout with no mocks (`docs/testing.md` § Stack, § Tiers). No E2E or `@live` tier applies: bkit has no deployed surface.
- [ ] **Prerequisite Plans:** None must be built first. Sequencing advice: #891's plan (`docs/plans/202611/891-build-gate-stuck-plan.md`) edits the same `decisions compose` and Decision Pause text; building this plan after #891 merges, on a branch rebased onto `dev`, avoids a three-way edit of `itemLines` and the loop question (A6).

### Conditional

- [ ] **Secrets & Env Vars:** not applicable — no credential or env var is added.
- [ ] **Schema State:** not applicable — no database; decision files are markdown under `docs/plans/{YYYYMM}/logs/{FID}/`.
- [ ] **Architecture & UI:** no new file and no UI; every change edits an existing file in the place `docs/architecture.md` already gives it (engine command, workflow source, prompt source, authoring doc, template source).
- [ ] **Observability:** not applicable — no new log line, audit table or trace. Owner waits and replies keep their existing `owner-pause` / `owner-answer` status rows.
- [ ] **Notifications:** not applicable — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

No database. The only persisted shapes are two file formats the engine reads and writes; neither is in `docs/data-schema.md`, which holds no tables for bkit.

### Data Schema Usage

- **Input (Read):** `build-decision-{RUN}-{N}.md` (decision file: header lines, optional `## Progress` block, one `**Q{n} — {title}:**` item per question, `Decision:` / `Rejected:` / `Deferred:` lines), read by `parseDecisionItems`.
- **Input (Read):** `{OUTBOX}/decision-items.json`, read by `decisions compose --items`.
- **Output (Write):** decision files, written by `decisions compose`, `apply` and `pending --defer`.

### Data Schema Changes

- **MODIFY:** decision file item layout — the `Options: A) {A} / B) {B}` line becomes one line per option, `{L}) {name} — {effect}`; `No recommendation — {why}` becomes `Recommended: none — {why}`; each item gains a `Default if unanswered: {what happens}` line; the file's last line becomes the shared reply line, plus `Or say "one by one" and I'll ask them one at a time.` from 3 questions on. The old layout stays readable.
- **MODIFY:** `decision-items.json` — `options` becomes an array of `{"name": "{option}", "effect": "{what happens if it is picked}"}` objects; `recommended` names an option's `name`. A bare-string option is refused.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Read one option per line and `Recommended: none` from a decision file | `.bkit/core/engine/commands/workflow/decisions.ts` | language-server references to `parseDecisionItems` (callers `applyRecommendations`, `apply`, `pending`, `summary.ts` `buildSummary`, `summary-findings.ts` `challengeResolution`, `challenge.ts` `acceptedLocations`); `grep -rln 'Options:\|No recommendation' .bkit/core/engine --include='*.ts'` | `parseDecisionItems` — reads the `Options:` line and `No recommendation`; missing per-line options and `Recommended: none` | EXTEND | Add the per-line read and the `none` recommendation; keep the `Options:` fallback and the `DecisionItem` fields, so no caller changes |
| Write the shared shape into a decision file | `.bkit/core/engine/commands/workflow/decisions.ts` | references to `itemLines`, `letteredOptions`, `composeItems`; `grep -n 'Reply per question' .bkit/core/engine/commands/workflow/decisions.ts` | `itemLines` and the `compose` verb — write `Options:`, `Recommended:` / `No recommendation` and the old reply line; missing effects, the default line and the "one by one" offer | EXTEND | Rewrite `itemLines` and the footer in place; `letteredOptions` stays for the deferral description |
| A per-option effect in `decision-items.json` | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -rn -i 'effect' .bkit/core/engine/commands/workflow/decisions.ts .bkit/core/engine/commands/workflow/challenge.ts` (no hit); `grep -rn 'decision-items.json' .bkit/core/workflows/*.md` (only `bkit-build.md`) | `ComposeItem` / `composeItems` — validate title, question, string options and recommendation; missing effect | EXTEND | `options` items become `{name, effect}`; `composeItems` validates both fields |
| Define the shared question shape once | `.bkit/core/.bkit/authoring.md` | `grep -n 'Human questions' .bkit/authoring.md .bkit/core/.bkit/authoring.md`; `grep -n 'Question layout' .bkit/core/.bkit/workflows.md` | § Human questions (inline `Options:` shape, `No recommendation`, debug Loop Question example); `.bkit/core/.bkit/workflows.md` § Question layout restates it | EXTEND | Rewrite § Human questions to the new shape, footer, default set, hard-blocker line, one-by-one route and `Action needed` line; point § Question layout at it instead of restating it |
| Shared reply line across workflows | `.bkit/instructions.md` | `grep -n 'Reply per question\|host question tool' .bkit/instructions.md`; `pnpm instructions:show --file bkit-debug` | `workflow-plain-text-questions` clause (carriers all but `bkit-auto`, `bkit-plan`), `workflow-letter-reply` and `workflow-record-reply` clauses; the old reply line is a local entry in `bkit-debug`, with no clause | EXTEND | Add a `workflow-question-reply-line` clause in § Clauses with its carriers; widen `workflow-plain-text-questions` to `bkit-plan` |
| Ask a round one question at a time on request | `.bkit/core/.bkit/authoring.md` | `grep -rn 'one by one' .bkit/core/workflows .bkit/instructions.md` | `workflow-open-questions-one-by-one` clause (design and plan open questions only) | EXTEND | § Human questions states the one-by-one route for every round; the clause keeps its design / plan role and gains the shared-shape wording |
| Formatted questions at the debug branch and CI-run stops (#7, #8) | `.bkit/core/workflows/bkit-debug.md` | `grep -n 'STOP' .bkit/core/workflows/bkit-debug.md`; read `branches parse` (`.bkit/core/engine/commands/workflow/branches.ts`) and `runs locate` (`.bkit/core/engine/commands/workflow/runs.ts`) exit codes | `branches parse` exit 3 / 8 and `runs locate` exit 8 / 82 already print the candidates and validate a named branch or reference | EXTEND | Reword the two routes as questions; re-run the same verbs on the owner's answer (Q3), so no new engine verb |
| `Action needed` line at the foreign-path stop (#9) | `.bkit/core/workflows/bkit-debug.md` | `grep -rln 'Action needed' .bkit/core .bkit/authoring.md` (no hit) | `Foreign path` bullet — asks in prose | EXTEND | Replace the prose ask with the fixed line; keep its `owner-pause reason=foreign-path` rows |
| Check the shape across the shipped text | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | `grep -rln 'Options:' .bkit/core/engine --include='*.test.ts'`; read the whole file | `question-option-format.test.ts` — scans workflows, prompts, templates and authoring docs for inline lettered `Options:` lists and lettered `Recommended:` lines | EXTEND | Add per-line option blocks, the default line, the reply line and `Recommended: none` to the scan; keep the RED-PROOF style |
| Open questions written one option per line | `.bkit/instructions.md` (`plan-open-questions`), `.bkit/core/prompts/bkit-design-generate.md`, `.bkit/core/prompts/bkit-design-update.md`, `.bkit/core/prompts/bkit-design-review-2.md`, `.bkit/core/docs/templates/bkit-plan.md`, `.bkit/core/.bkit/prompts.md` | `grep -rln -e '· B)' -e 'Default if unanswered' .bkit/core/workflows .bkit/core/prompts .bkit/core/docs/templates .bkit/core/.bkit .bkit/instructions.md` | the `plan-open-questions` clause and its four prompt copies; the design prompts' local rule lines; the plan template placeholder; two `.bkit/core/.bkit/prompts.md` rows | EXTEND | Reword each to one option per line; `pnpm instructions:sync` rewrites the four plan-prompt copies |

## Architecture & Component Changes

Every change edits an existing file; there is no `[NEW]` and no `[DELETE]` file (every `Reuse Inventory` row is `EXTEND`).

**Ledger rows:** `895-shared-question-shape`, `895-question-delivery-one-message-one-by-one-offer`, `895-decision-items-per-option-effect`, `895-host-question-tool-forbidden-everywhere`, `895-debug-branch-and-ci-stops-become-questions`, `895-question-labels-kept`, `895-plan-human-confirmation-checkboxes-stay-a-document-gate`, `895-pause-timing-limits-and-answer-effects-unchanged`, `895-start-step-issue-and-branch-stops-question-shape`

### Database Migrations

None — bkit has no database. No upgrade migration either: old decision files stay readable (`Data Schema Changes`).

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.ts`

- **Existence Check:** the file exists (597 lines); `parseDecisionItems`, `ComposeItem`, `composeItems`, `itemLines`, `letteredOptions` and `decisionsCommand` were read in full.
- **File header comment:** describes the new item layout and says the old `Options:` line is still read.
- `parseDecisionItems` (exported; signature unchanged, `DecisionItem` unchanged):
  - Options: the item's lines that match `^[A-Z]\) ` after its `**Q{n} — …:**` line, in order; each name is the text after the letter up to the first ` — `. **If** the item has no such line → split the `Options:` line on ` / ` as today.
  - Recommendation: `Recommended: none — {why}` → `recommended` null and `reason` = `{why}`. `No recommendation — {why}` still reads as null.
  - The `Default if unanswered:` line is not parsed; nothing reads it back.
- `ComposeItem.options` becomes `Array<{ name: string; effect: string }>`. `composeItems` refuses (exit 2, `item {i}: option {L} needs a name and an effect`) an option that is a bare string or lacks either field, and checks `recommended` against the names.
- `itemLines(n, item)` writes, in order:
  - `**Q{n} — {title}:** {question}`.
  - One line per option: `{L}) {name} — {effect}`.
  - `Recommended: {L}) {name} — {reason}`, or `Recommended: none — {noRecommendation}` for a hard blocker.
  - `Default if unanswered: the run waits for you; taken as {L} when nobody can be asked`, or `Default if unanswered: the run waits for you` for a hard blocker (Q1, option A).
- `compose --loop`: the loop question's options get fixed effects: `Try again — one more fix round runs`, `Decide — the questions below are asked instead of another round`, `Stop — the run stops with a handover; the next run resumes here`.
- The file's last lines: `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the run can be resumed.`, then `Or say "one by one" and I'll ask them one at a time.` when the file holds 3 or more questions, the loop question included.
- The `--items` flag help names the new shape: `JSON file: [{title, question, options: [{name, effect}], recommended, reason} | {…, noRecommendation}]`.
- `deferralRow` keeps `letteredOptions` (names only), so `docs/deferrals.jsonl` descriptions do not change.
- Callers `summary.ts`, `summary-findings.ts` and `challenge.ts` need no change: they read `title`, `decision`, `assumed` and `options`, whose values are the same for both layouts.

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.test.ts`

- **Existence Check:** the file exists (539 lines).
- The `ITEMS` and `BLOCKER` fixtures switch to `{name, effect}` options; the tests that pin the old layout (`writes the header, one item per question and the reply line`, `compose letters every option and the recommended one`, `--loop letters the loop question's options and recommendation`, `round-trips the last lettered option through parseDecisionItems`) are updated to the new layout. The old-layout parse tests stay as they are.

### Shared definition (agent-read docs)

#### [MODIFY] `.bkit/core/.bkit/authoring.md`

- **Existence Check:** the file exists; § Human questions is at line 631. `.bkit/authoring.md` is its installed copy (differs only in the managed marker).
- § Human questions states, as separate bullets:
  - Who asks and how: only the orchestrator, in the session, in plain text; never through a subagent or a host question tool, at every question point.
  - The shape (the #895 block), with option lines `A) {option} — {what happens if you pick it}`.
  - `Default if unanswered:` takes phrases from the closed set `the run waits for you`, `taken as A when nobody can be asked`, `the plan assumes A`, `the design assumes A`, `written as a needs-decision deferral`; two phrases join with `; ` where a point acts differently with and without someone to ask (Q1, option A).
  - A hard blocker has `Recommended: none — {why only you can decide}`; "yes" never answers it.
  - The reply line, once per message, and the "one by one" line from 3 questions on; where "stop" does not write a handover, the second sentence says what "stop" does there (Q2, option A).
  - **If** the owner replies "one by one" → ask each unanswered question in its own message, in order, recording the wait and the reply for each; route once the last one is answered.
  - A stop whose answer is an action, not a choice, writes one line: `**Action needed — {title}:** {what to do}. Then say "continue".`
  - A question asked before the run has a status file records no `owner-pause` / `owner-answer` row.
  - The two examples become the build verify gap (#895 comment) and the debug Loop Question in the new shape.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; § Question layout is the bullet at line 1018 under `/bkit-build` § Ask points.
- The bullet keeps the attempt line, the option names (`Try again` / `Decide` / `Stop`, `Accept` / `Fix now`, `Confirm` / `Reject`) and the `optionAnswer` sentence, and points to `.bkit/authoring.md` § Human questions for the shape instead of restating `Options: A) … / B) …` and the old reply line.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** the file exists; § Clauses holds `plan-open-questions` (line 3844), `workflow-plain-text-questions`, `workflow-open-questions-one-by-one` (line 6955); § Local Instructions holds the per-file entries.
- New clause `workflow-question-reply-line` (workflow, where-used; carriers `bkit-debug`, `bkit-ship`, `bkit-design`): `Reply with a letter per question, or "yes" to take every recommendation.` Add the entry first, run the no-flag check, then `pnpm instructions:sync`.
- `workflow-plain-text-questions` carriers gain `bkit-plan`.
- `workflow-open-questions-one-by-one`: asks each item in the shared question shape, in plain text, not through a host question tool; the old text moves to `retired`.
- `plan-open-questions`: `Options: A) {option} — {trade-off} · B) …` becomes one lettered option per line (`A) {option} — {trade-off}`); the old text moves to `retired`.
- Every edited standing line's § Local Instructions entry is edited by hand in the same task (`instructions:sync` does not drop stale entries).

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** the file exists; § Decision Pause steps 2 and 4 were read.
- Step 2: `decision-items.json` options are `{"name", "effect"}` objects. Default effects per fixed option: `Accept` — the item is recorded as accepted and the build moves on (an `UNPROVEN` item: your reason becomes its `TEST EXCEPTION`); `Fix now` — one more fix round runs before the build moves on; `Stop` — the run stops with a handover and can be resumed. The orchestrator may sharpen an effect to the item.
- Step 4: the message shows each unanswered item's option lines, its `Recommended:` line and its `Default if unanswered:` line, then the file's last lines; "yes" never answers `Recommended: none`; a "one by one" reply follows § Human questions.

#### [MODIFY] `.bkit/core/workflows/bkit-debug.md`

- **Existence Check:** the file exists; § Loop Question, § Step 1 sub-step 2, § Step 2 `runs locate` routes and the `Foreign path` bullet were read.
- § Loop Question (#6): `A) Stop — the run stops with a handover; /bkit-debug {FID} resumes it`, `B) Try again — one more {fix|soak} attempt runs`; `Recommended: A) Stop — the last attempt left no fewer failures`; `Default if unanswered: the run waits for you`; the shared reply line.
- Step 1 branch check (#7, exit 3 or 8): `**Q1 — Branch:**` with one option per candidate branch printed by `branches parse` (`Use branch {x} — debug adopts {x} and runs its tests there`), `Name another branch — reply with its name`, and `Stop — nothing changes; the run can be started again`; on the answer, write `branch={x}` to `{SESSION_DIR}/owner-answer.md` and re-run `branches parse --prompt-file="{SESSION_DIR}/owner-answer.md"` (Q3, option A). No status rows (A5). The reply line's second sentence is `"stop" ends here; nothing has changed yet, so the run can be started again.` (Q2), because Step 1 has no handover to write.
- Step 2 CI-run lookup (#8, exit 8 or 82): `**Q1 — CI run:**` with one option per candidate reference, `Use local discovery — debug runs the tests itself instead of reading CI`, and `Stop — handover; the run can be resumed`; keeps the `owner-pause reason=decision` row and lock release; on the answer, records `owner-answer`, writes the pick to `{SESSION_DIR}/owner-answer.md` and re-runs `runs locate` with that `--prompt-file`.
- `Foreign path` bullet (#9): writes `**Action needed — Foreign path:** commit or revert {file}. Then say "continue".`; keeps its `owner-pause reason=foreign-path` and `owner-answer` rows.

#### [MODIFY] `.bkit/core/workflows/bkit-ship.md`

- **Existence Check:** the file exists; § Confirm Assumed Items and § Merge Question were read.
- § Confirm Assumed Items (#10): `A) Confirm — the accept is recorded as yours, as a decision row`, `B) Reject — the item is written as a needs-decision deferral`; `Recommended: none — only you can accept it`; `Default if unanswered: written as a needs-decision deferral`; reply line per Q2 option A. The `Confirm` / `Reject` / `**Else** → ask again` routes stay.
- § Merge Question (#11): `A) Stop — the run stops with a handover; the next run resumes here`, `B) Try again — {one more set of merge attempts | a fix round} runs`; `Recommended: A) Stop — {reason}`; `Default if unanswered: the run waits for you`; the shared reply line.

#### [MODIFY] `.bkit/core/workflows/bkit-design.md`

- **Existence Check:** the file exists; § Step 3 sub-steps 2-4 and § Step 12 sub-step 7 were read.
- Grill (#1): per question, option lines with what each does, `Recommended: A) {answer} — {why}`, `Default if unanswered: the design assumes A`; the round ends with the reply line, whose second sentence is `"stop" ends the interview; the design goes on with what is settled.` (Q2), and the "one by one" line from 3 questions on.
- Draft scenario (#2): `A) Yes — the draft becomes the design's starting point`, `B) No — the draft is revised from your reply before the design starts`; `Recommended: A) Yes — {why}`; `Default if unanswered: the design assumes A`.
- Step 12 sub-step 7 (#3): the `workflow-open-questions-one-by-one` clause in its new wording.

#### [MODIFY] `.bkit/core/workflows/bkit-plan.md`

- **Existence Check:** the file exists; § Step 8 sub-step 7 was read.
- Sub-step 7 (#4): the `workflow-open-questions-one-by-one` clause in its new wording, which now carries `plain text, not through a host question tool.`

### Prompts and templates

#### [MODIFY] `.bkit/core/prompts/bkit-design-generate.md`, `.bkit/core/prompts/bkit-design-update.md`

- **Existence Check:** both exist; the open-question rule lines (149 and 75) were read.
- The rule asks for one lettered option per line, `A) {option} — {trade-off}`, then `Recommended:` with the chosen letter and a one-line reason, then `Default if unanswered:`.

#### [MODIFY] `.bkit/core/prompts/bkit-design-review-2.md`

- **Existence Check:** the file exists; line 80 was read.
- The `OPTIONAL` finding also covers an open question whose options share one line.

#### [MODIFY] `.bkit/core/prompts/bkit-plan-generate.md`, `bkit-plan-review-1.md`, `bkit-plan-scope-check.md`, `bkit-plan-update.md`

- **Existence Check:** all four exist and carry the `plan-open-questions` clause.
- Rewritten by `pnpm instructions:sync` from the clause master; no hand edit.

#### [MODIFY] `.bkit/core/docs/templates/bkit-plan.md`

- **Existence Check:** the file exists; the `Open Questions & Assumptions` placeholder is at lines 104-108.
- The `**Open Question:**` bullet becomes `**Q{n} — [title]:** [the decision, worded so "yes" takes the recommendation]`, with sub-bullets `A) [option] — [trade-off]`, `B) …`, `C) … (optional)`, `Recommended: A) [option] — [why]`, `Default if unanswered: the plan assumes A`. The `👤 ✅ Human Confirmation` checkbox is untouched.

#### [MODIFY] `.bkit/core/.bkit/prompts.md`

- **Existence Check:** the file exists; the `bkit-design-review-2` and `bkit-design-update` rows (lines 311, 313) were read.
- Both rows describe one lettered option per line instead of "the lettered `Options: A) …`".

### Tests (shipped-text audit)

#### [MODIFY] `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

- **Existence Check:** the file exists (507 lines), read in full.
- The scanner reads per-line option blocks as well as inline `Options:` lists, so its count test holds while the text moves over; `Recommended: none — {why}` passes the recommendation rule; the canonical-shape test reads § Human questions instead of the `**Question layout**` bullet.
- New tests per Task 3-8 (see `Derived Test Matrix`). The end check (Task 8) asserts that no inline `Options:` list remains in the scanned directories.

### Generated and installed copies

#### [MODIFY] `.bkit/core/engine/render/__snapshots__/bkit-{build,debug,ship,design,plan}.none.txt`

- Regenerated with `pnpm vitest run .bkit/core/engine/render/trackers.test.ts -u` in the task that edits each workflow; the diff is reviewed against the source edit.

#### [MODIFY] `.bkit/core/.bkit/cli.md`

- The generated `decisions` table is rewritten by `pnpm cli:sync` when the `compose` flag help changes.

#### [MODIFY] installed copies

- `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-renders `.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/`, `.bkit/` (`authoring.md`, `workflows.md`, `prompts.md`, `cli.md`) and `docs/templates/bkit-plan.md`.
- `pnpm build && git add dist/` after the `decisions.ts` edit, so `dist/` lands with it.
- `pnpm bkit:graph:refresh` after the engine edit is staged, so `docs/capabilities.md` and the graph register match.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None — no file is replaced. Text the change rewrites in place (the inline `Options:` lines, `No recommendation`, the old reply line) is removed by the edits that replace it; Task 8's end check asserts no inline `Options:` list remains. The old decision-file layout stays readable on purpose (A4), so the `Options:` fallback in `parseDecisionItems` is not superseded.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/authoring.md` (installed as `.bkit/authoring.md`) | § Human questions rewritten to the shared shape (Task 3) |
| `.bkit/core/.bkit/workflows.md` (installed as `.bkit/workflows.md`) | § Question layout points to § Human questions; the workflow index entry moves with the workflow edits (`.agents/rules.md` § Index updates) (Task 3) |
| `.bkit/core/.bkit/prompts.md` (installed as `.bkit/prompts.md`) | `bkit-design-review-2` and `bkit-design-update` rows describe one option per line (Task 8) |
| `.bkit/core/.bkit/cli.md` (installed as `.bkit/cli.md`) | `decisions compose` row, generated by `pnpm cli:sync` (Task 2) |
| `.bkit/instructions.md` | New `workflow-question-reply-line` clause; `plan-open-questions`, `workflow-open-questions-one-by-one` reworded with retired text; `workflow-plain-text-questions` carriers; Local Instructions entries of every edited line (Tasks 4-8) |
| `docs/decisions.jsonl` | Six rows written by this plan (`Ledger rows` line) |
| `docs/deferrals.jsonl` | Rows for the `Exempt` items in `Out of Scope` |
| `docs/capabilities.md` | Graph register refreshed by `pnpm bkit:graph:refresh` after the engine edit (Task 9) |
| `docs/knowledge.jsonl` | None planned; add a row only if the build hits a new trap |
| `docs/architecture.md` | None — no topology change |
| `docs/technology.md` | None — no framework or convention change |
| `docs/data-schema.md` | None — no database |
| `docs/design.md` | None — no UI |
| `docs/testing.md` | None — no new test file, tier or pattern |
| `docs/observability.md` | None — no new log line or span |
| `docs/migrations.md` | None — no upgrade migration |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database |
| **Code** | `git revert {COMMIT}` of the change's commits, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` to re-render the installed copies | Decision files written in the new layout during the change's life stay readable only by the new parser. **If** a run in progress wrote one → finish or abandon that run before the revert, or keep the `parseDecisionItems` per-line read in the revert |
| **Risk window** | A consumer upgrading bkit mid-build (A3) | `compose` exits 2 on old bare-string items, and the Decision Pause goes to the Failure Path; re-running the block with effects recovers |

Code-only — `git revert` sufficient, with the decision-file caveat above.

## Agent Execution Runbook

Build order: the engine first (Group 1), so the build workflow text never names an items shape `compose` refuses; then the one definition (Group 2); then each workflow's question points (Group 3); then the open-question writers and the installed copies (Group 4).

Every task that edits a standing line of a workflow, prompt or template also edits that line's `.bkit/instructions.md` § Local Instructions entry by hand, because `pnpm instructions:sync` does not drop stale entries. For a clause change, edit the clause entry first, run `pnpm tsx .bkit/core/engine/tools/instructions.ts` with no flag, and only then `pnpm instructions:sync`.

Integration shape (advice only): one PR for all nine tasks is fine. Building after #891 merges avoids a three-way edit of `decisions compose` (A6).

<!-- bkit:group 1 start -->

### TASK GROUP 1: Decision files in the shared shape

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Read one option per line and `Recommended: none` in `parseDecisionItems`, keeping the old `Options:` line
  - **UPDATE:** `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: options from the item's `{L}) {name} — {effect}` lines, each name being the text before the first ` — `; **If** the item has no option line → split its `Options:` line on ` / ` as today
  - **UPDATE:** `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: `Recommended: none — {why}` → `recommended` null and `reason` = `{why}`; `No recommendation — {why}` still reads as null
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: the file header comment shows the new item layout and says the old `Options:` line is still read
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the four tests below
  - **READ:** `optionAnswer` in `.bkit/core/engine/commands/workflow/decisions.ts`: the letter-to-name mapping, reused unchanged
  - **READ:** `bareName` in `.bkit/core/engine/commands/workflow/decisions.ts`: strips the letter from an option, reused unchanged
  - **READ:** `applyRecommendations` in `.bkit/core/engine/commands/workflow/decisions.ts`: hard blockers are the items whose `recommended` is null
  - **DONE WHEN:** the four tests below pass; the existing tests `parseDecisionItems keeps the bare option name, dropping the letter` and `a decision file written before the letters still parses` pass unchanged; `pnpm vitest run .bkit/core/engine/commands/workflow/summary.test.ts .bkit/core/engine/commands/workflow/challenge.test.ts` passes with no edit to `summary.ts`, `summary-findings.ts` or `challenge.ts`; `DecisionItem` has the same fields as before
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `parseDecisionItems reads one option per line and drops each effect` fails on `options` being empty for an item that has option lines and no `Options:` line
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `parseDecisionItems reads Recommended: none as a hard blocker` fails on `recommended` being "none" instead of null
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `a lettered decision in a per-line file reads as the option its letter labels` fails on the decision staying `B` instead of reading as `Fix now`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `apply --by=headless leaves a Recommended: none item for the owner` fails on exit 0 and a written "Decision: none" line instead of the hard-blocker exit 4

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Write the shared shape with `decisions compose`, from options that each carry an `effect`
  - **UPDATE:** `ComposeItem` in `.bkit/core/engine/commands/workflow/decisions.ts`: `options` is an array of `{name, effect}`
  - **UPDATE:** `composeItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: a bare-string option, or one missing `name` or `effect`, exits 2 naming the item and the option's letter; `recommended` is checked against the names
  - **UPDATE:** `itemLines` in `.bkit/core/engine/commands/workflow/decisions.ts`: the `**Q{n}**` line, one `{L}) {name} — {effect}` line per option, `Recommended: {L}) {name} — {reason}` or `Recommended: none — {why}`, then `Default if unanswered: the run waits for you; taken as {L} when nobody can be asked` (a hard blocker: `Default if unanswered: the run waits for you`)
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: `compose --loop` gives `Try again`, `Decide` and `Stop` their fixed effects (Architecture); the last lines are the shared reply line, plus `Or say "one by one" and I'll ask them one at a time.` when the file holds 3 or more questions, the loop question included; the `--items` help names the `{name, effect}` shape
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the `ITEMS` and `BLOCKER` fixtures use `{name, effect}` options; `writes the header, one item per question and the reply line`, `compose letters every option and the recommended one`, `--loop letters the loop question's options and recommendation` and `round-trips the last lettered option through parseDecisionItems` assert the new layout; the eight tests below
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated `decisions` table, rewritten by `pnpm cli:sync` if the verb's summary or flags change
  - **READ:** `letteredOptions` in `.bkit/core/engine/commands/workflow/decisions.ts`: letters option names for the deferral description
  - **READ:** `deferralRow` in `.bkit/core/engine/commands/workflow/decisions.ts`: deferral descriptions keep option names only
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the eight tests below and every other test in `decisions.test.ts` pass, the existing `--defer letters the options in the deferral row` unchanged; `pnpm cli:sync` leaves no drift; `pnpm build` rebuilds `dist/` and `pnpm bkit:check:dist` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose writes each option on its own line with its effect` fails on an "Options: A) Accept / B) Fix now" line being written instead of "A) Accept — "
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose refuses an option without an effect` fails on exit 0 for a bare-string option
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose writes a Default if unanswered line for each question` fails on the file holding no "Default if unanswered:" line
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose writes Recommended: none for a hard blocker` fails on "No recommendation —" being written instead of "Recommended: none —"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose ends with the shared reply line` fails on the old "Reply per question." last line
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose offers one by one from three questions on, not for two` fails on a three-question file having no "Or say \"one by one\"" line
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `--loop writes an effect for each loop option` fails on the loop question's `Try again` option having no "Try again — one more fix round runs" line
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `round-trips an item with effects through parseDecisionItems` fails on `compose` refusing the `{name, effect}` options with exit 2

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: One definition of the question shape

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Define the shared question shape once in `.bkit/authoring.md` § Human questions, and point § Question layout at it
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: § Human questions states, one bullet each, who asks and how (orchestrator only, plain text, never a subagent or a host question tool, at every point); the shape; the closed `Default if unanswered:` set and the `; ` join (Q1); `Recommended: none — {why}` and that "yes" never answers it; the reply line and the "one by one" line from 3 questions on, with the point-true "stop" sentence (Q2); the "one by one" route; the `**Action needed — {title}:** {what to do}. Then say "continue".` line; no status rows before a status file exists; the build verify-gap and debug Loop Question examples in the new shape
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `**Question layout**` bullet under `/bkit-build` § Ask points keeps the attempt line, the option names and the `optionAnswer` sentence, and points to `.bkit/authoring.md` § Human questions instead of restating `Options: A) … / B) …` and the old reply line
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: `optionLists` and `scanCounts` also count per-line option blocks, so `counts the option lines found per directory` holds while the text moves over; `RECOMMENDED_LETTER` accepts `none — `; `layoutBullet` and `the canonical layout letters every option and recommendation` read § Human questions; the six tests below
  - **READ:** `.bkit/core/.bkit/authoring.md`: § Which Sections Apply and § Before You Save, the authoring checklist for this edit
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the six tests below and every other test in `question-option-format.test.ts` pass; `pnpm tsx .bkit/core/engine/tools/instructions.ts` (no flag) reports nothing to fix, then `pnpm vitest run .bkit/core/engine/tools/` passes; § Human questions has no `Options:` line and no `No recommendation` line
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape puts each option on its own line with its effect` fails on § Human questions still showing the inline "Options: A) {option} / B) {option}" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape carries a Default if unanswered line from the fixed set` fails on § Human questions holding no "Default if unanswered:" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape gives a hard blocker Recommended: none` fails on § Human questions naming "No recommendation" in its place
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape ends a message with the reply line and the one-by-one offer` fails on § Human questions having no "one by one" offer
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `RED-PROOF: an option line with no effect fires the option-line rule` fails on a synthetic `A) Accept` line with no ` — ` reporting no violation
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the Question layout bullet points to § Human questions` fails on the bullet restating "Options: A) … / B) …"

<!-- bkit:task 3 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Every workflow question point in the shape

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Put the build's Decision Pause (#5) in the shared shape
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 2 writes `decision-items.json` options as `{"name", "effect"}` objects, with the default effects for `Accept`, `Fix now` and `Stop` (Architecture) and leave to sharpen an effect to the item
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 4 shows each unanswered item's option lines, its `Recommended:` line and its `Default if unanswered:` line, then the file's last lines; "yes" never answers a `Recommended: none` question; a "one by one" reply asks each unanswered question in its own message, per § Human questions
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions `bkit-build` entries for every edited standing line
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `pnpm vitest run .bkit/core/engine/render/trackers.test.ts -u`, its diff matching the source edit
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the three tests below
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** the three tests below pass; `pnpm vitest run .bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/` passes; § Decision Pause names no bare-string option list and no `No recommendation`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-build: every decision item option carries an effect` fails on the Decision Pause items shape listing bare strings such as `["Accept", "Fix now"]` with no "effect"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-build: the pause message shows the default line and Recommended: none` fails on step 4 naming "No recommendation" and no `Default if unanswered:` line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-build: a one-by-one reply asks the questions one at a time` fails on Decision Pause step 4 having no "one by one" route

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Put debug's Loop Question (#6), branch check (#7) and CI-run lookup (#8) in the shared shape, and give the foreign-path stop (#9) the `Action needed` line
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Loop Question step 3 writes `A) Stop — …` and `B) Try again — …` lines, `Recommended: A) Stop — the last attempt left no fewer failures`, `Default if unanswered: the run waits for you` and the shared reply line
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Step 1 sub-step 2, `branches parse` exit 3 or 8 → `**Q1 — Branch:**` with one option per candidate, `Name another branch` and `Stop`, the Step 1 reply line (Architecture); the answer goes to `{SESSION_DIR}/owner-answer.md` (written with the file-write tool) and `branches parse` re-runs on it (Q3); no status rows (A5)
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Step 2 `runs locate` exit 8 or 82 → `**Q1 — CI run:**` with one option per candidate reference, `Use local discovery` and `Stop`; keeps the `owner-pause reason=decision` row and the lock release; on the answer, records `owner-answer`, writes `{SESSION_DIR}/owner-answer.md` and re-runs `runs locate` with that `--prompt-file`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the `Foreign path` header bullet writes `**Action needed — Foreign path:** commit or revert {file}. Then say "continue".` and keeps its `owner-pause reason=foreign-path` / `owner-answer` rows
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions `bkit-debug` entries for every edited standing line
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with `-u`, its diff matching the source edit
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the six tests below
  - **READ:** `branchesCommand` in `.bkit/core/engine/commands/workflow/branches.ts`: the `parse` verb's exit 3 names the invalid branch, and its exit 8 lists the candidates
  - **READ:** `locateCi` in `.bkit/core/engine/commands/workflow/runs.ts`: exit 8 asks for one reference, exit 82 names the evidence problem
  - **READ:** `runsCommand` in `.bkit/core/engine/commands/workflow/runs.ts`: the `locate` verb's flags, including `--prompt-file`
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the six tests below pass; `pnpm vitest run .bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/` passes; the existing `every answer branch after a lettered question accepts the option letter` still passes for every new answer route
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the loop question gives each option its effect and the recommendation a reason` fails on "Options: A) Stop / B) Try again" with a bare "Recommended: A) Stop"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: every question shows a Default if unanswered line` fails on the Loop Question having no "Default if unanswered:" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the branch check asks a formatted question` fails on the `branches parse` exit 3 or 8 route being a bare **STOP** with no "**Q1 — Branch:**"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the CI-run stop asks a formatted question` fails on the `runs locate` exit 8 or 82 route having no "**Q1 — CI run:**"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: the foreign-path stop shows the Action needed line` fails on the bullet having no "**Action needed — "
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-debug: every question message ends with the shared reply line` fails on the old "Reply per question." line

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Put ship's Confirm Assumed Items (#10) and Merge Question (#11) in the shared shape
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: § Confirm Assumed Items step 2 writes `A) Confirm — …` and `B) Reject — …` lines, `Recommended: none — only you can accept it`, `Default if unanswered: written as a needs-decision deferral`, and the #10 reply line (Q2); the `Confirm` / `Reject` / `**Else** → ask again` routes of step 3 stay as they are
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: § Merge Question step 1 writes `A) Stop — …` and `B) Try again — …` lines, `Recommended: A) Stop — {reason}`, `Default if unanswered: the run waits for you` and the shared reply line
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions `bkit-ship` entries for every edited standing line
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated with `-u`, its diff matching the source edit
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the five tests below
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the five tests below pass; the existing `every answer-routing step maps a lettered reply to its option name` passes unchanged; `pnpm vitest run .bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-ship: the assumed-item question gives each option its effect` fails on "Options: A) Confirm / B) Reject"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-ship: an assumed item is a hard blocker with Recommended: none` fails on "No recommendation — only you can accept it"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-ship: every question shows a Default if unanswered line` fails on Confirm Assumed Items and Merge Question having no "Default if unanswered:" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-ship: the merge question gives each option its effect` fails on "Options: A) Stop / B) Try again"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-ship: every question message ends with the reply line its point uses` fails on the old "Reply per question." lines

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Put the design grill (#1), draft scenario (#2) and the design and plan one-by-one pass (#3, #4) in the shared shape, and add the reply-line clause
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: § Step 3 sub-step 2 writes each grill question with option lines, `Recommended: A) {answer} — {why}` and `Default if unanswered: the design assumes A`; the turn's message ends with the reply line whose second sentence is the grill's "stop" sentence (Q2), plus the "one by one" line from 3 questions on
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: § Step 3 sub-step 4 asks the draft question with `A) Yes — the draft becomes the design's starting point`, `B) No — the draft is revised from your reply before the design starts`, `Recommended: A) Yes — {why}` and `Default if unanswered: the design assumes A`
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: Step 12 sub-step 7 carries the reworded `workflow-open-questions-one-by-one` clause (shared shape, `plain text, not through a host question tool.`)
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: Step 8 sub-step 7 carries the same reworded clause
  - **UPDATE:** `.bkit/instructions.md`: § Clauses — new `workflow-question-reply-line` (carriers `bkit-debug`, `bkit-ship`, `bkit-design`); `workflow-plain-text-questions` carriers gain `bkit-plan`; `workflow-open-questions-one-by-one` reworded, old text in `retired`; § Local Instructions `bkit-design` and `bkit-plan` entries for every edited standing line
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`: regenerated with `-u`, its diff matching the source edit
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: regenerated with `-u`, its diff matching the source edit
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the five tests below
  - **DEPENDS ON:** 3, 5, 6
  - **DONE WHEN:** the five tests below pass; the clause entries were added before `pnpm instructions:sync` ran, and the no-flag check reported nothing to fix; `pnpm vitest run .bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-design: the grill question gives each option its effect and the recommendation a reason` fails on "`Recommended: A) {answer}`" carrying no reason
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-design: the draft-scenario question gives each option its effect` fails on "Options: A) yes / B) no"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-design: every question shows a Default if unanswered line` fails on the grill and draft questions having no "Default if unanswered:" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-design: the grill message ends with the reply line and the one-by-one offer` fails on the grill turn having no "Reply with a letter per question" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the one-by-one open-questions pass forbids the host question tool in design and plan` fails on `bkit-plan.md`'s one-by-one step lacking "not through a host question tool"

<!-- bkit:task 7 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Open questions one option per line, and the installed copies

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Write plan and design open questions one option per line
  - **UPDATE:** `.bkit/instructions.md`: § Clauses `plan-open-questions` asks for one lettered option per line (`A) {option} — {trade-off}`), then `Recommended` and the default; the old text moves to `retired`; `pnpm instructions:sync` rewrites it into `bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check` and `bkit-plan-update`
  - **UPDATE:** `.bkit/core/prompts/bkit-design-generate.md`: the `Risks & Open Questions` placeholder rule asks for one lettered option per line
  - **UPDATE:** `.bkit/core/prompts/bkit-design-update.md`: step 9's open-question rule asks for one lettered option per line
  - **UPDATE:** `.bkit/core/prompts/bkit-design-review-2.md`: step 8's `OPTIONAL` finding also covers options that share one line
  - **UPDATE:** `.bkit/core/docs/templates/bkit-plan.md`: the `Open Questions & Assumptions` placeholder uses `**Q{n} — [title]:**` with sub-bullets `A) [option] — [trade-off]`, `B) …`, `C) … (optional)`, `Recommended: A) [option] — [why]`, `Default if unanswered: the plan assumes A`; the `👤 ✅ Human Confirmation` checkbox is untouched
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the `bkit-design-review-2` and `bkit-design-update` rows describe one lettered option per line
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions entries for every edited prompt and template line
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: `the plan template letters every option of its Open Questions placeholder` reads the per-line placeholder; the five tests below
  - **DEPENDS ON:** 3, 7
  - **DONE WHEN:** the five tests below and every test in `question-option-format.test.ts` pass; `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/prompts.md`, the five `bkit-design-review-2` mirrors and `docs/templates/bkit-plan.md`, so the mirror checks in that file pass; `pnpm vitest run .bkit/core/engine/tools/` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the plan template puts each open-question option on its own line` fails on the inline "· B)" placeholder
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every open-question rule in the prompts asks for one option per line` fails on the rules naming the inline "`Options: A) {option} — {trade-off} · B) …`"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the design review flags an open question whose options share one line` fails on `bkit-design-review-2.md` naming no one-per-line check
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the prompts index describes one option per line` fails on the rows naming "the lettered `Options: A) …`"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `no workflow, prompt, template or authoring doc carries an inline Options: list` fails on any inline "Options:" list left in the scanned directories

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Re-render the installed copies, the build output and the graph register
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
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8
  - **DONE WHEN:** `pnpm build` rebuilds the build output; `pnpm bkit check` reports no drift; `pnpm bkit:check:dist` passes; `pnpm bkit:graph:check` passes; `grep -rn 'Reply per question\|No recommendation —' .bkit/core/workflows .bkit/core/.bkit .claude/commands` finds nothing
  - **TEST FIRST:** n/a — regenerated installed copies, build output and graph register only; no behaviour change

<!-- bkit:task 9 end -->

<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** errors are logged and traced as `docs/observability.md` describes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:install-static-unit-build` and `pnpm bkit check` pass.
- [ ] **Test Synchronization:** no E2E tests exist for these surfaces; the existing tests that change alongside are the four old-layout `compose` tests in `.bkit/core/engine/commands/workflow/decisions.test.ts` (Task 2), the canonical, count and plan-template tests in `.bkit/core/engine/audits/workflows/question-option-format.test.ts` (Tasks 3 and 8), and the five none-render baselines in `.bkit/core/engine/render/__snapshots__/` (Tasks 4-7).
- [ ] **Build Configuration:** test files stay out of `dist/` through the `**/*.test.ts` entry in `tsconfig.json` `exclude`; no new test-only file is added.
- [ ] **Unit (boundary: real temp git repo) (`.bkit/core/engine/commands/workflow/decisions.test.ts`):** the 12 Task 1 and Task 2 tests write and read decision files in a temp repo through `runCommand`; each test builds its own repo and leaves nothing behind.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/question-option-format.test.ts`):** the 30 Task 3-8 tests read the shipped sources and mirrors; the RED-PROOF tests use synthetic strings only.
- [ ] **Apply local migrations:** n/a — the change touches no database.
- [ ] **Run all tests:** `pnpm test` passes, and `pnpm test:integration` passes with no edit, which shows the `summary`, `challenge` and install paths still read the decision files and the installed copies.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** Run `pnpm build`, pack the tarball with `pnpm pack`, and install it with `bkit install` in a clean scratch directory; open the installed `bkit-build`, `bkit-debug`, `bkit-ship`, `bkit-design` and `bkit-plan` workflows and check that each question point shows one option per line, a `Recommended:` line with a reason or `none — {why}`, and a `Default if unanswered:` line.
- [ ] **Step 2:** In that directory, write a `decision-items.json` with three items, one of them a hard blocker, and run `bkit decisions compose`; check that the file shows one `{L}) {name} — {effect}` line per option, `Recommended: none — {why}` on the blocker, the shared reply line and the "one by one" line.
- [ ] **Step 3:** Run `bkit decisions apply --by=headless` on that file; check that the two recommended items are answered and the hard blocker is left for the owner.
- [ ] **Step 4:** Run `bkit decisions pending` against a decision file written in the old `Options: A) … / B) …` layout; check that it lists the same items and options as before the change.
- [ ] **Step 5:** Run `/bkit-design` on a small idea in the scratch directory; check that the grill turn arrives as one plain-text message in the shared shape, that a reply of "one by one" asks the questions one at a time, and that no host question tool opens.
