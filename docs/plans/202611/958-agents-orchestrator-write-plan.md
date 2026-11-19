<!-- bkit:anchor
baseSha: 2fa879a63b915f995a69ae523815b6d6bef12963
baseRef: origin/dev
bkitVersion: 6.2.0
bkitLatest: 6.2.0
-->

Verdict: CONCERNS
<!-- verdict:end -->

# Agents and the Orchestrator Write Their Own .md, the Engine Only Checks Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

An agent writes each of its files once, as `.md`, with the file tool. A file with a wrong format, count or verdict goes back to the agent that wrote it with a reason it can act on.

### Success Criteria

- No prompt or workflow line names `{OUTBOX}/*-result.json`, a `Result:` launch line, `steps stub --result-file` or `{OUTBOX}/decision-items.json`.
- A report with a wrong count or a missing verdict is refused at `bkit steps finish` and handed back to its agent, not sent to **Failure Path**.
- The audit agent writes its findings once. The engine reads the report to check the totals and to print the ledger rows.
- The decision file's questions are the orchestrator's own text. The engine's counts for the pause are reported by the engine, not written into that file.
- Both word counts go down (`pnpm bkit:text:ceiling check`).

### Process Sketch

- **WHEN** a review agent finishes its report with the file tool **→ THEN** `bkit steps finish` counts the section its header names and accepts the file when `Failures`, `Fixable` and `Verdict` agree with it.
- **IF** the header's count or verdict disagrees with the report **→ THEN** `steps finish` exits 6 with `reask` and a `problem` naming the field, the declared value and the counted value, and the orchestrator re-asks that agent once with the problem.
- **IF** a plan review says `PASS` with only `OPTIONAL` items **→ THEN** `Failures` is 0 and the file is accepted; **IF** it says `PASS` with a `CRITICAL` item **→ THEN** it is refused.
- **WHEN** the audit agent finishes its report **→ THEN** `bkit ledgers findings --report=<Create>` prints the finding IDs, the severity totals and the ledger rows from the report's Findings table; **IF** the table is malformed **→ THEN** it exits 6 naming the bad row.
- **WHEN** the build pauses for a decision **→ THEN** the orchestrator writes `build-decision-{RUN}-{K}.md` itself; on a verify, holistic or tests pause `bkit decisions counts` then appends a `decision-counts` row to `status.jsonl` with `Source changed`, `Gate`, the rounds, the base check and, with a loop, the loop question, and prints the lines the owner is shown; `bkit decisions check` checks the orchestrator's file, and a refusal goes back to the orchestrator once before **Failure Path**.
- **WHEN** the owner answers a question **→ THEN** `bkit decisions apply --by=owner --answer=Q{n}={letter}` appends a `decision-answer` row, and a `Try again` answer to the loop question leaves the pause `DECIDED`, so a resume does not ask it again.
- **WHEN** a workflow takes the Failure Path after its log folder exists **→ THEN** the orchestrator writes `{LOG_DIR}/{workflow}-error.md` with the file tool and `workflows fail --error-file` reads it; **IF** the log folder is not held yet **→ THEN** `--error-file` is dropped, as today.

### Concrete Example

**Setup:** A build runs in Claude Code auto mode in a fresh consumer checkout. It reaches holistic verify for `{FID}` with run 1, attempt 1. Two plan tasks are not satisfied, and both gaps are fixable.

**Steps:**

1. The orchestrator launches `@bkit-build-plan-verify` with **Create** = `build-plan-verify-holistic-1-1.md` and no `Result:` line → the agent writes the report with the file tool: two `TASK {N}` lines under `## Identified Gaps Log`, each ending `— Fixable: true`, and a header with `Verdict: CONCERNS`, `Failures: 2` and `Fixable: true`. No JSON file is written and no permission prompt appears.
2. The orchestrator runs `bkit steps finish --agent=bkit-build-plan-verify --artifact=build-plan-verify-holistic-1-1` → the engine counts two gap lines under `## Identified Gaps Log`, finds `Failures` and `Fixable` correct, and prints `verdict: CONCERNS` with exit 0.
3. A second run's agent writes `Failures: 1` over the same two lines → `steps finish` exits 6 and prints `reask` with `problem: Failures is 1, but ## Identified Gaps Log has 2 counted lines` → the orchestrator re-asks the agent once with that problem → the agent corrects the header with the edit tool → `steps finish` exits 0.
4. The gaps reach the Decision Pause → the orchestrator writes `build-decision-1-1.md` with its header lines and one question per gap in its own words, starting at `Q2`; `bkit decisions counts` reads that file's question count, appends a `decision-counts` row holding `Source changed`, `Gate`, the attempt, the progress numbers, the base check and the loop question `Q1` with its recommendation, and prints them as `show` lines; `bkit decisions check` exits 0 on the orchestrator's file.

**Outcome:** The owner reads the `show` lines (attempt, progress and `Q1`), then the orchestrator's `Q2` and `Q3`, in one message. No `*-result.json` or `decision-items.json` exists under `.git/bkit-outbox/{FID}/`, and each report was written once, by its agent.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A plan review or scope check says `PASS` and lists only `OPTIONAL` items | Its header `Failures: 0` matches zero items under `## CRITICAL`, so `steps finish` accepts it (#974 point 2). |
| A plan review says `PASS` with one item under `## CRITICAL` | `steps finish` exits 6: the count is 1 and `PASS` needs `Failures` 0. |
| A build challenge says `PASS` with a `HIGH` task block | `steps finish` exits 6: the prompt's rule is `PASS` = no findings, and the highest severity found is `HIGH`. |
| A build challenge says `CONCERNS` with a `CRITICAL` task block | `steps finish` exits 6: `CONCERNS` allows `HIGH` or lower only. |
| A challenge task block has an empty field, so `parseFindings` cannot read it | `steps finish` exits 6 with `reask` and a `problem` naming the block; the block is neither counted nor skipped. |
| A verify report says `Fixable: false` while one gap line ends `Fixable: true` | `steps finish` exits 6 naming `Fixable`. |
| A verify report's `## Identified Gaps Log` starts with a gap-count line | Only lines ending `Fixable: true` or `Fixable: false` are counted, so the count line never adds one. |
| A resumed run finishes a report the old render wrote, whose `Failures` counted every severity | `steps finish` exits 6 with `reask`; the agent corrects `Failures` to the `CRITICAL` count with the edit tool. |
| A header still carries a `Fingerprint:` line from an older render | It is read as an unknown extra line and ignored; no "stale" refusal remains. |
| `## CRITICAL` says `None` | It counts as zero items. |
| A report still has `PENDING` in a counted section | `steps finish` exits 5 (pending), as today. |
| A prompt header declares a count rule the engine does not know | `steps finish` exits 2 with a usage error naming the declaration; the guard test catches it in CI first. |
| An audit Findings table row has an empty `Severity` or an unknown `Key` | `ledgers findings` exits 6 naming the row's `ID`. |
| An audit report has no findings | `ledgers findings` prints `totals: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0` and no ledger rows, exit 0. |
| A decision pause has no loop question and no headless apply | The orchestrator numbers its questions from `Q1`, and `decisions check` accepts that. A challenge, changed-test or unproven-test pause then has no `decision-counts` row; a verify or holistic pause has one holding `sourceChanged` but no `loop`. |
| The orchestrator's decision file has a question without option lines, or with options that are not lettered | `decisions check` exits 6 naming the question; the orchestrator fixes the named lines and runs `decisions check` once more, and a second refusal goes to **Failure Path**. |
| The owner answers the loop question `Try again` | `decisions apply --by=owner --answer=Q1=A` appends a `decision-answer` row for `Q1`; the pause reads `DECIDED` while its other items stay undecided, so `openDecision` does not return it on resume. |
| An old decision file (composed before this change) is reopened on resume | Its header carries the `Status:` line `decisions compose` wrote first, whatever rows name it, so the reader reads its in-file `## Progress`, loop question, `Status`, `Source changed`, `Gate`, `Decision:` and `Fix task:` lines; `openDecision`, `gateRerun` and `decisions skip` answer as before; no migration is needed. |
| `decisions apply --by=headless` runs | It appends one `decision-answer` row per item it settles (`assumed: true` for an Accept) and never writes the orchestrator's file. |
| Two `decision-answer` rows name one question (a headless Accept (assumed), then the owner's Fix now on a resumed run) | The row appended last wins, for every reader; `at` is not compared. |
| The orchestrator writes a `Decision:`, `Fix task:`, `Rejected:` or `Deferred:` line in a new decision file (for example a pasted `BLOCKED` reason) | `decisions check` exits 6 naming the question: answers are recorded by `decisions apply`. A file with no `Status:` header is never read for in-file answers, so a run that stops before `check` cannot read the line as an answer either. |
| A run stops after the orchestrator wrote a decision file with no readable question, before `decisions check` passed | The pause reads `OPEN`, never `DECIDED`; `status resume` prints the open decision with `questions: 0`, and the resume goes to **Decision Pause** step 2, which rewrites the file and runs `decisions counts` and `decisions check`; `decisions apply --by=headless` exits 6 on such a file instead of exit 0 with nothing applied. |
| The owner's reply spans several lines and holds a line shaped like a question or an answer | The orchestrator writes the reply as a `> ` quote under `Owner ({date}):`, so no line starts with `**Q{n} — ` or `Decision:`, and the reader takes no question or answer from it; answers come only from `decision-answer` rows. |
| A Failure Path is taken before `LOG_DIR` is held | `--error-file` is dropped, as today, and the comment carries no error text. |
| Ship or auto takes the Failure Path | Ship writes `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`; auto writes the gitignored `.worktrees/bkit-error-auto.md` in the checkout (Q8). |
| Debug customises a context-fetch block | The orchestrator writes the script with the file tool to `docs/plans/{YYYYMM}/logs/{FID}/context-fetch-{DEBUG_ATTEMPT}-{IDX}.sh` and passes it to `context fetch --script` (Q10); no heredoc writes into `{OUTBOX}`. |
| A workflow names `steps stub --result-file`, `decisions compose` or another removed flag, or writes a file with a shell heredoc | The `workflow-shape` checks fail in CI. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit and Integration apply here; @live (golden), E2E, fresh-DB replay and Smoke are `Not applicable` in this repo. Every row's target is a colocated `*.test.ts`, which `docs/testing.md` § Where tests live places in the Unit tier, audits under `.bkit/core/engine/audits/` included. The verb tests run the real CLI verb against a temporary checkout, with no mock at the file boundary, so the lowest sufficient tier is Unit. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `promptHeader` reads a `<count of …>` declaration into the field's count rule | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `headerDeclaration` refuses an unknown count declaration | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| Each of the six count-checked prompts declares a known count rule for `Failures`, and no other prompt declares a `<count of …>` | Unit | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` | 1 |
| No prompt tells the agent to leave an incomplete finding out of `Failures` | Unit | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` | 1 |
| `steps finish` checks `Failures` against the `## CRITICAL` items and ignores `OPTIONAL` ones, so `PASS` with only `OPTIONAL` items is accepted (#974 point 2) and a miscount is refused with `reask` and `problem` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `steps finish` reads `None` under `## CRITICAL` as zero items | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `steps finish` refuses a verify `Fixable` that disagrees with its gap lines | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `steps finish` counts only the `Fixable` gap lines under a verify gap-count line | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `steps finish` refuses a challenge `PASS` that carries any task block | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `steps finish` refuses a challenge `CONCERNS` that carries a `CRITICAL` task block | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `steps finish` hands back a challenge task block `parseFindings` cannot read, naming it | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `steps finish` refuses a report the old render wrote, whose `Failures` counted an `OPTIONAL` item | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `steps finish` checks each agent's count in a two-agent finish | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| No prompt names a `Result:` launch line or a structured result file | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 3 |
| Every judgment field a result prompt names is a header line `promptHeader` reads (#1016 item 1 guard) | Unit | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` | 3 |
| No workflow names a `Result:` line, a `-result.json` file, `steps stub --result-file` or the Result-path delete line | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| The `steps finish` re-ask passes the printed `problem` back to the agent | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| `parseAuditReport` reads IDs, severities, titles and keys from an audit Findings table | Unit | `.bkit/core/engine/commands/workflow/audit-report.test.ts` | 5 |
| `parseAuditReport` refuses a row with an unknown key, naming its ID | Unit | `.bkit/core/engine/commands/workflow/audit-report.test.ts` | 5 |
| `parseAuditReport` refuses a row with an empty severity, naming its ID | Unit | `.bkit/core/engine/commands/workflow/audit-report.test.ts` | 5 |
| `ledgers findings --report` prints the totals and the ledger rows from a real report file | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 6 |
| `ledgers findings --report` prints zero totals and no ledger rows for a report with no findings | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 6 |
| `issues comment --kind=audit --report` derives the `Findings` field from the report | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 6 |
| Every audit template's Findings table has the `Title` and `Key` columns `parseAuditReport` reads | Unit | `.bkit/core/engine/audits/templates/template-shape.test.ts` | 7 |
| No prompt or workflow names `--result-file` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 7 |
| `steps stub` refuses `--result-file` as an unknown flag | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 8 |
| `steps verdict` reads a header with a leftover `Fingerprint:` line without a stale refusal | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 8 |
| `decisionItems` reads the questions from the orchestrator's file and the loop question and progress from the file's last `decision-counts` row | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| A `decision-answer` row's answer wins over an in-file `Decision:` line for one question | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| An old single-file decision layout still reads the same | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| `openDecision` reads `Gate` and `Source changed` from the `decision-counts` row | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| A pause whose `Q1` row answers `Try again` reads `DECIDED`, so `openDecision` does not return it | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| `gateRerun` re-runs a red-gate pause whose `Gate` and loop question come from its `decision-counts` row | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| `skipProblem` reads `Source changed` and the loop answer from the rows | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| `status resume` re-runs the gate of a red-gate pause whose facts are rows | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 30 |
| `workflows summary` counts an assumed item once, from its row, and leaves ship rows out of build answers | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 30 |
| `decisions check` refuses a question with no lettered options, naming it | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 10 |
| `decisions check` refuses a `Q1` in the orchestrator's file when the `decision-counts` row has a loop | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 34 |
| `decisions check` accepts questions numbered from `Q1` when no `decision-counts` row has a loop | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 34 |
| `decisions counts` appends one `decision-counts` row with the attempt, progress, base check and loop question, and writes no `.md` file | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 28 |
| `decisions counts` recommends Decide when the last round changed no source | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 28 |
| `decisions counts` recommends Try again when the last round made progress | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 28 |
| `decisions counts` with a base check of `all` and no questions in the `--decision` file recommends Stop | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 28 |
| `decisions counts` with a base check of `all` and questions in the `--decision` file recommends Decide | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 28 |
| `decisions counts` records `Source changed` and `Gate` in the row for a verify pause with no loop | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 28 |
| `decisions apply --by=headless` appends an assumed `Accept` row and leaves the orchestrator's file unchanged | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 32 |
| `decisions apply --by=owner --confirm` appends the confirmation row and takes the words from `--reason-file` only | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 32 |
| `decisions apply --by=owner --answer=Q1={letter}` appends the owner's loop answer row | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 33 |
| No workflow names `decision-items.json` or `decisions compose` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 13 |
| No workflow names `{OUTBOX_ROOT}/error.md` or `{OUTBOX}/stderr.log` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 14 |
| Every workflow that passes `--stderr-file` says the file holds only the last 20 lines of stderr | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 14 |
| No prompt or workflow writes a file with a shell heredoc | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 15 |
| bkit decisions check > refuses a question line written with an en dash, naming the line | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 17 |
| bkit decisions check > refuses a file with no question when the engine file holds no loop question | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 17 |
| decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed) | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| decision file readers > an owner's answer in the decision file wins over an engine line applied without asking | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed) | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 30 |
| bkit decisions check > refuses a Status, Source changed or Gate line in the orchestrator's header | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 19 |
| bkit steps finish > does not count a fenced line under ## CRITICAL as an item | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 20 |
| bkit steps finish > a fenced ## line under ## CRITICAL does not end the section | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 20 |
| parseAuditReport > reads a row whose Evidence cell holds a backslash | Unit | `.bkit/core/engine/commands/workflow/audit-report.test.ts` | 21 |
| parseAuditReport > reads a lone short None row as no finding | Unit | `.bkit/core/engine/commands/workflow/audit-report.test.ts` | 21 |
| parseAuditReport > refuses a row whose Location is not path:line, naming its ID | Unit | `.bkit/core/engine/commands/workflow/audit-report.test.ts` | 22 |
| bkit workflows fail > rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 23 |
| engine calls > no bkit-build bash block puts the owner's words inside a double-quoted argument | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 24 |
| bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 33 |
| bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 34 |
| bkit workflows fail > redacts credentials beyond the tracker keys from the error and stderr files | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 26 |
| bkit workflows fail > writes the stderr file with the checkout path made relative and the home directory as ~ | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 26 |
| bkit status row > refuses the engine-only types decision-counts and decision-answer | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 27 |
| bkit decisions counts > prints the attempt, progress, base and loop question lines in show | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 28 |
| decision rows > the row appended last wins even when its at is earlier | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| decision rows > a Decision line in a file with no Status header is not read as an answer | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| decision rows > a decision file with no readable question reads OPEN with questions 0 | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 31 |
| bkit decisions apply --by=headless > exits non-zero on a decision file with no readable question | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 31 |
| bkit decisions apply --by=rerun > records the re-run as a Q1 row and the pause reads DECIDED | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 32 |
| bkit decisions apply --by=owner and pending > pending --defer keeps the answer and marks it needs-decision | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 32 |
| bkit decisions apply --by=owner and pending > --answer=Q2=B --fix-task=Q2=31 records Fix now with its task | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 33 |
| bkit decisions apply --by=owner and pending > refuses an --answer that is not Q{n} and an option letter | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 33 |
| bkit decisions apply --by=owner and pending > refuses --reason as an unknown flag | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 33 |
| bkit decisions apply --by=owner and pending > a multi-line --reason-file reaches only the decisions.jsonl rationale | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 33 |
| bkit tasks tick > ticks the task an Accept row names and no task for a Fix now row | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 31 |
| bkit decisions check > refuses a Decision, Fix task, Rejected or Deferred line in the orchestrator's file | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 34 |
| bkit decisions answers > prints the last appended answer per question with its writer | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 35 |
| bkit decisions answers > prints an old single-file decision's in-file answers | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 35 |
| engine calls > no workflow names the engine decision file or the build reason file, or passes the owner's words in --reason | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 36 |
| engine calls > bkit-build records owner answers with one decisions apply call and routes a resumed pause with no question to decisions check | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 36 |
| bkit decisions counts > recommends Decide when the last round changed no source (Task 28 takes it over) | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 11 |
| bkit decisions apply --by=owner and pending > writes a confirmation into the engine file (Task 32 takes it over) | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 12 |
| bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed) (Task 30 takes it over) | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 18 |
| bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options (Task 34 takes it over) | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 25 |
| Take over bkit decisions apply --by=owner and pending > writes a confirmation into the engine file from TASK 12 | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 38 |
| Take over bkit decisions check > refuses Q1 when the engine file holds the loop question from TASK 10 | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 39 |
| Take over bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged from TASK 12 | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 40 |
| Take over bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1 from TASK 12 | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 41 |
| Take over bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file from TASK 24 | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 42 |
| Take over bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options from TASK 25 | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 43 |
| Take over bkit decisions apply --by=owner and pending > writes a confirmation into the engine file from TASK 12 | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 44 |
| bkit decisions apply --by=owner and pending > confirming Q1 of an old per-line file with two assumed Accepts leaves Q2 confirmable | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 47 |
| bkit decisions apply --by=owner and pending > pending lists the second assumed Accept of an old per-line file after the first is confirmed | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 47 |
| decision rows > an old file keeps the in-file answers of questions no row names | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 47 |
| skipProblem > an old file keeps its Source changed header after a row names it | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 47 |
| bkit workflows fail > redacts token-shaped values that no environment variable holds from the error and stderr files | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 48 |
| bkit workflows fail > redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 49 |
| bkit workflows fail > redacts the password of a URL with an empty user name from the error and stderr files | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 50 |
| decision rows > a loop pause whose questions decisions check refuses resumes to Decision Pause step 2, not a gate re-run | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 51 |
| bkit decisions apply --by=headless > exits 6 on a loop pause whose own questions decisions check refuses | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 51 |
| bkit decisions check > refuses a question whose bold closes before the colon, naming the line | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 52 |
| bkit decisions check > refuses a question line behind a list marker on a loop pause, naming the line | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 53 |
| bkit decisions check > refuses a question written as **Question 2 on a loop pause, naming the line | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 53 |
| bkit workflows fail > redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 54 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

Every change below is to bkit's own CLI and workflow contract. Consumers receive the new prompts, workflows and templates through `bkit upgrade`; none of these names lives in a consumer's own tracked files, so no upgrade migration is needed and `docs/migrations.md` gets no row.

<!-- prettier-ignore -->
| Change | Old | New | Who is affected |
| --- | --- | --- | --- |
| Verb removed | `bkit decisions compose` (writes the decision file from `decision-items.json`) | `bkit decisions check` (checks the orchestrator's file) and `bkit decisions counts` (appends a `decision-counts` row to `status.jsonl` and prints the lines to show) | `bkit-build.md`, `.bkit/core/.bkit/cli.md`. A by-hand caller of `compose` gets "no such verb". |
| Flags changed | `decisions apply --reason=<words>` | `--by=owner --answer=Q{n}={letter}` (repeatable) and `--fix-task=Q{n}={task}`; `--reason-file` only with `--confirm` / `--reject`; `--reason` removed | `bkit-build.md` Decision Pause steps 5 and 6, `bkit-ship.md` confirm and reject |
| Flags removed | `bkit steps stub --result-file --agent --invocation` | None. `steps stub` keeps only its copy job (`--from`, `--to`, `--strip-header`), so its name stays. | plan, design, build and debug workflows; the audit prompt. |
| Flag removed | `bkit steps verdict --result-file` | None | `.bkit/core/.bkit/cli.md` |
| Flag renamed | `bkit issues comment --kind=audit --result-file` | `bkit issues comment --kind=audit --report=<report>` | `bkit-audit-generate.md` |
| Verb added | — | `bkit ledgers findings --report=<report>`: prints the audit finding IDs, totals and ledger rows | `bkit-audit-generate.md` |
| Status rows added; verb added | — | `decision-counts` (written only by `decisions counts`) and `decision-answer` (written only by `decisions apply` and `decisions pending --defer`); `status row` refuses both; `decisions answers --file` prints the folded answers | Readers of decision files: `openDecision`, `gateRerun`, `skipProblem` (`decisions skip`, `steps finish --field=route=continue`), `decisions pending`, `status resume`, `challenge merge` (`acceptedLocations`), `tasks tick --decision`, `workflows summary`; the verify, remediate and diagnose prompts, which run `decisions answers`. |
| Decision file layout | The engine wrote the whole file; `Status:`, `Source changed:` and `Gate:` were written lines, the last two relayed by the orchestrator as `compose --header` flags | The orchestrator writes its header (`Question`, `From`, `Pause step`, `Plan`, `Group`, the attempt lines), its questions and the owner's words as `Owner ({date}):` followed by the reply quoted with `> `, and no `Decision:`, `Fix task:`, `Rejected:`, `Deferred:`, `Status`, `Source changed` or `Gate` line; the engine's counts and every answer are `status.jsonl` rows; `Status` is computed on read, and a loop answered `Try again` leaves it `DECIDED` | Files composed before this change are still read: a file whose header carries a `Status:` line is read by its in-file lines as the base, and a row overrides only the question it names. |
| Debug context-fetch script | `{OUTBOX}/context-fetch-{IDX}.sh`, written with a shell heredoc | `docs/plans/{YYYYMM}/logs/{FID}/context-fetch-{DEBUG_ATTEMPT}-{IDX}.sh`, written with the file tool (Q10) | `bkit-debug.md` Step 4. `context fetch --script` already reads any path. |
| Failure Path error file | `{OUTBOX_ROOT}/error.md` and `{OUTBOX}/stderr.log` under `.git/bkit-outbox/` | `{LOG_DIR}/{workflow}-error.md` and `{LOG_DIR}/{workflow}-stderr.md`, which holds only the last 20 lines of the failed command's stderr, the lines the failure comment posts; ship uses its worktree's log folder; auto uses the checkout's gitignored `.worktrees/bkit-error-auto.md` | Six workflows, the clause `workflow-error-file`, `.bkit/core/.bkit/workflows.md:807`. |
| Report header placeholders | `Failures: <integer >= 0>` in six result prompts | `Failures: <count of …>`, a declaration `steps finish` checks | The six prompts and their reports. `bkit-ship-deferred-sweep.md:117` keeps `Failures: <integer >= 0>` on purpose: its count is the `Blocking Deferrals` entries, which no count rule reads, and `steps finish` sums it as today. |
| Audit Findings tables | `\| ID \| Severity \| … \|` with no title or key | Adds a `Title` column and a `Key` column (`new` or an open row's key) | All 35 `.bkit/core/docs/templates/bkit-audit-*.md` templates; existing audit reports are not rewritten. |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Assumption:** The pre-#860 reader `parseFindings` in `.bkit/core/engine/commands/workflow/challenge.ts` still reads the task blocks the challenge prompts tell the agent to write. → If it has drifted, Task 2's challenge check refuses correct reports; Task 2's tests use a block copied from the prompt's own format to catch this.
- **Assumption:** No consumer calls `decisions compose`, `steps stub --result-file` or `issues comment --result-file` outside bkit's own workflows and prompts. → If one does, its script fails with "no such verb" or "no --result-file" after upgrade; the release notes name the removed verbs.
- **Assumption:** A run that resumes across the upgrade has at most one open decision file in the old single-file layout. → If the reader mis-reads an old file, a resumed pause asks its questions again; Task 9's old-layout test covers this.
- **Assumption:** The error and stderr files in the log folder may be committed with the run's later bookkeeping. → The error file holds the same text the failure comment already posts to the issue, and the stderr file holds only the last 20 lines of stderr, the same lines the comment posts (`tail(..., 20)` in `.bkit/core/engine/commands/workflow/issues.ts:840-841`), so committing them publishes nothing new; if a tool response ever holds a secret, it was already in the comment.
- **Assumption (build start, 2026-11-19):** The build took option A for Q3 and Q4 and the recommended option for every other question (Q1, Q2, Q5 to Q10). The owner then answered B for both (decision `958-engine-facts-go-to-status-jsonl-md-is-prose-only`); groups 8 to 10 (Tasks 27 to 37), built by a second `/bkit-build` run, move the engine's facts from the `-engine.md` file into `status.jsonl` rows. → `-engine.md` never shipped, so no reader for it is kept.
- **Q1 — How the engine knows each report's count rule:** The engine has one rule for every agent today. The question is how it learns that a plan review counts only `CRITICAL` items while verify counts gap lines, without a code rule per agent.
  - A) Each prompt's header line declares what its count is, for example `Failures: <count of items under ## CRITICAL>`. `promptHeader` already reads that template line, and `steps finish` checks the count against a closed set of three counting rules (items under `## CRITICAL`; `CRITICAL` task blocks under `## Findings Log`; lines ending `Fixable: true` or `Fixable: false` under `## Identified Gaps Log`). Verify's `Fixable` is checked against whether any counted line ends `Fixable: true`. The challenge prompts' extra rule (`PASS` = no findings, `CONCERNS` = highest severity `HIGH` or lower) is checked where `steps finish` already reads the challenge's task blocks with `parseFindings`. — The rule sits next to the prompt text it enforces, and a new agent needs no engine change unless it counts a new kind of section.
  - B) A per-agent table in `steps.ts`. — The rule moves away from the prompt, and every prompt change needs an engine change too.
  - C) No count check: keep only the `PASS` / `FAIL` rule on whatever `Failures` the agent writes. — Simplest, but a wrong count is never refused, which breaks the second Success Criterion.
  - Recommended: A) — it puts the rule where the agent reads it, and `promptHeader` already parses the line.
  - Default if unanswered: the plan assumes A.
- **Q2 — Can the engine read the audit Findings table:** The engine must print ledger rows from the report, and a ledger row needs a summary and a key. The 35 audit templates' Findings tables have `ID`, `Severity`, `Location`, `Evidence` and `Expected`, but no title and no key.
  - A) Add a `Title` column and a `Key` column to every audit template's Findings table. `Key` holds `new` for a new problem or the key of the open ledger row it matches, which the agent already decides today. — The engine reads every value it needs straight from the table, and the agent keeps its own words.
  - B) The engine checks and prints the totals only; the agent writes its ledger rows itself. — No template change, but it drops "the engine prints the ledger rows" from decision `958-audit-agent-writes-findings-once-engine-reads-report`.
  - C) The engine takes the summary from `Expected` and the key from `Location`. — No template change, but the summary reads as the fix rather than the problem, and a key from a location changes when code moves.
  - Recommended: A) — it is the only option that keeps the owner's decision whole with values the agent writes.
  - Default if unanswered: the plan assumes A.
- **Q3 — Where the pause's counts live:** The engine's facts for a decision pause (rounds run, whether the last round changed code, whether the gate is red, failing tests that also fail on `dev`, and the Try again or Decide recommendation) may not go into the orchestrator's file. The owner still needs to see them next to the questions, and a verify or holistic pause needs the "changed code" fact even when it asks no loop question, because the "move on" check reads it.
  - A) The engine writes its own file beside the orchestrator's, `build-decision-{RUN}-{K}-engine.md`. — Two `.md` files per pause, and numbers in a file meant for prose.
  - B) A `decision-counts` row in the feature's `status.jsonl`, appended by `decisions counts`, which also prints the lines the orchestrator shows the owner word for word, as with `progressLine`. — The numbers are kept, validated and written only by the engine, and the owner reads the same lines as today.
  - C) Printed lines only. — Nothing is kept, so a resumed run loses the numbers.
  - Recommended: B) — `status.jsonl` is where engine-counted facts live.
  - Owner's answer (2026-11-19): B. "numbers, status, etc should go into status.jsonl that is what it is for and engine command writes it not free form - that is the standard no? so not sure why this is even a question / we only use .md files for free form prose output and I don't think the numbers for pause, attempts etc is freeform prose?" Decision `958-engine-facts-go-to-status-jsonl-md-is-prose-only`.
- **Q4 — Where a settled decision is written:** With the orchestrator owning the decision file, an engine-written `Decision:` line there would make two writers of one file.
  - A) Every engine line goes into a `-engine.md` file and readers merge both files. — A second `.md` holding no prose, and a precedence rule between files.
  - B) Every answer is a `decision-answer` row in `status.jsonl`, appended only by `decisions apply` and `decisions pending --defer` (headless assumed Accept, gate re-run, ship's confirm, reject or deferral, the owner's item and loop answers, and the `Fix task` link). The last appended row for a question wins, and `Status` is computed on read. The orchestrator writes no `Decision:` or `Fix task:` line; it appends the owner's words as `Owner:` lines in its own file. A subagent given a decision file runs `bkit decisions answers --file=<it>` itself. — One writer per file, no precedence rule, no owner words in a shell argument.
  - C) Keep the engine writing into the orchestrator's file. — Contradicts decision `958-agent-writes-engine-counts-verbs-named-for-what-they-do`.
  - Recommended: B) — answers are status, and status rows are the engine's.
  - Owner's answer (2026-11-19): B, the same words as Q3. Decision `958-engine-facts-go-to-status-jsonl-md-is-prose-only`.
- **Q5 — Where the error file lives:** When a run stops on its Failure Path, the text that says why it stopped moves out of the hidden git folder (`.git/bkit-outbox/`). It needs a folder that exists in each workflow and that the file tool may write without a prompt.
  - A) `{LOG_DIR}/{workflow}-error.md`, with the last 20 lines of the failed command's stderr beside it as `{workflow}-stderr.md`, the same lines the failure comment posts. Ship, which holds no `LOG_DIR`, uses `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/`. Before `LOG_DIR` is held, `--error-file` is dropped, as today. `workflows fail` keeps only reading the file; the handover commit or the next bookkeeping commit carries it. — The text stays with the run's record.
  - B) `tmp/bkit-error-{FID}.md` in the checkout. — Never committed, so the record of why a run stopped is lost; and `tmp/` is not in bkit's managed `.gitignore` block, so a consumer could commit it by accident.
  - Recommended: A) — the error file is part of the run's record, like its other logs.
  - Default if unanswered: the plan assumes A.
- **Q6 — Verb names:** Every engine command whose job changes needs a name for its new job, with no alias kept.
  - A) `decisions compose` is removed; `decisions check` checks the orchestrator's file and `decisions counts` appends the `decision-counts` row. `decisions apply` gains `--answer` for the owner's answers (Q9). `steps stub` keeps its name and loses `--result-file`, `--agent` and `--invocation`, because its remaining job (copying a template into a stub) does not change. `steps verdict` loses `--result-file`. `issues comment --result-file` becomes `--report`. `ledgers findings` is new. — Each name says what the command does now; `counts` also fits a verify or holistic pause with no loop question, where the verb records only `Source changed`.
  - B) Keep `decisions compose` for the engine's counts. — "compose" would then name a verb that composes nothing the owner wrote, which the decision rules out.
  - C) Name the engine-file verb `decisions loop`. — The name misleads on a verify or holistic pause with no loop question, where the verb still writes `Source changed`.
  - Recommended: A) — it follows the owner's naming rule with the fewest new names.
  - Default if unanswered: the plan assumes A.
- **Q7 — The pass rule for the first design review:** Four review prompts say a review passes when it has no critical items. Three of them (plan review 1 and 2, scope check) have a `Failures` field, so Q1's count rule checks them. The fourth, `bkit-design-review-1`, has no `Failures` field.
  - A) Add `Failures: <count of items under ## CRITICAL>` to `bkit-design-review-1`, so the engine checks its rule too. — The engine checks it, but its `FAIL` (design not feasible) can hold zero `CRITICAL` items, which the `FAIL` needs `Failures` above 0 rule would then refuse.
  - B) Keep the rule in the prompt only. — The engine does not check it, but nothing downstream reads its verdict for this: `@bkit-design-update` applies every `CRITICAL` item whatever the verdict.
  - Recommended: B) — A would refuse a correct `FAIL`, and no route depends on this verdict's count.
  - Default if unanswered: the plan assumes B.
- **Q8 — Where `bkit-auto` writes its error file:** The auto router runs in the main checkout and never holds a feature log folder, so Q5's answer does not reach it. It needs a path outside `.git/` that no commit picks up.
  - A) `.worktrees/bkit-error-auto.md`. `.worktrees/` is in bkit's managed `.gitignore` block in every consumer (`BKIT_GITIGNORE_LINES`), and no engine code lists that folder's entries. — Always ignored, but it puts a loose file next to the worktree folders.
  - B) Add `tmp/` to bkit's managed `.gitignore` block and write `tmp/bkit-error-auto.md`. — A tidier path, but it changes every consumer's `.gitignore` on upgrade for one file.
  - C) Auto drops `--error-file` and posts no error text. — Nothing to write, but the failure comment no longer says why the route stopped.
  - Recommended: A) — it is the only option that keeps the error text and changes no consumer file.
  - Default if unanswered: the plan assumes A.
- **Q9 — Who writes the owner's answer to the loop question:** The loop question lives in the engine's `decision-counts` row, which only the engine writes, but the owner answers it in the orchestrator's session. The answer (`Try again` or `Decide`) decides whether a resumed run re-runs the gate, asks again or moves on.
  - A) The orchestrator hands the answer to the engine with `decisions apply --by=owner --answer=Q1={letter}`, and the engine appends a `decision-answer` row for `Q1`; the owner's words go on an `Owner:` line in the decision file. — Each file keeps one writer, for one more flag on an existing command.
  - B) The orchestrator writes a `Q1` holding only the `Decision:` line in its own file, and `decisions check` accepts that after step 6. — No new flag, but one question is then split across a row and a file with two writers, and `check` needs a second rule for when a `Q1` is allowed.
  - Recommended: A) — it keeps one writer per file, and the reader folds the loop answer like every other `decision-answer` row.
  - Default if unanswered: the plan assumes A.
- **Q10 — Where the debug context-fetch script goes:** When the debug workflow fetches outside evidence (logs, CI runs), the orchestrator adjusts each fetch script and hands it to the engine to run. Today it writes that script into the hidden git folder with a shell heredoc (an inline file write), which is the kind of write the issue removes. The file tool needs a place outside the git folder.
  - A) The run's log folder, `docs/plans/{YYYYMM}/logs/{FID}/context-fetch-{DEBUG_ATTEMPT}-{IDX}.sh`. — It is committed with the run's other context files, so the record shows which query fetched which evidence. A script that inlined a secret would be published, but each block comes from the tracked `.agents/context.md`, and the adjustment changes only severity, freshness, limit, query and filters.
  - B) The checkout's gitignored `.worktrees/bkit-context-fetch-{FID}-{IDX}.sh`, as Q8 does for auto. — Never committed, but loose files collect beside the worktree folders and the run's record loses the query.
  - C) Keep the heredoc and narrow the success criterion. — No change here, but the issue's criterion "No prompt or workflow tells an agent to write into `{OUTBOX}` or `.git/` with a shell command" is then not met.
  - Recommended: A) — it is the only option that meets the criterion and keeps the query with the evidence it fetched.
  - Default if unanswered: the plan assumes A.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Why not chosen |
| --- | --- |
| A `bkit steps result` command the reviewer runs to hand its findings over | A second command for one job; rejected in decision `958-agents-write-their-md-engine-only-checks`. |
| The reviewer pipes the JSON into `bkit steps stub` on standard input | Keeps the JSON and gives the three shell-less plan reviewers a shell; rejected in the same decision. |
| Keep the orchestrator's render and move the JSON out of `.git/` | The report is still written twice; rejected in the same decision. |
| A per-agent count table in `steps.ts` | The rule would live away from the prompt text that states it (Q1 B). |
| The engine appends its counted block to the orchestrator's decision file | Two writers of one file; rejected in decision `958-agent-writes-engine-counts-verbs-named-for-what-they-do`. |
| A status row in place of the error file | Rejected in decision `958-orchestrator-writes-decision-and-error-md-no-error-ledger-row`. |
| An upgrade migration that rewrites old decision files into `status.jsonl` rows | Not needed: the reader keeps the old layout readable, and old files are closed records. |
| The engine writes its pause facts and answers into a `-engine.md` file beside the decision file | Numbers and answers are not prose; rejected in decision `958-engine-facts-go-to-status-jsonl-md-is-prose-only` (Q3 A, Q4 A). |
| The orchestrator keeps writing `Source changed` and `Gate` into its own header from the engine's exit codes | The orchestrator would copy engine facts into its file, which decision `958-agent-writes-engine-counts-verbs-named-for-what-they-do` rules out (Q3). |
| `ledgers.ts` imports `parseAuditReport` from `issues.ts` | Closes the import cycle `ledgers.ts` → `issues.ts` → `tracker.ts` → `locks.ts` → `ledgers.ts`, which passes the source tests and fails only in the built CLI (knowledge row `workflow-ledgers-importing-tests-closes-a-steps-cycle`). The audit readers move to a leaf module instead. |
| Keep the debug context-fetch heredoc and narrow the success criterion | The issue's criterion would then not be met (Q10 C). |

**Recommendation for a future phase:** the orchestrator's other writes under `.git/bkit-outbox/` (`plan-answers.md`, `design-answers.md`, `issue-text.md`, `ci-evidence.json`, the audit `comment.md` and `parent-comment.md`) can move to the log folder the same way the error file does. They are file-tool writes, not shell writes, so the issue's criterion does not need them; they are listed under `Suggested Scope Expansion`, not built here.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Agents editing source files through the shell (`sed -i`, heredocs) instead of the edit tool, about 2,700 calls in 30 days | No Success Criterion, scenario row or test row needs it; issue #958 § Constraints and non-goals declares it out of scope as a prompt-following problem with no missing command. Deferral `958-agents-edit-source-files-through-the-shell`. | A follow-up issue on prompt-following. |
| Values the orchestrator holds in memory during a run | No Success Criterion, scenario row or test row needs it; issue #958 § Constraints and non-goals declares it out of scope. Deferral `958-orchestrator-held-values-move-to-engine`. | #910 — Bookkeeping: the engine keeps what the orchestrator remembers. |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| The orchestrator's other file-tool writes under `.git/bkit-outbox/`: `{OUTBOX}/plan-answers.md` (`bkit-plan.md:541`), `{OUTBOX}/design-answers.md` (`bkit-design.md:635`), `{OUTBOX}/issue-text.md` (`bkit-debug.md:370`), `{OUTBOX}/ci-evidence.json` (`bkit-debug.md:377`), the audit's `{OUTBOX_ROOT}/audit-{slug}/comment.md` and `parent-comment.md` | Plan investigation; plan reviews 1 and 2 and the scope check (out-of-scope notes); issue #958 Problem (writes inside `.git/` raise permission prompts) | Task 14's move of the error file; Task 15's move of the context-fetch script; Task 7's audit prompt edit | Needs a design decision: the same move to the log folder, as its own issue, after checking whether file-tool writes into `.git/` also prompt in auto mode. |
| Agents append to their own report with a shell heredoc or `echo >>`: `bkit-build-plan-verify.md:66-67` and `:167`, `bkit-build-challenge-1.md:110`, `bkit-build-challenge-2.md:64`, `bkit-debug-failure-diagnose.md:106` | Plan review 1 (optional finding) | Tasks 1 and 3 edit these prompts; the Narrative says agents write "with the file tool" | Fold in only by owner decision: the writes go into the log folder, not `{OUTBOX}` or `.git/`, so no Success Criterion needs them, and issue #958 § Constraints and non-goals keeps shell edits out of scope. |
| #1016 items 2-4 (`correctable` / `scope` only with `--json`; bare keys refused on a `**Ledger rows:**` line; three exit codes for a held lock) | #1016 | `.bkit/core/engine/commands/lib.ts`, `ledgers.ts`, the six workflows | Keep with #1016; item 1 is covered here. |
| M6: hand-written JSON warning records in `bkit-audit-generate.md` and `bkit-debug-failure-diagnose.md`, dropped silently when malformed (`summary.ts`) | #964 cross-check comment on #958 | Task 3 and Task 7 edit both prompts | Fold in only by owner decision; it is a second JSON hand-write of the same kind. |
| G7: JSON facts files in ship (`bkit-ship.md` around `:293`, `:706`, `:777`) | #964 cross-check comment on #958 | Ship's Failure Path in Task 14 | Keep deferred; check whether all three are on the `gh`-missing path first. |
| E5: four flags with no caller (`ledgers append --issue-operation`, `counters --request-hash`, `counters progress --since-clean`, `status invocation --configured-model/--observed-model`) | #964 cross-check comment on #958 | Task 8 removes `steps stub --invocation`, the related G5 flag | Needs a design decision; not touched by this plan. |
| M3: nine prompts forbid writing the attempt number, timestamp, invocation id or model (`steps-finish-derives` clause) | #964 cross-check comment on #958 | Prompts edited in Task 3 | Keep: those prompts are not result prompts, and the engine still derives those values at `steps finish`. |
| `PAUSE_MAX` not raised after a granted Try again, and an empty `--max=` read as 0, in the loop recommendation | `docs/deferrals.jsonl` `912-debug-loop-question-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-463` and `-464` | Task 11 moves that recommendation code into `decisions counts` | Fold in by owner decision; the moved code keeps today's behaviour otherwise. |

## Security & Privacy

None — no new routes, DB writes, secrets, or user input; the committed Failure Path files publish nothing the failure comment does not (PII row).

- [ ] **New API Route** — not applicable.
- [ ] **New DB Table/Column** — not applicable.
- [ ] **Role-Gated Mutation** — not applicable.
- [ ] **User Input** — not applicable: the new readers (`reportSection`, `parseAuditReport`, `decisionItems`, `decisions check`) parse agent-written text and refuse malformed text with an exit code; they never execute it (`docs/security.md` § Untrusted Content & Prompt Injection). No subprocess is added (§ Shell Injection).
- [ ] **PII** — not applicable: the error file holds the same text the failure comment already posts, the stderr file holds only the last 20 lines of stderr, which are the lines the comment posts (`tail(..., 20)` in `.bkit/core/engine/commands/workflow/issues.ts:840-841`), and no personal-data field is added.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added or removed. `parseMarkdownTable` (`.bkit/core/engine/shared/text.ts`) and `node:fs` cover the new readers, so `package.json` and `pnpm-lock.yaml` stay unchanged.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-18) lists `oxlint` 1.92.0 → 1.93.0, `@types/node` 24.19.2 → 26.6.6 and `vite` 6.4.5 → 8.3.8, all dev-only; none blocks this build. Toolchain: Node v24.16.0, pnpm 10.34.9. No stack CLI or backend is involved.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** every file the plan changes is readable and writable in the worktree `.worktrees/958-agents-orchestrator-write`. No user information is missing; the open questions above are the only owner inputs.
- [ ] **Project Context:** read the four 958 rows and `467-failure-error-text-through-file` in `docs/decisions.jsonl`, and the open `docs/deferrals.jsonl` rows on `decisions.ts` (`912-debug-loop-question-*`, `703-standardise-question-option-*`). `docs/knowledge.jsonl` has no row on the result path. Four knowledge rows bind the runbook: `workflow-ledgers-importing-tests-closes-a-steps-cycle` (Task 5 puts the audit readers in a leaf module, and Task 6 runs the built CLI); `instructions-store-clause-text-and-local-entries-need-hand-edits` and `renumbering-a-workflow-leaves-instructions-md-local-entries-stale` (every task that deletes or rewords a clause or a carried line edits the clause text and its `## Local Instructions` entries by hand, because `pnpm instructions:sync` never deletes a carrier line); `plan-line-anchors-are-basesha-relative-so-a-stale-plan-is-re-pointed-by-symbol-never-renumbered` (the line numbers in the runbook are relative to the base commit; a build re-points a stale one by its symbol or text). The related-issue search was unavailable, so no open blocker or prerequisite issue was checked.
- [ ] **Project Documents:** `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` are assessed through `.agents/docs.md`; the plan's test strategy follows `docs/testing.md` § Where tests live and § Which tier does a behaviour need?. Sources are in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable — no credential or env var is added.
- [ ] **Schema State:** not applicable — bkit owns no database (`docs/data-schema.md` § Overview); no ledger field changes. The run's `status.jsonl` gains the two row types `decision-counts` and `decision-answer` (Data Schema Usage).
- [ ] **Architecture & UI:** new files sit where `docs/architecture.md` § File placement puts their kind (engine code and tests under `.bkit/core/engine/`, plan logs under `docs/plans/`). No UI.
- [ ] **Observability:** not applicable — no log name, span or telemetry row is added; the Failure Path comment keeps its shape.
- [ ] **Deployments & Setup:** not applicable — no CI lane, release step or branch rule changes. The build runs `pnpm build` and lands `dist/` in the same change, as `docs/deployments.md` requires for engine edits.
- [ ] **Notifications:** not applicable — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Documentation Consultation

Index read: `.agents/docs.md` (both tables). Contract docs for this change are the doc sources `.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/prompts.md` and `.bkit/instructions.md`; the rendered `.bkit/*.md` copies are never edited.

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — new engine verbs, two new status row types and a new log file kind | `docs/architecture.md` § File placement, § Package boundaries | covered | None. The `decision-counts` and `decision-answer` rows go into the run's existing `status.jsonl`, and the debug context-fetch script and ship's `ship-owner-reason-{RUN}-{ENTRY}.md` are plan logs under `docs/plans/`, a kind the table already places; the new leaf module `audit-report.ts` sits beside its callers in `.bkit/core/engine/commands/workflow/`. |
| technology | `docs/technology.md` | yes — engine code in TypeScript, tests in Vitest | `docs/technology.md` § Stack, § Conventions | covered | None. |
| security | `docs/security.md` | yes — files the engine parses are agent-written | `docs/security.md` § Untrusted Content & Prompt Injection, § Shell Injection, § Workflow comment ownership | covered | None. The new readers parse text only and run nothing. |
| testing | `docs/testing.md` | yes — every task adds tests | `docs/testing.md` § Tiers this project has, § Where tests live, § Which tier does a behaviour need?, § Test first, the per-file table rows for `steps.test.ts`, `decisions.test.ts`, `open-decision.test.ts`, `issues.test.ts`, `ledgers.test.ts`, `workflow-shape.test.ts`, `template-shape.test.ts` | covered | The `decisions.test.ts` row names `compose`, and the new `audit-report.test.ts` has no row; Task 16 updates both. |
| data-schema | `docs/data-schema.md` | no — no database and no JSONL field change; decision and error files carry no personal data | `docs/data-schema.md` § Overview, § Private outbox records | covered | None. |
| observability | `docs/observability.md` | no — no new log, span or telemetry row | `docs/observability.md` § Command result and exit code row | covered | None. |
| deployments | `docs/deployments.md` | no — no CI, release or branch change | `docs/deployments.md` § Failure Path abort-push guard | covered | None. |
| migrations | `docs/migrations.md` | yes — checked whether a consumer file needs rewriting | `docs/migrations.md` (register) | covered | None. No migration is needed (see Breaking Changes). |
| capabilities | `docs/capabilities.md` | yes — checked for rows naming the removed verbs | `docs/capabilities.md` (text search for `compose`, `result-file`, `renderResult`, `steps stub`) | covered | None. No row names them. |
| workflow and CLI contract | `.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/jsonl.md`, `.bkit/instructions.md` | yes — the contract changes | `.bkit/core/.bkit/cli.md` lines 41, 45, 168-178, 215, 360-362, 399; `.bkit/core/.bkit/workflows.md` lines 237, 666, 807, 977, 990-993, 1000, 1005, 1006, 1030, 1138; `.bkit/core/.bkit/prompts.md` line 447; `.bkit/core/.bkit/jsonl.md` line 159 (a decision pause is open while its file is `Status: OPEN`); `.bkit/instructions.md` § Clauses (`result-path-cleared` to `stub-seed-fingerprint`, `set-failures`, `challenge-incomplete`, `workflow-error-file`, `workflow-finish`) and § Local Instructions entries 9966, 10188, 10248, 10299, 10404, 11068, 11358 | covered | Updated in Tasks 1, 3, 4, 7, 8, 13, 14 and 16; the generated region of `cli.md` is regenerated by `pnpm cli:sync` in Tasks 6, 8, 10, 11, 12 and 13. |
| design | `docs/design.md` | no — no UI | none | none | None. |
| noise / setup | `docs/noise.md`, `docs/setup.md` | no — no local-setup or noise change | none | none | None. |

## Documentation Warnings

None

## Data Schema Integration

bkit owns no database (`docs/data-schema.md` § Overview). The change touches files, not a schema: agent reports and decision files under `docs/plans/{YYYYMM}/logs/{FID}/`, and the rows `ledgers findings` prints for an existing `docs/failures.jsonl` append.

### Data Schema Usage

- **Input (Read):** `docs/failures.jsonl` rows through `bkit ledgers query --ledger=failures` (the audit agent's existing open-row lookup); `status.jsonl` rows through `loopProgress` for `decisions counts`; the `decision-counts` and `decision-answer` rows naming a decision file, through `parseStatusRows`, for every decision reader.
- **Output (Write):** `docs/failures.jsonl` rows the audit agent appends with `bkit ledgers append`, from the `ledgerRows` that `ledgers findings` prints. Their fields (`key`, `severity`, `summary`, `description`, `references`, `status`) are unchanged.
- **Output (Write), `status.jsonl`:** `decision-counts` `{type, workflow, at, file, sourceChanged?, gate?, loop?, baseCheck?}`, appended only by `decisions counts`; `decision-answer` `{type, workflow, at, file, q, answer, by, assumed?, rejected?, deferred?, fixTask?, reasonFile?, runtime?}`, appended only by `decisions apply` and `decisions pending --defer`. `status row` refuses both types. The last appended row wins per file (`decision-counts`) and per file and question (`decision-answer`); `at` is never compared.

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A report header declares how its count is made | `.bkit/core/engine/commands/workflow/steps.ts` | `grep -n 'promptHeader\|integer: true\|<integer' steps.ts`; `grep -ln '^Failures: <integer' .bkit/core/prompts/*.md`; `docs/capabilities.md` text search | `promptHeader` — reads each template header line and marks `<integer` fields; missing a count rule | EXTEND | `promptHeader` also reads `<count of …>` into one of three known count rules and refuses an unknown one. |
| `steps finish` checks a count and a verdict against the report body | `.bkit/core/engine/commands/workflow/steps.ts` | `grep -n 'failuresProblem\|readHeader\|parseFindings\|reask' steps.ts`; `grep -n 'export function' challenge.ts` | `readHeader`, `failuresProblem`, the `reask` / `problem` output of `finish`, and `parseFindings` in `challenge.ts`; missing the count comparison | EXTEND | `finish` compares the declared count to the counted section and prints `reask` with an actionable `problem` on exit 6. |
| Read one `##` section of a report | `.bkit/core/engine/commands/workflow/challenge.ts` | `grep -rn 'function findingsLog\|function sectionOf' .bkit/core/engine --include='*.ts'` | `findingsLog` in `challenge.ts` (the `## Findings Log` section only); `sectionOf` in `tools/instructions-sources.ts` (an authoring tool, outside `commands/`) | EXTEND | `findingsLog` takes the heading as a parameter, so `## CRITICAL` and `## Identified Gaps Log` reuse it; `parseFindings` keeps calling it for `## Findings Log`. |
| Guard: every result prompt's header is one `steps finish` reads | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` | `ls audits/workflows`; `grep -n '  it(' verdict-vocabulary.test.ts` | `verdict-vocabulary.test.ts` — already reads each prompt's `Verdict:` declaration; missing the other header fields | EXTEND | Adds tests that the six count-checked prompts declare known count rules, that no prompt leaves an incomplete finding out of `Failures`, and that every judgment field a result prompt names is a header line `promptHeader` reads. |
| Guard: no prompt or workflow names a removed path or verb, or writes a file with a shell heredoc | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | `grep -n 'removed sub-plan flag\|unknownCalls' workflow-shape.test.ts`; `counter-prose-audit.test.ts` and `runtime-prose-audit.test.ts` headers read; `grep -n 'cat > \|<<' .bkit/core/workflows/*.md .bkit/core/prompts/*.md` (one hit, `bkit-debug.md:501`) | `workflow-shape.test.ts` "engine calls" (unknown verbs and flags; `no workflow names a removed sub-plan flag`); the two prose audits guard other rules | EXTEND | Adds forbidden-string tests beside the removed-flag test, covering prompts as well as workflows, plus the re-ask and heredoc checks. |
| Guard: every audit template's Findings table has `Title` and `Key` | `.bkit/core/engine/audits/templates/template-shape.test.ts` | `grep -n '  it(\|audit template' template-shape.test.ts`; `docs/testing.md` row for the file | `template-shape.test.ts` — already checks each audit template's `Step 1 — Previous Run` and shared-rule lines; missing the Findings table columns | EXTEND | Adds a test that each `bkit-audit-*.md` Findings table carries the `Title` and `Key` columns. |
| Read the audit report's Findings table | `.bkit/core/engine/commands/workflow/audit-report.ts` | `grep -n -e parseAuditResult -e auditTotals -e auditEntries -e auditLedgerRows issues.ts`; `grep -rn 'export function parseMarkdownTable' .bkit/core/engine/shared`; `grep -n 'from "\./' issues.ts tracker.ts locks.ts ledgers.ts` (import edges `issues.ts:47` → `tracker.ts`, `tracker.ts:28` → `locks.ts`, `locks.ts:38` → `ledgers.ts`) | `parseAuditResult` (reads the JSON), `auditTotals`, `auditEntries`, `auditLedgerRows`, `auditFindingsLine` in `issues.ts`; `ledgerKeys` in `steps.ts`; `parseMarkdownTable` in `shared/text.ts` | NEW | Reason (b): extending `issues.ts` breaks its callers' load order. `ledgers findings` in `ledgers.ts` needs these readers, and `ledgers.ts` importing `issues.ts` closes the cycle `ledgers.ts` → `issues.ts` → `tracker.ts` → `locks.ts` → `ledgers.ts`, which fails only in the built CLI (knowledge row `workflow-ledgers-importing-tests-closes-a-steps-cycle`). The leaf module imports only `../lib.js`, `../../shared/text.js` and `../../ledgers/telemetry.js`; the audit block moves into it unchanged, `parseAuditResult` becomes `parseAuditReport`, and `issues.ts` and `ledgers.ts` both import it. |
| Tests of the audit report reader | `.bkit/core/engine/commands/workflow/audit-report.test.ts` | `ls .bkit/core/engine/commands/workflow/*.test.ts`; `docs/testing.md` § Where tests live (colocated `*.test.ts`) | `issues.test.ts` (tests `issues.ts`, which no longer holds the reader) | NEW | Reason (a): the search finds no test file for the new `audit-report.ts`, and `docs/testing.md` § Where tests live colocates each module's tests. |
| Print the audit totals and ledger rows | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n 'name: "' ledgers.ts`; `grep -n 'ledgerKeys' steps.ts issues.ts` | the `ledgers` noun (append, query, check, triage …); `ledgerKeys` in `steps.ts`; `auditLedgerRows` in `issues.ts` | EXTEND | Adds the `findings` verb to the `ledgers` noun, reading through `audit-report.ts`; `ledgerKeys` moves from `steps.ts` to `audit-report.ts`. |
| Post the audit comment from the report | `.bkit/core/engine/commands/workflow/issues.ts` | `grep -n 'result-file\|auditHeaderFields' issues.ts` | `issues comment --kind=audit --result-file` | EXTEND | `--result-file` becomes `--report`, read through `parseAuditReport` from `audit-report.ts`. |
| Audit Findings tables carry title and key | `.bkit/core/docs/templates/bkit-audit-*.md` | `grep -l '^\| ID \| Severity' .bkit/core/docs/templates/bkit-audit-*.md` (35 files) | the 35 templates' Findings tables | EXTEND | Each table gains `Title` and `Key` columns. |
| Read a decision as the orchestrator's file plus its `status.jsonl` rows | `.bkit/core/engine/commands/workflow/open-decision.ts` | `grep -rln 'parseDecisionItems\|openDecision\|gateRerun\|skipProblem' .bkit/core/engine --include='*.ts'`; `grep -n 'build-decision-' workflows.ts` | `parseDecisionItems`, `decisionHeader`, `openDecision`, `gateRerun`, `skipProblem`; `statusOf` in `decisions.ts`; callers `status.ts:889-891` (`gateRerun`), `steps.ts:1113` (`continueCheck` → `skipProblem`) and the `decisionFiles` listing at `workflows.ts:1805-1812` | EXTEND | `decisionItems` and `decisionFileHeader` fold the file's `decision-counts` and `decision-answer` rows over the parsed questions; every caller moves to them, and `Status` comes from `statusOf` on the folded items, with a loop answered `Try again` settling the pause. `parseStatusRows` moves to `.bkit/core/engine/ledgers/status.ts` so the reader keeps no command import. |
| Check the orchestrator's decision file | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -n 'name: "' decisions.ts`; `grep -n 'letterAt\|composeItems' decisions.ts` | `compose` (validates items while writing them), `parseDecisionItems` | EXTEND | `compose` is replaced by `check`, which reads the file instead of writing it; compose's item rules move into one helper both verbs call until Task 13 deletes `compose`. |
| Write the engine's pause counts | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -n 'loopProgress\|readBaseCheck\|FIXED_EFFECTS\|--header' decisions.ts counters.ts`; `grep -n 'Source changed\|Gate=FAIL' .bkit/core/workflows/bkit-build.md` | `compose --loop` (attempt line, `## Progress`, base check, loop question, recommendation) and `compose --header` (the relayed `Source changed` and `Gate` lines) | EXTEND | The loop half of `compose` becomes the `counts` verb, which appends a `decision-counts` row with `Source changed`, `Gate` and, with `--loop`, the loop block, and prints the `show` lines. |
| Engine-recorded answers | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -n 'addUnder\|by=headless\|--confirm' decisions.ts` | `apply` (`--by=headless`, `owner` or `rerun`) writing into the decision file | EXTEND | `apply` appends `decision-answer` rows; `--by=owner` takes `--answer=Q{n}={letter}` and `--fix-task`; `answers` prints the fold, and the agent given a decision file runs it, as agents run `ledgers query` for gotchas. |
| Failure Path error file outside `.git/` | `.bkit/instructions.md` | `grep -n 'error.md\|stderr.log' .bkit/core/workflows/*.md .bkit/instructions.md .bkit/core/.bkit/*.md` | clause `workflow-error-file` (five workflows) and the inline line in `bkit-auto.md`; `workflows fail --error-file` already reads any path | EXTEND | The clause names the log-folder path, and each workflow's `workflows fail` command line names it; the engine is unchanged. |
| Debug context-fetch script outside `.git/` | `.bkit/core/workflows/bkit-debug.md` | `grep -rn 'context-fetch-\|BKIT_CONTEXT_FETCH_BLOCK' .bkit/core/workflows .bkit/core/prompts .bkit/instructions.md`; `grep -n 'flags.script' .bkit/core/engine/commands/workflow/context.ts` | the Step 4 heredoc at `bkit-debug.md:500-503`; `context fetch --script` resolves and runs any path (`context.ts:2037-2083`) | EXTEND | The step writes the script with the file tool into the log folder; the engine is unchanged. |

## Architecture & Component Changes

Every change follows a `Reuse Inventory` row. The plan adds one source file and its test, `audit-report.ts` and `audit-report.test.ts`, each under a `NEW` row. The new runtime files, ship's `ship-owner-reason-{RUN}-{ENTRY}.md` and the debug `context-fetch-{DEBUG_ATTEMPT}-{IDX}.sh`, are plan logs under `docs/plans/{YYYYMM}/logs/{FID}/`, which `docs/architecture.md` § File placement already places; the engine's pause facts and answers are rows in the run's existing `status.jsonl`.

**Ledger rows:** `958-report-header-declares-its-count-rule`, `958-audit-findings-table-title-and-key-columns`, `958-engine-facts-go-to-status-jsonl-md-is-prose-only`, `958-failure-error-file-in-log-folder`, `958-auto-error-file-in-worktrees-folder`, `958-verb-names-decisions-check-loop-ledgers-findings`, `958-design-review-1-pass-rule-stays-in-prompt`, `958-agents-edit-source-files-through-the-shell`, `958-orchestrator-held-values-move-to-engine`, `958-audit-report-reader-in-leaf-module`, `958-loop-answer-written-by-decisions-apply`, `958-debug-context-fetch-script-in-log-folder`

### Database Migrations

None — bkit owns no database.

### Engine: report checks

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** the file exists (2623 lines).
- `promptHeader`: a header placeholder `<count of items under ## CRITICAL>`, `<count of CRITICAL task blocks under ## Findings Log>` or `<count of Fixable lines under ## Identified Gaps Log>` sets the field's count rule; any other `<count of …>` is a usage error naming the prompt and the line.
- `finish`: for each `--agent` whose header has a count rule, count the named section of the artifact and compare it to the field; the verify rule counts only lines ending `Fixable: true` or `Fixable: false`; for verify, compare `Fixable` to whether any counted line ends `Fixable: true`; for `bkit-build-challenge-*`, check the verdict against the highest severity `parseFindings` returns, and hand back a block `parseFindings` cannot read. A mismatch exits 6 (`EXIT_INVALID`) and prints `reask` plus a `problem` that names the field, the declared value and the counted value. With several agents, each agent's count is checked before the sum. `failuresProblem` stays.
- `continueCheck`: reads the decision through the reader, so `skipProblem` sees `Source changed`, `Gate` and the loop answer from the decision file's rows.
- Remove the `// stub --result-file` section: `DERIVED_FIELDS`, `AUDIT_AGENT`, `withFingerprint`, `fingerprintOf`, `ledgerKeys` (moved to `audit-report.ts`), `renderAudit`, `renderResult`, `readResult`; and `FINGERPRINT`, `artifactFingerprint`, `fingerprintProblem` with their calls in `readHeader` and `steps verdict`.
- `steps stub`: remove the `--agent`, `--result-file` and `--invocation` flags and their branch; the copy mode (`--from`, `--strip-header`, `STUB_HEADER`) is unchanged. `steps verdict`: remove `--result-file`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/challenge.ts`

- **Existence Check:** the file exists (797 lines).
- `findingsLog(text)` becomes `reportSection(text, heading)`; `parseFindings` passes `## Findings Log`.
- Remove `structuredFindings` and `renderFindingsLog` (only `steps.ts`'s render path calls them).
- `acceptedLocations`: read each decision through the reader, which folds the file's rows.

### Engine: audit report

#### [NEW] `.bkit/core/engine/commands/workflow/audit-report.ts`

- **Reuse reason:** (b) — `ledgers.ts` importing the readers from `issues.ts` closes the import cycle `ledgers.ts` → `issues.ts` → `tracker.ts` → `locks.ts` → `ledgers.ts`, which breaks the built CLI's module load (`Reuse Inventory`, row "Read the audit report's Findings table").
- Holds the audit block moved from `issues.ts` (`AuditSeverity`, `AuditFinding`, `AuditResult`, `AuditEntry`, `HeldRow`, `parseAuditResult` until Task 8 deletes it, `auditTotals`, `auditFindingsLine`, `auditEntries`, `auditLedgerRows`, `auditHeaderFields`) and `ledgerKeys` moved from `steps.ts`. Imports only `../lib.js`, `../../shared/text.js` and `../../ledgers/telemetry.js`.
- `parseAuditResult` becomes `parseAuditReport(text, slug)`: it reads the `## Findings` table with `parseMarkdownTable`, needs `ID`, `Severity`, `Title`, `Location` and `Key` per row, and refuses an empty or unknown `Severity`, an empty `Title` and a `Key` that is neither `new` nor an `audit-{slug}-` key, naming the row's `ID`. A `None` table is zero findings.

#### [NEW] `.bkit/core/engine/commands/workflow/audit-report.test.ts`

- **Reuse reason:** (a) — no test file exists for the new module (`Reuse Inventory`, row "Tests of the audit report reader").
- The `parseAuditReport` tests of Task 5.

#### [MODIFY] `.bkit/core/engine/commands/workflow/issues.ts`

- **Existence Check:** the file exists (1362 lines).
- The audit block moves to `audit-report.ts`; `issues.ts` imports what `issues comment` uses from there.
- `issues comment --kind=audit`: `--result-file` becomes `--report`; the `Findings` field comes from `auditTotals` over the parsed report.

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`

- **Existence Check:** the file exists (2717 lines).
- New verb `ledgers findings --report=<file> [--slug=<slug>]`: prints `ids`, `totals` and `ledgerRows` from `parseAuditReport` in `audit-report.ts`, never importing `issues.ts`; exit 6 on a malformed table, exit 2 on a missing file.

#### [MODIFY] `.bkit/core/docs/templates/bkit-audit-*.md` (35 files)

- **Existence Check:** 35 templates, each with a `| ID | Severity |` Findings table.
- Add a `Title` column after `Severity` and a `Key` column at the end of each Findings table, with a one-line placeholder rule (`Key` = `new`, or the matching open `docs/failures.jsonl` row's key).

### Engine: decision files

#### [MODIFY] `.bkit/core/engine/ledgers/status.ts`

- **Existence Check:** the file exists and imports only node modules and `../shared/json.js`.
- Adds `parseStatusLines(text, label)`, `ENGINE_ROW_TYPES = new Set(["decision-counts", "decision-answer"])` and the `DecisionCountsRow` and `DecisionAnswerRow` types; it still imports nothing from `commands/`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/open-decision.ts`

- **Existence Check:** the file exists (251 lines).
- Add `decisionRows(read, rel)`: the `decision-counts` and `decision-answer` rows of `join(dirname(rel), "status.jsonl")` that name `rel`, read through the same `read` callback (so git-ref reads keep working). The line parsing moves to `.bkit/core/engine/ledgers/status.ts` as `parseStatusLines(text, label)`, which returns the rows or the first bad line and imports nothing from `commands/` (`commands/lib.ts` already imports `ledgers/status.ts`, so a `CommandError` import there would close a cycle); `parseStatusRows` in `status.ts` wraps it and keeps its exit 3.
- `decisionItems(read, rel)` and `decisionFileHeader(read, rel)`: parse the orchestrator's questions; build item `n=1` from the last `decision-counts` row's `loop`; take `Source changed` and `Gate` from that row; set each item's `decision`, `assumed`, `rejected`, `deferred` and `fixTask` from the last appended `decision-answer` row for its `q`, never comparing `at`. In-file `Decision:`, `Fix task:`, `Rejected:`, `Deferred:`, `Status`, `Source changed`, `Gate` and `## Progress` lines are read only for an old file: one whose header carries a `Status:` line, whatever rows name it; a row overrides only the question it names. `decisionHeader`, `undecidedBesidesLoop`, `gateRerun`, `skipProblem` and `openDecision` read through them.
- `Status` comes from the folded items: `OPEN` while a question has no answer, and `OPEN` for a file with no readable question; a loop answered `Try again` settles the pause; then `ASSUMED` while an assumed `Accept` remains; else `DECIDED`. An old file's written `Status:` line is read as written. `openDecision` also returns `questions` (the count of items), which `status resume` prints, so a resume can route a file with none back to Decision Pause step 2.

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.ts`

- **Existence Check:** the file exists (720 lines).
- Remove `compose`, `composeItems` and `itemLines`, and the `compose` wording in the file's header comment (line 1). Add `check --file=<decision file>`: refuses a question with no lettered option lines, a duplicate number, a `Q1` when the file's last `decision-counts` row has a loop, a hard blocker with a recommendation, and any line starting `Decision:`, `Fix task:`, `Rejected:` or `Deferred:`, each naming the question (exit 6).
- `counts --decision=<decision file> [--source-changed=true|false] [--base-check=<file>] [--loop=tests|verify|holistic --file=<status.jsonl> --attempt= --max= [--group=]]`: reads the decision file (exit 2 when it is missing) to count its questions, then appends one `decision-counts` row to the `status.jsonl` in that file's folder (exit 3 when it is missing) holding `sourceChanged`, `gate: "FAIL"` when `--base-check` is given, and, with `--loop`, the attempt and max, the progress numbers from `loopProgress`, the base check from `readBaseCheck` and the loop question with the engine's recommendation. It prints `{file, questions, loopRecommended, show}`, where `show` holds the lines the owner is shown. No `.md` file is written.
- `apply` (`--by=headless`, `rerun`, `owner`) appends one `decision-answer` row per question it settles and never writes a `.md` file; `--by=owner` takes repeatable `--answer=Q{n}={letter}` and `--fix-task=Q{n}={task}`, and `--reason-file` only with `--confirm` or `--reject`; `--reason` is removed. `--by=headless` exits non-zero on a file with no readable question. `pending --defer` appends a row repeating the answer with `deferred: "needs-decision"`. New verb `answers --file=<decision file>` prints the folded answers and writes nothing. `statusOf` computes `Status` on read.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`, `summary-findings.ts`, `tasks.ts`

- **Existence Check:** each file exists and calls `parseDecisionItems` on one decision file's text.
- Each call reads through `decisionItems`, so the summary, the challenge-finding acceptance check and `tasks tick --decision` see the answers the rows record; `summary.ts` counts only `workflow: "build"` answer rows as build answers.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** the file exists; the summary's `decisionFiles` listing is at lines 1805-1812.
- The listing reads each pause once, through `decisionItems`, with no `isEngineFile` filter.

#### [MODIFY] `.bkit/core/engine/commands/workflow/status.ts`

- **Existence Check:** the file exists; `status resume` passes the decision file's text to `gateRerun` at lines 889-891.
- It reads the pause through the reader, so a red-gate pause whose facts are rows re-runs its gate on resume; `status row` refuses the `decision-counts` and `decision-answer` types.

### Engine: generated docs and build output

#### [MODIFY] `.bkit/core/.bkit/cli.md` and `dist/`

- `pnpm cli:sync` regenerates the verb tables from the registry in every task that changes the registry (Tasks 6, 8, 10, 11, 12, 13), so `.bkit/core/engine/tools/cli-doc.test.ts` passes at every group gate; `pnpm build` regenerates `dist/` in every task that changes engine source. Both land in the same change.

### Guard tests

#### [MODIFY] `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts`

- **Existence Check:** the file exists and reads each prompt's `Verdict:` declaration.
- Adds the count-rule guard and the incomplete-finding wording guard (Task 1) and the judgment-field guard for #1016 item 1 (Task 3).

#### [MODIFY] `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

- **Existence Check:** the file exists and holds the "engine calls" tests.
- Adds the forbidden-string tests of Tasks 3, 4, 7, 13 and 14, the re-ask test of Task 4 and the heredoc test of Task 15.

#### [MODIFY] `.bkit/core/engine/audits/templates/template-shape.test.ts`

- **Existence Check:** the file exists and checks the audit templates.
- Adds the Findings-table `Title` and `Key` guard (Task 7).

#### [MODIFY] `.bkit/core/engine/render/__snapshots__/bkit-{design,plan,build,debug,ship}.none.txt`

- **Existence Check:** the five baselines exist; `.bkit/core/engine/render/trackers.test.ts:403-420` byte-matches each with `toMatchFileSnapshot`.
- Regenerated with `vitest -u` on `trackers.test.ts` and reviewed as a diff in each task whose workflow edit changes them (Tasks 4, 13, 14, 15). A regenerated baseline is never a `TEST FIRST` test.

### Prompts, workflows and clauses

#### [MODIFY] `.bkit/instructions.md`

- Delete the clauses `result-path-cleared`, `structured-result-file`, `structured-result-render`, `structured-supply-only` and `stub-seed-fingerprint`.
- `set-failures`: `Failures` = every top-level item under `## CRITICAL`, or every `CRITICAL` task block under `## Findings Log`; the old wording moves to the clause's `retired` block.
- `challenge-incomplete`: the agent fills every field of each task block, and `steps finish` hands back a block with an empty field; the old wording moves to `retired`.
- `workflow-error-file`: name `{LOG_DIR}/{workflow}-error.md` and `{LOG_DIR}/{workflow}-stderr.md`, the stderr file holding only the last 20 lines of the failed command's stderr, the lines the failure comment posts, dropping `--error-file` while `LOG_DIR` is not held; the old wording moves to `retired`.
- `workflow-finish`: the re-ask passes the printed `problem` ("Your prior output '<reask.artifact>' was refused: <problem>. Fix that in the file. Do not redo work."); the old wording moves to `retired`.
- `pnpm instructions:sync` writes the clause changes into their carriers. It never edits a clause's own text and never deletes a carrier line, so each task edits the clause text, deletes the carrier lines of a deleted clause and removes or rewrites the `## Local Instructions` entries for lines it removes (9966, 10188, 10248, 10299, 10404, 11068, 11358) by hand.

#### [MODIFY] `.bkit/core/prompts/` (13 prompts)

- The ten result prompts lose the clause lines above. The six with `Failures` declare their count rule; plan review and scope-check placeholders under `## CRITICAL` say one top-level `-` item per finding; the verify `## Identified Gaps Log` placeholder says the count line is optional and only lines ending `Fixable: true` or `Fixable: false` are counted.
- `bkit-design-organise.md`, `bkit-design-update.md`, `bkit-plan-update.md` lose `stub-seed-fingerprint`.
- `bkit-audit-generate.md`: remove the "Serialize the findings once" bullet; after the report is complete, run `bkit ledgers findings --report=<Create>` and append its printed `ledgerRows`; post with `issues comment --kind=audit --report=<Create>`.
- `bkit-ship-deferred-sweep.md` keeps `Failures: <integer >= 0>`.

#### [MODIFY] `.bkit/core/workflows/` (6 workflows)

- `bkit-plan.md`, `bkit-design.md`, `bkit-build.md`, `bkit-debug.md`: delete the 12 `Result:` lines, the 12 render commands, the render prose (`bkit-build.md:1111`) and the `result-path-cleared` lines.
- `bkit-build.md` Decision Pause: step 2 writes the decision file's header (`Question`, `From`, `Pause step`, `Plan`, `Group`, the attempt lines) and its questions with the file tool, then runs `decisions counts --decision=…` on a verify, holistic or tests pause, then `decisions check`, re-running both once after fixing a refusal; step 4 shows the `show` lines `decisions counts` printed, word for word, first; step 5 records each `Fix now` item's answer and task with `decisions apply --by=owner --answer=Q{n}={letter} --fix-task=Q{n}={task}` right after the task block is written; step 6 records the other answers with one `decisions apply --by=owner --answer=Q{n}={letter}` call and appends the owner's words as `Owner ({date}):` and a `> ` quote; step 8's handover and the subagent `Read` lines name the decision file only. The Open decision resume routes a file with `questions` = 0 to Decision Pause step 2, which rewrites the file and runs `decisions counts` and `decisions check`. The Decision Pause gate box names `decisions check` and `decisions counts`.
- `bkit-ship.md` confirm and reject: the owner's words go to `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md` with the file tool, passed as `--reason-file`.
- `bkit-build-plan-verify.md`, `bkit-build-plan-gaps-remediate.md`, `bkit-debug-failure-diagnose.md`: an agent given a decision file runs `bkit decisions answers --file=<the decision file>` and follows what it prints, plus the file's `Owner:` lines.
- `bkit-debug.md` Step 4: the context-fetch script is written with the file tool into the log folder (Q10).
- All six: the Failure Path error file per `958-failure-error-file-in-log-folder`, in the clause and in each `workflows fail` / `issues comment` command line; `bkit-auto.md` uses `.worktrees/bkit-error-auto.md` (Q8).

#### [MODIFY] `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/jsonl.md`, `docs/testing.md`

- Contract text at the lines listed in `Documentation Consultation`.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `{OUTBOX}/*-result.json` and the audit result JSON | The agent's own `.md` report, checked by `steps finish` and `ledgers findings` | DELETE | Decisions `958-agents-write-their-md-engine-only-checks` and `958-audit-agent-writes-findings-once-engine-reads-report`. |
| `renderResult`, `renderAudit`, `readResult`, `DERIVED_FIELDS`, `AUDIT_AGENT` in `.bkit/core/engine/commands/workflow/steps.ts` | The count check in `finish` | DELETE | No caller remains (Task 8). |
| `FINGERPRINT`, `artifactFingerprint`, `fingerprintProblem`, `withFingerprint`, `fingerprintOf` in `.bkit/core/engine/commands/workflow/steps.ts`; clause `stub-seed-fingerprint` in `.bkit/instructions.md` | None | DELETE | A fingerprint only guarded an engine-rendered body; agents now write the whole file. |
| `steps stub --result-file --agent --invocation`, `steps verdict --result-file` | None | DELETE | No caller remains. |
| `structuredFindings`, `renderFindingsLog` in `.bkit/core/engine/commands/workflow/challenge.ts` | `parseFindings` over the agent's task blocks | DELETE | Only the render path called them. |
| `parseAuditResult` in `.bkit/core/engine/commands/workflow/issues.ts`; `issues comment --result-file` | `parseAuditReport`; `issues comment --report` | DELETE | The report is the only source. |
| `decisions compose`, `composeItems`, `itemLines` in `.bkit/core/engine/commands/workflow/decisions.ts`; `{OUTBOX}/decision-items.json` | `decisions check`, `decisions counts` | DELETE | Decision `958-orchestrator-writes-decision-and-error-md-no-error-ledger-row`. |
| `Decision:` and `Status` lines the engine wrote into the orchestrator's decision file, and the `Source changed` and `Gate` header lines the orchestrator relayed through `compose --header` | `decision-counts` and `decision-answer` rows in `status.jsonl`; `Status` computed on read | DELETE | One writer per file; numbers are not prose (`958-engine-facts-go-to-status-jsonl-md-is-prose-only`). Old files stay readable when their header carries `Status:` whatever rows name them, which is reading support, not a second way to write. |
| `build-decision-{RUN}-{K}-engine.md`, `build-owner-reason-{RUN}-{DECISION}.md`; `engineSibling`, `isEngineFile`, `mergeItems`, `mergeHeader`, `TAKEN_UNASKED` in `.bkit/core/engine/commands/workflow/open-decision.ts`; `engineStub`, `engineWith`, `decisions counts --out`, `decisions apply --reason` in `.bkit/core/engine/commands/workflow/decisions.ts` | The rows; `Owner:` lines in the decision file; `--reason-file` with `--confirm` / `--reject` | DELETE | Never shipped; Tasks 27 to 36. |
| The audit block in `.bkit/core/engine/commands/workflow/issues.ts` and `ledgerKeys` in `.bkit/core/engine/commands/workflow/steps.ts` | The same code in `.bkit/core/engine/commands/workflow/audit-report.ts` | DELETE | Moved, not copied: one home that `issues.ts` and `ledgers.ts` both import without a cycle (Task 5). |
| `parseAuditResult` and its JSON types in `.bkit/core/engine/commands/workflow/audit-report.ts` (moved there from `issues.ts` in Task 5) | `parseAuditReport` in the same file, which reads the report's Findings table | DELETE | No caller remains once Task 6 posts from `--report` and Task 8 removes `renderAudit` (Task 8). |
| `{OUTBOX}/context-fetch-{IDX}.sh` and its heredoc in `.bkit/core/workflows/bkit-debug.md` | `docs/plans/{YYYYMM}/logs/{FID}/context-fetch-{DEBUG_ATTEMPT}-{IDX}.sh`, written with the file tool | DELETE | Decision `958-debug-context-fetch-script-in-log-folder` (Task 15). |
| Clauses `result-path-cleared`, `structured-result-file`, `structured-result-render`, `structured-supply-only` in `.bkit/instructions.md` | None | DELETE | The text they carried asks for the second copy. |
| `{OUTBOX_ROOT}/error.md`, `{OUTBOX}/stderr.log` | `{LOG_DIR}/{workflow}-error.md`, `{LOG_DIR}/{workflow}-stderr.md` (only the last 20 lines of the failed command's stderr, the lines the failure comment posts) | DELETE | Decision `958-failure-error-file-in-log-folder`. |
| `describe("bkit steps stub --result-file")` in `.bkit/core/engine/commands/workflow/steps.test.ts`, `describe("structured challenge findings")` in `.bkit/core/engine/commands/workflow/challenge.test.ts`, the `compose` tests in `.bkit/core/engine/commands/workflow/decisions.test.ts` | The new check, reader and `counts` tests | DELETE | They test removed code; the `compose --loop` and `--base-check` cases move to `decisions counts`. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | None — no new gotcha is known before the build. |
| `docs/decisions.jsonl` | The eleven decision keys on the `**Ledger rows:**` line, written by the plan steps (four of them re-written with the same key by the review merge). |
| `docs/deferrals.jsonl` | The two `Exempt` rows on the `**Ledger rows:**` line, one per `Out of Scope` row. |
| `docs/architecture.md` | None — no topology change; the new rows go into the run's existing `status.jsonl`, and ship's owner-reason file is a plan log the table already places. |
| `docs/technology.md` | None. |
| `docs/data-schema.md` | None — no store or field change. |
| `docs/design.md` | None — no UI. |
| `docs/testing.md` | The per-file rows for `steps.test.ts`, `decisions.test.ts` (`check` / `counts` / `apply` / `skip` / `pending`), `open-decision.test.ts` (the reader), `issues.test.ts`, the new `audit-report.test.ts`, `ledgers.test.ts` (`findings`), `status.test.ts`, `workflows.test.ts`, `workflow-shape.test.ts`, `verdict-vocabulary.test.ts`, `template-shape.test.ts` (Task 16); the rows for `decisions.test.ts` (rows, `answers`, the four refused answer lines), `open-decision.test.ts` (the row fold), `status.test.ts`, `tasks.test.ts`, `workflow-shape.test.ts`, `audit-report.test.ts` (Tasks 21-22) and `workflows.test.ts` (Tasks 23 and 26) (Task 37). |
| `docs/observability.md` | None — no new log name or span. |
| `.bkit/core/.bkit/cli.md` | The generated region is regenerated by `pnpm cli:sync` in Tasks 6, 8, 10, 11, 12 and 13; Task 16 rewrites the hand text at lines 41 and 45 (`{OUTBOX}` contents), 168-178 (decisions table), 215, 360-362 and 399. |
| `.bkit/core/.bkit/workflows.md` | Lines 237, 666, 977, 990-993, 1000, 1005, 1006, 1030 and 1138: result path, decision pause and its rows; line 807: Failure Path text (Tasks 14, 16); the status event table gains `decision-counts` and `decision-answer` (Task 37). |
| `.bkit/core/.bkit/prompts.md` | Line 447: the result-file note (Task 16). |
| `.bkit/core/.bkit/jsonl.md` | Line 159: a decision pause is open while its computed `Status` is `OPEN` (Task 16). |
| `.bkit/instructions.md` | Clauses deleted and edited, and their `## Local Instructions` entries, by hand (Tasks 1, 3, 4, 7, 8, 13, 14); `pnpm instructions:sync`. |
| `docs/migrations.md` | None — no consumer file is rewritten. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | bkit owns no database. |
| **Code** | `git revert` of the change's commits | `git revert {COMMIT}`. A consumer that already upgraded runs `bkit upgrade` from the reverted release. A decision file written under the new layout carries no answers or counts of its own, and the old engine does not read the rows, so revert before a paused build resumes. |
| **Risk window** | A build paused across the upgrade | The reader reads old files, so the forward window is safe; the reverse window is the note above. |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: the engine's checks first, so every report the agents write from Group 1 on is checked; then the audit agent, so the JSON path has no caller left before Task 8 removes it; then the decision files; then the Failure Path file and the docs. Each group ends with both word totals at or below their ceilings, and the group's last word-cutting task runs `pnpm bkit:text:ceiling lower`, so `pnpm bkit:text:ceiling check` passes at every group gate. No task runs `raise`. Engine tasks rebuild `dist/` with `pnpm build` in the same task. Every task that changes the command registry runs `pnpm cli:sync`, so `.bkit/core/engine/tools/cli-doc.test.ts` passes at every group gate. Every task that edits a workflow regenerates the render baselines it changes with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u` and reviews their diff. Every task that deletes or rewords a clause or a carried line edits the clause text and its `## Local Instructions` entries by hand, and ends with `.bkit/core/engine/tools/instructions-coverage.test.ts`, `instructions.test.ts` and `instructions-sources.test.ts` passing.

Integration advice (not a gate): one PR for all tasks is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Reports are checked, not rendered

Source files: `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/instructions.md`, the ten result prompts in `.bkit/core/prompts/`, `.bkit/core/workflows/bkit-plan.md`, `bkit-design.md`, `bkit-build.md`, `bkit-debug.md`, the render baselines in `.bkit/core/engine/render/__snapshots__/`, `dist/`; tests in `steps.test.ts`, `verdict-vocabulary.test.ts`, `workflow-shape.test.ts`.

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Declare each report's count rule in its prompt header, and read it in `promptHeader`
  - **UPDATE:** `promptHeader` in `.bkit/core/engine/commands/workflow/steps.ts`: a `<count of items under ## CRITICAL>`, `<count of CRITICAL task blocks under ## Findings Log>` or `<count of Fixable lines under ## Identified Gaps Log>` placeholder sets the field's count rule and keeps `integer: true`
  - **UPDATE:** `DeclaredField` in `.bkit/core/engine/commands/workflow/steps.ts`: gains the optional count rule
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: a new exported `headerDeclaration(line)` parses one placeholder and throws a usage error on any other `<count of …>`
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-review-1.md`: the `Failures:` header line declares `<count of items under ## CRITICAL>`, and the `## CRITICAL` placeholder says one top-level `-` item per finding
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-review-2.md`: the `Failures:` header line declares `<count of items under ## CRITICAL>`, and the `## CRITICAL` placeholder says one top-level `-` item per finding
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-scope-check.md`: the `Failures:` header line declares `<count of items under ## CRITICAL>`, and the `## CRITICAL` placeholder says one top-level `-` item per finding
  - **UPDATE:** `.bkit/core/prompts/bkit-build-challenge-1.md`: the `Failures:` header line declares `<count of CRITICAL task blocks under ## Findings Log>`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-challenge-2.md`: the `Failures:` header line declares `<count of CRITICAL task blocks under ## Findings Log>`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the `Failures:` header line declares `<count of Fixable lines under ## Identified Gaps Log>`, and the `## Identified Gaps Log` placeholder (line 167) says one line per gap ending `— Fixable: true` or `— Fixable: false`, with an optional gap-count line before them that is not counted
  - **UPDATE:** `.bkit/instructions.md`: clause `set-failures` (line 3645) reads "Set `Failures` in **Create** with `Edit` = the number of `CRITICAL` findings: each top-level item under `## CRITICAL`, or each `CRITICAL` task block under `## Findings Log`."; the old text joins its `retired` block; `pnpm instructions:sync` carries it into `bkit-build-challenge-*`, `bkit-plan-review-*` and `bkit-plan-scope-check`
  - **UPDATE:** `.bkit/instructions.md`: clause `challenge-incomplete` (line 3899) reads "Fill every field of each task block; `bkit steps finish` hands back a block with an empty field."; the old text moves to a `retired` block; `pnpm instructions:sync` carries it into `bkit-build-challenge-*`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts`: the two guard tests below; the count-rule guard covers exactly the six prompts above and checks that no other prompt declares a `<count of …>`, so `bkit-ship-deferred-sweep.md:117` keeps `Failures: <integer >= 0>`
  - **READ:** `docs/testing.md`: § Test first, § Where tests live
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files, before the prompt edits
  - **READ:** `.bkit/instructions.md`: § Clauses, the `retired` block form (`workflow-finish` at line 3079 keeps one)
  - **DONE WHEN:** `promptHeader("bkit-plan-review-1")` returns `Failures` with its count rule; the six prompts declare their rules; the four tests below pass; the existing `bkit steps stub --result-file` tests still pass, because the field keeps `integer: true`; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` reports only the two clause changes before `pnpm instructions:sync`, and `.bkit/core/engine/tools/instructions-coverage.test.ts`, `instructions.test.ts` and `instructions-sources.test.ts` pass; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `promptHeader > reads the Failures count rule of bkit-plan-review-1` fails on the `Failures` field carrying no count rule
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `headerDeclaration > refuses an unknown count declaration` fails on an unknown `<count of …>` being read as a plain integer field instead of the usage error "unknown count declaration"
    - `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` `every count-checked prompt declares a known count rule` fails on the six prompts still declaring "<integer >= 0>"
    - `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` `no prompt leaves an incomplete finding out of the Failures count` fails on the carriers still saying "counting only complete ones"

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** `steps finish` checks each declared count, verify's `Fixable` and the challenge verdict against the report body
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: for each `--agent` with a count rule, count the named section and refuse a mismatch with exit 6, `reask` and a `problem` naming the field, the declared value and the counted value, checking each agent's count before the multi-agent sum; the verify rule counts only lines ending `Fixable: true` or `Fixable: false`; compare verify's `Fixable` to whether any counted line ends `Fixable: true`; for `bkit-build-challenge-*`, refuse `PASS` with any task block and `CONCERNS` with a `CRITICAL` one, using the blocks `parseFindings` returns, and turn a `parseFindings` error on an incomplete block into exit 6 with `reask` and a `problem` naming the block; `None` under `## CRITICAL` counts as zero
  - **UPDATE:** `findingsLog` in `.bkit/core/engine/commands/workflow/challenge.ts`: becomes `reportSection(text, heading)`; `parseFindings` passes `## Findings Log`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: the fixture `verify-1.md` (line 52, `Failures: 2`) gains a `## Identified Gaps Log` with two lines ending `— Fixable: true`, so the test at lines 1083-1116 still exits 0
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: the challenge fixture `c1.md` (lines 1163-1179, `CONCERNS`, `Failures: 1`) gains a `## Findings Log` with one `CRITICAL` task block whose fields are all filled
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: the plan-review fixtures at lines 1181-1205 (`FAIL`, `Failures: 1`) gain a `## CRITICAL` section with one top-level item
  - **READ:** `failuresProblem` in `.bkit/core/engine/commands/workflow/steps.ts`: the existing `PASS` / `FAIL` rule stays
  - **READ:** `readHeader` in `.bkit/core/engine/commands/workflow/steps.ts`: the header reader `finish` already calls
  - **READ:** `parseFindings` in `.bkit/core/engine/commands/workflow/challenge.ts`: the task-block shape and the error it throws on an incomplete block
  - **READ:** `docs/testing.md`: § Test first
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the nine tests below pass; a plan-review report with `PASS`, `Failures: 0` and only `OPTIONAL` items exits 0 in the first test; every existing `bkit steps finish` and `bkit challenge merge` test passes after the three fixture updates; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > checks Failures against the ## CRITICAL items and ignores OPTIONAL ones` fails on a report with one `CRITICAL` item and `Failures: 0` exiting 0 instead of exit 6 with the problem "counted 1"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > reads None under ## CRITICAL as zero items` fails on a `PASS` report whose `## CRITICAL` says `None` being refused with "counted 1"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > refuses a verify Fixable that disagrees with its gap lines` fails on `Fixable: false` over a `Fixable: true` gap line being accepted instead of the problem "Fixable is false"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > counts only the Fixable gap lines under a verify gap-count line` fails on a report with a count line and two gap lines being refused with "counted 3"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > refuses a challenge PASS with a HIGH task block` fails on the report being accepted instead of the problem "PASS needs no findings"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > refuses a challenge CONCERNS with a CRITICAL task block` fails on the report being accepted instead of the problem "CONCERNS allows HIGH or lower"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > hands back a challenge task block it cannot read` fails on the block being skipped or ending the step instead of exit 6 with the problem "incomplete task block"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > refuses a report the old render wrote whose Failures counted an OPTIONAL item` fails on a `Failures: 1` header over one `OPTIONAL` item being accepted instead of the problem "counted 0"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > checks each agent's count in a two-agent finish` fails on the second agent's miscount being hidden by the sum instead of the problem naming "bkit-build-challenge-1"

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** The ten result prompts stop asking for the JSON copy
  - **DELETE:** `.bkit/instructions.md`: the clauses `structured-result-file`, `structured-result-render` and `structured-supply-only`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-challenge-1.md`: the carrier lines of the three deleted clauses are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/core/prompts/bkit-build-challenge-2.md`: the carrier lines of the three deleted clauses are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/core/prompts/bkit-design-review-1.md`: the carrier lines of the three deleted clauses are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/core/prompts/bkit-design-review-2.md`: the carrier lines of the three deleted clauses are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-review-1.md`: the carrier lines of the three deleted clauses are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-review-2.md`: the carrier lines of the three deleted clauses are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-scope-check.md`: the carrier lines of the three deleted clauses are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the carrier lines of the three deleted clauses are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line, including the "engine never overrides" sub-bullets
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-diagnose.md`: the carrier lines of the three deleted clauses are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line, including the `Strategy` judgment (#1016 item 1)
  - **UPDATE:** `.bkit/core/prompts/bkit-design-spike.md`: the carrier lines of the three deleted clauses are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions entry 11358 ("The engine never overrides a `Verdict` that depends on evidence …", verify) and every other entry whose line this task removes are deleted by hand
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the guard test below, beside `no workflow names a removed sub-plan flag`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts`: the judgment-field guard below (#1016 item 1)
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files
  - **READ:** `.bkit/instructions.md`: § Clauses, the carriers of each deleted clause
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -l 'structured result file' .bkit/core/prompts/*.md` prints nothing; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0; `.bkit/core/engine/tools/instructions-coverage.test.ts`, `instructions.test.ts` and `instructions-sources.test.ts` pass; the two tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no prompt names a Result: launch line or a structured result file` fails on the ten prompts' "structured result file" clause
    - `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` `every judgment field a result prompt names is a header line promptHeader reads` fails on `bkit-debug-failure-diagnose.md` naming "Strategy" as a judgment field its header does not declare

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** The workflows stop passing a `Result:` path and rendering reports, and the re-ask passes the refusal's reason
  - **DELETE:** `.bkit/instructions.md`: the clause `result-path-cleared`
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: the three `Result:` lines (371, 376, 381) and the render block at 383-387 go; each review's `steps finish` keeps its exit routes
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: the three `Result:` lines (417, 422, 454) and the renders (425, 426, 457) go
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the five `Result:` lines (797, 971, 1105, 1110, 1220), their renders (800, 974, 1113, 1114, 1223) and the render prose at line 1111 ("Once the subagents return, render …") go
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the `Result:` line (601) and the render (604) go
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: the `result-path-cleared` carrier lines are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: the `result-path-cleared` carrier lines are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the `result-path-cleared` carrier lines are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the `result-path-cleared` carrier lines are deleted by hand, because `pnpm instructions:sync` never deletes a carrier line
  - **UPDATE:** `.bkit/instructions.md`: clause `workflow-finish`: the re-ask reads "Your prior output '<reask.artifact>' was refused: <problem>. Fix that in the file. Do not redo work."; the old text joins its `retired` block
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions entry 10404 ("Once the subagents return, render each challenge report …") and every other entry whose line this task removes are deleted by hand
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`, and the diff shows only the removed lines and the new re-ask
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`: regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`, and the diff shows only the removed lines and the new re-ask
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`, and the diff shows only the removed lines and the new re-ask
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated with `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -u`, and the diff shows only the removed lines and the new re-ask
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the two guard tests below
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** the two tests below and `engine calls > %s calls only verbs and flags the CLI has` pass; `pnpm instructions:sync` and the no-flag check exit 0; `.bkit/core/engine/tools/instructions-coverage.test.ts`, `instructions.test.ts` and `instructions-sources.test.ts` pass; `.bkit/core/engine/render/trackers.test.ts` passes; `pnpm bkit:text:ceiling lower` then `pnpm bkit:text:ceiling check` exit 0, with both totals below 86494 and 58535
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no workflow names a Result: line, a -result.json file or a result-file render` fails on the twelve "Result:" launch lines
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > the steps finish re-ask passes the printed problem` fails on the `workflow-finish` re-ask not passing "<problem>" to the agent

<!-- bkit:task 4 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: The audit agent writes its findings once

Source files: `.bkit/core/engine/commands/workflow/audit-report.ts` (new), `.bkit/core/engine/commands/workflow/issues.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/prompts/bkit-audit-generate.md`, the three `stub-seed-fingerprint` prompts, `.bkit/core/docs/templates/bkit-audit-*.md`, `.bkit/instructions.md`, `.bkit/core/.bkit/cli.md` (generated regions), `dist/`; tests in `audit-report.test.ts` (new), `issues.test.ts`, `ledgers.test.ts`, `steps.test.ts`, `challenge.test.ts`, `template-shape.test.ts`, `workflow-shape.test.ts`.

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Read the audit report's Findings table from a leaf module
  - **CREATE:** `.bkit/core/engine/commands/workflow/audit-report.ts`: the audit block moved unchanged from `issues.ts` (`AuditSeverity`, `AuditFinding`, `AuditResult`, `AuditEntry`, `HeldRow`, `parseAuditResult` until Task 8 deletes it, `auditTotals`, `auditFindingsLine`, `auditEntries`, `auditLedgerRows`, `auditHeaderFields`), `ledgerKeys` moved from `steps.ts`, and the new `parseAuditReport(text, slug)`, which reads the `## Findings` table with `parseMarkdownTable`, needs `ID`, `Severity`, `Title`, `Location` and `Key` per row, and refuses an empty or unknown `Severity`, an empty `Title` or a `Key` that is neither `new` nor an `audit-{slug}-` key, naming the row's `ID`; it imports only `../lib.js`, `../../shared/text.js` and `../../ledgers/telemetry.js`
  - **CREATE:** `.bkit/core/engine/commands/workflow/audit-report.test.ts`: the three tests below
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.ts`: the audit block is deleted and `issues comment` imports it from `audit-report.ts`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: `ledgerKeys` is deleted and its callers import it from `audit-report.ts` until Task 8
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.test.ts`: the imports of the moved names point at `audit-report.ts`
  - **READ:** `parseMarkdownTable` in `.bkit/core/engine/shared/text.ts`: the table reader
  - **READ:** `auditTotals` in `.bkit/core/engine/commands/workflow/issues.ts`: moved unchanged
  - **READ:** `auditEntries` in `.bkit/core/engine/commands/workflow/issues.ts`: moved unchanged
  - **READ:** `auditLedgerRows` in `.bkit/core/engine/commands/workflow/issues.ts`: moved unchanged
  - **READ:** `docs/security.md`: § Untrusted Content & Prompt Injection
  - **READ:** `docs/knowledge.jsonl`: row `workflow-ledgers-importing-tests-closes-a-steps-cycle`
  - **DONE WHEN:** the three tests below pass; `grep -n 'from "\./' .bkit/core/engine/commands/workflow/audit-report.ts` prints nothing; every existing `issues.test.ts` test, including `bkit issues audit ledger keys`, passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/audit-report.test.ts` `parseAuditReport > reads IDs, severities, titles and keys from the Findings table` fails on `parseAuditReport` not existing
    - `.bkit/core/engine/commands/workflow/audit-report.test.ts` `parseAuditReport > refuses a row with an unknown key, naming its ID` fails on the row being accepted instead of the refusal "unknown key"
    - `.bkit/core/engine/commands/workflow/audit-report.test.ts` `parseAuditReport > refuses a row with an empty severity, naming its ID` fails on the row being accepted instead of the refusal "empty Severity"

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [x] **TASK 6:** `bkit ledgers findings` prints the audit totals and ledger rows, and `issues comment --report` posts from the report
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: add the verb `findings --report=<file> [--slug=<slug>]`, which prints `ids`, `totals` and `ledgerRows` from `parseAuditReport` (exit 6 on a malformed table, exit 2 on a missing file), importing only from `audit-report.ts` and never from `issues.ts`
  - **UPDATE:** `issues comment` in `.bkit/core/engine/commands/workflow/issues.ts`: `--result-file` becomes `--report`, and the audit `Findings` field comes from `auditTotals` over the parsed report
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.test.ts`: `renders audit comments from validated result and preserves tracker adapters` (line 857) and the other audit cases at lines 857-942 read a report through `--report`
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated `ledgers` and `issues comment` regions, through `pnpm cli:sync`
  - **READ:** `docs/architecture.md`: § File placement, the `ledgers` noun's home
  - **READ:** `docs/knowledge.jsonl`: row `workflow-ledgers-importing-tests-closes-a-steps-cycle`, which is why the built CLI is run below
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the three tests below pass; every existing `bkit issues comment` test passes; `grep -n 'from "\./issues' .bkit/core/engine/commands/workflow/ledgers.ts` prints nothing; `pnpm cli:sync` is run and `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build` is run and `dist/` updated; `node dist/cli.js ledgers findings --help` and `node dist/cli.js help` both exit 0 on the built CLI
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `bkit ledgers findings > prints the totals and the ledger rows from a report` fails on the `findings` verb not existing
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `bkit ledgers findings > prints zero totals and no ledger rows for a report with no findings` fails on the `findings` verb not existing
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `bkit issues comment > audit comment derives Findings from --report` fails on the refusal "unknown flag --report"

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [x] **TASK 7:** The audit templates carry `Title` and `Key`, and the audit prompt reads its totals and rows from the engine
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-accessibility.md`: the Findings table gains a `Title` column after `Severity` and a `Key` column at the end, with the placeholder rule `Key` = `new`, or the key of the open `docs/failures.jsonl` row the finding matches
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-adoption.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-agents.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-aio-seo.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-analytics.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-annotations.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-app-performance.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-app-store.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-architecture.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-ci-performance.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-config.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-cost.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-coverage.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-database.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-dead-code.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-deferrals.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-dependencies.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-documentation.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-duplication.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-failures.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-flakes.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-gates.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-issues.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-llm.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-logs.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-models.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-privacy.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-prompts.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-red-team.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-reliability.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-repo.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-security.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-slop.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-testing.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-usability.md`: the same `Title` and `Key` columns
  - **UPDATE:** `.bkit/core/prompts/bkit-audit-generate.md`: step 11's "Serialize the findings once" bullet goes; after the report is complete, run `bkit ledgers findings --report=<Create>` and append its printed `ledgerRows`; the key rules become the rule for the `Key` column; step 15 posts with `--report=<Create>` and drops the hand-written `Findings` field
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions entry 11068 ("Serialize the findings once: write the audit result JSON …") is deleted by hand, and every other entry whose line this task changes is updated by hand, because `pnpm instructions:sync` never deletes an entry
  - **UPDATE:** `.bkit/core/engine/audits/templates/template-shape.test.ts`: the template guard below
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the `--result-file` guard below
  - **READ:** `.bkit/authoring.md`: § Doc Templates, § All Agent-Read Files
  - **DEPENDS ON:** 6
  - **DONE WHEN:** the two tests below pass; `grep -n 'Serialize the findings' .bkit/core/prompts/bkit-audit-generate.md .bkit/instructions.md` prints nothing; `pnpm instructions:sync` and the no-flag check exit 0; `.bkit/core/engine/tools/instructions-coverage.test.ts`, `instructions.test.ts` and `instructions-sources.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/template-shape.test.ts` `audit templates carry Title and Key columns in their Findings table` fails on the 35 tables lacking a "Title" column
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no prompt or workflow names --result-file` fails on `bkit-audit-generate.md` still naming "--result-file"

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [x] **TASK 8:** Remove the engine's JSON result path and the fingerprint
  - **DELETE:** `DERIVED_FIELDS` in `.bkit/core/engine/commands/workflow/steps.ts`: no caller remains
  - **DELETE:** `AUDIT_AGENT` in `.bkit/core/engine/commands/workflow/steps.ts`: no caller remains
  - **DELETE:** `withFingerprint` in `.bkit/core/engine/commands/workflow/steps.ts`: no caller remains
  - **DELETE:** `fingerprintOf` in `.bkit/core/engine/commands/workflow/steps.ts`: no caller remains
  - **DELETE:** `renderAudit` in `.bkit/core/engine/commands/workflow/steps.ts`: no caller remains
  - **DELETE:** `renderResult` in `.bkit/core/engine/commands/workflow/steps.ts`: no caller remains
  - **DELETE:** `readResult` in `.bkit/core/engine/commands/workflow/steps.ts`: no caller remains
  - **DELETE:** `FINGERPRINT` in `.bkit/core/engine/commands/workflow/steps.ts`: no caller remains
  - **DELETE:** `artifactFingerprint` in `.bkit/core/engine/commands/workflow/steps.ts`: no caller remains
  - **DELETE:** `fingerprintProblem` in `.bkit/core/engine/commands/workflow/steps.ts`: no caller remains
  - **DELETE:** `.bkit/core/engine/commands/workflow/steps.ts`: the `--agent`, `--result-file` and `--invocation` flags of `steps stub` and `--result-file` of `steps verdict`; the copy mode stays
  - **DELETE:** `structuredFindings` in `.bkit/core/engine/commands/workflow/challenge.ts`: only the render path called it
  - **DELETE:** `renderFindingsLog` in `.bkit/core/engine/commands/workflow/challenge.ts`: only the render path called it
  - **DELETE:** `parseAuditResult` in `.bkit/core/engine/commands/workflow/audit-report.ts`: with its types; `parseAuditReport` replaces it
  - **DELETE:** `.bkit/instructions.md`: the clause `stub-seed-fingerprint` (its text joins a `retired` block), and its carrier lines in `.bkit/core/prompts/bkit-design-organise.md`, `.bkit/core/prompts/bkit-design-update.md`, `.bkit/core/prompts/bkit-plan-update.md`, deleted by hand because `pnpm instructions:sync` never deletes a carrier line
  - **DELETE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: the `describe("bkit steps stub --result-file")` block (line 3084), including its audit cases at lines 3416-3659, which tests removed code
  - **DELETE:** `.bkit/core/engine/commands/workflow/challenge.test.ts`: the `describe("structured challenge findings")` block, which tests removed code
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated `steps stub` and `steps verdict` regions, through `pnpm cli:sync`
  - **DEPENDS ON:** 4, 5, 7
  - **DONE WHEN:** the two tests below pass; `grep -rn 'renderResult\|renderAudit\|readResult\|artifactFingerprint\|fingerprintProblem\|FINGERPRINT\|withFingerprint\|fingerprintOf\|--result-file\|resultFile' .bkit/core/engine/commands/workflow/ --include='*.ts'` finds only the two tests below in `steps.test.ts`; `pnpm instructions:sync` and the no-flag check exit 0; `.bkit/core/engine/tools/instructions-coverage.test.ts`, `instructions.test.ts` and `instructions-sources.test.ts` pass; `pnpm cli:sync` is run and `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build` is run and `dist/` updated; `pnpm bkit:text:ceiling lower` then `check` exit 0
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps stub > refuses --result-file as an unknown flag` fails on the flag being accepted instead of the refusal "unknown flag --result-file"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps verdict > reads a header with a leftover Fingerprint line` fails on the stale refusal "Fingerprint mismatch"

<!-- bkit:task 8 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Decision files — the orchestrator writes, the engine counts

Source files: `.bkit/core/engine/commands/workflow/open-decision.ts`, `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/workflow/summary-findings.ts`, `.bkit/core/engine/commands/workflow/tasks.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/workflows/bkit-build.md`, `.bkit/instructions.md`, `.bkit/core/.bkit/cli.md` (generated regions), the build render baseline, `dist/`; tests in `open-decision.test.ts`, `decisions.test.ts`, `status.test.ts`, `workflows.test.ts`, `workflow-shape.test.ts`.

<!-- bkit:task 9 start -->

- [x] **TASK 9:** One reader merges a decision file with its `-engine.md` sibling
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

- [x] **TASK 10:** `bkit decisions check` checks the orchestrator's decision file
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

- [x] **TASK 11:** `bkit decisions counts` writes the engine's pause counts into its own file
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

- [x] **TASK 12:** `bkit decisions apply` writes the engine's lines into the engine file
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

- [x] **TASK 13:** The build's Decision Pause has the orchestrator write its own questions, and `decisions compose` goes
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

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: The Failure Path file and the contract docs

Source files: `.bkit/instructions.md`, `.bkit/core/workflows/bkit-auto.md` and the five workflows carrying `workflow-error-file`, `.bkit/core/workflows/bkit-debug.md` Step 4, the five render baselines, `.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/jsonl.md`, `docs/testing.md`, `scripts/gate/` text ceiling record, `dist/`; tests in `workflow-shape.test.ts`.

<!-- bkit:task 14 start -->

- [x] **TASK 14:** The Failure Path error text is a `.md` in the run's log folder
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

- [x] **TASK 15:** The debug workflow writes its context-fetch script with the file tool, into the log folder
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

<!-- bkit:task 16 start -->

- [x] **TASK 16:** Contract docs, ceilings and rendered copies match the code
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: hand text only, since `pnpm cli:sync` already regenerated the verb tables in Tasks 6, 8, 10, 11, 12 and 13: lines 41 and 45 (`{OUTBOX}` contents) and the decisions table at 168-178 describe `check`, `counts`, `apply --answer` and the engine file
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: lines 237, 666, 977, 990-993, 1000, 1005, 1006, 1030 and 1138 drop the result path, the result render and `decision-items.json`, and describe the two decision files
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: line 447 drops the result-file note
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: line 159 (the `run` row's "decision-pause if its build-decision-*.md is Status: OPEN"): a decision pause is open while its computed `Status` is `OPEN`, read across the decision file and its `-engine.md` sibling
  - **UPDATE:** `docs/testing.md`: the per-file rows for `steps.test.ts`, `decisions.test.ts` (`check` / `counts` / `apply` / `skip` / `pending`), `open-decision.test.ts`, `issues.test.ts`, the new `audit-report.test.ts`, `ledgers.test.ts`, `status.test.ts`, `workflows.test.ts`, `workflow-shape.test.ts`, `verdict-vocabulary.test.ts` and `template-shape.test.ts`
  - **READ:** `docs/testing.md`: § Where tests live
  - **READ:** `.bkit/authoring.md`: § Docs
  - **DEPENDS ON:** 8, 13, 14, 15
  - **DONE WHEN:** `grep -rn '{OUTBOX_ROOT}/error.md\|{OUTBOX}/stderr.log\|--result-file\|decision-items.json\|decisions compose' .bkit/core/.bkit/*.md .bkit/core/workflows/*.md .bkit/core/prompts/*.md` prints nothing, and the same pattern over `.bkit/instructions.md` with its ` ```retired ` blocks left out (`awk '/^```retired/{r=1;next} /^```/{r=0} !r' .bkit/instructions.md | grep -n …`) prints nothing; `pnpm cli:sync` leaves `.bkit/core/.bkit/cli.md` unchanged and `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build`, then `pnpm tsx .bkit/core/engine/cli.ts upgrade` once; `bkit check` exits 0; `pnpm bkit:text:ceiling lower` then `check` exit 0, with both totals below 86494 and 58535; `pnpm bkit:gate:static-unit-integration` passes
  - **TEST FIRST:** n/a — docs, regenerated docs and rendered copies, with no behaviour change

<!-- bkit:task 16 end -->

<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: Challenge round 1 findings

<!-- bkit:task 17 start -->

- [x] **TASK 17:** An orchestrator writes its question lines with an en dash (`**Q1 – …`); `decisions check` passes the file, the pause parses zero questions and reads DECIDED before anyone answers, headless apply settles nothing, and `decisions skip` exits 0 so a verify pause routes `continue`
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:170` · **Round:** 1
  - **DONE WHEN:** `decisions check` exits 6, naming the line, for any line that opens like a question (`**Q{n}` or a `Q{n}` heading) that `ITEM_SPLIT` does not split, and for a decision file with no question at all when its engine file holds no loop question.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a question line written with an en dash, naming the line` fails on exit 0 with `questions: 0`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a file with no question when the engine file holds no loop question` fails on exit 0

<!-- bkit:task 17 end -->
<!-- bkit:task 18 start -->

- [x] **TASK 18:** A pause is interrupted after a headless apply, resumed in a session and re-asked; the owner answers Fix now and the orchestrator writes it in its own file, but `mergeItems` lets the engine file's `Accept (assumed)` (or "recommended; applied without asking") line win, so the orchestrator routes `fix` while `acceptedLocations`, `tasks tick` and `decisions skip` still read Accept
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/open-decision.ts:136` · **Round:** 1
  - **DONE WHEN:** `mergeItems` (`open-decision.ts`) lets a question's `Decision:` line in the orchestrator's decision file win over that question's engine-file `Decision:` line only when the engine line was taken without asking (`Accept (assumed)`, or a line ending `recommended; applied without asking`); every other engine-file `Decision:` line (a gate re-run, ship's confirm or reject, the loop answer per Q9) still wins, and every header line still wins for a name. `tasks tick`, `decisions skip`, `openDecision`, `gateRerun` and the route read the merged items only through `decisionItems` / `mergeItems`, so they cannot disagree. The Edge Cases row "Both files carry a `Decision:` line for one question, or a header line with one name" states the narrowed rule. The existing test `decision file readers > the engine file's Decision line wins for one question` keeps its non-assumed engine case unchanged. Any new workflow wording stays under the word ceiling; never `raise`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)` fails on the merged item reading `Accept (assumed)`
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > an owner's answer in the decision file wins over an engine line applied without asking` fails on the merged item reading the engine's `recommended; applied without asking` line
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)` fails on exit 0

<!-- bkit:task 18 end -->
<!-- bkit:task 19 start -->

- [x] **TASK 19:** The orchestrator copies `Status: OPEN` into its own decision file header; `decisions check` passes it, and a lone file (engine sibling not yet written) still reads OPEN after every question is answered because `pauseStatus` at `open-decision.ts:189` prefers the written line, so a resume re-asks a settled pause
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:167` · **Round:** 1
  - **DONE WHEN:** `decisions check` exits 6, naming the line, when the orchestrator's header holds a `Status`, `Source changed` or `Gate` line.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a Status, Source changed or Gate line in the orchestrator's header` fails on exit 0 for a file carrying `Status: OPEN`

<!-- bkit:task 19 end -->
<!-- bkit:task 20 start -->

- [x] **TASK 20:** A reviewer quotes `- [ ] **TASK 3:**` at column 0 inside a code fence under `## CRITICAL` (or a fenced `## …` line); `steps finish` counts the fenced line as an item or ends the section early, refuses a correct `Failures` header with "counted N" without naming the lines or the rule, and the agent changes the header to match the miscount
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1148` · **Round:** 1
  - **DONE WHEN:** Lines inside code fences are neither counted as items nor end the section in `reportSection`, and the mismatch problem names the rule (top-level `- ` lines outside code fences).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > does not count a fenced line under ## CRITICAL as an item` fails on a FAIL report with `Failures: 1` being refused with "counted 2"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > a fenced ## line under ## CRITICAL does not end the section` fails on a report with `Failures: 2` being refused with "counted 1"

<!-- bkit:task 20 end -->
<!-- bkit:task 21 start -->

- [x] **TASK 21:** An audit agent writes `\d+` or `\_` in an Evidence cell, an alignment separator row (`:---`), or the short one-cell `None` row that the template's "write one row: None" invites; `parseAuditReport` hands the table to the engine's strict `parseMarkdownTable` and refuses the whole report with "a Findings table is not a well-formed table", naming no row
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/audit-report.ts:153` · **Round:** 1
  - **DONE WHEN:** An agent-written Findings table with backslashes in cells, alignment separators or a lone short `None` row parses, and a malformed row is refused by its ID.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/audit-report.test.ts` `parseAuditReport > reads a row whose Evidence cell holds a backslash` fails on the refusal "a Findings table is not a well-formed table"
    - `.bkit/core/engine/commands/workflow/audit-report.test.ts` `parseAuditReport > reads a lone short None row as no finding` fails on the same refusal

<!-- bkit:task 21 end -->
<!-- bkit:group 5 end -->

<!-- bkit:group 6 start -->

### TASK GROUP 6: Challenge round 1 findings

<!-- bkit:task 22 start -->

- [x] **TASK 22:** An audit row carries an empty, `—`, range or list Location; `parseAuditReport` accepts it (the replaced `parseAuditResult` required `path:line`), the append-only failures ledger gets a row like "Weak check (); audit security finding security-1", `ledgerKeys` cannot read the location back, and a re-run that writes `Key: new` appends a `-2` duplicate
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/audit-report.ts:187` · **Round:** 1
  - **DONE WHEN:** A Findings row whose Location is not `path:line` is refused, naming its ID.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/audit-report.test.ts` `parseAuditReport > refuses a row whose Location is not path:line, naming its ID` fails on the row being accepted with location ""

<!-- bkit:task 22 end -->
<!-- bkit:task 23 start -->

- [x] **TASK 23:** A failed command whose stderr echoes a token leaves it unredacted in the committed {workflow}-stderr.md / {workflow}-error.md, which the abort commit pushes under [skip ci], so no secret scan runs and a private-tracker or tracker-none repo publishes it for the first time
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:405` · **Round:** 1
  - **DONE WHEN:** `bkit workflows fail` rewrites the `--error-file` and `--stderr-file` it reads in place before any commit or comment: each configured secret value (`SECRET_KEYS`, through `redact` in `.bkit/core/engine/commands/workflow/tracker.ts`) is replaced with `<NAME>`, and the stderr file is cut to its last 20 lines, so the committed copy never holds more than the redacted lines the failure comment posts, whatever the tracker and whatever the orchestrator wrote.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines` fails on both files still holding the raw fake `BKIT_GH_TOKEN` value and the stderr file keeping all 30 lines after the call

<!-- bkit:task 23 end -->
<!-- bkit:task 24 start -->

- [x] **TASK 24:** An owner reply that names a command in backticks executes that command in the orchestrator's shell, because Decision Pause step 6 pastes {owner's words} into the double-quoted --reason of decisions apply --by=owner --answer
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:292` · **Round:** 1
  - **DONE WHEN:** Decision Pause step 6 writes the owner's words with the file tool to a file and passes it as `decisions apply --by=owner ... --reason-file=<path>`; `decisions apply` reads `--reason-file` as plain text (never shell-expanded); no bash block in `.bkit/core/workflows/bkit-build.md` (or its rendered copies) interpolates `{owner's words}` inside a double-quoted argument.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no bkit-build bash block puts the owner's words inside a double-quoted argument` fails on the `--reason="{owner's words}"` line at `bkit-build.md:292`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file` fails on `--reason-file` being unknown, so no `Decision:` line carrying the file's text is written

<!-- bkit:task 24 end -->
<!-- bkit:group 6 end -->

<!-- bkit:group 7 start -->

### TASK GROUP 7: Challenge round 2 findings

<!-- bkit:task 25 start -->

- [x] **TASK 25:** A verify pause whose questions all fail `decisions check` (for example written with an en dash) gets its loop question built from zero questions, so after the fix the loop offers Try again / Stop with no Decide, and a headless run stops where it should decide
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:435` · **Round:** 2
  - **DONE WHEN:** A decision file that passes `decisions check` never sits beside an engine loop question built for a different question count: `decisions check` exits 6 when the engine file's `Q1` offers `Stop` (built for zero questions) while the decision file holds a question, or offers `Decide` while it holds none, and its `problem` says to re-run `decisions counts`; `.bkit/core/workflows/bkit-build.md` Decision Pause step 2 (line 214) re-runs `decisions counts {COUNT_FLAGS}` before the second `decisions check` after fixing a refusal.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` fails on exit 0 when the engine file's Q1 offers `A) Try again` / `B) Stop` and the decision file holds a well-formed `**Q2 — ` question

<!-- bkit:task 25 end -->
<!-- bkit:task 26 start -->

- [x] **TASK 26:** A consumer's failed migration or test prints its database URL with the password, another service token (e.g. `GH_TOKEN`, a cloud API key) or `/Users/<name>/…` stack paths to stderr; `workflows fail` scrubs only the three tracker key values, so the handover commit pushes them into git history in `{LOG_DIR}/{workflow}-stderr.md` / `-error.md`, for a Linear, Jira or tracker-none repo for the first time
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:368` · **Round:** 2
  - **DONE WHEN:** `scrubFailureFiles` (`workflows.ts:360`) also replaces, in both files before any commit or comment: the value of every environment variable whose name marks a credential (`TOKEN`, `SECRET`, `PASSWORD`, `PASSWD`, `API_KEY`, `PRIVATE_KEY`, `CREDENTIAL`, or a `*_URL` / `DSN` value holding `user:password@`) with `<NAME>`; the password part of any `scheme://user:password@host` with `<redacted>`; and the absolute repository root and home-directory prefixes with a repo-relative path and `~`. The committed copy then holds no credential and no local account path (`docs/security.md` § PII "local checkout path", `docs/observability.md:100`), and Task 23's test still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > redacts credentials beyond the tracker keys from the error and stderr files` fails on both files still holding a fake value of a `BKIT_TEST_SERVICE_TOKEN` env var (not in `SECRET_KEYS`) and the fake password of a `postgres://app:<fake>@db/app` URL after the call
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > writes the stderr file with the checkout path made relative and the home directory as ~` fails on the stderr file still holding the test repo's absolute path and `os.homedir()` after the call

<!-- bkit:task 26 end -->
<!-- bkit:group 7 end -->

<!-- bkit:group 8 start -->

### TASK GROUP 8: The engine's pause facts are status.jsonl rows, and one reader folds them

Source files: `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/commands/workflow/open-decision.ts`, `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/workflow/summary-findings.ts`, `.bkit/core/engine/commands/workflow/tasks.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/.bkit/cli.md` (generated regions), `dist/`; tests in `status.test.ts`, `decisions.test.ts`, `open-decision.test.ts`, `workflows.test.ts`, `tasks.test.ts`.

Each test this group takes over keeps its name, because the build locks a planned test by its name; its fixture and assertion change to the rows.

<!-- bkit:task 27 start -->

- [x] **TASK 27:** Two engine-only status row types, and a status line parser the decision reader can import
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: add `parseStatusLines(text, label)`, which returns the parsed rows in file order or the first line that is not a JSON object, and imports nothing from `commands/`; add `ENGINE_ROW_TYPES = new Set(["decision-counts", "decision-answer"])` and the `DecisionCountsRow` and `DecisionAnswerRow` types (fields as in Data Schema Usage)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: `parseStatusRows` calls `parseStatusLines` and keeps its exit 3 and its `RENAMED_STEPS` mapping; the `row` verb refuses a `--type` in `ENGINE_ROW_TYPES`, beside `FOLDED_TYPES`, with a usage error naming the verb that writes it (`decisions counts` or `decisions apply`)
  - **READ:** `.bkit/core/engine/commands/lib.ts`: its import of `../ledgers/status.js`, the reason the moved parser may not import `CommandError`
  - **DEPENDS ON:** 26
  - **DONE WHEN:** the test below passes; every existing `status.test.ts` and `.bkit/core/engine/ledgers/status.test.ts` test passes; `readStatusRows` and `readStatusRowsAt` return the same rows as before; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `bkit status row > refuses the engine-only types decision-counts and decision-answer` fails on exit 0 and a row appended for `--type=decision-counts`

<!-- bkit:task 27 end -->
<!-- bkit:task 28 start -->

- [x] **TASK 28:** `decisions counts` appends a `decision-counts` row and prints the lines the owner is shown
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

- [x] **TASK 29:** One reader folds a decision file's rows; the row appended last for a question wins
  - **UPDATE:** `.bkit/core/engine/commands/workflow/open-decision.ts`: add `decisionRows(read, rel)`, the `decision-counts` and `decision-answer` rows naming `rel` in `join(dirname(rel), "status.jsonl")`, read through `read` and parsed with `parseStatusLines`; `decisionItems` and `decisionFileHeader` build item `n=1` from the last `decision-counts` row's `loop`, take `Source changed` and `Gate` from it, and set each item's `decision`, `assumed`, `rejected`, `deferred` and `fixTask` from the last appended `decision-answer` row for its `q`, never comparing `at`
  - **UPDATE:** `decisionItems` in `.bkit/core/engine/commands/workflow/open-decision.ts`: read the in-file `Decision:`, `Fix task:`, `Rejected:` and `Deferred:` lines only for an old file, one whose header carries a `Status:` line, whatever rows name it; any other file's answer lines are not read
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

- [x] **TASK 30:** Every decision-file caller reads through the row reader, with no engine sibling
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

- [x] **TASK 31:** A decision file with no readable question reads `OPEN`, a resume can tell, and `tasks tick` ticks only what a row accepts
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
<!-- bkit:group 8 end -->

<!-- bkit:group 9 start -->

### TASK GROUP 9: Every answer is a decision-answer row, and decisions check reads the counts row

Source files: `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/.bkit/cli.md` (generated regions), `dist/`; tests in `decisions.test.ts`.

Each test this group takes over keeps its name, because the build locks a planned test by its name; its fixture and assertion change to the rows.

<!-- bkit:task 32 start -->

- [x] **TASK 32:** Headless, re-run and ship answers and ship's deferrals are `decision-answer` rows
  - **UPDATE:** `apply` in `.bkit/core/engine/commands/workflow/decisions.ts`: `--by=headless` appends one `{type: "decision-answer", workflow, at, file, q, answer, by: "headless", assumed, runtime}` row per item it settles (`assumed: true` for an `Accept`); `--by=rerun` appends a `Q1` `Try again` row with `by: "rerun"`; `--by=owner --confirm` appends an `Accept` row with `by: "owner"` and `workflow: "ship"`, and `--reject` the same with `rejected: true` and `reasonFile`; no `apply` call writes a `.md` file; `applyRecommendations` returns rows instead of text
  - **UPDATE:** `pending` in `.bkit/core/engine/commands/workflow/decisions.ts`: reads the answers through `decisionItems`; `--defer` appends a row repeating the item's answer with `deferred: "needs-decision"`
  - **DEPENDS ON:** 31
  - **DONE WHEN:** the four tests below pass; every `apply --by=headless`, `--by=rerun` and `pending` call leaves every `.md` file in the log folder byte-identical; `pnpm cli:sync` is run and `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged` fails on no `decision-answer` row with `assumed: true` and on a `-engine.md` file being written — TASK 12's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` fails on no `Accept` row with `workflow: "ship"` after `--confirm` and on a `-engine.md` file being written — TASK 12's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=rerun > records the re-run as a Q1 row and the pause reads DECIDED` fails on no `Q1` row with `by: "rerun"`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > pending --defer keeps the answer and marks it needs-decision` fails on no row with `deferred: "needs-decision"`

<!-- bkit:task 32 end -->
<!-- bkit:task 33 start -->

- [x] **TASK 33:** The owner's answers reach the engine as `Q{n}={letter}` and a task number only; the owner's words never reach a shell argument, a decision file or a status row
  - **UPDATE:** `apply --by=owner` in `.bkit/core/engine/commands/workflow/decisions.ts`: takes repeatable `--answer=Q{n}={letter}`, the letter checked against that item's options, and appends one row per answer; takes `--fix-task=Q{n}={task}` (a positive integer) only for a question answered `Fix now` in the same call, stored as `fixTask`; takes `--reason-file` only with `--confirm` or `--reject`, and its text goes only into the `docs/decisions.jsonl` row's `rationale` (`--confirm`) or stays in the file the row's `reasonFile` names (`--reject`)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: delete the `--reason` flag and the `--answer=<Try again|Decide|Stop>` form
  - **READ:** `docs/security.md`: § Shell Injection
  - **DEPENDS ON:** 32
  - **DONE WHEN:** the six tests below pass; `--reason` is an unknown flag; an `--answer` that is not `Q{n}={letter}`, or names a letter the item does not offer, exits 2 and appends nothing; no `--by=owner` call writes a `.md` file or puts `--reason-file` text in a status row; `pnpm cli:sync` is run and `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1` fails on no `Q1` row for `--answer=Q1=A` and on a `-engine.md` file being written — TASK 12's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file` fails on `--reason-file` beside `--answer` being accepted instead of exit 2 with no row appended — TASK 24's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer=Q2=B --fix-task=Q2=31 records Fix now with its task` fails on no `Fix now` row with `fixTask: 31`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > refuses an --answer that is not Q{n} and an option letter` fails on exit 0 for `--answer="Q2=Fix now"`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > refuses --reason as an unknown flag` fails on `--reason="words"` being accepted
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > a multi-line --reason-file reaches only the decisions.jsonl rationale` fails on a `--confirm` whose reason file holds a `**Q3 — ` line and a `Decision: Accept` line leaving `Q3` read as answered, or the text appearing in `status.jsonl` or a `.md` file

<!-- bkit:task 33 end -->
<!-- bkit:task 34 start -->

- [x] **TASK 34:** `decisions check` reads the `decision-counts` row, and refuses answer lines in the orchestrator's file
  - **UPDATE:** `itemProblem` in `.bkit/core/engine/commands/workflow/decisions.ts`: takes the file's last `decision-counts` row instead of `engineText` for "no question unless a loop", "no `Q1` when a loop" and Task 25's rule (a `Stop`-only loop with a question, or a `Decide` loop with none, exits 6 with a `problem` that says to re-run `decisions counts`); refuses, naming the question, any line of an item that starts `Decision:`, `Fix task:`, `Rejected:` or `Deferred:`. The `Status`, `Source changed` and `Gate` header refusals (Task 19), the en-dash refusal (Task 17), and the duplicate, letter, `Recommended:` and `Default if unanswered:` rules stay as they are
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the `engineOf` helper becomes `countsRow(logs, file, loop)`, appending a `decision-counts` row; its other uses move to it
  - **DEPENDS ON:** 33
  - **DONE WHEN:** the four tests below pass; every `bkit decisions check` test passes with each `-engine.md` fixture replaced by a row; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses Q1 when the engine file holds the loop question` fails on exit 0 when the fixture's loop is a `decision-counts` row — TASK 10's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file` fails on exit 6 when no `decision-counts` row has a loop — TASK 10's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` fails on exit 0 when the `decision-counts` row's loop offers `Try again` / `Stop` and the decision file holds a well-formed `**Q2 — ` question — TASK 25's test, taken over because this task changes what it asserts
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a Decision, Fix task, Rejected or Deferred line in the orchestrator's file` fails on exit 0 for a question carrying a `Decision: Accept — looks fine` line

<!-- bkit:task 34 end -->
<!-- bkit:task 35 start -->

- [x] **TASK 35:** `bkit decisions answers` prints the folded answers, for the agents given a decision file
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: add the verb `answers --file=<decision file>`, printing `{file, status, items: [{q, title, answer, by, assumed, rejected, deferred, fixTask}]}` from `decisionItems`; it writes nothing
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated `decisions` region, through `pnpm cli:sync`
  - **DEPENDS ON:** 34
  - **DONE WHEN:** the two tests below pass; for the Task 18 case the output lists `Q2` as `Fix now` by `owner`; `pnpm cli:sync` is run and `.bkit/core/engine/tools/cli-doc.test.ts` passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions answers > prints the last appended answer per question with its writer` fails on no such verb
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions answers > prints an old single-file decision's in-file answers` fails on no such verb

<!-- bkit:task 35 end -->
<!-- bkit:group 9 end -->

<!-- bkit:group 10 start -->

### TASK GROUP 10: The workflows record answers through the engine, the fixers ask the engine, and the docs name the rows

Source files: `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`, `.bkit/core/prompts/bkit-debug-failure-diagnose.md`, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/instructions.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/jsonl.md`, `.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/authoring.md`, `docs/testing.md`, the build and ship render baselines; tests in `workflow-shape.test.ts`.

<!-- bkit:task 36 start -->

- [x] **TASK 36:** The build and ship workflows record every answer through `decisions apply` and show the printed counts; the fixers run `decisions answers` themselves
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

- [x] **TASK 37:** Contract docs and `docs/testing.md` name the two rows and `decisions answers`, and the ceilings drop
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
<!-- bkit:group 10 end -->

<!-- bkit:group 11 start -->

### TASK GROUP 11: Planned tests the build took over

<!-- bkit:task 38 start -->

- [x] **TASK 38:** Take over `bkit decisions apply --by=owner and pending > --confirm appends the owner's ship Accept row without the reason and writes no file` from TASK 12
  - **DONE WHEN:** `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --confirm appends the owner's ship Accept row without the reason and writes no file` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --confirm appends the owner's ship Accept row without the reason and writes no file` fails until the change that contradicts it exists: the fixture's in-file Decision line is no longer read without a Status header, so a decision-answer row (assumed Accept) is seeded beside it; lines only added, none removed

<!-- bkit:task 38 end -->

<!-- bkit:task 39 start -->

- [x] **TASK 39:** Take over `bkit decisions check > refuses Q1 when the engine file holds the loop question` from TASK 10
  - **DONE WHEN:** `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses Q1 when the engine file holds the loop question` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses Q1 when the engine file holds the loop question` fails until the change that contradicts it exists: fixture ported from the -engine.md file to a decision-counts loop row, because the engine file is no longer written; Task 34 owns it and makes check read the row

<!-- bkit:task 39 end -->

<!-- bkit:task 40 start -->

- [x] **TASK 40:** Take over `bkit decisions apply --by=headless > appends an assumed Accept row per question and leaves the decision file unchanged` from TASK 12
  - **DONE WHEN:** `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > appends an assumed Accept row per question and leaves the decision file unchanged` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > appends an assumed Accept row per question and leaves the decision file unchanged` fails until the change that contradicts it exists: asserts the decision-answer rows instead of the engine file, because apply writes rows and no engine file

<!-- bkit:task 40 end -->

<!-- bkit:task 41 start -->

- [x] **TASK 41:** Take over `bkit decisions apply --by=owner and pending > --answer appends the loop answer as a Q1 row after the counts row` from TASK 12
  - **DONE WHEN:** `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer appends the loop answer as a Q1 row after the counts row` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer appends the loop answer as a Q1 row after the counts row` fails until the change that contradicts it exists: fixture ported to a decision-counts loop row and the answer asserted as a decision-answer row, because the engine file is no longer written

<!-- bkit:task 41 end -->

<!-- bkit:task 42 start -->

- [x] **TASK 42:** Take over `bkit decisions apply --by=owner and pending > --answer refuses a --reason-file and writes no row; a bare --answer appends one` from TASK 24
  - **DONE WHEN:** `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer refuses a --reason-file and writes no row; a bare --answer appends one` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer refuses a --reason-file and writes no row; a bare --answer appends one` fails until the change that contradicts it exists: fixture ported to a decision-counts loop row and the answer asserted as a decision-answer row, because the engine file is no longer written

<!-- bkit:task 42 end -->

<!-- bkit:group 11 end -->

<!-- bkit:group 12 start -->

### TASK GROUP 12: Planned tests the build took over

<!-- bkit:task 43 start -->

- [x] **TASK 43:** Take over `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` from TASK 25
  - **DONE WHEN:** `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` fails until the change that contradicts it exists: fixture ported to a decision-counts loop row (Try again / Stop), because the engine file is no longer written; Task 34 owns it and makes check read the row

<!-- bkit:task 43 end -->

<!-- bkit:task 44 start -->

- [x] **TASK 44:** Take over `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` from TASK 12
  - **DONE WHEN:** `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` fails until the change that contradicts it exists: TASK 32 expected the owner reason inside the status row answer; TASK 33 forbids any --reason-file text in a status row, so the assertion at line 1851 was replaced by '^Accept — ' plus a not-contains "fine" check (reason lives in the docs/decisions.jsonl rationale)

<!-- bkit:task 44 end -->

<!-- bkit:group 12 end -->

<!-- bkit:group 13 start -->

### TASK GROUP 13: Holistic fixes

<!-- bkit:task 45 start -->

- [x] **TASK 45:** Ship's Failure Path drops `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: Failure Path step 1 (line 95) says to drop `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held, because ship's Step 1 can reach the Failure Path (lines 158, 179, 181) before line 200 holds it
  - **UPDATE:** `.bkit/instructions.md`: the `workflow-error-file` clause (line 5717) and its carriers, so `pnpm instructions:sync` keeps ship's line and the clause in step
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated with the rendered copies of `bkit-ship.md`, never hand-edited
  - **READ:** `readText` in `.bkit/core/engine/commands/workflow/workflows.ts`: `workflows fail` exits 2 on a missing error file (lines 544-547)
  - **DEPENDS ON:** 14
  - **DONE WHEN:** `.bkit/core/workflows/bkit-ship.md` Failure Path step 1 says to drop `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held, keeps the `;` separators and the rule to drop `--pr` when `{PR_NUMBER}` is empty; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` and `pnpm instructions:sync` exit 0; `.bkit/core/engine/tools/instructions-coverage.test.ts`, `instructions.test.ts` and `.bkit/core/engine/render/trackers.test.ts` pass; `pnpm bkit:text:ceiling check` exits 0 with no ceiling raised
  - **TEST FIRST:** n/a — wording in one workflow line, its clause and its regenerated copies, with no engine behaviour change

<!-- bkit:task 45 end -->

<!-- bkit:task 46 start -->

- [x] **TASK 46:** The install record matches the rendered workflow copies
  - **UPDATE:** `.bkit/version`: re-recorded by `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never hand-edited
  - **DEPENDS ON:** 16, 45
  - **DONE WHEN:** `pnpm tsx .bkit/core/engine/cli.ts upgrade` runs once after Task 45, and `pnpm tsx .bkit/core/engine/cli.ts check` exits 0
  - **TEST FIRST:** n/a — a regenerated install record, with no behaviour change

<!-- bkit:task 46 end -->

<!-- bkit:group 13 end -->

<!-- bkit:group 14 start -->

### TASK GROUP 14: Challenge round 1 findings

<!-- bkit:task 47 start -->

- [x] **TASK 47:** A ship that confirms the first assumed Accept of a decision file written before the upgrade wipes that file's other assumed Accepts, so the owner's next confirm exits 2 and pending neither lists nor defers them
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/open-decision.ts:177` · **Round:** 1
  - **DONE WHEN:** foldDecision treats a file whose header carries a Status line as an old file whatever rows name it: its in-file Decision, Fix task, Rejected and Deferred lines, its Source changed and Gate header lines and its Progress-block loop stay the base, and a decision-answer row overrides only the question it names; pauseStatus folds the same way; the plan's old-file wording (plan lines 259, 560 and 1296) drops "and that no row names"; the four tests below pass and every existing open-decision and decisions test still passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > confirming Q1 of an old per-line file with two assumed Accepts leaves Q2 confirmable` fails on the second confirm (q 2) exiting 2 with "Q2 is not an assumed Accept" once the Q1 row names the file
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > pending lists the second assumed Accept of an old per-line file after the first is confirmed` fails on pending printing count 0 instead of 1, so no needs-decision deferral is ever written for Q2
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision rows > an old file keeps the in-file answers of questions no row names` fails on decisionItems returning Q2 with decision null and assumed false after one decision-answer row for Q1 names the file
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `skipProblem > an old file keeps its Source changed header after a row names it` fails on the refusal "no Source changed header" for an old verify file whose in-file header reads Source changed false and whose Q1 Accept is a row

<!-- bkit:task 47 end -->
<!-- bkit:task 48 start -->

- [x] **TASK 48:** A failed command prints a token that no environment variable of the `workflows fail` process holds (an `Authorization: Bearer` header, a PEM private-key block, a `ghp_` / `github_pat_` / `sk-` token read from a dotenv file, keyring or config file); `scrubSecrets` matches only env values and `user:password@` URLs, so the raw token lands in the committed `{LOG_DIR}/{workflow}-stderr.md`, pushed under `[skip ci]` with no secret scan
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:360` · **Round:** 1
  - **DONE WHEN:** `scrubSecrets` also replaces, whatever the env holds, the value after `Authorization: Bearer` / `Authorization: Basic` (and `token=` / `access_token=` query values), the body of any `-----BEGIN … PRIVATE KEY-----` … `-----END … PRIVATE KEY-----` block, and values with a well-known token prefix (`ghp_`, `gho_`, `ghs_`, `github_pat_`, `glpat-`, `xox[abpr]-`, `sk-`, `AKIA`), with `<redacted>`; both files then hold none of them, and the Task 23 and Task 26 tests still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > redacts token-shaped values that no environment variable holds from the error and stderr files` fails on both files still holding a fake `Authorization: Bearer` value, a fake PEM private-key body and a fake `ghp_`-prefixed token (each built at runtime, none set in any env var) after the call

<!-- bkit:task 48 end -->
<!-- bkit:task 49 start -->

- [x] **TASK 49:** A consumer's failed test prints a service-role key, an SMTP or database password or a chat webhook URL held in env as `*_SERVICE_ROLE_KEY`, `*_KEY`, `*_PASS` or `*_WEBHOOK_URL`; `CREDENTIAL_NAME` lists only `TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|CREDENTIAL` and a `*_URL` value counts only with `user:password@`, so those values reach the committed error and stderr files unredacted
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:356` · **Round:** 1
  - **DONE WHEN:** An env var counts as a credential when its name also ends in `KEY`, `PASS`, `PWD` (other than `PWD` / `OLDPWD` themselves), `AUTH` or `PAT`, or holds `WEBHOOK` or `SESSION`, and `scrubSecrets` replaces each such value (4 chars or longer) with `<NAME>` in both files; the Task 26 list stays covered.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files` fails on both files still holding the fake values of `BKIT_TEST_SERVICE_ROLE_KEY`, `BKIT_TEST_SMTP_PASS` and `BKIT_TEST_ALERT_WEBHOOK_URL` (a `https://hooks.example.test/services/…` URL with no `user:password@`) after the call

<!-- bkit:task 49 end -->
<!-- bkit:task 50 start -->

- [x] **TASK 50:** A failed command prints a Redis-style URL with an empty user name, `redis://:<password>@cache:6379`; both `URL_PASSWORD` and the replace regex need at least one user character before the `:`, so neither the env-value check nor the URL rewrite fires and the password is committed and posted in clear
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:372` · **Round:** 1
  - **DONE WHEN:** `URL_PASSWORD` (`workflows.ts:357`) and the rewrite at `workflows.ts:372` accept an empty user part (`[^\s/:@]*`), so `scheme://:<password>@host` becomes `scheme://:<redacted>@host` and a `*_URL` env var holding such a URL is replaced by name; the Task 26 `postgres://app:<fake>@db/app` case still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > redacts the password of a URL with an empty user name from the error and stderr files` fails on both files still holding the fake password of `redis://:<fake>@cache:6379/0` after the call

<!-- bkit:task 50 end -->
<!-- bkit:group 14 end -->

<!-- bkit:group 15 start -->

### TASK GROUP 15: Challenge round 2 findings

<!-- bkit:task 51 start -->

- [x] **TASK 51:** A verify, holistic or tests pause stops after `decisions check` refuses its questions (e.g. `**Q2 – Gap 1:**` with an en dash, a second exit 6 → Failure Path); on resume `openDecision` counts the engine's loop question as the file's question and prints `questions: 1`, so the `questions` = 0 route never fires, and with `Gate: FAIL` `gateRerun` is true: a green re-run sets `VERIFY_VERDICT` = PASS past verify gaps nobody was asked about, while a headless resume applies only the loop recommendation
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/open-decision.ts:430` · **Round:** 2
  - **DONE WHEN:** On a verify, holistic or tests pause whose decision file `decisions check` refuses, `openDecision` (and so `status resume`) reports it in a way the Open decision route reads (`questions: 0`, or a non-null check `problem` routed to **Decision Pause** step 2); `gateRerun` returns false for it; and `decisions apply --by=headless` exits 6 with the check's problem instead of applying the loop question's recommendation. A loop-only pause that passes `decisions check` still reads `questions: 1` and keeps its gate re-run.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision rows > a loop pause whose questions decisions check refuses resumes to Decision Pause step 2, not a gate re-run` fails on `openDecision` returning `questions: 1` and `gateRerun` returning `gateRerun: true` for a `From: verify` file holding `**Q2 – Gap 1:** …` (en dash) beside `countsRow()` (Gate FAIL, loop Try again / Stop)
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > exits 6 on a loop pause whose own questions decisions check refuses` fails on exit 0 with the loop question's recommended answer appended as a `decision-answer` row

<!-- bkit:task 51 end -->
<!-- bkit:task 52 start -->

- [x] **TASK 52:** An orchestrator closes a question's bold before the colon (`**Q1 — Task 3 [src/a.ts:10]**: MEDIUM: … Accept it?`); `decisions check` passes it because `itemProblem` reads the number from `**Q{n} — ` alone, but `parseDecisionItems` needs `:**` and reads the item as Q0 with an empty title, so the owner's `--answer=Q1=A` is refused as a usage error on every resume, a headless `Accept` lands as a `q: 0` row, and `tasks tick --decision` never ticks Task 3 because it reads the task number from the empty title
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:176` · **Round:** 2
  - **DONE WHEN:** `decisions check` reads each question head with the same rule `parseDecisionItems` uses (`**Q{n} — {title}:**`) and exits 6 naming the line when a head does not match it, so every question a passing check leaves parses with its own number and title, and `decisions apply --by=owner --answer=Q{n}={letter}` finds every question of a file that passed check.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a question whose bold closes before the colon, naming the line` fails on exit 0 for a challenge pause holding `**Q1 — Task 3 [src/a.ts:10]**: MEDIUM: the retry has no cap. Accept it?` with well-formed `A)` / `B)` options, a `Recommended:` line and a `Default if unanswered:` line

<!-- bkit:task 52 end -->
<!-- bkit:task 53 start -->

- [x] **TASK 53:** On a verify, holistic or tests pause the orchestrator writes its questions behind a list marker (`- **Q2 — Gap 1:** …`) or as `**Question 2 — …`; the stray-line rule only looks at lines that start `**Q{digit}` or `#`, and a loop pause may hold no question, so `decisions check` passes the file as loop-only with `questions: 0`: `decisions counts` offers Try again / Stop with no Decide, the owner's `--answer=Q2=…` is refused, and a headless run answers only the loop, dropping the gaps the questions were about
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:162` · **Round:** 2
  - **DONE WHEN:** `decisions check` exits 6 naming the line for a line that opens a question in a shape `ITEM_SPLIT` does not read, at least behind a list marker (`- `, `* `, `1. `) and as `**Question {n}`, on loop and non-loop pauses alike, so a loop pause passes as loop-only only when its file holds no question-like line.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a question line behind a list marker on a loop pause, naming the line` fails on exit 0 with `questions: 0` for a file holding `- **Q2 — Gap 1:** …` beside a `decision-counts` row whose loop offers Try again / Stop
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a question written as **Question 2 on a loop pause, naming the line` fails on exit 0 with `questions: 0` for a file holding `**Question 2 — Gap 1:** …` beside the same row

<!-- bkit:task 53 end -->
<!-- bkit:task 54 start -->

- [x] **TASK 54:** A failed Node command prints an axios-style error dump, `headers: { Authorization: 'Bearer <runtime-minted JWT>' }` or `{"Authorization":"Bearer <token>"}`; the Authorization rule needs `Authorization:` followed directly by whitespace and `Bearer|Basic`, so the quote between them defeats it, and a token held in no env var lands raw in the committed `{LOG_DIR}/{workflow}-stderr.md` / `-error.md`, pushed under `[skip ci]` where no secret scan runs and push protection recognises no generic JWT
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:363` · **Round:** 2
  - **DONE WHEN:** `scrubSecrets` replaces the credential after `Bearer` / `Basic` when the header name or the value is quoted (`Authorization: 'Bearer X'`, `"Authorization": "Bearer X"`, `'authorization': 'Basic X'`), case-insensitively, so after `bkit workflows fail` both failure files hold `<redacted>` in place of the value; the Task 48 unquoted `Authorization: Bearer X` case still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files` fails on both files still holding the fake runtime-built bearer value, written as `headers: { Authorization: 'Bearer <fake>' }` and as `{"Authorization":"Bearer <fake>"}`, after the call

<!-- bkit:task 54 end -->
<!-- bkit:group 15 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran. A later task that names an earlier task's test takes it over: the build reports the takeover and does not refuse it.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
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

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `bkit check` pass.
- [ ] **Test Synchronization:** no E2E tests exist for these paths; the existing unit tests that Tasks 5, 6, 8, 9, 11, 12 and 13 move, rewrite or delete are named in those tasks; the render baselines `.bkit/core/engine/render/__snapshots__/bkit-{design,plan,build,debug,ship}.none.txt` are regenerated in Tasks 4, 13, 14 and 15 and checked by `.bkit/core/engine/render/trackers.test.ts`; the generated regions of `.bkit/core/.bkit/cli.md` are regenerated in Tasks 6, 8, 10, 11, 12 and 13 and checked by `.bkit/core/engine/tools/cli-doc.test.ts`.
- [ ] **Build Configuration:** `tsconfig.json` `exclude` keeps `**/*.test.ts` out of `dist/`; no task adds a test-only file outside that pattern.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/steps.test.ts`, `challenge.test.ts`, `audit-report.test.ts`, `issues.test.ts`, `ledgers.test.ts`, `decisions.test.ts`, `open-decision.test.ts`, `status.test.ts`, `workflows.test.ts`):** the count checks, the audit table reader, the two decision files and their readers, and the removed JSON path, each row of the `Derived Test Matrix`, with temporary log folders per test.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `verdict-vocabulary.test.ts`, `.bkit/core/engine/audits/templates/template-shape.test.ts`):** the guards that no prompt, workflow or template names a removed path, verb or flag, that no prompt or workflow writes a file with a shell heredoc, that each count-checked prompt declares a known rule, and that every judgment field a result prompt names is a header line.
- [ ] **Text ceilings:** `pnpm bkit:text:ceiling check` exits 0 with both totals below 86494 (prompts) and 58535 (workflows).
- [ ] **Apply local migrations:** not applicable; the plan has no database and no migration.
- [ ] **Built CLI:** after `pnpm build`, `node dist/cli.js ledgers findings --help` and `node dist/cli.js help` exit 0, so no import cycle breaks the built CLI.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a fresh consumer installed from the packed tarball, run a `/bkit-build` in Claude Code auto mode through holistic verify; no permission prompt asks about a file under `.git/`, and `find .git docs/plans -name '*-result.json' -o -name 'decision-items.json'` prints nothing.
- [ ] **Step 2:** Edit one challenge report so its `Failures` line disagrees with its task blocks, then run `bkit steps finish` on it; the exit is 6 and the printed `problem` names the declared and the counted value.
- [ ] **Step 3:** Run one audit in the same consumer; the report is written once, `bkit ledgers findings --report=<report>` prints its totals, and the tracker comment's `Findings` line matches them.
- [ ] **Step 4:** Reach a build decision pause; the log folder holds `build-decision-{RUN}-{K}.md` with only the orchestrator's questions and no `*-engine.md` file, `status.jsonl` holds a `decision-counts` row for it, and the owner's message starts with the lines `decisions counts` printed.
