# Brief: group 10 — The workflows record answers through the engine, the fixers ask the engine, and the docs name the rows

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
- Group 8: The engine's pause facts are status.jsonl rows, and one reader folds them — done
  - TASK 27: Two engine-only status row types, and a status line parser the decision reader can import — done
  - TASK 28: `decisions counts` appends a `decision-counts` row and prints the lines the owner is shown — done
  - TASK 29: One reader folds a decision file's rows; the row appended last for a question wins — done
  - TASK 30: Every decision-file caller reads through the row reader, with no engine sibling — done
  - TASK 31: A decision file with no readable question reads `OPEN`, a resume can tell, and `tasks tick` ticks only what a row accepts — done
- Group 9: Every answer is a decision-answer row, and decisions check reads the counts row — done
  - TASK 32: Headless, re-run and ship answers and ship's deferrals are `decision-answer` rows — done
  - TASK 33: The owner's answers reach the engine as `Q{n}={letter}` and a task number only; the owner's words never reach a shell argument, a decision file or a status row — done
  - TASK 34: `decisions check` reads the `decision-counts` row, and refuses answer lines in the orchestrator's file — done
  - TASK 35: `bkit decisions answers` prints the folded answers, for the agents given a decision file — done
- Group 10: The workflows record answers through the engine, the fixers ask the engine, and the docs name the rows — this group
  - TASK 36: The build and ship workflows record every answer through `decisions apply` and show the printed counts; the fixers run `decisions answers` themselves — open
  - TASK 37: Contract docs and `docs/testing.md` name the two rows and `decisions answers`, and the ceilings drop — open
- Group 11: Planned tests the build took over — next
  - TASK 38: Take over `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` from TASK 12 — open
  - TASK 39: Take over `bkit decisions check > refuses Q1 when the engine file holds the loop question` from TASK 10 — open
  - TASK 40: Take over `bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged` from TASK 12 — open
  - TASK 41: Take over `bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1` from TASK 12 — open
  - TASK 42: Take over `bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file` from TASK 24 — open
- Group 12: Planned tests the build took over — later
  - TASK 43: Take over `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` from TASK 25 — open
  - TASK 44: Take over `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` from TASK 12 — open

## The work

<!-- bkit:task 36 start -->

- [ ] **TASK 36:** The build and ship workflows record every answer through `decisions apply` and show the printed counts; the fixers run `decisions answers` themselves
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Resume, Open decision: hold `questions`; sub-step 4 routes first on it: **If** `questions` = 0 → **Decision Pause** step 2, which rewrites the file and runs `decisions counts` and `decisions check`; **Else** the existing `gateRerun` route
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the Owner decisions line: a subagent learns the owner's answers by running `bkit decisions answers --file=<decision file>` on each decision file in its `Read`, plus that file's `Owner:` lines
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 2: `decisions counts --decision=…` replaces `--out=…`, and its sentence says the engine records its counts as a `status.jsonl` row and prints the lines to show; the header rule also forbids `Decision:`, `Fix task:`, `Rejected:` and `Deferred:` lines
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 4: the message starts with the `show` lines `decisions counts` printed, word for word (loop pauses only), then each question with no answer yet
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 5: a reopened file's already-applied items are the ones `decisions answers` lists as answered; a `Fix now` item's task is recorded right after its task block is written, before `tests plan-check`, with `"{BKIT}" decisions apply --by=owner --file=… --answer=Q{n}={letter} --fix-task=Q{n}={N}`, and an item `decisions answers` already lists with a `fixTask` reuses that task
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 6, the same in every pause kind: **If** the owner answered at least one question → one `"{BKIT}" decisions apply --by=owner --file=… --answer=Q{n}={letter} [--answer=Q{n}={letter} …]` call naming every answered question not yet recorded at step 5. On a loop pause (verify, holistic or tests with `PAUSE_LOOP` or `TESTS_LOOP` set) `Q1` is the loop question, answered with `Try again`, `Decide` or `Stop`; on a verify or holistic pause with no loop, and on a challenge, changed-tests or unproven pause, `Q1` is the orchestrator's first item. A non-zero exit → **Failure Path**. Then append `Owner ({YYYY-MM-DD}):` and the owner's reply, each line quoted with `> `, at the end of the decision file with the file tool. The `Decision:` and `Fix task:` bullets, the loop-answer reason-file bullet and its `--q=1 --answer="{Try again|Decide|Stop}" --reason-file=…` block go
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 8 and every subagent `Read` line: name the decision file only, with no `-engine.md` file
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: confirm and reject (the `--reason="{human's words}"` line near line 406): write the owner's words with the file tool to `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md`, `{ENTRY}` = the entry's position in the printed list, and pass `--reason-file="{that path}"`
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-diagnose.md`: the same clause change as in `bkit-build-plan-gaps-remediate.md` below
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: the "decision record is supplied" clause says the engine does the fold, so run `bkit decisions answers --file=<the decision file>` and follow what it prints and the file's `Owner:` lines; an answer whose `by` is not `owner` is not the owner's; the two quoted `Decision:` forms go
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: step 9: an accepted gap is an `Accept` that `bkit decisions answers --file=<the record>` prints, and an assumed one is one it prints with `assumed: true`
  - **UPDATE:** `.bkit/instructions.md`: the matching `## Local Instructions` entries, by hand; render baselines regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply, § Before You Save
  - **DEPENDS ON:** 35
  - **DONE WHEN:** the two tests below pass; no workflow or prompt names `-engine.md`, `--reason=`, `build-owner-reason-` or a `Decision:` or `Fix task:` line the orchestrator writes; no workflow saves `decisions answers` output to a file; the three prompts name `bkit decisions answers`; the instruction tests (`instructions-coverage.test.ts`, `instructions.test.ts`, `instructions-sources.test.ts`) pass; the `.bkit/core/workflows/*.md` word total is lower and the `.bkit/core/prompts/*.md` total is not higher than before the task, with the diagnose clause shortened rather than a ceiling raised
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no workflow names the engine decision file or the build reason file, or passes the owner's words in --reason` fails on the `-engine.md` and `build-owner-reason-` lines in `bkit-build.md` and the `--reason="{human's words}"` line in `bkit-ship.md`
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > bkit-build records owner answers with one decisions apply call and routes a resumed pause with no question to decisions check` fails on step 6's `--q=1 --answer="{Try again|Decide|Stop}"` block and on the Open decision route having no `questions` = 0 branch

<!-- bkit:task 36 end -->

<!-- bkit:task 37 start -->

- [ ] **TASK 37:** Contract docs and `docs/testing.md` name the two rows and `decisions answers`, and the ceilings drop
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the status event table gains `decision-counts` and `decision-answer` with their fields and sole writers; the Decision Pause contract lines that name the engine file, and the fixer's answer lines (the fixer runs `bkit decisions answers --file=<the decision file>` and follows its output plus the file's `Owner:` lines)
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: the `run` row's decision-pause line reads the rows, not a sibling file
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the hand text beside the generated `decisions` table
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: the decision-file lines
  - **UPDATE:** `docs/testing.md`: the per-file rows for `decisions.test.ts` (rows, `answers`, the four refused answer lines), `open-decision.test.ts` (the row fold, a file with no question), `status.test.ts` (the refused engine-only types), `tasks.test.ts` (`tick --decision` reads an `Accept` row), `workflow-shape.test.ts` (the two Task 36 checks), `audit-report.test.ts` (a backslash in `Evidence`, a lone `None` row, a `Location` that is not `path:line`) and `workflows.test.ts` (the error and stderr scrubbing of Tasks 23 and 26); this plan adds no new test file
  - **UPDATE:** `scripts/gate/bkit-text-ceiling.json`: lowered with `pnpm bkit:text:ceiling lower`, then checked with `pnpm bkit:text:ceiling check`
  - **READ:** `docs/testing.md`: § Where tests live
  - **DEPENDS ON:** 36
  - **DONE WHEN:** `git grep -n -e 'engine file' -e '-engine\.md' -- '.bkit/core/*.md' '.bkit/core/**/*.md' .bkit/instructions.md` prints nothing outside ` ```retired ` blocks; `pnpm bkit:text:ceiling check` passes with no `raise`
  - **TEST FIRST:** n/a — prose and generated docs, covered by the instruction tests and the ceiling check

<!-- bkit:task 37 end -->

### Earlier tasks this group depends on

- TASK 35 (group 9, done): `bkit decisions answers` prints the folded answers, for the agents given a decision file — `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/.bkit/cli.md`

### Architecture entries

#### [MODIFY] `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/jsonl.md`, `docs/testing.md`

- Contract text at the lines listed in `Documentation Consultation`.

Reuse Inventory rows left out: 1; Architecture entries left out: 2 — read them in docs/plans/202611/958-agents-orchestrator-write-plan.md § Reuse Inventory and § Architecture & Component Changes.
