# Brief: group 2 — The audit agent writes its findings once

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
- Group 2: The audit agent writes its findings once — this group
  - TASK 5: Read the audit report's Findings table from a leaf module — open
  - TASK 6: `bkit ledgers findings` prints the audit totals and ledger rows, and `issues comment --report` posts from the report — open
  - TASK 7: The audit templates carry `Title` and `Key`, and the audit prompt reads its totals and rows from the engine — open
  - TASK 8: Remove the engine's JSON result path and the fingerprint — open
- Group 3: Decision files — the orchestrator writes, the engine counts — next
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

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Read the audit report's Findings table from a leaf module
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

- [ ] **TASK 6:** `bkit ledgers findings` prints the audit totals and ledger rows, and `issues comment --report` posts from the report
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

### Earlier tasks this group depends on

- TASK 4 (group 1, done): The workflows stop passing a `Result:` path and rendering reports, and the re-ask passes the refusal's reason — `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/instructions.md`, `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-design.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

Reuse Inventory rows left out: 10; Architecture entries left out: 10 — read them in docs/plans/202611/958-agents-orchestrator-write-plan.md § Reuse Inventory and § Architecture & Component Changes.
