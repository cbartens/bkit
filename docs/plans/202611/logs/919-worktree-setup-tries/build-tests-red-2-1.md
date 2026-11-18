Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/919-worktree-setup-tries-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees" | red | failure: design: expected +0 to be 7 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/919-worktree-setup-tries
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/worktrees.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/919-worktree-setup-tries
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/worktrees.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/919-worktree-setup-tries

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (96 tests | 1 failed) 26455ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 31ms
     ✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 27ms
     ✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 32ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 27ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 26ms
     ✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 32ms
     ✓ refuses ["--workflow=build","--month=202610"] 26ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 26ms
     ✓ refuses outside a git repository 6ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 78ms
     ✓ adopts the main checkout even when called from a linked worktree 98ms
     ✓ design refuses to work in place on dev 56ms
     ✓ plan refuses to work in place on dev 55ms
     ✓ build refuses to work in place on dev 56ms
     ✓ ship refuses to work in place on dev 49ms
     ✓ build in place on main is refused 50ms
     ✓ design and plan in place on main are refused 97ms
     ✓ still adopts a cloud session branch whose upstream is main 88ms
     ✓ refuses a detached HEAD 56ms
   ❯ bkit worktrees setup — adopt the checkout the session is already on (5)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 442ms
     ✓ ship run from a linked worktree on its target branch adopts that worktree 133ms
     ✓ the adopted linked worktree holds the log directory 103ms
     × refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees 86ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 243ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 311ms
     ✓ may debug in place on dev 162ms
     ✓ never in place on main 49ms
     ✓ refuses a detached HEAD before anything else 45ms
     ✓ adopts in place when the session is already on feat/{fid} 83ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (25)
     ✓ in-place debug on dev writes the shared-checkout record 341ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 314ms
     ✓ a new run of the same FID rewrites startSha 510ms
     ✓ a resume of the same FID reuses the record 448ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 586ms
       ✓ drops a commit id that is not on the branch 610ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 572ms
       ✓ writes an empty commit list when the run has no run-commits row 590ms
       ✓ ignores a row from before the open run started 588ms
       ✓ restores the commits from the row on origin/dev when the handover landed 752ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 742ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 654ms
       ✓ ignores the row on origin/dev when the run there is closed 716ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 640ms
         ✓ wins over the row on origin/dev, which is then not needed 752ms
         ✓ wins over the row in the checkout's own log while the run is open 634ms
         ✓ still drops a commit id that is not on the branch 648ms
         ✓ is ignored and removed when the checkout's log shows the run closed 612ms
         ✓ is ignored when it was parked for another workflow 650ms
         ✓ is removed once the record is rebuilt 650ms
         ✓ is removed when the live record already stands for the open run 556ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 299ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 357ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 494ms
     ✓ a stale record without a lock is replaced 490ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 379ms
     ✓ refuses inherited unpublished dev commits in every ship mode 1314ms
     ✓ names inherited commits and ship recovery in the refusal 333ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 397ms
     ✓ ship names a missing feat branch 145ms
     ✓ ship on dev refuses with the releases-stay-manual text 73ms
     ✓ refuses dev / main as the ship branch 80ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 361ms
     ✓ --issue is ship only 36ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 146ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 89ms
     ✓ fails with a fetch error when there is no origin to rebase onto 133ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 95ms
       ✓ checks no disk when there are no cleanup step files 155ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 165ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 158ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 132ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 89ms
     ✓ never commits an entry only the main checkout's copy list names 132ms
   ✓ paths (2)
     ✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 35ms
     ✓ resolves the same marker from inside the worktree 67ms
   ✓ bkit worktrees remove (18)
     ✓ answers absent when there is no worktree 46ms
     ✓ leaves a worktree without the marker in place 66ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 163ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 103ms
     ✓ tells a caller inside the removed worktree where to cd 132ms
     ✓ fails with its own exit code when git cannot remove a marked path 98ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 401ms
       ✓ preserves staged-only mode during landed cleanup 402ms
       ✓ preserves staged-only type during landed cleanup 389ms
       ✓ preserves staged-only deletion during landed cleanup 422ms
       ✓ removes landed staged content when both index and working contents are on dev 439ms
       ✓ deletes the proved local and remote branch at their landed tips 511ms
       ✓ retains the remote branch when origin refuses its conditional deletion 878ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 205ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 187ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 113ms
       ✓ refuses to delete dev (2) 44ms
       ✓ refuses to delete main (2) 37ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 57ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 149ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 317ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — adopt the checkout the session is already on > refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees
AssertionError: design: expected +0 to be 7 // Object.is equality

- Expected
+ Received

- 7
+ 0

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:242:32
    240|       const cwd = repo(`feat/${FID}`);
    241|       const r = await setup(cwd, workflow, "--worktrees");
    242|       expect(r.code, workflow).toBe(7);
       |                                ^
    243|       expect(r.err, workflow).toContain("main checkout");
    244|       expect(fs.existsSync(path.join(cwd, "docs/plans", MONTH, "logs",…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 95 passed (96)
   Start at  19:35:24
   Duration  26.67s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-hx3tZb/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
