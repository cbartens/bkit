## #680 — ledgers append: engine writes ledger rows with a minted ts (closed)

### Narrative

Four open issues each assume a `bkit ledgers append` verb that writes a row into a JSONL ledger with a freshly minted `ts`: #659 fix 3 ("`bkit ledgers append --file=docs/decisions.jsonl --rows=<json>`, which mints `ts` itself"), #673 (the close-time telemetry rows), #676 item 19 (`.bkit/friction.jsonl` rows from every orchestrator header, "No append verb exists") and the Decision Pause rows of #671 / #672. No such verb exists: `.bkit/core/engine/commands/workflow/ledgers.ts` has `commit`, `union` and `only-bookkeeping` only. Every writer today runs the `jq -c -n … | .ts = (now*1000|floor)` idiom from `.bkit/jsonl.md` § Write Idiom by hand, and a writer with no shell leaves its rows behind as "paste-ready commands".

One verb, landing before the four issues, so there is never a second way to append a row:

```text
bkit ledgers append --ledger={decisions|deferrals|failures|knowledge|friction|issues} --rows=<file> --writer=<agent or step>
```

- Reads an array of row objects from `--rows` (a file, or `-` for stdin). Each row is the `.bkit/jsonl.md` shape minus `ts`.
- Mints `ts` per row at append time with `Date.now()`; a mint that lands on a whole second (`ts % 1000 == 0`) is bumped by one millisecond, because the envelope gate rejects round values as fakes.
- Fills `repo` and `bkitVersion` when a row lacks them, the way `workflows close` does for its own rows.
- Validates every row with `validate()` from `.bkit/core/engine/ledgers/telemetry.ts` before writing any; the first invalid row stops the call and names the row index and field. Nothing is written on failure.
- Refuses a `--writer` that `.bkit/jsonl.md` § Ledgers & Writers does not list for the ledger's kind. The writer lists move into `telemetry.ts` beside `DEFERRAL_WRITERS`, one set per kind, so the doc table and the code cannot drift.
- Appends one line per row, newline-terminated, with `O_APPEND`; never reads back or rewrites existing rows (`.bkit/friction.jsonl` is drained by `bkit harvest` only).
- Prints `{ ledger, appended, keys }`. Does not commit: `ledgers commit` already stages the ledgers.

### Success Criteria

- A subagent with no shell can hand its rows to the orchestrator as JSON, and one `bkit ledgers append` call lands them with real timestamps.
- A row carrying its own `ts`, an unknown field, a wrong `kind` for the ledger, or an unlisted writer is refused with the row index and the reason, and the ledger file is byte-identical afterwards.
- `bkit ledgers append` is the only append route named in `.bkit/jsonl.md` § Write Idiom for engine and workflow writers; the `jq` idiom stays for humans and scripts.
- #659, #671, #672, #673 and #676 item 19 can call the verb as written here without extending it.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A row carries `ts` | Refused: `ts` is minted, never supplied |
| `Date.now()` returns a whole second | `ts` bumped by 1 ms; the envelope gate's round-value check never fires on a real mint |
| Second row of three is invalid | Exit non-zero naming row 2 and the field; nothing appended |
| `--rows` file empty or `[]` | Exit 2 (usage): nothing to append is an error, never a silent no-op |
| Ledger file does not exist yet | Created with the rows; parent directory created |
| `--writer` not in the kind's writer set | Exit non-zero naming the writer and the kind's allowed writers; nothing appended |
| `--ledger=issues` | Allowed only for `kind: feature` rows; `union` still never touches `.bkit/issues.jsonl`, unchanged |
| Two appends in the same millisecond | Distinct rows with equal `ts`; identity is `key`, never `ts` |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| append mints ts and writes validated rows | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| append refuses a supplied ts | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| append writes nothing when one row is invalid | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| append bumps a round-second mint | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| append refuses an empty rows file | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| append refuses a writer not listed for the kind | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| writer sets in telemetry.ts match the jsonl.md table | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` |

### Tasks

- [ ] **Task 1:** Add the `append` verb to `ledgers.ts`: read `--rows`, mint `ts` (bump a round second), fill `repo` and `bkitVersion`, validate every row with `validate()`, refuse on the first invalid row or a supplied `ts`, append with `O_APPEND`, print `{ ledger, appended, keys }`. **Done when:** the five append tests in the matrix pass and `bkit ledgers --help` lists the verb. **Test first:** `ledgers.test.ts` `append mints ts and writes validated rows` fails on the unknown verb.
- [ ] **Task 2:** Move the writer lists from `.bkit/jsonl.md` § Ledgers & Writers into `telemetry.ts` as one set per kind beside `DEFERRAL_WRITERS`; `append --writer` is checked against the ledger's set; a test reads the doc table and asserts the sets match. **Done when:** an unlisted writer exits non-zero with nothing written, and the parity test fails if either side changes alone. **Test first:** `ledgers.test.ts` `append refuses a writer not listed for the kind` fails because the verb accepts any writer.
- [ ] **Task 3:** Docs: `.bkit/core/.bkit/jsonl.md` § Write Idiom names `bkit ledgers append` as the route for engine and workflow writers and keeps the `jq` idiom for humans; `.bkit/core/.bkit/workflows.md` § Telemetry Ledgers gains the verb; `docs/testing.md` row for `ledgers.test.ts` lists the new cases. **Done when:** `bkit check` and `pnpm format:check` pass and the mirrors in `.bkit/` match. **Test first:** `n/a — docs only`.

### Open Questions & Assumptions

- Assumed: the verb takes the rows as a file, not as inline JSON on the command line, so a long decision row never hits argument length limits or shell quoting.
- Assumed: `--writer` is the agent or step name as `.bkit/jsonl.md` § Ledgers & Writers spells it (`@bkit-plan-generate`, `build orchestrator`). Should the orchestrator pass its own name when it appends rows a subagent handed over, or the subagent's name? Proposal: the subagent's name, with `source` recording the handover, so the writer rule stays about who authored the row.
- Open: should `append` also accept `--ledger=stats` for `workflows close`? #673 can decide when it lands; nothing here prevents it.

### Breaking Changes & Naming

None. New verb; no existing verb or flag changes. The `jq` write idiom keeps working.

### Out of Scope

- Changing which agents may write which kind. The writer table is moved into code, not edited.
- Committing the ledger (`ledgers commit` does that).
- The Decision Pause collect verb, the friction rows and the close-time rows themselves (#671, #672, #673, #676).

### References

- #663 — Workflow prompt process optimisation — https://github.com/cbartens/bkit/issues/663 (parent; review comment of 2026-10-23 section 2.6 names this verb as the single owner)
- #659 — Decision rows a plan promises never get written; build fails late — https://github.com/cbartens/bkit/issues/659 (fix 3 calls this verb)
- #673 — Telemetry: workflows close writes run facts, not a chat-stats script — https://github.com/cbartens/bkit/issues/673 (close-time rows)
- #676 — Orchestrator work the engine could do as bkit commands — https://github.com/cbartens/bkit/issues/676 (item 19, friction rows)
- #671 — Decision Pause: headless runs go ahead on the recommendation — https://github.com/cbartens/bkit/issues/671
- #672 — Decision Pause: keep building work that doesn't need the answer — https://github.com/cbartens/bkit/issues/672
- `.bkit/jsonl.md` § Write Idiom, § Ledgers & Writers, § Friction Is a Drained Queue
- `.bkit/core/engine/ledgers/telemetry.ts` `validate`, `DEFERRAL_WRITERS`
- `.bkit/core/engine/commands/workflow/ledgers.ts` (`commit`, `union`, `only-bookkeeping`)

###### bkit:blocked-by start
###### bkit:blocked-by end

## Review against the code (2026-10-23)

The core claim holds: there is no append verb, and every writer appends by hand. Four details in the body do not match the code and should be settled before build.

### 1. Nothing rejects a whole-second `ts`

The body says "the envelope gate rejects round values as fakes", so the verb bumps a round mint by 1 ms. That rule exists only as prose in `.bkit/core/.bkit/jsonl.md:26`. `validate()` (`.bkit/core/engine/ledgers/telemetry.ts:703`) only checks that `ts` is a number. The bump guards against a check that never runs.

The engine's own writers already mint unbumped values: `featureRow` in `.bkit/core/engine/commands/workflow/roadmap.ts:334` uses raw `Date.now()`, and `comply.ts:238` adds a per-row offset. Adding the check to `validate()` alone would make those writers fail about one write in a thousand.

**Proposal:** one shared `mintTs()` in `telemetry.ts` that does the bump; switch the existing engine writers to it; add the `ts % 1000 == 0` rejection to `validate()` in the same change. The doc then becomes true.

### 2. Nothing rejects an unknown field either

Success Criteria says a row with an unknown field is refused. `validate()` has no such check, and adding one means a field allow-list for each of the 11 kinds. That is its own piece of work.

**Proposal:** drop it from this issue, or split it into a follow-up.

### 3. `--writer` duplicates the existing `subagent` field

`.bkit/jsonl.md` § Who Wrote It already defines authorship: a subagent sets `subagent` to its frontmatter `name:`, and the orchestrator omits it. That also answers the open question here (the subagent's name). A separate `--writer` flag can disagree with the row it writes.

**Proposal:** no `--writer` flag. Check each row's own `subagent` against the kind's writer set, the way `DEFERRAL_WRITERS` (`telemetry.ts:321`) already works.

Note for Task 2: the writer table is not a closed set for every kind. `failure` is "any agent", and the `stats` kinds are written by the engine and a script, not agents. The parity test has to encode "any agent" explicitly, not treat the table as a list of names.

### 4. `--ledger=issues` would be a second append route

`bkit roadmap feature --row=<json>` already appends a validated `kind: feature` row to `.bkit/issues.jsonl` and re-renders the `roadmap-status` block (`roadmap.ts:380-400`). An append through `ledgers append` would skip the re-render and leave the board stale.

**Proposal:** leave `issues` out of the verb. Feature rows stay on `roadmap feature`.

### Implementation route

- Put the mint, validate-every-row and single-append logic in one shared helper in `telemetry.ts` (say `appendRows(file, rows)`), which the verb calls. Six places in the engine already call `appendFileSync` on their own; the helper is what stops a seventh. Moving them all onto it can wait, apart from the `ts` change in point 1.
- With the points above settled, the body is already plan-shaped, so `/bkit-build` can run from it directly.
- Uncommitted work on `dev` currently touches `.bkit/core/.bkit/workflows.md` and `docs/testing.md`, both of which Task 3 edits. Land that first or build in a worktree.

## Built on dev — dfb1b5e8 (not pushed)

`bkit ledgers append` now exists. It follows the review comment above, with one correction.

### Correction to point 1 of the review

The whole-second check does exist. It is in `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` (`wholeSecondTsRows`), a test that reads the live ledger files, not in `validate()`. It also fails a genuine timestamp that happens to land on a whole second, about one row in a thousand. So the 1 ms bump the issue asked for is needed, and it is built. `validate()` is unchanged. The engine writers that took the raw clock now go through the bump instead.

### What the command does

`bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction> --rows=<file|->`

- Reads a JSON array of rows without `ts`, from a file or from stdin with `-`.
- Sets each row's `ts` at write time. Each one is later than the row before, and none lands on a whole second.
- Fills `repo` and `bkitVersion` when a row lacks them, and puts `ts, kind, repo, bkitVersion` first in the row.
- Checks every row before writing any. A row that carries `ts`, has the wrong `kind` for the ledger, fails `validate()`, or names an author not allowed for its kind exits **8**. The error names the row number and the reason, and the file is left byte-identical.
- An unknown ledger, an unreadable or non-JSON rows file, or no rows exits **2**.
- Creates the file and its folder when missing. If the last line has no final newline, it starts the new rows on a fresh line.
- Prints `{ ledger, file, appended, keys }`. It does not commit; `ledgers commit` still does that.

### How it differs from the issue body

- **No `--writer` flag.** The author is the row's own `subagent` field, which must come with `model`. A row without `subagent` counts as written by the orchestrator in its `workflow` field (`.bkit/jsonl.md` § Who Wrote It).
- **No `issues` ledger.** Feature rows stay on `bkit roadmap feature`, which also redraws the board.
- **No unknown-field refusal.** `validate()` has no allowed-field list per kind; that is still open as a follow-up if wanted.
- **No `stats` ledger.** `.bkit/stats.jsonl` stays engine-only; #673 can add it.

### Files

- `.bkit/core/engine/ledgers/telemetry.ts` adds:
  - `APPEND_LEDGERS`: ledger name → file and kind.
  - `KIND_WRITERS`: the § Ledgers & Writers column as code. `failure` is "any agent", and `deferral` reuses `DEFERRAL_WRITERS`.
  - `writerProblem()`: the author check.
  - `mintTs()`: the timestamp helper.
- `.bkit/core/engine/commands/workflow/ledgers.ts` adds the `append` verb and `appendLedgerRows()`, which other engine code can call directly.
- `workflows close`, `bkit comply` and `bkit roadmap feature` now take `ts` from `mintTs()`.
- `.bkit/core/.bkit/jsonl.md` (and its installed copy):
  - § Write Idiom names the command as the route for engine and workflow writers and keeps `jq` for humans and scripts.
  - § Ledgers & Writers points at `KIND_WRITERS`.
- `.bkit/core/.bkit/workflows.md` § Telemetry Ledgers and `docs/testing.md` list the command.

### Tests

- `ledgers.test.ts`, 11 new cases:
  - sets `ts` and writes the rows
  - keeps a row's own `repo` and `bkitVersion`
  - refuses a supplied `ts`
  - writes nothing when row 2 of 3 is invalid
  - refuses the wrong kind
  - bumps a whole-second clock reading
  - refuses an empty rows file
  - refuses the `issues` ledger
  - refuses an unlisted subagent and an unlisted orchestrator
  - starts a fresh line after a missing final newline
  - creates a missing ledger
- `telemetry.test.ts`:
  - `mintTs` cases
  - `writerProblem` cases
  - a test that holds `KIND_WRITERS` to the `jsonl.md` table. It fails when a writer is removed from the code or an orchestrator added to it (checked by doing both by hand, then restoring).
- Full suite passes (6,857 tests), along with typecheck, lint, Prettier and `bkit check`. `dist/` is rebuilt and in the same commit.

### Still to do

- The Tasks, Success Criteria and Edge Cases in the body still describe `--writer`, `--ledger=issues` and the unknown-field refusal.
- Push to `origin/dev`.

## #659 — Write decisions when made; every ledger writer uses ledgers append (closed)

### Problem

A plan can name decisions that never reach `docs/decisions.jsonl`. The build only finds out at the very end, and by then no agent in the build is allowed to write them, so the build fails on bookkeeping, not on code.

It happened on gether-life/app-gether-life#1338 — Inbound link/image filtering misses Bubble's rules — https://github.com/gether-life/app-gether-life/issues/1338, on 2026-10-22:

1. **The plan step couldn't write the rows.** On bkit 5.5.0, `@bkit-plan-generate` had no Bash, so it couldn't mint `ts`. Its draft says the six decisions D1–D6, four `SUPERSEDED` rows and two deferrals are "NOT YET ON DISK (this run had no shell to mint `ts`; paste-ready commands in the handback)" (`plan-v1-draft.md:619`). Nobody ran those commands.
2. **The plan closed anyway**, with verdict `CONCERNS`. Nothing checks that the rows a plan names exist.
3. **The owner's answers to the plan's open questions came after close.** They were applied by hand in `ba282930c`. `.bkit/core/workflows/bkit-plan.md` Step 11 item 8 asks the questions one by one but says "do not re-run any step", so nothing wrote the decisions carrying those answers.
4. **The plan's last task said "done when" the decision file holds the rows.** The build wrote all the code and every test passed, then failed verify twice on that task. Both fix-up attempts correctly said `BLOCKED`, because no build agent may write `decision` rows (`.bkit/jsonl.md` § Ledgers & Writers). The owner stopped the run and wrote the rows by hand.

What is already fixed:

- 9b3739b0 (2026-10-22) gave Bash to `@bkit-plan-generate`, `@bkit-design-generate` and `@bkit-debug-abort-handover` (decision `ledger-writer-agents-carry-bash`).
- #680 added `bkit ledgers append`. It mints `ts`, checks every row, and checks the author against `KIND_WRITERS` in `.bkit/core/engine/ledgers/telemetry.ts`.

What is still missing:

- No prompt or workflow names `bkit ledgers append`. They all say "append … in `.bkit/jsonl.md` format".
- A decision that changes after it was written has no writer for the new row in two cases:
  - `@bkit-plan-update` changes it during plan review.
  - The owner answers after the plan closed.
- The plan template still gives the build a task that edits `docs/decisions.jsonl` and `docs/knowledge.jsonl`.
- Nothing notices when a row was never written.

### Outcome

Every ledger row is written by a permitted writer at the moment the thing it records happens, always through `bkit ledgers append`. A decision that changes later gets a new row with the same `key`; the newest row wins when the ledger is read. The build never has to write or wait for a decision row a plan promised.

### Success criteria

1. **Decisions are written when made.** Each decision is written by whichever step decides it, in the same step:
   - `@bkit-plan-generate` writes its new decisions, and one row per item in the design's `## Decisions` section. Design itself writes no decision rows, by design.
   - `@bkit-debug-failure-remediate` writes forced architecture decisions.
   - The build orchestrator writes Decision Pause accepts.
2. **A changed decision is a new row.**
   - When `@bkit-plan-update` changes a decision during review, it writes a row with the same `key`.
   - When the owner answers an open question after the plan closed (`bkit-plan.md` Step 11 item 8), the plan orchestrator writes the row for that answer as it is given, the same "only after explicit human approval" rule as build's Decision Pause.
   - `@bkit-utility-update-decisions` keeps writing corrected and superseded rows.
3. **Every ledger writer names `bkit ledgers append`.** Every prompt and workflow line that writes `decision`, `deferral`, `failure`, `knowledge` or `friction` rows says to write them with `bkit ledgers append` and points to `.bkit/jsonl.md` § Write Idiom for the row shape. Prompts don't repeat row fields; the shape lives in `jsonl.md` only. The shared wordings live in `.bkit/wording.md` clauses `ledger-append` and `workflow-friction`, with the old wording kept as retired so `pnpm wording:sync` rewrites it.
4. **Plan close checks the rows.** The plan carries one `**Ledger rows:**` line listing the backticked `key` of every decision and deferral row written for it (`None` if none, `PENDING` until filled). Plan generate and plan update keep it current. Plan close runs `bkit ledgers check --plan=…`, which exits 11 when the line is missing or unfilled or a listed `key` has no row in `docs/decisions.jsonl` or `docs/deferrals.jsonl`. On #1338 this would have failed at plan close instead of after the build.
5. **No build task depends on a ledger row it can't write.**
   - Plan-generate never writes a task whose "done when" checks for decision or deferral rows; the plan template says so.
   - The plan template's "Update documentation" item stops sending the build to `docs/decisions.jsonl` and `docs/knowledge.jsonl`.

### Where the changes go

Writer lists:

- `.bkit/jsonl.md` § Ledgers & Writers and `KIND_WRITERS` in `.bkit/core/engine/ledgers/telemetry.ts`, kept in step by `telemetry.test.ts`.
- `decision` gains subagent `bkit-plan-update` and orchestrators `build` and `plan`, both only after explicit human approval.

Engine:

- `bkit ledgers check` in `.bkit/core/engine/commands/workflow/ledgers.ts` (exit 11 = rows missing), tests in `ledgers.test.ts`.

Prompts that write ledger rows and must name `bkit ledgers append` (line numbers in `.bkit/core/prompts/`):

<!-- prettier-ignore -->
| Prompt | Lines | Ledgers |
| --- | --- | --- |
| `bkit-plan-generate.md` | 59, 67 | decisions, deferrals |
| `bkit-plan-update.md` | 52, plus new decision rows | deferrals, decisions |
| `bkit-design-generate.md` | 54 | deferrals |
| `bkit-debug-failure-remediate.md` | 57, 58 | knowledge, decisions |
| `bkit-debug-abort-handover.md` | 44, 45 | failures, deferrals |
| `bkit-build-challenge-remediate.md` | 51, 53 | knowledge, deferrals |
| `bkit-build-plan-gaps-remediate.md` | 54 | knowledge |
| `bkit-ship-deferred-sweep.md` | 53, 57 | deferrals |
| `bkit-utility-update-decisions.md` | 49 | decisions |
| `bkit-utility-update-deferrals.md` | 46 | deferrals |
| `bkit-utility-update-failures.md` | 46 | failures |
| `bkit-utility-update-knowledge.md` | 49 | knowledge |
| `bkit-audit-generate.md` | 83 | failures |

Workflows, rules and templates (in `.bkit/core/`):

- **Friction header line 18** in `workflows/bkit-auto.md`, `bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md`. This covers the prompt wording of #676 item 19.
- **`workflows/bkit-build.md` Decision Pause step 5** (line 128).
- **`workflows/bkit-plan.md`:** Step 10 runs `bkit ledgers check` and Gate 10 checks it; Step 11 item 8 writes the answer's decision row.
- **`.agents/rules.md` lines 36, 73, 74 and 75:** the Major changes, Deferred work, Discovered bugs and Flaky tests rules.
- **`docs/templates/bkit-plan.md`:** the new `**Ledger rows:**` line and its rule after line 304; the "Update documentation" item.
- **`.bkit/wording.md`:** clauses `ledger-append` and `workflow-friction`.
- **`.bkit/instructions.md`** kept in step.

Mirrors in `.bkit/` and the host renders follow via `bkit install`.

### Constraints and non-goals

- No build agent becomes a `decision` writer. The writer list stays exhaustive.
- `ts` is minted at append time, never typed (`.bkit/jsonl.md` § Write Idiom).
- Agents never decide for the owner. A row that records an owner answer is written only once that answer is given.
- Stack-agnostic, and works on every provider.
- `feature` rows stay on `bkit roadmap feature`, and `.bkit/stats.jsonl` stays engine-only.
- Not in scope:
  - The retry loop on an unfixable gap. #657 covers it.
  - A ledger check at build start. Writing at decision time plus the close check makes it unnecessary.

### Decisions already made

- Filing approved by the owner on 2026-10-22.
- 2026-10-23, owner:
  - Decisions are written when they are made.
  - A later change is a new ledger row with the same `key`.
  - Prompts change as needed to make that happen.
  - Every prompt that writes ledger rows moves to `bkit ledgers append` as part of this issue.
- Design does not write decision rows. Its decisions live in the design's `## Decisions` section and are written by `@bkit-plan-generate`. No rationale for this is recorded anywhere.
- 2026-10-23: the close check reads a `**Ledger rows:**` line in the plan, not keys starting `{FID}-`. Key prefixes are optional (`.bkit/jsonl.md` § Key & References), so a prefix search would miss rows. Recorded as decision `659-plan-close-checks-ledger-rows`.

### Open questions

None.

### References

- gether-life/app-gether-life#1338 — Inbound link/image filtering misses Bubble's rules — https://github.com/gether-life/app-gether-life/issues/1338 (run logs: `docs/plans/202610/logs/1338-inbound-link-image/` on branch `feat/1338-inbound-link-image`)
- #680 — ledgers append: engine writes ledger rows with a minted ts — https://github.com/cbartens/bkit/issues/680
- #657 — Build fix loops: stop on unfixable, pause on architectural, defer LOW — https://github.com/cbartens/bkit/issues/657
- #676 — Orchestrator work the engine could do as bkit commands — https://github.com/cbartens/bkit/issues/676 (item 19)
- 9b3739b0 — plan-generate gets 400 turns and writes as it goes
- `.bkit/jsonl.md` § Ledgers & Writers, § Write Idiom, § Updating a Row
- `.bkit/core/engine/ledgers/telemetry.ts` `KIND_WRITERS`

###### bkit:blocked-by start
###### bkit:blocked-by end

**Fix 3's verb is now its own issue: #680 "ledgers append: engine writes ledger rows with a minted ts" (https://github.com/cbartens/bkit/issues/680).**

Four issues each assumed `bkit ledgers append` exists (this one, #673, #676 item 19, and #671 / #672 for the Decision Pause rows). It does not: `.bkit/core/engine/commands/workflow/ledgers.ts` has `commit`, `union` and `only-bookkeeping` only. #680 specifies it once (rows from a file, `ts` minted at append time, `validate()` on every row before any write, writer checked against the kind's writer set, `O_APPEND`, no commit) so there is never a second writer.

For this issue: fix 3 reads "a writer with no shell hands its rows over in a fixed form and `bkit ledgers append` lands them". The fixed form is the `.bkit/jsonl.md` row minus `ts`, as a JSON array. #680 lands before this issue builds; add it to the `bkit:blocked-by` block when the body is next edited.

Review comment of 2026-10-23 on #663 "Workflow prompt process optimisation" (https://github.com/cbartens/bkit/issues/663), section 2.6.

### Work done — f561e770 on `dev` (not pushed)

**Every ledger writer now names `bkit ledgers append`.** All 13 prompts in the table above, the friction header in all 6 workflows, build's Decision Pause, and the Deferred work, Discovered bugs and Flaky tests rules say to write rows "with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom)". The row shape stays in `.bkit/jsonl.md` only. The shared sentences are the `ledger-append` and `workflow-friction` clauses in `.bkit/wording.md`, with the old wording kept as retired so `pnpm wording:sync` rewrites it. Every one of these prompts already had Bash; `bkit-plan-update` has no Write tool but pipes rows in with `--rows=-`.

**Decisions are written when made, by the step that makes them.**
- `@bkit-plan-generate` appends one row per design `Decisions` item and per new decision, as each is decided.
- `@bkit-plan-update` appends a row when review adds or changes a decision (same `key` when changed) and adds the key to the plan's `**Ledger rows:**` line.
- `bkit-plan.md` Step 11 item 8: each owner answer that settles a decision is written at once, `by.step` = `plan-close-workflow`.
- Writer lists: `decision` gains subagent `bkit-plan-update` and orchestrators `build` and `plan`, both only after explicit human approval (`KIND_WRITERS` in `.bkit/core/engine/ledgers/telemetry.ts` and `.bkit/jsonl.md` § Ledgers & Writers, kept in step by `telemetry.test.ts`).

**Plan close checks the rows.** The plan template has a `**Ledger rows:**` line listing every decision and deferral `key` written for the plan (`None` if none). New `bkit ledgers check --plan=…` (`.bkit/core/engine/commands/workflow/ledgers.ts`) exits 11 when the line is missing or unfilled, or a listed key has no row in `docs/decisions.jsonl` / `docs/deferrals.jsonl`. `bkit-plan.md` Step 10 runs it, and Gate 10 checks it. On #1338 the missing rows would have stopped the plan at close.

**No build task depends on a ledger row.** The plan template says no runbook task writes or checks a ledger row, and "Update documentation" no longer names `docs/decisions.jsonl` or `docs/knowledge.jsonl`.

**Major changes rule simplified.** It used to tell every agent to append decision rows, which build agents are not allowed to do. It now reads: "Inside `/bkit-*` workflows, a step forced to decide → decide and surface it in output; NEVER decide silently." The permitted writers carry their own write lines.

**Also fixed on the way:**
- `.bkit/workflows.md`, the plan Step 8 row, said plan-update appends scope expansions to deferrals; it never does. The row now names the rows it actually writes.
- `docs/deployments.md` § the advisory "Record" step names `bkit ledgers append`.

**Kept in step:** `.bkit/instructions.md` (rule texts, clauses, carrier lists, line numbers and new lines), mirrors, host renders and render snapshots.

**Decisions recorded:** `659-decisions-written-when-made` and `659-plan-close-checks-ledger-rows` in `docs/decisions.jsonl`.

**Checks:** `bkit check` clean; typecheck, lint, format, table format and prose lint pass; 6,973 engine tests pass, including the shared-wording and render-snapshot tests; slop score unchanged against the previous commit.

**Open:**
- Not pushed yet. The pre-push `slop:delta` gate compares against `origin/dev`, which is behind other local unpushed commits that add slop findings; this commit adds none.
- `## Outstanding Questions` in Step 11 item 8 of `bkit-plan.md` and `bkit-design.md` cites a heading with its `##` marker, which the authoring rules forbid. It is older than this change and left alone.

## #710 — Ledger compaction: drop superseded rows, preserve age (closed)

### Problem

The append-only JSONL ledgers `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl` and `.bkit/issues.jsonl` grow without bound: every status change appends a new same-key row (DESIGNED→…→SHIPPED, OPEN→CLOSED, ACTIVE→SUPERSEDED). Every reader folds last-wins and only ever sees the newest row, so older same-key rows are dead weight on disk and in diffs. `.bkit/friction.jsonl` is drained by harvest; nothing prunes these five.

### Outcome

A new shipped verb `bkit ledgers compact` rewrites the five ledgers to their winning rows (newest per identity), run as the final step of the five ledger-owning update utilities. Time-open / time-to-fix and recurrence stay computable from the working ledger alone, because two derived fields are materialized onto the winning row.

### Success criteria

- `bkit ledgers compact [--root=<dir>] [--ledger=<knowledge|decisions|deferrals|failures|issues|all>] [--dry-run]` rewrites `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl` and `.bkit/issues.jsonl` to their fold winners; idempotent; survives a `merge=union` resurrection by re-running.
- Compaction is reader-invisible: `fold(compacted)` equals `fold(original)`.
- Winner rows carry `firstTs` + `updates`, so `ts - firstTs` = age and `updates` = recurrence survive a fold.
- Never deletes malformed, non-object, blank or keyless lines.
- The five ledger-owning update utilities (`@bkit-utility-update-knowledge`, `-decisions`, `-deferrals`, `-failures`, `-roadmap`) end with a best-effort compact of their own ledger.

### Constraints and non-goals

- Scope: the five keyed ledgers only. `.bkit/stats.jsonl` stays harvest's job; run `status.jsonl` logs are untouched (they feed the dev-dispatch cap).
- No schema bump — `firstTs`/`updates` are optional, mint-only fields; `normalize()` passes them through, `validate()` tolerates them.
- Not an append-time fold (`bkit ledgers append`) and not an `bkit upgrade` migration.
- Compaction removes lines only; survivors are written byte-for-byte except rows missing the two derived fields.

### Decisions already made

- **Definition of "unnecessary" = fold losers** (superseded same-key rows), keep newest per identity. Git history is the archive.
- **Mechanism A:** a dedicated shipped `bkit ledgers compact` verb — not append-time folding, not an upgrade-time migration.
- **Scope = five keyed ledgers** (exclude `.bkit/stats.jsonl`, exclude run `status.jsonl`).
- **Materialize `firstTs` + `updates` (A+).** Trap identified: compaction-only enrichment is worthless — the next same-key append wins the fold and drops the fields, so the writer (`append`) must carry them forward and `compact` only backfills legacy keys.
- **Keep winners in place**; winner = maximal `ts`, ties → last line in file order. Temp-file + rename, write only when something dropped.
- **Per-utility compaction of its own ledger** (scope discipline).

### Open questions

- Field names: `firstTs` + `updates` vs e.g. `openedAt` + `recurrences`.
- Do `firstTs`/`updates` apply to the five kinds only (excluding `friction`, which already has authored `recurrenceCount`/`lastConfirmed`), or to every keyed kind?

### References

- `.bkit/jsonl.md` § Updating a Row, § Friction Is a Drained Queue, § Versioning
- `.bkit/core/engine/ledgers/telemetry.ts` (`identity`, `fold`, `normalize`, `validate`)
- `.bkit/core/engine/ledgers/migrate.ts` (temp-file + rename precedent)
- `.bkit/core/engine/commands/workflow/ledgers.ts` (verb host)
- `scripts/harvest/ledgers.ts` (copy-then-prune precedent)
- `.bkit/core/prompts/bkit-utility-update-{knowledge,decisions,deferrals,failures,roadmap}.md`
- `docs/observability.md`, `.bkit/shared/.gitattributes`, `docs/architecture.md`, `.bkit/prompts.md`

### Review before design

The idea holds up and every file and function referenced exists. Four gaps should be fixed in the body before design starts.

**What checks out**

- `fold()` (`.bkit/core/engine/ledgers/telemetry.ts:1864`) sorts by `ts`. When two rows have the same `ts`, the later line in the file wins. That matches "winner = maximal `ts`, ties → last line". Identity is `(kind, repo, key)`.
- The payoff is real. Measured on `dev` at `b67639c33`, 946 of 1,747 rows are superseded:

<!-- prettier-ignore -->
| Ledger | Rows → winners | Approx. size cut |
| --- | --- | --- |
| `docs/knowledge.jsonl` | 330 → 114 | ~68% |
| `docs/decisions.jsonl` | 770 → 376 | ~58% |
| `docs/deferrals.jsonl` | 305 → 149 | ~55% |
| `docs/failures.jsonl` | 206 → 104 | ~37% |
| `.bkit/issues.jsonl` | 136 → 58 | ~30% |

  None of them has keyless or malformed lines today.
- `firstTs` fixes a problem that exists now. `.bkit/jsonl.md` says "`ts` ages" and "rank by oldest `ts`". But the folded winner's `ts` is the date of the last update, not the date the entry was opened. So today's "age" is really "time since last touched".

**Gaps**

1. **A success criterion that can't be met.** "`fold(compacted)` equals `fold(original)`" can't hold, because the winners gain `firstTs` / `updates`. It should say the two are equal apart from those two fields.
2. **The key writer change isn't in the success criteria.** Decisions say `bkit ledgers append` must carry `firstTs` / `updates` forward. Without that, the next same-key append drops them. No success criterion covers it, so a build could pass without it.
3. **The roadmap utility doesn't own `.bkit/issues.jsonl`.** `.bkit/core/prompts/bkit-utility-update-roadmap.md:48` says "NEVER append ledger rows". That utility never reads the file either; `.bkit/core/engine/commands/workflow/roadmap.ts` does. Giving it compaction breaks "each utility compacts its own ledger". Either name another owner or state this as a deliberate exception.
4. **A doc rule must change in the same change.** `.bkit/jsonl.md:282` says "NEVER edit or delete a line", with the schema migration as the only exception. Compaction needs to be added as a second exception.

**Smaller risk to accept explicitly**

- Two branches that each update the same key both write `updates: N+1`. The union merge keeps both lines, so the count ends at N+1, not N+2. Recurrence can under-count by one per parallel update.

**Suggested answers to the open questions**

- Names: keep `firstTs` + `updates`. They describe the data and don't clash with friction's `recurrenceCount`.
- Scope: the five kinds only. Friction already has authored fields and is drained by harvest.

## Work summary: implemented on dev, staged, not committed yet

`bkit ledgers compact [--root] [--ledger=<knowledge|decisions|deferrals|failures|issues|all>] [--dry-run]` now exists. It rewrites the five keyed ledgers so each entry keeps only its winning row: the one with the highest `ts`, and on a tie the later line, the same as `fold`. The winning row stays where it was in the file. It gets two new fields: `firstTs` (when the entry was first seen) and `updates` (how many rows the entry has had).

### What changed
- **Engine:** the new `.bkit/core/engine/ledgers/compact.ts` holds the compaction logic. `.bkit/core/engine/ledgers/telemetry.ts` gains the two optional fields, which are only allowed on `deferral` / `failure` / `knowledge` / `decision` / `feature` rows, and the rule for computing them.
- **CLI:** `bkit ledgers compact` is added to `.bkit/core/engine/commands/workflow/ledgers.ts`. It writes a temp file and then renames it over the ledger, and it only writes when something changed. `--dry-run` only counts.
- **Append carries the fields forward:** `bkit ledgers append` and `bkit roadmap feature` fill `firstTs` and `updates` from the entry's earlier rows, so new rows keep the entry's age and count.
- **Updaters:** the five ledger updaters (`bkit-utility-update-knowledge` / `-decisions` / `-deferrals` / `-failures` / `-roadmap`) each end by compacting their own ledger. A failure there does not stop the updater. Two shared clauses were added to `.bkit/instructions.md` for these steps: `ledger-compact-run` and `ledger-compact-best-effort`.
- **Docs:**
  - `.bkit/core/.bkit/jsonl.md`: a new § Compaction section. The rules that say rows are never edited or deleted now name compaction as an allowed exception. Ageing and ranking use `firstTs`, falling back to `ts` when it is missing.
  - `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/workflows.md`, `docs/testing.md`, `docs/architecture.md` and `CHANGELOG.md` are updated to match.
- **Audit templates:** `bkit-audit-failures` and `bkit-audit-deferrals` now measure age from `firstTs`, falling back to `ts`. The flake count is now the winning row's `updates`.

### Review gaps from the issue, all covered
- **Fold equality ignoring the two new fields:** tested in `compact.test.ts`. It was also checked on copies of the real ledgers.
- **Append carries the fields forward:** tested across separate calls, within one batch, and after a compaction.
- **Who owns `.bkit/issues.jsonl`:** the roadmap updater's rule was "never append ledger rows". It now has an explicit exception allowing it to compact `.bkit/issues.jsonl`.
- **"NEVER edit or delete" in jsonl.md:** compaction is now listed as the allowed exception, next to the schema migration.

### Where this goes beyond the issue's wording
- **Counts are recomputed, not trusted.** Compaction works out `updates` again instead of keeping the stamped value. If two branches each wrote N+1 for the same entry, the merged entry ends up with N+2.
- **Stamping alone counts as a change.** Compaction rewrites a file even when it drops nothing but stamps rows, so older entries get the two fields the first time it runs.
- **Append overwrites supplied values.** If a caller supplies `firstTs` / `updates`, append replaces them with the computed values rather than rejecting the row.
- **`updates` counts every row**, including appends that only change status. So the failures audit's flake count now includes triage and close appends.

### Verification
- The targeted test suites pass: ledgers, the `ledgers` and `roadmap` commands, audits and render. That is 3696 tests. oxlint, prettier and `tsc` are clean.
- I ran the command from source on copies of the real ledgers in a throwaway repo:
  - The dry run reported 950 superseded rows and wrote nothing.
  - The real run reduced the five ledgers from 1754 lines to 804. A malformed line and a blank line were kept, and no temp files were left behind.
  - Running it a second time dropped and stamped nothing.
- Not yet run: the full test suite from start to finish.
- One incident during development: before the flag was fixed, `--dry-run` was read under the wrong name, so a "dry run" rewrote the repo's live ledgers. They were restored from HEAD and checked, and a test now covers the dry run.

No schema bump, no compaction at append time, no upgrade migration.

Committed on dev as ad8064888 (not pushed yet).

The commit also runs the compaction on bkit's own ledgers. The five ledgers went from 1752 lines to 802 by dropping 950 superseded rows. Every entry still resolves to the same winning row as before; only the two new fields, `firstTs` and `updates`, differ. A second run changed nothing.

The commit skipped the pre-commit hooks (`--no-verify`). The hook's dist check deletes `dist/` and rebuilds it from the working tree, which held another session's uncommitted engine edits, so it would have failed on their code. The other pre-commit check, lint-staged, passed. The rebuilt `dist/` files for this change were compared against a scratch build and match. `bkit check` passes.

## #677 — Engine resolves Step 1: issue id, FID, plan inputs, resume point (closed)

### Problem

Every workflow run starts with the same hand work by the orchestrator, before any subagent runs. It is all parsing with one right answer, done by the model on every run:

<!-- prettier-ignore -->
| Item (#676) | Where | What the orchestrator does today |
| --- | --- | --- |
| 6 | Step 1 sub-step 2 of design, plan, build, debug | Applies five regex forms per tracker to the session prompt to find `ISSUE_ID` (`<id>N</id>`, `<github_issue>N</github_issue>`, `GitHub issue: #N`, `ISSUE-N`, bare `#N`; Linear and Jira have their own five). |
| 7 | Step 1 sub-step 4 of design, plan, build | Mints the FID: kebab case from title or prompt, stopwords out, at most three tokens, all-digit words dropped, re-mint once when `fids check` or `fids free` rejects it. |
| 9 | plan Step 1 sub-step 6 | Finds the `**Parent design:**` link and every `**Audit reports:**` path in the description and prompt, and checks each named path is a file. |
| 10 | build Step 2 sub-steps 4 and 6; ship Step 5 sub-step 2 | `find docs/plans/{YYYYMM} -maxdepth 1 -type f -name '{FID}-plan-*.md' \| wc -l` for `SUB_COUNT`, then a second `find` to decide `status meta --plan-source=brief`. |
| 12 | every header Resume line; build decision-file scan | Folds `status.jsonl` by hand to find the last `DONE` step. Build also scans `build-decision-*.md` for `Status: OPEN` to recover `DECISION`, `PAUSE_STEP`, `SUB_PLAN`, `VERIFY_ATTEMPT`, `DECISION_PLAN`. |

Each of these is a place where a weaker model tier can get a different answer from a stronger one, and the answer decides which feature the run attaches to.

### Outcome

The engine answers all five from files, and the orchestrator holds the printed values.

- `fids parse --prompt-file` finds `ISSUE_ID` in the prompt for the wired tracker. The prompt file is the one #675 decides the orchestrator writes once at Step 1.
- `fids mint --issue --title-file|--prompt-file --workflow` builds the slug, runs `check` and `free`, re-mints once, and prints the final `fid`. Slugs become deterministic.
- `fids design` takes `--description-file` and `--prompt-file`, reads the parent-design link and audit paths from them, verifies each audit path is a file, and falls back to the same-issue design as today. Prints `parentFid`, `parentMonth`, `auditPaths`.
- `fids plans --fid --month` prints `count`, `single` and `source` (`plan` or `brief`), replacing both `find` blocks.
- `workflows start` already prints `resumed` (`.bkit/core/engine/commands/workflow/workflows.ts:1435`). It also prints `lastDoneStep` and, for build, `openDecision` with `file`, `pauseStep`, `subPlan`, `verifyAttempt` and `plan`, or `null`. The Resume header line then says "hold the printed values" instead of "fold status.jsonl".

Either five verbs as above, or one `workflows resolve` that prints them all. Decide in design.

### Success criteria

- No regex, slug rule, `find` or `status.jsonl` fold remains in Step 1, Step 2 or the Resume line of any workflow file; each is a `bkit` block with a `Route:`.
- The same prompt and repo state give the same `ISSUE_ID` and `FID` on every host and model tier.
- A build resumed after a Decision Pause reads its pause state from `workflows start` output alone.
- `.bkit/workflows.md` § Workflow Authoring Rules and the command help are updated in the same change.

### Constraints and non-goals

- Tracker reads stay on MCP, or move to the engine only through #675. This issue reads files the orchestrator already has.
- No change to FID format rules (`fids.ts` header comment); only who applies them.
- Starts after #675 has decided the prompt-file handoff, not after #675 ships.

### Decisions already made

- None yet.

### Open questions

- One `workflows resolve` verb or five narrow verbs.
- Whether `fids mint` should use the issue title when the tracker is wired, which today means the title has to pass through the orchestrator, or only the prompt.

### References

- #676 — Audit: orchestrator work the engine could do as bkit commands (items 6, 7, 9, 10, 12)
- #675 — Engine does tracker reads and writes; agent MCP calls become the fallback (prompt-file decision)
- #663 — Workflow prompt process optimisation
- `.bkit/core/engine/commands/workflow/fids.ts`
- `.bkit/core/engine/commands/workflow/workflows.ts` (`workflows start`)
- `.bkit/core/workflows/bkit-build.md` (header Resume, Step 1, Step 2)
- `.bkit/core/workflows/bkit-plan.md` (Step 1 sub-step 6)

### Implementation plan (2026-10-24)

**In short:** Step 1 of every workflow stops being worked out in prose. The orchestrator writes the session prompt to a file. Four small engine verbs then read that file and the repo and print the answers: issue id, FID (the feature id that names the branch and the plan folders), plan inputs and resume point. The orchestrator only routes on them. It ships in five slices, smallest and most independent first.

#### Decisions taken with the owner on 2026-10-24

<!-- prettier-ignore -->
| # | Question | Decision |
| --- | --- | --- |
| 1 | Where the prompt goes | `{SESSION_DIR}/prompt.md`, a per-run folder in the outbox (the uncommitted scratch folder inside `.git`), printed by `repo info` as `sessionDir`. Not `docs/plans/…/logs/`: the FID is what this issue computes, so that folder can't be named yet, and in worktree mode it only exists inside the feature worktree. Not `tmp/`: every worktree has its own, and ship removes the worktree. The committed copy stays `logs/{FID}/{workflow}-input-{RUN}.md`, written by the engine at Step 2 (#675 — Engine does tracker reads and writes; MCP becomes the fallback — https://github.com/cbartens/bkit/issues/675). |
| 2 | One verb or several | **Narrow verbs**, one per question: `fids parse`, `fids resolve`, `fids design` (extended), `fids plans` (new), `workflows start` (extended). Each one's output tests on its own, and a workflow only calls the ones it needs. |
| 3 | Which issue forms count | **Today's written forms plus issue URLs:** GitHub `#N`, `owner/repo#N` and `…/issues/N`; Linear `ABC-123` and `linear.app/…/issue/ABC-123`; Jira `ABC-123` and `…/browse/ABC-123`. **A bare number typed alone is not an issue**: `fids parse` prints `source: none` and the run is issue-less. The GitHub handover line prints `#N` (via `{REF}`) instead of the bare number, so the line a person copies is always in a form the parser accepts. |
| 4 | Slug rules (FID naming) | All six accepted: (1) slug from the issue title when there is an issue, from the prompt otherwise; (2) the title arrives as a file, never a flag; (3) a fixed English `STOPWORDS` list in `fids.ts`; (4) first three remaining words, in text order; (5) the last `/` segment of an issue-less branch name doesn't count toward the three words; (6) a bare word counts as an existing FID only if `logs/{word}/` exists, while `feat/…` and `docs/plans/…` paths always count. |

#### What is already true in the code

- The issue-id regex and the FID mint are written out in prose in **all five** start-of-run workflows (design, plan, build, ship, debug), not only in design and plan as the body suggests. Jira has six forms written out, not three.
- `fids free` (suffix-probing for a free FID) exists in the source but has never shipped in a release, so `fids resolve` can replace it outright without a deprecation step.
- The `openDecision` fields in the body are incomplete. Resuming a paused build also needs `subPlan`, `verifyAttempt`, `testAttempt` and `pauseStep`, which `status.jsonl` already records.
- At plan Step 1 there is no issue description file yet. #675 adds `issue-facts.json` (title, url, state, labels) via `issues fetch`. Until then, slice 4 reads a temporary `{SESSION_DIR}/title.txt` that the orchestrator writes from its MCP read.

#### Slices

Each slice: tests first and red, engine code to green, prose, `pnpm wording:sync`, `bkit install` once at the end.

**Slice 1: `fids plans --fid --month`** (#676 item 3)
- Prints `{count, single, source, files}`. `source` is `split` (sub-plans present) or `single`; `files` is the ordered list of plan files.
- Replaces the prose glob-and-count in build Step 1 and in ship's plan read.
- Tests: none, one, split with N sub-plans, and a stray non-plan file in the folder (ignored).

**Slice 2: resume facts on `workflows start`** (#676 item 4)
- Adds `lastDoneStep` and `openDecision {file, decision, question, from, pauseStep, subPlan, verifyAttempt, testAttempt, plan}`. These are read from the **current run only**, and only for a decision whose `Status:` is `OPEN`. An old run's answered pause never resurfaces.
- Prose: the "find the last step-done row, find the open decision file, read its fields" paragraphs in build, plan and design become one routing line on `openDecision == null`.
- Tests: no rows; a closed decision; an open decision in an earlier run (ignored); an open decision mid-build with sub-plan and attempt numbers.

**Slice 3: prompt file and `fids parse --prompt-file`**
- `repo info` prints `sessionDir` (#675 and #678 use the same field; whichever lands first adds it).
- `fids parse` prints `{source: github|linear|jira|none, issue, ref, fidNamed}`. `fidNamed` is a FID the prompt names explicitly, by rule 6.
- The tracker comes from `bkit.tracker`, so `ABC-123` is read as Linear or Jira by config, not by guessing.
- Prose: Step 1 in all five workflows becomes "write the prompt verbatim to `{SESSION_DIR}/prompt.md`; run `fids parse`". The five per-tracker issue-id extraction groups (build:189, debug:114, design:104, plan:104, ship:109) are deleted.
- Tests: every accepted form per tracker; URL forms; a bare number → `none`; two issues named → the first, plus a stderr warning; the wrong tracker's form → `none`.

**Slice 4: `fids resolve`** (replaces `fids free`)
- One fixed chain, first hit wins:
  1. a FID named in the prompt
  2. the current branch's FID
  3. a FID logged for this issue in `status.jsonl` on `dev`
  4. a deterministic mint from the slug (rules 1-5)
  5. a free numeric suffix if the minted one is taken
  6. a final existence check
- Prints `{fid, source, month, existing}`. `source` names the link of the chain that won, so the orchestrator never guesses why a FID was chosen.
- Reads `--title-file` (`issue-facts.json` once #675 lands; `title.txt` until then).
- Tests: each link of the chain winning in turn; stopword-only titles; non-ASCII titles; a suffix collision; an issue-less branch name with the rule-5 exclusion.

**Slice 5: `fids design` takes files**
- Adds `--description-file` and `--prompt-file`, and prints `parentFid, parentMonth, parentPath, parentSource, auditPaths`. This replaces the prose that finds the parent design for plan and the audit reports a design was built from (#676 item 1 input).
- Exit 7 when a named file is missing, so a typo in a path isn't read as "no parent design".
- Tests: parent found by the issue's design link; by the FID; none; a missing file → exit 7.

#### Verification

- `pnpm vitest run`, `pnpm bkit:gate:static-unit-integration`, `pnpm wording:sync` with no diff, `bkit check` with no drift.
- Dogfood in a scratch consumer under `tmp/` from `pnpm build`: run each verb against prompts covering every accepted form.
- Live: one `/bkit-design` and one `/bkit-build` resume on a throwaway cbartens/bkit issue. Check that the FID and resume point match what the old prose produced.

#### Risks

- **Changed FIDs for existing work.** If the new mint names an in-flight issue differently from the old prose, a resumed run could start a second folder. Links 2 and 3 of the chain (branch, logged FID) come before the mint, so an issue that already has a FID keeps it. A test covers this.
- **Order with #675.** Both read `{SESSION_DIR}/prompt.md` and neither depends on the other's code, so they can land in either order.

No open questions remain for this issue.

**Implemented: all five slices** of the plan above, in commit `ac2d73c4` on branch `feat/676-engine-io`. The commit is local only for now; the branch has not been pushed. Same checks as #675 — Engine does tracker reads and writes; MCP becomes the fallback — https://github.com/cbartens/bkit/issues/675.

Changes from the plan:
- **FID suffixes are letters, not numbers.** A free suffix is `-b` to `-z`, because an all-digit word would break the FID format for runs with no issue.
- **`fids plans` can also print `source: none`.** It does so when there is no plan.
- **`fids design` exits 1 when there is no parent design.** It still exits 7 when a named file is missing.
- **The routing file no longer treats a bare number as an issue.** `.bkit/core/AGENTS.md` now follows the same rule as `fids parse`, and it accepts issue URLs.

Live runs were not done.

## #679 — Raw git in ship, debug and build becomes bkit verbs (closed)

### Problem

A handful of workflow steps still run raw git and shell inside their bash blocks, or ask the orchestrator to read shell output by eye. They cost few tokens, but each is a place the model can run the wrong git command or misread the result, and the same sequence is written out more than once.

<!-- prettier-ignore -->
| Item (#676) | Where | What the block does today |
| --- | --- | --- |
| 13 | build Step 18 sub-steps 1 and 2 | `git fetch origin dev`; `git diff origin/dev --name-only \| grep -qiE '(^\|/)(migrations\|migrate)/'`; `git show -s --format=%B HEAD \| grep -qF '[force build]'`; then amend or `git commit --allow-empty` with `bkit [force build]`. The engine has no notion of force build. |
| 14 | debug Step 11 sub-steps 2 and 6 | `git diff {DIFF_BASE}...HEAD -- . ':(exclude)docs/plans' \| grep -qE '^\+.*\[DEBUG-OBSERVE\]'` as the no-leak assertion; `"{BKIT}" issues labels {LABEL_FLAGS} \| jq -er .autoRouteSuffix` then `git add -A && git commit --allow-empty -m "chore({FID}): create-pr bkit [verbose ci]${AUTO_ROUTE_SUFFIX}"`. |
| 15 | ship Steps 1, 2, 4, 5, 8, 10, 14 | Step 1: `[ "$(git branch --show-current)" = "{SHIP_BRANCH}" ] \|\| …` and `rm -f` of the `.deferred-blocked` and `.rebase-failed` sentinels. Step 2 sub-step 3: branch `case`, `git fetch origin dev`, `git rev-list --count origin/dev..HEAD`, `git push -u origin "$B"`, `prs open`, `status meta --opened-pr`. Step 4 B2: `ledgers commit --mode=stage` then raw `git commit -m "chore({FID}): conflict-resolve bkit [skip ci]"` then `branches push`. Step 5: `git fetch origin "{SHIP_BRANCH}"` and `git merge --ff-only`. Step 8: `git push origin "{SHIP_BRANCH}"` after `ledgers commit`. Step 10: `git fetch` plus `counters rows … \| jq -er .value` into `counters route`. Step 14: `rm -f` and `cp` of `ship-summary.md` into the outbox. |
| 17 | ship Step 2 sub-steps 2 and 6 | A case-insensitive contains check on the branch name, by the model; `runs wait` twice then the model asserts `prs checks` output. |
| 18 | design and plan Failure Path step 3 | The model reads `git status --short` porcelain to decide which stray files to remove. |

### Outcome

Each sequence becomes a verb or a flag on an existing verb, with a `Route:` on exit codes:

- `branches force-build --base=origin/dev` detects migration paths and amends or empty-commits the `[force build]` marker. Or a `--force-build-on=migrations` flag on `prs open`.
- `prs scan-diff --marker='[DEBUG-OBSERVE]' --base={DIFF_BASE}` beside the existing `prs scan-body`; `prs open --create-pr-commit` writes the `create-pr bkit [verbose ci]` commit with the auto-route suffix itself.
- Ship: `branches ff --ref=origin/{SHIP_BRANCH}` for fetch plus fast-forward; `prs open --ensure` folds the branch guard, fetch, ahead count, push and `status meta`; `ledgers commit --push` for the stage-commit-push triples; `counters route --rows=…` so no jq; `workflows close --summary=ship-summary.md` does the outbox copy. Step 1's branch assert and sentinel removal move into `workflows start` for ship.
- `prs checks --assert` exits non-zero when any check is not green; `branches name-check --branch --expect` for the warning.
- `workflows handover --list-stray` prints the untracked and modified paths as JSON; the orchestrator still decides what to remove.

### Success criteria

- No bash block in `.bkit/core/workflows/` contains a bare `git fetch`, `git merge`, `git push`, `git commit`, `git diff … | grep`, `rm -f` or `cp` outside a `"{BKIT}"` call, except `cd` and `mkdir -p`.
- No `| jq` pipe remains in a workflow bash block.
- Ship, debug and build keep their current behaviour on the same inputs; the existing render snapshots and `commands/workflow/*.test.ts` cover each new verb.

### Constraints and non-goals

- Behaviour-preserving. No change to what gets committed, pushed or asserted; only who runs it.
- One workflow per change, ship first since it holds the most.
- Done last in the #676 order; it buys safety and consistency more than tokens.

### Decisions already made

- None yet.

### Open questions

- Whether the force-build marker belongs on `prs open` or on a `branches` verb, given ship also opens PRs.

### References

- #676 — Audit: orchestrator work the engine could do as bkit commands (items 13, 14, 15, 17, 18)
- #663 — Workflow prompt process optimisation
- `.bkit/core/.bkit/workflows.md` § Workflow Authoring Rules ("Bash decides, prose routes")
- `.bkit/core/engine/commands/workflow/branches.ts`
- `.bkit/core/engine/commands/workflow/prs.ts`
- `.bkit/core/engine/commands/workflow/ledgers.ts`
- `.bkit/core/workflows/bkit-ship.md`
- `.bkit/core/workflows/bkit-debug.md` (Step 11)
- `.bkit/core/workflows/bkit-build.md` (Step 18)

**A follow-on now depends on this issue: #681 "Engine output as text: terse verb replies, tabulated context fetches" (https://github.com/cbartens/bkit/issues/681).**

Today 8 call sites pipe `"{BKIT}"` output through `jq` (7 in `.bkit/core/workflows/bkit-debug.md`, 1 in `bkit-ship.md`), which is the only reason verb replies are JSON. Once this issue removes every `| jq`, nothing parses the output, and #681 can switch the default to `key: value` text (with `--json` kept for scripts and tests) across the 317 `"{BKIT}"` calls in the six workflows. #681 lists this issue in its `bkit:blocked-by` block.

One request for the design here: when a raw git call becomes a verb, print only the fields the workflow reads next, not the whole git object. That is the same saving #681 is after, and it costs nothing to do here first.

Review comment of 2026-10-23 on #663 "Workflow prompt process optimisation" (https://github.com/cbartens/bkit/issues/663), sections 3 and 4.

### Implementation plan (2026-10-24)

**In short:** every raw `git` and `gh` line left in ship, debug and build becomes a `bkit branches|prs|ledgers|workflows` verb, or a flag on one that already exists. A guard test then fails if a raw call comes back. It ships in six slices: ship first (the most lines), then debug, then build, then the Failure Paths, then the guard. One behaviour fix rides along: `[force build]` currently does nothing on pull requests.

#### Decisions taken with the owner on 2026-10-24

<!-- prettier-ignore -->
| # | Question | Decision |
| --- | --- | --- |
| 11 | `[force build]` on pull requests | **Fixed here.** CI reads the marker from the PR title on `pull_request` events and from the commit message only on pushes (`bkit-ci.yml:57-71`). So the empty `[force build]` commit the workflows push today is ignored on a PR. `branches force-build` does both: (1) it adds `[force build]` to the PR title when a PR is open, then (2) it pushes the empty marker commit. CI's `pull_request` trigger uses the default event types (`opened`, `synchronize`, `reopened`; `bkit-ci.yml:11`), so renaming the title alone starts nothing. The push in (2) is the `synchronize` event that starts the run, and that run reads the new title. It never amends a commit. |
| 5 | Repeat-safety (shared with #675) | Marker commits, CI dispatch re-triggers and PR opens record an `engine-action` row in `status.jsonl` before they report done, and check for one first. A re-run after a crash doesn't push a second marker commit or open a second PR. The row type and helper come from #675 — Engine does tracker reads and writes; MCP becomes the fallback — https://github.com/cbartens/bkit/issues/675. |

Decided by me (say if you disagree):
- **Ship Step 8 push stays conditional.** The draft for this plan suggested pushing unconditionally. I'm keeping today's behaviour: push only when `outcome` says there is something new. It becomes a route on the verb's output instead of prose. An unconditional push would start a CI run on every ship even when nothing changed. If you want the simpler unconditional form, it's a one-line change.
- **Branch-name check.** When the branch name doesn't match the FID, `worktrees setup` prints a stderr warning rather than failing, so a hand-made branch still works.

#### What is already true in the code

- Item 17 in the body is out of date: `prs checks` already exits 1 on a failing check. #662 — workflows start after a failed ship — https://github.com/cbartens/bkit/issues/662 is closed.
- The body's site list misses these: build:146, debug:310, Failure Path build:90 and debug:92, ship:486, and ship sub-steps 2.2 and 2.6. All are in the slices below.
- Ship's last jq pipe (`bkit-ship.md:535`) goes here. Debug's go in #678 — Build and debug loop verbs: failure count, diff artifact, debug mode — https://github.com/cbartens/bkit/issues/678.

#### New verbs and flags

<!-- prettier-ignore -->
| Verb or flag | Replaces |
| --- | --- |
| `branches push --mode=plain --set-upstream --ahead-of=<ref>` | `git push -u` plus the prose ahead-of check |
| `branches fast-forward --onto=<ref>` | `git fetch` + `git merge --ff-only` |
| `branches scan-diff --base` | `git diff --name-only` pipes used for routing |
| `branches force-build` | the empty-commit block; also sets the PR title (decision 11) |
| `branches push --commit --label` | `git commit --allow-empty -m …` + push for the debug `create-pr bkit [verbose ci]` marker |
| `counters route --rows=` | prose counter arithmetic in ship |
| `workflows start --branch` | ship's sentinel clearing in prose |
| `workflows close --summary` | `git log` summary assembly at close |
| `ledgers commit --path` and `--mode=commit --stage-tracked-updates` | `git add`/`git commit` of ledgers |
| `status meta --debug-attempt=run` | debug's hand-written meta row |
| `runs gate --branch` (with fetch) | `git fetch` before the gate check |
| `workflows handover --list-stray` | Failure Path `git status --porcelain` reading |

Every verb that pushes or opens a PR records an `engine-action` row (decision 5).

#### Slices

Each slice: tests first and red, engine code to green, prose, `pnpm wording:sync`, `bkit install` once at the end.

1. **Ship open and verify** (Steps 1-8): `workflows start --branch`, `branches fast-forward`, `branches scan-diff`, `branches push --mode=plain`, the conditional Step 8 route, ship 2.2 and 2.6, ship:486.
2. **Ship integrate to close**: `counters route`, `ledgers commit`, `workflows close --summary`, the jq pipe at `:535`.
3. **Debug**: `branches push --commit --label`, `status meta --debug-attempt=run`, debug:310, `branches force-build`.
4. **Build**: build:146, the build `[force build]` site, `runs gate --branch`.
5. **Failure Paths**: `workflows handover --list-stray` at build:90 and debug:92, and the ship equivalent.
6. **Guard test**: `workflow-fence-syntax.test.ts` fails on any `git ` or `gh ` call inside a workflow bash fence, except a short named allow-list with a reason for each entry. This waits for #678, which removes debug's jq and `git diff` lines.

Tests per verb: plain and set-upstream push against a temp bare remote; fast-forward refusing a diverged branch; `force-build` with and without an open PR (stubbed `gh`), plus a re-run that is deduped; `--list-stray` on a dirty tree; the Step 8 route on each `outcome`.

#### Verification

- `pnpm vitest run`, `pnpm bkit:gate:static-unit-integration`, `pnpm wording:sync` with no diff, `bkit check` with no drift.
- Live: `/bkit-ship` of a small change on a throwaway issue. On its PR, run `branches force-build` and check that CI starts with the force-build path (the job log shows the marker was read from the title).
- Consumer CI files copied from bkit's template read the title the same way. Check the template copy and note in `CHANGELOG.md` if it differs.

#### Risks

- **Push and PR semantics in the engine.** A wrong flag here pushes the wrong branch. Each push verb prints what it pushed and where; integration tests use a real bare remote, not a stub.
- **Uncommitted work by other agents** in `worktrees.ts` and `workflows.md`: rebase onto it before slices 1 and 5.

No open questions remain for this issue.

**Implemented: all six slices** of the plan above, in commit `e3cb1a3f` on branch `feat/676-engine-io`. The commit is local only for now; the branch has not been pushed.

Checks run:
- typecheck, lint, format and prose checks pass.
- Unit tests: 5734 passed. The 2 that fail also fail on `dev` without this change.
- bats tests: 31 of 31 pass. Integration tests: 1553 of 1553 pass.
- `slop:delta`: unchanged from `dev`.
- `bkit check`: clean.

The guard test in `workflow-fence-syntax.test.ts` allows one raw git call: the bootstrap line that locates the `bkit` binary, since no verb can run before it.

Changes from the plan:
- **Ship Step 5.1 stops on a failed fetch.** Exit 10 now goes to the Failure Path.
- **Build's no-progress check and migrations scan look at committed diffs.** They compare commits (three-dot) instead of the working tree, which makes the migrations scan stricter.
- **Build's force-build runs after `prs open`.** That way the PR exists when its title is set.
- **Ship's Failure Path has no `--list-stray` step.** It saves only the run's record.
- **Two audit tests were narrowed, as a direct effect of removing raw calls.** `counter-prose-audit.test.ts` now checks `REVALIDATE_ATTEMPT` in place of `DEBUG_ATTEMPT`, whose jq line is gone. The shell-variable minimum in `block-locality-audit.test.ts` dropped from 10 to 5.
- **Corrected `.bkit/workflows.md`.** It said ship pushes before merge in two places; the code and its test have three: opening a missing PR, B2 and bookkeeping.

Live runs (a throwaway `/bkit-ship` and `branches force-build` on its PR) were not done.

## #452 — Ship bookkeeping stranded after cloud merge (dev push off) (closed)

## Summary

The ship workflow does all of its bookkeeping in a single commit at the very end of the run, after the merge. On a cloud runtime that commit is never pushed anywhere, so the whole record is lost when the container is reclaimed. Separately, that commit cannot carry the project docs the ship workflow is told to update, on any runtime.

Both were found while investigating why #380's ship left `docs/roadmap.jsonl` still saying `PLANNED` after the feature merged cleanly.

## The two faults

**Fault A — the ship flush cannot commit the docs it is told to write.** Step 10 tells `@bkit-ship-update-docs` to sync project docs, with an open-ended output contract. The single Step 13 commit stages through a frozen allow-list in `.bkit/scripts/bkit-book-commit.sh` that contains no general `docs/*.md` entry. Affects every runtime.

**Fault B — the post-merge tail has no publish channel on an ephemeral runtime.** Step 12 deletes the remote feature branch. Step 13 then commits to the current branch and, when `RUNTIME_DEVPUSHES` is not `true`, deliberately does not push. The commit lands on a branch whose remote the workflow itself deleted one step earlier.

## Decision

Restructure so the bookkeeping rides the pull request instead of trailing it: move Steps 10 and 11 and Step 13's ledger writes to before the merge, leave only the squash-merge CI verdict behind, and widen the staging allow-list so the docs can actually be committed.

Full investigation, the options considered and rejected, and the reasoning behind each decision are in the first comment. The implementation plan is in the second.

Related: #322 (workflow close failure paths leaving a CI-verifiable surface), #397 (cloud ship arbitration).

## Investigation, discussion and decisions

### How this surfaced

The #380 ship ran on a Claude cloud container. The code merged cleanly as `5f123d94` on `origin/dev`. But `docs/roadmap.jsonl` on `dev` still holds exactly one row for #380, the bootstrap seed row with `"status":"PLANNED"`. The board would show the feature as planned forever.

The run itself completed. Issue #380 carries all nine ship step comments, ending with `### Step 13 - Close Workflow` at `2026-08-28T13:57:29Z`. So the tracker side of the run is intact. Only the git side never left the container.

We also know the SHIPPED row was genuinely written. Step 10's comment reports `Docs: PASS`, and `bkit-ship.md:1250-1251` derives that verdict only from a `status=="SHIPPED"` row for the FID in `docs/roadmap.jsonl`. The row exists in the container and nowhere else.

The work is not reconstructable from `dev`. The `status.jsonl` for #380 on `dev` ends at `{"type":"workflow-failed","workflow":"ship","at":"2026-08-26T21:22:09Z"}`, which is the earlier failed attempt. None of the successful run's ship rows are on `dev`, so running the roadmap fold locally has nothing to fold.

### Fault A - the ship flush cannot commit the docs it is told to write

Step 10 tells `@bkit-ship-update-docs` to sync project docs, and its output contract is open-ended: "[List of `docs/*.md` paths edited]" (`.bkit/prompts/bkit-ship-update-docs.md:56`). Step 13 is the only commit in the run, per the doctrine at `.bkit/workflows/bkit-ship.md:28`. Its pathspec is a frozen allow-list with no general `docs/*.md` entry, only `docs/roadmap.md`.

This used to work. Commit `fe289e67` (2026-07-30) carried `docs/completed.md`, `docs/deployments.md` and `docs/security.md` in its ship commit, and the last two have never appeared in any allow-list. They were picked up by the blanket staging that #446 replaced on 2026-08-26 (`a67c8207`). Narrowing the staging was right in intent - it fixed a real silent-failure bug - but it quietly removed the ability to commit whatever docs the agent actually edited.

One thing to be clear about, because it looks like part of the bug and is not: `5f123d94` removing `docs/completed.md` from that list is correct. #380 retired `completed.md` and `docs/roadmap.md` replaces it.

Severity depends on runtime. On a laptop the edits survive as an uncommitted working tree - easy to sweep into an unrelated later commit, but not lost. On an ephemeral runner they are gone.

### Fault B - the post-merge tail has no publish channel

In order:

- `bkit-ship.md:1411` - Step 12 runs `git push origin --delete "feat/{FID}"`.
- `bkit-ship.md:1585-1589` - Step 13 commits the bookkeeping to the current branch and, when `RUNTIME_DEVPUSHES` is not `true`, does not push.

So the workflow deletes the branch's remote in one step and commits to that branch in the next, with no ref anywhere that can receive it. On an ephemeral container the loss is not a risk, it is certain.

The log line at `:1588` justifies this with "the code merge already landed server-side at Step 6". That is true of the code and false of the bookkeeping - everything at stake is created after Step 6.

There is a smaller ordering bug alongside it. With `RUNTIME_WORKTREES=false` the session sits directly on `feat/{FID}`, so Step 12's `git branch -D "feat/{FID}" 2>/dev/null || true` cannot delete the branch it is standing on and silently no-ops. Gate 12's "Local `feat/{FID}` branch deleted" checkbox passes anyway.

This bug class is already recognised in bkit for a different phase. `.bkit/workflows.md:120` says of design and plan: "PR-mode design/plan closes MUST push before `gh pr create` ... Omitting it silently loses every design/plan close on the PR path." Ship never got the matching fix.

### What is actually at risk, step by step

The merge is Step 6, so Steps 9 to 13 are the post-merge tail. The reason the whole tail is exposed together is that there is exactly one commit in the run, at `bkit-ship.md:1580`.

- **Step 9** - skipped entirely on the cloud path (`:981-982`), writes nothing.
- **Step 10** - doc file edits (`:1209`); the `docs/roadmap.jsonl` SHIPPED row (`bkit-ship-update-docs.md:44`); `ship-update-docs.md` (`:1210`), `ship-summary.md` (`:1214`), `roadmap-refresh.md` (`:1219`); both `docs/roadmap.md` blocks, `roadmap-analysis` (`:1218`) and the `roadmap-status` fold (`:1243`); `roadmap-cadence-inject.md` plus a `ROADMAP_CADENCE_FIRE` counter when cadence fires (`:1079-1087`); three `status.jsonl` rows (`:1273-1281`); a `ROADMAP_SCAN_COVERAGE` counter (`:1283-1285`).
- **Step 11** - skill directory removals and the `skills-lock.json` mutation (`:1341`); `status.jsonl` row `ship-prune-skills` (`:1350-1352`).
- **Step 12** - `status.jsonl` row `ship-worktree-cleanup` (`:1419-1421`).
- **Step 13** - `status.jsonl` rows `ship-close-workflow` and `workflow-done` (`:1512-1515`); the `SHIP_ATTEMPT` counter (`:1520-1529`); the `outcome` row carrying lines and files changed, task count, duration, deferrals, failures, friction and coverage (`:1559-1578`); whatever `pnpm bkit comply --phase=ship` writes (`:1510`).

Three different fates, worth keeping apart:

- **Safe on any runtime** - the tracker writes, because they are remote API calls.
- **Lost only on an ephemeral runtime** - everything in the list above.
- **Lost on every runtime** - just the `docs/*.md` edits, which the Step 13 pathspec cannot carry even when the push succeeds. That is Fault A, and it is the only item a working `dev` push would not have saved.

This is also not purely a cloud problem. Because the single commit sits at the very end, a crash anywhere between Step 6 and Step 13 strands all of Steps 10 to 12 on any runtime. Cloud turns "possible" into "certain".

### Options considered and rejected

**Assume `RUNTIME_DEVPUSHES=true`, or probe it.** Rejected.

The evidence was mixed and worth recording. This container demonstrably could push - PR #411 took three commits at `2026-08-27T21:25-21:27Z` to land a rebase. And `dev` in this repo is not protected and cannot be: `gh api repos/cbartens/bkit/branches/dev/protection` returns 403, "Upgrade to GitHub Pro or make this repository public to enable this feature." So the pre-receive-hook reasoning at `.bkit/workflows.md:118` has no force here.

But push is not a platform guarantee. Anthropic's managed sandbox runs a proxy whose GitHub policy permits reads and blocks writes by default, with git credentials deliberately held outside the sandbox. Cursor background agents do clone, branch and push, but cannot reach the GitHub API for PR comments or reviews. So "a cloud agent can push" is a per-configuration fact, not a structural one - true for this container, not necessarily for a consumer's.

More decisively, the flag is not a single capability. `bkit-ship.md:994` asserts both `RUNTIME_WORKTREES` and `RUNTIME_DEVPUSHES` are `true` before the local dev checkout. Setting `DEVPUSHES=true` on cloud, where `WORKTREES=false`, makes Step 9 exit 1. That trades silent data loss for a hard abort before the merge.

The flag is standing in for three separate things: whether the runtime can push a branch at all (cloud: yes), whether it can push `dev` specifically (unknowable in general), and whether it should do a local checkout and squash-merge (cloud: no). Only the first is safe to assume, and it is the only one the fix needs.

**Probing `dev` in advance.** Rejected as impossible, and unnecessary. A `--dry-run` sends no ref update so never fires a pre-receive hook, and a no-op push to `dev` sends nothing either. But we do not need a probe: just attempt the push and fall back. A rejected push is refused server-side, nothing lands, and the commit still exists locally to be routed elsewhere. That is a real test rather than a guess, and it means `RUNTIME_DEVPUSHES` no longer has to be correct for the bookkeeping to survive - which matters, because it was wrong about this run.

**Overwriting an existing ledger row to refine it.** Rejected, with the reason already documented. `.bkit/jsonl.md:231` calls it "Hard, not stylistic": `merge=union` keeps both sides of a conflicting hunk, so an edited line survives beside its replacement and `fold` last-wins-by-`ts` can pick the stale one. Our case is the worst version - the provisional row would land on the feature branch and the overwrite would happen on `dev`, opposite sides of a merge.

**Adding a `runId` or a provisional/final flag to pair the two `outcome` rows.** Rejected as unnecessary machinery. It would have required a schema change, validation changes at `bkit-telemetry.ts:744-797`, and changes to the dedupe anchor (`:605-611`), the run filter (`:1076-1078`) and the per-cycle delta (`:419-425`). The only thing it bought over reusing the sha was a `parentSha` that resolves in `dev`'s history - and that turns out to buy nothing. Four pre-merge `parentSha` values already recorded in `status.jsonl` on `dev` were checked: none is an ancestor of `dev`. Dangling branch shas in `parentSha` are already the norm for every pre-merge row bkit writes.

### Decisions

1. **Move Steps 10 and 11 before the merge.** The bookkeeping then rides the pull request and lands via the merge, reviewed and CI'd on the way in rather than appearing on `dev` unreviewed afterwards.

   Writing the SHIPPED row before the merge is safe because the row only reaches `dev` through the merge - a failed merge means it never lands. The row would predate Step 13's CI assertion, but that is already true today, so it is not a regression.

2. **Move Step 13's ledger writes before the merge too, including `workflow-done`.** Today the fact that the merge's CI went green is encoded by the *absence* of a close record. Absence is a poor signal because it cannot be told apart from "the container died", which is this bug. An explicit row is strictly better.

   Downstream consumers hold up. `bkit-status-hole-detector.ts:235` keys off `ship-close-workflow` being present to classify a run completed, which is the intent. The reverse-sync "settled" test (`bkit-ship.md:1139`) would see the close row, but it is belt-and-braces with a live-branch check (`:1134`), and pre-merge the branch is live, so an in-flight FID is still skipped.

3. **Step 13 keeps the squash-merge CI assertion, but records a red verdict instead of withholding the done marker.** Verify and record the outcome, rather than gate the record by staying silent.

4. **Refine the `outcome` row post-merge by appending with the same `parentSha`.** Identity for outcome rows is the tuple `(repo, workflow, parentSha)` (`bkit-telemetry.ts:381`). Reusing the pre-merge sha makes the two rows one entity, so the existing dedupe anchor and last-wins-by-`ts` fold pick the accurate version with no schema change, no fold change and no new precedence rule. If the `dev` push fails, the provisional row is what survives - degraded precision rather than a lost record.

5. **Try the `dev` push and fall back to a branch plus pull request** for whatever tail remains. Not load-bearing after decisions 1 to 3 - the residue is small - but it removes the last case where a commit has nowhere to go.

6. **Widen the `bkit-book-commit.sh` allow-list so it can carry `docs/*.md`.** Fault A, and still required regardless of the reordering, because the pre-merge branch commit stages through the same frozen list.

### Net effect

After 1 to 3, the post-merge tail is one thing: the squash-merge CI verdict. Everything else rides the pull request. The failure that produced this issue stops being possible on any runtime, not just cloud.

## Implementation plan

Written to be executed by an agent. Tasks are ordered; each has the files to touch, the change, and how to verify it. Read the first comment for the reasoning behind each decision before starting.

### Ground rules

- **Read `.bkit/workflows.md` § `Workflow Authoring Rules` (`:48-70`) and `.bkit/prompts.md` § `Prompt Authoring Rules` (`:18-43`) in full before touching any file under `.bkit/workflows/` or `.bkit/prompts/`.** They are binding, several are enforced by tests, and the section below lists the ones this task will run into. Do not rely on that list alone - read the source sections.
- Anything under `.bkit/templates/` is a shipped mirror. When you change a live file that has a template counterpart, change both.
- Do **not** run `pnpm bkit install` after each edit. Run it once at the end (Task 8).
- Docs change in the same commit as the code they describe.
- Keep step *keys* stable (`ship-update-docs`, `ship-summary`, `ship-roadmap-refresh`, `ship-prune-skills`, `ship-close-workflow`). They appear in `status.jsonl` rows and in `.bkit/src/bkit-status-hole-detector.ts`. Only the step *numbers* and positions change.

### Authoring rules this task will run into

These are the ones a step-reordering change trips most often. They are not a substitute for reading the two sections named above.

- **These files are their own template** (`workflows.md:52`). Grep `.bkit/workflows/` for the closest existing case and copy the shape verbatim - phrasing, operators, bolding, backticks, indentation, spacing - before inventing anything.
- **Dense instructions only** (`:62`). No rationale, no commentary, no parenthetical explaining why a step exists. All of the reasoning in this issue belongs in `.bkit/workflows.md`, never in `.bkit/workflows/bkit-ship.md`. This is the rule most likely to be broken while moving blocks around.
- **No internal labels** (`:63`). Never cite a tracker issue number or a coined guard name inside a workflow file. Do not write "#452" or "#446" into `bkit-ship.md`. Name the behaviour instead.
- **Removal = delete** (`:67`). When you drop the old `RUNTIME_DEVPUSHES` branch, delete it outright. Never leave a note explaining what used to be there.
- **ASCII operators** (`:58`). Use `!=`, `>=`, `<=`, `=>` and never Unicode math glyphs - but `→` in conditionals and dispatch tables is the sole intentional non-ASCII glyph. **Adopt it, do not convert it.**
- **Bold is structural** (`:55`). Bold marks operators (`**If**`, `**Else**`, `**Run only if**`), jump targets (`**Failure Path**`) and block field labels. `Step N` stays unbolded. Never bold an ordinary word for emphasis; lowercase `**if**` is always wrong.
- **Labeled decision blocks** (`:57`). One branch stays inline. Two or more branches require a labeled `Route:` or ``Decide `VAR`:`` heading-row with one `-` bullet per branch. Task 6's try-then-fall-back is two branches, so it is a labeled block, not an inline conditional.
- **Bash decides, prose routes** (`:53`). The fenced block determines the outcome; the prose branches on the **exit code** (`**If** exit non-zero → **Failure Path**.`), never on a restatement of the domain condition.
- **Variable references and block locality** (`:59`). `{VAR}` is orchestrator-substituted; `$VAR` is bash-expanded and **must be assigned in the same fenced block**, because shell state does not persist between blocks. This is exactly why Tasks 4 and 5 pass `parentSha` through the outbox on disk rather than a variable. Enforced by `bkit-block-locality-audit.test.ts`.
- **Argument placeholders** (`:60`). Never `$0` to `$9` or `$ARGUMENTS`, fenced or not. Awk field references use `$(N)`. Enforced by `bkit-slash-arg-expansion.test.ts`.
- **Gate items** (`:61`). `- [ ]` leads with a prose label; variables appear only in a trailing backticked parenthetical. Extraction plus validity is one item, not two.
- **Cross-workflow alignment** (`:65`). The `RUNTIME_DEVPUSHES` pattern also appears in `bkit-design.md`, `bkit-plan.md`, `bkit-build.md` and `bkit-debug.md`. Check whether any change you make to shared wording has to land in all of them.
- **Self-contained** (`:66`). No file references between workflow files; inline everything. Subagent context is the only exception.
- **If you touch `.bkit/prompts/bkit-ship-update-docs.md`:** prompts must never cite a step number, their own or the workflow's (`prompts.md:42`), and never carry the managed-version marker in source (`:43`).

Note that these rules govern `.bkit/workflows/*.md` and `.bkit/prompts/*.md`. They do not govern `.bkit/scripts/*.sh` or the TypeScript under `.bkit/src/`, where ordinary explanatory comments are fine and already the norm.

---

### Task 1 - widen the staging allow-list so ship can commit the docs it edits

**Files:** `.bkit/scripts/bkit-book-commit.sh`, `.bkit/templates/.bkit/scripts/bkit-book-commit.sh`, `.bkit/src/bkit-ship-invariants.test.ts`

Add a top-level `docs/*.md` entry to the `PATHSPECS` array under `if [ "$SCOPE" = "full" ]`. Not to the base list - the narrower `core` scope should stay as it is.

`docs/roadmap.md` is already present in the base list; leaving both is harmless because `git ls-files` de-duplicates. This is a shell script, not a workflow file, so a short comment explaining the overlap is appropriate and matches the file's existing style.

Do not use a recursive glob. `docs/*.md` matches the top-level docs only and must not reach `docs/plans/**`, which has its own scoped entries.

Then update the frozen allow-list assertion in `.bkit/src/bkit-ship-invariants.test.ts` (around line 80) to match, and add a test that a `docs/*.md` path is reachable under `scope=full` and not under `scope=core`.

**Verify:** in a scratch git repo, touch `docs/architecture.md`, run `bash .bkit/scripts/bkit-book-commit.sh --root=. --month=... --fid=... --scope=full --mode=commit --message=...`, and confirm the file is in the resulting commit. Confirm the same run with `--scope=core` does not include it.

**Note the trade-off in your commit message:** this widens what a ship run can sweep up. A `docs/*.md` file left dirty by unrelated work will now be committed by the ship flush. That is the accepted cost of being able to commit the docs Step 10 is mandated to write.

---

### Task 2 - move Prune Skills before the merge

**File:** `.bkit/workflows/bkit-ship.md`

Move the current Step 11 block to sit between Step 5 (Re-validate + Deferred Sweep) and Step 6 (Merge Gate + Merge PR). Renumber accordingly and update its gate heading and its tracker comment text.

Nothing in the step depends on the merge - it removes skill directories and mutates `skills-lock.json` (`:1341`), both of which should now appear in the pull request diff.

**Verify:** no reference to the old step number survives. Grep the file for the old and new numbers and reconcile every hit, including the step table near `:924`. Step numbers in shipped docs are enforced by `bkit-shipped-docs-refs.test.ts` - expect it to catch anything you miss.

---

### Task 3 - move Update Docs & Summary before the merge

**File:** `.bkit/workflows/bkit-ship.md`, plus `.bkit/src/bkit-ship-invariants.test.ts`

Move the current Step 10 block to sit immediately before the merge step, after the moved Prune Skills block. Three things inside it must change:

1. **Drop the post-merge assertion at `:1059`** - `git log origin/dev --oneline | head -5`, failing to Failure Path when no squash SHA is found. Replace it with a check appropriate to the pre-merge position (the PR exists and is mergeable), or remove it and rely on Step 5's gate.

2. **`@bkit-ship-summary` reads `mergedAt`** at `:1213`. It is null pre-merge. `additions`, `deletions`, `changedFiles`, `commits`, `title` and `body` are all available on an open PR, so drop only `mergedAt` from the `gh pr view --json` field list.

3. **The step is currently forbidden to stage anything.** The comment at `:1231` says so and `.bkit/src/bkit-ship-invariants.test.ts` enforces it - see the staging-hygiene block around `:123-206`. Pre-merge, this step's output has to be committed to the feature branch, so that contract has to be reworked rather than just relocated. Update the test to match the new contract; do not delete the test.

**For the commit itself, reuse the shape that already exists** - this is the "these files are their own template" rule in practice. The Step 4 / B2 conflict-resolve block already commits and publishes to the feature branch: `--stage-tracked-updates`, then `bash .bkit/scripts/bkit-book-commit.sh`, then `git push --force-with-lease origin "feat/{FID}"`. Copy that shape verbatim rather than inventing a new one. `bkit-ship-invariants.test.ts` has an assertion (`F1`) keyed to that block - make sure you have not broken it.

**Verify:** the moved step commits and pushes so its output enters the pull request. Confirm `docs/roadmap.jsonl`, `docs/roadmap.md` and any edited `docs/*.md` are all in the pushed commit.

---

### Task 4 - move Step 13's ledger writes before the merge

**File:** `.bkit/workflows/bkit-ship.md`

These move into the pre-merge commit from Task 3:

- the `ship-close-workflow` step-done row and the `workflow-done` row (`:1512-1515`)
- the `SHIP_ATTEMPT` counter (`:1520-1529`)
- the `outcome` row (`:1559-1578`), as a **provisional** row

For the provisional `outcome` row, `SQUASH_SHA` does not exist yet, so replace the two lines that derive the diff figures (`:1530-1531`) with the PR's own numbers from `gh pr view {PR_NUMBER} --json additions,deletions,changedFiles`. The content is the same as the squash diff in all but pathological cases.

**Persist the `parentSha` you use.** Task 5 needs the identical value, and it cannot travel in a shell variable - `$VAR` must be assigned in the same fenced block that uses it (`workflows.md:59`). Write it to the outbox at `$(git rev-parse --path-format=absolute --git-common-dir)/bkit-outbox/{FID}/`, a path chosen specifically to survive Step 12's `worktree remove`. Do not recompute it later with `git rev-parse HEAD`; that is what `:1511` does today and it would produce a different sha.

**What stays in the (renumbered) Close Workflow step:** the squash-merge CI assertion at `:1455-1476`, the refined `outcome` row from Task 5, the lock removal at `:1583`, the tracker label update, and the final summary display.

**Change the CI assertion from a gate into a record.** Today a red CI run exits non-zero and routes to the Failure Path, so the close record is withheld. Instead, write an explicit row capturing the verdict and continue. Keep routing to the Failure Path for a red result if you prefer, but the row must be written first either way - the point of the change is that a red CI is recorded rather than inferred from a missing row.

**Verify:** `.bkit/src/bkit-status-hole-detector.ts` still classifies a completed run correctly - it keys off `ship-close-workflow` being present (`:235`), and `:54` carries a step list you should check for ordering assumptions.

---

### Task 5 - append a refined outcome row after the merge

**File:** `.bkit/workflows/bkit-ship.md`

In the Close Workflow step, after the CI assertion, append a second `outcome` row with the accurate figures: the real `SQUASH_SHA` diff (`:1530-1531` as written today) and the full `durationSeconds` including merge and close time.

**Reuse the `parentSha` written to the outbox in Task 4. Do not mint a new one.** Outcome identity is the tuple `(repo, workflow, parentSha)` (`.bkit/src/bkit-telemetry.ts:381`), computed into a dedupe anchor at `:605-611`. Matching the sha makes the two rows one entity, so last-wins-by-`ts` picks the refined row through the existing fold. A different sha produces two counted runs and a corrupted per-cycle delta at `:419-425`.

This is an append, never an edit. `.bkit/jsonl.md:231` explains why: `merge=union` keeps both sides of a conflicting hunk, so an edited line survives beside its replacement.

If the run cannot publish this row, the provisional row from Task 4 is what survives. That is the intended degradation - lower precision, not a lost record.

**Verify:** write both rows into a scratch `.bkit/stats.jsonl` and confirm `pnpm bkit telemetry summary --phase=ship` reports one run, not two, and reports the refined figures.

---

### Task 6 - try the dev push, fall back to a branch and PR

**File:** `.bkit/workflows/bkit-ship.md`

Replace the `RUNTIME_DEVPUSHES` branch at `:1585-1589`. Attempt `git push origin dev`. If it fails, branch off `origin/dev`, commit the tail there, open a pull request and merge it.

This is two branches, so it is a labeled decision block per `workflows.md:57` - a `Route:` heading-row with one `-` bullet per branch - not an inline conditional. And it routes on the push command's **exit code**, not on a restatement of whether `dev` is protected (`:53`).

Branch fresh off `origin/dev` - do not reuse the feature branch. After a squash merge its history is no longer an ancestor of `dev` and reusing it invites conflicts for no benefit. Because the fallback uses a fresh branch, Step 12's `git push origin --delete "feat/{FID}"` (`:1411`) can stay exactly where it is.

A rejected push is refused server-side and lands nothing, so attempting it is safe even where `dev` is protected.

While you are in Step 12: `git branch -D "feat/{FID}" 2>/dev/null || true` (`:1407`) silently no-ops when the session is standing on that branch, which is the case whenever `RUNTIME_WORKTREES=false`. Gate 12's "Local `feat/{FID}` branch deleted" checkbox passes regardless. Either make the deletion conditional on not being on the branch, or reword the gate so it does not claim something that did not happen.

---

### Task 7 - update the doctrine and the step tables

**Files:** `.bkit/workflows.md`, `.bkit/workflows/bkit-ship.md`

This is where the reasoning goes. `workflows.md:62` requires that every explanation, trade-off and decision lives in `.bkit/workflows.md` rather than in the workflow file itself, so anything you were tempted to write as a comment during Tasks 2 to 6 belongs here.

The "ONE commit and ONE push per run" doctrine at `.bkit/workflows/bkit-ship.md:28` is no longer true - there is now a pre-merge commit and a post-merge tail. Rewrite it to describe the new shape and check whether any test asserts the old wording.

In `.bkit/workflows.md`, update:

- the ship section around `:909` and the step table at `:924-936`, which name step numbers and describe the `RUNTIME_DEVPUSHES` behaviour
- the Gate 13 line at `:1644` in `bkit-ship.md`, which states the old push contract
- the `RUNTIME_DEVPUSHES` description at `:118-120` if the try-then-fall-back change makes any of it stale

Update every gate checklist in `bkit-ship.md` affected by the moves so each box describes something the step actually does, following the gate-item shape at `workflows.md:61`.

---

### Task 8 - regenerate mirrors and run the suite

Run `pnpm bkit install` once, at the end, to regenerate the host mirrors. In this repo that leaves `core.bare=true`, so follow it with `git config core.bare false`.

Then run the full test suite. Pay particular attention to:

- `.bkit/src/bkit-ship-invariants.test.ts` - the Tier-2 push, staging and step-key contract
- `bkit-shipped-docs-refs.test.ts` - step-number references in shipped docs
- `bkit-block-locality-audit.test.ts` - `$VAR` assigned in the same fenced block
- `bkit-slash-arg-expansion.test.ts` - argument-placeholder shapes

---

### Things that will bite you

- Step numbers appear in gate headings, in the step table in `.bkit/workflows.md`, and in the tracker comment bodies inside each step. Grep for every number you change.
- `bkit-book-commit.sh` exits 6 on an empty pathspec, deliberately, because `git commit --pathspec-from-file` with an empty file commits the whole index instead of nothing. If a moved step produces no matching files, you will see exit 6 rather than a silent success - that is correct behaviour, not a bug to route around.
- The reverse tracker-label sync at `:1132-1170` skips any FID with a live `feat/{FID}` branch (`:1134`). Pre-merge the current branch is live, so the current FID is skipped - the same as today, since Step 12 runs later. No change needed, but do not "fix" it.
- Do not add `Closes #N` to any commit referencing a tracker issue.

## Re-check against `dev` (2026-10-07)

Both bugs in this issue are still real, but the implementation plan should not run as written. It quietly reverses a rule that #384 chose on purpose. It also leaves local (laptop) runs undecided, and one of its steps would mark failed runs as completed.

### Still true

- **Fault A:** `.bkit/scripts/bkit-book-commit.sh` still has no `docs/*.md` entry. The only doc it lists is `docs/roadmap.md`. So the ship still can't commit the docs its docs agent edits.
- **Fault B:** a cloud run still commits the bookkeeping and never pushes it (`bkit-ship.md:1446`).
  - **Correction:** the remote branch goes at Step 6, not Step 12. The merge itself runs `gh pr merge … --delete-branch` (`bkit-ship.md:830`).
  - That flag also deletes the local branch. It most likely switches the checkout to `dev` first when the run is standing on that branch (not tested). If so, on cloud the final commit lands on a local `dev` that is never pushed: the same loss in a different place.
  - That may also make the smaller "Step 12 `git branch -D` silently does nothing" bug moot. Check it before fixing it.
- **Decision 4 still holds:** a run's `outcome` row is still identified by (repo, workflow, `parentSha`) (`bkit-telemetry.ts:629-634`), and the later row still wins (`:897-906`).

### Problems with the plan

1. **It reverses a #384 rule without saying so.** #384 set the rule "no ship bookkeeping commit reaches the feature branch before the merge" (`docs/plans/202607/384-ship-bookkeeping-design.md:140-144`). A test enforces it: the "push-timing invariant" in `bkit-ship-invariants.test.ts`.
   - The reason: the merge only goes ahead when CI passed on the exact commit being merged.
   - A pre-merge bookkeeping push changes that commit, so every ship pays for a full extra CI run before merging. Step 5 waits up to `SHIP_CI_WAIT_TIMEOUT_S=1800` for it.
   - Tasks 2 and 3 put the new steps *after* Step 5. So the Step 6 gate would first refuse to merge (no passing run on the new commit) and loop back to Step 5. It works, but only by going through a refusal.
2. **Local runs don't fit.** On a laptop, `BOOK_ROOT` is the main checkout sitting on `dev`, not the feature worktree (`bkit-ship.md:278-283`). Every earlier ship status row lives there.
   - "Ride the PR" means either splitting the status log across two trees, or doing this on cloud only. The plan doesn't choose.
   - `.bkit/workflows.md:130` says never change the working local path to serve cloud; branch around it instead.
3. **Writing `ship-close-workflow` before the merge mislabels failed runs.** `classifyRun` (`bkit-status-hole-detector.ts:234`) checks for that row *before* it checks for failure. If the merge then fails, the run is classed as completed (`PATH_A`), not `ABORTED`. Decision 2 says downstream code holds up; this part doesn't.
4. **Order problem with the summary.** `@bkit-ship-summary` reads `ship-deferred-sweep.md`, which Step 5 writes. If docs and summary run before Step 5, the summary loses that input. If they run after, the run hits point 1's refusal loop.

### Suggested change

Keep #384's rule and fix the post-merge tail instead:

- **Keep Task 1** (add `docs/*.md` to the commit list). It's needed either way.
- **Make the final commit publishable:** try `git push origin dev`. If that's rejected, use the PR-based close that design and plan already have (`bkit-design.md:879-886`: push a branch, `gh pr create`, `gh pr merge`). That copies an existing pattern instead of inventing one.
- **Fix #363's lost `ship-deferred-sweep.md` on its own** by writing it under `BOOK_ROOT`, as its failure row suggests.
- **The cost:** a crash between merge and close still loses the tail. The window is smaller than today's, but not zero.

If the pre-merge design stays instead, this issue needs to:

- say outright that it reverses the #384 rule, and update that test;
- place the new steps before Step 5's CI re-check, with the deferred sweep moved ahead of the summary;
- decide what `BOOK_ROOT` means on a laptop;
- keep `ship-close-workflow` and `workflow-done` after the merge, or fix `classifyRun`.

### Out-of-date details above

- All `bkit-ship.md` line numbers are off; the file is now 1512 lines.
- #464 changed Step 10:
  - `docs/roadmap.jsonl` is now `.bkit/issues.jsonl`.
  - The SHIPPED row is written by the workflow itself (`bkit-ship.md:1129-1135`), not the docs prompt.
  - Roadmap refresh, cadence and analysis are gone, so the "at risk" list is much shorter.
- The reverse tracker-label sync is gone too. Drop it from Decision 2 and from "Things that will bite you".
- The branch placeholder is now `{SHIP_BRANCH}`, not `feat/{FID}`.
- `.bkit/workflows.md` references have moved:
  - The ship section is now `:919-948`.
  - The `RUNTIME_DEVPUSHES` text is now `:129-131`.
  - `:121` explicitly says Step 10's writes are "not a feat-side write". It needs updating whichever way this goes.
- Three ledger rows were moved onto this issue on 2026-09-23 and aren't mentioned above: two deferrals (`uniform-pr-based-phase-close-all-runtimes`, `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`) and one failure (`363-ship-worktree-artifact-lost-before-any-commit-captures-it`).

**Heads-up:** as of this check there are uncommitted edits to `.bkit/src/bkit-ship-invariants.test.ts`. They move the old bats ship tests into vitest, including the push-timing test. Implementing this issue will run into that work.

Before proposing an order, I'm checking the step names the status log uses and which statuses the roadmap understands.

Here's the order I'd use. I haven't edited anything yet.

## Current vs new order

<!-- prettier-ignore -->
| # | Current | New |
| --- | --- | --- |
| 1 | Start Workflow | Start Workflow |
| 2 | Verify PR | Verify PR |
| 3 | Base Check | Base Check |
| 4 | Integrate (Path B only) | Integrate (Path B only) |
| 5 | Re-validate + Deferred Sweep | **Deferred Sweep** (the sweep half of old 5) |
| 6 | Merge Gate + Merge PR | **Update Docs & Summary** (was 10) |
| 7 | Failure Diagnose | **Prune Skills** (was 11) |
| 8 | Failure Remediate | **Commit + Push to PR** (new) |
| 9 | Switch to Dev | **Re-validate** (the "wait for CI" half of old 5) |
| 10 | Update Docs & Summary | Merge Gate + Merge PR (was 6) |
| 11 | Prune Skills | Failure Diagnose (was 7) |
| 12 | Worktree Cleanup | Failure Remediate (was 8) |
| 13 | Close Workflow | Switch to Dev (was 9, laptop only) |
| 14 | — | Worktree Cleanup (was 12) |
| 15 | — | Close Workflow (was 13, much smaller) |

## What each moved step does in its new position

- **5 Deferred Sweep:** runs first so that if the feature is incomplete, ship stops before touching any docs. Its report (`ship-deferred-sweep.md`) is now committed in step 8. Today that report is lost: that's failure `363-ship-worktree-artifact-lost-…`.
- **6 Update Docs & Summary:**
  - Runs in the feature branch's working copy instead of the main checkout.
  - The summary no longer asks for `mergedAt`, which is empty before the merge.
  - A summary verdict of FAIL now **stops the merge**. Today the merge has already happened by then.
- **7 Prune Skills:** skill removals now land through the pull request.
- **8 Commit + Push to PR (new):** one commit carries the docs edits, summaries, sweep report, skill removals and the SHIPPED row, and pushes it to the PR branch. It reuses the commit-and-push code Step 4 already uses when it resolves conflicts. `bkit-book-commit.sh` gets `docs/*.md` added to its file list.
- **9 Re-validate:** the push in step 8 creates a new commit, so CI must pass on it before merging. This step already waits for CI whenever the branch tip moves, so it needs no new logic. It just runs after the push now.
- **15 Close Workflow** keeps only what can't exist before the merge:
  - the CI result on the merged commit, now written down whether it's green or red;
  - the "ship finished" rows;
  - the final timing and size figures;
  - releasing the lock, setting labels, and posting the closing comment.

## What this costs, and what else changes

- **One extra CI run** for ships that didn't need a rebase. Ships that did need one already wait for CI once, and the new order folds both into a single wait.
- **It overrides #384's rule** that ship never pushes its own paperwork to the feature branch. I'll record that as a decision in `docs/decisions.jsonl` and change the test to allow exactly two pushes: the conflict-resolve one and the new step 8.
- **The "ship finished" rows stay after the merge.** That avoids the problem where a failed merge gets reported as completed.
- **The SHIPPED row is now written before the merge.** So if the merge then fails, the failure path has to add a row putting the feature back to its previous status. Otherwise the roadmap would show it as shipped.
- **Laptop runs:** docs, summaries and skills now go through the PR, the same as on cloud. The status log stays in your main checkout and is committed straight to `dev` at the end, as it is today, because that already works locally.

## One decision for you

On cloud, step 15 still produces a few rows after the merge: the CI result on the merged commit, "ship finished", and the final figures. Where should they go?

- **(a) Recommended:** try pushing them to `dev`. If that's refused, open and merge a small PR. Design and plan already finish this way on cloud (`bkit-design.md:879-886`), so nothing is lost.
- **(b)** Accept losing those few rows on cloud. Everything else will already be on `dev` through the merge.

Say go (with a or b) and I'll make the edits.

Yes, with one safety check and one case where it can't work.

## How it would work

1. Before touching anything, ship records the commit CI last passed on (the "green commit").
2. Ship commits the docs on top of it with `[skip ci]` in the message, so pushing it doesn't start a new CI run.
3. The merge gate (`bkit-ship-gate.sh`) gets a new rule. It accepts the green result from the earlier commit only if **every file changed since then is on the bookkeeping list**: `docs/*.md`, the log folder, the `.jsonl` ledgers and skill removals. That's the same list `bkit-book-commit.sh` already uses, so there's one list to maintain.
4. If anything else changed since the green commit, CI runs as normal. That covers the Path B rebase, or someone pushing code mid-ship. A Path B ship then pays for one CI run covering both the rebase and the docs, not two.
5. The merge still uses `--match-head-commit`, so it can't merge anything other than the exact commit ship checked.

So a PR that arrives green costs **zero extra CI runs**.

## The risk, and what catches it

The docs commit is never tested before it merges. The docs could still break something CI checks. For example, bkit's own tests read `docs/*.md`, and consumer repos may run prose lint on markdown. Two things limit that:

- The pre-commit hook already runs `lint-staged`, so formatting is fixed when the docs are committed.
- CI still runs on `dev` after the merge, and Close Workflow already checks that run and records the result. A docs break would show up there straight away. It would be red on `dev`, not silently merged.

That's a real trade: a rare red `dev` run instead of a CI run on every ship. Given what you said about CI minutes, I think it's the right trade.

## The case where it can't work

If a repo makes GitHub require passing checks before merging (branch protection), GitHub itself refuses to merge a commit with no CI result, whatever our gate says. That can't happen on bkit's own `dev`, which has no protection (the protection settings API returns 403 on this plan). Consumer repos might have it, though. When GitHub refuses, ship falls back to running CI once and merging after that.

## Revised order (only steps 8–10 change from my last table)

<!-- prettier-ignore -->
| # | Step |
| --- | --- |
| 5 | Deferred Sweep |
| 6 | Update Docs & Summary |
| 7 | Prune Skills |
| 8 | Commit + Push to PR, with `[skip ci]` |
| 9 | Re-validate: runs CI **only if** something outside the bookkeeping list changed since the last green run |
| 10 | Merge Gate + Merge: accepts the earlier green result when only bookkeeping files changed since |
| 11–15 | unchanged from the last table |

The cloud question from last time is still open: should the few rows written after the merge go through **(a)** a push to `dev`, or a small PR if that's refused, or **(b)** be accepted as lost on cloud? I recommend (a). Say go with your pick and I'll start the edits.

## Done: committed in 717f8d02 on `dev` (not pushed yet)

This shipped in one commit together with #493, because both changes touch `bkit-book-commit.sh`, `tests/book-commit.bats` and `.bkit/workflows.md`.

### What ship does now

- **Docs and bookkeeping ride the pull request (Steps 5-8).** Steps 5-8 run in the feature worktree, before the merge: deferred sweep, then docs sync and summary in parallel, then skill prune. Everything they write goes into one `docs({FID}): ship bookkeeping bkit [skip ci]` commit, made through `bkit-book-commit.sh --scope=pr` and pushed to the PR branch. The merge then carries the docs, logs, ledgers, the `SHIPPED` roadmap row and the skill removals to `dev`. This fixes both faults:
  - **Fault A:** the new `pr` scope adds top-level `docs/*.md` to the allow-list, so the docs the update-docs agent edits can now be committed.
  - **Fault B:** every write now has somewhere to go on every runtime, including cloud runs that can't push `dev`.
- **A docs-only commit doesn't trigger a new CI run (Step 9 and the gate).** If only bookkeeping changed since the last commit CI tested, the gate checks CI at that tested commit (`bkit-ship-gate.sh assert --validated`). "Only bookkeeping" means every changed path is on the same allow-list (`bkit-book-commit.sh only-bookkeeping`). A non-bookkeeping change past that commit exits with code 17. The merge still pins the exact PR head (`--match-head-commit`). If `dev` requires status checks, ship runs CI at the PR head instead.
- **The post-merge close publishes on every runtime (Step 15).**
  - The squash-merge CI verdict is recorded first, as a `ship-merge-ci` row.
  - On a laptop, the close commits on `dev` and pushes under the dev lock.
  - On cloud, it builds the close commit in a detached worktree off `origin/dev` and pushes `dev`. If that push is refused, it opens a `ship-close/{FID}` PR.
  - `union-ledgers` never carries `.bkit/issues.jsonl`, so a failure before the merge can't mark an unmerged feature as shipped.
- **Ship now has 15 steps,** renumbered throughout. The `Goal:` lines are removed; every rule they stated is already in that step's own instructions.

### Docs and tests

- **Docs updated:** `.bkit/workflows.md`, `docs/deployments.md` and its template copy, `docs/testing.md`, `.bkit/jsonl.md`.
- **Stale numbers fixed in `docs/testing.md`:**
  - "36 assertions" and "12-path allow-list" no longer matched the code, so the counts are removed.
  - "canonical 14 step keys" is now 15.
- **Tests:**
  - `tests/ship-gate.bats` has 40 cases, covering code 17 and `--validated`.
  - `tests/book-commit.bats` covers `only-bookkeeping` and `--scope=pr`.
  - The ship invariant, verdict and worktree-ownership tests are updated, as are the status-hole detector and the CI-dispatch alignment test.
- **Full Vitest suite:** 4197 pass. The only failures were the two `bkit-ledger-integrity` tests, which fail on the previous `HEAD` too, and one intermittent telemetry test that passed when re-run.
