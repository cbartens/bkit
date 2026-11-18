## Session Prompt — this run's, newer than everything below

/bkit-build #1039 publish=false

## Issue description — oldest

### Narrative

`bkit ledgers query --status=OPEN` misses every open friction, deferral or failure row that carries no `status` field. Each claim below was checked against the code on `dev` at `b5d673251`.

**What the query does.** `queryLedger` in `.bkit/core/engine/ledgers/telemetry.ts` (line 1996) folds the ledger, which means it keeps only the newest row per `key` (the fold winner), and only then applies the `--status` filter. For a winner with no `status`, the filter falls back to a default (line 2029):

```ts
const status = e.status ?? (DEFAULT_ACTIVE_KINDS.has(String(e.kind)) ? "ACTIVE" : undefined);
```

`DEFAULT_ACTIVE_KINDS` (line 1989) holds only `decision` and `knowledge`. A `friction`, `deferral` or `failure` winner with no `status` gets `undefined`, so it never equals `OPEN` and the query drops it.

**What the write side does.** `appendLedgerRows` in `.bkit/core/engine/commands/workflow/ledgers.ts` (line 1682) writes `status: "OPEN"` on a new row of a kind in `SEVERITY_KINDS` that gives none (lines 1798-1799). `SEVERITY_KINDS` (`telemetry.ts:265`) is `friction`, `deferral` and `failure`. `.bkit/core/.bkit/jsonl.md` § Updating a Row (line 347) says the same. So every row written from now on carries a status, but rows written before commit `5d908d631` do not, and the read side has no rule for them.

**How many rows it hits in this repo.** Counted with `queryLedger` itself, so only fold winners count (a status-less row that a newer row replaced does not matter):

<!-- prettier-ignore -->
| Ledger | Lines with no `"status"` | Fold winners | Winners with no `status` | `--status=OPEN` today | After the fix |
| --- | --- | --- | --- | --- | --- |
| `docs/deferrals.jsonl` | 135 of 478 | 358 | 84 (all `deferral`) | 95 | 179 |
| `.bkit/friction.jsonl` | 13 of 272 | 89 | 9 (all `friction`) | 59 | 68 |
| `docs/failures.jsonl` | 0 of 398 | 286 | 0 | 100 | 100 |

So today `--status=OPEN` on `docs/deferrals.jsonl` returns about half of the open deferrals.

**Who is affected.** No shipped prompt or workflow passes `--status=OPEN`: `bkit-utility-update-deferrals`, `bkit-utility-update-failures`, `bkit-utility-update-roadmap`, `bkit-ship-deferred-sweep` and `bkit-audit-generate` all query with no `--status` and skip `CLOSED` rows themselves, which already counts a status-less row as open. The gap hits a person or agent that runs `bkit ledgers query --ledger=deferrals --status=OPEN` by hand (`.bkit/core/.bkit/cli.md` line 228 lists `query` as a by-hand verb), which is the natural way to ask "what is still open". `.bkit/core/.bkit/jsonl.md` § Read Idiom (line 24) already tells readers that decisions and knowledge "default to `ACTIVE`", but says nothing about the triaged kinds defaulting to `OPEN`.

**A third reader with its own copy of the rule.** `hasUnsharedFriction` in `.bkit/core/engine/checks/tips/detect.ts` (lines 264-277) reads `.bkit/friction.jsonl` and treats `r["status"] === undefined || r["status"] === "OPEN"` as open (line 273). That answer is right, but it is a hand-written copy of the default.

Once done, one exported function in `telemetry.ts` says which status a row has when it gives none: `OPEN` for a kind in `SEVERITY_KINDS`, `ACTIVE` for `decision` and `knowledge`, none for every other kind. The append default, the query filter and the tips check all call it, and `--status=OPEN` returns every open winner whether or not it carries the field.

### Success Criteria

- `queryLedger(raw, { status: "OPEN" })` returns a `friction`, `deferral` or `failure` fold winner that has no `status`.
- `queryLedger(raw, { status: "ACTIVE" })` still returns a `decision` or `knowledge` winner that has no `status`.
- A winner of any other kind with no `status` matches no `--status` value, as today.
- `bkit ledgers query --ledger=deferrals --status=OPEN` in a temp repo returns a status-less deferral winner, and its printed row is the row as stored (no `status` field added).
- `DEFAULT_ACTIVE_KINDS` no longer exists; `appendLedgerRows`, `queryLedger` and `hasUnsharedFriction` all take the default from one exported function in `telemetry.ts`.
- `appendLedgerRows` still writes `status: "OPEN"` on a new severity-kind row that gives none and keeps a given `status` (existing tests at `.bkit/core/engine/commands/workflow/ledgers.test.ts` lines 1426 and 1439 pass unchanged).

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
| Friction row with a free-text `status` (`jsonl.md` line 153 allows `string`) | Kept as given; matches only that exact text. |
| Filter `open` (lower case) | Matches nothing, as today: the filter is case-sensitive. |
| No `--status` given | Every winner returned, as today. |
| Status-less friction winner, `scope` not `consumer`, outside the bkit repo | `hasUnsharedFriction` still returns `true`. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| a friction, deferral or failure winner with no status matches the OPEN filter | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` |
| a status-less winner whose newer row is CLOSED does not match OPEN | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` |
| defaultStatus gives OPEN for severity kinds, ACTIVE for decision and knowledge, none otherwise | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` |
| query --status=OPEN returns a deferral winner that has no status, printed as stored | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| hasUnsharedFriction counts a friction winner with no status | Unit | `.bkit/core/engine/checks/tips/detect.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: One status default for append, query and tips

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Read a status-less row as its kind's default status
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: export `defaultStatus(kind: string): string | undefined` next to `SEVERITY_KINDS` (line 265), returning `"OPEN"` when `SEVERITY_KINDS.has(kind)`, `"ACTIVE"` for `decision` and `knowledge`, and `undefined` otherwise
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: `queryLedger` (line 2029) uses `e.status ?? defaultStatus(String(e.kind))`, and `DEFAULT_ACTIVE_KINDS` (line 1989) is deleted
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: the append default (lines 1798-1799) uses `defaultStatus` and fills it only when the result is `"OPEN"`, so `decision` and `knowledge` rows keep no written status
  - **UPDATE:** `.bkit/core/engine/checks/tips/detect.ts`: `hasUnsharedFriction` (line 273) compares `(r["status"] ?? defaultStatus("friction")) === "OPEN"`
  - **READ:** `validate` in `telemetry.ts` (lines 1634-1650): its comment says absent means `ACTIVE` on the decision and knowledge lifecycle; it reads no default and stays unchanged
  - **READ:** `ledgerKeys` in `.bkit/core/engine/commands/workflow/steps.ts` (line 1772) calls `queryLedger` with no filter, so it is unaffected
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/ledgers/telemetry.test.ts .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/checks/tips/detect.test.ts` passes, the append-status tests at `ledgers.test.ts` lines 1426 and 1439 still pass, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `a friction, deferral or failure winner with no status matches the OPEN filter` (inside `describe("queryLedger — canonical winners before filtering")`, line 3068) fails on an empty `rows`. It builds one status-less winner of each severity kind plus one `OPEN` one, and expects `queryLedger(raw, { status: "OPEN" })` to return all four keys.
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `a status-less winner whose newer row is CLOSED does not match OPEN` passes before and after (a guard). It writes a status-less deferral then a same-`key` `CLOSED` row, and expects no row for `OPEN` and one for `CLOSED`.
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `defaultStatus gives OPEN for severity kinds, ACTIVE for decision and knowledge, none otherwise` fails on the missing export. It checks `friction`, `deferral`, `failure`, `decision`, `knowledge` and `feature`.
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `query --status=OPEN returns a deferral winner that has no status, printed as stored` (inside `describe("bkit ledgers query")`, line 2222) fails on an empty page. It writes one status-less deferral line straight into `docs/deferrals.jsonl`, runs `query --ledger=deferrals --status=OPEN`, and expects that key in the rows with no `status` property.
    - `.bkit/core/engine/checks/tips/detect.test.ts` `hasUnsharedFriction counts a friction winner with no status` passes before and after (a guard for the refactor). It writes a non-bkit `package.json` and one status-less `friction` row with `scope: "universal"` into the temp `cwd`, and expects `true`.
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Say that a status-less row of a triaged kind reads as `OPEN`
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md` § Read Idiom, **Filters** (line 24): a row with no `status` reads as `OPEN` on `friction` / `deferral` / `failure` and as `ACTIVE` on `decision` / `knowledge`, so `bkit ledgers query --status=` finds it
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md` § Updating a Row (line 347): after the append default, one sentence that `bkit ledgers query` reads a status-less row of those kinds as `OPEN`
  - **UPDATE:** `docs/testing.md` § Key test files: the `commands/workflow/ledgers.test.ts` row (line 835) adds `query --status=OPEN` returning a status-less winner
  - **DEPENDS ON:** 1
  - **DONE WHEN:** no line in those files says only `decision` / `knowledge` rows have a read default, and `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/jsonl.md`
  - **TEST FIRST:** n/a — docs only
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumption: the query prints each row as stored and only the filter uses the default. Filling `status` into the printed row would change what `bkit ledgers query` returns for rows no filter asked about, and every current caller already reads a missing `status` as "not `CLOSED`".
- Assumption: no migration. Rewriting the 93 status-less winners would mean editing append-only ledgers in every consumer repo; reading them right is enough, and new rows already carry a status. `bkit ledgers compact` keeps a winner's fields as they are, so it neither fixes nor breaks this.
- Assumption: the append keeps writing a status only for the severity kinds. Writing `ACTIVE` on new `decision` and `knowledge` rows would be a separate change to what rows hold.

Removes: `DEFAULT_ACTIVE_KINDS` in `.bkit/core/engine/ledgers/telemetry.ts`, the second list of which kinds have a status default, and the hand-written `status === undefined || status === "OPEN"` test in `hasUnsharedFriction`, so the append, the query and the tips check share one definition (`defaultStatus`) instead of three.

### Breaking Changes & Naming

`bkit ledgers query --status=OPEN` returns more rows on a ledger that holds status-less severity-kind winners (179 instead of 95 on this repo's `docs/deferrals.jsonl`). The output shape is unchanged. `defaultStatus` becomes an export of `.bkit/core/engine/ledgers/telemetry.ts`. No new flag, field or file.

### Out of Scope

- Changing the `--status` help text (`ledgers.ts` line 1009, rendered into `.bkit/core/.bkit/cli.md` line 228); "e.g. ACTIVE" stays true.
- Case-insensitive status matching.
- Adding a `status` to old rows on disk.
- Switching the five prompts that skip `CLOSED` rows themselves to `--status=OPEN`: they also need `TRIAGED` rows, which `OPEN` alone does not return.

### References

- #1020 — Two small check gaps: ledger row schema, a bkit-only command, https://github.com/cbartens/bkit/issues/1020
- Commit `5d908d631` (append writes `status: "OPEN"` on severity-kind rows that give none)
- `.bkit/core/engine/ledgers/telemetry.ts` (`SEVERITY_KINDS` line 265, `DEFAULT_ACTIVE_KINDS` line 1989, `queryLedger` line 1996)
- `.bkit/core/engine/commands/workflow/ledgers.ts` (`appendLedgerRows` line 1682, default at lines 1798-1799, `query` verb line 996)
- `.bkit/core/engine/checks/tips/detect.ts` (`hasUnsharedFriction` line 264)
- `.bkit/core/.bkit/jsonl.md` § Read Idiom and § Updating a Row
- `docs/testing.md` § Key test files
