# Brief: group 1 — Decision files in the shared shape (tests)

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

- Group 1: Decision files in the shared shape — this group
  - TASK 1: Read one option per line and `Recommended: none` in `parseDecisionItems`, keeping the old `Options:` line — open
  - TASK 2: Write the shared shape with `decisions compose`, from options that each carry an `effect` — open
- Group 2: One definition of the question shape and its reply-line clauses — next
  - TASK 3: Define the shared question shape once in `.bkit/authoring.md` § Human questions, and point § Question layout at it — open
  - TASK 4: Put the reply line's wording and the widened plain-English rule into their clauses before any carrier edit — open
- Group 3: Every workflow question point in the shape — later
  - TASK 5: Put the build's Decision Pause (#5) in the shared shape — open
  - TASK 6: Put debug's Loop Question (#6), branch check (#7) and CI-run lookup (#8) in the shared shape, and give the foreign-path stop (#9) the `Action needed` line — open
  - TASK 7: Put ship's Confirm Assumed Items (#10) and Merge Question (#11) in the shared shape — open
  - TASK 8: Put the design grill (#1), draft scenario (#2) and the design and plan one-by-one pass (#3, #4) in the shared shape, and add `bkit-design` to the reply-line clause — open
- Group 4: Step 1 stops, open questions one option per line, and the installed copies — later
  - TASK 9: Put the five workflows' Step 1 issue-and-branch stops in the shared shape (Q5, option A) — open
  - TASK 10: Write plan and design open questions one option per line, in plain English — open
  - TASK 11: Re-render the installed copies, the build output and the graph register — open

## The work

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
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: `compose --loop` gives `Try again`, `Decide` and `Stop` their fixed effects (Architecture), `Stop` reading `Stop — the run ends here with a handover; the next run resumes here`, the same effect `composeItems` gives a bare `Stop`; the last lines are the shared reply line, plus `Or say "one by one" and I'll ask them one at a time.` when the file holds 3 or more questions, the loop question included; the `--items` help names the `{name, effect}` shape
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
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `--loop writes an effect for each loop option` fails on the loop question's `Try again` option having no "Try again — one more fix round runs" line, where `Stop` needs `Stop — the run ends here with a handover; the next run resumes here`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `round-trips an item with effects through parseDecisionItems` fails on `compose` refusing the `{name, effect}` options with exit 2

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

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
| `compose --loop` writes an effect for each loop option, `Stop` reading `Stop — the run ends here with a handover; the next run resumes here` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| An effect-carrying item round-trips through `compose` and `parseDecisionItems` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
