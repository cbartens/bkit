# Brief: group 3 — Decision files — the orchestrator writes, the engine counts (tests)

Plan: Agents and the Orchestrator Write Their Own .md, the Engine Only Checks Implementation Plan

## Why and what

### Context & Goals

**Workstreams:** none. The plan covers the whole of #958; it has no parent design, so no workstream dependencies apply.

**Problem.** Since #860 (commit `7ae1a3e8b`), ten review-type agents and `bkit-audit-generate` hand their findings over as `{OUTBOX}/*-result.json`, and the orchestrator runs `bkit steps stub --result-file` so the engine writes the `.md` report. The prompts also tell each agent to write the same report by hand, so one report is written twice and the two copies can disagree. The agents write the JSON with throwaway inline scripts into `.git/bkit-outbox/`, which Claude Code's auto mode cannot classify, so a run stops for a permission prompt. The orchestrator works the same way for its decision file (`{OUTBOX}/decision-items.json` → `decisions compose`) and its Failure Path text (`{OUTBOX_ROOT}/error.md`).

**Goals**, bound by the owner decisions `958-agents-write-their-md-engine-only-checks`, `958-audit-agent-writes-findings-once-engine-reads-report`, `958-orchestrator-writes-decision-and-error-md-no-error-ledger-row` and `958-agent-writes-engine-counts-verbs-named-for-what-they-do`:

- Every agent and the orchestrator write their own `.md` with the file tool, in the format the prompt or workflow defines.
- The engine checks the file at `bkit steps finish` (format, counts, verdict) and hands a bad file back to its writer with a reason it can act on. It writes none of the writer's words.
- The numbers only the engine can count for a decision pause live in the engine's own file, never in the orchestrator's file.
- Every engine verb whose job changes is renamed for its new job, with no alias for the old name.
- Both word totals (`pnpm bkit:text:ceiling check`) go down, and the ceilings are lowered to the new totals with `pnpm bkit:text:ceiling lower`. The plan never runs `raise`.

**Removes:**

- The JSON result files `{OUTBOX}/*-result.json` and `{OUTBOX}/decision-items.json`, and the audit result JSON.
- Engine code that writes an agent's or the orchestrator's `.md`: `renderResult`, `renderAudit`, `readResult`, `withFingerprint`, `fingerprintOf`, `artifactFingerprint`, `fingerprintProblem`, `FINGERPRINT`, `DERIVED_FIELDS` and `AUDIT_AGENT` in `.bkit/core/engine/commands/workflow/steps.ts`; `structuredFindings` and `renderFindingsLog` in `.bkit/core/engine/commands/workflow/challenge.ts`; `parseAuditResult` in `.bkit/core/engine/commands/workflow/issues.ts`; `composeItems`, `itemLines` and the `compose` verb in `.bkit/core/engine/commands/workflow/decisions.ts`.
- The prompt text that asks for the same report twice: the clauses `structured-result-file`, `structured-result-render`, `structured-supply-only` and `result-path-cleared`, plus `stub-seed-fingerprint`, in `.bkit/instructions.md`; the "Serialize the findings once" bullet in `.bkit/core/prompts/bkit-audit-generate.md`; 12 `Result:` launch lines and 12 render commands in the workflows (build 5, debug 1, design 3, plan 3); the `decision-items.json` step in `.bkit/core/workflows/bkit-build.md`.
- Every renamed verb's old name: `decisions compose` (replaced by `decisions check` and `decisions counts`), `steps stub --result-file` / `--agent` / `--invocation`, `steps verdict --result-file`, and `issues comment --result-file` (replaced by `issues comment --report`).

#974 closes with this plan, through Tasks 1, 2, 3, 4 and 8. Task 3 closes point 1 (the ten prompts stop asking for the JSON copy) and Task 8 deletes the engine render that overwrote the hand-written report. Tasks 1 and 2 close point 2: the count rule makes `Failures` the number of `CRITICAL` items in the three prompts with a `Failures` field, so `PASS` with only `OPTIONAL` items is accepted; the fourth prompt, `bkit-design-review-1`, keeps its rule in the prompt (Q7). Task 4 closes point 3: the three unchecked renders at `bkit-plan.md:383-387` are deleted, so no hidden exit remains. Task 8 also removes the engine rule `Verdict PASS contradicts N finding(s)` that the bug reports.

**#1016 item 1 is covered by this plan.** The `Strategy` judgment field the diagnose prompt tells the agent to supply, which its header never declares, and the "root cause as a finding cannot be PASS" refusal both live in the `structured-result-file` line (`bkit-debug-failure-diagnose.md:122`) and in `renderResult`; Task 3 and Task 8 delete both. Task 3's guard test checks that every judgment field a result prompt names is a header line `promptHeader` reads, and Task 1's guard test checks every declared count rule; together they are the guard #1016 asks for. The prompt's "`FAIL` = `Strategy` is missing" (line 125) is about the `Strategy` input its Context passes (step 5), not a header field, so it stays. Items 2-4 of #1016 stay with #1016.

**The issue's nine success criteria.** The five most measurable ones are the Success Criteria below. The other four are carried as follows: "The JSON result path is gone from the engine and from `.bkit/core/.bkit/cli.md`" → Tasks 6, 8 and 16, with `pnpm cli:sync` in every task that changes the command registry (6, 8, 10, 11, 12, 13); "No prompt or workflow tells an agent to write into `{OUTBOX}` or `.git/` with a shell command" → Tasks 3, 4, 7, 13, 14 and 15 (Task 15 removes the last one, the context-fetch heredoc at `bkit-debug.md:500-503`); "The changed prompts and workflows work in all five host renderings" → Task 16 (`bkit upgrade`, `bkit check`); the auto-mode dogfood run → Manual Verification.

**Related Issues:**

- #860 — Move deterministic bookkeeping and safe recovery into the engine (CLOSED)
- #974 — Review prompts ask for the report twice, with rules the engine refuses (OPEN)
- #910 — Bookkeeping: the engine keeps what the orchestrator remembers (OPEN)
- #1016 — Three prompt and engine mismatches that end a run (OPEN)
- #964 — Review: tech debt findings and consolidation work (OPEN)
- #1012 — Project Goals audit: where bkit falls short, and what to change (OPEN)

---

### Narrative

An agent writes each of its files once, as `.md`, with the file tool. A file with a wrong format, count or verdict goes back to the agent that wrote it with a reason it can act on.

### Success Criteria

- No prompt or workflow line names `{OUTBOX}/*-result.json`, a `Result:` launch line, `steps stub --result-file` or `{OUTBOX}/decision-items.json`.
- A report with a wrong count or a missing verdict is refused at `bkit steps finish` and handed back to its agent, not sent to **Failure Path**.
- The audit agent writes its findings once. The engine reads the report to check the totals and to print the ledger rows.
- The decision file's questions are the orchestrator's own text. The engine's counts for the pause are reported by the engine, not written into that file.
- Both word counts go down (`pnpm bkit:text:ceiling check`).

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Agents editing source files through the shell (`sed -i`, heredocs) instead of the edit tool, about 2,700 calls in 30 days | No Success Criterion, scenario row or test row needs it; issue #958 § Constraints and non-goals declares it out of scope as a prompt-following problem with no missing command. Deferral `958-agents-edit-source-files-through-the-shell`. | A follow-up issue on prompt-following. |
| Values the orchestrator holds in memory during a run | No Success Criterion, scenario row or test row needs it; issue #958 § Constraints and non-goals declares it out of scope. Deferral `958-orchestrator-held-values-move-to-engine`. | #910 — Bookkeeping: the engine keeps what the orchestrator remembers. |

## Where it fits

- Group 1: Reports are checked, not rendered — done
  - TASK 1: Declare each report's count rule in its prompt header, and read it in `promptHeader` — done
  - TASK 2: `steps finish` checks each declared count, verify's `Fixable` and the challenge verdict against the report body — done
  - TASK 3: The ten result prompts stop asking for the JSON copy — done
  - TASK 4: The workflows stop passing a `Result:` path and rendering reports, and the re-ask passes the refusal's reason — done
- Group 2: The audit agent writes its findings once — done
  - TASK 5: Read the audit report's Findings table from a leaf module — done
  - TASK 6: `bkit ledgers findings` prints the audit totals and ledger rows, and `issues comment --report` posts from the report — done
  - TASK 7: The audit templates carry `Title` and `Key`, and the audit prompt reads its totals and rows from the engine — done
  - TASK 8: Remove the engine's JSON result path and the fingerprint — done
- Group 3: Decision files — the orchestrator writes, the engine counts — this group
  - TASK 9: One reader merges a decision file with its `-engine.md` sibling — open
  - TASK 10: `bkit decisions check` checks the orchestrator's decision file — open
  - TASK 11: `bkit decisions counts` writes the engine's pause counts into its own file — open
  - TASK 12: `bkit decisions apply` writes the engine's lines into the engine file — open
  - TASK 13: The build's Decision Pause has the orchestrator write its own questions, and `decisions compose` goes — open
- Group 4: The Failure Path file and the contract docs — next
  - TASK 14: The Failure Path error text is a `.md` in the run's log folder — open
  - TASK 15: The debug workflow writes its context-fetch script with the file tool, into the log folder — open
  - TASK 16: Contract docs, ceilings and rendered copies match the code — open

## The work

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** One reader merges a decision file with its `-engine.md` sibling
  - **UPDATE:** `.bkit/core/engine/commands/workflow/open-decision.ts`: add `decisionItems(read, rel)`, which reads `rel` and `rel`'s `-engine.md` sibling, merges their header blocks with the engine file's line winning for a name (so `Source changed` and `Gate` come from it), merges items by question number with the engine file's `Decision:` line winning, and reads the old single-file layout unchanged; `decisionHeader`, `undecidedBesidesLoop`, `gateRerun`, `skipProblem` and `openDecision` read through it
  - **UPDATE:** `decisionFiles` in `.bkit/core/engine/commands/workflow/workflows.ts`: the listing (lines 1805-1812) skips `-engine.md` files, so `summary.ts` reads each pause once
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: `status resume` (lines 889-891) passes the merged pause to `gateRerun` instead of the orchestrator file's text
  - **UPDATE:** `continueCheck` in `.bkit/core/engine/commands/workflow/steps.ts`: its `skipProblem` call (line 1113) reads the merged pause
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.ts`: each `parseDecisionItems(read(rel))` call reads through `decisionItems`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary-findings.ts`: each `parseDecisionItems(read(rel))` call reads through `decisionItems`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tasks.ts`: each `parseDecisionItems(read(rel))` call reads through `decisionItems`
  - **UPDATE:** `acceptedLocations` in `.bkit/core/engine/commands/workflow/challenge.ts`: reads through `decisionItems` and skips `-engine.md` files
  - **UPDATE:** `decisionFiles` in `.bkit/core/engine/commands/workflow/decisions.ts`: skips `-engine.md` files and reads through `decisionItems`
  - **UPDATE:** `skip` in `.bkit/core/engine/commands/workflow/decisions.ts`: skips `-engine.md` files and reads through `decisionItems`
  - **UPDATE:** `pending` in `.bkit/core/engine/commands/workflow/decisions.ts`: skips `-engine.md` files and reads through `decisionItems`
  - **UPDATE:** `statusOf` in `.bkit/core/engine/commands/workflow/decisions.ts`: computes `Status` from the merged items: `OPEN` while a question has no answer, except that a loop answered `Try again` settles the pause; then `ASSUMED` while an assumed `Accept` remains; else `DECIDED`; a file that still carries a written `Status:` line (the old layout) is read as written
  - **READ:** `docs/testing.md`: § Test first
  - **DEPENDS ON:** 8
  - **DONE WHEN:** the nine tests below pass; every existing test in `open-decision.test.ts`, `decisions.test.ts`, `challenge.test.ts`, `tasks.test.ts`, `status.test.ts`, `steps.test.ts` and `workflows.test.ts` passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > decisionItems reads the loop question and progress from the engine file` fails on `decisionItems` not existing
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > the engine file's Decision line wins for one question` fails on the orchestrator's line being returned
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > decisionItems reads an old single-file layout like parseDecisionItems` fails on `decisionItems` not existing
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > openDecision reads Gate and Source changed from the engine file's header` fails on the header lines being read from the orchestrator's file only
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > a pause whose loop answer is Try again reads DECIDED` fails on `openDecision` returning the pause as "OPEN"
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `gateRerun > re-runs a red-gate pause laid out in two files` fails on `gateRerun` returning false for a `Gate` line in the engine file
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `skipProblem > reads Source changed and the loop answer from the engine file` fails on the refusal naming a missing "Source changed"
    - `.bkit/core/engine/commands/workflow/status.test.ts` `bkit status resume gate re-run > re-runs the gate of a red-gate pause laid out in two files` fails on the pause not re-running its gate
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows summary > counts an assumed item in an engine file once` fails on the engine file being listed as a second pause

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** `bkit decisions check` checks the orchestrator's decision file
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: add the verb `check --file=<decision file>`, which keeps `compose`'s item rules (lettered options, at most 26, no recommendation on a hard blocker, each question has `Recommended:` and `Default if unanswered:` lines) and refuses a duplicate number or a `Q1` when the `-engine.md` sibling holds the loop question, each naming the question, with exit 6; the item rules move into one helper that `compose` and `check` both call until Task 13
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated `decisions` region, through `pnpm cli:sync`
  - **READ:** `docs/security.md`: § Untrusted Content & Prompt Injection
  - **DEPENDS ON:** 9
  - **DONE WHEN:** the three tests below and every existing `bkit decisions compose` test pass; `pnpm cli:sync` is run and `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a question without lettered options, naming it` fails on the `check` verb not existing
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses Q1 when the engine file holds the loop question` fails on the `check` verb not existing
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file` fails on the `check` verb not existing

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** `bkit decisions counts` writes the engine's pause counts into its own file
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: add the verb `counts --out=<decision file> [--source-changed=true|false] [--base-check=<file>] [--loop=tests|verify|holistic --file=<status.jsonl> --attempt= --max= [--group=]]`, which reads the `--out` file (exit 2 when it is missing) to count its questions, then writes the `-engine.md` sibling with the `Source changed` header line, a `Gate: FAIL` header line when `--base-check` is given, and, with `--loop`, the attempt line, `## Progress` from `loopProgress`, the base-check line from `readBaseCheck` and the loop question `Q1` with the engine's recommendation, moved from `compose --loop` (options `[Try again, Decide]` with counted questions, `[Try again, Stop]` with none; a base check of `all` recommends `Decide` or `Stop`); the loop-question rendering moves out of `itemLines` into one helper that `compose --loop` and `counts` both call until Task 13
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the `compose --loop` and `--base-check` cases move to `bkit decisions counts` and assert on the engine file
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated `decisions` region, through `pnpm cli:sync`
  - **READ:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: the rounds and source-changed facts
  - **READ:** `docs/architecture.md`: § File placement, for the engine file's folder
  - **DEPENDS ON:** 9
  - **DONE WHEN:** the six tests below and the moved cases pass; the orchestrator's decision file is byte-identical before and after `decisions counts`; `pnpm cli:sync` is run and `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > writes the attempt line, progress, base check and loop question into the engine file only` fails on the `counts` verb not existing
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > recommends Decide when the last round changed no source` fails on the `counts` verb not existing
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > recommends Try again when the last round made progress` fails on the `counts` verb not existing
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > engine file recommends Stop when the base check is all and no questions are counted` fails on the `counts` verb not existing (updated: the existing `bkit decisions compose > base check all with no items recommends Stop` case, decisions.test.ts:858, moves here under this name and runs `counts`)
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > engine file recommends Decide when the base check is all and questions are counted` fails on the `counts` verb not existing (updated: the existing `bkit decisions compose > base check all with items recommends Decide` case, decisions.test.ts:866, moves here under this name and runs `counts`)
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > writes Source changed and Gate into the engine file for a verify pause with no loop` fails on the `counts` verb not existing

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** `bkit decisions apply` writes the engine's lines into the engine file
  - **UPDATE:** `apply` in `.bkit/core/engine/commands/workflow/decisions.ts`: `--by=headless`, `--by=rerun` and `--by=owner --confirm` or `--reject` write their `Decision:` lines into the `-engine.md` sibling, creating it when absent, and never write `Status`; `applyRecommendations` reads the merged items
  - **UPDATE:** `apply` in `.bkit/core/engine/commands/workflow/decisions.ts`: new flag `--answer=<Try again|Decide|Stop>` with `--by=owner --q=<n> --reason=` writes the owner's loop answer as the `Decision:` line under the engine file's `Q<n>` (Q9)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the existing `apply --by=rerun`, `apply --by=headless` and `apply --by=owner and pending` cases assert on the engine file
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated `decisions apply` region, through `pnpm cli:sync`
  - **DEPENDS ON:** 9
  - **DONE WHEN:** the three tests below and the updated cases pass; `decisions skip` and `decisions pending` tests pass; `pnpm cli:sync` is run and `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged` fails on the decision file gaining "Accept (assumed)"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` fails on the engine file not existing after `--confirm`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1` fails on the refusal "--by=owner needs --q, --reason and one of --confirm / --reject"

<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** The build's Decision Pause has the orchestrator write its own questions, and `decisions compose` goes
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 2 writes the decision file's header (`Question`, `From`, `Pause step`, `Plan`, `Group`, the attempt lines, never `Source changed` or `Gate`), its questions and its reply line with the file tool (the item rules stay, written as `.md`), numbering the orchestrator's questions from `Q2` when the pause has a loop; then, on a verify, holistic or tests pause, runs `decisions counts` with `--source-changed={SOURCE_CHANGED}`, `--base-check` when the gate is red and `--loop` when the pause has a loop; then runs `decisions check`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 2: **If** `decisions check` exits 6 → the orchestrator fixes its file as the printed `problem` says and re-runs `check` once; a second refusal → **Failure Path**
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 4 shows the engine file's attempt line, progress and `Q1` first; step 6 records the owner's loop answer with `decisions apply --by=owner --q=1 --answer=<answer> --reason=<owner's words>` and writes no `Status` line; step 8's handover names both files; the gate box names `decisions check` and `decisions counts`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the subagent `Read` lines at 77, 969, 1035 and 1218 name the engine file beside the decision file
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the `steps finish --step=build-decision` call (line 350) passes the engine file as a second `--artifact` when it exists
  - **DELETE:** `compose` in `.bkit/core/engine/commands/workflow/decisions.ts`: replaced by `decisions check` and `decisions counts`
  - **DELETE:** `composeItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: replaced by `decisions check` and `decisions counts`
  - **DELETE:** `itemLines` in `.bkit/core/engine/commands/workflow/decisions.ts`: replaced by `decisions check` and `decisions counts`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: the header comment (line 1) names `check|counts|apply|skip|pending` instead of `compose`
  - **DELETE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the remaining `describe("bkit decisions compose")` cases, which test removed code
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions entries 10188 ("**If** `decisions compose` exits non-zero → **Failure Path**."), 10248 ("Set `Status: ASSUMED` while any …") and 10299 ("Decision file written (`decisions compose`)") are deleted or rewritten by hand to match the new step text
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`, and the diff shows only the Decision Pause changes
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated `decisions` region, through `pnpm cli:sync`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the guard test below
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files
  - **DEPENDS ON:** 10, 11, 12
  - **DONE WHEN:** the test below and `engine calls > %s calls only verbs and flags the CLI has` pass; `pnpm instructions:sync` and the no-flag check exit 0; `.bkit/core/engine/tools/instructions-coverage.test.ts`, `instructions.test.ts` and `instructions-sources.test.ts` pass; `.bkit/core/engine/render/trackers.test.ts` passes; `pnpm cli:sync` is run and `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build` is run and `dist/` updated; `pnpm bkit:text:ceiling lower` then `check` exit 0, with the workflows total not above its value at the start of this task
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no workflow names decision-items.json or decisions compose` fails on `bkit-build.md` step 2 still naming "decision-items.json"

<!-- bkit:task 13 end -->

### Earlier tasks this group depends on

- TASK 8 (group 2, done): Remove the engine's JSON result path and the fingerprint — `.bkit/core/.bkit/cli.md`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/engine/commands/workflow/audit-report.ts`, `.bkit/instructions.md`, `.bkit/core/engine/commands/workflow/steps.test.ts`, `.bkit/core/engine/commands/workflow/challenge.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| No prompt names a `Result:` launch line or a structured result file | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 3 |
| No workflow names a `Result:` line, a `-result.json` file, `steps stub --result-file` or the Result-path delete line | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| The `steps finish` re-ask passes the printed `problem` back to the agent | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| No prompt or workflow names `--result-file` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 7 |
| The merged reader reads questions from the orchestrator's file and the loop question and progress from the engine file | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| The engine file's `Decision:` line wins over the orchestrator's for one question | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| An old single-file decision layout still reads the same | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| `openDecision` reads `Gate` and `Source changed` from the engine file's header | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| A pause whose loop answer is `Try again` reads `DECIDED`, so `openDecision` does not return it | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| `gateRerun` re-runs a red-gate pause whose `Gate` line and loop question are in the engine file | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| `skipProblem` reads `Source changed` and the loop answer from the engine file | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| `status resume` re-runs the gate of a red-gate pause laid out in two files | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 9 |
| `workflows summary` counts an assumed item in an engine file once | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 9 |
| `decisions check` refuses a question with no lettered options, naming it | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 10 |
| `decisions check` refuses a `Q1` in the orchestrator's file when an engine file holds the loop question | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 10 |
| `decisions check` accepts questions numbered from `Q1` when the pause has no engine file | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 10 |
| `decisions counts` writes the attempt line, progress, base check and loop question into the engine file only | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 11 |
| `decisions counts` recommends Decide when the last round changed no source | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 11 |
| `decisions counts` recommends Try again when the last round made progress | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 11 |
| `decisions counts` with a base check of `all` and no questions in the `--out` file recommends Stop | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 11 |
| `decisions counts` with a base check of `all` and questions in the `--out` file recommends Decide | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 11 |
| `decisions counts` writes `Source changed` and `Gate` into the engine file for a verify pause with no loop | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 11 |
| `decisions apply --by=headless` writes assumed decisions into the engine file and leaves the orchestrator's file unchanged | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 12 |
| `decisions apply --by=owner --confirm` writes the confirmation into the engine file | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 12 |
| `decisions apply --by=owner --answer` writes the owner's loop answer under the engine file's `Q1` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 12 |
| No workflow names `decision-items.json` or `decisions compose` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 13 |
| No workflow names `{OUTBOX_ROOT}/error.md` or `{OUTBOX}/stderr.log` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 14 |
| Every workflow that passes `--stderr-file` says the file holds only the last 20 lines of stderr | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 14 |
| No prompt or workflow writes a file with a shell heredoc | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 15 |
