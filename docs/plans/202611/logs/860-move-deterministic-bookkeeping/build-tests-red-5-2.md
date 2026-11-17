Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 5, attempt 2

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 13 | `.bkit/core/engine/commands/workflow/steps.test.ts` "audit result render keeps an existing anchored report intact" | passed-accepted | passes; accepted by the tests step: the group 5 code is already built, so the corrected test passes at re-record |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 21.5 on 10 cores: unit limits 15250ms per test, 30500ms per hook (x3.05)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (122 tests) 46921ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 652ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 457ms
     ✓ done --group writes group on the row 454ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 690ms
     ✓ carries extra fields, parsed as JSON when they are JSON 344ms
     ✓ needs a message unless --commit=none 359ms
     ✓ reports a failed commit with exit 8 without writing the row 1349ms
     ✓ a failed commit leaves no row staged in the index 527ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 796ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 705ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 847ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 635ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 964ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 361ms
     ✓ --ref reads the status file as committed on that ref, not from disk 654ms
     ✓ --ref exits 3 when the ref does not carry the status file 503ms
     ✓ fails on a placeholder left in the artifact 601ms
     ✓ fails when the row's verdict differs from the artifact's 568ms
     ✓ fails when the row does not list the artifact, or carries another attempt 386ms
     ✓ fails on a missing artifact 381ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 415ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 559ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 593ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 439ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 384ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 552ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 901ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 760ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 819ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1310ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 652ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 323ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 386ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 652ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 503ms
     ✓ --attempt-of checks the row carries the derived counter 382ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1087ms
     ✓ writeStepRow refuses when a recorded path changed 1188ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 588ms
     ✓ writeStepRow appends its commit sha to the record 936ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1196ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 412ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 761ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 649ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 457ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1124ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 827ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 662ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 431ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1021ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 553ms
     ✓ does not count an artifact the run found committed when it started 575ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 349ms
     ✓ commits a package.json change outside bkit.workflows 486ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 992ms

 Test Files  1 passed (1)
      Tests  122 passed (122)
   Start at  09:40:15
   Duration  48.35s (tests 97%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-A1vEX0/junit.xml
```
