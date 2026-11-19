## Session Prompt — this run's, newer than everything below

/bkit-plan #958

## Issue description — oldest

### Problem

Some workflow steps tell an agent to produce a file that only the engine reads. The agent writes a throwaway script for it every time: `node -e`, `python3 -`, a heredoc, or `sed -i`. Two things go wrong.

- **The run stops for a permission prompt.** Claude Code's auto mode cannot see what an inline script will do, least of all when it writes inside `.git/`, so it asks the owner. On 2026-11-15 a build's holistic verify sat waiting on a prompt for a `node -e` script that wrote `build-plan-verify-holistic-1-result.json` into `.git/bkit-outbox/`.
- **The same content is written twice.** #860 — Move deterministic bookkeeping and safe recovery into the engine (https://github.com/cbartens/bkit/issues/860) made ten agents hand their findings over as JSON, and made the engine write their `.md` report from it (`steps stub --result-file`, commit `7ae1a3e8b`). The prompts still tell the agents to write the report themselves, so the two copies can disagree. The audit agent got the same step in the same commit. The orchestrator's decision file works the same way (`decision-items.json` → `decisions compose`).

Counts come from a pattern scan of workflow transcripts on 2026-11-15, so they are approximate. "Since #860" counts 699 transcripts written after it closed on 2026-11-12.

<!-- prettier-ignore -->
| File | Written by | Today | Transcripts since #860 (30-day calls) | Decided |
| --- | --- | --- | --- | --- |
| Structured result `{OUTBOX}/*-result.json` | verify, challenge, review, diagnose, spike and scope-check subagents (ten prompts), and `bkit-audit-generate` | Agent writes JSON; `steps stub --result-file` writes the `.md` from it | ~17 (~170) | The JSON file goes. The agent writes its own `.md`; the engine checks it. |
| The `Verdict:` line of the agent's own report | tasks, tests, gaps-remediate, plan-current and soak subagents | Agent sets it with the edit tool; some use `sed -i` | ~25 (~460) | Stays the agent's own line, set with the edit tool. The engine checks it at `bkit steps finish`. No setter command. |
| `{OUTBOX}/decision-items.json` | orchestrator | Orchestrator writes JSON; `decisions compose --items` writes the decision `.md` from it | ~10 (32) | The JSON file goes. The orchestrator writes its questions as `.md`; the engine checks them and counts on its own side. |
| `{OUTBOX_ROOT}/error.md` | orchestrator | Written under `.git/bkit-outbox/`; `workflows fail --error-file` reads it | 2-4 (~31) | Becomes a plain `.md` the orchestrator writes with the file tool. `workflows fail` still reads a file. |

### Decided direction

The owner decided this on 2026-11-18. It replaces the 2026-11-15 line "agents hand the content to a `bkit` command, and the engine writes the file".

- **Every agent writes its own `.md` artifact**, in the format its prompt defines: headers, counts, verdicts.
- **The engine checks and counts.** It runs code to check that the file has the format, that the counts are right and that the verdict is there. It hands a bad file back to the agent. It does not write the agent's file.
- **The orchestrator follows the same rule.** It writes its decision questions and its Failure Path error text as plain `.md` files with the file tool. The engine never writes the orchestrator's words.
- **Writing and counting are kept apart.** Numbers only the engine can count are not written into an agent's or the orchestrator's file. For the decision pause these are the rounds run, whether the last round changed code, how many failing tests also fail on `dev`, and the "Try again or Decide" recommendation built from them.
- **No ledger row stands in for the error text.** Friction rows stay as the workflow contract already has them.
- **Verbs are named for what they do.** Every engine verb whose job changes here gets a name that matches its new job, in the engine, the workflows, the prompts and `.bkit/core/.bkit/cli.md`. No old name is kept for a changed job.

### Outcome

An agent writes each of its files once, as `.md`, with the file tool. No prompt or workflow asks for a JSON copy, an inline script or a write into `.git/`. A file with a wrong format, count or verdict goes back to the agent that wrote it with a reason it can act on.

### Success criteria

- No prompt or workflow line names `{OUTBOX}/*-result.json`, a `Result:` launch line, `steps stub --result-file` or `{OUTBOX}/decision-items.json`.
- The JSON result path is gone from the engine and from `.bkit/core/.bkit/cli.md`.
- A report with a wrong count or a missing verdict is refused at `bkit steps finish` and handed back to its agent, not sent to **Failure Path**.
- The audit agent writes its findings once. The engine reads the report to check the totals and to print the ledger rows.
- The decision file's questions are the orchestrator's own text. The engine's counts for the pause are reported by the engine, not written into that file.
- No prompt or workflow tells an agent to write into `{OUTBOX}` or `.git/` with a shell command.
- In a fresh-consumer dogfood build run through holistic verify, in Claude Code auto mode, no permission prompt appears for these writes.
- The changed prompts and workflows work in all five host renderings.
- Both word counts go down (`pnpm bkit:text:ceiling check`).

### Removes

- `steps stub --result-file` and `renderResult` in `.bkit/core/engine/commands/workflow/steps.ts`.
- The clauses `result-path-cleared`, `structured-result-file`, `structured-result-render` and `structured-supply-only` in `.bkit/instructions.md`. `structured-result-file` alone is 2,491 words across ten prompts.
- 12 render lines and 12 `Result:` launch lines in the workflows (build 5, debug 1, design 3, plan 3).
- The "Serialize the findings once" step in `.bkit/core/prompts/bkit-audit-generate.md`.
- The `decision-items.json` step in `.bkit/core/workflows/bkit-build.md` and the JSON reader behind `decisions compose --items`.

### Constraints and non-goals

- The agent keeps its findings, judgments and wording.
- Before #860 the reviewer wrote task blocks under `## Findings Log` and set `Failures` with the edit tool. The engine still has that reader (`parseFindings` in `.bkit/core/engine/commands/workflow/challenge.ts`). Reuse it.
- Three plan review agents have no shell tool. They write with the file tools only.
- Not in scope: agents editing source files through the shell instead of the edit tool (~2,700 calls in 30 days). No command is missing there; it is a prompt-following problem.
- Not in scope: values the orchestrator holds in memory. #910 — Bookkeeping: the engine keeps what the orchestrator remembers (https://github.com/cbartens/bkit/issues/910) covers those.
- Docs change in the same change: `.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/workflows.md` and `.bkit/instructions.md`.

### Decisions already made

Rows in `docs/decisions.jsonl`, all owner answers of 2026-11-18:

- `958-agents-write-their-md-engine-only-checks`
- `958-audit-agent-writes-findings-once-engine-reads-report`
- `958-orchestrator-writes-decision-and-error-md-no-error-ledger-row`
- `958-agent-writes-engine-counts-verbs-named-for-what-they-do`

They replace `860-existing-artifact-serialization`, which a plan step wrote. Decision `467-failure-error-text-through-file` stands: the error text still travels in a file.

### Open questions for the plan run

1. **Check coverage.** Can `bkit steps finish` check the format and the counts of all ten result agents' reports today, or does it need a rule per agent?
2. **Audit table.** Can the engine read the audit report's Findings table as agents write it today, or does the table's format need tightening?
3. **Where the pause's counts live.** The engine reports its counts on its own side: printed keys, a status row, or its own file. How does the owner see them next to the orchestrator's questions?
4. **Settling a decision.** `bkit decisions apply` writes the settled state into the decision file today. Does the taken option stay in that file as the engine's own line, or move to a status row?
5. **Error file.** Where does the error `.md` live (the run's log folder?), can `workflows fail` commit it while the worktree is mid-failure, and does a failure before the log folder exists keep today's rule of passing no file?
6. **Verb names.** Which verbs change their job (`decisions compose`, `steps stub`, others), and what is each one's new name?
7. **The `PASS` rule.** "Review prompts ask for the report twice, with rules the engine refuses" (https://github.com/cbartens/bkit/issues/974) point 2: with the JSON gone, is the prompt's own rule (`Failures` = number of `CRITICAL` items) the only rule left for the four prompts it names?

### References

- #860 — Move deterministic bookkeeping and safe recovery into the engine (https://github.com/cbartens/bkit/issues/860): this issue undoes its JSON result path.
- #974 — Review prompts ask for the report twice, with rules the engine refuses (https://github.com/cbartens/bkit/issues/974): closed by this work.
- #910 — Bookkeeping: the engine keeps what the orchestrator remembers (https://github.com/cbartens/bkit/issues/910): related.
- `.bkit/core/engine/commands/workflow/steps.ts`: `renderResult`, `stub`
- `.bkit/core/engine/commands/workflow/decisions.ts`: `compose`, `apply`
- `.bkit/core/engine/commands/workflow/workflows.ts`: `fail`
- `.bkit/instructions.md` § structured-result-file
- `.bkit/core/workflows/bkit-build.md`: the Failure Path and the Decision Pause
- Evidence: transcript scan of 2026-11-15 over 30 days (3,114 transcripts across bkit and a consumer repo, 2,188 of them workflow runs), plus a recount of the 699 transcripts written since 2026-11-12.
- The body as it stood before 2026-11-18 is in this issue's edit history.

## Issue comment — posted 2026-11-16T02:05:54.000Z

**Cross-check against the review in [#964 — Review since v6.1.1: tech debt findings and consolidation work](https://github.com/cbartens/bkit/issues/964), 2026-11-16.** Finding ids (M1, G5 …) are that issue's. Nothing in this issue was changed.

**This issue and a bug filed from the review change the same ten prompts and the same shared clause.** The bug is [#974 — Review prompts ask for the report twice, with rules the engine refuses](https://github.com/cbartens/bkit/issues/974) (findings M1, N5, O7, O10). The shared clause is `structured-result-file` (`.bkit/instructions.md:5024`).

What this issue already covers:

- The result file the agent writes by hand (row 1 of the table) and the hand-set `Verdict:` line (row 2).
- Open question 2, second option (move these agents onto result files, so the engine renders the header as well) removes the double write the bug describes. Today each of the ten prompts tells the agent to set `Failures` and `Verdict` by hand and also to write a result file from which the engine sets them; the hand-written copy is then overwritten (`bkit-build.md:1027-1030`).

What this issue does not cover, and the bug keeps:

- Four prompts allow `PASS` when the findings are not critical (`bkit-plan-review-1.md:95`, `bkit-plan-review-2.md:91`, `bkit-plan-scope-check.md:87`, `bkit-design-review-1.md:86`). The engine refuses `PASS` with any finding at all and exits 6 (`steps.ts:1703-1711`).
- `bkit-plan.md:383-387` runs three `steps stub` renders in one shell block with no `|| exit`, so a refusal of the first or second goes unseen.

**Suggested split,** so the ten prompts are rewritten once and not twice: the bug fixes the `PASS` rule and the hidden exit now; "write the report once" is done here.

**Hand-written files the table does not list:**

- **M6:** a hand-written JSON warning record in `bkit-audit-generate.md:136-145` and `bkit-debug-failure-diagnose.md:66-75`. A malformed record is dropped silently (`summary.ts:225-273`).
- **G7:** the JSON facts files in ship (`bkit-ship.md` around `:290`, `:704`, `:773`). The body says a related issue covers hand-written files "only when `gh` is missing"; check whether these three lines are all on that path.

**The same dormant machinery, seen from the review's side** (relevant to open question 3):

- **G5:** `steps stub --invocation` is used nowhere.
- **M4:** the clause `stub-seed-fingerprint` in `bkit-design-organise.md:55`, `bkit-design-update.md:57` and `bkit-plan-update.md:80` contradicts `steps.ts:2358-2417`.
- **E5:** four flags from the earlier bookkeeping work have no caller: `ledgers append --issue-operation`, `counters --request-hash`, `counters progress --since-clean`, `status invocation --configured-model/--observed-model`. Decide here whether the new writer uses them or they go.
- **M3:** nine prompts gained a sentence forbidding the agent to write the attempt number, timestamp, invocation id or model, which the engine fills in anyway. Those sentences can go once the engine writes the file.

## Issue comment — posted 2026-11-16T04:33:34.000Z

**Decision recorded (owner, 2026-11-16): this issue also fixes #974.**

[#974 — Review prompts ask for the report twice, with rules the engine refuses](https://github.com/cbartens/bkit/issues/974) is about the same code and the same ten review prompts this issue already changes, so it is built here and not on its own. #974 is marked as blocked by this issue and closes when this lands.

Three points to take into the design of this issue:

1. **The review agent writes its report once.** Ten prompts tell the agent to fill in `Failures` by hand and, in the next line, to write the findings as JSON and never write `Failures`. The engine then renders the report from the JSON and overwrites the hand-written copy. The hand-written instruction goes. The shared wording is in `.bkit/instructions.md` § Clauses; the ten prompts are listed in #974.
2. **The verdict rule (owner's decision): only a `CRITICAL` finding counts against `PASS`.** The engine refuses `PASS` when there is any finding at all (`Verdict PASS contradicts N finding(s)`, exit 6, `.bkit/core/engine/commands/workflow/steps.ts:1696-1711`). Four prompts say `PASS` means no `CRITICAL` items. The prompts' rule wins: the engine accepts `PASS` with `LOW`, `MEDIUM` or `HIGH` findings and still refuses it with a `CRITICAL` one.
3. **A refused result is seen.** `bkit-plan.md:383-387` runs three `steps stub --result-file` renders in one shell block, so only the last exit code shows and exit 6 has no route. Each render needs its own exit check and a route.

Two things the design has to hold on to, both checked in the workflow files on 2026-11-16:

- **A `PASS` that carries findings skips nothing, and must keep skipping nothing.** What gets fixed is decided by the findings, not by the verdict. In plan and design, the step that applies the review (`@bkit-plan-update`, `@bkit-design-update`) runs after every review that is not a `FAIL` and applies every `CRITICAL` item and each `OPTIONAL` item on merit. In a build, `challenge merge` turns every `CRITICAL`, `HIGH` and `MEDIUM` finding into a fix task and every `LOW` finding into a deferral row, reading the findings and not the verdict.
- **The rule is per prompt, and the engine check is not.** The check in `steps.ts` is one rule for every agent (any finding means not `PASS`). The new rule belongs only to the four prompts that state it (`bkit-plan-review-1.md`, `bkit-plan-review-2.md`, `bkit-plan-scope-check.md`, `bkit-design-review-1.md`). The two build review prompts say "`PASS` = no findings", and `bkit-build-plan-verify.md` says any open gap is `CONCERNS` or `FAIL`; those stay. The design has to say how the engine knows which rule a prompt uses.

This issue's label stays `next:design`. Nothing else in its body was changed.

## Issue comment — posted 2026-11-18T07:29:06.000Z

**Owner answer, 2026-11-18: drop the JSON result file. Agents write their own `.md`; the engine only checks it.**

In the owner's words: agents produce `.md` artifacts in a specific format, with specific headers, counts and verdicts. The engine runs code to check that the file has the format, that the counts are right and that the verdicts are there and well formed. That is engine work, but it does not mean the engine writes the `.md` file.

What this decides for this issue:

- The ten result agents (`bkit-build-challenge-1` and `-2`, `bkit-design-review-1` and `-2`, `bkit-plan-review-1` and `-2`, `bkit-plan-scope-check`, `bkit-build-plan-verify`, `bkit-debug-failure-diagnose`, `bkit-design-spike`) write their report themselves, in their prompt's output format, findings under `## Findings Log` included.
- `bkit steps finish` checks the file: header fields, the `Failures` count against the finding blocks, the verdict. A file that fails goes back to the agent that wrote it.
- The orchestrator passes the file on and writes nothing.
- Removed: the `Result:` line at the 12 launch sites, the 12 `bkit steps stub --result-file` render commands in the plan, design, build and debug workflows, the clauses `structured-result-file`, `structured-result-render`, `structured-supply-only` and `result-path-cleared` in `.bkit/instructions.md`, and the engine code that renders a report from JSON.
- The three plan reviewers keep their tools; none needs a shell for this.

Where the JSON came from: commit `7ae1a3e8b` (2026-11-12), the landing of "Move deterministic bookkeeping and safe recovery into the engine" (https://github.com/cbartens/bkit/issues/860). That issue asked for derived header counts. Its plan step chose to have the engine render the whole report (decision `860-existing-artifact-serialization`). No owner decision recorded that shape.

The proposals in this issue's body and in the earlier comments (a `steps result` writer, standard input for the result JSON) no longer apply to the ten result agents.

Decision row: `958-agents-write-their-md-engine-only-checks` in `docs/decisions.jsonl`.

Still open, each to be put to the owner on its own:

- Whether the audit agent (`bkit-audit-generate`), which got the same JSON step in the same commit, goes back too.
- Whether the decision items and the Failure Path error text may reach `bkit` on standard input (revisits `467-failure-error-text-through-file`).
- How `PASS` with only non-critical items is checked for the four prompts named in "Review prompts ask for the report twice, with rules the engine refuses" (https://github.com/cbartens/bkit/issues/974).

Route: `/bkit-plan`, then a build, because it changes what workflow steps pass to each other. The label moves from `next:design` to `next:plan`. Not started.

## Issue comment — posted 2026-11-18T07:31:53.000Z

**Owner answer, 2026-11-18: the audit agent drops its JSON too.**

`bkit-audit-generate` got the same JSON step in the same commit (`7ae1a3e8b`). Today it writes its report, then writes the same findings a second time as JSON and runs `bkit steps stub --result-file` (`.bkit/core/prompts/bkit-audit-generate.md:177`).

What is decided:

- The audit agent writes its findings once, in its report, with its own finding IDs and severity totals.
- The engine reads the report's Findings table to check the totals and to print the ledger rows. It writes no part of the report.
- The audit agent was the last caller of `--result-file`. With it gone, the JSON result path leaves the engine and `.bkit/core/.bkit/cli.md`.
- It is built in the same plan run as the ten result agents, because it is the same engine code.

Not yet checked: whether the engine can read the Findings table as agents write it today. The plan run settles that and may tighten the table's format.

Decision row: `958-audit-agent-writes-findings-once-engine-reads-report` in `docs/decisions.jsonl`.

What the two answers of today mean for the rows of this issue's table:

<!-- prettier-ignore -->
| Row | State |
| --- | --- |
| Structured result `{OUTBOX}/*-result.json` | The file goes. Agents write their own `.md`; the engine checks it. |
| The `Verdict:` line of the agent's own report | Stays the agent's own line, set with the edit tool. The engine checks it at `bkit steps finish`. No setter command. This follows from the owner's rule; it was not asked as its own question. |
| `{OUTBOX}/decision-items.json` | Open. The orchestrator writes it, and only the engine reads it. |
| `{OUTBOX_ROOT}/error.md` | Open. Same. |

Open questions 1, 2 and 3 in the body no longer apply. Question 5 (conflict markers) rests on a wrong premise: `.bkit/friction.jsonl` has had no `merge=union` since `02a3c7493` (`.gitattributes:25-27`), so git does write markers into it.

## Issue comment — posted 2026-11-18T08:01:52.000Z

**Owner answers, 2026-11-18: the orchestrator follows the same rule as the subagents.**

This settles the two rows that were still open.

- **`{OUTBOX}/decision-items.json` goes.** The orchestrator writes its decision questions itself, as `.md`. `bkit decisions compose` no longer writes that file from JSON.
- **The error text becomes a plain `.md`** the orchestrator writes with the file tool, in place of `{OUTBOX_ROOT}/error.md` under `.git/bkit-outbox/`. `bkit workflows fail` still reads it from a file.
- **No ledger row stands in for the error text.** `workflows fail` needs the text for the failure comment, `docs/failures.jsonl` lists known bugs and a stopped run is not always one, and a row is JSON the orchestrator would have to escape by hand. Friction rows stay as they are.
- **The engine never writes the orchestrator's words.**
- **Writing and counting are kept apart.** The agent writes the artifact; the engine counts. The numbers only the engine can count (rounds run, whether the last round changed code, how many failing tests also fail on `dev`, and the recommendation built from them) are not written into the orchestrator's file.
- **Verbs are named for what they do.** Every engine verb whose job changes here is renamed to match, everywhere it appears. No old name is kept for a changed job.

Decision rows in `docs/decisions.jsonl`:

- `958-orchestrator-writes-decision-and-error-md-no-error-ledger-row`
- `958-agent-writes-engine-counts-verbs-named-for-what-they-do`

The issue's title and body are rewritten to the decided direction, with the open points for the plan run listed at the end. The earlier body is in the edit history. Route is unchanged: `/bkit-plan`, then a build.
