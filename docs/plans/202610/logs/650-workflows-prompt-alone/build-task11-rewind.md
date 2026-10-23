# Build — Task 11 rewind (test-first redo)

Base `a3a33172` (pre-feature), build `3bc75387`; engine at HEAD `6ec0992a` == `3bc75387`. Line numbers marked "before" are at `3bc75387`. Working tree only; nothing staged or committed.

## Files changed

<!-- prettier-ignore -->
| File | Removed (before lines) | Result vs `a3a33172` |
| --- | --- | --- |
| `.bkit/core/engine/commands/workflow/ledgers.ts` | `parseJson` import (L16–23 block); `gitRaw` `env` / `input` params (L94–110); whole Task 11 section L168–531: `EXIT_FOREIGN_PATH` (L180), `RECORD_DIR` / `RECORD_FID` (L202–203), `topOf` (L206), `recordPathOf` (L212), `recordFile` (L217), `asRecord` (L220), `readRecord` (L247), `listRecords` (L262), `writeRecord` (L272), `removeRecord` (L280), `activeRecord` (L288), `appendRecordCommit` (L312), `dirtyPaths` (L319), `hashOf` (L327), `rowsOf` (L336), `rowsHeadLacks` (L339), `newRecord` (L345), `OwnSet` (L366), `ownSet` (L379), `commitOwnSet` (L429), `ownPathCommit` (L517); `recordOnBranch` body (L300–310) → stub; `ledgers commit` exit code `EXIT_FOREIGN_PATH` entry (L600–601); `commitBookkeeping` record wiring: `activeRecord` + `:(exclude,literal)` pathspecs (L704–708), own-set filter + `ledgerRows` (L728–735, L748), `commitOwnSet` branch (L762–774), `appendRecordCommit` after commit (L811–813) | Only added: section `Shared-checkout record` holding types `RecordedPath`, `SharedCheckoutRecord`, `OwnCommit`, stub `recordOnBranch`, and the untouched Task 12 `markRecordPushed` / Task 13 `retriggerCommit` |
| `.bkit/core/engine/commands/workflow/steps.ts` | ledgers import (L38); `fidOfStatusFile` (L349–354); `writeStepRow` record branch (L413–430); `StepRow.commit` doc tail (L370); `EXIT_FOREIGN_PATH` exit-code entries in `steps done` (L969–970) and `steps finish` (L1173–1174) | Only Task 3 (`--issue`, `fidProblem`) remains |
| `.bkit/core/engine/commands/workflow/worktrees.ts` | imports `lastRun` (L20), ledgers record helpers (L36), `workflowLockLive` (L37), `readRuns` (L39); `EXIT_SHARED_BUSY = 13` (L54); `openSharedRecord` (L119–144); output fields `startSha` / `aheadAtStart` (L438–441); `EXIT_SHARED_BUSY` exit code (L454–455); setup call `const shared = … openSharedRecord(…)` (L561–566); emitted `startSha` / `aheadAtStart` (L638–640) | Only Task 5 remains (ship refusal text, missing feat branch, main refused in place) |
| `.bkit/core/engine/commands/workflow/locks.ts` | `removeRecord` import (L34); `workflowLockLive` (L194–200); release summary record clause (L322–323); `removeRecord` after release (L361–362) | Identical to `a3a33172` |
| `.bkit/core/engine/commands/workflow/workflows.ts` | ledgers imports `activeRecord` / `ownPathCommit` / `removeRecord` / `rowsHeadLacks` (L69–77); `carryOwnBook` `uncommitted` back to its inline HEAD-lines filter (L379); `handBack` `recorded` param + skip (L412–437); handover `rec` (L605), `recorded` set to `handBack` + `removeRecord` (L647–651); `closeWorkflow` doc (L871–872) and `ownPathCommit` branch (L1009–1019) | Only Task 12 `await pushBranch(...)` (L604) remains |
| `.bkit/core/engine/commands/workflow/runs.ts` | Task 2 `parsed.issueId === null` guard in `runContext` (L1862–1868); `EXIT_NO_FID` help back to the base text (L2255) | Tasks 12/13 code untouched |
| `.bkit/core/engine/commands/workflow/steps.test.ts` | ledgers import (L10); describe `bkit steps done — in-place run with a shared-checkout record` (L884–966) | Only Task 3 `--issue` block remains |
| `.bkit/core/engine/commands/workflow/ledgers.test.ts` | record-helper imports (L9–16); describe `bkit ledgers commit — in-place run with a shared-checkout record` (L726–792) | Identical to `a3a33172` |
| `.bkit/core/engine/commands/workflow/locks.test.ts` | ledgers import (L9); two release tests (L289–306) | Identical to `a3a33172` |
| `.bkit/core/engine/commands/workflow/worktrees.test.ts` | ledgers import (L13); describe `bkit worktrees setup — debug in place on dev (shared-checkout record)` (L201–322) | Only Task 5 tests remain |
| `.bkit/core/engine/commands/workflow/workflows.test.ts` | ledgers import (L10); describe `in place on dev with a shared-checkout record` (L729–770); handover test (L929–944) | Only Task 4 `close PR (dev refused the push)` remains |
| `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` | describe `a debug run in place on dev shares its checkout with foreign work` (L149–238) | Task 12 describe, fixture, helpers and `readRecord` import kept |
| `.bkit/core/engine/commands/workflow/runs.test.ts` | Task 2 test (L2001–2027) | Task 13 tests kept |

## Kept as stubs / kept shapes

<!-- prettier-ignore -->
| Symbol | Why kept | Now |
| --- | --- | --- |
| `recordOnBranch(cwd: string, branch: string): SharedCheckoutRecord \| null` | Task 12 `pushBranch` (every dev / main push) and Task 13 `ciDispatchGate` re-trigger call it unconditionally; a missing function would break pre-feature dev pushes | Stub, params `_cwd` / `_branch`, returns `null` (pre-feature: no record) |
| `interface SharedCheckoutRecord { fid; branch; startSha; originSha: string \| null; aheadAtStart: number; paths: RecordedPath[]; commits: string[]; pushed?: string[] }` | Named by Task 12 `pushOwnCommits` param and by the stub / Task 13 signatures | Unchanged shape |
| `interface RecordedPath { path: string; hash: string \| null; lines?: number }` | Field type of `SharedCheckoutRecord.paths` | Unchanged |
| `type OwnCommit = { ok: true; sha: string \| null } \| { ok: false; error: string }` | Return type of Task 13 `retriggerCommit` | Unchanged |

Redo note: the record parser (`asRecord`, removed) must keep reading the Task 12 `pushed` list.

## Removed exported symbols still referenced by Task 12 / Task 13 code

The redo must provide these with the same names and signatures.

<!-- prettier-ignore -->
| Symbol | Former signature (`3bc75387`) | Referenced at (current lines) |
| --- | --- | --- |
| `readRecord` | `(cwd: string, fid: string): SharedCheckoutRecord \| null` | `ledgers.ts:188` (Task 12 `markRecordPushed`); `runs.test.ts:22,1467`; `shared-checkout.integration.test.ts:16,182` |
| `writeRecord` | `(cwd: string, rec: SharedCheckoutRecord): void` (throws `EXIT_ROOT` when the FID cannot be placed) | `ledgers.ts:190` (`markRecordPushed`); `branches.test.ts:19,1134,1175,1247`; `runs.test.ts:22,1398` |
| `commitOwnSet` | `(cwd: string, set: OwnSet, message: string, o?: { allowEmpty?: boolean; skipIfEmpty?: boolean }): OwnCommit`, `OwnSet = { plain: string[]; ledgers: Array<{ path: string; text: string }> }` | `ledgers.ts:203` (Task 13 `retriggerCommit`, called with `{ plain: [], ledgers: [] }` + `{ allowEmpty: true }`: temp `GIT_INDEX_FILE` read from HEAD) |
| `appendRecordCommit` | `(cwd: string, fid: string, sha: string): void` | `ledgers.ts:204` (`retriggerCommit`); `branches.test.ts:19,1140,1180`; `runs.test.ts:22,1400` |
| `newRecord` | `(cwd: string, fid: string, branch: string): SharedCheckoutRecord` | `branches.test.ts:19,1134,1175,1247`; `runs.test.ts:22,1398` |
| `recordOnBranch` (stubbed) | `(cwd: string, branch: string): SharedCheckoutRecord \| null` — newest-written record whose `branch` matches, from the records under `$(git rev-parse --git-path bkit/shared-checkout)` | `branches.ts:39,606`; `runs.ts:50,436` |

Task 12 / 13 code that consumes the record but compiles today: `branches.ts:38–40` imports `markRecordPushed`, `recordOnBranch`, `type SharedCheckoutRecord`; `branches.ts:618` → `pushOwnCommits` (L693); `branches.ts:774` `markRecordPushed`; `runs.ts:443` `retriggerCommit`.

Shared-checkout integration tests (Task 12) also need Task 11 behaviour, not just helpers: `worktrees setup` writing the record, `steps done` / `workflows close` appending their SHAs.

## Tests removed

<!-- prettier-ignore -->
| File | Test (exact title) |
| --- | --- |
| `steps.test.ts` | `writeStepRow with a shared-checkout record never commits a recorded path` |
| `steps.test.ts` | `writeStepRow refuses when a recorded path changed` |
| `steps.test.ts` | `writeStepRow appends its commit sha to the record` |
| `steps.test.ts` | `a hook-refused own-path commit exits without staging a recorded path` |
| `steps.test.ts` | `without a record the commit is the whole tree, as before` (extra: Task 11 "no record → unchanged" pin) |
| `ledgers.test.ts` | `stageTrackedUpdates skips recorded paths` |
| `ledgers.test.ts` | `a recorded ledger commits only the rows the run appended` |
| `ledgers.test.ts` | `commitBookkeeping refuses when a recorded path changed` |
| `ledgers.test.ts` | `a commit appends its sha to the record; without a record nothing is recorded` (extra) |
| `ledgers.test.ts` | `rowsHeadLacks lists the working-copy rows HEAD does not have` (extra) |
| `worktrees.test.ts` | `in-place debug on dev writes the shared-checkout record` |
| `worktrees.test.ts` | `in-place debug on dev returns startSha and aheadAtStart` |
| `worktrees.test.ts` | `counts the commits local dev holds beyond origin/dev as aheadAtStart` (extra) |
| `worktrees.test.ts` | `a feature branch run writes no record and no start fields` (extra) |
| `worktrees.test.ts` | `a new run of the same FID rewrites startSha` |
| `worktrees.test.ts` | `a resume of the same FID reuses the record` |
| `worktrees.test.ts` | `setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock` |
| `worktrees.test.ts` | `a stale record without a lock is replaced` |
| `workflows.test.ts` | `close with a shared-checkout record never commits a recorded path` |
| `workflows.test.ts` | `record is present after workflows close and before the push` |
| `workflows.test.ts` | `close refuses with exit 10 when a recorded path changed` (extra) |
| `workflows.test.ts` | `failed handover from dev removes the record and keeps recorded paths` |
| `locks.test.ts` | `locks release removes the FID shared-checkout record` |
| `locks.test.ts` | `another owner's lock left in place keeps the record` (extra) |
| `shared-checkout.integration.test.ts` | `foreign staged and untracked files survive a run commit` |
| `shared-checkout.integration.test.ts` | `close commit tree excludes foreign files` |
| `shared-checkout.integration.test.ts` | `debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not` |
| `shared-checkout.integration.test.ts` | `a pre-dirty file changed during the run is refused with exit 10 and nothing is committed` (extra) |
| `runs.test.ts` | `runs context refuses an issue-less marker and branch naming the missing issue` (Task 2) |

All 20 Task 11 `Test first` titles are in this list; "(extra)" rows exercised only Task 11 behaviour.

## `npx vitest run` — touched + related files

Files: `steps`, `ledgers`, `worktrees`, `workflows`, `locks`, `runs`, `branches`, `fids`, `prs` `.test.ts`, `shared-checkout.integration.test.ts`, `commands/land.test.ts`, `audits/workflows/auto-fid-guard.test.ts`, `audits/workflows/close-squash.integration.test.ts`, `audits/templates/cloud-ctx-step.integration.test.ts` (unit + integration tiers).

Result: Test Files 3 failed | 11 passed (14); Tests 16 failed | 862 passed (878). Every failure is a Task 12 / 13 test:

<!-- prettier-ignore -->
| File | Failing test | Cause |
| --- | --- | --- |
| `branches.test.ts` | `push after a replay reports the pushToDev sha not HEAD` | `newRecord is not a function` |
| `branches.test.ts` | `replay build callback cherry-picks exactly the recorded SHAs` | same |
| `branches.test.ts` | `replay conflict exits non-zero naming the paths and removes the throwaway checkout` | same |
| `branches.test.ts` | `a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal` | same |
| `branches.test.ts` | `skip-ci HEAD on the replay is refused` | same |
| `branches.test.ts` | `a skip-ci foreign HEAD does not block a replay whose last run commit is clean` | same |
| `branches.test.ts` | `abort mode on dev with a record pushes only recorded SHAs` | same |
| `branches.test.ts` | `a level local dev is a plain push, recording nothing extra` | same |
| `branches.test.ts` | `a record with no commits pushes nothing` | same |
| `runs.test.ts` | `dispatch on dev with a pushed sha and no pr proves the run started` | `newRecord is not a function` (`devRepo` L1398) |
| `runs.test.ts` | `re-trigger on dev with a record pushes through the own-commit push` | same |
| `runs.test.ts` | `re-trigger on dev with a record never commits a foreign staged path` | same |
| `runs.test.ts` | `dispatch on dev with no pr and a record follows the landed sha through the re-trigger` | same |
| `shared-checkout.integration.test.ts` | `push from an ahead local dev lands only the run commits` | no record → plain push, `replayed` false |
| `shared-checkout.integration.test.ts` | `a foreign commit made mid-run never reaches the remote` | foreign commit on the remote |
| `shared-checkout.integration.test.ts` | `feature-mode push on dev with a record never pushes the foreign commit` | `replayed` false |

Passing with no record: `branches.test.ts` `without a record the dev push is unchanged and replayed is false`, `runs.test.ts` `re-trigger on dev without a record stays a plain commit and a plain push`, `shared-checkout.integration.test.ts` `push from a level local dev is a plain push`. `cloud-ctx-step.integration.test.ts` and `auto-fid-guard.test.ts` (Task 2 fail-closed pins) pass without the `runs context` guard. No other failure.

## `pnpm exec tsc --noEmit -p .`

4 errors, all in Task 12 / 13 helpers kept in `ledgers.ts`:

```
.bkit/core/engine/commands/workflow/ledgers.ts(188,15): error TS2304: Cannot find name 'readRecord'.
.bkit/core/engine/commands/workflow/ledgers.ts(190,3): error TS2304: Cannot find name 'writeRecord'.
.bkit/core/engine/commands/workflow/ledgers.ts(203,16): error TS2304: Cannot find name 'commitOwnSet'.
.bkit/core/engine/commands/workflow/ledgers.ts(204,37): error TS2304: Cannot find name 'appendRecordCommit'.
```

`tsc -p tsconfig.test.json` adds only the missing-export imports: `branches.test.ts(19)` `appendRecordCommit` / `newRecord` / `writeRecord`; `runs.test.ts(22)` `appendRecordCommit` / `newRecord` / `readRecord` / `writeRecord`; `shared-checkout.integration.test.ts(16)` `readRecord`.

## Confirmation grep

`git grep -n "bkit/shared-checkout" -- '.bkit/core/engine/commands/workflow/*.ts'` → no output (exit 1). The redo puts the literal back in `ledgers.ts` only.
