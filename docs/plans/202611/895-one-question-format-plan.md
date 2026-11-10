<!-- bkit:anchor
baseSha: d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: PASS
<!-- verdict:end -->

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

Once at the end of every message: `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the run can be resumed.` When a round has 3 or more questions, the footer adds `Or say "one by one" and I'll ask them one at a time.`

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

### Success Criteria

- The shared question shape (below) is defined once in `.bkit/authoring.md` § Human questions plus a shared clause in `.bkit/instructions.md`, and every row in the audit table, and the Step 1 issue stops, use it.
- Each option is on its own line with what happens if it is picked, including the fixed-option pauses (#5, #6, #10, #11).
- Each question has a `Default if unanswered:` line saying what actually happens.
- Each recommendation carries a reason.
- `bkit decisions apply` and `decisions pending` read decision files in both the new layout and the old single `Options:` line layout.

### Process Sketch

- **WHEN** a build pause reaches the owner **→ THEN** each question shows one option per line with what it does, a `Recommended:` line with its reason, and a `Default if unanswered:` line, and the message ends with the shared reply line.
- **WHEN** the owner replies "yes" **→ THEN** every recommendation is taken, and a `Recommended: none` question stays unanswered and is asked again.
- **WHEN** a round has 3 or more questions and the owner replies "one by one" **→ THEN** the questions are asked one at a time, in order.
- **IF** ship reads a decision file a run wrote before the change, with one `Options:` line **→ THEN** `decisions pending` and `decisions apply` read it as before.
- **IF** `/bkit-debug` cannot tell which branch or CI run to use **→ THEN** it asks a formatted question whose options name the candidates, instead of a bare stop.
- **IF** a file the run commits was changed before the run (foreign path) **→ THEN** debug shows one `**Action needed — {title}:**` line and waits for "continue".
- **IF** a Step 1 prompt names more than one issue **→ THEN** the workflow asks a formatted question whose options are the named issues (Q5, option A).

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
| `decision-items.json` has an option with no `effect`, or an option given as a bare string other than a fixed name (`Accept`, `Fix now`, `Stop`, `Try again`, `Decide`) | `decisions compose` exits 2 naming the item, and writes no file |
| `decision-items.json` gives a fixed name as a bare string (`"Accept"`), as a `bkit-build.md` loaded before the upgrade writes it | `decisions compose` writes that name's default effect, the same text the Decision Pause would write |
| An option's `name` contains ` — ` | `decisions compose` exits 2 naming the item and the option's letter, because the parser would cut the name at that dash |
| A decision file holds one item in the old `Options:` line layout and one in the per-line layout | Each item parses in its own layout |
| A round has exactly 2 questions | The footer has no "one by one" line |
| A round has 3 or more questions (the loop question counts) | The footer adds `Or say "one by one" and I'll ask them one at a time.` |
| After a headless apply, the build asks only the hard blockers of a file that holds 3 or more questions | The "one by one" line shows only when 3 or more questions are asked in that message |
| The owner replies "one by one" | Each unanswered question is asked in its own message, in order; routing waits for the last answer |
| The owner replies "one by one" during the design grill | The one-at-a-time messages count as the one grill turn they replace, so `GRILL_TURNS` is used up no faster |
| `/bkit-debug` Step 1 cannot pick a branch (`branches parse` exit 3 or 8) | A formatted question names each candidate branch as an option, with `Recommended: none — only you know which branch you meant`, `Default if unanswered: the run waits for you; the run stops when nobody can be asked` and the reply line `Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.`; no status rows are written, because Step 1 has no status file yet |
| `/bkit-debug` Step 2 cannot pick a CI run (`runs locate` exit 8 or 82) | A formatted question names each candidate reference as an option (`Use {reference} — debug reads that run's failures instead of running the tests itself`), with `Recommended: none — only you know which run you meant`, `Default if unanswered: the run waits for you; the run stops when nobody can be asked`, the reply line `Reply with a letter per question. "stop" ends here with a handover; the run can be resumed.` and the existing `owner-pause reason=decision` row; the workflow lock stays held while the owner answers and is released only on `Stop` |
| `/bkit-debug` reaches the Loop Question because the soak attempts are used up (`LOOP_LIMIT` = true) | The recommendation reads `Recommended: A) Stop — the attempts set aside for this are used up`; every other Loop Question branch reads `Recommended: A) Stop — the last attempt left no fewer failures` |
| `runs locate` exits 82 with no candidate reference (unavailable evidence, or evidence from another branch) | The question carries the engine's message word for word (including `Supply branch={x} in its checkout`) and offers only `Use local discovery` and `Stop` |
| A foreign path stops `/bkit-debug` (exit 10) | One `**Action needed — {title}:** {what to do}. Then say "continue".` line; on "continue" the block re-runs |
| A Step 1 prompt names more than one issue (`fids parse` exit 8), in any of the five workflows | A formatted question names each issue as an option, with `Recommended: none — only you know which issue you meant`, `Default if unanswered: the run waits for you; the run stops when nobody can be asked` and the reply line `Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.`; no status rows are written (Q5, option A) |
| A mid-run pause offers `Stop` (build's fixed `Stop`, `compose --loop`, the debug Loop Question, the CI-run lookup, the ship Merge Question) | The option reads `Stop — the run stops with a handover; the next run resumes here`; only a Step 1 question's stop reads `Stop — nothing changes; the run can be started again`, because nothing has started yet |
| A hard blocker reaches a run with nobody to ask | Its line reads `Default if unanswered: the run waits for you; the run stops when nobody can be asked`, because a headless hard blocker goes to the Failure Path (`bkit-build.md:174`) |
| A Step 1 branch is not a lowercase slug (`fids parse` exit 3), or the prompt holds only a bare number (exit 9) | One `**Action needed — {title}:**` line saying what to rename or type; on "continue" the block re-runs (Q5, option A) |
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
| A per-line option whose own text holds ` / ` or ` · ` (`A) keep the read/write split — …`) parses as one option | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| A file with one old-layout item and one per-line item parses each item in its own layout | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| `apply --by=owner --confirm` confirms an assumed item in a per-line file | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| `buildSummary` reads a lettered `Decision: A` in a per-line file as `Accept` | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| `acceptedLocations` reads a lettered `Decision: A` in a per-line file as `Accept` | Unit | `.bkit/core/engine/commands/workflow/challenge.test.ts` | 1 |
| `compose` writes each option on its own line with its effect, and no `Options:` line | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` refuses an option with no effect, or a bare string that is not a fixed name (exit 2, no file) | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` writes the default effect for a fixed name given as a bare string | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` refuses an option name that contains ` — ` (exit 2, no file) | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` refuses more than 26 options with the `at most 26 options` message (existing `refuses an item with more options than letters`, updated to `{name, effect}` options) | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` writes a `Default if unanswered:` line for each question: `the run waits for you; taken as {L} when nobody can be asked` for a recommended item, `the run waits for you; the run stops when nobody can be asked` for a hard blocker | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` writes `Recommended: none — {why}` for a hard blocker | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` ends the file with the shared reply line | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose` adds the "one by one" line from 3 questions on, and not for 2 | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `compose --loop` writes an effect for each loop option, `Stop` reading `Stop — the run stops with a handover; the next run resumes here` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| An effect-carrying item round-trips through `compose` and `parseDecisionItems` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| The canonical shape in § Human questions puts each option on its own line with its effect | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The canonical shape carries a `Default if unanswered:` line from the fixed set, which holds `the run stops when nobody can be asked` and `the plan stops at Gate 1 until you answer` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The canonical shape gives a hard blocker `Recommended: none — {why}` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The canonical shape ends a message with the shared reply line and the "one by one" offer | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| RED-PROOF: a synthetic option line with no effect fires the option-line rule | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| The `.bkit/workflows.md` § Question layout bullet points to § Human questions instead of restating the old layout | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 3 |
| No workflow carries the retired reply wording (`Reply per question. "yes" takes every recommendation.`, `"stop" writes a handover`) | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 4 |
| Build: the Decision Pause "yes" line uses the shared reply wording | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 4 |
| The reworded reply-line clauses and their carriers match their masters, with no carrier count below the cut-off and no near-copy (existing instruction tool suites) | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 4 |
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
| A wait before the run's status file exists uses the fixed pre-status wording, sits before `workflows start`, and names no `owner-pause` row | Unit | `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` | 6 |
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
| Design and plan: the one-by-one open-questions pass forbids the host question tool | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 8 |
| Every workflow's Step 1 ambiguous-issue stop (exit 8) asks a formatted question naming the issues | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 9 |
| Every workflow's Step 1 issue question shows `Recommended: none` and a `Default if unanswered:` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 9 |
| Every workflow's Step 1 slug stop (exit 3) and bare-number stop (exit 9) show the `**Action needed — {title}:**` line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 9 |
| The Step 1 issue question re-runs `fids parse` on the owner's answer file | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 9 |
| The plan template puts each open-question option on its own line, and its default line offers `the plan assumes A` or `the plan stops at Gate 1 until you answer` | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 10 |
| Every open-question rule in the prompts asks for one option per line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 10 |
| The design review flags an open question whose options share one line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 10 |
| The prompts index describes one option per line | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 10 |
| No workflow, prompt, template or authoring doc carries an inline lettered `Options: A)` list | Unit | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | 10 |
| `bkit-build`, `bkit-debug` and `bkit-ship`: the none renders match their regenerated baselines after the clause sync (existing `{workflow}: the none render matches its baseline byte for byte`) | Unit | `.bkit/core/engine/render/trackers.test.ts` | 4 |
| `bkit-build`: the none render matches its regenerated baseline (existing `bkit-build: the none render matches its baseline byte for byte`) | Unit | `.bkit/core/engine/render/trackers.test.ts` | 5 |
| `bkit-debug`: the none render matches its regenerated baseline (existing) | Unit | `.bkit/core/engine/render/trackers.test.ts` | 6 |
| `bkit-ship`: the none render matches its regenerated baseline (existing) | Unit | `.bkit/core/engine/render/trackers.test.ts` | 7 |
| `bkit-design` and `bkit-plan`: the none renders match their regenerated baselines (existing) | Unit | `.bkit/core/engine/render/trackers.test.ts` | 8 |
| All five phase workflows: the none renders match their regenerated baselines after the Step 1 clause sync (existing) | Unit | `.bkit/core/engine/render/trackers.test.ts` | 9 |
| The `bkit-design` reply-line carrier and the widened `workflow-plain-text-questions` carriers match their masters (existing instruction tool suites) | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 8 |
| The reworded Step 1 clauses match in all five carriers (existing instruction tool suites) | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 9 |
| The `plan-open-questions` clause master and its four prompt copies match (existing instruction tool suites) | Unit | `.bkit/core/engine/tools/instructions-sources.test.ts` | 10 |
| The installed copies match their sources after `bkit upgrade` (drift gate) | Static | `pnpm bkit check` | 11 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

<!-- prettier-ignore -->
| Change | Who it breaks | Handling |
| --- | --- | --- |
| `decision-items.json` `options` changes from strings to `{"name", "effect"}` objects; `decisions compose` refuses a bare string that is not a fixed name (exit 2) | Any consumer script calling `bkit decisions compose` by hand with its own option names (the verb is `use: workflow`) | A bare fixed name (`Accept`, `Fix now`, `Stop`, `Try again`, `Decide`) is still accepted and gets its default effect, so an orchestrator holding the old `bkit-build.md` keeps working; `bkit-build.md` changes in the same release (Task 5); A3 covers the rest |
| Decision file layout: one line per option, `Recommended: none — {why}` in place of `No recommendation — {why}`, a `Default if unanswered:` line, a new last line | Anything that greps decision files for `Options:` or `No recommendation` | `parseDecisionItems` reads both layouts; nothing else in the engine parses the file (language-server references) |
| Plan template `Open Questions & Assumptions` placeholder: `**Open Question:**` with an inline `**Options:**` list becomes `**Q{n} — [title]:**` with one option per sub-bullet | `bkit-plan-*` prompts and consumers' copies of `docs/templates/bkit-plan.md` (managed, re-rendered by `bkit upgrade`) | The prompts' clause moves in the same change (Task 10); `summary.ts` copies the section word for word, so it is layout-agnostic |
| Step 1's issue-and-branch stops (`fids parse` exit 3, 8 and 9) wait for an answer in the session instead of ending the run (Q5, option A) | Owners used to re-invoking the workflow with a narrower prompt | Re-invoking still works: the stops change what they show and add an in-session answer route; nothing has started, so no status row is written |
| The owner's reply line changes from `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.` to `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the run can be resumed.` | Owners used to the old wording; no parser reads it | None needed: "yes", "stop" and letters mean what they meant |

**Names introduced:**

- `effect` — the per-option field in `decision-items.json`.
- `workflow-question-reply-line` — the new `.bkit/instructions.md` clause.
- `{SESSION_DIR}/owner-answer.md` — the one-line answer file the debug branch and CI-run questions and the Step 1 issue question write (Q3, option A).
- `**Action needed — {title}:**` — the fixed line for a stop whose answer is an action.
- `Recommended: none` — the hard-blocker line.
- `end turn → wait for the answer; no status file yet` — the fixed wording of a wait that comes before the run's status file exists; `owner-wait-rows.test.ts` exempts it from the `owner-pause` rule only before `workflows start`.

No route, table, package script, CI check or public API name changes.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Assumption A2:** Chat hosts (Claude Code, OpenCode, Codex, Cursor, Antigravity) show each line of a question on its own line → if wrong, the options of a chat question run together into one paragraph, and § Human questions must switch the option lines to list bullets. Files (decision files, plans, designs) are unaffected: the plan template and design template use list bullets (Task 10), and decision files are read by code.
- **Assumption A3:** Every bare-string option an orchestrator holding the old `bkit-build.md` writes is a fixed name (`Accept`, `Fix now`, `Stop`, `Try again`, `Decide`), which `compose` accepts with its default effect. This covers a build stopped between writing `decision-items.json` and calling `decisions compose` across a bkit upgrade, and a `/bkit-build` still running in a sibling worktree of bkit's own repo: `{BKIT}` resolves to the main checkout's `node_modules/.bin/bkit`, so once this change merges to `dev` and the main checkout's `dist/` is rebuilt, that run's old `bkit-build.md` meets the new `compose` → if wrong (a bare string outside the fixed set), `compose` exits 2 and the Decision Pause goes to the Failure Path; rewriting the items with effects and re-running the block recovers, and rebasing in-flight branches before their next Decision Pause avoids it.
- **Assumption A4:** Ship, summary and challenge only re-read decision files that runs in progress wrote; nothing re-composes an old file → if wrong, a file could hold items in both layouts. `parseDecisionItems` reads the layout per item (Task 1), so a mixed file still parses.
- **Assumption A5:** `/bkit-debug` Step 1 has no `{STATUS}` yet when `branches parse` exits 3 or 8, so the branch question writes no `owner-pause` or `owner-answer` row → if wrong (a status file exists), the question records both rows as every other point does.
- **Assumption A6:** #891 (`docs/plans/202611/891-build-gate-stuck-plan.md`) also changes `decisions compose` (`--base-check`, the verify loop's progress line) and `apply` (`--by=rerun`). Whichever change merges second resolves the overlap in `decisions.ts` and `bkit-build.md`, and every loop option #891 adds gets an effect → if wrong, a loop option without an effect makes `compose` exit 2.
- **Assumption A7:** `runs locate --prompt-file` reads a one-line answer file the same way it reads the session prompt: `[local]` selects local discovery (`runs.ts:2523`, "[local] overrides all CI references"; the route is exit 1), and a single run or PR URL selects that reference (exit 0); `branches parse --prompt-file` accepts a `branch={x}` line (`branches.ts:3178`, `:3200`) → if wrong, the re-run after the owner's pick exits 8 again, and the #7 / #8 question repeats with no way through except `Stop`.
- **Answered Q1 — Default-line wording beyond the four fixed phrases:** Option A. `Default if unanswered:` takes phrases from a closed set: the four #895 phrases (`the run waits for you`, `taken as A when nobody can be asked`, `the plan assumes A`, `written as a needs-decision deferral`), plus `the design assumes A` for the grill, `the run stops when nobody can be asked` for a point with no recommendation, and `the plan stops at Gate 1 until you answer` for a plan open question with no safe assumption. Two phrases join with `; ` where a point acts differently with and without someone to ask: `the run waits for you; taken as A when nobody can be asked` where there is a recommendation, and `the run waits for you; the run stops when nobody can be asked` for a hard blocker, the branch check (#7), the CI-run lookup (#8) and the Step 1 issue question, because a headless hard blocker goes to the Failure Path (`.bkit/core/workflows/bkit-build.md:174`). Owner answer in `docs/plans/202611/logs/895-one-question-format/plan-answers-1.md`; decision `895-shared-question-shape`.
- **Answered Q2 — The reply line where "stop" does not write a handover:** Option A. The lead sentence `Reply with a letter per question, or "yes" to take every recommendation.` stays wherever a point has a recommendation, and the second sentence says what "stop" does there: the grill writes `"stop" ends the interview; the design goes on with what is settled.`, and a mid-run pause writes `"stop" ends here with a handover; the run can be resumed.` with the option `Stop — the run stops with a handover; the next run resumes here`. A point with no recommendation drops the "yes" half: #10 writes `Reply with a letter per question. Ship merges either way; anything you do not confirm is written as a needs-decision deferral.`; the branch check (#7) and the Step 1 issue question write `Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.` with the option `Stop — nothing changes; the run can be started again`, because nothing has started yet; the CI-run lookup (#8) writes `Reply with a letter per question. "stop" ends here with a handover; the run can be resumed.`. No stop route changes. Owner answer in `docs/plans/202611/logs/895-one-question-format/plan-answers-1.md`; decision `895-shared-question-shape`.
- **Answered Q3 — How a debug branch or CI-run answer reaches the re-run (#7, #8):** Option A. The workflow writes the owner's pick to `{SESSION_DIR}/owner-answer.md` (`branch={x}` for #7; the chosen run or PR URL, or `[local]`, for #8) and re-runs the same command with `--prompt-file="{SESSION_DIR}/owner-answer.md"`, so the existing verbs validate the answer and no engine change is needed. Both questions carry `Recommended: none — only you know which branch you meant` (#7) or `Recommended: none — only you know which run you meant` (#8), and `Default if unanswered: the run waits for you; the run stops when nobody can be asked`; #8's per-candidate option reads `Use {reference} — debug reads that run's failures instead of running the tests itself`. Owner answer in `docs/plans/202611/logs/895-one-question-format/plan-answers-1.md`; decision `895-debug-branch-and-ci-stops-become-questions`.
- **Answered Q4 — The Acceptance Scenario's Narrative and Success Criteria:** Option A, amended. The issue's `Outcome` is the `Narrative` and its `Success criteria` are the `Success Criteria`, word for word, except that the first criterion also names the Step 1 issue stops, so the contract covers Task 9 (Q5, option A). Owner answer in `docs/plans/202611/logs/895-one-question-format/plan-answers-1.md`; no decision row.
- **Answered Q5 — The form of Step 1's issue-and-branch stops (Task 9):** Option A. In `bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md`, the `fids parse` exit 8 stop (`workflow-issue-id-parse-ambiguous`) becomes a formatted question whose options are the named issues, and the exit 3 (`workflow-issue-id-parse-slug`) and exit 9 (`workflow-fid-bare-number`) stops become `**Action needed**` lines. Owner answer in `docs/plans/202611/logs/895-one-question-format/plan-answers-1.md`; decision `895-start-step-issue-stops-question-and-action-lines`.

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

**Step 1 stops:** the five workflows' Step 1 issue-and-branch stops (`fids parse` exit 8 or 9, the `feat/{slug}` rename on exit 3) are not rows of the #895 audit table, but the Narrative names every question point and the first Success Criterion names the Step 1 issue stops (Q4, option A), so they are in the runbook (Task 9). The exit 8 stop becomes a formatted question, and the exit 3 and 9 stops become `**Action needed**` lines (Q5, option A).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The plan template's `👤 ✅ Human Confirmation` checkboxes (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions confirmed) | No Success Criterion or matrix row needs them: the owner ticks them in the plan file, so they are a document gate, not a chat question | #895 § Constraints and non-goals; `docs/deferrals.jsonl` `895-plan-human-confirmation-checkboxes-stay-a-document-gate` |
| When the workflows pause, the `bkit.workflows.*` limits, and what an answered decision does (including what "stop" does at the grill and at ship's Confirm Assumed Items) | The change is the question layout only; no Success Criterion needs a routing change | #895 § Constraints and non-goals; `docs/deferrals.jsonl` `895-pause-timing-limits-and-answer-effects-unchanged` |

Not questions, so outside the shape by #895's own audit: the `--suggest` "ask me one by one" offer and the "plain English explanation" offer in the final returns, and every subagent prompt (subagents cannot reach the owner).

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| The question-format audit splits an option's own `/` into bogus entries | `docs/deferrals.jsonl` `703-standardise-question-option-challenge-low-bkit-core-engine-audits-workflows-question-option-format-test-ts-50` | Tasks 3 and 10 rewrite that scanner; once no inline `Options:` list remains (Task 10's end check, which also covers `bkit-audit-models.md` and the six `prompts.md` rows), the splitting has nothing left to split | Close the row at ship after Task 10 lands, if the owner agrees; no extra task |
| Which subagents the design ideate step runs (lens predicates) | `docs/deferrals.jsonl` `442-design-ideate-lens-predicates` (LOW, `needs-decision`, open) | `.bkit/core/workflows/bkit-design.md` Step 3, which Task 8 edits for the grill | Keep separate; it changes which subagents run, not the question layout |
| #55 (closed) and failure `699-design-close-decision-rows-refused-by-writer-table` (closed) | `related-issues.md`, `related-failures.md` | None with this plan's surfaces | None |
| #891 — Build: gate stuck on tests already red on dev, owner accept ignored (OPEN) | Tracker; `docs/plans/202611/891-build-gate-stuck-plan.md` | `decisions compose` (`--base-check`, verify-loop progress line), `apply --by=rerun`, `bkit-build.md` Decision Pause | Keep separate; sequence this build after #891 merges (Pre-Flight, A6) |
| Apply the base-commit check to `/bkit-debug`'s Loop Question | `docs/deferrals.jsonl` `891-debug-base-red-label` | `bkit-debug.md` § Loop Question (Task 6) | Keep deferred; it changes what the question says, not its layout |
| A Decision Pause composed before a renumber resumes with its old `Pause step` | `docs/deferrals.jsonl` `705-build-plan-convert-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-279` | Runs caught across a bkit upgrade (A3) | Keep deferred; this plan changes no step numbers |

## Security & Privacy

- [ ] **New API Route** — not applicable: no route.
- [ ] **New DB Table/Column** — not applicable: no database.
- [ ] **Role-Gated Mutation** — not applicable: no roles.
- [ ] **User Input** — applies: `decision-items.json` is orchestrator-written input to `decisions compose`. `composeItems` validates it in the handler (array shape, title, question, `{name, effect}` per option or a bare fixed name, no `—` inside a name, at most 26 options, `recommended` among the names) and exits 2 on any failure before writing a file. The owner's answer files for the debug branch and CI-run questions and the Step 1 issue question (`{SESSION_DIR}/owner-answer.md`) are validated by `branches parse` (`git check-ref-format`, ref existence), `runs locate` (exact identity checks) and `fids parse`, exactly as a prompt token is.
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
- [ ] **User Context:** every file the runbook names was opened in this session and is writable in the worktree `/Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format`. The owner answered Q1-Q5 (`docs/plans/202611/logs/895-one-question-format/plan-answers-1.md`), so no information is missing.
- [ ] **Project Context:** read `docs/decisions.jsonl` `design-grill-step` (host question tool caps at 4 questions of 4 options and exists only in Claude), `891-resume-reruns-a-red-gate-pause` (#891 touches `decisions apply`); `docs/knowledge.jsonl` `instructions-store-clause-text-and-local-entries-need-hand-edits` and `renumbering-a-workflow-leaves-instructions-md-local-entries-stale` (every edited standing line needs its `.bkit/instructions.md` local entry edited by hand; `pnpm instructions:sync` does not drop stale entries); `docs/deferrals.jsonl` rows from #703 on `question-option-format.test.ts` and `decisions.ts` (the closed `703-standardise-question-option-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-52` is the 26-option cap Task 2 keeps pinned); `docs/knowledge.jsonl` `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e`, `wording-retired-prefix-of-new-text-and-loose-list-items` and `tracker-true-block-between-group-and-false-block-breaks-none-render` (the tracker-rendered list items Tasks 5-9 edit).
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
- **MODIFY:** `decision-items.json` — `options` becomes an array of `{"name": "{option}", "effect": "{what happens if it is picked}"}` objects; `recommended` names an option's `name`. A bare-string option is accepted only when it is a fixed name (`Accept`, `Fix now`, `Stop`, `Try again`, `Decide`), and gets that name's default effect; any other bare string is refused.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Read one option per line and `Recommended: none` from a decision file | `.bkit/core/engine/commands/workflow/decisions.ts` | language-server references to `parseDecisionItems` (callers `applyRecommendations`, `apply`, `pending`, `summary.ts` `buildSummary`, `summary-findings.ts` `challengeResolution`, `challenge.ts` `acceptedLocations`); `grep -rln 'Options:\|No recommendation' .bkit/core/engine --include='*.ts'` | `parseDecisionItems` — reads the `Options:` line and `No recommendation`; missing per-line options and `Recommended: none` | EXTEND | Add the per-line read and the `none` recommendation; keep the `Options:` fallback and the `DecisionItem` fields, so no caller changes |
| Write the shared shape into a decision file | `.bkit/core/engine/commands/workflow/decisions.ts` | references to `itemLines`, `letteredOptions`, `composeItems`; `grep -n 'Reply per question' .bkit/core/engine/commands/workflow/decisions.ts` | `itemLines` and the `compose` verb — write `Options:`, `Recommended:` / `No recommendation` and the old reply line; missing effects, the default line and the "one by one" offer | EXTEND | Rewrite `itemLines` and the footer in place; `letteredOptions` stays for the deferral description |
| A per-option effect in `decision-items.json` | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -rn -i 'effect' .bkit/core/engine/commands/workflow/decisions.ts .bkit/core/engine/commands/workflow/challenge.ts` (no hit); `grep -rn 'decision-items.json' .bkit/core/workflows/*.md` (only `bkit-build.md`) | `ComposeItem` / `composeItems` — validate title, question, string options and recommendation; missing effect | EXTEND | `options` items become `{name, effect}`; `composeItems` validates both fields, refuses ` — ` inside a name, and maps a bare fixed name to its default effect |
| Define the shared question shape once | `.bkit/core/.bkit/authoring.md` | `grep -n 'Human questions' .bkit/authoring.md .bkit/core/.bkit/authoring.md`; `grep -n 'Question layout' .bkit/core/.bkit/workflows.md` | § Human questions (inline `Options:` shape, `No recommendation`, debug Loop Question example); `.bkit/core/.bkit/workflows.md` § Question layout restates it | EXTEND | Rewrite § Human questions to the new shape, footer, default set, hard-blocker line, one-by-one route and `Action needed` line; point § Question layout at it instead of restating it |
| Shared reply line across workflows | `.bkit/instructions.md` | `grep -n 'Reply per question\|host question tool\|"yes" takes every\|"stop" writes a handover' .bkit/instructions.md`; `pnpm instructions:show --file bkit-debug` | `workflow-yes-takes-all` clause (`"yes" takes every recommendation.`, carriers `bkit-build`, `bkit-debug`, `bkit-ship`) and `workflow-stop-writes-handover` clause (`"stop" writes a handover; the run can be resumed.`, carriers `bkit-debug`, `bkit-ship`) hold the old reply line's sentences; `workflow-plain-text-questions` (carriers all but `bkit-auto`, `bkit-plan`), `workflow-letter-reply` and `workflow-record-reply` clauses | EXTEND | Fold `workflow-yes-takes-all` into a `workflow-question-reply-line` clause carrying the new lead sentence (old text in `retired`); reword `workflow-stop-writes-handover` to the new stop sentence (old text in `retired`); both before the first carrier edit (Task 4); widen `workflow-plain-text-questions` to `bkit-plan` |
| A wait before the run's status file exists | `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` | `grep -rn 'end turn → wait for' .bkit/core/workflows`; read `owner-wait-rows.test.ts` (`waits`, the `record the wait` rule) | `owner-wait-rows.test.ts` — requires every `end turn → wait for answers` or `end turn → wait for the answer` line to record the wait | EXTEND | Exempt the fixed `end turn → wait for the answer; no status file yet` wording, and assert it appears only before `workflows start` |
| Formatted Step 1 issue-and-branch stops in the five phase workflows | `.bkit/instructions.md` | `grep -n 'names more than one issue\|lowercase-slug\|only a bare number' .bkit/instructions.md .bkit/core/workflows/*.md`; read `fids parse` exit 8 output (`fids.ts:744`, `:781`, prints `ambiguous`) | `workflow-issue-id-parse-ambiguous`, `workflow-issue-id-parse-slug` and `workflow-fid-bare-number` clauses (carriers all but `bkit-auto`) | EXTEND | Reword the three clauses (old text in `retired`); `pnpm instructions:sync` rewrites all five carriers |
| Ask a round one question at a time on request | `.bkit/core/.bkit/authoring.md` | `grep -rn 'one by one' .bkit/core/workflows .bkit/instructions.md` | `workflow-open-questions-one-by-one` clause (design and plan open questions only) | EXTEND | § Human questions states the one-by-one route for every round; the clause keeps its design / plan role and gains the shared-shape wording |
| Formatted questions at the debug branch and CI-run stops (#7, #8) | `.bkit/core/workflows/bkit-debug.md` | `grep -n 'STOP' .bkit/core/workflows/bkit-debug.md`; read `branches parse` (`.bkit/core/engine/commands/workflow/branches.ts`) and `runs locate` (`.bkit/core/engine/commands/workflow/runs.ts`) exit codes | `branches parse` exit 3 / 8 and `runs locate` exit 8 / 82 already print the candidates and validate a named branch or reference | EXTEND | Reword the two routes as questions; re-run the same verbs on the owner's answer (Q3), so no new engine verb |
| `Action needed` line at the foreign-path stop (#9) | `.bkit/core/workflows/bkit-debug.md` | `grep -rln 'Action needed' .bkit/core .bkit/authoring.md` (no hit) | `Foreign path` bullet — asks in prose | EXTEND | Replace the prose ask with the fixed line; keep its `owner-pause reason=foreign-path` rows |
| Check the shape across the shipped text | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` | `grep -rln 'Options:' .bkit/core/engine --include='*.test.ts'`; read the whole file | `question-option-format.test.ts` — scans workflows, prompts, templates and authoring docs for inline lettered `Options:` lists and lettered `Recommended:` lines | EXTEND | Add per-line option blocks, the default line, the reply line and `Recommended: none` to the scan; keep the RED-PROOF style |
| Open questions written one option per line | `.bkit/instructions.md` (`plan-open-questions`), `.bkit/core/prompts/bkit-design-generate.md`, `.bkit/core/prompts/bkit-design-update.md`, `.bkit/core/prompts/bkit-design-review-2.md`, `.bkit/core/docs/templates/bkit-plan.md`, `.bkit/core/docs/templates/bkit-audit-models.md`, `.bkit/core/.bkit/prompts.md` | `grep -rln -e '· B)' -e 'Default if unanswered' .bkit/core/workflows .bkit/core/prompts .bkit/core/docs/templates .bkit/core/.bkit .bkit/instructions.md`; `grep -rn 'Options: A)' .bkit/core/.bkit .bkit/core/docs/templates` | the `plan-open-questions` clause and its four prompt copies; the design prompts' local rule lines; the plan template placeholder; the `bkit-audit-models.md` `Proposal` line (`:119`, a § Local Instructions `Audit templates` entry); six `.bkit/core/.bkit/prompts.md` rows (`:309`, `:311`, `:313`, `:321`, `:324`, `:325`) | EXTEND | Reword each to one option per line; `pnpm instructions:sync` rewrites the four plan-prompt copies |

## Architecture & Component Changes

Every change edits an existing file; there is no `[NEW]` and no `[DELETE]` file (every `Reuse Inventory` row is `EXTEND`).

**Ledger rows:** `895-shared-question-shape`, `895-question-delivery-one-message-one-by-one-offer`, `895-decision-items-per-option-effect`, `895-host-question-tool-forbidden-everywhere`, `895-debug-branch-and-ci-stops-become-questions`, `895-question-labels-kept`, `895-plan-human-confirmation-checkboxes-stay-a-document-gate`, `895-pause-timing-limits-and-answer-effects-unchanged`, `895-start-step-issue-and-branch-stops-question-shape`, `895-start-step-issue-stops-question-and-action-lines`

### Database Migrations

None — bkit has no database. No upgrade migration either: old decision files stay readable (`Data Schema Changes`).

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.ts`

- **Existence Check:** the file exists (597 lines); `parseDecisionItems`, `ComposeItem`, `composeItems`, `itemLines`, `letteredOptions` and `decisionsCommand` were read in full.
- **File header comment:** describes the new item layout and says the old `Options:` line is still read.
- `parseDecisionItems` (exported; signature unchanged, `DecisionItem` unchanged):
  - Options: the item's lines that match `^[A-Z]\) ` after its `**Q{n} — …:**` line, in order; each name is the text after the letter up to the first `—`. **If** the item has no such line → split the `Options:` line on `/` as today.
  - Recommendation: `Recommended: none — {why}` → `recommended` null and `reason` = `{why}`. `No recommendation — {why}` still reads as null.
  - The `Default if unanswered:` line is not parsed; nothing reads it back.
- `ComposeItem.options` becomes `Array<{ name: string; effect: string } | string>`. `composeItems`:
  - maps a bare string that is a fixed name to `{name, effect}` with that name's default effect: `Accept` — the item is recorded as accepted and the build moves on; `Fix now` — one more fix round runs before the build moves on; `Stop` — the run stops with a handover; the next run resumes here; `Try again` and `Decide` — the loop effects below;
  - refuses (exit 2, `item {i}: option {L} needs a name and an effect`) any other bare string, and an object that lacks either field;
  - refuses (exit 2) a `name` that contains `—`, because `parseDecisionItems` cuts the name at the first `—`;
  - keeps the 26-option cap (`MAX_OPTIONS`, message `at most 26 options`) and checks `recommended` against the names.
- `itemLines(n, item)` writes, in order:
  - `**Q{n} — {title}:** {question}`.
  - One line per option: `{L}) {name} — {effect}`.
  - `Recommended: {L}) {name} — {reason}`, or `Recommended: none — {noRecommendation}` for a hard blocker.
  - `Default if unanswered: the run waits for you; taken as {L} when nobody can be asked`, or `Default if unanswered: the run waits for you; the run stops when nobody can be asked` for a hard blocker, because a hard blocker in a headless run goes to the Failure Path (`.bkit/core/workflows/bkit-build.md:174`) (Q1, option A).
- `compose --loop`: the loop question's options get fixed effects: `Try again — one more fix round runs`, `Decide — the questions below are asked instead of another round`, `Stop — the run stops with a handover; the next run resumes here`.
- The file's last lines: `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the run can be resumed.`, then `Or say "one by one" and I'll ask them one at a time.` when the file holds 3 or more questions, the loop question included.
- The `--items` flag help names the new shape: `JSON file: [{title, question, options: [{name, effect}], recommended, reason} | {…, noRecommendation}]`.
- `deferralRow` keeps `letteredOptions` (names only), so `docs/deferrals.jsonl` descriptions do not change.
- Callers `summary.ts`, `summary-findings.ts` and `challenge.ts` need no change: they read `title`, `decision`, `assumed` and `options`, whose values are the same for both layouts.

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.test.ts`

- **Existence Check:** the file exists (539 lines).
- The `ITEMS` and `BLOCKER` fixtures switch to `{name, effect}` options; the tests that pin the old layout (`writes the header, one item per question and the reply line`, `compose letters every option and the recommended one`, `--loop letters the loop question's options and recommendation`, `round-trips the last lettered option through parseDecisionItems`) are updated to the new layout. `refuses an item with more options than letters` builds 27 `{name, effect}` options and asserts the `at most 26 options` message, so it pins the cap rather than the bare-string refusal. The old-layout parse tests stay as they are.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.test.ts`, `.bkit/core/engine/commands/workflow/challenge.test.ts`

- **Existence Check:** both exist; `summary.test.ts:835-840` and `challenge.test.ts:537-547` use only the old `Options:` layout.
- One test each reads a per-line decision file: `buildSummary` (`summary.ts:302-306`) and `acceptedLocations` (`challenge.ts:228-245`) take its lettered `Decision: A` as `Accept`.

### Shared definition (agent-read docs)

#### [MODIFY] `.bkit/core/.bkit/authoring.md`

- **Existence Check:** the file exists; § Human questions is at line 631. `.bkit/authoring.md` is its installed copy (differs only in the managed marker).
- § Human questions states, as separate bullets:
  - Who asks and how: only the orchestrator, in the session, in plain text; never through a subagent or a host question tool, at every question point.
  - The shape (the #895 block), with option lines `A) {option} — {what happens if you pick it}`.
  - `Default if unanswered:` takes phrases from the closed set `the run waits for you`, `taken as A when nobody can be asked`, `the run stops when nobody can be asked`, `the plan assumes A`, `the plan stops at Gate 1 until you answer`, `the design assumes A`, `written as a needs-decision deferral`; two phrases join with `; ` where a point acts differently with and without someone to ask (`the run waits for you; taken as A when nobody can be asked`, `the run waits for you; the run stops when nobody can be asked`) (Q1, option A).
  - A point that never has a recommendation (ship's Confirm Assumed Items, the debug branch check, the debug CI-run lookup, the Step 1 issue question) drops the "yes" half of the reply line (Q2, option A).
  - Every mid-run `Stop` option reads `Stop — the run stops with a handover; the next run resumes here`; a Step 1 question's stop reads `Stop — nothing changes; the run can be started again`, because nothing has started yet.
  - A hard blocker has `Recommended: none — {why only you can decide}`; "yes" never answers it.
  - The reply line, once per message, and the "one by one" line from 3 questions on; where "stop" does not write a handover, the second sentence says what "stop" does there (Q2, option A).
  - **If** the owner replies "one by one" → ask each unanswered question in its own message, in order, recording the wait and the reply for each; route once the last one is answered.
  - The "one by one" messages count as the one turn or pause they replace, so a turn or pause limit (`GRILL_TURNS` at the grill) is used up no faster.
  - The "one by one" line follows the count of questions asked in that message, not the count in the decision file.
  - A stop whose answer is an action, not a choice, writes one line: `**Action needed — {title}:** {what to do}. Then say "continue".`
  - A question asked before the run has a status file records no `owner-pause` / `owner-answer` row, and its wait reads `end turn → wait for the answer; no status file yet`.
  - The two examples become the build verify gap (#895 comment) and the debug Loop Question in the new shape; the Loop Question example shows the reason that matches its trigger.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; § Question layout is the bullet at line 1018 under `/bkit-build` § Ask points.
- The bullet keeps the attempt line, the option names (`Try again` / `Decide` / `Stop`, `Accept` / `Fix now`, `Confirm` / `Reject`) and the `optionAnswer` sentence, and points to `.bkit/authoring.md` § Human questions for the shape instead of restating `Options: A) … / B) …` and the old reply line (Task 3).
- `/bkit-build` § Hard blockers (`:989`): "No recommendation; "yes" never answers one." becomes `Recommended: none — {why}`; "yes" never answers one (Task 5).
- The `Foreign path` contract row (`:244`): "**STOP** and ask the human to commit or revert it" becomes the `**Action needed — Foreign path:**` line, and any debug Step 1 / Step 2 stop description matches the new questions (Task 6).
- Any `.bkit/workflows.md` line that describes a Step 1 `fids parse` exit 3, 8 or 9 stop matches the reworded clauses (Task 9).

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** the file exists; § Clauses holds `plan-open-questions` (line 3844), `workflow-plain-text-questions`, `workflow-open-questions-one-by-one` (line 6955); § Local Instructions holds the per-file entries.
- Task 4, before any carrier edit: new clause `workflow-question-reply-line` (workflow, where-used; carriers `bkit-build`, `bkit-debug`, `bkit-ship`): `Reply with a letter per question, or "yes" to take every recommendation.`. `workflow-yes-takes-all` (`"yes" takes every recommendation.`) folds into it, its text in the new clause's `retired`, so no clause is left below the `SHARED_MIN.workflow` = 2 carrier cut-off (`.bkit/core/engine/tools/instructions.ts:90-95`). Add the entry first, run the no-flag check, then `pnpm instructions:sync`.
- Task 4: `workflow-stop-writes-handover` is reworded to `"stop" ends here with a handover; the run can be resumed.`, the old text in `retired`, so the new carrier sentence is the clause itself and not a near-copy of it (`NEAR_COPY` = 0.8, `instructions.ts:88`).
- Task 8: `workflow-question-reply-line` carriers gain `bkit-design` (the grill turn).
- Never retire a wording that is a prefix of its new text (`docs/knowledge.jsonl` `wording-retired-prefix-of-new-text-and-loose-list-items`); run `pnpm instructions:sync` twice and check that the second run changes nothing.
- `workflow-plain-text-questions` carriers gain `bkit-plan`.
- `workflow-open-questions-one-by-one`: asks each item in the shared question shape, in plain text, not through a host question tool; the old text moves to `retired`.
- `plan-open-questions`: `Options: A) {option} — {trade-off} · B) …` becomes one lettered option per line (`A) {option} — {trade-off}`), then `Recommended`, then `Default if unanswered:` from the closed set: `the plan assumes A`, or `the plan stops at Gate 1 until you answer` when no assumption is safe; the old text moves to `retired`.
- Task 9: `workflow-issue-id-parse-ambiguous` (exit 8) becomes a formatted question whose options are the issues `fids parse` prints under `ambiguous`; `workflow-issue-id-parse-slug` (exit 3) and `workflow-fid-bare-number` (exit 9) become `**Action needed — {title}:**` lines (Q5, option A); each old text moves to `retired`.
- § Local Instructions `Audit templates` entry for the `bkit-audit-models.md` `Proposal` line (Task 10).
- Every edited standing line's § Local Instructions entry is edited by hand in the same task (`instructions:sync` does not drop stale entries).

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** the file exists; § Decision Pause steps 2 and 4 were read.
- Step 2: `decision-items.json` options are `{"name", "effect"}` objects. Default effects per fixed option: `Accept` — the item is recorded as accepted and the build moves on (an `UNPROVEN` item: your reason becomes its `TEST EXCEPTION`); `Fix now` — one more fix round runs before the build moves on; `Stop` — the run stops with a handover; the next run resumes here. The orchestrator may sharpen an effect to the item.
- Step 4: the message shows each unanswered item's option lines, its `Recommended:` line and its `Default if unanswered:` line, then the reply line; "yes" never answers `Recommended: none`; a "one by one" reply follows § Human questions.
- Step 4: the "one by one" line is shown only when the message asks 3 or more questions. After a headless apply, the build asks only the `hardBlockers` subset (`bkit-build.md:175`), so the file's own footer can offer the line for a 1-question ask.
- Step 4's "yes" line (`:180`) carries the `workflow-question-reply-line` sentence after Task 4's sync.

#### [MODIFY] `.bkit/core/workflows/bkit-debug.md`

- **Existence Check:** the file exists; § Loop Question, § Step 1 sub-step 2, § Step 2 `runs locate` routes and the `Foreign path` bullet were read.
- § Loop Question (#6): `A) Stop — the run stops with a handover; the next run resumes here`, `B) Try again — one more {fix|soak} attempt runs`; **If** `LOOP_LIMIT` = true (the soak attempts are used up) → `Recommended: A) Stop — the attempts set aside for this are used up`; every other branch → `Recommended: A) Stop — the last attempt left no fewer failures`; `Default if unanswered: the run waits for you`; the shared reply line.
- Step 1 branch check (#7, exit 3 or 8): `**Q1 — Branch:**` with one option per candidate branch printed by `branches parse` (`Use branch {x} — debug adopts {x} and runs its tests there`), `Name another branch — reply with its name`, and `Stop — nothing changes; the run can be started again`; `Recommended: none — only you know which branch you meant`; `Default if unanswered: the run waits for you; the run stops when nobody can be asked`; on the answer, write `branch={x}` to `{SESSION_DIR}/owner-answer.md` and re-run `branches parse --prompt-file="{SESSION_DIR}/owner-answer.md"` (Q3, option A). No status rows (A5). The reply line is `Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.` (Q2): it has no "yes" half because the question has no recommendation, and Step 1 has no handover to write.
- Step 1's wait reads `end turn → wait for the answer; no status file yet`, the fixed pre-status wording `owner-wait-rows.test.ts` exempts.
- Step 2 CI-run lookup (#8, exit 8 or 82): `**Q1 — CI run:**` with one option per candidate reference (`Use {reference} — debug reads that run's failures instead of running the tests itself`), `Use local discovery — debug runs the tests itself instead of reading CI`, and `Stop — the run stops with a handover; the next run resumes here`; `Recommended: none — only you know which run you meant`; `Default if unanswered: the run waits for you; the run stops when nobody can be asked`; the reply line `Reply with a letter per question. "stop" ends here with a handover; the run can be resumed.` (Q2), with no "yes" half because the question has no recommendation; keeps the `owner-pause reason=decision` row.
  - The question text carries the engine's message word for word, including `Supply branch={x} in its checkout` on an exit 82 branch conflict (`runs.ts:164-168`).
  - **If** exit 82 printed no candidate reference → the options are only `Use local discovery` and `Stop`.
  - The workflow lock stays held while the owner answers, as at the Loop Question (`bkit-debug.md:131-147`). Release it (`locks release`) only on the `Stop` answer. Releasing it before the wait lets a second debug run take the lock, and then this run's Close Workflow `locks release --token=... || exit 1` (`bkit-debug.md:826`) exits `EXIT_NOT_OWNER` (`locks.ts:477-479`).
  - On a pick, records `owner-answer`, writes the pick to `{SESSION_DIR}/owner-answer.md` and re-runs `runs locate` with that `--prompt-file`. The re-run line sits after the original `runs locate` line, because `debug-ci-evidence.integration.test.ts:28-35` executes the first `"{BKIT}" runs locate` line of Step 2. The pick stays on record in `{SESSION_DIR}/owner-answer.md` and in the `--selection-out` file the re-run writes; the session prompt the input artifact copies (`workflows input --prompt-file="{SESSION_DIR}/prompt.md"`, `:324`) is not rewritten (Q3).
- `Foreign path` bullet (#9): writes `**Action needed — Foreign path:** commit or revert {file}. Then say "continue".`; keeps its `owner-pause reason=foreign-path` and `owner-answer` rows.
- Every edited list item keeps no blank line inside it, because `bkit-debug.md:200` sits in a list item with tracker `false` / `true` blocks (`:201-214`) and `:48` ends in an inline tracker `true` block (`docs/knowledge.jsonl` `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e`, `wording-retired-prefix-of-new-text-and-loose-list-items`, `tracker-true-block-between-group-and-false-block-breaks-none-render`).

#### [MODIFY] `.bkit/core/workflows/bkit-ship.md`

- **Existence Check:** the file exists; § Confirm Assumed Items and § Merge Question were read.
- § Confirm Assumed Items (#10): `A) Confirm — the accept is recorded as yours, as a decision row`, `B) Reject — the item is written as a needs-decision deferral`; `Recommended: none — only you can accept it`; `Default if unanswered: written as a needs-decision deferral`; reply line per Q2 option A. The `Confirm` / `Reject` / `**Else** → ask again` routes stay.
- § Merge Question (#11): `A) Stop — the run stops with a handover; the next run resumes here`, `B) Try again — {one more set of merge attempts | a fix round} runs`; `Recommended: A) Stop — {reason}`; `Default if unanswered: the run waits for you`; the shared reply line.

#### [MODIFY] `.bkit/core/workflows/bkit-design.md`

- **Existence Check:** the file exists; § Step 3 sub-steps 2-4 and § Step 12 sub-step 7 were read.
- Grill (#1): per question, option lines with what each does, `Recommended: A) {answer} — {why}`, `Default if unanswered: the design assumes A`; the round ends with the reply line, whose second sentence is `"stop" ends the interview; the design goes on with what is settled.` (Q2), and the "one by one" line from 3 questions on.
- Grill turn count: a "one by one" round counts as the single grill turn it replaces against `GRILL_TURNS` (`:252`, `:286`, `:300`), so a 3-question round asked one by one does not use up three turns and leave unasked items `Assumed, not confirmed`.
- Draft scenario (#2): `A) Yes — the draft becomes the design's starting point`, `B) No — the draft is revised from your reply before the design starts`; `Recommended: A) Yes — {why}`; `Default if unanswered: the design assumes A`.
- Step 12 sub-step 7 (#3): the `workflow-open-questions-one-by-one` clause in its new wording.

#### [MODIFY] `.bkit/core/workflows/bkit-plan.md`

- **Existence Check:** the file exists; § Step 8 sub-step 7 was read.
- Sub-step 7 (#4): the `workflow-open-questions-one-by-one` clause in its new wording, which now carries `plain text, not through a host question tool.`

#### [MODIFY] Step 1 of `.bkit/core/workflows/bkit-{design,plan,build,debug,ship}.md`

- **Existence Check:** each file carries the three Step 1 clauses (exit 8, exit 3, exit 9: `bkit-design.md:121`, `:135`, `:158`; `bkit-plan.md:121`, `:135`, `:158`; `bkit-build.md:328`, `:342`, `:372`; `bkit-debug.md:193`, `:212`, `:235`; `bkit-ship.md:135`, `:149`, `:172`), each before its file's `workflows start` block.
- Exit 8 (Q5, option A): `**Q1 — Issue:**` with one option per issue `fids parse` prints under `ambiguous` (`Use {issue} — the run works on {issue}`) and `Stop — nothing changes; the run can be started again`; `Recommended: none — only you know which issue you meant`; `Default if unanswered: the run waits for you; the run stops when nobody can be asked`; on a pick, write the issue reference to `{SESSION_DIR}/owner-answer.md` with the file-write tool and re-run `fids parse --prompt-file="{SESSION_DIR}/owner-answer.md"`; the reply line `Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.` (Q2), with no "yes" half because the question has no recommendation.
- Exit 3: ``**Action needed — Branch name:** rename `BRANCH` to `feat/{lowercase-slug}`, or name an issue. Then say "continue".``; on "continue" the block re-runs.
- Exit 9: ``**Action needed — Issue reference:** name the issue as `#N`, its key or its URL. Then say "continue".``; on "continue" the block re-runs with the named reference written to `{SESSION_DIR}/owner-answer.md`.
- Each wait reads `end turn → wait for the answer; no status file yet`; no status rows, because Step 1 runs before `workflows start`; never the **Failure Path**.
- The routes come from the three reworded clauses; `pnpm instructions:sync` rewrites all five carriers.

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
- The `**Open Question:**` bullet becomes `**Q{n} — [title]:** [the decision, worded so "yes" takes the recommendation]`, with sub-bullets `A) [option] — [trade-off]`, `B) …`, `C) … (optional)`, `Recommended: A) [option] — [why]`, `Default if unanswered: [the plan assumes A | the plan stops at Gate 1 until you answer]`, the second phrase for a question with no safe assumption. The `👤 ✅ Human Confirmation` checkbox is untouched.

#### [MODIFY] `.bkit/core/docs/templates/bkit-audit-models.md`

- **Existence Check:** the file exists; line 119 holds the `Proposal` question rule `Options: A) … / B) …`, and its § Local Instructions entry sits under `Audit templates` in `.bkit/instructions.md` (`:14016`).
- The rule asks for one lettered option per line, `A) {option} — {what happens}`, then `Recommended: A) … — {reason}` and `Default if unanswered:`, plus what would settle it.
- The template's title and purpose do not change, so its `.bkit/prompts.md` § Audit row (`:401`) stays as it is; the task checks it.

#### [MODIFY] `.bkit/core/.bkit/prompts.md`

- **Existence Check:** the file exists; the rows that name the inline lettered `Options: A) …` were read: `bkit-design-generate` (`:309`), `bkit-design-review-2` (`:311`), `bkit-design-update` (`:313`), `bkit-plan-generate` (`:321`), `bkit-plan-scope-check` (`:324`) and `bkit-plan-update` (`:325`).
- All six rows describe one lettered option per line instead of "the lettered `Options: A) …`".

### Tests (shipped-text audit)

#### [MODIFY] `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

- **Existence Check:** the file exists (507 lines), read in full.
- The scanner reads per-line option blocks as well as inline `Options:` lists, so its count test holds while the text moves over; `Recommended: none — {why}` passes the recommendation rule; the canonical-shape test reads § Human questions instead of the `**Question layout**` bullet.
- New tests per Task 3-10 (see `Derived Test Matrix`). The end check (Task 10) asserts that no inline lettered `Options: A)` list remains in the scanned directories; it matches only lettered lists, so `X-Content-Type-Options: nosniff` in `.bkit/core/docs/templates/bkit-audit-security.md:124` and `:159` is not flagged.

#### [MODIFY] `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts`

- **Existence Check:** the file exists; `waits` (`:25-26`) and `each wait records it before the turn ends` (`:38-40`) were read.
- `waits` leaves out lines with the fixed pre-status wording `end turn → wait for the answer; no status file yet`. A new test asserts that each such line sits before the file's `workflows start` block and names no `owner-pause` row, so the wording cannot slip a real wait past the guard (Task 6).

### Generated and installed copies

#### [MODIFY] `.bkit/core/engine/render/__snapshots__/bkit-{build,debug,ship,design,plan}.none.txt`

- Regenerated with `pnpm vitest run .bkit/core/engine/render/trackers.test.ts -u` in the task that edits each workflow (Tasks 4-9); the diff is reviewed against the source edit.
- A regenerated baseline passes whatever the render prints, so each task also checks that the count of `No tracker connected` lines in each regenerated `*.none.txt` equals the count before the edit (`grep -c 'No tracker connected'`), and runs `pnpm prettier --check` on each edited workflow source.

#### [MODIFY] `.bkit/core/.bkit/cli.md`

- The generated `decisions` table is rewritten by `pnpm cli:sync` when the `compose` flag help changes.

#### [MODIFY] installed copies

- `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-renders `.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/`, `.bkit/` (`authoring.md`, `workflows.md`, `prompts.md`, `cli.md`) and `docs/templates/bkit-plan.md`.
- `pnpm build && git add dist/` after the `decisions.ts` edit, so `dist/` lands with it.
- `pnpm bkit:graph:refresh` after the engine edit is staged, so `docs/capabilities.md` and the graph register match.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None — no file is replaced. Text the change rewrites in place (the inline `Options:` lines, `No recommendation`, the old reply line, the `workflow-yes-takes-all` clause folded into `workflow-question-reply-line`) is removed by the edits that replace it; Task 10's end check asserts no inline lettered `Options: A)` list remains. The old decision-file layout stays readable on purpose (A4), so the `Options:` fallback in `parseDecisionItems` is not superseded.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/authoring.md` (installed as `.bkit/authoring.md`) | § Human questions rewritten to the shared shape (Task 3) |
| `.bkit/core/.bkit/workflows.md` (installed as `.bkit/workflows.md`) | Each workflow task updates the lines that describe its own question points (`.agents/rules.md` § Index updates): § Question layout points to § Human questions (Task 3); § Hard blockers `:989` (Task 5); the `Foreign path` contract row `:244` and any debug Step 1 / Step 2 stop description (Task 6); any Step 1 stop description (Task 9) |
| `.bkit/core/.bkit/prompts.md` (installed as `.bkit/prompts.md`) | `bkit-design-generate`, `bkit-design-review-2`, `bkit-design-update`, `bkit-plan-generate`, `bkit-plan-scope-check` and `bkit-plan-update` rows describe one option per line; the § Audit `bkit-audit-models` row is checked and stays, because the template's title and purpose do not change (Task 10) |
| `.bkit/core/.bkit/cli.md` (installed as `.bkit/cli.md`) | `decisions compose` row, generated by `pnpm cli:sync` (Task 2) |
| `.bkit/instructions.md` | `workflow-question-reply-line` clause (with `workflow-yes-takes-all` folded in) and `workflow-stop-writes-handover` reworded (Task 4); `bkit-design` carrier, `workflow-open-questions-one-by-one` reworded, `workflow-plain-text-questions` carriers (Task 8); the three Step 1 clauses (Task 9); `plan-open-questions` and the `bkit-audit-models` `Audit templates` entry (Task 10); Local Instructions entries of every edited line (Tasks 4-10) |
| `docs/decisions.jsonl` | Seven rows written by this plan, including `895-start-step-issue-stops-question-and-action-lines` for the owner's Q5 answer, plus the updated `895-decision-items-per-option-effect` row for the bare fixed-name mapping and the updated `895-shared-question-shape` and `895-debug-branch-and-ci-stops-become-questions` rows for the owner's Q1-Q3 answers (`Ledger rows` line) |
| `docs/deferrals.jsonl` | Rows for the `Exempt` items in `Out of Scope`; `895-start-step-issue-and-branch-stops-question-shape` closed, because the item is now Task 9 |
| `docs/capabilities.md` | Graph register refreshed by `pnpm bkit:graph:refresh` after the engine edit (Task 11) |
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
| **Code** | `git revert {COMMIT}` of the change's commits, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` to re-render the installed copies | Decision files written in the new layout during the change's life stay readable only by the new parser. Under the old parser, a per-line file has no `Options:` line, so its items parse with no options, and `Recommended: none — …` parses as `recommended = "none"` (`decisions.ts:91-105`); `apply --by=headless` then writes `Decision: none — recommended; applied without asking` (`decisions.ts:261-265`) and settles a hard blocker nobody answered. **If** a run in progress wrote one → finish or abandon that run before the revert, or keep the `parseDecisionItems` per-line read in the revert |
| **Risk window** | A consumer upgrading bkit mid-build, or a `/bkit-build` in a sibling worktree of bkit's own repo once the main checkout's `dist/` is rebuilt (A3) | A bare fixed name gets its default effect, so the old `bkit-build.md` keeps working; any other bare-string option makes `compose` exit 2, and the Decision Pause goes to the Failure Path; re-running the block with effects recovers, and rebasing in-flight branches before their next Decision Pause avoids it |

Code-only — `git revert` sufficient, with the decision-file caveat above.

## Agent Execution Runbook

Build order: the engine first (Group 1), so the build workflow text never names an items shape `compose` refuses; then the one definition and the reply-line clauses (Group 2), so every carrier edit lands on clauses that already hold the new wording; then each workflow's question points (Group 3); then the Step 1 stops, the open-question writers and the installed copies (Group 4).

Every task that edits a list item in a tracker-rendered region keeps no blank line inside the item, then checks `pnpm prettier --check` on the edited workflow source and the `No tracker connected` line count of each regenerated `*.none.txt` against the count before the edit (`docs/knowledge.jsonl` `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e`, `wording-retired-prefix-of-new-text-and-loose-list-items`, `tracker-true-block-between-group-and-false-block-breaks-none-render`).

Every task that edits a standing line of a workflow, prompt or template also edits that line's `.bkit/instructions.md` § Local Instructions entry by hand, because `pnpm instructions:sync` does not drop stale entries. For a clause change, edit the clause entry first, run `pnpm tsx .bkit/core/engine/tools/instructions.ts` with no flag, and only then `pnpm instructions:sync`.

Integration shape (advice only): one PR for all eleven tasks is fine. Building after #891 merges avoids a three-way edit of `decisions compose` (A6).

<!-- bkit:group 1 start -->

### TASK GROUP 1: Decision files in the shared shape

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Read one option per line and `Recommended: none` in `parseDecisionItems`, keeping the old `Options:` line
  - **UPDATE:** `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: options from the item's `{L}) {name} — {effect}` lines, each name being the text before the first `—`; **If** the item has no option line → split its `Options:` line on `/` as today
  - **UPDATE:** `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: `Recommended: none — {why}` → `recommended` null and `reason` = `{why}`; `No recommendation — {why}` still reads as null
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: the file header comment shows the new item layout and says the old `Options:` line is still read
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the seven `decisions.test.ts` tests below
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.test.ts`: the `buildSummary` test below, on a per-line decision file
  - **UPDATE:** `.bkit/core/engine/commands/workflow/challenge.test.ts`: the `acceptedLocations` test below, on a per-line decision file
  - **READ:** `optionAnswer` in `.bkit/core/engine/commands/workflow/decisions.ts`: the letter-to-name mapping, reused unchanged
  - **READ:** `bareName` in `.bkit/core/engine/commands/workflow/decisions.ts`: strips the letter from an option, reused unchanged
  - **READ:** `applyRecommendations` in `.bkit/core/engine/commands/workflow/decisions.ts`: hard blockers are the items whose `recommended` is null
  - **READ:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: how it reads a lettered `Decision:` (`:302-306`)
  - **READ:** `acceptedLocations` in `.bkit/core/engine/commands/workflow/challenge.ts`: how it reads a lettered `Decision:` (`:228-245`)
  - **DONE WHEN:** the nine tests below pass; the existing tests `parseDecisionItems keeps the bare option name, dropping the letter` and `a decision file written before the letters still parses` pass unchanged; `pnpm vitest run .bkit/core/engine/commands/workflow/summary.test.ts .bkit/core/engine/commands/workflow/challenge.test.ts` passes with no edit to `summary.ts`, `summary-findings.ts` or `challenge.ts`; `DecisionItem` has the same fields as before
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `parseDecisionItems reads one option per line and drops each effect` fails on `options` being empty for an item that has option lines and no `Options:` line
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `parseDecisionItems reads Recommended: none as a hard blocker` fails on `recommended` being "none" instead of null
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `a lettered decision in a per-line file reads as the option its letter labels` fails on the decision staying `B` instead of reading as `Fix now`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `apply --by=headless leaves a Recommended: none item for the owner` fails on exit 0 and a written "Decision: none" line instead of the hard-blocker exit 4
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `a per-line option whose text holds a slash or a middle dot stays one option` fails on `options` being empty instead of holding the one option `keep the read/write split`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `a file mixing both layouts parses each item in its own layout` fails on the per-line item having no options while the `Options:` item parses
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `apply --by=owner --confirm confirms an assumed item in a per-line file` fails on the assumed `Accept` item not being found in a per-line file
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `buildSummary reads a lettered decision in a per-line file as Accept` fails on the per-line item not being counted as accepted
    - `.bkit/core/engine/commands/workflow/challenge.test.ts` `acceptedLocations reads a lettered decision in a per-line file as Accept` fails on the accepted finding's location not being returned for a per-line file

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Write the shared shape with `decisions compose`, from options that each carry an `effect`
  - **UPDATE:** `ComposeItem` in `.bkit/core/engine/commands/workflow/decisions.ts`: `options` is an array of `{name, effect}`
  - **UPDATE:** `composeItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: a bare-string fixed name (`Accept`, `Fix now`, `Stop`, `Try again`, `Decide`) becomes `{name, effect}` with that name's default effect (Architecture); any other bare string, or an object missing `name` or `effect`, exits 2 naming the item and the option's letter; a `name` containing `—` exits 2; the 26-option cap (`MAX_OPTIONS`) stays; `recommended` is checked against the names
  - **UPDATE:** `itemLines` in `.bkit/core/engine/commands/workflow/decisions.ts`: the `**Q{n}**` line, one `{L}) {name} — {effect}` line per option, `Recommended: {L}) {name} — {reason}` or `Recommended: none — {why}`, then `Default if unanswered: the run waits for you; taken as {L} when nobody can be asked` (a hard blocker: `Default if unanswered: the run waits for you; the run stops when nobody can be asked`, because a headless hard blocker goes to the Failure Path, `.bkit/core/workflows/bkit-build.md:174`)
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: `compose --loop` gives `Try again`, `Decide` and `Stop` their fixed effects (Architecture), `Stop` reading `Stop — the run stops with a handover; the next run resumes here`, the same effect `composeItems` gives a bare `Stop`; the last lines are the shared reply line, plus `Or say "one by one" and I'll ask them one at a time.` when the file holds 3 or more questions, the loop question included; the `--items` help names the `{name, effect}` shape
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the `ITEMS` and `BLOCKER` fixtures use `{name, effect}` options; `writes the header, one item per question and the reply line`, `compose letters every option and the recommended one`, `--loop letters the loop question's options and recommendation` and `round-trips the last lettered option through parseDecisionItems` assert the new layout; `refuses an item with more options than letters` builds 27 `{name, effect}` options and asserts the "at most 26 options" message, not only exit 2, so it still fails if the cap is removed; the ten tests below
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated `decisions` table, rewritten by `pnpm cli:sync` if the verb's summary or flags change
  - **READ:** `letteredOptions` in `.bkit/core/engine/commands/workflow/decisions.ts`: letters option names for the deferral description
  - **READ:** `deferralRow` in `.bkit/core/engine/commands/workflow/decisions.ts`: deferral descriptions keep option names only
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the ten tests below and every other test in `decisions.test.ts` pass, the existing `--defer letters the options in the deferral row` unchanged and the updated `refuses an item with more options than letters` asserting the "at most 26 options" message; `pnpm cli:sync` leaves no drift; `pnpm build` rebuilds `dist/` and `pnpm bkit:check:dist` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose writes each option on its own line with its effect` fails on an "Options: A) Accept / B) Fix now" line being written instead of "A) Accept — "
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose refuses an option without an effect` fails on exit 0 for a bare-string option that is not a fixed name (`"Maybe"`) and for an object with no `effect`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose writes the default effect for a bare fixed option name` fails on a bare `"Accept"` option written with no "Accept — the item is recorded as accepted" line
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose refuses an option name that contains a spaced dash` fails on exit 0 and a file whose re-parsed option name is cut short at the " — "
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose writes a Default if unanswered line for each question` fails on the file holding no "Default if unanswered:" line, where the recommended item needs `the run waits for you; taken as A when nobody can be asked` and the hard blocker needs `the run waits for you; the run stops when nobody can be asked`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose writes Recommended: none for a hard blocker` fails on "No recommendation —" being written instead of "Recommended: none —"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose ends with the shared reply line` fails on the old "Reply per question." last line
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose offers one by one from three questions on, not for two` fails on a three-question file having no "Or say \"one by one\"" line
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `--loop writes an effect for each loop option` fails on the loop question's `Try again` option having no "Try again — one more fix round runs" line, where `Stop` needs `Stop — the run stops with a handover; the next run resumes here`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `round-trips an item with effects through parseDecisionItems` fails on `compose` refusing the `{name, effect}` options with exit 2

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: One definition of the question shape and its reply-line clauses

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Define the shared question shape once in `.bkit/authoring.md` § Human questions, and point § Question layout at it
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: § Human questions states, one bullet each, who asks and how (orchestrator only, plain text, never a subagent or a host question tool, at every point); the shape; the closed `Default if unanswered:` set (`the run waits for you`, `taken as A when nobody can be asked`, `the run stops when nobody can be asked`, `the plan assumes A`, `the plan stops at Gate 1 until you answer`, `the design assumes A`, `written as a needs-decision deferral`) and the `; ` join (Q1); the dropped "yes" half at a point that never has a recommendation (Q2); the one mid-run `Stop` wording `Stop — the run stops with a handover; the next run resumes here`, and the Step 1 `Stop — nothing changes; the run can be started again`; `Recommended: none — {why}` and that "yes" never answers it; the reply line and the "one by one" line from 3 questions on, with the point-true "stop" sentence (Q2); the "one by one" route, which counts as the one turn or pause it replaces and follows the count of questions asked in the message; the `**Action needed — {title}:** {what to do}. Then say "continue".` line; no status rows before a status file exists, with the fixed wait wording `end turn → wait for the answer; no status file yet`; the build verify-gap and debug Loop Question examples in the new shape
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `**Question layout**` bullet under `/bkit-build` § Ask points keeps the attempt line, the option names and the `optionAnswer` sentence, and points to `.bkit/authoring.md` § Human questions instead of restating `Options: A) … / B) …` and the old reply line
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: `optionLists` and `scanCounts` also count per-line option blocks, so `counts the option lines found per directory` holds while the text moves over; `RECOMMENDED_LETTER` accepts `none — `; `layoutBullet` and `the canonical layout letters every option and recommendation` read § Human questions; the six tests below
  - **READ:** `.bkit/core/.bkit/authoring.md`: § Which Sections Apply and § Before You Save, the authoring checklist for this edit
  - **DONE WHEN:** the six tests below and every other test in `question-option-format.test.ts` pass; `pnpm tsx .bkit/core/engine/tools/instructions.ts` (no flag) reports nothing to fix, then `pnpm vitest run .bkit/core/engine/tools/` passes; § Human questions has no `Options:` line and no `No recommendation` line
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape puts each option on its own line with its effect` fails on § Human questions still showing the inline "Options: A) {option} / B) {option}" line
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape carries a Default if unanswered line from the fixed set` fails on § Human questions holding no "Default if unanswered:" line, where the set must hold all seven phrases, `the run stops when nobody can be asked` and `the plan stops at Gate 1 until you answer` among them
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape gives a hard blocker Recommended: none` fails on § Human questions naming "No recommendation" in its place
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the canonical shape ends a message with the reply line and the one-by-one offer` fails on § Human questions having no "one by one" offer
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `RED-PROOF: an option line with no effect fires the option-line rule` fails on a synthetic `A) Accept` line with no `—` reporting no violation
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the Question layout bullet points to § Human questions` fails on the bullet restating "Options: A) … / B) …"

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Put the reply line's wording into its clauses before any carrier edit
  - **UPDATE:** `.bkit/instructions.md`: § Clauses — add `workflow-question-reply-line` (workflow, where-used; carriers `bkit-build`, `bkit-debug`, `bkit-ship`) with the text `Reply with a letter per question, or "yes" to take every recommendation.`, and fold `workflow-yes-takes-all` into it (its text `"yes" takes every recommendation.` in the new clause's `retired`, the old entry removed)
  - **UPDATE:** `.bkit/instructions.md`: § Clauses — reword `workflow-stop-writes-handover` to `"stop" ends here with a handover; the run can be resumed.`, the old text in `retired`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the Loop Question reply line (`:139`) reads the two clause sentences, with no `Reply per question.` left before them
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the Merge Question reply line (`:696`) reads the two clause sentences, with no `Reply per question.` left before them
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 4's "yes" line (`:180`) carries the `workflow-question-reply-line` sentence
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions `bkit-build`, `bkit-debug` and `bkit-ship` entries for the three edited lines
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `-u`, its diff matching the clause sync and its `No tracker connected` count unchanged
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with `-u`, its diff matching the clause sync and its `No tracker connected` count unchanged
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated with `-u`, its diff matching the clause sync and its `No tracker connected` count unchanged
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: the two tests below
  - **READ:** `.bkit/core/engine/tools/instructions.ts`: `SHARED_MIN` (`:90-95`), `NEAR_COPY` (`:88`, `:815-821`) and `unlistedShared` (`:917-941`), the checks the clause change must pass
  - **READ:** `docs/knowledge.jsonl`: `instructions-store-clause-text-and-local-entries-need-hand-edits` and `wording-retired-prefix-of-new-text-and-loose-list-items` (never retire a wording that is a prefix of its new text)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the two tests below pass; the clause entries were added before `pnpm instructions:sync` ran, and `pnpm tsx .bkit/core/engine/tools/instructions.ts` (no flag) reported nothing to fix, with no clause below the carrier cut-off and no near-copy; a second `pnpm instructions:sync` changes nothing; `pnpm prettier --check .bkit/core/workflows/bkit-build.md .bkit/core/workflows/bkit-debug.md .bkit/core/workflows/bkit-ship.md` passes; `pnpm vitest run .bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `no workflow carries the retired reply wording` fails on "\"stop\" writes a handover" still standing in `bkit-debug.md` and `bkit-ship.md`
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-build: the Decision Pause yes line uses the shared reply wording` fails on step 4 still reading "\"yes\" takes every recommendation" instead of "Reply with a letter per question"

<!-- bkit:task 4 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Every workflow question point in the shape

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Put the build's Decision Pause (#5) in the shared shape
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 2 writes `decision-items.json` options as `{"name", "effect"}` objects, with the default effects for `Accept`, `Fix now` and `Stop` (Architecture; `Stop` reads `Stop — the run stops with a handover; the next run resumes here`) and leave to sharpen an effect to the item
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
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Loop Question step 3 writes `A) Stop — the run stops with a handover; the next run resumes here` and `B) Try again — …` lines, `Default if unanswered: the run waits for you` and the shared reply line
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Loop Question step 3's recommendation follows the question's first-match branch: **If** `LOOP_LIMIT` = true → `Recommended: A) Stop — the attempts set aside for this are used up`; every other branch → `Recommended: A) Stop — the last attempt left no fewer failures`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Step 1 sub-step 2, `branches parse` exit 3 or 8 → `**Q1 — Branch:**` with one option per candidate, `Name another branch` and `Stop — nothing changes; the run can be started again`, `Recommended: none — only you know which branch you meant`, `Default if unanswered: the run waits for you; the run stops when nobody can be asked`, and the reply line `Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.` (Architecture); the answer goes to `{SESSION_DIR}/owner-answer.md` (written with the file-write tool) and `branches parse` re-runs on it (Q3); no status rows (A5); the wait reads `end turn → wait for the answer; no status file yet`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Step 2 `runs locate` exit 8 or 82 → `**Q1 — CI run:**` with one option per candidate reference (`Use {reference} — debug reads that run's failures instead of running the tests itself`), `Use local discovery — debug runs the tests itself instead of reading CI` and `Stop — the run stops with a handover; the next run resumes here`, `Recommended: none — only you know which run you meant`, `Default if unanswered: the run waits for you; the run stops when nobody can be asked`, and the reply line `Reply with a letter per question. "stop" ends here with a handover; the run can be resumed.`; the engine's message carried word for word (including `Supply branch={x} in its checkout`), and only `Use local discovery` and `Stop` when exit 82 printed no candidate; keeps the `owner-pause reason=decision` row
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
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: § Merge Question step 1 writes `A) Stop — the run stops with a handover; the next run resumes here` and `B) Try again — …` lines, `Recommended: A) Stop — {reason}`, `Default if unanswered: the run waits for you` and the shared reply line (its two sentences already from Task 4's clauses)
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
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: Step 12 sub-step 7 carries the reworded `workflow-open-questions-one-by-one` clause (shared shape, `plain text, not through a host question tool.`)
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: Step 8 sub-step 7 carries the same reworded clause
  - **UPDATE:** `.bkit/instructions.md`: § Clauses — `workflow-question-reply-line` (created by Task 4) carriers gain `bkit-design`; `workflow-plain-text-questions` carriers gain `bkit-plan`; `workflow-open-questions-one-by-one` reworded, old text in `retired` (never a wording that is a prefix of its new text); § Local Instructions `bkit-design` and `bkit-plan` entries for every edited standing line
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
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the one-by-one open-questions pass forbids the host question tool in design and plan` fails on `bkit-plan.md`'s one-by-one step lacking "not through a host question tool"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `bkit-design: a one-by-one grill round counts as one grill turn` fails on Step 3 saying nothing about how a "one by one" round counts against `GRILL_TURNS`

<!-- bkit:task 8 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Step 1 stops, open questions one option per line, and the installed copies

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

- [ ] **TASK 10:** Write plan and design open questions one option per line
  - **UPDATE:** `.bkit/instructions.md`: § Clauses `plan-open-questions` asks for one lettered option per line (`A) {option} — {trade-off}`), then `Recommended`, then `Default if unanswered:` from the closed set (`the plan assumes A`, or `the plan stops at Gate 1 until you answer` when no assumption is safe); the old text moves to `retired`; `pnpm instructions:sync` rewrites it into `bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check` and `bkit-plan-update`
  - **UPDATE:** `.bkit/core/prompts/bkit-design-generate.md`: the `Risks & Open Questions` placeholder rule asks for one lettered option per line
  - **UPDATE:** `.bkit/core/prompts/bkit-design-update.md`: step 9's open-question rule asks for one lettered option per line
  - **UPDATE:** `.bkit/core/prompts/bkit-design-review-2.md`: step 8's `OPTIONAL` finding also covers options that share one line
  - **UPDATE:** `.bkit/core/docs/templates/bkit-plan.md`: the `Open Questions & Assumptions` placeholder uses `**Q{n} — [title]:**` with sub-bullets `A) [option] — [trade-off]`, `B) …`, `C) … (optional)`, `Recommended: A) [option] — [why]`, `Default if unanswered: [the plan assumes A | the plan stops at Gate 1 until you answer]`; the `👤 ✅ Human Confirmation` checkbox is untouched
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-models.md`: the `Proposal` question rule (`:119`) asks for one lettered option per line (`A) {option} — {what happens}`), then `Recommended: A) … — {reason}` and `Default if unanswered:`, plus what would settle it
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the `bkit-design-generate` (`:309`), `bkit-design-review-2` (`:311`), `bkit-design-update` (`:313`), `bkit-plan-generate` (`:321`), `bkit-plan-scope-check` (`:324`) and `bkit-plan-update` (`:325`) rows describe one lettered option per line instead of "the lettered `Options: A) …`"
  - **READ:** `.bkit/core/.bkit/prompts.md`: the § Audit `bkit-audit-models` row (`:401`) stays as it is, because the template's title and purpose do not change
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions entries for every edited prompt and template line, including the `Audit templates` entry for the `bkit-audit-models.md` `Proposal` line (`:14016`)
  - **UPDATE:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts`: `the plan template letters every option of its Open Questions placeholder` reads the per-line placeholder; the five tests below
  - **DEPENDS ON:** 3, 4, 5, 6, 7, 8, 9
  - **DONE WHEN:** the five tests below and every test in `question-option-format.test.ts` pass; `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/prompts.md`, the five `bkit-design-review-2` mirrors and `docs/templates/bkit-plan.md`, so the mirror checks in that file pass; the `plan-open-questions` old text is not a prefix of its new text, and a second `pnpm instructions:sync` changes nothing; `pnpm vitest run .bkit/core/engine/tools/` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the plan template puts each open-question option on its own line` fails on the inline "· B)" placeholder, where the per-line placeholder's default line must offer both `the plan assumes A` and `the plan stops at Gate 1 until you answer`
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every open-question rule in the prompts asks for one option per line` fails on the rules naming the inline "`Options: A) {option} — {trade-off} · B) …`"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the design review flags an open question whose options share one line` fails on `bkit-design-review-2.md` naming no one-per-line check
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the prompts index describes one option per line` fails on the six rows naming "the lettered `Options: A) …`"
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `no workflow, prompt, template or authoring doc carries an inline Options: list` fails on any inline lettered "Options: A)" list left in the scanned directories, including `bkit-audit-models.md:119`; it matches only lettered lists, so `X-Content-Type-Options: nosniff` (`bkit-audit-security.md:124`, `:159`) does not trip it

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
- [ ] **Test Synchronization:** no E2E tests exist for these surfaces; the existing tests that change alongside are the four old-layout `compose` tests and the 26-option cap test in `.bkit/core/engine/commands/workflow/decisions.test.ts` (Task 2), the canonical, count and plan-template tests in `.bkit/core/engine/audits/workflows/question-option-format.test.ts` (Tasks 3 and 10), the `waits` filter in `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` (Task 6), and the five none-render baselines in `.bkit/core/engine/render/__snapshots__/` (Tasks 4-9).
- [ ] **Build Configuration:** test files stay out of `dist/` through the `**/*.test.ts` entry in `tsconfig.json` `exclude`; no new test-only file is added.
- [ ] **Unit (boundary: real temp git repo) (`.bkit/core/engine/commands/workflow/decisions.test.ts`):** the 17 Task 1 and Task 2 tests write and read decision files in a temp repo through `runCommand`; each test builds its own repo and leaves nothing behind.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/summary.test.ts`, `.bkit/core/engine/commands/workflow/challenge.test.ts`):** the two Task 1 tests read a per-line decision file through `buildSummary` and `acceptedLocations`.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/question-option-format.test.ts`):** the 41 Task 3-10 tests read the shipped sources and mirrors; the RED-PROOF tests use synthetic strings only.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts`):** the Task 6 test checks every pre-status wait against its file's `workflows start` block.
- [ ] **Apply local migrations:** n/a — the change touches no database.
- [ ] **Run all tests:** `pnpm test` passes, and `pnpm test:integration` passes with no edit, which shows the `summary`, `challenge` and install paths still read the decision files and the installed copies.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** Run `pnpm build`, pack the tarball with `pnpm pack`, and install it with `bkit install` in a clean scratch directory; open the installed `bkit-build`, `bkit-debug`, `bkit-ship`, `bkit-design` and `bkit-plan` workflows and check that each question point shows one option per line, a `Recommended:` line with a reason or `none — {why}`, and a `Default if unanswered:` line.
- [ ] **Step 2:** In that directory, write a `decision-items.json` with three items, one of them a hard blocker and one giving `"Accept"` as a bare string, and run `bkit decisions compose`; check that the file shows one `{L}) {name} — {effect}` line per option, the default effect on the bare `Accept`, `Recommended: none — {why}` on the blocker, the shared reply line and the "one by one" line.
- [ ] **Step 3:** Run `bkit decisions apply --by=headless` on that file; check that the two recommended items are answered and the hard blocker is left for the owner.
- [ ] **Step 4:** Run `bkit decisions pending` against a decision file written in the old `Options: A) … / B) …` layout; check that it lists the same items and options as before the change.
- [ ] **Step 5:** Run `/bkit-design` on a small idea in the scratch directory; check that the grill turn arrives as one plain-text message in the shared shape, that a reply of "one by one" asks the questions one at a time, and that no host question tool opens.
