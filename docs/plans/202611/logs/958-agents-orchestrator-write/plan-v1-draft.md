# Agents and the Orchestrator Write Their Own .md, the Engine Only Checks Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

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
- Every renamed verb's old name: `decisions compose` (replaced by `decisions check` and `decisions loop`), `steps stub --result-file` / `--agent` / `--invocation`, `steps verdict --result-file`, and `issues comment --result-file` (replaced by `issues comment --report`).

#974 closes with this plan, through Tasks 1, 2, 3, 4 and 8. Task 3 closes point 1 (the ten prompts stop asking for the JSON copy) and Task 8 deletes the engine render that overwrote the hand-written report. Tasks 1 and 2 close point 2: the count rule makes `Failures` the number of `CRITICAL` items in the three prompts with a `Failures` field, so `PASS` with only `OPTIONAL` items is accepted; the fourth prompt, `bkit-design-review-1`, keeps its rule in the prompt (Q7). Task 4 closes point 3: the three unchecked renders at `bkit-plan.md:383-387` are deleted, so no hidden exit remains. Task 8 also removes the engine rule `Verdict PASS contradicts N finding(s)` that the bug reports.

**#1016 item 1 is covered by this plan.** The `Strategy` field the diagnose prompt names and the "root cause as a finding cannot be PASS" refusal both live in the `structured-result-file` line (`bkit-debug-failure-diagnose.md:122`) and in `renderResult`; Task 3 and Task 8 delete both. Task 1's guard test checks that every result prompt's header declares only fields and count rules `bkit steps finish` reads, which is the guard #1016 asks for. Items 2-4 of #1016 stay with #1016.

**The issue's nine success criteria.** The five most measurable ones are the Success Criteria below. The other four are carried as follows: "The JSON result path is gone from the engine and from `.bkit/core/.bkit/cli.md`" → Tasks 6, 8 and 15; "No prompt or workflow tells an agent to write into `{OUTBOX}` or `.git/` with a shell command" → Tasks 3, 4, 7, 13 and 14; "The changed prompts and workflows work in all five host renderings" → Task 15 (`bkit upgrade`, `bkit check`); the auto-mode dogfood run → Manual Verification.

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
- **WHEN** the build pauses for a decision **→ THEN** the orchestrator writes `build-decision-{RUN}-{K}.md` itself, `bkit decisions loop` writes the engine's `build-decision-{RUN}-{K}-engine.md` with the rounds, the base check and the loop question, and `bkit decisions check` checks the orchestrator's file.
- **WHEN** a workflow takes the Failure Path after its log folder exists **→ THEN** the orchestrator writes `{LOG_DIR}/{workflow}-error.md` with the file tool and `workflows fail --error-file` reads it; **IF** the log folder is not held yet **→ THEN** `--error-file` is dropped, as today.

### Concrete Example

**Setup:** A build runs in Claude Code auto mode in a fresh consumer checkout. It reaches holistic verify for `{FID}` with run 1, attempt 1. Two plan tasks are not satisfied, and both gaps are fixable.

**Steps:**

1. The orchestrator launches `@bkit-build-plan-verify` with **Create** = `build-plan-verify-holistic-1-1.md` and no `Result:` line → the agent writes the report with the file tool: two `TASK {N}` lines under `## Identified Gaps Log`, each ending `— Fixable: true`, and a header with `Verdict: CONCERNS`, `Failures: 2` and `Fixable: true`. No JSON file is written and no permission prompt appears.
2. The orchestrator runs `bkit steps finish --agent=bkit-build-plan-verify --artifact=build-plan-verify-holistic-1-1` → the engine counts two gap lines under `## Identified Gaps Log`, finds `Failures` and `Fixable` correct, and prints `verdict: CONCERNS` with exit 0.
3. A second run's agent writes `Failures: 1` over the same two lines → `steps finish` exits 6 and prints `reask` with `problem: Failures is 1, but ## Identified Gaps Log has 2 counted lines` → the orchestrator re-asks the agent once with that problem → the agent corrects the header with the edit tool → `steps finish` exits 0.
4. The gaps reach the Decision Pause → the orchestrator writes `build-decision-1-1.md` with one question per gap in its own words, starting at `Q2`; `bkit decisions loop` writes `build-decision-1-1-engine.md` with the attempt line, the `## Progress` block, the base-check line and the loop question `Q1` with its recommendation; `bkit decisions check` exits 0 on the orchestrator's file.

**Outcome:** The owner reads the engine file's attempt line, progress and `Q1`, then the orchestrator's `Q2` and `Q3`, in one message. No `*-result.json` or `decision-items.json` exists under `.git/bkit-outbox/{FID}/`, and each report was written once, by its agent.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A plan review or scope check says `PASS` and lists only `OPTIONAL` items | Its header `Failures: 0` matches zero items under `## CRITICAL`, so `steps finish` accepts it (#974 point 2). |
| A plan review says `PASS` with one item under `## CRITICAL` | `steps finish` exits 6: the count is 1 and `PASS` needs `Failures` 0. |
| A build challenge says `PASS` with a `HIGH` task block | `steps finish` exits 6: the prompt's rule is `PASS` = no findings, and the highest severity found is `HIGH`. |
| A verify report says `Fixable: false` while one gap line ends `Fixable: true` | `steps finish` exits 6 naming `Fixable`. |
| A header still carries a `Fingerprint:` line from an older render | It is read as an unknown extra line and ignored; no "stale" refusal remains. |
| `## CRITICAL` says `None` | It counts as zero items. |
| A report still has `PENDING` in a counted section | `steps finish` exits 5 (pending), as today. |
| A prompt header declares a count rule the engine does not know | `steps finish` exits 2 with a usage error naming the declaration; the guard test catches it in CI first. |
| An audit Findings table row has an empty `Severity` or an unknown `Key` | `ledgers findings` exits 6 naming the row's `ID`. |
| An audit report has no findings | `ledgers findings` prints `totals: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0` and no ledger rows, exit 0. |
| A decision pause has no loop | No engine file is written; the orchestrator numbers its questions from `Q1`, and `decisions check` accepts that. |
| The orchestrator's decision file has a question without option lines, or with options that are not lettered | `decisions check` exits 6 naming the question. |
| An old decision file (composed before this change) is reopened on resume | The merged reader reads its in-file `## Progress`, loop question and `Decision:` lines, so `openDecision`, `gateRerun` and `decisions skip` answer as before; no migration is needed. |
| `decisions apply --by=headless` runs | It writes each `Decision: Accept (assumed)` line into the engine file, never into the orchestrator's file. |
| Both files carry a `Decision:` line for one question | The engine file's line wins. |
| A Failure Path is taken before `LOG_DIR` is held | `--error-file` is dropped, as today, and the comment carries no error text. |
| Ship or auto takes the Failure Path | Ship writes `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`; auto writes the gitignored `.worktrees/bkit-error-auto.md` in the checkout (Q8). |
| A workflow names `steps stub --result-file`, `decisions compose` or another removed flag | The `workflow-shape` call check fails in CI. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit and Integration apply here; @live (golden), E2E, fresh-DB replay and Smoke are `Not applicable` in this repo. Every row's target is a colocated `*.test.ts`, which `docs/testing.md` § Where tests live places in the Unit tier, audits under `.bkit/core/engine/audits/` included. The verb tests run the real CLI verb against a temporary checkout, with no mock at the file boundary, so the lowest sufficient tier is Unit. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `promptHeader` reads a `<count of …>` declaration into the field's count rule | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `headerDeclaration` refuses an unknown count declaration | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| Every count-checked prompt declares a known count rule for `Failures`, and every header line of a result prompt parses through `promptHeader` (#1016 item 1 guard) | Unit | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` | 1 |
| `steps finish` checks `Failures` against the `## CRITICAL` items and ignores `OPTIONAL` ones, so `PASS` with only `OPTIONAL` items is accepted (#974 point 2) and a miscount is refused with `reask` and `problem` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `steps finish` refuses a verify `Fixable` that disagrees with its gap lines | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `steps finish` refuses a challenge `PASS` that carries any task block | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| No prompt names a `Result:` launch line or a structured result file | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 3 |
| No workflow names a `Result:` line, a `-result.json` file, `steps stub --result-file` or the Result-path delete line | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| `parseAuditReport` reads IDs, severities, titles and keys from an audit Findings table | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 5 |
| `parseAuditReport` refuses a row with an empty severity or an unknown key, naming its ID | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 5 |
| `ledgers findings --report` prints the totals and the ledger rows from a real report file | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 6 |
| `issues comment --kind=audit --report` derives the `Findings` field from the report | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 6 |
| Every audit template's Findings table has the `Title` and `Key` columns `parseAuditReport` reads | Unit | `.bkit/core/engine/audits/templates/template-shape.test.ts` | 7 |
| No prompt or workflow names `--result-file` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 7 |
| `steps stub` refuses `--result-file` as an unknown flag | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 8 |
| `steps verdict` reads a header with a leftover `Fingerprint:` line without a stale refusal | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 8 |
| The merged reader reads questions from the orchestrator's file and the loop question and progress from the engine file | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| The engine file's `Decision:` line wins over the orchestrator's for one question | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| An old single-file decision layout still reads the same | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| `decisions check` refuses a question with no lettered options, naming it | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 10 |
| `decisions check` refuses a `Q1` in the orchestrator's file when an engine file holds the loop question | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 10 |
| `decisions loop` writes the attempt line, progress, base check and loop question into the engine file only | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 11 |
| `decisions loop` recommends Try again or Decide from the counted rounds | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 11 |
| `decisions apply --by=headless` writes assumed decisions into the engine file and leaves the orchestrator's file unchanged | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 12 |
| `decisions apply --by=owner --confirm` writes the confirmation into the engine file | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 12 |
| No workflow names `decision-items.json` or `decisions compose` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 13 |
| No workflow names `{OUTBOX_ROOT}/error.md` or `{OUTBOX}/stderr.log` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 14 |

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
| Verb removed | `bkit decisions compose` (writes the decision file from `decision-items.json`) | `bkit decisions check` (checks the orchestrator's file) and `bkit decisions loop` (writes the engine's own file) | `bkit-build.md`, `.bkit/core/.bkit/cli.md`. A by-hand caller of `compose` gets "no such verb". |
| Flags removed | `bkit steps stub --result-file --agent --invocation` | None. `steps stub` keeps only its copy job (`--from`, `--to`, `--strip-header`), so its name stays. | plan, design, build and debug workflows; the audit prompt. |
| Flag removed | `bkit steps verdict --result-file` | None | `.bkit/core/.bkit/cli.md` |
| Flag renamed | `bkit issues comment --kind=audit --result-file` | `bkit issues comment --kind=audit --report=<report>` | `bkit-audit-generate.md` |
| Verb added | — | `bkit ledgers findings --report=<report>`: prints the audit finding IDs, totals and ledger rows | `bkit-audit-generate.md` |
| File added per paused build | — | `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{K}-engine.md`, written only by the engine | Readers of decision files: `openDecision`, `gateRerun`, `decisions skip`, `decisions pending`, `challenge merge` (`acceptedLocations`), `tasks tick --decision`, `workflows summary`. |
| Decision file layout | The engine wrote the whole file; `Status:` was a written line | The orchestrator writes its header and questions; the engine writes its lines in the `-engine.md` file; `Status` is computed on read from both files | Files composed before this change are still read (the merged reader keeps the old layout). |
| Failure Path error file | `{OUTBOX_ROOT}/error.md` and `{OUTBOX}/stderr.log` under `.git/bkit-outbox/` | `{LOG_DIR}/{workflow}-error.md` and `{LOG_DIR}/{workflow}-stderr.md`; ship uses its worktree's log folder; auto uses the checkout's gitignored `.worktrees/bkit-error-auto.md` | Six workflows, the clause `workflow-error-file`, `.bkit/core/.bkit/workflows.md:807`. |
| Report header placeholders | `Failures: <integer >= 0>` in six result prompts | `Failures: <count of …>`, a declaration `steps finish` checks | The six prompts and their reports. |
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
- **Assumption:** A run that resumes across the upgrade has at most one open decision file in the old single-file layout. → If the merged reader mis-reads an old file, a resumed pause asks its questions again; Task 9's old-layout test covers this.
- **Assumption:** The error file in the log folder may be committed with the run's later bookkeeping. → Its text is the same text the failure comment already posts to the issue, so committing it publishes nothing new; if a tool response ever holds a secret, it was already in the comment.
- **Q1 — How the engine knows each report's count rule:** The engine has one rule for every agent today. The question is how it learns that a plan review counts only `CRITICAL` items while verify counts gap lines, without a code rule per agent.
  - A) Each prompt's header line declares what its count is, for example `Failures: <count of items under ## CRITICAL>`. `promptHeader` already reads that template line, and `steps finish` checks the count against a closed set of three counting rules (items under `## CRITICAL`; `CRITICAL` task blocks under `## Findings Log`; lines under `## Identified Gaps Log`). Verify's `Fixable` is checked against whether any counted line ends `Fixable: true`. The challenge prompts' extra rule (`PASS` = no findings, `CONCERNS` = highest severity `HIGH` or lower) is checked where `steps finish` already reads the challenge's task blocks with `parseFindings`. — The rule sits next to the prompt text it enforces, and a new agent needs no engine change unless it counts a new kind of section.
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
- **Q3 — Where the pause's counts live:** The engine's numbers for a decision pause (rounds run, whether the last round changed code, failing tests that also fail on `dev`, and the Try again or Decide recommendation) may not go into the orchestrator's file. The owner still needs to see them next to the questions.
  - A) The engine writes its own file beside the orchestrator's, `build-decision-{RUN}-{K}-engine.md`, with the attempt line, the `## Progress` block, the base-check line and the loop question as `Q1`, through a new verb `decisions loop`. The orchestrator shows both files in one message. — Two files per pause, but each has one writer and both are committed with the run.
  - B) A status row. — No new file, but the owner cannot read a status row, and the orchestrator would have to copy the numbers into its message by hand.
  - C) Printed keys only. — Nothing is kept, so a resumed run loses the numbers.
  - Recommended: A) — it is the only option where the numbers are kept, readable and written only by the engine.
  - Default if unanswered: the plan assumes A.
- **Q4 — Where a settled decision is written:** `decisions apply` writes the taken option and `Status` into the decision file today. With the orchestrator owning that file, an engine-written `Decision:` line there would make two writers of one file, which the owner's decision ruled out.
  - A) Every line the engine writes (a headless assumed `Accept`, a gate re-run, ship's confirm or reject) goes into the `-engine.md` file. Readers merge both files, the engine's line wins for a question, and `Status` is computed on read instead of written. The orchestrator writes only the owner's answers in its own file. — Each file has one writer; readers change once, in one shared reader.
  - B) Status rows. — The decision text leaves the files the owner reads.
  - C) Keep the engine writing into the orchestrator's file. — Contradicts decision `958-agent-writes-engine-counts-verbs-named-for-what-they-do`.
  - Recommended: A) — it keeps one writer per file and one reader for all callers.
  - Default if unanswered: the plan assumes A.
- **Q5 — Where the error file lives:** The Failure Path error text moves out of `.git/bkit-outbox/`. It needs a folder that exists in each workflow and that the file tool may write without a prompt.
  - A) `{LOG_DIR}/{workflow}-error.md`, with the failed command's stderr beside it as `{workflow}-stderr.md`. Ship, which holds no `LOG_DIR`, uses `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/`. Before `LOG_DIR` is held, `--error-file` is dropped, as today. `workflows fail` keeps only reading the file; the handover commit or the next bookkeeping commit carries it. — The text stays with the run's record.
  - B) `tmp/bkit-error-{FID}.md` in the checkout. — Never committed, so the record of why a run stopped is lost; and `tmp/` is not in bkit's managed `.gitignore` block, so a consumer could commit it by accident.
  - Recommended: A) — the error file is part of the run's record, like its other logs.
  - Default if unanswered: the plan assumes A.
- **Q8 — Where `bkit-auto` writes its error file:** The auto router runs in the main checkout and never holds a feature log folder, so Q5's answer does not reach it. It needs a path outside `.git/` that no commit picks up.
  - A) `.worktrees/bkit-error-auto.md`. `.worktrees/` is in bkit's managed `.gitignore` block in every consumer (`BKIT_GITIGNORE_LINES`), and no engine code lists that folder's entries. — Always ignored, but it puts a loose file next to the worktree folders.
  - B) Add `tmp/` to bkit's managed `.gitignore` block and write `tmp/bkit-error-auto.md`. — A tidier path, but it changes every consumer's `.gitignore` on upgrade for one file.
  - C) Auto drops `--error-file` and posts no error text. — Nothing to write, but the failure comment no longer says why the route stopped.
  - Recommended: A) — it is the only option that keeps the error text and changes no consumer file.
  - Default if unanswered: the plan assumes A.
- **Q6 — Verb names:** Every verb whose job changes needs a name for its new job, with no alias kept.
  - A) `decisions compose` is removed; `decisions check` checks the orchestrator's file and `decisions loop` writes the engine file. `steps stub` keeps its name and loses `--result-file`, `--agent` and `--invocation`, because its remaining job (copying a template into a stub) does not change. `steps verdict` loses `--result-file`. `issues comment --result-file` becomes `--report`. `ledgers findings` is new. — Each name says what the verb does now.
  - B) Keep `decisions compose` for the loop file. — "compose" would then name a verb that composes nothing the owner wrote, which the decision rules out.
  - Recommended: A) — it follows the owner's naming rule with the fewest new names.
  - Default if unanswered: the plan assumes A.
- **Q7 — The `PASS` rule for `bkit-design-review-1`:** Four prompts say `PASS` means no `CRITICAL` items. Three of them (plan review 1 and 2, scope check) have a `Failures` field, so Q1's count rule checks them. `bkit-design-review-1` has no `Failures` field.
  - A) Add `Failures: <count of items under ## CRITICAL>` to `bkit-design-review-1`, so the engine checks its rule too. — The engine checks it, but its `FAIL` (design not feasible) can hold zero `CRITICAL` items, which the `FAIL` needs `Failures` above 0 rule would then refuse.
  - B) Keep the rule in the prompt only. — The engine does not check it, but nothing downstream reads its verdict for this: `@bkit-design-update` applies every `CRITICAL` item whatever the verdict.
  - Recommended: B) — A would refuse a correct `FAIL`, and no route depends on this verdict's count.
  - Default if unanswered: the plan assumes B.

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
| An upgrade migration that rewrites old decision files to the two-file layout | Not needed: the merged reader keeps the old layout readable, and old files are closed records. |

**Recommendation for a future phase:** the orchestrator's other `.md` writes under `.git/bkit-outbox/` (`plan-answers.md`, `design-answers.md`, `issue-text.md`, the audit `comment.md` and `parent-comment.md`) can move to the log folder the same way the error file does. They are listed under `Suggested Scope Expansion`, not built here.

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
| The orchestrator's other `.md` writes under `.git/bkit-outbox/`: `{OUTBOX}/plan-answers.md` (`bkit-plan.md:541`), `{OUTBOX}/design-answers.md` (`bkit-design.md:635`), `{OUTBOX}/issue-text.md` (`bkit-debug.md:370`), the audit's `{OUTBOX_ROOT}/audit-{slug}/comment.md` and `parent-comment.md` | Plan investigation; issue #958 Problem (writes inside `.git/` raise permission prompts) | Task 14's move of the error file; Task 7's audit prompt edit | Needs a design decision: the same move to the log folder, as its own issue. |
| #1016 items 2-4 (`correctable` / `scope` only with `--json`; bare keys refused on a `**Ledger rows:**` line; three exit codes for a held lock) | #1016 | `.bkit/core/engine/commands/lib.ts`, `ledgers.ts`, the six workflows | Keep with #1016; item 1 is covered here. |
| M6: hand-written JSON warning records in `bkit-audit-generate.md` and `bkit-debug-failure-diagnose.md`, dropped silently when malformed (`summary.ts`) | #964 cross-check comment on #958 | Task 3 and Task 7 edit both prompts | Fold in only by owner decision; it is a second JSON hand-write of the same kind. |
| G7: JSON facts files in ship (`bkit-ship.md` around `:293`, `:706`, `:777`) | #964 cross-check comment on #958 | Ship's Failure Path in Task 14 | Keep deferred; check whether all three are on the `gh`-missing path first. |
| E5: four flags with no caller (`ledgers append --issue-operation`, `counters --request-hash`, `counters progress --since-clean`, `status invocation --configured-model/--observed-model`) | #964 cross-check comment on #958 | Task 8 removes `steps stub --invocation`, the related G5 flag | Needs a design decision; not touched by this plan. |
| M3: nine prompts forbid writing the attempt number, timestamp, invocation id or model (`steps-finish-derives` clause) | #964 cross-check comment on #958 | Prompts edited in Task 3 | Keep: those prompts are not result prompts, and the engine still derives those values at `steps finish`. |
| `PAUSE_MAX` not raised after a granted Try again, and an empty `--max=` read as 0, in the loop recommendation | `docs/deferrals.jsonl` `912-debug-loop-question-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-463` and `-464` | Task 11 moves that recommendation code into `decisions loop` | Fold in by owner decision; the moved code keeps today's behaviour otherwise. |

## Security & Privacy

None — no new routes, DB writes, secrets, or user input.

- [ ] **New API Route** — not applicable.
- [ ] **New DB Table/Column** — not applicable.
- [ ] **Role-Gated Mutation** — not applicable.
- [ ] **User Input** — not applicable: the new readers (`reportSection`, `parseAuditReport`, `decisionItems`, `decisions check`) parse agent-written text and refuse malformed text with an exit code; they never execute it (`docs/security.md` § Untrusted Content & Prompt Injection). No subprocess is added (§ Shell Injection).
- [ ] **PII** — not applicable: the error file holds the same text the failure comment already posts, and no personal-data field is added.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added or removed. `parseMarkdownTable` (`.bkit/core/engine/shared/text.ts`) and `node:fs` cover the new readers, so `package.json` and `pnpm-lock.yaml` stay unchanged.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-18) lists `oxlint` 1.92.0 → 1.93.0, `@types/node` 24.19.2 → 26.6.6 and `vite` 6.4.5 → 8.3.8, all dev-only; none blocks this build. Toolchain: Node v24.16.0, pnpm 10.34.9. No stack CLI or backend is involved.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** every file the plan changes is readable and writable in the worktree `.worktrees/958-agents-orchestrator-write`. No user information is missing; the open questions above are the only owner inputs.
- [ ] **Project Context:** read the four 958 rows and `467-failure-error-text-through-file` in `docs/decisions.jsonl`, and the open `docs/deferrals.jsonl` rows on `decisions.ts` (`912-debug-loop-question-*`, `703-standardise-question-option-*`). `docs/knowledge.jsonl` has no row on the result path.
- [ ] **Project Documents:** `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` are assessed through `.agents/docs.md`; the plan's test strategy follows `docs/testing.md` § Where tests live and § Which tier does a behaviour need?. Sources are in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable — no credential or env var is added.
- [ ] **Schema State:** not applicable — bkit owns no database (`docs/data-schema.md` § Overview); no JSONL field changes.
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
| architecture | `docs/architecture.md` | yes — new engine verbs and a new log file kind | `docs/architecture.md` § File placement, § Package boundaries | covered | None. The engine file `build-decision-{RUN}-{K}-engine.md` is a plan log under `docs/plans/`, a kind the table already places. |
| technology | `docs/technology.md` | yes — engine code in TypeScript, tests in Vitest | `docs/technology.md` § Stack, § Conventions | covered | None. |
| security | `docs/security.md` | yes — files the engine parses are agent-written | `docs/security.md` § Untrusted Content & Prompt Injection, § Shell Injection, § Workflow comment ownership | covered | None. The new readers parse text only and run nothing. |
| testing | `docs/testing.md` | yes — every task adds tests | `docs/testing.md` § Tiers this project has, § Where tests live, § Which tier does a behaviour need?, § Test first, the per-file table rows for `steps.test.ts`, `decisions.test.ts`, `open-decision.test.ts`, `issues.test.ts`, `ledgers.test.ts`, `workflow-shape.test.ts`, `template-shape.test.ts` | covered | The `decisions.test.ts` row names `compose`; Task 15 updates it. |
| data-schema | `docs/data-schema.md` | no — no database and no JSONL field change; decision and error files carry no personal data | `docs/data-schema.md` § Overview, § Private outbox records | covered | None. |
| observability | `docs/observability.md` | no — no new log, span or telemetry row | `docs/observability.md` § Command result and exit code row | covered | None. |
| deployments | `docs/deployments.md` | no — no CI, release or branch change | `docs/deployments.md` § Failure Path abort-push guard | covered | None. |
| migrations | `docs/migrations.md` | yes — checked whether a consumer file needs rewriting | `docs/migrations.md` (register) | covered | None. No migration is needed (see Breaking Changes). |
| capabilities | `docs/capabilities.md` | yes — checked for rows naming the removed verbs | `docs/capabilities.md` (text search for `compose`, `result-file`, `renderResult`, `steps stub`) | covered | None. No row names them. |
| workflow and CLI contract | `.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/prompts.md`, `.bkit/instructions.md` | yes — the contract changes | `.bkit/core/.bkit/cli.md` lines 41, 45, 168-178, 215, 360-362, 399; `.bkit/core/.bkit/workflows.md` lines 237, 666, 807, 990-993, 1030; `.bkit/core/.bkit/prompts.md` line 447; `.bkit/instructions.md` § Clauses (`result-path-cleared` to `stub-seed-fingerprint`, `workflow-error-file`, `workflow-finish`) | covered | Updated in Tasks 3, 4, 8, 13, 14 and 15. |
| design | `docs/design.md` | no — no UI | none | none | None. |
| noise / setup | `docs/noise.md`, `docs/setup.md` | no — no local-setup or noise change | none | none | None. |

## Documentation Warnings

None

## Data Schema Integration

bkit owns no database (`docs/data-schema.md` § Overview). The change touches files, not a schema: agent reports and decision files under `docs/plans/{YYYYMM}/logs/{FID}/`, and the rows `ledgers findings` prints for an existing `docs/failures.jsonl` append.

### Data Schema Usage

- **Input (Read):** `docs/failures.jsonl` rows through `bkit ledgers query --ledger=failures` (the audit agent's existing open-row lookup); `status.jsonl` rows through `loopProgress` for `decisions loop`.
- **Output (Write):** `docs/failures.jsonl` rows the audit agent appends with `bkit ledgers append`, from the `ledgerRows` that `ledgers findings` prints. Their fields (`key`, `severity`, `summary`, `description`, `references`, `status`) are unchanged.

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A report header declares how its count is made | `.bkit/core/engine/commands/workflow/steps.ts` | `grep -n 'promptHeader\|integer: true\|<integer' steps.ts`; `grep -ln '^Failures: <integer' .bkit/core/prompts/*.md`; `docs/capabilities.md` text search | `promptHeader` — reads each template header line and marks `<integer` fields; missing a count rule | EXTEND | `promptHeader` also reads `<count of …>` into one of three known count rules and refuses an unknown one. |
| `steps finish` checks a count and a verdict against the report body | `.bkit/core/engine/commands/workflow/steps.ts` | `grep -n 'failuresProblem\|readHeader\|parseFindings\|reask' steps.ts`; `grep -n 'export function' challenge.ts` | `readHeader`, `failuresProblem`, the `reask` / `problem` output of `finish`, and `parseFindings` in `challenge.ts`; missing the count comparison | EXTEND | `finish` compares the declared count to the counted section and prints `reask` with an actionable `problem` on exit 6. |
| Read one `##` section of a report | `.bkit/core/engine/commands/workflow/challenge.ts` | `grep -rn 'function findingsLog\|function sectionOf' .bkit/core/engine --include='*.ts'` | `findingsLog` in `challenge.ts` (the `## Findings Log` section only); `sectionOf` in `tools/instructions-sources.ts` (an authoring tool, outside `commands/`) | EXTEND | `findingsLog` takes the heading as a parameter, so `## CRITICAL` and `## Identified Gaps Log` reuse it; `parseFindings` keeps calling it for `## Findings Log`. |
| Guard: every result prompt's header is one `steps finish` reads | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` | `ls audits/workflows`; `grep -n '  it(' verdict-vocabulary.test.ts` | `verdict-vocabulary.test.ts` — already reads each prompt's `Verdict:` declaration; missing the other header fields | EXTEND | Adds a test that every header field line of an agent whose report `steps finish` reads parses through `promptHeader`. |
| Guard: no prompt or workflow names a removed path or verb | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | `grep -n 'removed sub-plan flag\|unknownCalls' workflow-shape.test.ts`; `counter-prose-audit.test.ts` and `runtime-prose-audit.test.ts` headers read | `workflow-shape.test.ts` "engine calls" (unknown verbs and flags; `no workflow names a removed sub-plan flag`); the two prose audits guard other rules | EXTEND | Adds forbidden-string tests beside the removed-flag test, covering prompts as well as workflows. |
| Read the audit report's Findings table | `.bkit/core/engine/commands/workflow/issues.ts` | `grep -n 'parseAuditResult\|auditTotals\|auditEntries\|auditLedgerRows' issues.ts`; `grep -rn 'export function parseMarkdownTable' .bkit/core/engine/shared` | `parseAuditResult` (reads the JSON), `auditTotals`, `auditEntries`, `auditLedgerRows`; `parseMarkdownTable` in `shared/text.ts` | EXTEND | `parseAuditResult` becomes `parseAuditReport`, which reads the report's `## Findings` table with `parseMarkdownTable`; the totals and ledger-row builders are reused unchanged. |
| Print the audit totals and ledger rows | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n 'name: "' ledgers.ts`; `grep -n 'ledgerKeys' steps.ts issues.ts` | the `ledgers` noun (append, query, check, triage …); `ledgerKeys` in `steps.ts`; `auditLedgerRows` in `issues.ts` | EXTEND | Adds the `findings` verb to the `ledgers` noun; `ledgerKeys` moves from `steps.ts` to `issues.ts` beside its only remaining caller. |
| Post the audit comment from the report | `.bkit/core/engine/commands/workflow/issues.ts` | `grep -n 'result-file\|auditHeaderFields' issues.ts` | `issues comment --kind=audit --result-file` | EXTEND | `--result-file` becomes `--report`, read through `parseAuditReport`. |
| Audit Findings tables carry title and key | `.bkit/core/docs/templates/bkit-audit-*.md` | `grep -l '^\| ID \| Severity' .bkit/core/docs/templates/bkit-audit-*.md` (35 files) | the 35 templates' Findings tables | EXTEND | Each table gains `Title` and `Key` columns. |
| Read a decision as the orchestrator's file plus the engine's file | `.bkit/core/engine/commands/workflow/open-decision.ts` | `grep -rln 'parseDecisionItems\|openDecision' .bkit/core/engine --include='*.ts'` | `parseDecisionItems`, `decisionHeader`, `openDecision`, `gateRerun`, `skipProblem`; `statusOf` in `decisions.ts` | EXTEND | Adds one reader that merges a decision file with its `-engine.md` sibling; every caller moves to it, and `Status` comes from `statusOf` on the merged items. |
| Check the orchestrator's decision file | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -n 'name: "' decisions.ts`; `grep -n 'letterAt\|composeItems' decisions.ts` | `compose` (validates items while writing them), `parseDecisionItems` | EXTEND | `compose` is replaced by `check`, which keeps compose's item rules and reads the file instead of writing it. |
| Write the engine's pause counts | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -n 'loopProgress\|readBaseCheck\|FIXED_EFFECTS' decisions.ts counters.ts` | `compose --loop` (attempt line, `## Progress`, base check, loop question, recommendation) | EXTEND | The loop half of `compose` becomes the `loop` verb and writes `-engine.md`. |
| Engine-written decision lines | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -n 'addUnder\|by=headless\|--confirm' decisions.ts` | `apply` (`--by=headless`, `owner` or `rerun`) writing into the decision file | EXTEND | `apply` writes into `-engine.md`. |
| Failure Path error file outside `.git/` | `.bkit/instructions.md` | `grep -n 'error.md\|stderr.log' .bkit/core/workflows/*.md .bkit/instructions.md .bkit/core/.bkit/*.md` | clause `workflow-error-file` (five workflows) and the inline line in `bkit-auto.md`; `workflows fail --error-file` already reads any path | EXTEND | The clause names the log-folder path; the engine is unchanged. |

## Architecture & Component Changes

Every change follows a `Reuse Inventory` `EXTEND` row; the plan adds no source file. The only new file kind, `build-decision-{RUN}-{K}-engine.md`, is a runtime plan log the engine writes under `docs/plans/{YYYYMM}/logs/{FID}/`, which `docs/architecture.md` § File placement already places.

**Ledger rows:** `958-report-header-declares-its-count-rule`, `958-audit-findings-table-title-and-key-columns`, `958-pause-counts-in-engine-decision-file`, `958-engine-decision-lines-in-engine-file-status-computed`, `958-failure-error-file-in-log-folder`, `958-auto-error-file-in-worktrees-folder`, `958-verb-names-decisions-check-loop-ledgers-findings`, `958-design-review-1-pass-rule-stays-in-prompt`, `958-agents-edit-source-files-through-the-shell`, `958-orchestrator-held-values-move-to-engine`

### Database Migrations

None — bkit owns no database.

### Engine: report checks

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** the file exists (2623 lines).
- `promptHeader`: a header placeholder `<count of items under ## CRITICAL>`, `<count of CRITICAL task blocks under ## Findings Log>` or `<count of lines under ## Identified Gaps Log>` sets the field's count rule; any other `<count of …>` is a usage error naming the prompt and the line.
- `finish`: for each `--agent` whose header has a count rule, count the named section of the artifact and compare it to the field; for verify, compare `Fixable` to whether any counted line ends `Fixable: true`; for `bkit-build-challenge-*`, check the verdict against the highest severity `parseFindings` returns. A mismatch exits 6 (`EXIT_INVALID`) and prints `reask` plus a `problem` that names the field, the declared value and the counted value. `failuresProblem` stays.
- Remove the `// stub --result-file` section: `DERIVED_FIELDS`, `AUDIT_AGENT`, `withFingerprint`, `fingerprintOf`, `ledgerKeys` (moved to `issues.ts`), `renderAudit`, `renderResult`, `readResult`; and `FINGERPRINT`, `artifactFingerprint`, `fingerprintProblem` with their calls in `readHeader` and `steps verdict`.
- `steps stub`: remove the `--agent`, `--result-file` and `--invocation` flags and their branch; the copy mode (`--from`, `--strip-header`, `STUB_HEADER`) is unchanged. `steps verdict`: remove `--result-file`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/challenge.ts`

- **Existence Check:** the file exists (797 lines).
- `findingsLog(text)` becomes `reportSection(text, heading)`; `parseFindings` passes `## Findings Log`.
- Remove `structuredFindings` and `renderFindingsLog` (only `steps.ts`'s render path calls them).
- `acceptedLocations`: read each decision through the merged reader, and list only `build-decision-*.md` files that do not end `-engine.md`.

### Engine: audit report

#### [MODIFY] `.bkit/core/engine/commands/workflow/issues.ts`

- **Existence Check:** the file exists (1362 lines).
- `parseAuditResult` becomes `parseAuditReport(text, slug)`: it reads the `## Findings` table with `parseMarkdownTable`, needs `ID`, `Severity`, `Title`, `Location` and `Key` per row, and refuses an empty or unknown `Severity`, an empty `Title` and a `Key` that is neither `new` nor an `audit-{slug}-` key, naming the row's `ID`. `auditTotals`, `auditEntries` and `auditLedgerRows` are reused; `ledgerKeys` moves here from `steps.ts`.
- `issues comment --kind=audit`: `--result-file` becomes `--report`; the `Findings` field comes from `auditTotals` over the parsed report.

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`

- **Existence Check:** the file exists (2717 lines).
- New verb `ledgers findings --report=<file> [--slug=<slug>]`: prints `ids`, `totals` and `ledgerRows` from `parseAuditReport`; exit 6 on a malformed table, exit 2 on a missing file.

#### [MODIFY] `.bkit/core/docs/templates/bkit-audit-*.md` (35 files)

- **Existence Check:** 35 templates, each with a `| ID | Severity |` Findings table.
- Add a `Title` column after `Severity` and a `Key` column at the end of each Findings table, with a one-line placeholder rule (`Key` = `new`, or the matching open `docs/failures.jsonl` row's key).

### Engine: decision files

#### [MODIFY] `.bkit/core/engine/commands/workflow/open-decision.ts`

- **Existence Check:** the file exists (251 lines).
- Add `decisionItems(read, rel)`: reads `rel` and its `-engine.md` sibling, merges their items by question number (the engine file's `Decision:` line wins), and keeps the old single-file layout readable. `decisionHeader`, `undecidedBesidesLoop`, `gateRerun`, `skipProblem` and `openDecision` read through it; `Status` comes from the merged items.

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.ts`

- **Existence Check:** the file exists (720 lines).
- Remove `compose`, `composeItems` and `itemLines`. Add `check --file=<decision file>`: refuses a question with no lettered option lines, a duplicate number, a `Q1` when the `-engine.md` sibling holds the loop question, and a hard blocker with a recommendation, each naming the question (exit 6).
- Add `loop --out=<decision file> --loop=tests|verify|holistic --file=<status.jsonl> --attempt= --max= [--group=] [--base-check=]`: writes the `-engine.md` sibling with the attempt line, `## Progress` from `loopProgress`, the base-check line from `readBaseCheck`, and the loop question `Q1` with the engine's recommendation (the logic moved from `compose --loop`).
- `apply` (`--by=headless`, `rerun`, `owner`) writes its lines into the `-engine.md` sibling; `statusOf` computes `Status` on read. `decisionFiles` skips `-engine.md` files.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`, `summary-findings.ts`, `tasks.ts`

- **Existence Check:** each file exists and calls `parseDecisionItems` on one decision file's text.
- Each call reads through `decisionItems`, so the summary, the challenge-finding acceptance check and `tasks tick --decision` see engine-written decisions.

### Engine: generated docs and build output

#### [MODIFY] `.bkit/core/.bkit/cli.md` and `dist/`

- `pnpm cli:sync` regenerates the verb tables from the registry; `pnpm build` regenerates `dist/`. Both land in the same change.

### Prompts, workflows and clauses

#### [MODIFY] `.bkit/instructions.md`

- Delete the clauses `result-path-cleared`, `structured-result-file`, `structured-result-render`, `structured-supply-only` and `stub-seed-fingerprint`.
- `workflow-error-file`: name `{LOG_DIR}/{workflow}-error.md` and `{LOG_DIR}/{workflow}-stderr.md`, dropping `--error-file` while `LOG_DIR` is not held.
- `workflow-finish`: the re-ask passes the printed `problem` ("Your prior output '<reask.artifact>' was refused: <problem>. Fix that in the file. Do not redo work.").
- `pnpm instructions:sync` writes the clause changes into their carriers.

#### [MODIFY] `.bkit/core/prompts/` (13 prompts)

- The ten result prompts lose the clause lines above. The six with `Failures` declare their count rule; plan review and scope-check placeholders under `## CRITICAL` say one top-level `-` item per finding.
- `bkit-design-organise.md`, `bkit-design-update.md`, `bkit-plan-update.md` lose `stub-seed-fingerprint`.
- `bkit-audit-generate.md`: remove the "Serialize the findings once" bullet; after the report is complete, run `bkit ledgers findings --report=<Create>` and append its printed `ledgerRows`; post with `issues comment --kind=audit --report=<Create>`.

#### [MODIFY] `.bkit/core/workflows/` (6 workflows)

- `bkit-plan.md`, `bkit-design.md`, `bkit-build.md`, `bkit-debug.md`: delete the 12 `Result:` lines, the 12 render commands and the `result-path-cleared` lines.
- `bkit-build.md` Decision Pause: step 2 writes the decision file's header and questions with the file tool, runs `decisions loop` when the pause has a loop, then `decisions check`; step 4 shows the engine file's lines first; step 6 writes no `Status` line. The Decision Pause gate box names `decisions check`.
- All six: the Failure Path error file per `958-failure-error-file-in-log-folder`; `bkit-auto.md` uses `.worktrees/bkit-error-auto.md` (Q8).

#### [MODIFY] `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/prompts.md`, `docs/testing.md`

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
| `decisions compose`, `composeItems`, `itemLines` in `.bkit/core/engine/commands/workflow/decisions.ts`; `{OUTBOX}/decision-items.json` | `decisions check`, `decisions loop` | DELETE | Decision `958-orchestrator-writes-decision-and-error-md-no-error-ledger-row`. |
| `Decision:` and `Status` lines the engine wrote into the orchestrator's decision file | The `-engine.md` file; `Status` computed on read | DELETE | One writer per file. Old files stay readable through the merged reader, which is reading support, not a second way to write. |
| Clauses `result-path-cleared`, `structured-result-file`, `structured-result-render`, `structured-supply-only` in `.bkit/instructions.md` | None | DELETE | The text they carried asks for the second copy. |
| `{OUTBOX_ROOT}/error.md`, `{OUTBOX}/stderr.log` | `{LOG_DIR}/{workflow}-error.md`, `{LOG_DIR}/{workflow}-stderr.md` | DELETE | Decision `958-failure-error-file-in-log-folder`. |
| `describe("bkit steps stub --result-file")` in `.bkit/core/engine/commands/workflow/steps.test.ts`, `describe("structured challenge findings")` in `.bkit/core/engine/commands/workflow/challenge.test.ts`, the `compose` tests in `.bkit/core/engine/commands/workflow/decisions.test.ts` | The new check, reader and `loop` tests | DELETE | They test removed code; the `compose --loop` cases move to `decisions loop`. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | None — no new gotcha is known before the build. |
| `docs/decisions.jsonl` | The eight plan rows on the `**Ledger rows:**` line, written by this plan step. |
| `docs/architecture.md` | None — no topology change; the engine file is a plan log the table already places. |
| `docs/technology.md` | None. |
| `docs/data-schema.md` | None — no store or field change. |
| `docs/design.md` | None — no UI. |
| `docs/testing.md` | The per-file rows for `steps.test.ts`, `decisions.test.ts` (`check` / `loop` / `apply` / `skip` / `pending`), `open-decision.test.ts` (the merged reader), `issues.test.ts`, `ledgers.test.ts` (`findings`), `workflow-shape.test.ts`, `verdict-vocabulary.test.ts`, `template-shape.test.ts` (Task 15). |
| `docs/observability.md` | None — no new log name or span. |
| `.bkit/core/.bkit/cli.md` | Regenerated by `pnpm cli:sync`; hand text at lines 41 and 45 (`{OUTBOX}` contents), 168-178 (decisions table), 215, 360-362, 399 (Tasks 6, 8, 10-13, 15). |
| `.bkit/core/.bkit/workflows.md` | Lines 237, 666, 807, 990-993 and 1030: result path, decision pause and Failure Path text (Tasks 13, 14, 15). |
| `.bkit/core/.bkit/prompts.md` | Line 447: the result-file note (Task 15). |
| `.bkit/instructions.md` | Clauses deleted and edited (Tasks 3, 4, 8, 14); `pnpm instructions:sync`. |
| `docs/migrations.md` | None — no consumer file is rewritten. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | bkit owns no database. |
| **Code** | `git revert` of the change's commits | `git revert {COMMIT}`. A consumer that already upgraded runs `bkit upgrade` from the reverted release. Decision files written under the new layout keep reading on the old engine only for their orchestrator half, so revert before a paused build resumes. |
| **Risk window** | A build paused across the upgrade | The merged reader reads old files, so the forward window is safe; the reverse window is the note above. |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: the engine's checks first, so every report the agents write from Group 1 on is checked; then the audit agent, so the JSON path has no caller left before Task 8 removes it; then the decision files; then the Failure Path file and the docs. Each group ends with both word totals at or below their ceilings, and the group's last word-cutting task runs `pnpm bkit:text:ceiling lower`, so `pnpm bkit:text:ceiling check` passes at every group gate. No task runs `raise`. Engine tasks rebuild `dist/` with `pnpm build` in the same task.

Integration advice (not a gate): one PR for all tasks is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Reports are checked, not rendered

Source files: `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/instructions.md`, the ten result prompts in `.bkit/core/prompts/`, `.bkit/core/workflows/bkit-plan.md`, `bkit-design.md`, `bkit-build.md`, `bkit-debug.md`; tests in `steps.test.ts`, `verdict-vocabulary.test.ts`, `workflow-shape.test.ts`.

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Declare each report's count rule in its prompt header, and read it in `promptHeader`
  - **UPDATE:** `promptHeader` in `.bkit/core/engine/commands/workflow/steps.ts`: a `<count of items under ## CRITICAL>`, `<count of CRITICAL task blocks under ## Findings Log>` or `<count of lines under ## Identified Gaps Log>` placeholder sets the field's count rule and keeps `integer: true`
  - **UPDATE:** `DeclaredField` in `.bkit/core/engine/commands/workflow/steps.ts`: gains the optional count rule
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: a new exported `headerDeclaration(line)` parses one placeholder and throws a usage error on any other `<count of …>`
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-review-1.md`: the `Failures:` header line declares `<count of items under ## CRITICAL>`, and the `## CRITICAL` placeholder says one top-level `-` item per finding
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-review-2.md`: the `Failures:` header line declares `<count of items under ## CRITICAL>`, and the `## CRITICAL` placeholder says one top-level `-` item per finding
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-scope-check.md`: the `Failures:` header line declares `<count of items under ## CRITICAL>`, and the `## CRITICAL` placeholder says one top-level `-` item per finding
  - **UPDATE:** `.bkit/core/prompts/bkit-build-challenge-1.md`: the `Failures:` header line declares `<count of CRITICAL task blocks under ## Findings Log>`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-challenge-2.md`: the `Failures:` header line declares `<count of CRITICAL task blocks under ## Findings Log>`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the `Failures:` header line declares `<count of lines under ## Identified Gaps Log>`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts`: the guard test below
  - **READ:** `docs/testing.md`: § Test first, § Where tests live
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files, before the prompt edits
  - **DONE WHEN:** `promptHeader("bkit-plan-review-1")` returns `Failures` with its count rule; the six prompts declare their rules; the three tests below pass; the existing `bkit steps stub --result-file` tests still pass, because the field keeps `integer: true`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `promptHeader > reads the Failures count rule of bkit-plan-review-1` fails on the `Failures` field carrying no count rule
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `headerDeclaration > refuses an unknown count declaration` fails on an unknown `<count of …>` being read as a plain integer field instead of the usage error "unknown count declaration"
    - `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` `every count-checked prompt declares a known count rule` fails on the six prompts still declaring "<integer >= 0>"

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** `steps finish` checks each declared count, verify's `Fixable` and the challenge verdict against the report body
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: for each `--agent` with a count rule, count the named section and refuse a mismatch with exit 6, `reask` and a `problem` naming the field, the declared value and the counted value; compare verify's `Fixable` to whether any counted line ends `Fixable: true`; for `bkit-build-challenge-*`, refuse `PASS` with any task block and `CONCERNS` with a `CRITICAL` one, using the blocks `parseFindings` returns; `None` under `## CRITICAL` counts as zero
  - **UPDATE:** `findingsLog` in `.bkit/core/engine/commands/workflow/challenge.ts`: becomes `reportSection(text, heading)`; `parseFindings` passes `## Findings Log`
  - **READ:** `failuresProblem` in `.bkit/core/engine/commands/workflow/steps.ts`: the existing `PASS` / `FAIL` rule stays
  - **READ:** `readHeader` in `.bkit/core/engine/commands/workflow/steps.ts`: the header reader `finish` already calls
  - **READ:** `parseFindings` in `.bkit/core/engine/commands/workflow/challenge.ts`: the task-block shape
  - **READ:** `docs/testing.md`: § Test first
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the three tests below pass; a plan-review report with `PASS`, `Failures: 0` and only `OPTIONAL` items exits 0 in the first test; every existing `bkit steps finish` and `bkit challenge merge` test passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > checks Failures against the ## CRITICAL items and ignores OPTIONAL ones` fails on a report with one `CRITICAL` item and `Failures: 0` exiting 0 instead of exit 6 with the problem "counted 1"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > refuses a verify Fixable that disagrees with its gap lines` fails on `Fixable: false` over a `Fixable: true` gap line being accepted instead of the problem "Fixable is false"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > refuses a challenge PASS with a HIGH task block` fails on the report being accepted instead of the problem "PASS needs no findings"

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** The ten result prompts stop asking for the JSON copy
  - **DELETE:** `.bkit/instructions.md`: the clauses `structured-result-file`, `structured-result-render` and `structured-supply-only`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-challenge-1.md`: the clause lines go through `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-challenge-2.md`: the clause lines go through `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-design-review-1.md`: the clause lines go through `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-design-review-2.md`: the clause lines go through `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-review-1.md`: the clause lines go through `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-review-2.md`: the clause lines go through `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-scope-check.md`: the clause lines go through `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the clause lines go through `pnpm instructions:sync`, including the "engine never overrides" sub-bullets
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-diagnose.md`: the clause lines go through `pnpm instructions:sync`, including the `Strategy` judgment (#1016 item 1)
  - **UPDATE:** `.bkit/core/prompts/bkit-design-spike.md`: the clause lines go through `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the guard test below, beside `no workflow names a removed sub-plan flag`
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files
  - **READ:** `.bkit/instructions.md`: § Clauses, the carriers of each deleted clause
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -l 'structured result file' .bkit/core/prompts/*.md` prints nothing; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no prompt names a Result: launch line or a structured result file` fails on the ten prompts' "structured result file" clause

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** The workflows stop passing a `Result:` path and rendering reports, and the re-ask passes the refusal's reason
  - **DELETE:** `.bkit/instructions.md`: the clause `result-path-cleared`
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: the three `Result:` lines (371, 376, 381) and the render block at 383-387 go; each review's `steps finish` keeps its exit routes
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: the three `Result:` lines (417, 422, 454) and the renders (425, 426, 457) go
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the five `Result:` lines (797, 971, 1105, 1113, 1220) and their renders (800, 974, 1110, 1114, 1223) go
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the `Result:` line (601) and the render (604) go
  - **UPDATE:** `.bkit/instructions.md`: clause `workflow-finish`: the re-ask reads "Your prior output '<reask.artifact>' was refused: <problem>. Fix that in the file. Do not redo work."
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the guard test below
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** the test below and `engine calls > %s calls only verbs and flags the CLI has` pass; `pnpm instructions:sync` and the no-flag check exit 0; `pnpm bkit:text:ceiling lower` then `pnpm bkit:text:ceiling check` exit 0, with both totals below 86494 and 58535
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no workflow names a Result: line, a -result.json file or a result-file render` fails on the twelve "Result:" launch lines

<!-- bkit:task 4 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: The audit agent writes its findings once

Source files: `.bkit/core/engine/commands/workflow/issues.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/prompts/bkit-audit-generate.md`, the three `stub-seed-fingerprint` prompts, `.bkit/core/docs/templates/bkit-audit-*.md`, `.bkit/instructions.md`; tests in `issues.test.ts`, `ledgers.test.ts`, `steps.test.ts`, `challenge.test.ts`, `template-shape.test.ts`, `workflow-shape.test.ts`.

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Read the audit report's Findings table
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.ts`: add `parseAuditReport(text, slug)`, which reads the `## Findings` table with `parseMarkdownTable`, needs `ID`, `Severity`, `Title`, `Location` and `Key` per row, and refuses an empty or unknown `Severity`, an empty `Title` or a `Key` that is neither `new` nor an `audit-{slug}-` key, naming the row's `ID`; move `ledgerKeys` here from `.bkit/core/engine/commands/workflow/steps.ts`, which imports it until Task 8
  - **READ:** `parseMarkdownTable` in `.bkit/core/engine/shared/text.ts`: the table reader
  - **READ:** `auditTotals` in `.bkit/core/engine/commands/workflow/issues.ts`: reused unchanged
  - **READ:** `auditEntries` in `.bkit/core/engine/commands/workflow/issues.ts`: reused unchanged
  - **READ:** `auditLedgerRows` in `.bkit/core/engine/commands/workflow/issues.ts`: reused unchanged
  - **READ:** `docs/security.md`: § Untrusted Content & Prompt Injection
  - **DONE WHEN:** the two tests below pass; `bkit issues audit ledger keys` tests pass with `ledgerKeys` in `issues.ts`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `parseAuditReport > reads IDs, severities, titles and keys from the Findings table` fails on `parseAuditReport` not existing
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `parseAuditReport > refuses a row with an unknown key, naming its ID` fails on the row being accepted instead of the refusal "unknown key"

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** `bkit ledgers findings` prints the audit totals and ledger rows, and `issues comment --report` posts from the report
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: add the verb `findings --report=<file>`, which prints `ids`, `totals` and `ledgerRows` from `parseAuditReport` (exit 6 on a malformed table, exit 2 on a missing file)
  - **UPDATE:** `issues comment` in `.bkit/core/engine/commands/workflow/issues.ts`: `--result-file` becomes `--report`, and the audit `Findings` field comes from `auditTotals` over the parsed report
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.test.ts`: `renders audit comments from validated result and preserves tracker adapters` reads a report through `--report`
  - **READ:** `docs/architecture.md`: § File placement, the `ledgers` noun's home
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the two tests below pass; every existing `bkit issues comment` test passes; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `bkit ledgers findings > prints the totals and the ledger rows from a report` fails on the `findings` verb not existing
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `bkit issues comment > audit comment derives Findings from --report` fails on the refusal "unknown flag --report"

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** The audit templates carry `Title` and `Key`, and the audit prompt reads its totals and rows from the engine
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
  - **UPDATE:** `.bkit/core/engine/audits/templates/template-shape.test.ts`: the template guard below
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the `--result-file` guard below
  - **READ:** `.bkit/authoring.md`: § Doc Templates, § All Agent-Read Files
  - **DEPENDS ON:** 6
  - **DONE WHEN:** the two tests below pass; `grep -n 'Serialize the findings' .bkit/core/prompts/bkit-audit-generate.md` prints nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/template-shape.test.ts` `audit templates carry Title and Key columns in their Findings table` fails on the 35 tables lacking a "Title" column
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no prompt or workflow names --result-file` fails on `bkit-audit-generate.md` still naming "--result-file"

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Remove the engine's JSON result path and the fingerprint
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
  - **DELETE:** `parseAuditResult` in `.bkit/core/engine/commands/workflow/issues.ts`: with its types; `parseAuditReport` replaces it
  - **DELETE:** `.bkit/instructions.md`: the clause `stub-seed-fingerprint`, and its lines in `.bkit/core/prompts/bkit-design-organise.md`, `.bkit/core/prompts/bkit-design-update.md`, `.bkit/core/prompts/bkit-plan-update.md` through `pnpm instructions:sync`
  - **DELETE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: the `describe("bkit steps stub --result-file")` block, which tests removed code
  - **DELETE:** `.bkit/core/engine/commands/workflow/challenge.test.ts`: the `describe("structured challenge findings")` block, which tests removed code
  - **DEPENDS ON:** 4, 7
  - **DONE WHEN:** the two tests below pass; `grep -rn 'renderResult\|result-file\|Fingerprint' .bkit/core/engine --include='*.ts'` finds only the guard tests; `pnpm build` is run and `dist/` updated; `pnpm bkit:text:ceiling lower` then `check` exit 0
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps stub > refuses --result-file as an unknown flag` fails on the flag being accepted instead of the refusal "unknown flag --result-file"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps verdict > reads a header with a leftover Fingerprint line` fails on the stale refusal "Fingerprint mismatch"

<!-- bkit:task 8 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Decision files — the orchestrator writes, the engine counts

Source files: `.bkit/core/engine/commands/workflow/open-decision.ts`, `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/workflow/summary-findings.ts`, `.bkit/core/engine/commands/workflow/tasks.ts`, `.bkit/core/workflows/bkit-build.md`; tests in `open-decision.test.ts`, `decisions.test.ts`, `workflow-shape.test.ts`.

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** One reader merges a decision file with its `-engine.md` sibling
  - **UPDATE:** `.bkit/core/engine/commands/workflow/open-decision.ts`: add `decisionItems(read, rel)`, which reads `rel` and `rel`'s `-engine.md` sibling, merges items by question number with the engine file's `Decision:` line winning, and reads the old single-file layout unchanged; `decisionHeader`, `undecidedBesidesLoop`, `gateRerun`, `skipProblem` and `openDecision` read through it, with `Status` from the merged items
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.ts`: each `parseDecisionItems(read(rel))` call reads through `decisionItems`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary-findings.ts`: each `parseDecisionItems(read(rel))` call reads through `decisionItems`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tasks.ts`: each `parseDecisionItems(read(rel))` call reads through `decisionItems`
  - **UPDATE:** `acceptedLocations` in `.bkit/core/engine/commands/workflow/challenge.ts`: reads through `decisionItems` and skips `-engine.md` files
  - **UPDATE:** `decisionFiles` in `.bkit/core/engine/commands/workflow/decisions.ts`: skips `-engine.md` files and reads through `decisionItems`
  - **UPDATE:** `skip` in `.bkit/core/engine/commands/workflow/decisions.ts`: skips `-engine.md` files and reads through `decisionItems`
  - **UPDATE:** `pending` in `.bkit/core/engine/commands/workflow/decisions.ts`: skips `-engine.md` files and reads through `decisionItems`
  - **UPDATE:** `statusOf` in `.bkit/core/engine/commands/workflow/decisions.ts`: computes `Status` from the merged items
  - **READ:** `docs/testing.md`: § Test first
  - **DEPENDS ON:** 8
  - **DONE WHEN:** the three tests below pass; every existing test in `open-decision.test.ts`, `decisions.test.ts`, `challenge.test.ts`, `tasks.test.ts`, `status.test.ts` and `workflows.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > decisionItems reads the loop question and progress from the engine file` fails on `decisionItems` not existing
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > the engine file's Decision line wins for one question` fails on the orchestrator's line being returned
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > decisionItems reads an old single-file layout like parseDecisionItems` fails on `decisionItems` not existing

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** `bkit decisions check` checks the orchestrator's decision file
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: add the verb `check --file=<decision file>`, which keeps `compose`'s item rules (lettered options, at most 26, no recommendation on a hard blocker, each question has `Recommended:` and `Default if unanswered:` lines) and refuses a duplicate number or a `Q1` when the `-engine.md` sibling holds the loop question, each naming the question, with exit 6
  - **READ:** `docs/security.md`: § Untrusted Content & Prompt Injection
  - **DEPENDS ON:** 9
  - **DONE WHEN:** the two tests below pass; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a question without lettered options, naming it` fails on the `check` verb not existing
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses Q1 when the engine file holds the loop question` fails on the `check` verb not existing

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** `bkit decisions loop` writes the engine's pause counts into its own file
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: add the verb `loop --out=<decision file> --loop=tests|verify|holistic --file=<status.jsonl> --attempt= --max= [--group=] [--base-check=]`, which writes the `-engine.md` sibling with the attempt line, `## Progress` from `loopProgress`, the base-check line from `readBaseCheck`, and the loop question `Q1` with the engine's recommendation, moved from `compose --loop`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the `compose --loop` and `--base-check` cases move to `bkit decisions loop` and assert on the engine file
  - **READ:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: the rounds and source-changed facts
  - **READ:** `docs/architecture.md`: § File placement, for the engine file's folder
  - **DEPENDS ON:** 9
  - **DONE WHEN:** the two tests below and the moved cases pass; the orchestrator's decision file is byte-identical before and after `decisions loop`; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions loop > writes the attempt line, progress, base check and loop question into the engine file only` fails on the `loop` verb not existing
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions loop > recommends Decide when the last round changed no source` fails on the `loop` verb not existing

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** `bkit decisions apply` writes the engine's lines into the engine file
  - **UPDATE:** `apply` in `.bkit/core/engine/commands/workflow/decisions.ts`: `--by=headless`, `--by=rerun` and `--by=owner --confirm` or `--reject` write their `Decision:` lines into the `-engine.md` sibling and never write `Status`; `applyRecommendations` reads the merged items
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the existing `apply --by=rerun`, `apply --by=headless` and `apply --by=owner and pending` cases assert on the engine file
  - **DEPENDS ON:** 9
  - **DONE WHEN:** the two tests below and the updated cases pass; `decisions skip` and `decisions pending` tests pass; `pnpm build` is run and `dist/` updated
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged` fails on the decision file gaining "Accept (assumed)"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` fails on the engine file not existing after `--confirm`

<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** The build's Decision Pause has the orchestrator write its own questions, and `decisions compose` goes
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 2 writes the decision file's header and questions with the file tool (the item rules stay, written as `.md`), runs `decisions loop` when the pause has a loop and numbers the orchestrator's questions from `Q2` then, and runs `decisions check`; step 4 shows the engine file's attempt line, progress and `Q1` first; step 6 writes no `Status` line; the gate box names `decisions check` and `decisions loop`
  - **DELETE:** `compose` in `.bkit/core/engine/commands/workflow/decisions.ts`: replaced by `decisions check` and `decisions loop`
  - **DELETE:** `composeItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: replaced by `decisions check` and `decisions loop`
  - **DELETE:** `itemLines` in `.bkit/core/engine/commands/workflow/decisions.ts`: replaced by `decisions check` and `decisions loop`
  - **DELETE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the remaining `describe("bkit decisions compose")` cases, which test removed code
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the guard test below
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files
  - **DEPENDS ON:** 10, 11, 12
  - **DONE WHEN:** the test below and `engine calls > %s calls only verbs and flags the CLI has` pass; `pnpm build` is run and `dist/` updated; `pnpm bkit:text:ceiling lower` then `check` exit 0, with the workflows total not above its value at the start of this task
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no workflow names decision-items.json or decisions compose` fails on `bkit-build.md` step 2 still naming "decision-items.json"

<!-- bkit:task 13 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: The Failure Path file and the contract docs

Source files: `.bkit/instructions.md`, `.bkit/core/workflows/bkit-auto.md` and the five workflows carrying `workflow-error-file`, `.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/prompts.md`, `docs/testing.md`, `scripts/gate/` text ceiling record, `dist/`; tests in `workflow-shape.test.ts`.

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** The Failure Path error text is a `.md` in the run's log folder
  - **UPDATE:** `.bkit/instructions.md`: clause `workflow-error-file` names `{LOG_DIR}/{workflow}-error.md` and `{LOG_DIR}/{workflow}-stderr.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`), written with the file tool, and drops `--error-file` while the folder is not held; `pnpm instructions:sync` carries it into `bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md`
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: Failure Path step 1 writes `.worktrees/bkit-error-auto.md` (Q8)
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: line 807, and its source text in `.bkit/instructions.md` near line 9966
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the guard test below
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files
  - **READ:** `docs/deployments.md`: § Abort-push guard, so the handover commit still carries the log folder
  - **DEPENDS ON:** 13
  - **DONE WHEN:** the test below passes; every existing `bkit workflows fail` and `--session-dir on fail / close` test passes, since `--error-file` already reads any path
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no workflow names {OUTBOX_ROOT}/error.md or {OUTBOX}/stderr.log` fails on the six workflows' "error.md" lines

<!-- bkit:task 14 end -->

<!-- bkit:task 15 start -->

- [ ] **TASK 15:** Contract docs, ceilings and rendered copies match the code
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: `pnpm cli:sync` regenerates the verb tables; hand text at lines 41 and 45 (`{OUTBOX}` contents) and the decisions table at 168-178 describe `check`, `loop` and the engine file
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: lines 237, 666, 990-993 and 1030 drop the result path and describe the two decision files
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: line 447 drops the result-file note
  - **UPDATE:** `docs/testing.md`: the per-file rows for `steps.test.ts`, `decisions.test.ts`, `open-decision.test.ts`, `issues.test.ts`, `ledgers.test.ts`, `workflow-shape.test.ts`, `verdict-vocabulary.test.ts` and `template-shape.test.ts`
  - **READ:** `docs/testing.md`: § Where tests live
  - **READ:** `.bkit/authoring.md`: § Docs
  - **DEPENDS ON:** 8, 13, 14
  - **DONE WHEN:** `grep -rn 'result-file\|decision-items.json\|decisions compose\|error.md' .bkit/core/.bkit/*.md .bkit/core/workflows/*.md .bkit/core/prompts/*.md .bkit/instructions.md` prints nothing; `pnpm build`, then `pnpm tsx .bkit/core/engine/cli.ts upgrade` once; `bkit check` exits 0; `pnpm bkit:text:ceiling lower` then `check` exit 0, with both totals below 86494 and 58535; `pnpm bkit:gate:static-unit-integration` passes
  - **TEST FIRST:** n/a — docs, regenerated docs and rendered copies, with no behaviour change

<!-- bkit:task 15 end -->

<!-- bkit:group 4 end -->

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
- [ ] **Test Synchronization:** no E2E tests exist for these paths; the existing unit tests that Tasks 6, 8, 11, 12 and 13 move, rewrite or delete are named in those tasks.
- [ ] **Build Configuration:** `tsconfig.json` `exclude` keeps `**/*.test.ts` out of `dist/`; no task adds a test-only file outside that pattern.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/steps.test.ts`, `challenge.test.ts`, `issues.test.ts`, `ledgers.test.ts`, `decisions.test.ts`, `open-decision.test.ts`):** the count checks, the audit table reader, the two decision files and the removed JSON path, each row of the `Derived Test Matrix`, with temporary log folders per test.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `verdict-vocabulary.test.ts`, `.bkit/core/engine/audits/templates/template-shape.test.ts`):** the guards that no prompt, workflow or template names a removed path, verb or flag, and that each count-checked prompt declares a known rule.
- [ ] **Text ceilings:** `pnpm bkit:text:ceiling check` exits 0 with both totals below 86494 (prompts) and 58535 (workflows).
- [ ] **Apply local migrations:** not applicable; the plan has no database and no migration.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a fresh consumer installed from the packed tarball, run a `/bkit-build` in Claude Code auto mode through holistic verify; no permission prompt asks about a file under `.git/`, and `find .git docs/plans -name '*-result.json' -o -name 'decision-items.json'` prints nothing.
- [ ] **Step 2:** Edit one challenge report so its `Failures` line disagrees with its task blocks, then run `bkit steps finish` on it; the exit is 6 and the printed `problem` names the declared and the counted value.
- [ ] **Step 3:** Run one audit in the same consumer; the report is written once, `bkit ledgers findings --report=<report>` prints its totals, and the tracker comment's `Findings` line matches them.
- [ ] **Step 4:** Reach a build decision pause; the log folder holds `build-decision-{RUN}-{K}.md` with only the orchestrator's questions and `build-decision-{RUN}-{K}-engine.md` with the attempt line, progress and `Q1`.
