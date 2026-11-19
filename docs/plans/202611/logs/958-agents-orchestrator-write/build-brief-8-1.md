# Brief: group 8 — The engine's pause facts are status.jsonl rows, and one reader folds them

Plan: Agents and the Orchestrator Write Their Own .md, the Engine Only Checks Implementation Plan

## Why and what

### Context & Goals

**Workstreams:** none. The plan covers the whole of #958; it has no parent design, so no workstream dependencies apply.

**Problem.** Since #860 (commit `7ae1a3e8b`), ten review-type agents and `bkit-audit-generate` hand their findings over as `{OUTBOX}/*-result.json`, and the orchestrator runs `bkit steps stub --result-file` so the engine writes the `.md` report. The prompts also tell each agent to write the same report by hand, so one report is written twice and the two copies can disagree. The agents write the JSON with throwaway inline scripts into `.git/bkit-outbox/`, which Claude Code's auto mode cannot classify, so a run stops for a permission prompt. The orchestrator works the same way for its decision file (`{OUTBOX}/decision-items.json` → `decisions compose`) and its Failure Path text (`{OUTBOX_ROOT}/error.md`).

**Goals**, bound by the owner decisions `958-agents-write-their-md-engine-only-checks`, `958-audit-agent-writes-findings-once-engine-reads-report`, `958-orchestrator-writes-decision-and-error-md-no-error-ledger-row` and `958-agent-writes-engine-counts-verbs-named-for-what-they-do`:

- Every agent and the orchestrator write their own `.md` with the file tool, in the format the prompt or workflow defines.
- The engine checks the file at `bkit steps finish` (format, counts, verdict) and hands a bad file back to its writer with a reason it can act on. It writes none of the writer's words.
- The numbers only the engine can count for a decision pause, and every answer the engine records, are rows in the feature's `status.jsonl`, never lines in a `.md` file; a `.md` holds only prose.
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
- Group 3: Decision files — the orchestrator writes, the engine counts — done
  - TASK 9: One reader merges a decision file with its `-engine.md` sibling — done
  - TASK 10: `bkit decisions check` checks the orchestrator's decision file — done
  - TASK 11: `bkit decisions counts` writes the engine's pause counts into its own file — done
  - TASK 12: `bkit decisions apply` writes the engine's lines into the engine file — done
  - TASK 13: The build's Decision Pause has the orchestrator write its own questions, and `decisions compose` goes — done
- Group 4: The Failure Path file and the contract docs — done
  - TASK 14: The Failure Path error text is a `.md` in the run's log folder — done
  - TASK 15: The debug workflow writes its context-fetch script with the file tool, into the log folder — done
  - TASK 16: Contract docs, ceilings and rendered copies match the code — done
- Group 5: Challenge round 1 findings — done
  - TASK 17: An orchestrator writes its question lines with an en dash (`**Q1 – …`); `decisions check` passes the file, the pause parses zero questions and reads DECIDED before anyone answers, headless apply settles nothing, and `decisions skip` exits 0 so a verify pause routes `continue` — done
  - TASK 18: A pause is interrupted after a headless apply, resumed in a session and re-asked; the owner answers Fix now and the orchestrator writes it in its own file, but `mergeItems` lets the engine file's `Accept (assumed)` (or "recommended; applied without asking") line win, so the orchestrator routes `fix` while `acceptedLocations`, `tasks tick` and `decisions skip` still read Accept — done
  - TASK 19: The orchestrator copies `Status: OPEN` into its own decision file header; `decisions check` passes it, and a lone file (engine sibling not yet written) still reads OPEN after every question is answered because `pauseStatus` at `open-decision.ts:189` prefers the written line, so a resume re-asks a settled pause — done
  - TASK 20: A reviewer quotes `- [ ] **TASK 3:**` at column 0 inside a code fence under `## CRITICAL` (or a fenced `## …` line); `steps finish` counts the fenced line as an item or ends the section early, refuses a correct `Failures` header with "counted N" without naming the lines or the rule, and the agent changes the header to match the miscount — done
  - TASK 21: An audit agent writes `\d+` or `\_` in an Evidence cell, an alignment separator row (`:---`), or the short one-cell `None` row that the template's "write one row: None" invites; `parseAuditReport` hands the table to the engine's strict `parseMarkdownTable` and refuses the whole report with "a Findings table is not a well-formed table", naming no row — done
- Group 6: Challenge round 1 findings — done
  - TASK 22: An audit row carries an empty, `—`, range or list Location; `parseAuditReport` accepts it (the replaced `parseAuditResult` required `path:line`), the append-only failures ledger gets a row like "Weak check (); audit security finding security-1", `ledgerKeys` cannot read the location back, and a re-run that writes `Key: new` appends a `-2` duplicate — done
  - TASK 23: A failed command whose stderr echoes a token leaves it unredacted in the committed {workflow}-stderr.md / {workflow}-error.md, which the abort commit pushes under [skip ci], so no secret scan runs and a private-tracker or tracker-none repo publishes it for the first time — done
  - TASK 24: An owner reply that names a command in backticks executes that command in the orchestrator's shell, because Decision Pause step 6 pastes {owner's words} into the double-quoted --reason of decisions apply --by=owner --answer — done
- Group 7: Challenge round 2 findings — done
  - TASK 25: A verify pause whose questions all fail `decisions check` (for example written with an en dash) gets its loop question built from zero questions, so after the fix the loop offers Try again / Stop with no Decide, and a headless run stops where it should decide — done
  - TASK 26: A consumer's failed migration or test prints its database URL with the password, another service token (e.g. `GH_TOKEN`, a cloud API key) or `/Users/<name>/…` stack paths to stderr; `workflows fail` scrubs only the three tracker key values, so the handover commit pushes them into git history in `{LOG_DIR}/{workflow}-stderr.md` / `-error.md`, for a Linear, Jira or tracker-none repo for the first time — done
- Group 8: The engine's pause facts are status.jsonl rows, and one reader folds them — this group
  - TASK 27: Two engine-only status row types, and a status line parser the decision reader can import — open
  - TASK 28: `decisions counts` appends a `decision-counts` row and prints the lines the owner is shown — open
  - TASK 29: One reader folds a decision file's rows; the row appended last for a question wins — open
  - TASK 30: Every decision-file caller reads through the row reader, with no engine sibling — open
  - TASK 31: A decision file with no readable question reads `OPEN`, a resume can tell, and `tasks tick` ticks only what a row accepts — open
- Group 9: Every answer is a decision-answer row, and decisions check reads the counts row — next
  - TASK 32: Headless, re-run and ship answers and ship's deferrals are `decision-answer` rows — open
  - TASK 33: The owner's answers reach the engine as `Q{n}={letter}` and a task number only; the owner's words never reach a shell argument, a decision file or a status row — open
  - TASK 34: `decisions check` reads the `decision-counts` row, and refuses answer lines in the orchestrator's file — open
  - TASK 35: `bkit decisions answers` prints the folded answers, for the agents given a decision file — open
- Group 10: The workflows record answers through the engine, the fixers ask the engine, and the docs name the rows — later
  - TASK 36: The build and ship workflows record every answer through `decisions apply` and show the printed counts; the fixers run `decisions answers` themselves — open
  - TASK 37: Contract docs and `docs/testing.md` name the two rows and `decisions answers`, and the ceilings drop — open

## The work

<!-- bkit:task 27 start -->

- [ ] **TASK 27:** Two engine-only status row types, and a status line parser the decision reader can import
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: add `parseStatusLines(text, label)`, which returns the parsed rows in file order or the first line that is not a JSON object, and imports nothing from `commands/`; add `ENGINE_ROW_TYPES = new Set(["decision-counts", "decision-answer"])` and the `DecisionCountsRow` and `DecisionAnswerRow` types (fields as in Data Schema Usage)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: `parseStatusRows` calls `parseStatusLines` and keeps its exit 3 and its `RENAMED_STEPS` mapping; the `row` verb refuses a `--type` in `ENGINE_ROW_TYPES`, beside `FOLDED_TYPES`, with a usage error naming the verb that writes it (`decisions counts` or `decisions apply`)
  - **READ:** `.bkit/core/engine/commands/lib.ts`: its import of `../ledgers/status.js`, the reason the moved parser may not import `CommandError`
  - **DEPENDS ON:** 26
  - **DONE WHEN:** the test below passes; every existing `status.test.ts` and `.bkit/core/engine/ledgers/status.test.ts` test passes; `readStatusRows` and `readStatusRowsAt` return the same rows as before; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `bkit status row > refuses the engine-only types decision-counts and decision-answer` fails on exit 0 and a row appended for `--type=decision-counts`

<!-- bkit:task 27 end -->

<!-- bkit:task 28 start -->

- [ ] **TASK 28:** `decisions counts` appends a `decision-counts` row and prints the lines the owner is shown
  - **UPDATE:** `counts` in `.bkit/core/engine/commands/workflow/decisions.ts`: `--decision=<decision file>` replaces `--out`; it reads the decision file (exit 2 when missing) to count its questions, appends one `{type: "decision-counts", workflow: "build", at, file, sourceChanged?, gate?, loop?, baseCheck?}` row to the `status.jsonl` in that file's folder (exit 3 when missing), and prints `{file, questions, loopRecommended, show}`; `show` holds the attempt line, the progress lines, the base-check line and the loop `Q1` block with its options, `Recommended:` and `Default if unanswered:` lines, worded as the `-engine.md` file rendered them
  - **DELETE:** `engineStub` in `.bkit/core/engine/commands/workflow/decisions.ts`: the `-engine.md` stub writer
  - **DELETE:** `engineWith` in `.bkit/core/engine/commands/workflow/decisions.ts`: the `-engine.md` line writer
  - **UPDATE:** `pauseOf` in `.bkit/core/engine/commands/workflow/decisions.ts`: drop its engine-file fields and the `--out` flag it reads
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated `decisions` region, through `pnpm cli:sync`
  - **DEPENDS ON:** 27
  - **DONE WHEN:** the seven tests below pass; no `decisions counts` call writes a `.md` file; the row carries every number the `-engine.md` file held; `pnpm cli:sync` is run and `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > writes the attempt line, progress, base check and loop question into the engine file only` fails on no `decision-counts` row holding the attempt, progress, base check and loop question, and on a `-engine.md` file being written — TASK 11's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > recommends Decide when the last round changed no source` fails on the row's `loop.recommended` not being `Decide` — TASK 11's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > recommends Try again when the last round made progress` fails on the row's `loop.recommended` not being `Try again` — TASK 11's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > engine file recommends Stop when the base check is all and no questions are counted` fails on the row's `loop.recommended` not being `Stop` — TASK 11's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > engine file recommends Decide when the base check is all and questions are counted` fails on the row's `loop.recommended` not being `Decide` — TASK 11's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > writes Source changed and Gate into the engine file for a verify pause with no loop` fails on no row with `sourceChanged` and `gate: "FAIL"` and no `loop` — TASK 11's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > prints the attempt, progress, base and loop question lines in show` fails on `show` missing from the output

<!-- bkit:task 28 end -->

<!-- bkit:task 29 start -->

- [ ] **TASK 29:** One reader folds a decision file's rows; the row appended last for a question wins
  - **UPDATE:** `.bkit/core/engine/commands/workflow/open-decision.ts`: add `decisionRows(read, rel)`, the `decision-counts` and `decision-answer` rows naming `rel` in `join(dirname(rel), "status.jsonl")`, read through `read` and parsed with `parseStatusLines`; `decisionItems` and `decisionFileHeader` build item `n=1` from the last `decision-counts` row's `loop`, take `Source changed` and `Gate` from it, and set each item's `decision`, `assumed`, `rejected`, `deferred` and `fixTask` from the last appended `decision-answer` row for its `q`, never comparing `at`
  - **UPDATE:** `decisionItems` in `.bkit/core/engine/commands/workflow/open-decision.ts`: read the in-file `Decision:`, `Fix task:`, `Rejected:` and `Deferred:` lines only for an old file, one whose header carries a `Status:` line and that no row names; any other file's answer lines are not read
  - **UPDATE:** `decisionFileHeader` in `.bkit/core/engine/commands/workflow/open-decision.ts`: read the in-file `Status`, `Source changed`, `Gate` and `## Progress` lines only for that old file
  - **UPDATE:** `pauseStatus` in `.bkit/core/engine/commands/workflow/open-decision.ts`: drop the `engineText` parameter; `undecidedBesidesLoop`, `gateRerun`, `skipProblem` and `openDecision` likewise drop it and read through `decisionItems`
  - **UPDATE:** `hasProgress` in `.bkit/core/engine/commands/workflow/open-decision.ts`: reads progress from the `decision-counts` row or an old file's `## Progress` lines, with no engine text
  - **DELETE:** `engineSibling` in `.bkit/core/engine/commands/workflow/open-decision.ts`: the `-engine.md` path helper
  - **DELETE:** `isEngineFile` in `.bkit/core/engine/commands/workflow/open-decision.ts`: the `-engine.md` name test
  - **DELETE:** `mergeItems` in `.bkit/core/engine/commands/workflow/open-decision.ts`: the two-file item merge
  - **DELETE:** `mergeHeader` in `.bkit/core/engine/commands/workflow/open-decision.ts`: the two-file header merge
  - **DELETE:** `TAKEN_UNASKED` in `.bkit/core/engine/commands/workflow/open-decision.ts`: the Task 18 merge rule, which the last-appended-row rule replaces
  - **READ:** `docs/security.md`: § Untrusted Content & Prompt Injection, for the in-file answer lines a new file may carry
  - **DEPENDS ON:** 27
  - **DONE WHEN:** the ten tests below pass; `decisionItems(read, rel)` reads the same items for an old single-file layout as before (the TASK 9 old-layout test passes unchanged); `statusOf` reads `DECIDED` for a loop answered `Try again` by a row; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > decisionItems reads the loop question and progress from the engine file` fails on item `Q1` missing when its loop question and progress are a `decision-counts` row and no `-engine.md` file exists — TASK 9's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > the engine file's Decision line wins for one question` fails on an old file's in-file `Decision:` line being read over a `decision-answer` row for the same question — TASK 9's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > openDecision reads Gate and Source changed from the engine file's header` fails on `Gate` and `Source changed` being read as absent when they are fields of the `decision-counts` row — TASK 9's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > a pause whose loop answer is Try again reads DECIDED` fails on `openDecision` returning the pause as "OPEN" when `Try again` is a `Q1` `decision-answer` row — TASK 9's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `gateRerun > re-runs a red-gate pause laid out in two files` fails on `gateRerun` returning false when `Gate` and the loop question come from the `decision-counts` row — TASK 9's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `skipProblem > reads Source changed and the loop answer from the engine file` fails on the refusal naming a missing "Source changed" when it and the loop answer are rows — TASK 9's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)` fails on the item reading `Accept (assumed)` when the owner's `Fix now` row is appended after the headless `Accept (assumed)` row — TASK 18's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > an owner's answer in the decision file wins over an engine line applied without asking` fails on the item reading the headless row's answer when the owner's row is appended after it — TASK 18's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision rows > the row appended last wins even when its at is earlier` fails on the earlier-appended row being read
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision rows > a Decision line in a file with no Status header is not read as an answer` fails on a pasted `Decision: Accept` line under a question being read as that question's answer

<!-- bkit:task 29 end -->

<!-- bkit:task 30 start -->

- [ ] **TASK 30:** Every decision-file caller reads through the row reader, with no engine sibling
  - **UPDATE:** `acceptedLocations` in `.bkit/core/engine/commands/workflow/challenge.ts`: drop the `isEngineFile` filter
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.ts`: drop the two `isEngineFile` filters; count only `workflow: "build"` answer rows as build answers
  - **UPDATE:** `decisionFiles` in `.bkit/core/engine/commands/workflow/workflows.ts`: drop the `isEngineFile` filter
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: `status resume` calls `gateRerun` with no engine text
  - **UPDATE:** `continueCheck` in `.bkit/core/engine/commands/workflow/steps.ts`: calls `skipProblem` with no engine text
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: `check`, `skip`, `pending` and `decisionFiles` call the reader with no engine text and no `isEngineFile` filter
  - **DEPENDS ON:** 29
  - **DONE WHEN:** the three tests below pass; `git grep -n -e engineSibling -e isEngineFile -- .bkit/core/engine ':!*.test.ts'` prints nothing; every existing test in `challenge.test.ts`, `tasks.test.ts`, `steps.test.ts` and `summary`'s tests in `workflows.test.ts` passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `bkit status resume gate re-run > re-runs the gate of a red-gate pause laid out in two files` fails on `gateRerun: false` when the pause's `Gate` and loop question are a `decision-counts` row — TASK 9's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows summary > counts an assumed item in an engine file once` fails on the item counted twice, or a ship `decision-answer` row counted as a build answer, once the assumed answer is a row — TASK 9's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)` fails on exit 0 when the owner's `Fix now` row is appended after the headless `Accept (assumed)` row — TASK 18's test, taken over because this task changes what it asserts

<!-- bkit:task 30 end -->

<!-- bkit:task 31 start -->

- [ ] **TASK 31:** A decision file with no readable question reads `OPEN`, a resume can tell, and `tasks tick` ticks only what a row accepts
  - **UPDATE:** `statusOf` in `.bkit/core/engine/commands/workflow/open-decision.ts`: returns `OPEN` for an empty item list
  - **UPDATE:** `openDecision` in `.bkit/core/engine/commands/workflow/open-decision.ts`: the returned `OpenDecision` gains `questions`, the count of the pause's items, which `status resume` prints
  - **UPDATE:** `apply --by=headless` in `.bkit/core/engine/commands/workflow/decisions.ts`: exits 6 with a `problem` naming the file when the pause has no readable question, instead of exit 0 with nothing applied
  - **DEPENDS ON:** 29
  - **READ:** `.bkit/core/engine/commands/workflow/tasks.ts`: `tick --decision` reads its items through `decisionItems`; it ticks the tasks of items answered `Accept`, and a `Fix now` item's `fixTask` names work not done yet, so it is never ticked
  - **DONE WHEN:** the three tests below pass; a file with no parseable question is never read as settled by `openDecision`, `pauseStatus` or `decisions pending`; `tasks tick --decision` ticks only the tasks of items a row answers `Accept`; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision rows > a decision file with no readable question reads OPEN with questions 0` fails on `statusOf([])` reading `DECIDED` and `openDecision` carrying no `questions` field
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > exits non-zero on a decision file with no readable question` fails on exit 0 with `applied` empty
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `bkit tasks tick > ticks the task an Accept row names and no task for a Fix now row` fails on no task ticked when the `Accept` is a `decision-answer` row

<!-- bkit:task 31 end -->

### Earlier tasks this group depends on

- TASK 26 (group 7, done): A consumer's failed migration or test prints its database URL with the password, another service token (e.g. `GH_TOKEN`, a cloud API key) or `/Users/<name>/…` stack paths to stderr; `workflows fail` scrubs only the three tracker key values, so the handover commit pushes them into git history in `{LOG_DIR}/{workflow}-stderr.md` / `-error.md`, for a Linear, Jira or tracker-none repo for the first time

Reuse Inventory rows left out: 7; Architecture entries left out: 9 — read them in docs/plans/202611/958-agents-orchestrator-write-plan.md § Reuse Inventory and § Architecture & Component Changes.
