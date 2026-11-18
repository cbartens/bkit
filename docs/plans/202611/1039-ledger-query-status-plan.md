# Ledger query --status default Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

`bkit ledgers query --status=OPEN` misses every open `friction`, `deferral` or `failure` fold winner that carries no `status` field (rows written before commit `5d908d631`). One exported function, `defaultStatus`, in `.bkit/core/engine/ledgers/telemetry.ts` becomes the single answer to "which status does a row have when it gives none", and the append default, the query filter and the tips check all call it.

**Related Issues:**

- #1039 — ledger query status default
- #1020 — Two small check gaps: ledger row schema, a bkit-only command

---

## 👤 ⚠️ Acceptance Scenario

### Narrative

A person or agent runs `bkit ledgers query --ledger=deferrals --status=OPEN` and gets every open deferral, including old rows that carry no `status`, printed as stored.

### Success Criteria

- `queryLedger(raw, { status: "OPEN" })` returns a `friction`, `deferral` or `failure` fold winner that has no `status`.
- `queryLedger(raw, { status: "ACTIVE" })` still returns a `decision` or `knowledge` winner that has no `status`.
- A winner of any other kind with no `status` matches no `--status` value, as today.
- `bkit ledgers query --ledger=deferrals --status=OPEN` in a temp repo returns a status-less deferral winner, and its printed row is the row as stored (no `status` field added).
- `DEFAULT_ACTIVE_KINDS` no longer exists; `appendLedgerRows`, `queryLedger` and `hasUnsharedFriction` all take the default from `defaultStatus` in `telemetry.ts`, and `appendLedgerRows` still writes `status: "OPEN"` on a new severity-kind row that gives none and keeps a given `status`.

### Process Sketch

- **WHEN** `queryLedger` folds a ledger and filters winners by `--status=OPEN` **→ THEN** a status-less `friction` / `deferral` / `failure` winner is returned.
- **WHEN** the filter is `ACTIVE` **→ THEN** a status-less `decision` / `knowledge` winner is returned, as today.
- **IF** a status-less winner's kind is any other kind **→ THEN** it matches no `--status` value.
- **IF** the newer same-`key` row is `CLOSED` **→ THEN** the winner is not returned for `OPEN`, because the filter runs after the fold.

### Concrete Example

**Setup:** A temp git repo whose `docs/deferrals.jsonl` holds one `deferral` line with no `status`.

**Steps:**

1. User runs `bkit ledgers query --ledger=deferrals --status=OPEN` → System returns that row's key.
2. User inspects the printed row → it has no `status` property.

**Outcome:** The status-less deferral is listed as open and printed exactly as stored.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Status-less `deferral` winner, filter `OPEN` | Returned. |
| Status-less `deferral` winner, filter `CLOSED` or `TRIAGED` | Not returned. |
| Older row `OPEN`, newer winner `CLOSED` | Not returned for `OPEN`: the filter still runs after the fold. |
| Older row has no status, newer winner `CLOSED` | Not returned for `OPEN`. |
| Older row `CLOSED`, newer winner has no status | Returned for `OPEN`: the winner's own default decides. |
| Status-less `decision` or `knowledge` winner, filter `ACTIVE` | Returned, as today. |
| Status-less `decision` winner, filter `OPEN` | Not returned. |
| Status-less row of another kind (`feature`, `outcome`), any filter | Not returned, as today. |
| Friction row with a free-text `status` (`jsonl.md` allows `string`) | Kept as given; matches only that exact text. |
| Filter `open` (lower case) | Matches nothing, as today: the filter is case-sensitive. |
| No `--status` given | Every winner returned, as today. |
| Status-less friction winner, `scope` not `consumer`, outside the bkit repo | `hasUnsharedFriction` still returns `true`. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a friction, deferral or failure winner with no status matches the OPEN filter | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 1 |
| a status-less winner whose newer row is CLOSED does not match OPEN | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 1 |
| defaultStatus gives OPEN for severity kinds, ACTIVE for decision and knowledge, none otherwise | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 1 |
| query --status=OPEN returns a deferral winner that has no status, printed as stored | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| hasUnsharedFriction counts a friction winner with no status | Unit | `.bkit/core/engine/checks/tips/detect.test.ts` | 2 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

`bkit ledgers query --status=OPEN` returns more rows on a ledger that holds status-less severity-kind winners (179 instead of 95 on this repo's `docs/deferrals.jsonl`). The output shape is unchanged. `defaultStatus` becomes an export of `.bkit/core/engine/ledgers/telemetry.ts`. No new flag, field or file.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

- **Assumption:** the query prints each row as stored and only the filter uses the default → filling `status` into the printed row would change what `bkit ledgers query` returns for rows no filter asked about, and every current caller already reads a missing `status` as "not `CLOSED`".
- **Assumption:** no migration → rewriting the 93 status-less winners would mean editing append-only ledgers in every consumer repo; reading them right is enough, and new rows already carry a status. `bkit ledgers compact` keeps a winner's fields as they are, so it neither fixes nor breaks this.
- **Assumption:** the append keeps writing a status only for the severity kinds → writing `ACTIVE` on new `decision` and `knowledge` rows would be a separate change to what rows hold.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

Rejected: filling `status` into the printed row (changes output for callers that did not ask), and a migration that rewrites old rows (edits append-only ledgers in every consumer repo).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Changing the `--status` help text (`ledgers.ts` line 1009, rendered into `.bkit/core/.bkit/cli.md`) | "e.g. ACTIVE" stays true | none |
| Case-insensitive status matching | The goal is the default for status-less rows only | none |
| Adding a `status` to old rows on disk | Reading them right meets the goal | none |
| Switching the five prompts that skip `CLOSED` rows themselves to `--status=OPEN` | They also need `TRIAGED` rows, which `OPEN` alone does not return | none |

## Suggested Scope Expansion

None

## Security & Privacy

None — no new routes, DB writes, secrets, or user input.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package change.
- [ ] **Dependency Versions:** no dependency change.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** access to the files is confirmed.
- [ ] **Project Context:** the relevant `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows are read.
- [ ] **Project Documents:** assessed through the `.agents/docs.md` index; sources in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — `ledgers/` module lists | `docs/architecture.md` § `ledgers/` tree and § Knowledge / Decisions JSONL Ledgers | covered | None. No topology change; the file list is unchanged. |
| technology | `docs/technology.md` | no — no framework, library or convention change | `docs/technology.md` header | covered | None. |
| security | `docs/security.md` | no — no route, secret or input | `docs/security.md` (searched for ledger rules, none apply) | covered | None. |
| testing | `docs/testing.md` | yes — new tests and a Key test files row | `docs/testing.md` § Which tier does a behaviour need?, § Key test files | covered | Task 3 updates the `commands/workflow/ledgers.test.ts` row. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | Not applicable: JSONL ledgers only. |
| design | `docs/design.md` | no — no UI | none | none | Not applicable. |
| observability | `docs/observability.md` | no — no logging change | none | none | Not applicable. |
| deployments | `docs/deployments.md` | no — no release or CI change | none | none | Not applicable. |

## Documentation Warnings

None

## Data Schema Integration

None — no database. The ledger row shape is unchanged; only how a missing `status` is read changes.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| One status default for a status-less row | `.bkit/core/engine/ledgers/telemetry.ts` | `grep -n "DEFAULT_ACTIVE_KINDS\|SEVERITY_KINDS"` across `.bkit/core/engine/`; read `queryLedger`, `validate` | `DEFAULT_ACTIVE_KINDS` and `SEVERITY_KINDS` in `telemetry.ts` — cover decision/knowledge and the severity trio separately, missing one function | EXTEND | Add `defaultStatus` next to `SEVERITY_KINDS`, delete `DEFAULT_ACTIVE_KINDS`, call it from `queryLedger`. |
| Append default | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n "SEVERITY_KINDS"` in `ledgers.ts`; read `appendLedgerRows` | the `SEVERITY_KINDS.has` check at line 1798 — a second copy of the rule | EXTEND | Call `defaultStatus` there. |
| Tips check default | `.bkit/core/engine/checks/tips/detect.ts` | read `hasUnsharedFriction`; `grep -rn "hasUnsharedFriction"` | the `status === undefined \|\| "OPEN"` test — a hand-written copy | EXTEND | Call `defaultStatus("friction")`. |
| Docs for the read default | `.bkit/core/.bkit/jsonl.md` | `grep -n "ACTIVE\|OPEN" .bkit/core/.bkit/jsonl.md` | § Read Idiom **Filters** and § Updating a Row — say only decision/knowledge have a read default | EXTEND | State the severity-kind default. |
| Test coverage row | `docs/testing.md` | `grep -n "ledgers.test.ts" docs/testing.md` | Key test files row for `commands/workflow/ledgers.test.ts` | EXTEND | Add the `query --status=OPEN` case. |

## Architecture & Component Changes

**Ledger rows:** None

### Backend

#### [MODIFY] `.bkit/core/engine/ledgers/telemetry.ts`

- **Existence Check:** the file exists.
- Export `defaultStatus(kind)`; `queryLedger` uses it; delete `DEFAULT_ACTIVE_KINDS`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`

- **Existence Check:** the file exists.
- The append default calls `defaultStatus` and fills only `"OPEN"`.

#### [MODIFY] `.bkit/core/engine/checks/tips/detect.ts`

- **Existence Check:** the file exists.
- `hasUnsharedFriction` uses `defaultStatus("friction")`.

### Docs

#### [MODIFY] `.bkit/core/.bkit/jsonl.md`, `docs/testing.md`

- **Existence Check:** both files exist.
- State the read default; update the Key test files row.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `DEFAULT_ACTIVE_KINDS` in `.bkit/core/engine/ledgers/telemetry.ts` | `defaultStatus` | DELETE | A second list of which kinds have a status default. |
| `status === undefined \|\| status === "OPEN"` test in `hasUnsharedFriction` | `defaultStatus("friction")` | DELETE | A hand-written copy of the default. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/jsonl.md` | § Read Idiom and § Updating a Row: a status-less row of a severity kind reads as `OPEN`. |
| `docs/testing.md` | Key test files: `commands/workflow/ledgers.test.ts` row adds `query --status=OPEN` returning a status-less winner. |

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: One status default for append, query and tips

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add `defaultStatus` and make `queryLedger` read a status-less row as its kind's default
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

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Make the append default and `hasUnsharedFriction` call `defaultStatus`
  - **UPDATE:** `appendLedgerRows` in `.bkit/core/engine/commands/workflow/ledgers.ts`: import `defaultStatus` from `../../ledgers/telemetry.js`; the default (lines 1798-1799) fills `status: "OPEN"` only when `row["status"] === undefined` and `defaultStatus(String(row["kind"])) === "OPEN"`, so `decision` and `knowledge` rows keep no written status; drop the `SEVERITY_KINDS` import if no longer used
  - **UPDATE:** `hasUnsharedFriction` in `.bkit/core/engine/checks/tips/detect.ts`: import `defaultStatus` beside `fold, parse`; the check (line 273) compares `(r["status"] ?? defaultStatus("friction")) === "OPEN"`
  - **UPDATE:** `.bkit/core/engine/checks/tips/detect.test.ts`: import `hasUnsharedFriction`; add a `describe("hasUnsharedFriction")` with the status-less friction test
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/checks/tips/detect.test.ts .bkit/core/engine/commands/workflow/ledgers.test.ts` passes, including the new guard test `hasUnsharedFriction counts a friction winner with no status` (a non-bkit `package.json` plus one status-less `friction` row with `scope: "universal"` in the temp `cwd` returns `true`; it passes before and after) and the existing append-status tests at `ledgers.test.ts` lines 1426 and 1439 unchanged; `grep -rn "DEFAULT_ACTIVE_KINDS" .bkit/core/engine` finds nothing; `pnpm build && git add dist/` has run
  - **TEST FIRST:** n/a — pure refactor of two existing defaults onto `defaultStatus`, behaviour unchanged; guarded by the existing append tests and the new `hasUnsharedFriction` guard test, which pass before and after

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Say that a status-less row of a triaged kind reads as `OPEN`
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: in § Read Idiom, **Filters** (line 24), a row with no `status` reads as `OPEN` on `friction` / `deferral` / `failure` and as `ACTIVE` on `decision` / `knowledge`, so `bkit ledgers query --status=` finds it
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: in § Updating a Row (line 347), after the append default, one sentence that `bkit ledgers query` reads a status-less row of those kinds as `OPEN`
  - **UPDATE:** `docs/testing.md`: in § Key test files, the `commands/workflow/ledgers.test.ts` row (line 837) adds `query --status=OPEN` returning a status-less winner
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply and § Before You Save for the `jsonl.md` edit
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** no line in those files says only `decision` / `knowledge` rows have a read default, and `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/jsonl.md`
  - **TEST FIRST:** n/a — docs only

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN` or `TEST FIRST`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Run all tests:** `pnpm vitest run` on the three touched engine test files passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof.

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing.

- [ ] **Step 1:** `pnpm build`, then `node dist/cli.js ledgers query --ledger=deferrals --status=OPEN` on this repo returns 179 rows instead of 95.
