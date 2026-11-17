Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 3

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "derives supported header fields and rejects stale bodies without false PASS" | passed-accepted | passes; accepted by the tests step: red before the code step; passes now that the code landed, after two Fixable expectations were corrected to follow bkit-build-plan-verify.md |

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

[test-timeout-budget] load average 13.9 on 10 cores: unit limits 11450ms per test, 22900ms per hook (x2.29)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (121 tests) 37500ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 517ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 400ms
     ✓ done --group writes group on the row 317ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 557ms
     ✓ carries extra fields, parsed as JSON when they are JSON 359ms
     ✓ reports a failed commit with exit 8 without writing the row 716ms
     ✓ a failed commit leaves no row staged in the index 584ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 780ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 980ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 656ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 555ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 592ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 370ms
     ✓ --ref reads the status file as committed on that ref, not from disk 394ms
     ✓ --ref exits 3 when the ref does not carry the status file 382ms
     ✓ fails on a placeholder left in the artifact 402ms
     ✓ fails when the row's verdict differs from the artifact's 359ms
     ✓ fails when the row does not list the artifact, or carries another attempt 394ms
     ✓ fails on a missing artifact 481ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 390ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 347ms
     ✓ fails a run-tests row missing its scope, and an empty scope 518ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 481ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 453ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 368ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 630ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 764ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 608ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 661ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1076ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 348ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 423ms
     ✓ writeStepRow refuses when a recorded path changed 723ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 514ms
     ✓ writeStepRow appends its commit sha to the record 990ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1127ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 332ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 623ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 640ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 426ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 961ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 702ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 458ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 973ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 410ms
     ✓ does not count an artifact the run found committed when it started 492ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 325ms
     ✓ commits a package.json change outside bkit.workflows 492ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 922ms

 Test Files  1 passed (1)
      Tests  121 passed (121)
   Start at  13:21:09
   Duration  37.99s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-DNM1vq/junit.xml
```
