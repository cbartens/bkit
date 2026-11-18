# Brief: group 1 — `bkit ledgers append` writes status OPEN by default (tests)

Plan: Ledger append defaults status to OPEN, and the shipped authoring doc names no bkit-only command Implementation Plan

## Why and what

### Context & Goals

Two small defects from #1012 (findings C6 and C7), built after #992 has landed:

1. `bkit ledgers append` writes a friction, deferral or failure row with no `status` as given. It should write `status: "OPEN"`, and `.bkit/core/.bkit/jsonl.md` should say so. The severity and status refusals in `validate` already exist; they are not rebuilt.
2. The `authoring.md` that ships to every project names `instructions.ts`, `pnpm instructions:sync` and `instructions.test.ts`, which exist only in the bkit repo. Those steps move to bkit's own Project Rules in `.agents/rules.md`, below `bkit:end`, and a test fails if the shipped file names them again.

Out of scope: correcting the old rows `docs/knowledge.jsonl:80` and `docs/failures.jsonl:5` (they are left as they are), and a `bkit ledgers query` diagnostic for bad rows. No prompt or workflow tells a writer to add `status` by hand (`grep` of `.bkit/core/prompts`, `.bkit/core/workflows` and `.bkit/core/.bkit` found none), so there is no such sentence to remove.

**Related Issues:**

- #1020 — Two small checks (this plan's issue)
- #1012 — Project Goals audit: where bkit falls short, and what to change (parent, findings C6 and C7)
- #992 — Ledger commands: six hardening gaps from the 860 review (landed first; same ledger files)

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `bkit ledgers append` of a friction row with no `status` writes `status: "OPEN"` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| `bkit ledgers append` of a deferral row with no `status` writes `status: "OPEN"` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| `bkit ledgers append` of a failure row with no `status` writes `status: "OPEN"` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| An append that gives a `status` keeps it, in the same batch as a row that gets the default | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| The shipped `.bkit/core/.bkit/authoring.md` names no `instructions.ts`, `instructions:sync`, `instructions:show` or `instructions.test.ts` | Static | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` | 3 |

## Where it fits

- Group 1: `bkit ledgers append` writes status OPEN by default — this group
  - TASK 1: Default a missing `status` to `OPEN` on friction, deferral and failure rows — open
  - TASK 2: State the `OPEN` default in the ledger row schema — done
- Group 2: The shipped authoring doc names no bkit-only command — next
  - TASK 3: Move the bkit-only steps out of the shipped `authoring.md` and fail on their return — open
  - TASK 4: Rebuild `dist/` and refresh the rendered copies — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Default a missing `status` to `OPEN` on friction, deferral and failure rows
  - **UPDATE:** `appendLedgerRows` in `.bkit/core/engine/commands/workflow/ledgers.ts`: in `build`, before `validate(row)`, set `status: "OPEN"` on a row whose kind is in `SEVERITY_KINDS` and whose `status` is undefined; keep a given `status`; add `SEVERITY_KINDS` to the existing import from `../../ledgers/telemetry.js`
  - **READ:** `SEVERITY_KINDS` in `.bkit/core/engine/ledgers/telemetry.ts`: the three kinds that take the default
  - **READ:** `validate` in `.bkit/core/engine/ledgers/telemetry.ts`: the existing refusal of an unknown `status`, which stays unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the four new tests in `describe("bkit ledgers append")`, and any existing test (here, in `.bkit/core/engine/ledgers/journal.integration.test.ts`, `.bkit/core/engine/commands/workflow/run-facts.test.ts`, `.bkit/core/engine/commands/workflow/runs.test.ts` or `.bkit/core/engine/ledgers/status.test.ts`) that appends a friction, deferral or failure row with no `status` and asserts the whole row
  - **READ:** `docs/testing.md`: the strategy for `commands/workflow/ledgers.test.ts` (real temp git repo, no mocked boundary)
  - **UPDATE:** `docs/testing.md`: the `commands/workflow/ledgers.test.ts` row in § Key test files, adding that `append` writes `status: "OPEN"` on a friction, deferral or failure row that gives none and keeps a given `status`
  - **DONE WHEN:** the four tests pass; a row appended with no `status` reads back `status: "OPEN"` for each of friction, deferral and failure; a given `status` is kept; a knowledge or decision row gets no `status` added; `pnpm exec vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts` and the other test files listed above pass; the `docs/testing.md` row names the new behaviour
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `append writes status OPEN on a friction row given none` fails on the row read back having no `status`, "OPEN" missing
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `append writes status OPEN on a deferral row given none` fails on the row read back having no `status`, "OPEN" missing
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `append writes status OPEN on a failure row given none` fails on the row read back having no `status`, "OPEN" missing
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `append keeps a given status next to a defaulted one` fails on the sibling row with no `status` being written without "OPEN"

<!-- bkit:task 1 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `bkit ledgers append` of a friction row with no `status` writes `status: "OPEN"` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| `bkit ledgers append` of a deferral row with no `status` writes `status: "OPEN"` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| `bkit ledgers append` of a failure row with no `status` writes `status: "OPEN"` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| An append that gives a `status` keeps it, in the same batch as a row that gets the default | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
