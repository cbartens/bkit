# Brief: group 1 — Reports are checked, not rendered

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

- Group 1: Reports are checked, not rendered — this group
  - TASK 1: Declare each report's count rule in its prompt header, and read it in `promptHeader` — open
  - TASK 2: `steps finish` checks each declared count, verify's `Fixable` and the challenge verdict against the report body — open
  - TASK 3: The ten result prompts stop asking for the JSON copy — open
  - TASK 4: The workflows stop passing a `Result:` path and rendering reports, and the re-ask passes the refusal's reason — open
- Group 2: The audit agent writes its findings once — next
  - TASK 5: Read the audit report's Findings table from a leaf module — open
  - TASK 6: `bkit ledgers findings` prints the audit totals and ledger rows, and `issues comment --report` posts from the report — open
  - TASK 7: The audit templates carry `Title` and `Key`, and the audit prompt reads its totals and rows from the engine — open
  - TASK 8: Remove the engine's JSON result path and the fingerprint — open
- Group 3: Decision files — the orchestrator writes, the engine counts — later
  - TASK 9: One reader merges a decision file with its `-engine.md` sibling — open
  - TASK 10: `bkit decisions check` checks the orchestrator's decision file — open
  - TASK 11: `bkit decisions counts` writes the engine's pause counts into its own file — open
  - TASK 12: `bkit decisions apply` writes the engine's lines into the engine file — open
  - TASK 13: The build's Decision Pause has the orchestrator write its own questions, and `decisions compose` goes — open
- Group 4: The Failure Path file and the contract docs — later
  - TASK 14: The Failure Path error text is a `.md` in the run's log folder — open
  - TASK 15: The debug workflow writes its context-fetch script with the file tool, into the log folder — open
  - TASK 16: Contract docs, ceilings and rendered copies match the code — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Declare each report's count rule in its prompt header, and read it in `promptHeader`
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

- [ ] **TASK 2:** `steps finish` checks each declared count, verify's `Fixable` and the challenge verdict against the report body
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

- [ ] **TASK 3:** The ten result prompts stop asking for the JSON copy
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

- [ ] **TASK 4:** The workflows stop passing a `Result:` path and rendering reports, and the re-ask passes the refusal's reason
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

Reuse Inventory rows left out: 7; Architecture entries left out: 5 — read them in docs/plans/202611/958-agents-orchestrator-write-plan.md § Reuse Inventory and § Architecture & Component Changes.
