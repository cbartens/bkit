# Brief: group 1 — One status default for append, query and tips (tests)

Plan: Ledger query --status default Implementation Plan

## Why and what

### Context & Goals

`bkit ledgers query --status=OPEN` misses every open `friction`, `deferral` or `failure` fold winner that carries no `status` field (rows written before commit `5d908d631`). One exported function, `defaultStatus`, in `.bkit/core/engine/ledgers/telemetry.ts` becomes the single answer to "which status does a row have when it gives none", and the append default, the query filter and the tips check all call it.

**Related Issues:**

- #1039 — ledger query status default
- #1020 — Two small check gaps: ledger row schema, a bkit-only command

---

### Narrative

A person or agent runs `bkit ledgers query --ledger=deferrals --status=OPEN` and gets every open deferral, including old rows that carry no `status`, printed as stored.

### Success Criteria

- `queryLedger(raw, { status: "OPEN" })` returns a `friction`, `deferral` or `failure` fold winner that has no `status`.
- `queryLedger(raw, { status: "ACTIVE" })` still returns a `decision` or `knowledge` winner that has no `status`.
- A winner of any other kind with no `status` matches no `--status` value, as today.
- `bkit ledgers query --ledger=deferrals --status=OPEN` in a temp repo returns a status-less deferral winner, and its printed row is the row as stored (no `status` field added).
- `DEFAULT_ACTIVE_KINDS` no longer exists; `appendLedgerRows`, `queryLedger` and `hasUnsharedFriction` all take the default from `defaultStatus` in `telemetry.ts`, and `appendLedgerRows` still writes `status: "OPEN"` on a new severity-kind row that gives none and keeps a given `status`.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Changing the `--status` help text (`ledgers.ts` line 1009, rendered into `.bkit/core/.bkit/cli.md`) | "e.g. ACTIVE" stays true | none |
| Case-insensitive status matching | The goal is the default for status-less rows only | none |
| Adding a `status` to old rows on disk | Reading them right meets the goal | none |
| Switching the five prompts that skip `CLOSED` rows themselves to `--status=OPEN` | They also need `TRIAGED` rows, which `OPEN` alone does not return | none |

## Where it fits

- Group 1: One status default for append, query and tips — this group
  - TASK 1: Add `defaultStatus` and make `queryLedger` read a status-less row as its kind's default — open
  - TASK 2: Make the append default and `hasUnsharedFriction` call `defaultStatus` — done
  - TASK 3: Say that a status-less row of a triaged kind reads as `OPEN` — done

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add `defaultStatus` and make `queryLedger` read a status-less row as its kind's default
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: export `defaultStatus(kind: string): string | undefined` next to `SEVERITY_KINDS` (line 265), returning `"OPEN"` when `SEVERITY_KINDS.has(kind)`, `"ACTIVE"` for `decision` and `knowledge`, and `undefined` otherwise
  - **UPDATE:** `queryLedger` in `.bkit/core/engine/ledgers/telemetry.ts`: the filter (line 2029) uses `e.status ?? defaultStatus(String(e.kind))`, and `DEFAULT_ACTIVE_KINDS` (line 1989) is deleted
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.test.ts`: add the three `queryLedger` / `defaultStatus` tests (the `describe("queryLedger — canonical winners before filtering")` block starts at line 3068)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: add the `query` test inside `describe("bkit ledgers query")` (line 2222)
  - **READ:** `validate` in `.bkit/core/engine/ledgers/telemetry.ts`: its comment says absent means `ACTIVE` on the decision and knowledge lifecycle; it reads no default and stays unchanged
  - **READ:** `ledgerKeys` in `.bkit/core/engine/commands/workflow/steps.ts`: calls `queryLedger` with no filter, so it is unaffected
  - **READ:** `docs/testing.md`: § Which tier does a behaviour need? for the tier of each test
  - **DONE WHEN:** `DEFAULT_ACTIVE_KINDS` no longer exists in `telemetry.ts`; `defaultStatus` is exported; `pnpm vitest run .bkit/core/engine/ledgers/telemetry.test.ts .bkit/core/engine/commands/workflow/ledgers.test.ts` passes, including the guard test `a status-less winner whose newer row is CLOSED does not match OPEN` (it passes before and after) and the append-status tests around `ledgers.test.ts` lines 1426 and 1439; `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `a friction, deferral or failure winner with no status matches the OPEN filter` fails on `queryLedger(raw, { status: "OPEN" })` returning only the one `OPEN` row, with "expected 4 keys" got 1: it builds one status-less winner of each severity kind plus one `OPEN` one
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `defaultStatus gives OPEN for severity kinds, ACTIVE for decision and knowledge, none otherwise` fails on the missing `defaultStatus` export (not a function); it checks `friction`, `deferral`, `failure`, `decision`, `knowledge` and `feature`
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `query --status=OPEN returns a deferral winner that has no status, printed as stored` fails on an empty page: it writes one status-less deferral line straight into `docs/deferrals.jsonl`, runs `query --ledger=deferrals --status=OPEN`, and expects that key in the rows with no `status` property

<!-- bkit:task 1 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a friction, deferral or failure winner with no status matches the OPEN filter | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 1 |
| a status-less winner whose newer row is CLOSED does not match OPEN | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 1 |
| defaultStatus gives OPEN for severity kinds, ACTIVE for decision and knowledge, none otherwise | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 1 |
| query --status=OPEN returns a deferral winner that has no status, printed as stored | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
