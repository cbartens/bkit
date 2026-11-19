# Brief: group 4 — The Failure Path file and the contract docs (tests)

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
- Group 3: Decision files — the orchestrator writes, the engine counts — done
  - TASK 9: One reader merges a decision file with its `-engine.md` sibling — done
  - TASK 10: `bkit decisions check` checks the orchestrator's decision file — done
  - TASK 11: `bkit decisions counts` writes the engine's pause counts into its own file — done
  - TASK 12: `bkit decisions apply` writes the engine's lines into the engine file — done
  - TASK 13: The build's Decision Pause has the orchestrator write its own questions, and `decisions compose` goes — done
- Group 4: The Failure Path file and the contract docs — this group
  - TASK 14: The Failure Path error text is a `.md` in the run's log folder — open
  - TASK 15: The debug workflow writes its context-fetch script with the file tool, into the log folder — open
  - TASK 16: Contract docs, ceilings and rendered copies match the code — done

## The work

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** The Failure Path error text is a `.md` in the run's log folder
  - **UPDATE:** `.bkit/instructions.md`: clause `workflow-error-file` names `{LOG_DIR}/{workflow}-error.md` and `{LOG_DIR}/{workflow}-stderr.md`, the stderr file holding only the last 20 lines of the failed command's stderr, the lines the failure comment posts (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`), written with the file tool, and drops `--error-file` while the folder is not held; the old wording joins its `retired` block; `pnpm instructions:sync` carries it into `bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md`
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: the Failure Path `workflows fail` command line (line 93) passes `--error-file="{LOG_DIR}/plan-error.md" --stderr-file="{LOG_DIR}/plan-stderr.md"`, because no clause carries the command line
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: the Failure Path `workflows fail` command line (line 93) passes `--error-file="{LOG_DIR}/design-error.md" --stderr-file="{LOG_DIR}/design-stderr.md"`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the Failure Path `workflows fail` command line (line 125) passes `--error-file="{LOG_DIR}/build-error.md" --stderr-file="{LOG_DIR}/build-stderr.md"`
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the Failure Path `workflows fail` command line (line 110) passes `--error-file="{LOG_DIR}/debug-error.md" --stderr-file="{LOG_DIR}/debug-stderr.md"`
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the Failure Path `workflows fail` command line (line 97) passes `--error-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md"` and the matching `ship-stderr.md`
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: Failure Path step 1 prose (line 82) and the `issues comment` command line (line 84) write and pass `.worktrees/bkit-error-auto.md` (Q8), and the prose says `{STDERR_FILE}` holds only the last 20 lines of the failed shell command's stderr
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: line 807
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions entry 9966 ("Write the error text to `{OUTBOX_ROOT}/error.md`, then one call: …") is rewritten by hand to the new path, because `pnpm instructions:sync` never edits an entry
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`, and the diff shows only the Failure Path changes
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`: regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`, and the diff shows only the Failure Path changes
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`, and the diff shows only the Failure Path changes
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`, and the diff shows only the Failure Path changes
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`, and the diff shows only the Failure Path changes
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the guard test below
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files
  - **READ:** `docs/deployments.md`: § Abort-push guard, so the handover commit still carries the log folder
  - **READ:** `handoverVerb` in `.bkit/core/engine/commands/workflow/workflows.ts`: `addAllButCopied` and `landFailedRecord`, which put the whole log folder in the abort commit
  - **DEPENDS ON:** 13
  - **DONE WHEN:** the test below passes; every existing `bkit workflows fail`, `bkit workflows handover` and `--session-dir on fail / close` test passes, since `--error-file` already reads any path; `grep -n 'addAllButCopied\|landFailedRecord' .bkit/core/engine/commands/workflow/workflows.ts` shows the abort commit still adds the run's log folder, so each Failure Path commit carries `{workflow}-error.md`; `pnpm instructions:sync` and the no-flag check exit 0; `.bkit/core/engine/tools/instructions-coverage.test.ts`, `instructions.test.ts` and `instructions-sources.test.ts` pass; `.bkit/core/engine/render/trackers.test.ts` passes; `pnpm bkit:text:ceiling check` exits 0 with the workflows total not above its value at the start of this task
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no workflow names {OUTBOX_ROOT}/error.md or {OUTBOX}/stderr.log` fails on the six workflows' "error.md" lines
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > every workflow that passes --stderr-file says the file holds only the last 20 lines of stderr` fails on the six workflows, whose stderr lines name no line limit

<!-- bkit:task 14 end -->

<!-- bkit:task 15 start -->

- [ ] **TASK 15:** The debug workflow writes its context-fetch script with the file tool, into the log folder
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 4 item 2 (lines 498-504): the orchestrator writes each customised block with the file tool to `docs/plans/{YYYYMM}/logs/{FID}/context-fetch-{DEBUG_ATTEMPT}-{IDX}.sh` (Q10), and the bash block keeps only the `context fetch --script=` call on that path; the `SCRIPT=` line and the `BKIT_CONTEXT_FETCH_BLOCK` heredoc go
  - **UPDATE:** `.bkit/instructions.md`: every § Local Instructions entry whose line this task changes is rewritten by hand
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`, and the diff shows only the Step 4 change
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the guard test below
  - **READ:** `.bkit/core/engine/commands/workflow/context.ts`: `context fetch` (lines 2037-2083), whose `--script` runs any path
  - **READ:** `docs/security.md`: § Untrusted Content & Prompt Injection, since the committed script holds only the tracked `.agents/context.md` block and its adjustments
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files
  - **DEPENDS ON:** 14
  - **DONE WHEN:** the test below passes; `grep -n "<<'" .bkit/core/workflows/*.md .bkit/core/prompts/*.md` prints nothing; every existing `bkit context fetch` test passes; `pnpm instructions:sync` and the no-flag check exit 0; `.bkit/core/engine/tools/instructions-coverage.test.ts`, `instructions.test.ts` and `instructions-sources.test.ts` pass; `.bkit/core/engine/render/trackers.test.ts` passes; `pnpm bkit:text:ceiling check` exits 0 with the workflows total not above its value at the start of this task
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no prompt or workflow writes a file with a shell heredoc` fails on `bkit-debug.md` Step 4 still carrying "BKIT_CONTEXT_FETCH_BLOCK"

<!-- bkit:task 15 end -->

### Earlier tasks this group depends on

- TASK 13 (group 3, done): The build's Decision Pause has the orchestrator write its own questions, and `decisions compose` goes — `.bkit/core/workflows/bkit-build.md`, `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/instructions.md`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, `.bkit/core/.bkit/cli.md`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `.bkit/core/engine/commands/workflow/decisions.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| No prompt names a `Result:` launch line or a structured result file | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 3 |
| No workflow names a `Result:` line, a `-result.json` file, `steps stub --result-file` or the Result-path delete line | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| The `steps finish` re-ask passes the printed `problem` back to the agent | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| No prompt or workflow names `--result-file` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 7 |
| No workflow names `decision-items.json` or `decisions compose` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 13 |
| No workflow names `{OUTBOX_ROOT}/error.md` or `{OUTBOX}/stderr.log` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 14 |
| Every workflow that passes `--stderr-file` says the file holds only the last 20 lines of stderr | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 14 |
| No prompt or workflow writes a file with a shell heredoc | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 15 |
