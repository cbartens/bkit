# Brief: group 1 — The decision engine letters its options

Plan: 703 — Standardise Question Option Labels Implementation Plan

## Why and what

### Context & Goals

bkit asks the owner questions in five workflows and labels the answer options three different ways — `Options: A — … · B — …` (the plan template), `Options: Accept / Fix now` (the build Decision Pause, rendered by `bkit decisions compose`), `Options: Try again / Stop` (debug's Loop Question), `Options: Confirm / Reject` (ship's Confirm Assumed Items), and `Options: A / B` (the canonical description in `.bkit/workflows.md`) — so the same Q&A reads differently from run to run. This plan makes every owner-facing question render `**Q{n} — {title}:**` with lettered answer options `A)`, `B)`, `C)` — including options that already carry a name (`Options: A) Accept / B) Fix now`) — and makes the plan / design open questions keep their trade-off as `A) {option} — {trade-off} · B) …`, while `bkit decisions apply` keeps resolving its recommendation by the bare option name (the parser strips the letter), so headless / `ask:false` routing is unchanged.

**Related Issues:**

- `#703 — Standardise the question option labels (open)`

**Scope mapping — where the issue's touched surfaces actually carry the shape:**

- The engine is the only site that composes a whole option list mechanically (`bkit decisions compose`), so the Decision Pause's letters come from `decisions.ts`, not from `bkit-build.md`.
- The plan / design open questions are prose the agents author: the shape lives in the plan template, in the shared `plan-open-questions` clause and in the design / plan prompts that state the rule.
- The audit surfaces (`bkit-audit-generate.md`, `.bkit/core/docs/templates/bkit-audit-*.md`) carry no `Options:` line today; the only audit decision-question shape is the `Proposal` question (`.bkit/core/docs/templates/bkit-audit-models.md` step 9), which this plan pins. The new audit in `GROUP 2` scans **every** prompt and **every** template, so the audit surfaces are held to the one layout without an invented edit.
- `.bkit/core/prompts/bkit-plan-review-2.md` carries no open-question or option rule; it needs no edit and is covered by the same scan.
- Shipped docs and prompts must not name this issue: `audits/repo/shipped-docs-refs.test.ts` rejects a tracker number, ledger key or finding id at the package source, so every prose edit records behaviour only.

---

## Where it fits

- Group 1: The decision engine letters its options — this group
  - TASK 1: Letter the Decision Pause's options and recommendation in the renderer, and strip the letter back off in the parser — open
- Group 2: The corpus states one option layout, and an audit holds it — next
  - TASK 2: Pin the option layout in the canonical description and add the audit that holds the whole corpus to it — open
  - TASK 3: Letter every option line the five phase workflows state, and refresh the `none` render baselines — open
  - TASK 4: Letter the open-question and audit decision-question option shape in the prompts and templates — open
- Group 3: The regenerated artifacts and the final gate run — later
  - TASK 5: Regenerate the installed mirrors and the instruction store from the changed sources — open
  - TASK 6: Rebuild `dist/` from the changed engine source — open
  - TASK 7: Run the four verification commands on the final tree and fix any fallout — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Letter the Decision Pause's options and recommendation in the renderer, and strip the letter back off in the parser
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: `itemLines` renders `Options: A) {A} / B) {B}` and `Recommended: A) {A} — {reason}`, lettering each option and the recommended one by its index in `options`; `No recommendation — {why}` stays as it is
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: `parseDecisionItems` strips a leading `{A-Z}) ` from each `Options:` entry and from the `Recommended:` value, so `options` and `recommended` stay bare names (`Accept`, `Fix now`, `Try again`, `Decide`, `Stop`); a file written before the letters parses unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: `deferralRow`'s `description` letters the options it quotes, and the file-header layout comment names the lettered forms
  - **READ:** `.bkit/core/engine/commands/workflow/decisions.ts`: the `DecisionItem` fields `options` and `recommended` every caller compares
  - **READ:** `.bkit/core/engine/commands/workflow/decisions.ts`: `applyRecommendations` — its `Accept (assumed)` branch and its `options.includes("Try again")` loop detection need bare names
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the compose and loop assertions that expect the letterless form, plus the new cases
  - **DONE WHEN:** `bkit decisions compose` writes `Options: A) … / B) …` and `Recommended: A) … — …`; `parseDecisionItems` returns bare names for `Options: A) Accept / B) Fix now` and for a legacy `Options: Accept / Fix now`; `apply --by=headless` still writes `Accept (assumed)` / `Fix now` and still reports the `Try again` loop; `challenge.test.ts`'s letterless fixture keeps parsing; `pnpm vitest run .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/challenge.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose letters every option and the recommended one` fails while the option and recommendation lines render with no letter
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `parseDecisionItems keeps the bare option name, dropping the letter` fails while `A) Accept` stays the option value, so the loop detection and the `Accept` routing see no bare name
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `a decision file written before the letters still parses` fails while a legacy `Options: Accept / Fix now` file yields no options
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `--loop letters the loop question's options and recommendation` fails while the loop question renders `Options: Try again / Decide` letterless
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `--defer letters the options in the deferral row` fails while the row's description lists `Accept / Fix now` letterless
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `a lettered recommendation still settles its item by name` fails while an item whose options carry letters is left undecided by `applyRecommendations`

<!-- bkit:task 1 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| The Decision Pause's option list rendered, recommended and parsed lettered | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -rn "Options:" .bkit/core/engine`; references to `itemLines`, `parseDecisionItems`, `deferralRow`; `grep -n "options\|Recommended" .bkit/core/engine/commands/workflow/challenge.ts` | `decisions.ts` — `itemLines` renders the question, its options and its recommendation, `parseDecisionItems` splits the option list and reads the recommendation, `deferralRow` writes the option text into the ship deferral; covers render, parse and the row, missing only the letter | EXTEND | Letter each option by index in `itemLines` and in `deferralRow`, and strip a leading `{A-Z}) ` in `parseDecisionItems` so `options` and `recommended` stay bare names for `applyRecommendations` and `apply --by=owner`. |
