# Brief: group 14 — Challenge round 1 findings (tests)

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
- Group 10: The workflows record answers through the engine, the fixers ask the engine, and the docs name the rows — done
  - TASK 36: The build and ship workflows record every answer through `decisions apply` and show the printed counts; the fixers run `decisions answers` themselves — done
  - TASK 37: Contract docs and `docs/testing.md` name the two rows and `decisions answers`, and the ceilings drop — done
- Group 11: Planned tests the build took over — done
  - TASK 38: Take over `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` from TASK 12 — done
  - TASK 39: Take over `bkit decisions check > refuses Q1 when the engine file holds the loop question` from TASK 10 — done
  - TASK 40: Take over `bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged` from TASK 12 — done
  - TASK 41: Take over `bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1` from TASK 12 — done
  - TASK 42: Take over `bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file` from TASK 24 — done
- Group 12: Planned tests the build took over — done
  - TASK 43: Take over `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` from TASK 25 — done
  - TASK 44: Take over `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` from TASK 12 — done
- Group 13: Holistic fixes — done
  - TASK 45: Ship's Failure Path drops `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held — done
  - TASK 46: The install record matches the rendered workflow copies — done
- Group 14: Challenge round 1 findings — this group
  - TASK 47: A ship that confirms the first assumed Accept of a decision file written before the upgrade wipes that file's other assumed Accepts, so the owner's next confirm exits 2 and pending neither lists nor defers them — open
  - TASK 48: A failed command prints a token that no environment variable of the `workflows fail` process holds (an `Authorization: Bearer` header, a PEM private-key block, a `ghp_` / `github_pat_` / `sk-` token read from a dotenv file, keyring or config file); `scrubSecrets` matches only env values and `user:password@` URLs, so the raw token lands in the committed `{LOG_DIR}/{workflow}-stderr.md`, pushed under `[skip ci]` with no secret scan — open
  - TASK 49: A consumer's failed test prints a service-role key, an SMTP or database password or a chat webhook URL held in env as `*_SERVICE_ROLE_KEY`, `*_KEY`, `*_PASS` or `*_WEBHOOK_URL`; `CREDENTIAL_NAME` lists only `TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|CREDENTIAL` and a `*_URL` value counts only with `user:password@`, so those values reach the committed error and stderr files unredacted — open
  - TASK 50: A failed command prints a Redis-style URL with an empty user name, `redis://:<password>@cache:6379`; both `URL_PASSWORD` and the replace regex need at least one user character before the `:`, so neither the env-value check nor the URL rewrite fires and the password is committed and posted in clear — open

## The work

<!-- bkit:task 47 start -->
- [ ] **TASK 47:** A ship that confirms the first assumed Accept of a decision file written before the upgrade wipes that file's other assumed Accepts, so the owner's next confirm exits 2 and pending neither lists nor defers them
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/open-decision.ts:177` · **Round:** 1
  - **DONE WHEN:** foldDecision treats a file whose header carries a Status line as an old file whatever rows name it: its in-file Decision, Fix task, Rejected and Deferred lines, its Source changed and Gate header lines and its Progress-block loop stay the base, and a decision-answer row overrides only the question it names; pauseStatus folds the same way; the plan's old-file wording (plan lines 259, 560 and 1296) drops "and that no row names"; the four tests below pass and every existing open-decision and decisions test still passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > confirming Q1 of an old per-line file with two assumed Accepts leaves Q2 confirmable` fails on the second confirm (q 2) exiting 2 with "Q2 is not an assumed Accept" once the Q1 row names the file
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > pending lists the second assumed Accept of an old per-line file after the first is confirmed` fails on pending printing count 0 instead of 1, so no needs-decision deferral is ever written for Q2
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision rows > an old file keeps the in-file answers of questions no row names` fails on decisionItems returning Q2 with decision null and assumed false after one decision-answer row for Q1 names the file
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `skipProblem > an old file keeps its Source changed header after a row names it` fails on the refusal "no Source changed header" for an old verify file whose in-file header reads Source changed false and whose Q1 Accept is a row
<!-- bkit:task 47 end -->

<!-- bkit:task 48 start -->
- [ ] **TASK 48:** A failed command prints a token that no environment variable of the `workflows fail` process holds (an `Authorization: Bearer` header, a PEM private-key block, a `ghp_` / `github_pat_` / `sk-` token read from a dotenv file, keyring or config file); `scrubSecrets` matches only env values and `user:password@` URLs, so the raw token lands in the committed `{LOG_DIR}/{workflow}-stderr.md`, pushed under `[skip ci]` with no secret scan
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:360` · **Round:** 1
  - **DONE WHEN:** `scrubSecrets` also replaces, whatever the env holds, the value after `Authorization: Bearer` / `Authorization: Basic` (and `token=` / `access_token=` query values), the body of any `-----BEGIN … PRIVATE KEY-----` … `-----END … PRIVATE KEY-----` block, and values with a well-known token prefix (`ghp_`, `gho_`, `ghs_`, `github_pat_`, `glpat-`, `xox[abpr]-`, `sk-`, `AKIA`), with `<redacted>`; both files then hold none of them, and the Task 23 and Task 26 tests still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > redacts token-shaped values that no environment variable holds from the error and stderr files` fails on both files still holding a fake `Authorization: Bearer` value, a fake PEM private-key body and a fake `ghp_`-prefixed token (each built at runtime, none set in any env var) after the call
<!-- bkit:task 48 end -->

<!-- bkit:task 49 start -->
- [ ] **TASK 49:** A consumer's failed test prints a service-role key, an SMTP or database password or a chat webhook URL held in env as `*_SERVICE_ROLE_KEY`, `*_KEY`, `*_PASS` or `*_WEBHOOK_URL`; `CREDENTIAL_NAME` lists only `TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|CREDENTIAL` and a `*_URL` value counts only with `user:password@`, so those values reach the committed error and stderr files unredacted
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:356` · **Round:** 1
  - **DONE WHEN:** An env var counts as a credential when its name also ends in `KEY`, `PASS`, `PWD` (other than `PWD` / `OLDPWD` themselves), `AUTH` or `PAT`, or holds `WEBHOOK` or `SESSION`, and `scrubSecrets` replaces each such value (4 chars or longer) with `<NAME>` in both files; the Task 26 list stays covered.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files` fails on both files still holding the fake values of `BKIT_TEST_SERVICE_ROLE_KEY`, `BKIT_TEST_SMTP_PASS` and `BKIT_TEST_ALERT_WEBHOOK_URL` (a `https://hooks.example.test/services/…` URL with no `user:password@`) after the call
<!-- bkit:task 49 end -->

<!-- bkit:task 50 start -->
- [ ] **TASK 50:** A failed command prints a Redis-style URL with an empty user name, `redis://:<password>@cache:6379`; both `URL_PASSWORD` and the replace regex need at least one user character before the `:`, so neither the env-value check nor the URL rewrite fires and the password is committed and posted in clear
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:372` · **Round:** 1
  - **DONE WHEN:** `URL_PASSWORD` (`workflows.ts:357`) and the rewrite at `workflows.ts:372` accept an empty user part (`[^\s/:@]*`), so `scheme://:<password>@host` becomes `scheme://:<redacted>@host` and a `*_URL` env var holding such a URL is replaced by name; the Task 26 `postgres://app:<fake>@db/app` case still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > redacts the password of a URL with an empty user name from the error and stderr files` fails on both files still holding the fake password of `redis://:<fake>@cache:6379/0` after the call
<!-- bkit:task 50 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `decisionItems` reads the questions from the orchestrator's file and the loop question and progress from the file's last `decision-counts` row | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| A `decision-answer` row's answer wins over an in-file `Decision:` line for one question | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| An old single-file decision layout still reads the same | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 9 |
| `openDecision` reads `Gate` and `Source changed` from the `decision-counts` row | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| A pause whose `Q1` row answers `Try again` reads `DECIDED`, so `openDecision` does not return it | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| `gateRerun` re-runs a red-gate pause whose `Gate` and loop question come from its `decision-counts` row | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| `skipProblem` reads `Source changed` and the loop answer from the rows | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
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
| bkit decisions check > refuses a question line written with an en dash, naming the line | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 17 |
| bkit decisions check > refuses a file with no question when the engine file holds no loop question | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 17 |
| decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed) | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| decision file readers > an owner's answer in the decision file wins over an engine line applied without asking | Unit | `.bkit/core/engine/commands/workflow/open-decision.test.ts` | 29 |
| bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed) | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 30 |
| bkit decisions check > refuses a Status, Source changed or Gate line in the orchestrator's header | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 19 |
| bkit workflows fail > rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 23 |
| bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 33 |
| bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 34 |
| bkit workflows fail > redacts credentials beyond the tracker keys from the error and stderr files | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 26 |
| bkit workflows fail > writes the stderr file with the checkout path made relative and the home directory as ~ | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 26 |
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
| bkit decisions check > refuses a Decision, Fix task, Rejected or Deferred line in the orchestrator's file | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 34 |
| bkit decisions answers > prints the last appended answer per question with its writer | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 35 |
| bkit decisions answers > prints an old single-file decision's in-file answers | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 35 |
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
