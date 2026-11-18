# Ledger commit and outbox files refuse bad paths and stay owner-only Implementation Plan

## Context & Goals

Issue #1035 (follow-up of #992). `bkit ledgers commit`, `bkit ledgers only-bookkeeping` and (added by the orchestrator's latest issue comment) `bkit decisions pending` pass `--month` / `--fid` to a git pathspec or a folder path unchecked, so a `--fid=../../../..` widens the bookkeeping allow-list to the whole tree. The invocation folder is created `0755`, a correction-events file made by an older bkit keeps `0644`, and a tracked `*.bkit-lock` that was deleted is never committed as deleted. Goal: one shared check for the `--month` / `--fid` flags in all three handlers, owner-only outbox files and folders, the lock deletion committed, the docs and the `CLOSED` deferral row.

**Related Issues:**

- #1035 — Ledger commit and outbox files refuse bad paths and stay owner-only (open)
- #992 — Ledger commands: six hardening gaps from the 860 review (follow-up of)

---

## 👤 ⚠️ Acceptance Scenario

### Narrative

`bkit ledgers commit`, `bkit ledgers only-bookkeeping` and `bkit decisions pending` refuse a `--month` that is not six digits and a `--fid` that is not a lowercase slug before git or the file system is touched. The invocation folder is `0700`, a correction-events file is `0600` after every write, and a bookkeeping commit stages the deletion of a tracked `*.bkit-lock`.

### Success Criteria

- `commit` and `only-bookkeeping` exit 2 naming the flag when `--month` is not `/^[0-9]{6}$/` or `--fid` does not match `FID_PATTERNS.none`, and stage, commit or diff nothing.
- `decisions pending` exits 2 on a `--fid` that does not match `FID_PATTERNS.none`, through the same helper.
- `writeInvocation` leaves `invocation-context/` at `0700`, whether it created the folder or found it.
- After `correctionBook` runs, `<id>.corrections.jsonl` is `0600`, whether it created the file or found it.
- `commitBookkeeping` stages the deletion of a tracked `*.bkit-lock` under the allow-list and still never stages an untracked or changed one; the deferral `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273` has a `CLOSED` row.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `--fid=../../../..` on `commit` | Exit 2 naming `--fid`; HEAD and the index unchanged. |
| `--fid=*` or `--month=*` on `only-bookkeeping` | Exit 2 naming the flag; no `onlyBookkeeping` verdict printed. |
| `--month=2026-11` or `--month=20261` | Exit 2 naming `--month`. |
| `--fid=446l` or `--fid=992-ledger-commands-six` | Accepted, as today. |
| `--fid=ENG-12-x` (uppercase) | Exit 2: every tracker's FID is lowercase. |
| `bkit decisions pending --fid=../../202610/logs/other-run` | Exit 2 naming `--fid`; no decision file read and no deferral row written. |
| Internal callers that pass `"*"` on purpose (`minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts`, the bookkeeping-push check) | Unchanged: the check sits in the three CLI handlers, not in `bookPathspecs`. |
| `invocation-context/` already exists at `0755` | Set to `0700` on the next `writeInvocation`. |
| `bkit-outbox/` does not exist yet | Created by `privateDir`; `invocation-context/` ends `0700`. |
| `<id>.corrections.jsonl` already exists at `0644` | Set to `0600` by `correctionBook`; its rows kept. |
| A run-scoped invocation (`scope === "run"`) | No corrections file is created; the status file is untouched. |
| Tracked lock deleted, and `*.bkit-lock` is in `.gitignore` | Deletion staged and committed; the ignore rule does not block it. |
| Tracked lock still present and changed | Not staged, as today. |
| Untracked leftover lock | Not staged, as today (existing test). |
| Tracked lock deleted outside the allow-list | Not staged: only paths under `bookPathspecs` are listed. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a --fid that climbs out of the log folder is refused and commits nothing | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| a --month that is not six digits is refused and commits nothing | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| pending refuses a --fid that climbs out of the log folder and reads and writes nothing | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 3 |
| writeInvocation creates invocation-context owner-only | Unit | `.bkit/core/engine/commands/lib.test.ts` | 4 |
| writeInvocation narrows an existing invocation-context to 0700 | Unit | `.bkit/core/engine/commands/lib.test.ts` | 4 |
| a correction-events file left at 0644 is 0600 after a corrected append | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 5 |
| a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |
| checkOnlyBookkeeping refuses a climbing fid from any caller | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 8 |
| commitBookkeeping refuses a climbing fid from any caller | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 8 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

`bkit ledgers commit`, `bkit ledgers only-bookkeeping` and `bkit decisions pending` now exit 2 on a `--month` that is not `YYYYMM` or a `--fid` that is not a lowercase slug (`pending` already checked `--month`); every workflow passes values that already match. `privateDir` becomes an export of `.bkit/core/engine/ledgers/status.ts`. No new flag, field or file.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

- **Assumption:** `FID_PATTERNS.none` is the right `--fid` check, because it accepts every FID shape the `github`, `linear` and `jira` patterns mint and every existing log folder → a consumer with a hand-made uppercase or dotted FID would be refused.
- **Assumption:** The check sits only in the three CLI handlers, because `bookPathspecs` must keep accepting `"*"`. The other internal callers of `commitBookkeeping` and `checkOnlyBookkeeping` were not each traced (out of scope) → one of them could pass a value the new handler check never sees; that is unchanged from today.
- **Assumption:** `chmodSync` after create is enough; no migration. The files live in `.git/`, outside installs and upgrades → an older file stays wide until the next write.
- **Assumption:** `decisions pending` is in scope although the issue body lists it as out of scope; the orchestrator's issue comment and run instructions bring it in, through the same helper → if wrong, drop TASK 2 and its matrix row.
- **Note (not a question for this build):** the rollback question about `97359934d` in the issue is the owner's. No task depends on it, and no decision row is written for it.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Checking `--fid` in other verbs that take one (beyond `decisions pending`) | The issue limits the check to the three handlers | A follow-up proposal |
| Narrowing `bkit-outbox/` itself or any other outbox folder | Only `invocation-context/` is named | A follow-up proposal |
| Reclaiming a stale `*.bkit-lock` in `withTargetLock` | Only the deletion commit is named | A follow-up proposal |
| Any change to the replay code or to what a receipt stores; the rollback question | Owner's decision | `docs/decisions.jsonl`, by the owner |
| Any edit to `.bkit/instructions.md`, `.bkit/core/workflows/`, `.bkit/core/prompts/`, `steps.ts`, `branches.ts`, `step-base.ts`, `tests-changed.ts`, `package.json`, `scripts/gate/` | Run instructions: no workflow or prompt text changes | Other builds |

## Security & Privacy

- [ ] **User Input** — `--month` and `--fid` are validated against a pattern in the handler before they reach a git pathspec or a folder path.
- [ ] **Local file permissions** — `invocation-context/` is `0700`, `<id>.corrections.jsonl` is `0600`.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes | `docs/architecture.md` § Package Boundaries (ledgers and commands layout) | covered | None. No component or topology change. |
| technology | `docs/technology.md` | yes | `docs/technology.md` § Runtime & Language, § Testing | covered | None. |
| security | `docs/security.md` | yes | `docs/security.md` § Workflow comment ownership (line 66) | covered | TASK 6 updates the line: the invocation folder is owner-only as well as its files. |
| testing | `docs/testing.md` | yes | `docs/testing.md` § Test first, § Key test files (rows for `commands/lib.test.ts`, `commands/workflow/ledgers.test.ts`, `commands/workflow/decisions.test.ts`) | covered | TASK 6 updates the three rows. |
| observability | `docs/observability.md` | yes | `docs/observability.md` § Bookkeeping effects and receipts | covered | TASK 6 names the `0700` folder and the `0600` corrections file. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | None. |
| design | `docs/design.md` | no — no UI | none | none | None. |
| deployments | `docs/deployments.md` | no — no release or CI change | none | none | None. |
| noise | `docs/noise.md` | no — no signal downgrade | none | none | None. |
| setup | `docs/setup.md` | no — no local setup change | none | none | None. |

## Documentation Warnings

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| One check for the `--month` / `--fid` flags, used by three handlers | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n 'function required\|FID_PATTERNS\|MONTH_FLAG\|FID_FLAG' .bkit/core/engine/commands/workflow/ledgers.ts`; read `.bkit/core/engine/commands/workflow/fids.ts:47`; `grep -n 'must be YYYYMM' .bkit/core/engine/commands/workflow/decisions.ts` | `required` in `ledgers.ts` (non-empty check only); `FID_PATTERNS` in `fids.ts`; the inline `/^[0-9]{6}$/` check in `decisions.ts` `pending` | EXTEND | Add one exported helper next to `required` that wraps it with the two shape checks; `commit`, `onlyBookkeeping` and `decisions pending` call it, and the inline `--month` check in `pending` is replaced by it. |
| `decisions pending` checks `--fid` | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -n 'ctx.flags.fid\|ledgers.js' .bkit/core/engine/commands/workflow/decisions.ts`; `grep -n 'import.*ledgers.js' .bkit/core/engine/commands/workflow/*.ts` | `decisions.ts` already imports `appendLedgerRows` from `./ledgers.js` | EXTEND | Import the helper from the same module; no second way to check a FID flag. |
| Commit the deletion of a tracked `*.bkit-lock` | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n 'bkit-lock' .bkit/core/engine/commands/workflow/ledgers.ts`; read `commitBookkeeping` | `commitBookkeeping` lists files with `git ls-files --cached --others --exclude-standard` minus the lock exclude | EXTEND | Add a `git ls-files -z --deleted` listing filtered to `.bkit-lock` after the existing listing; the existing `git add --pathspec-from-file` stages it. |
| Owner-only `invocation-context/` | `.bkit/core/engine/ledgers/status.ts` | `grep -n 'privateDir' .bkit/core/engine/ledgers/status.ts`; `grep -n 'mkdirSync' .bkit/core/engine/commands/lib.ts` | `privateDir` in `status.ts` (mkdir `0700`, not exported, no chmod); bare `fs.mkdirSync` in `writeInvocation` | EXTEND | Export `privateDir`, add `chmodSync(0o700)` after `mkdirSync`; `writeInvocation` calls it and the bare `mkdirSync` is removed. |
| Corrections file kept `0600` | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n 'appendFileSync(file, ""' .bkit/core/engine/commands/workflow/ledgers.ts`; read `correctionBook` | `correctionBook` creates the file with `mode: 0o600` (applies only on create) | EXTEND | Add `fs.chmodSync(file, 0o600)` after the create call. |
| `invocation-context/` mode tests | `.bkit/core/engine/commands/lib.test.ts` | `grep -n 'writeInvocation\|invocationDir' .bkit/core/engine/commands/lib.test.ts` | `describe("explicit invocation context")` in `lib.test.ts` | EXTEND | New cases in the same file. |
| `pending` refusal test | `.bkit/core/engine/commands/workflow/decisions.test.ts` | `grep -n 'decisions pending' .bkit/core/engine/commands/workflow/decisions.test.ts` | `describe("bkit decisions apply --by=owner and pending")` with a `pending` helper | EXTEND | New case beside the existing `pending` cases. |
| Docs for the new refusals and modes | `docs/security.md` | `grep -n 'invocation' docs/security.md docs/observability.md`; `grep -n 'bkit-lock' .bkit/core/.bkit/workflows.md` | Existing sentences in `docs/security.md` line 66, `docs/observability.md` § Bookkeeping effects and receipts, `docs/testing.md` Key test files rows | EXTEND | Edit those sentences and rows in place; no new doc. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/security.md` | § Workflow comment ownership: the invocation folder is owner-only (`0700`) as well as its files. |
| `docs/observability.md` | § Bookkeeping effects and receipts: `invocation-context/` is a `0700` folder and `<id>.corrections.jsonl` is `0600`. |
| `docs/testing.md` | § Key test files: the `commands/workflow/ledgers.test.ts`, `commands/lib.test.ts` and `commands/workflow/decisions.test.ts` rows. |
| `.bkit/core/.bkit/workflows.md` | Only the bookkeeping-pathspec bullet at line 147. |
| `docs/deferrals.jsonl` | One `CLOSED` row for the key `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273`. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database. |
| **Code** | `git revert` the build's commits | Code-only. An older bkit narrows nothing and refuses nothing extra; the rollback-past-`97359934d` replay question is the owner's and is not settled here. |
| **Risk window** | None | No migration. |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Bookkeeping commands refuse bad paths and commit lock deletions

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Refuse a `--month` or `--fid` that is not a plain folder name in `ledgers commit` and `ledgers only-bookkeeping`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: one exported helper next to `required` that returns `--month` and `--fid` after checking `--month` against `/^[0-9]{6}$/` and `--fid` against `FID_PATTERNS.none` from `./fids.js`, and throws `CommandError(EXIT.USAGE, ...)` naming the flag and the expected shape
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: the `commit` handler (`month: required(ctx, "month")`, `fid: required(ctx, "fid")`) and `onlyBookkeeping` (`const month = required(ctx, "month")`, `const fid = required(ctx, "fid")`) read the two flags through that helper, which removes the unchecked reads
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: `MONTH_FLAG` and `FID_FLAG` `help` text names the shapes
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the three new cases, in `describe("bkit ledgers commit (tests/book-commit.bats)")` and `describe("bkit ledgers only-bookkeeping")`
  - **READ:** `bookPathspecs` in `.bkit/core/engine/commands/workflow/ledgers.ts`: stays unchecked, because `minPushPathspecs` and the bookkeeping-push check in `.bkit/core/engine/commands/ci/ci.ts` pass `"*"` on purpose
  - **READ:** `.bkit/core/engine/commands/workflow/fids.ts`: `fids.ts` imports `locks.ts`, which imports `ledgers.ts`, so importing `FID_PATTERNS` into `ledgers.ts` forms a module cycle; use `FID_PATTERNS` only inside the helper at call time, never at module load, and confirm `pnpm build` and the tests load cleanly
  - **READ:** `docs/security.md`: § Workflow comment ownership, the input-validation boundary
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts` passes with every existing `commit` and `only-bookkeeping` case, `commit` and `onlyBookkeeping` no longer call `required(ctx, "month")` / `required(ctx, "fid")`, `FID_PATTERNS` is not used at module top level, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a --fid that climbs out of the log folder is refused and commits nothing` fails on exit 0 and "src/app.ts" being in `git show --name-only HEAD`: the test commits a ledger, adds an untracked `src/app.ts`, runs `commit --month=202608 --fid=../../../.. --scope=core --mode=commit`, and expects exit 2, the error naming `--fid`, and HEAD unchanged
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a --month that is not six digits is refused and commits nothing` fails on exit 0: it runs `commit --month=* --fid=446-book` and expects exit 2 naming `--month` and HEAD unchanged
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change` fails on exit 0 with "onlyBookkeeping" being true: it changes `src/a.ts` between `from` and `to`, runs the check with `--fid=../../../..`, and expects exit 2 naming `--fid`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Check `--fid` in `bkit decisions pending` through the same helper
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: the `pending` handler replaces its inline `--month` check (`/^[0-9]{6}$/`, "--month must be YYYYMM") and the unchecked `String(ctx.flags.fid)` with the TASK 1 helper imported from `./ledgers.js`, so no second way to check a FID flag exists
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the new case in `describe("bkit decisions apply --by=owner and pending")`
  - **READ:** `.bkit/core/engine/commands/workflow/ledgers.ts`: the exported helper from TASK 1 and its error message
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/decisions.test.ts` passes with every existing `pending` case, `decisions.ts` holds no inline `/^[0-9]{6}$/` check, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `pending refuses a --fid that climbs out of the log folder and reads and writes nothing` fails on exit 0 with the other run's decision item listed: it puts a `build-decision-1-1.md` with an assumed item in a sibling run's log folder, runs `decisions pending --fid=../other-run --month=202610 --defer`, and expects exit 2 naming `--fid`, no items and no deferral row written

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Commit the deletion of a tracked lock file
  - **UPDATE:** `commitBookkeeping` in `.bkit/core/engine/commands/workflow/ledgers.ts`: after the `listed` call, run `git ls-files -z --deleted -- <specs>` and add each listed path ending in `.bkit-lock` to `paths`, so the existing `git add --pathspec-from-file` stages its removal
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the new case next to `a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts` passes, the leftover-lock test still passes, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit` fails on `git ls-files -- '*.bkit-lock'` still listing "docs/plans/202608/logs/446l/status.jsonl.bkit-lock" after the commit: the test commits `status.jsonl` and `status.jsonl.bkit-lock` with `commitAll`, deletes the lock file, appends a row to `status.jsonl`, runs `commit --month=202608 --fid=446l --scope=core --mode=commit`, and expects exit 0, the lock path listed with status `D` in `git show --name-status --format= HEAD`, and `git ls-files -- '*.bkit-lock'` empty

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Outbox files stay owner-only

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Make `invocation-context/` owner-only
  - **UPDATE:** `privateDir` in `.bkit/core/engine/ledgers/status.ts`: exported, and runs `chmodSync` on the file's parent folder to `0o700` after `mkdirSync`, so a folder that already existed is narrowed too
  - **UPDATE:** `writeInvocation` in `.bkit/core/engine/commands/lib.ts`: replaces `fs.mkdirSync(dir, { recursive: true })` with `privateDir(file)`, which removes the bare mkdir
  - **UPDATE:** `.bkit/core/engine/commands/lib.test.ts`: the two new cases, with the `writeInvocation` and `invocationDir` imports
  - **READ:** `ledgerOperationsFile` in `.bkit/core/engine/ledgers/status.ts`: it and the two appends there already call `privateDir`; the added `chmodSync` leaves their behaviour on a folder they created unchanged
  - **READ:** `docs/testing.md`: § Key test files, the `commands/lib.test.ts` row
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/lib.test.ts .bkit/core/engine/ledgers/journal.integration.test.ts` passes, `writeInvocation` holds no `fs.mkdirSync`, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/lib.test.ts` `writeInvocation creates invocation-context owner-only` fails on `fs.statSync(invocationDir(r)).mode & 0o777` being "0o755": it calls `writeInvocation` in a temp git repo and expects `0o700`
    - `.bkit/core/engine/commands/lib.test.ts` `writeInvocation narrows an existing invocation-context to 0700` fails on the mode staying "0o755": it creates the folder with mode `0o755` first, calls `writeInvocation`, and expects `0o700`

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Keep a correction-events file `0600` when it already exists
  - **UPDATE:** `correctionBook` in `.bkit/core/engine/commands/workflow/ledgers.ts`: after `fs.appendFileSync(file, "", { mode: 0o600 })`, `fs.chmodSync(file, 0o600)`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the new case in `describe("bkit ledgers append --invocation")`, next to `the correction-events file has mode 0600`
  - **READ:** `append` in `.bkit/core/engine/commands/workflow/ledgers.ts`: its later appends to the corrections file run after `correctionBook` in the same call, so they need no change
  - **READ:** `spendCorrection` in `.bkit/core/engine/commands/workflow/counters.ts`: it also appends after `correctionBook` in the same call, so it needs no change
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts` passes, `the correction-events file has mode 0600` still passes, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a correction-events file left at 0644 is 0600 after a corrected append` fails on the mode staying "0o644": it issues a standalone invocation, writes `.git/bkit-outbox/invocation-context/<id>.corrections.jsonl` with `chmodSync(..., 0o644)`, runs the refused append and the `--correction-of` retry, and expects mode `0o600` and the retry's `correction.used` = 1

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Docs and ledgers

<!-- bkit:task 6 start -->

- [x] **TASK 6:** Say what the commands refuse and which folders are owner-only, and close the deferral
  - **UPDATE:** `docs/security.md`: § Workflow comment ownership, the invocation folder is owner-only (`0700`) as well as its files
  - **UPDATE:** `docs/observability.md`: § Bookkeeping effects and receipts, `invocation-context/` is a `0700` folder and `<id>.corrections.jsonl` is `0600`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: only the bookkeeping-pathspec bullet at line 147 (`Host skill mirrors are in the --scope=full bookkeeping pathspec`): add that a tracked `*.bkit-lock` that was deleted is staged as a deletion, and an untracked or changed one never is
  - **UPDATE:** `docs/testing.md`: § Key test files, the `commands/workflow/ledgers.test.ts` row adds the `--month` / `--fid` refusal and the lock-deletion case, the `commands/lib.test.ts` row adds the folder mode, and the `commands/workflow/decisions.test.ts` row adds the `pending` `--fid` refusal
  - **UPDATE:** `docs/deferrals.jsonl`: one `CLOSED` row for key `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273`, written with `bkit ledgers append --ledger=deferrals`
  - **READ:** `.bkit/core/.bkit/jsonl.md`: § Write Idiom, for the row
  - **DEPENDS ON:** 1, 2, 3, 4, 5
  - **DONE WHEN:** the four docs and the workflows source carry the edits above, `docs/deferrals.jsonl` has a `CLOSED` row for that key, and `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/workflows.md` with no other change to it
  - **TEST FIRST:** n/a — docs and ledger rows only, no behaviour change

<!-- bkit:task 6 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 1 findings

<!-- bkit:task 7 start -->

- [x] **TASK 7:** An in-place run on dev whose tracked lock was dirty when the run started and is deleted during it now stops its bookkeeping commit with exit 10
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1322` · **Round:** 1
  - **DONE WHEN:** `commitBookkeeping` adds a deleted tracked `*.bkit-lock` to `paths` only when the run's record does not hold that path (or adds it after the `rec` filtering, never into the `among` list handed to `ownSet`), so the scenario commits the run's own rows with exit 0 and leaves the recorded lock uncommitted, as the base commit `47d0fd4ee` did.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit` fails on exit 10 ("refusing to commit: ...status.jsonl.bkit-lock changed during the run but was already modified before it started"): in the describe for a run in place on dev that shares its checkout, commit `${LOGS}/status.jsonl` and an empty `${LOGS}/status.jsonl.bkit-lock` on `dev`, write `{"pid":1}` to the lock, call `writeRecord(r, newRecord(r, FID, "dev"))`, delete the lock, append a row to `status.jsonl`, run `commit --month=202610 --fid=650-shared --scope=core --mode=commit --message=x`, and expect exit 0, `status.jsonl` in `git show --name-only --format= HEAD` and the lock not in it.

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [x] **TASK 8:** A climbing `--fid=../../../..` passed to `bkit runs gate --validated`, `bkit runs revalidate` or `bkit workflows handover --push|--flush` still makes the merge gate treat a source change as bookkeeping-only, or sweeps the whole tree into a commit pushed to `dev`, because the new check guards three handlers and not the `checkOnlyBookkeeping` / `commitBookkeeping` sinks
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:2380` · **Round:** 1
  - **DONE WHEN:** Direction (option (a), decision 2): `commitBookkeeping` (`.bkit/core/engine/commands/workflow/ledgers.ts:1205`) and `checkOnlyBookkeeping` (`ledgers.ts:2380`) each run the shape check `monthAndFid` already holds before they touch git or build a pathspec, so every caller (`runs.ts`, `workflows.ts`, `branches.ts`, `ci.ts`, and the `ledgers` handlers) is covered from one place.
    - Reuse `monthAndFid`'s six-digit and `FID_PATTERNS.none` checks: split out the part that checks a `{ month, fid }` pair and call it from `monthAndFid` and from both functions. Add no second pattern and no second helper.
    - The only exemption is `month` = `*`, which the CI hook passes to `checkOnlyBookkeeping` (`.bkit/core/engine/commands/ci/ci.ts:828`). A `*` FID or any other month is refused.
    - A refused call throws `CommandError` with exit 2, its message names the bad value, and nothing is written: no commit, no index change, no ledger row.
    - Where a `ledgers` handler this build changed now gets the same refusal from the shared function, remove its own `monthAndFid` call. Keep a per-handler call only where the handler builds a path from `--month` or `--fid` before it reaches the shared function.
    - `monthAndFid`'s comment states what is true after the change.
    - The existing tests in `runs.test.ts`, `workflows.test.ts`, `branches.test.ts`, `ci.test.ts` and `ledgers.test.ts` still pass, including the issue-less FID cases.
    - The footprint stays `ledgers.ts`, `ledgers.test.ts`, `dist/` and any doc line that describes the check. If a caller's source file needs an edit, stop and report why instead of editing it.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `checkOnlyBookkeeping refuses a climbing fid from any caller` fails on `{ kind: "ok" }` being returned: it commits a base, commits a change to `src/a.ts`, calls `checkOnlyBookkeeping(r, { month: "202610", fid: "../../../..", from, to })` directly and expects a `CommandError` with code 2 whose message contains `../../../..`
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `commitBookkeeping refuses a climbing fid from any caller` fails on `src/app.ts` being committed: it commits `docs/plans/202608/logs/446-book/status.jsonl`, adds an untracked `src/app.ts`, calls `commitBookkeeping({ root: r, month: "202608", fid: "../../../..", scope: "core", mode: "commit", message: "climb" }, () => {})` directly and expects a `CommandError` with code 2 whose message contains `../../../..`, HEAD unchanged and nothing staged

<!-- bkit:task 8 end -->
<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** errors are logged and traced as `docs/observability.md` describes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.
