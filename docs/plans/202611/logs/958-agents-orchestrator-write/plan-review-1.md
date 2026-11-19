Verdict: CONCERNS
Failures: 6
Redesign: false
Fingerprint: 677306a22310253a5789440e47e76fa67a59f8151b54e441efb53a4b555e1ca7
<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

Scope: `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md` against `plan-input-1.md` (issue #958 body and comments), the four owner decisions and eight plan decisions in `docs/decisions.jsonl` (rows 956-970), the knowledge rows in `related-knowledge.md`, and the code the runbook changes. No design artifact exists (`docs/plans/2026*/958*` matches nothing), so the design-coverage parts of steps 5 and 11 do not apply; the source is the issue and its decision rows. Docs read: `.agents/docs.md`, `docs/architecture.md` § File placement, `docs/testing.md` § Tiers this project has, § Where tests live, § Which tier does a behaviour need?, § Test first, `docs/technology.md` § Conventions, `docs/security.md` headings (the plan adds no trust boundary). The dependency graph has no cycle and no task consumes an artefact that only a later group produces; the findings below are group hand-offs, unreachable checks and missed consumers.

## CRITICAL

- **Group hand-off: `cli-doc.test.ts` stays red from Group 2 until Group 4 (plan edit).** `.bkit/core/engine/tools/cli-doc.test.ts:13` (the generated region of `.bkit/cli.md` is current) runs in the unit tier of every group gate (`bkit:gate:static-unit` → `test:coverage:unit`). Task 6 (adds `ledgers findings`, renames `issues comment --result-file` to `--report`) and Task 8 (drops `steps stub --agent`, `--result-file`, `--invocation` and `steps verdict --result-file`) change the command registry in Group 2; Tasks 10, 11 and 13 add `decisions check` and `decisions loop` and remove `compose` in Group 3. Only Task 15, in Group 4, runs `pnpm cli:sync`, so Groups 2 and 3 each end with this test failing. Fix: Tasks 6, 8, 10, 11 and 13 each run `pnpm cli:sync`, land the regenerated region of `.bkit/core/.bkit/cli.md`, and name `cli-doc.test.ts` in their DONE WHEN; Task 15 keeps only the hand text (lines 41, 45, 168-178).
- **Task 15's DONE WHEN cannot pass (plan edit).** It needs a grep for `result-file`, `decision-items.json`, `decisions compose` and `error.md` over `.bkit/core/.bkit/*.md`, `.bkit/core/workflows/*.md`, `.bkit/core/prompts/*.md` and `.bkit/instructions.md` to print nothing. Task 14 writes `{LOG_DIR}/{workflow}-error.md` into the clause and five workflows, and `ship-error.md` for ship; both match `error.md`. Editing the `workflow-error-file` clause also keeps its old wording (`{OUTBOX_ROOT}/error.md`) in the clause's `retired` block, as `workflow-finish` does at `.bkit/instructions.md:3090` (knowledge row `instructions-store-clause-text-and-local-entries-need-hand-edits`). Fix: grep for the removed strings exactly (`{OUTBOX_ROOT}/error.md`, `{OUTBOX}/stderr.log`, `--result-file`, `decision-items.json`, `decisions compose`) and leave out `retired` blocks, or rely on the workflow-shape guards of Tasks 4, 7, 13 and 14.
- **Task 8's DONE WHEN cannot pass (plan edit).** The grep for `renderResult`, `result-file` and `Fingerprint` over `.bkit/core/engine` must find only the guard tests, but live code this plan does not touch matches `Fingerprint`: `worktreeFingerprint` (`.bkit/core/engine/commands/lib.ts:674`, `commands/workflow/status.ts:36`), `chatFingerprint` (`commands/workflow/run-facts.ts:331`, `commands/workflow/workflows.ts:105`), `egressFingerprint` (`install/cloud-env.ts:657`, `install/network-allowlist.ts:9`) and `detectCloudBootstrapFingerprintMissing` (`checks/before/files.ts:156`, `checks/before/index.ts:35`), plus their tests. A build agent either fails the task or renames unrelated code. Fix: grep for the deleted names only (`renderResult`, `renderAudit`, `readResult`, `artifactFingerprint`, `fingerprintProblem`, `FINGERPRINT`, `withFingerprint`, `fingerprintOf`, `--result-file`, `resultFile`) under `.bkit/core/engine/commands/workflow/`.
- **A source success criterion is claimed but not met: a shell heredoc into `{OUTBOX}` stays (plan edit).** Context & Goals (plan line 31) maps the issue's criterion that no prompt or workflow tells an agent to write into `{OUTBOX}` or `.git/` with a shell command to Tasks 3, 4, 7, 13 and 14. `.bkit/core/workflows/bkit-debug.md:500-503` keeps `SCRIPT={OUTBOX}/context-fetch-{IDX}.sh` and `cat > "$SCRIPT" <<'BKIT_CONTEXT_FETCH_BLOCK'`: the orchestrator writes a script that only the engine reads (`context fetch --script=`) into `.git/bkit-outbox/` with a heredoc, the exact pattern of the issue's Problem. It is the only shell write into `{OUTBOX}` left in the prompts and workflows, and no task, Out of Scope row or deferral covers it. Fix: add a task that writes the script with the file tool outside `.git/` (with an Open Question on where: the log folder, which commits it, or the gitignored `.worktrees/`), or put the narrowing of the criterion to the owner as an Open Question; parking it would be a `Blocking` deferral.
- **Task 9 misses a decision-file listing, so the ship summary reads the engine file as its own decision (plan edit).** `.bkit/core/engine/commands/workflow/workflows.ts:1805-1812` builds the summary's `decisionFiles` from every file matching `build-decision-*.md`, which includes `build-decision-{RUN}-{K}-engine.md`. `summary.ts:601-607` reads each listed file for ship's assumed items the owner did not confirm. After Task 12 the `Accept (assumed)` lines live only in the engine file: read through `decisionItems`, each assumed item is counted twice (merged into `K.md`, and again from `K-engine.md` alone); read raw, the orchestrator's file shows none. The Breaking Changes row names `workflows summary` as an affected reader, but Task 9 updates only `summary.ts` and never makes this listing skip `-engine.md`. Fix: add the `decisionFiles` listing in `workflows.ts` to Task 9 with the same `-engine.md` skip as `decisionFiles` and `acceptedLocations`, plus a Derived Test Matrix row and test that one assumed item in an engine file is counted once.
- **The owner's engine-only pause facts have no home in the runbook (plan edit).** Decision `958-agent-writes-engine-counts-verbs-named-for-what-they-do` keeps whether the last round changed code, and the base-check result, out of the orchestrator's file. Today `compose` writes both as header lines from flags the orchestrator relays: `Source changed={SOURCE_CHANGED}` (`bkit-build.md:195-196`, held from an engine exit code at `:935` and `:1048`) and `Gate=FAIL` when the base check ran (`:198`). Readers depend on both: `openDecision` (`open-decision.ts:229-246`), `gateRerun`, `skipProblem` (`decisions skip` refuses a missing `Source changed`, `decisions.test.ts:1190`) and `summary.ts:452`. Task 13 says only that the orchestrator writes the file's header; Task 11 lists the attempt line, `## Progress`, the base-check line and `Q1` for the engine file; and a pause without a loop gets no engine file. As written, the orchestrator either copies the engine's facts into its own header, against the decision, or drops header lines that `decisions skip` and `openDecision` need. Fix: list in Task 13 the header lines the orchestrator writes (`Question`, `From`, `Pause step`, `Plan`, `Group`, the attempt lines), give `Source changed` and `Gate` to the engine file in Task 11 (or to an engine verb every pause runs), make Task 9's `decisionHeader` merge header fields from both files, and add a test row for each.

## OPTIONAL

- **Task 13 deletes code that Tasks 10 and 11 build on.** `decisions check` (Task 10) keeps the `composeItems` rules, and `decisions loop` (Task 11) renders the loop question that `itemLines` (`.bkit/core/engine/commands/workflow/decisions.ts:237`, used at `:485` by `compose --loop`) renders today. Task 13 then deletes `composeItems` and `itemLines`. Name in Tasks 10 and 11 where the shared parts move (a helper both verbs import), so Task 13's delete cannot take live code with it.
- **Deleted and edited clauses need hand edits, not only `instructions:sync`.** Tasks 3, 4, 7, 8, 13 and 14 delete `result-path-cleared`, `structured-result-file`, `structured-result-render` and `structured-supply-only` (`.bkit/instructions.md:5069-5097`) and edit `workflow-error-file` (`:5750`) and `workflow-finish` (`:3079`). Knowledge row `instructions-store-clause-text-and-local-entries-need-hand-edits`: `pnpm instructions:sync` never rewrites a clause's own text, and `## Local Instructions` entries for removed or added lines need hand edits, or `instructions-coverage.test.ts` fails. Name both edits and the test in each task's DONE WHEN.
- **Subagent `Read` lines should name both decision files.** `bkit-build.md:77`, `:969`, `:1035` and `:1218` ("`build-decision-{RUN}-*.md` (highest number, if present)") and `.bkit/core/.bkit/workflows.md:1006` hand agents the orchestrator's file only. Once `-engine.md` siblings exist, "highest number" is ambiguous, and the headless `Accept (assumed)` lines (Task 12) live only in the engine file. Add these lines to Task 13 (or Task 15 for the doc).
- **`decisions check` exit 6 should go back to the orchestrator first.** Today `compose` non-zero goes straight to the Failure Path (`bkit-build.md:204`). Once the orchestrator writes the file itself, a refused file is the orchestrator's own mistake; Task 13 could route exit 6 to "fix the named lines and re-run `decisions check` once", then the Failure Path.
- **Task 1's guard test should define its prompt set.** `bkit-ship-deferred-sweep.md:117` also declares `Failures: <integer >= 0>` but is not one of the six result prompts, and the audit prompt's header is `Status:` with no `Verdict:` line. State which prompts the "every count-checked prompt declares its rule" guard covers, so the test neither misses one nor fails on one the plan does not touch.
- **#1016 item 1 is only partly covered.** `bkit-debug-failure-diagnose.md:125` still says "FAIL = `Strategy` is missing" after Task 3, while the plan maps #1016 item 1 to that task. Either add the line to Task 3 or narrow the mapping.
- **Four prompts still tell agents to append to their own report with the shell.** `bkit-build-plan-verify.md:66-67` (`echo {log entry} >> {output}`, heredoc), both challenge prompts (challenge-1 line 110 "appending with a Bash heredoc `>>`", challenge-2 line 64) and the diagnose prompt (line 106). These write into the log folder, not `{OUTBOX}` or `.git/`, so the success criterion holds, but the Narrative and Concrete Example say agents write "with the file tool". Add them to Task 3, or narrow the Narrative wording.
- **Name every existing `--result-file` test Tasks 6 and 8 rewrite.** Task 6 names one test; `issues.test.ts:882-935` holds several. Task 8 should name the `steps.test.ts` blocks near `:3195` and `:3441-3659`. Without the list, a build agent finds them only when the gate fails.
- **Engine edits without `pnpm build`.** Tasks 1, 5 and 9 change engine source with no rebuild step. The group gate runs tests against source, so this holds at group level, but any workflow step in the same group that calls the built `bkit` runs the old code.
- **An Edge Case contradicts Task 12.** The Edge Case "no loop → No engine file is written" conflicts with Task 12, where a headless apply writes `Accept (assumed)` into the engine file with no loop. Reword the Edge Case to "no loop and no headless apply".
- **Doc drift Task 15 does not list.** `.bkit/core/.bkit/jsonl.md:159` ("decision-pause if its build-decision-*.md is Status: OPEN"; `Status` becomes computed) and `.bkit/core/.bkit/workflows.md:977`, `:1000`, `:1005`, `:1006` and `:1138` describe the decision file; Task 15 names only `:237`, `:666`, `:990-993` and `:1030`.
- **Text ceilings in Task 14.** `agent-text-ceiling.test.ts` requires the prompt and workflow totals to equal the committed ceilings (prompts 86494, workflows 58535), so each group that edits those folders ends with `scripts/gate/bkit-text-ceiling.mjs lower`. Task 14 adds the error-file path to five workflows; give it a check that the workflows total does not rise above its value at the start of the task, since `lower` refuses a rise and `raise` is not available to the build.
- **The decision step's commit should stage the `-engine.md` sibling.** Confirm that the step that commits `build-decision-{RUN}-{K}.md` also stages `build-decision-{RUN}-{K}-engine.md`, so a resumed run reads both.
- **Open-blocker check not done.** `related-issues.md` says "Search unavailable.", so step 10 (an open blocker or prerequisite issue the plan ignores) could not be checked.

## OUT OF SCOPE

- `bkit-debug.md:377` has the orchestrator write `{OUTBOX}/ci-evidence.json` with the file tool for the engine to read. That is not a shell write, so the success criterion holds; moving it out of `.git/` would follow the issue's intent, but is a separate change.
- The file-tool writes into `.git/bkit-outbox` that the plan already names (`plan-answers.md`, `design-answers.md`, `issue-text.md`, the audit `comment.md` and `parent-comment.md`) stay as the plan has them.

## SUGGESTED SCOPE EXPANSION

None. `related-deferrals.md` and `related-failures.md` hold no rows, and `related-issues.md` reports the issue search unavailable.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Group hand-off: cli-doc.test.ts stays red from Group 2 until Group 4
  **Severity:** CRITICAL · **Class:** plan-edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:850` · **Round:** 1
  - **DONE WHEN:** Tasks 6, 8, 10, 11 and 13 each run `pnpm cli:sync`, land the regenerated region of `.bkit/core/.bkit/cli.md`, and name `.bkit/core/engine/tools/cli-doc.test.ts` passing in their DONE WHEN, so Groups 2 and 3 end with it green; Task 15 keeps only the hand text.
  - **TEST FIRST:**
    - .bkit/core/engine/tools/cli-doc.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Task 15 DONE WHEN grep for error.md cannot pass
  **Severity:** CRITICAL · **Class:** plan-edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:857` · **Round:** 1
  - **DONE WHEN:** Task 15's DONE WHEN greps only the removed strings (`{OUTBOX_ROOT}/error.md`, `{OUTBOX}/stderr.log`, `--result-file`, `decision-items.json`, `decisions compose`) and excludes clause `retired` blocks, so Task 14's `{LOG_DIR}/{workflow}-error.md` and `ship-error.md` paths do not match.
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Task 8 DONE WHEN grep for Fingerprint cannot pass
  **Severity:** CRITICAL · **Class:** plan-edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:728` · **Round:** 1
  - **DONE WHEN:** Task 8's DONE WHEN greps only the deleted names (`renderResult`, `renderAudit`, `readResult`, `artifactFingerprint`, `fingerprintProblem`, `FINGERPRINT`, `withFingerprint`, `fingerprintOf`, `--result-file`, `resultFile`) under `.bkit/core/engine/commands/workflow/`, so `worktreeFingerprint`, `chatFingerprint`, `egressFingerprint` and `detectCloudBootstrapFingerprintMissing` do not match.
  - **TEST FIRST:**
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Shell heredoc into {OUTBOX} at bkit-debug.md:500-503 stays while the criterion is claimed met
  **Severity:** CRITICAL · **Class:** plan-edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:31` · **Round:** 1
  - **DONE WHEN:** A runbook task removes the `cat > "$SCRIPT" <<'BKIT_CONTEXT_FETCH_BLOCK'` write of `{OUTBOX}/context-fetch-{IDX}.sh` from `.bkit/core/workflows/bkit-debug.md:500-503` (file tool, outside `.git/`, with an Open Question on where), or an Open Question puts the narrowing of the success criterion to the owner; Context & Goals maps the criterion only to tasks that meet it.
  - **TEST FIRST:**
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Task 9 misses the decisionFiles listing in workflows.ts that the ship summary reads
  **Severity:** CRITICAL · **Class:** plan-edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:745` · **Round:** 1
  - **DONE WHEN:** Task 9 updates the `decisionFiles` listing in `.bkit/core/engine/commands/workflow/workflows.ts:1805-1812` to skip `-engine.md` siblings, with a Derived Test Matrix row and a test that one assumed item in an engine file is counted once by `workflows summary`.
  - **TEST FIRST:**
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** No task writes the Source changed and Gate header lines after compose goes
  **Severity:** CRITICAL · **Class:** plan-edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:808` · **Round:** 1
  - **DONE WHEN:** Task 13 lists the header lines the orchestrator writes; Task 11 (or an engine verb every pause runs) writes `Source changed` and `Gate` into the engine file, including for pauses with no loop; Task 9's `decisionHeader` merges header fields from both files; each has a Derived Test Matrix row and test covering `openDecision`, `decisions skip` and `summary.ts:452`.
  - **TEST FIRST:**
<!-- bkit:task 6 end -->
