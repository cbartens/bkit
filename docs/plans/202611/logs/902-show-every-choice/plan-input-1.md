## Session Prompt — this run's, newer than everything below

/bkit-plan #902

## Issue description — oldest

### Problem

When an ask point is set to `"ask": false` in `package.json` `bkit.workflows.<workflow>.<point>`, or the run is headless (on GitHub Actions, where nobody can answer), the workflow takes the recommended answer and carries on. Some of those choices reach the owner at the end of the run. Most do not.

Every workflow ends the same way: `bkit workflows summary` writes `{workflow}-summary.md`, and `workflows close --final-return` prints that file word for word as the last message (`.bkit/core/engine/commands/workflow/workflows.ts:1856`). The summary is also posted to the issue as a comment. So if a choice isn't in the summary, the owner never sees it unless they read the run's log files.

What each workflow does with a choice it takes without asking today:

<!-- prettier-ignore -->
| Where | What gets chosen without asking | Where it is written down | In the end summary? |
| --- | --- | --- | --- |
| `/bkit-design` Step 3 Grill (`design.grill`) | Every interview answer: the recommendation is taken as the answer | `design-grill-{RUN}.md` under `### Assumed, not confirmed`, plus the line `No human interviewed this run`; copied into `design-input-{RUN}.md`; posted as the grill step's comment | **No.** `summary.ts` does not read the grill file. Ship does not ask about these either (`.bkit/workflows.md` § `/bkit-design`, Grill row) |
| `/bkit-build` Decision Pause, `Accept` items (`build.verify`, `build.challenge`, Step 15 `UNPROVEN`) | Accept a gap, finding or unproven test | `build-decision-{RUN}-{K}.md`: `Decision: Accept (assumed) — … (ask:false\|headless, …)` (`decisions.ts:263`) | **Yes**: verdict held at CONCERNS, one `- Assumed, not confirmed:` line each under `## Risks and Action Items` (`summary.ts:307-319`, `:519`). Ship asks the owner to confirm each one |
| `/bkit-build` Decision Pause, `Fix now` items | Send a finding or gap back to be fixed | Same decision file: `Decision: Fix now — recommended; applied without asking ({runtime})` (`decisions.ts:264`) | **No.** The summary only counts lines starting `Accept` (`summary.ts:304`) |
| `/bkit-build` Decision Pause, loop question (`VERIFY_GAPS` / `TESTS_LOOP` with `Try again`) | Run another fix round | Same decision file | **No.** Only shows indirectly as an extra round under `## Steps` |
| `/bkit-debug` Loop Question (`debug.fix`, `debug.soak`) | Run another fix or soak attempt when progress is stuck or getting worse | Nowhere. The orchestrator only says it in chat: `debug {point}: attempt {n} of {max}, taken without asking` (`bkit-debug.md` Loop Question, sub-step 1) | **No.** Headless, nobody reads the chat |
| `/bkit-ship` Step 11 fix round (`ship.merge`) | Run a fix round when the diagnosis is not `PASS` | Nowhere. Chat only: `ship merge: attempt {n} of {max}, fix round taken without asking ({cause})` (`bkit-ship.md:861`) | **No** |
| `/bkit-ship` Confirm Assumed Items (headless only) | Leave build's assumed accepts unconfirmed and merge | One `needs-decision` row each in `docs/deferrals.jsonl` | **Yes**: `## Ship Completed with Assumed Items` (`summary.ts:493-501`) |
| `/bkit-plan` | Nothing. Plan has no ask point; its open questions are listed in the plan summary and asked only if the owner opts in | — | — |

Reaching a used-up limit with `ask` false goes to the Failure Path, which writes a handover. That is already shown, so it is not part of this gap.

So the same kind of event (a recommendation taken because nobody was asked) has four different outcomes: listed in the summary, written to a file nobody reads at the end, said once in chat, or not written at all. The owner cannot answer "what did bkit decide for me in this run?" from the final message.

### Outcome

Every choice a workflow takes on the owner's behalf, because `ask` is false or the run is headless, is written down once in the same place and listed in one section of that workflow's end summary. The owner can read the final message, or the summary comment on the issue, and see every such choice: what was decided, why it was recommended, and whether it still needs their confirmation.

### Proposed approach

1. **One record per choice.** Add one status row type, `auto-decision`, to the event types in `.bkit/workflows.md` § `status.jsonl` — workflow state SoT: `{type, workflow, at, point, question, chose, reason, why: "ask:false"|"headless", runtime, artifact?, needsConfirm}`. One engine command writes it (for example `bkit decisions auto`, or have `decisions apply --by=headless` write it), so the orchestrator records the choice instead of only narrating it. The chat line can stay as well.
2. **Write it at every point in the table above:**
   - build Decision Pause: `decisions apply --by=headless` writes one row per item it settles (`Accept`, `Fix now`, `Try again`), pointing at the decision file
   - debug Loop Question sub-step 1: one row when `LOOP_ASK` is false and the question would otherwise have been asked
   - ship Step 11: one row when `MERGE_ASK` is false and the diagnosis is not `PASS`
   - design Grill: one row per answer filed under `Assumed, not confirmed`, or the summary reads that heading from `design-grill-{RUN}.md`
3. **One summary section.** `workflows summary` renders `## Decisions Taken Without You` right after `## Verdict` for all five workflows, one line per row: the ask point, what was chosen, the reason, `ask:false` or `headless`, and the file to open. Items that need confirmation (`Accept (assumed)`, grill assumptions) say so. Build's `- Assumed, not confirmed:` lines in `## Risks and Action Items` move into this section, so nothing is listed twice.
4. **Roll-up at ship.** Ship is the last step for a feature, so the ship summary also lists the auto-decisions from the feature's earlier design, build and debug runs. In a fully automatic chain (`bkit:auto` or `bkit-cloud.yml`), the owner then sees them all once, at the end.
5. **Docs in the same change.** Add a "Recorded and shown" bullet to `.bkit/workflows.md` § Ask points, update each workflow's checklist, and add `summary.test.ts` cases per workflow.

### Success criteria

- With every ask point set to `"ask": false`, a run of each of design, build, debug and ship that hits an ask point ends with a `## Decisions Taken Without You` section listing every choice taken at that point.
- No ask point routes past a question without writing a record; a test fails if a new ask point skips it.
- A headless run's issue comment shows the same section as the session's final message.
- The ship summary lists the auto-decisions from all of the feature's earlier runs.
- Runs started before the change (status files with no `auto-decision` rows) still produce a summary.

### Constraints and non-goals

- How each point routes stays the same: `ask: false` and headless keep taking the recommendation. Only what is recorded and shown changes.
- No new `package.json` setting.
- Works on every host (Claude, OpenCode, Codex, Cursor, Antigravity): the record is written by the engine, not by any host-specific mechanism.
- Choices that never ask even when `ask` is true (another debug attempt while progress is improving, a ship fix round after a `PASS` diagnosis) are routine. They already show as extra rounds under `## Steps` and are out of scope unless the open question below decides otherwise.
- Not in scope: how questions are worded when they are asked. That is #895 — One question format for every owner question in the workflows (https://github.com/cbartens/bkit/issues/895).

### Decisions already made

- `docs/decisions.jsonl` key `671-ask-points-hard-limits-assumed-accepts`: headless or `ask: false` takes the recommendation and records any Accept as assumed, and ship asks the owner to confirm it. This issue keeps that and extends the recording to every other kind of choice.
- `docs/decisions.jsonl` key `design-grill-step`: unanswered grill questions are recorded `Assumed, not confirmed` "so designers can tell a human decision from an agent guess". No recorded decision says why grill assumptions are left out of the design summary, or why ship does not ask about them.

### Open questions

1. **Should an auto-retry or auto-`Fix now` change the verdict?** Recommended: no. Only items that need confirmation (assumed accepts, grill assumptions) hold the verdict at CONCERNS; retries and `Fix now` are listed but leave the verdict alone. Otherwise every `ask: false` run reads CONCERNS.
2. **Should ship ask the owner to confirm grill assumptions, like build's assumed accepts?** Recommended: list them at ship but don't ask, because the plan's `Acceptance Scenario confirmed` box already puts the design in front of the owner.
3. **Should the routine continues in Constraints (which never ask) be listed too?** Recommended: no, to keep the section to real decisions.
4. **Status row or decision file as the single record?** Recommended: a status row, because every workflow already has a status file and `workflows summary` already reads it; the build decision file stays the detailed record and the row points at it.
5. **Order with #895?** Both change `.bkit/core/engine/commands/workflow/decisions.ts`. #895's `Default if unanswered: taken as A when nobody can be asked` line describes exactly the choice this issue records, so the two should use the same words.

### References

- #895 — One question format for every owner question in the workflows
- #860 — Move deterministic bookkeeping and safe recovery into the engine
- `.bkit/workflows.md` § Ask points
- `.bkit/core/engine/commands/workflow/summary.ts` (`acceptItems`, `## Risks and Action Items`, `## Ship Completed with Assumed Items`)
- `.bkit/core/engine/commands/workflow/decisions.ts` (`applyRecommendations`)
- `.bkit/core/workflows/bkit-design.md` Step 3 Grill
- `.bkit/core/workflows/bkit-build.md` Decision Pause
- `.bkit/core/workflows/bkit-debug.md` Loop Question
- `.bkit/core/workflows/bkit-ship.md` Step 11, Confirm Assumed Items

###### bkit:blocked-by start
- #895
###### bkit:blocked-by end

## Issue comment — posted 2026-11-10T01:15:08.000Z

### Overlap with #895

#895 — One question format for every owner question in the workflows (https://github.com/cbartens/bkit/issues/895) covers the other half of the same moment. It is about how a question looks when bkit asks the owner. This issue is about what bkit records and shows when it doesn't ask. Its plan exists: `docs/plans/202611/895-one-question-format-plan.md`. That plan changes only the question layout, not when workflows pause or what an answer does (plan lines 117 and 311), so the two don't conflict in behaviour.

Where they touch:

1. **The same code.** #895 changes build's decision file layout to one line per option and rewrites `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts`. This issue needs `summary.ts` to read more items from those same files, through that same function. Building this first would build on a layout #895 replaces.
2. **The same promise.** #895 adds a `Default if unanswered:` line to every question (for example "the run waits for you; taken as A when nobody can be asked", plan line 102). This issue's `## Decisions Taken Without You` section is the record that it happened. Use #895's wording for each `auto-decision` row's `why` and `chose`, so the question and the summary line match. This settles open question 5.
3. **Ship's assumed items.** #895 makes each Confirm Assumed Items question `Recommended: none — {why}` (plan line 185). The summary section here should describe those items the same way.

Not covered by #895, so this issue still owns it:
- recording debug and ship retries that today are only said in chat
- showing the interview answers nobody gave in the design summary
- the new summary section
- the roll-up at ship

Proposed order: build this after #895 lands. #895 is listed under References but not yet as a blocker.

## Issue comment — posted 2026-11-10T06:57:50.000Z

### Owner decisions on the open questions (design no longer needed)

All five open questions are settled, each as recommended:

1. **Verdict:** automatic retries and automatic `Fix now` choices are listed but leave the verdict alone. Only items that need confirmation (assumed accepts, assumed grill answers) hold it at CONCERNS.
2. **Grill assumptions at ship:** listed in the ship summary, not asked. The plan's `Acceptance Scenario confirmed` box already puts the design in front of the owner.
3. **Routine continues** (the ones that never ask, even with `ask` on): not listed.
4. **Single record:** one `auto-decision` row in `status.jsonl`. The build decision file stays the detailed record, and the row points at it.
5. **Wording and order with #895:** each row's `why` and `chose` use #895's `Default if unanswered:` wording, so the question and the summary line match. **#895 is now a blocker** (blocked-by block added to the description). This issue can be planned now; build waits until #895 lands, because #895 rewrites the decision-file layout and `parseDecisionItems`, which this issue's summary reads.

**Scope change from #911:** #911 removes ship Steps 11 and 12, so the table's `/bkit-ship` Step 11 row and approach item 2's "ship Step 11" bullet no longer apply. The plan follows whichever state of `bkit-ship.md` is on `dev` when it runs. If #911 has not landed by then, the plan says how the two changes are ordered.

Next step: `/bkit-plan 902`.
