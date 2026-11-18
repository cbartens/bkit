# Ledger append defaults status to OPEN, and the shipped authoring doc names no bkit-only command Implementation Plan

## Context & Goals

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

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — `bkit ledgers append` is the ledger writer | `docs/architecture.md` § Knowledge / Decisions JSONL Ledgers (deterministic bookkeeping paragraph) | covered | None. The paragraph describes what the engine fills in on append and names no status default, so no edit. |
| technology | `docs/technology.md` | yes — build and test conventions | `docs/technology.md` § Build & Output, § Testing | covered | None. |
| security | `docs/security.md` | no — no credential, input-trust or permission change | none | none | Not applicable: the change defaults a field on a validated row and moves doc text. |
| testing | `docs/testing.md` | yes — test tiers and the key-test-file table | `docs/testing.md` § Test first, § Key test files (rows for `commands/workflow/ledgers.test.ts` and the `shipped-docs-refs.test.ts` line under Project documentation lifecycle coverage) | covered | Update the two table entries to match the new tests (tasks 1 and 3). |
| data-schema | `docs/data-schema.md` | no — the file is a 10-line starter for a consumer database; bkit's ledger row schema lives in `.bkit/jsonl.md` | `.agents/docs.md` index (`.bkit/jsonl.md` row) | covered | Not applicable. Ledger row schema is documented in `.bkit/jsonl.md`, updated in task 2. |
| observability | `docs/observability.md` | no — no logging change | none | none | Not applicable. |
| deployments | `docs/deployments.md` | no — no release or CI change | none | none | Not applicable. |

## Documentation Warnings

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Default a missing `status` to `OPEN` on friction, deferral and failure rows at append time | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n 'SEVERITY_KINDS\|TRIAGE_STATUSES' .bkit/core/engine/ledgers/telemetry.ts .bkit/core/engine/commands/workflow/ledgers.ts`; read `appendLedgerRows` (`build`) and `validate`; `grep -rln appendLedgerRows .bkit/core/engine` | `appendLedgerRows` in `.bkit/core/engine/commands/workflow/ledgers.ts` fills `schema`, `ts`, `repo`, `bkit` and lineage before `validate`; `SEVERITY_KINDS` in `.bkit/core/engine/ledgers/telemetry.ts` names the three kinds | EXTEND | Add the default next to the other append-time fills, keyed on the exported `SEVERITY_KINDS`; every caller of `appendLedgerRows` gets it. |
| Row schema statement that a missing `status` is written `OPEN` | `.bkit/core/.bkit/jsonl.md` | `grep -n 'status' .bkit/core/.bkit/jsonl.md`; read § Severity and § Updating a Row | `.bkit/core/.bkit/jsonl.md` § Updating a Row (the status ladder) | EXTEND | One sentence in the existing status-ladder text; no new section. |
| Test that the shipped authoring doc names no bkit-repo-only command | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` | `grep -rl 'authoring.md' .bkit/core/engine --include='*.test.ts'`; read `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` | `shipped-docs-refs.test.ts` already scans the manifest-listed shipped docs (including `.bkit/core/.bkit/authoring.md`) for internal identifiers | EXTEND | Add one `it` over the same file list; no parallel scanner. |
| Home for the bkit-only save-checklist steps | `.agents/rules.md` | read `.agents/rules.md` below `bkit:end` (§ Repo Authoring) | `.agents/rules.md` Project Rules § Repo Authoring (`Authoring sections`, `Shared instructions`) | EXTEND | The two moved bullets and the shared-wording sync commands join the existing Repo Authoring bullets; Project Rules is consumer-owned, so install never overwrites it. |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: `bkit ledgers append` writes status OPEN by default

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Default a missing `status` to `OPEN` on friction, deferral and failure rows
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

<!-- bkit:task 2 start -->

- [x] **TASK 2:** State the `OPEN` default in the ledger row schema
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: in § Updating a Row, beside the `TRIAGED` ladder text, state that `bkit ledgers append` writes `status: "OPEN"` on a `friction` / `deferral` / `failure` row that gives none; in the `friction` / `deferral` / `failure` rows of the per-kind field table, mark `status` as defaulted to `OPEN` on append
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `.bkit/core/.bkit/jsonl.md` says a missing `status` on the three triaged kinds is written `OPEN` at append, and says nothing of old rows being corrected
  - **TEST FIRST:** n/a — documentation only; the behaviour it describes is tested by task 1

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: The shipped authoring doc names no bkit-only command

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Move the bkit-only steps out of the shipped `authoring.md` and fail on their return
  - **READ:** `.bkit/core/.bkit/authoring.md`: § All Agent-Read Files `Shared wording` (lines 178-183), § Prompts and Workflows `Header blocks` (lines 289-298) and `Cross-file alignment` (lines 322-326), § Before You Save (lines 719-725)
  - **READ:** `.agents/rules.md`: Project Rules § Repo Authoring, where the moved text lands
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: delete the three sync-command bullets and the `Checked by:` line under `Shared wording` (lines 181-183); in `Header blocks` reword "let `pnpm instructions:sync` maintain the shared lines" to name no command and delete the `Checked by:` line that names `instructions.test.ts` and `instructions.ts` (line 298); in `Cross-file alignment` delete the sentence "Then run the check and the sync that § All Agent-Read Files, **Shared wording** names." and the `Checked by:` line naming `instructions.test.ts` (line 326); delete the two § Before You Save bullets at lines 721-722 (the `instructions.ts` run and "Run the tests named in the `Checked by:` lines")
  - **UPDATE:** `.agents/rules.md`: below `<!-- bkit:end -->`, in Project Rules § Repo Authoring, add one bullet for the shared-wording sync (after a clause edit, run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` first, which reports and writes nothing; run `pnpm instructions:sync` only when the report shows the change expected; and after editing a bkit rule, run the same check and sync; checked by `.bkit/core/engine/tools/instructions.test.ts`) and one bullet for the save checklist (run `instructions.ts` after changing a rule, a clause or `.bkit/authoring.md`, and run the tests named in the `Checked by:` lines of the rules touched)
  - **UPDATE:** `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`: a new `it` that reads `.bkit/core/.bkit/authoring.md` and fails on any of `instructions.ts`, `instructions:sync`, `instructions:show` or `instructions.test.ts`, naming each offending line
  - **UPDATE:** `docs/testing.md`: the `audits/repo/shipped-docs-refs.test.ts` line under Project documentation lifecycle coverage, adding that it also fails when the shipped `authoring.md` names a command that exists only in the bkit repo
  - **DONE WHEN:** `.bkit/core/.bkit/authoring.md` holds none of `instructions.ts`, `instructions:sync`, `instructions:show` or `instructions.test.ts`; `.agents/rules.md` below `bkit:end` holds the two new bullets with the removed commands; `pnpm exec vitest run .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` passes; `pnpm exec vitest run .bkit/core/engine/tools/instructions.test.ts` passes (assertions stop at `bkit:end`); the `docs/testing.md` line names the new check
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` `the shipped authoring.md names no command that exists only in the bkit repo` fails on `.bkit/core/.bkit/authoring.md` still naming "instructions.ts" and "instructions:sync"

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Rebuild `dist/` and refresh the rendered copies
  - **READ:** `package.json`: the `build` script (`tsc && chmod +x dist/cli.js`)
  - **UPDATE:** `dist/commands/workflow/ledgers.js`: the compiled output of task 1 (`pnpm build`, then `git add dist/`)
  - **UPDATE:** `.bkit/authoring.md`: refreshed from `.bkit/core/.bkit/authoring.md` by `pnpm tsx .bkit/core/engine/cli.ts upgrade`
  - **UPDATE:** `.bkit/jsonl.md`: refreshed from `.bkit/core/.bkit/jsonl.md` by the same upgrade
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** `pnpm build` exits 0 and `dist/commands/workflow/ledgers.js` holds the status default; `pnpm tsx .bkit/core/engine/cli.ts upgrade` has run, and `.bkit/authoring.md` no longer names `instructions.ts` or `instructions:sync` and `.bkit/jsonl.md` holds the `OPEN` default sentence; `bkit check` reports no drift
  - **TEST FIRST:** n/a — a build and a mirror refresh; the behaviour is tested by tasks 1 and 3

<!-- bkit:task 4 end -->

<!-- bkit:group 2 end -->
