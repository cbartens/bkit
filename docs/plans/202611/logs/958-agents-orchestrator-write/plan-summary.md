Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-apply-review CONCERNS
- 2 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/958-agents-orchestrator-write/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/958-agents-orchestrator-write/related-deferrals.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/related-failures.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/related-issues.md` |
| plan-review | CONCERNS | 24 | 1 | `docs/plans/202611/logs/958-agents-orchestrator-write/plan-review-1.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/plan-review-2.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v2-reviewed.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/958-agents-orchestrator-write/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/958-agents-orchestrator-write/related-deferrals.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/related-failures.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/958-agents-orchestrator-write/plan-review-1.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/plan-review-2.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v2-reviewed.md`, `docs/plans/202611/logs/958-agents-orchestrator-write/plan-update-check.md` |

## Acceptance Scenario

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
- **WHEN** the build pauses for a decision **→ THEN** the orchestrator writes `build-decision-{RUN}-{K}.md` itself; on a verify, holistic or tests pause `bkit decisions counts` then writes the engine's `build-decision-{RUN}-{K}-engine.md` with `Source changed`, `Gate`, the rounds, the base check and, with a loop, the loop question; `bkit decisions check` checks the orchestrator's file, and a refusal goes back to the orchestrator once before **Failure Path**.
- **WHEN** the owner answers the loop question **→ THEN** `bkit decisions apply --by=owner --answer` writes the answer into the engine file, and a `Try again` answer leaves the pause `DECIDED`, so a resume does not ask it again.
- **WHEN** a workflow takes the Failure Path after its log folder exists **→ THEN** the orchestrator writes `{LOG_DIR}/{workflow}-error.md` with the file tool and `workflows fail --error-file` reads it; **IF** the log folder is not held yet **→ THEN** `--error-file` is dropped, as today.

### Concrete Example

**Setup:** A build runs in Claude Code auto mode in a fresh consumer checkout. It reaches holistic verify for `{FID}` with run 1, attempt 1. Two plan tasks are not satisfied, and both gaps are fixable.

**Steps:**

1. The orchestrator launches `@bkit-build-plan-verify` with **Create** = `build-plan-verify-holistic-1-1.md` and no `Result:` line → the agent writes the report with the file tool: two `TASK {N}` lines under `## Identified Gaps Log`, each ending `— Fixable: true`, and a header with `Verdict: CONCERNS`, `Failures: 2` and `Fixable: true`. No JSON file is written and no permission prompt appears.
2. The orchestrator runs `bkit steps finish --agent=bkit-build-plan-verify --artifact=build-plan-verify-holistic-1-1` → the engine counts two gap lines under `## Identified Gaps Log`, finds `Failures` and `Fixable` correct, and prints `verdict: CONCERNS` with exit 0.
3. A second run's agent writes `Failures: 1` over the same two lines → `steps finish` exits 6 and prints `reask` with `problem: Failures is 1, but ## Identified Gaps Log has 2 counted lines` → the orchestrator re-asks the agent once with that problem → the agent corrects the header with the edit tool → `steps finish` exits 0.
4. The gaps reach the Decision Pause → the orchestrator writes `build-decision-1-1.md` with its header lines and one question per gap in its own words, starting at `Q2`; `bkit decisions counts` reads that file's question count and writes `build-decision-1-1-engine.md` with the `Source changed` and `Gate` lines, the attempt line, the `## Progress` block, the base-check line and the loop question `Q1` with its recommendation; `bkit decisions check` exits 0 on the orchestrator's file.

**Outcome:** The owner reads the engine file's attempt line, progress and `Q1`, then the orchestrator's `Q2` and `Q3`, in one message. No `*-result.json` or `decision-items.json` exists under `.git/bkit-outbox/{FID}/`, and each report was written once, by its agent.

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
| A decision pause has no loop question and no headless apply | The orchestrator numbers its questions from `Q1`, and `decisions check` accepts that. A challenge, changed-test or unproven-test pause then has no engine file; a verify or holistic pause has one holding `Source changed` but no loop question. |
| The orchestrator's decision file has a question without option lines, or with options that are not lettered | `decisions check` exits 6 naming the question; the orchestrator fixes the named lines and runs `decisions check` once more, and a second refusal goes to **Failure Path**. |
| The owner answers the loop question `Try again` | `decisions apply --by=owner --q=1 --answer="Try again"` writes the answer under the engine file's `Q1`; the pause reads `DECIDED` while its other items stay undecided, so `openDecision` does not return it on resume. |
| An old decision file (composed before this change) is reopened on resume | The merged reader reads its in-file `## Progress`, loop question, `Status`, `Source changed`, `Gate` and `Decision:` lines, so `openDecision`, `gateRerun` and `decisions skip` answer as before; no migration is needed. |
| `decisions apply --by=headless` runs | It writes each `Decision: Accept (assumed)` line into the engine file, never into the orchestrator's file, creating the engine file when the pause had none. |
| Both files carry a `Decision:` line for one question, or a header line with one name | The engine file's line wins. |
| A Failure Path is taken before `LOG_DIR` is held | `--error-file` is dropped, as today, and the comment carries no error text. |
| Ship or auto takes the Failure Path | Ship writes `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`; auto writes the gitignored `.worktrees/bkit-error-auto.md` in the checkout (Q8). |
| Debug customises a context-fetch block | The orchestrator writes the script with the file tool to `docs/plans/{YYYYMM}/logs/{FID}/context-fetch-{DEBUG_ATTEMPT}-{IDX}.sh` and passes it to `context fetch --script` (Q10); no heredoc writes into `{OUTBOX}`. |
| A workflow names `steps stub --result-file`, `decisions compose` or another removed flag, or writes a file with a shell heredoc | The `workflow-shape` checks fail in CI. |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Assumption:** The pre-#860 reader `parseFindings` in `.bkit/core/engine/commands/workflow/challenge.ts` still reads the task blocks the challenge prompts tell the agent to write. → If it has drifted, Task 2's challenge check refuses correct reports; Task 2's tests use a block copied from the prompt's own format to catch this.
- **Assumption:** No consumer calls `decisions compose`, `steps stub --result-file` or `issues comment --result-file` outside bkit's own workflows and prompts. → If one does, its script fails with "no such verb" or "no --result-file" after upgrade; the release notes name the removed verbs.
- **Assumption:** A run that resumes across the upgrade has at most one open decision file in the old single-file layout. → If the merged reader mis-reads an old file, a resumed pause asks its questions again; Task 9's old-layout test covers this.
- **Assumption:** The error file in the log folder may be committed with the run's later bookkeeping. → Its text is the same text the failure comment already posts to the issue, so committing it publishes nothing new; if a tool response ever holds a secret, it was already in the comment.
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
  - A) The engine writes its own file beside the orchestrator's, `build-decision-{RUN}-{K}-engine.md`, through a new verb `decisions counts` that every verify, holistic or tests pause runs. The file holds `Source changed` and `Gate` as header lines and, when the pause has a loop, the attempt line, the `## Progress` block, the base-check line and the loop question as `Q1`. The verb reads the orchestrator's file to count its questions, so the orchestrator writes that file first. The orchestrator shows both files in one message. — Two files per pause, but each has one writer and both are committed with the run.
  - B) A status row. — No new file, but the owner cannot read a status row, and the orchestrator would have to copy the numbers into its message by hand.
  - C) Printed keys only. — Nothing is kept, so a resumed run loses the numbers.
  - Recommended: A) — it is the only option where the numbers are kept, readable and written only by the engine.
  - Default if unanswered: the plan assumes A.
- **Q4 — Where a settled decision is written:** Today the engine writes the owner's chosen option and the pause's state into the decision file (`decisions apply`). With the orchestrator owning that file, an engine-written `Decision:` line there would make two writers of one file, which the owner's decision ruled out.
  - A) Every line the engine writes (a headless assumed `Accept`, a gate re-run, ship's confirm or reject, and the owner's loop answer per Q9) goes into the `-engine.md` file. Readers merge both files, the engine's line wins for a question, and `Status` is computed on read instead of written: `OPEN` while a question has no answer, except that a loop answered `Try again` settles the pause, as Decision Pause step 6 does today; then `ASSUMED` while an assumed `Accept` remains; else `DECIDED`. The orchestrator writes only the owner's item answers and `Fix task:` lines in its own file. — Each file has one writer; readers change once, in one shared reader.
  - B) Status rows. — The decision text leaves the files the owner reads.
  - C) Keep the engine writing into the orchestrator's file. — Contradicts decision `958-agent-writes-engine-counts-verbs-named-for-what-they-do`.
  - Recommended: A) — it keeps one writer per file and one reader for all callers.
  - Default if unanswered: the plan assumes A.
- **Q5 — Where the error file lives:** When a run stops on its Failure Path, the text that says why it stopped moves out of the hidden git folder (`.git/bkit-outbox/`). It needs a folder that exists in each workflow and that the file tool may write without a prompt.
  - A) `{LOG_DIR}/{workflow}-error.md`, with the failed command's stderr beside it as `{workflow}-stderr.md`. Ship, which holds no `LOG_DIR`, uses `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/`. Before `LOG_DIR` is held, `--error-file` is dropped, as today. `workflows fail` keeps only reading the file; the handover commit or the next bookkeeping commit carries it. — The text stays with the run's record.
  - B) `tmp/bkit-error-{FID}.md` in the checkout. — Never committed, so the record of why a run stopped is lost; and `tmp/` is not in bkit's managed `.gitignore` block, so a consumer could commit it by accident.
  - Recommended: A) — the error file is part of the run's record, like its other logs.
  - Default if unanswered: the plan assumes A.
- **Q6 — Verb names:** Every engine command whose job changes needs a name for its new job, with no alias kept.
  - A) `decisions compose` is removed; `decisions check` checks the orchestrator's file and `decisions counts` writes the engine file. `decisions apply` gains `--answer` for the owner's loop answer (Q9). `steps stub` keeps its name and loses `--result-file`, `--agent` and `--invocation`, because its remaining job (copying a template into a stub) does not change. `steps verdict` loses `--result-file`. `issues comment --result-file` becomes `--report`. `ledgers findings` is new. — Each name says what the command does now; `counts` also fits a verify or holistic pause with no loop question, where the verb writes only `Source changed`.
  - B) Keep `decisions compose` for the engine file. — "compose" would then name a verb that composes nothing the owner wrote, which the decision rules out.
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
- **Q9 — Who writes the owner's answer to the loop question:** The loop question lives in the engine's file, which only the engine writes, but the owner answers it in the orchestrator's session. The answer (`Try again` or `Decide`) decides whether a resumed run re-runs the gate, asks again or moves on.
  - A) The orchestrator hands the answer to the engine with `decisions apply --by=owner --q=1 --answer=<Try again|Decide|Stop> --reason=<owner's words>`, and the engine writes the `Decision:` line under the engine file's `Q1`. — Each file keeps one writer, for one more flag on an existing command.
  - B) The orchestrator writes a `Q1` holding only the `Decision:` line in its own file, and `decisions check` accepts that after step 6. — No new flag, but one question is then split across two files and two writers, and `check` needs a second rule for when a `Q1` is allowed.
  - Recommended: A) — it keeps one writer per file, and the merged reader treats the loop answer like every other engine line.
  - Default if unanswered: the plan assumes A.
- **Q10 — Where the debug context-fetch script goes:** When the debug workflow fetches outside evidence (logs, CI runs), the orchestrator adjusts each fetch script and hands it to the engine to run. Today it writes that script into the hidden git folder with a shell heredoc (an inline file write), which is the kind of write the issue removes. The file tool needs a place outside the git folder.
  - A) The run's log folder, `docs/plans/{YYYYMM}/logs/{FID}/context-fetch-{DEBUG_ATTEMPT}-{IDX}.sh`. — It is committed with the run's other context files, so the record shows which query fetched which evidence. A script that inlined a secret would be published, but each block comes from the tracked `.agents/context.md`, and the adjustment changes only severity, freshness, limit, query and filters.
  - B) The checkout's gitignored `.worktrees/bkit-context-fetch-{FID}-{IDX}.sh`, as Q8 does for auto. — Never committed, but loose files collect beside the worktree folders and the run's record loses the query.
  - C) Keep the heredoc and narrow the success criterion. — No change here, but the issue's criterion "No prompt or workflow tells an agent to write into `{OUTBOX}` or `.git/` with a shell command" is then not met.
  - Recommended: A) — it is the only option that meets the criterion and keeps the query with the evidence it fetched.
  - Default if unanswered: the plan assumes A.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #958
```

Or, to address the reasons first: `/bkit-plan #958`
