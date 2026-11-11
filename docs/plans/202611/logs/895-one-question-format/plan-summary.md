Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- 2 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/895-one-question-format/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/895-one-question-format/plan-v1-draft.md`, `docs/plans/202611/logs/895-one-question-format/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/895-one-question-format/related-deferrals.md`, `docs/plans/202611/logs/895-one-question-format/related-failures.md`, `docs/plans/202611/logs/895-one-question-format/related-issues.md` |
| plan-review | CONCERNS | 16 | 1 | `docs/plans/202611/logs/895-one-question-format/plan-review-1.md`, `docs/plans/202611/logs/895-one-question-format/plan-review-2.md`, `docs/plans/202611/logs/895-one-question-format/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/895-one-question-format/plan-v2-reviewed.md`, `docs/plans/202611/logs/895-one-question-format/plan-update-check.md` |

## Resolved Findings

- plan-review CONCERNS, resolved by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/895-one-question-format/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/895-one-question-format/plan-v1-draft.md`, `docs/plans/202611/logs/895-one-question-format/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/895-one-question-format/related-deferrals.md`, `docs/plans/202611/logs/895-one-question-format/related-failures.md`, `docs/plans/202611/logs/895-one-question-format/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/895-one-question-format/plan-review-1.md`, `docs/plans/202611/logs/895-one-question-format/plan-review-2.md`, `docs/plans/202611/logs/895-one-question-format/plan-scope-check.md` |
| plan-apply-review | PASS | 1 | `docs/plans/202611/logs/895-one-question-format/plan-v2-reviewed.md`, `docs/plans/202611/logs/895-one-question-format/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

> The owner's answer to Open Question Q4 fills this field.

### Success Criteria

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

> The owner's answer to Open Question Q4 fills this field.

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
| `/bkit-debug` Step 1 cannot pick a branch (`branches parse` exit 3 or 8) | A formatted question names each candidate branch as an option; no status rows are written, because Step 1 has no status file yet |
| `/bkit-debug` Step 2 cannot pick a CI run (`runs locate` exit 8 or 82) | A formatted question names each candidate reference as an option, with the existing `owner-pause reason=decision` row; the workflow lock stays held while the owner answers and is released only on `Stop` |
| `runs locate` exits 82 with no candidate reference (unavailable evidence, or evidence from another branch) | The question carries the engine's message word for word (including `Supply branch={x} in its checkout`) and offers only `Use local discovery` and `Stop` |
| A foreign path stops `/bkit-debug` (exit 10) | One `**Action needed — {title}:** {what to do}. Then say "continue".` line; on "continue" the block re-runs |
| A Step 1 prompt names more than one issue (`fids parse` exit 8), in any of the five workflows | A formatted question names each issue as an option; no status rows are written (Q5, option A) |
| A Step 1 branch is not a lowercase slug (`fids parse` exit 3), or the prompt holds only a bare number (exit 9) | One `**Action needed — {title}:**` line saying what to rename or type; on "continue" the block re-runs (Q5, option A) |
| An option's own text contains ` / ` or ` · ` | It stays one option, because each option is on its own line |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Assumption A2:** Chat hosts (Claude Code, OpenCode, Codex, Cursor, Antigravity) show each line of a question on its own line → if wrong, the options of a chat question run together into one paragraph, and § Human questions must switch the option lines to list bullets. Files (decision files, plans, designs) are unaffected: the plan template and design template use list bullets (Task 10), and decision files are read by code.
- **Assumption A3:** Every bare-string option an orchestrator holding the old `bkit-build.md` writes is a fixed name (`Accept`, `Fix now`, `Stop`, `Try again`, `Decide`), which `compose` accepts with its default effect. This covers a build stopped between writing `decision-items.json` and calling `decisions compose` across a bkit upgrade, and a `/bkit-build` still running in a sibling worktree of bkit's own repo: `{BKIT}` resolves to the main checkout's `node_modules/.bin/bkit`, so once this change merges to `dev` and the main checkout's `dist/` is rebuilt, that run's old `bkit-build.md` meets the new `compose` → if wrong (a bare string outside the fixed set), `compose` exits 2 and the Decision Pause goes to the Failure Path; rewriting the items with effects and re-running the block recovers, and rebasing in-flight branches before their next Decision Pause avoids it.
- **Assumption A4:** Ship, summary and challenge only re-read decision files that runs in progress wrote; nothing re-composes an old file → if wrong, a file could hold items in both layouts. `parseDecisionItems` reads the layout per item (Task 1), so a mixed file still parses.
- **Assumption A5:** `/bkit-debug` Step 1 has no `{STATUS}` yet when `branches parse` exits 3 or 8, so the branch question writes no `owner-pause` or `owner-answer` row → if wrong (a status file exists), the question records both rows as every other point does.
- **Assumption A6:** #891 (`docs/plans/202611/891-build-gate-stuck-plan.md`) also changes `decisions compose` (`--base-check`, the verify loop's progress line) and `apply` (`--by=rerun`). Whichever change merges second resolves the overlap in `decisions.ts` and `bkit-build.md`, and every loop option #891 adds gets an effect → if wrong, a loop option without an effect makes `compose` exit 2.
- **Assumption A7:** `runs locate --prompt-file` reads a one-line answer file the same way it reads the session prompt: `[local]` selects local discovery (`runs.ts:2523`, "[local] overrides all CI references"; the route is exit 1), and a single run or PR URL selects that reference (exit 0); `branches parse --prompt-file` accepts a `branch={x}` line (`branches.ts:3178`, `:3200`) → if wrong, the re-run after the owner's pick exits 8 again, and the #7 / #8 question repeats with no way through except `Stop`.
- **Open Question Q1 — Default-line wording beyond the four fixed phrases:** #895 lists four phrases (`the run waits for you`, `taken as A when nobody can be asked`, `the plan assumes A`, `written as a needs-decision deferral`). Build points behave differently with and without someone to ask, and the design grill assumes unanswered items into the design, not a plan. → The owner resolves it at plan review.
  - **Options:** A) Allow two fixed phrases joined with `; ` where a point behaves differently with and without someone to ask (`the run waits for you; taken as A when nobody can be asked`, as the #895 comment's worked example does), and add `the design assumes A` for the grill — every default stays from a closed set and says what really happens · B) Exactly the four phrases; build shows only `the run waits for you`, and the grill uses `the plan assumes A` — the shortest set, but a headless reader of a decision file cannot see what was taken, and the grill line names the wrong document · C) Free text per point — fits every case, but the audit test can no longer check the line against a closed set
  - **Recommended:** A) Two joined phrases plus `the design assumes A` — it matches the worked example in the issue comment and keeps the default checkable.
  - **Default if unanswered:** the plan assumes A.
- **Open Question Q2 — The reply line where "stop" does not write a handover:** At the design grill, "stop" ends the interview and the design goes on with what is settled. At ship's Confirm Assumed Items (#10) there is no stop route and no recommendation, so "yes" answers nothing. At a Step 1 question (the debug branch check #7, and the Step 1 issue question of Task 9) nothing has started, so there is no handover to write. → The owner resolves it at plan review.
  - **Options:** A) Keep the lead sentence `Reply with a letter per question, or "yes" to take every recommendation.` wherever a point has a recommendation, and make the second sentence say what "stop" does there: the grill writes `"stop" ends the interview; the design goes on with what is settled.`, #10 writes `Reply with a letter per question. Ship merges either way; anything you do not confirm is written as a needs-decision deferral.`, and a Step 1 question writes `"stop" ends here; nothing has changed yet, so the run can be started again.` with the option `Stop — nothing changes; the run can be started again` (the issue's own #7 example reads `B) Stop — handover; the run can be resumed`) — every footer is true, and no stop route changes · B) The identical footer everywhere, and add a handover route at the grill, at #10 and at Step 1 — one footer, but it changes what the workflows do once answered, which #895 rules out · C) The identical footer everywhere with no route changes — one footer, but at the grill, #10 and Step 1 it promises a handover that never happens
  - **Recommended:** A) Same lead sentence, point-true second sentence — it keeps the shared wording where it is true and changes no routing.
  - **Default if unanswered:** the plan assumes A.
- **Open Question Q3 — How a debug branch or CI-run answer reaches the re-run (#7, #8):** `branches parse` and `runs locate` read the session prompt (`{SESSION_DIR}/prompt.md`), which still names every candidate after the owner answers. → The owner resolves it at plan review.
  - **Options:** A) Write the owner's pick to `{SESSION_DIR}/owner-answer.md` (`branch={x}` for #7; the chosen run or PR URL, or `[local]`, for #8) and re-run the same command with `--prompt-file="{SESSION_DIR}/owner-answer.md"` — the existing verbs validate the answer, and no engine change is needed · B) Append the pick to `{SESSION_DIR}/prompt.md` and re-run — no new file, but an ambiguous prompt still holds every candidate, so exit 8 repeats · C) Keep today's resume: the owner re-invokes `/bkit-debug` with a narrower prompt, and the question only tells them what to type — no in-session answer, which contradicts the decision that the answer can be given in chat
  - **Recommended:** A) A one-line answer file read by the same verb — the answer is validated exactly like a prompt token.
  - **Default if unanswered:** the plan assumes A.
- **Open Question Q4 — The Acceptance Scenario's Narrative and Success Criteria:** No design doc exists for #895, and the issue is idea-shaped, so it has no change-shape `Narrative` or `Success Criteria` fields; both fields read `⚠️ MISSING` until you supply or adopt them. The issue's own text offers a candidate. Its `Outcome`: "Every question point in every workflow uses one shared question shape. The owner can answer any of them from the page alone: what is being decided, what each option does and costs, what is recommended and why, and what happens if they don't answer." Its `Success criteria`: "The shared question shape (below) is defined once in `.bkit/authoring.md` § Human questions plus a shared clause in `.bkit/instructions.md`, and every row in the audit table uses it." · "Each option is on its own line with what happens if it is picked, including the fixed-option pauses (#5, #6, #10, #11)." · "Each question has a `Default if unanswered:` line saying what actually happens." · "Each recommendation carries a reason." · "`bkit decisions apply` and `decisions pending` read decision files in both the new layout and the old single `Options:` line layout." → The owner resolves it before Gate 1.
  - **Options:** A) Adopt the issue's `Outcome` as the `Narrative` and its `Success criteria` as the `Success Criteria`, word for word — the plan proceeds as drafted, and its runbook already covers every point the Narrative names, including the Step 1 stops (Task 9) · B) Write your own `Narrative` and `Success Criteria` — the contract fits what you want exactly, but the matrix and the runbook are re-checked against it before Gate 1 · C) Adopt the candidate, but narrow the `Narrative` to the 11 points of the #895 audit table — the Step 1 stops (Task 9) then go back to `Out of Scope` as an `Exempt` row with its deferral
  - **Recommended:** A) Adopt the issue's text — it is the owner's own wording of the outcome, and every task traces to it.
  - **Default if unanswered:** the plan does not proceed past Gate 1; both fields stay `⚠️ MISSING`.
- **Open Question Q5 — The form of Step 1's issue-and-branch stops (Task 9):** Each of `bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md` has three Step 1 stops that tell the owner what to type in prose: `fids parse` exit 8 (the prompt names more than one issue), exit 9 (a bare number) and exit 3 (rename `BRANCH` to `feat/{lowercase-slug}` or name an issue). They come from three shared clauses (`workflow-issue-id-parse-ambiguous`, `workflow-fid-bare-number`, `workflow-issue-id-parse-slug`). → The owner resolves it at plan review.
  - **Options:** A) Make the exit 8 stop a formatted question whose options are the named issues, and the exit 3 and 9 stops `**Action needed**` lines — matches how #895 treats the debug branch and foreign-path stops · B) Make all three `**Action needed**` lines — one mechanism, but the exit 8 choice loses its options · C) Leave them as they are — no change, and the owner keeps guessing the resume command; Task 9 is dropped and the item goes back to `Out of Scope` with its deferral
  - **Recommended:** A) A question for the choice, `Action needed` lines for the actions — the same split the owner already chose for `/bkit-debug`.
  - **Default if unanswered:** the plan assumes A.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #895
```

Or, to address the reasons first: `/bkit-plan #895`
