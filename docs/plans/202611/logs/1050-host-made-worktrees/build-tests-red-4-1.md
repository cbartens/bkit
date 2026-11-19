Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/1050-host-made-worktrees-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "does not report a ~ hooks directory that exists" | red | failure: expected '~/.githooks' to be undefined |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/worktrees.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/worktrees.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (102 tests | 1 failed) 114911ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 116ms
     ✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 87ms
     ✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 94ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 117ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 155ms
     ✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 108ms
     ✓ refuses ["--workflow=build","--month=202610"] 119ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 89ms
     ✓ refuses outside a git repository 24ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 310ms
     ✓ adopts the main checkout even when called from a linked worktree 530ms
     ✓ design refuses to work in place on dev 216ms
     ✓ plan refuses to work in place on dev 262ms
     ✓ build refuses to work in place on dev 211ms
     ✓ ship refuses to work in place on dev 196ms
     ✓ build in place on main is refused 201ms
     ✓ design and plan in place on main are refused 392ms
     ✓ still adopts a cloud session branch whose upstream is main 393ms
     ✓ refuses a detached HEAD 193ms
   ❯ bkit worktrees setup — adopt the checkout the session is already on (8)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 2281ms
     ✓ ship run from a linked worktree on its target branch adopts that worktree 507ms
     ✓ the adopted linked worktree holds the log directory 564ms
     ✓ refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees 786ms
     ✓ refuses design, plan and build in place in a submodule's main checkout on feat/{fid} 2705ms
     ✓ says so when the adopted worktree has no hooks directory 1708ms
     × does not report a ~ hooks directory that exists 607ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 1042ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1131ms
     ✓ may debug in place on dev 676ms
     ✓ never in place on main 190ms
     ✓ refuses a detached HEAD before anything else 158ms
     ✓ adopts in place when the session is already on feat/{fid} 343ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (26)
     ✓ in-place debug on dev writes the shared-checkout record 1796ms
     ✓ debug in place on dev from a linked worktree records its own checkout 1430ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1299ms
     ✓ a new run of the same FID rewrites startSha 2796ms
     ✓ a resume of the same FID reuses the record 2330ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 3270ms
       ✓ drops a commit id that is not on the branch 3399ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 2398ms
       ✓ writes an empty commit list when the run has no run-commits row 2812ms
       ✓ ignores a row from before the open run started 2871ms
       ✓ restores the commits from the row on origin/dev when the handover landed 4040ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 2558ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 3022ms
       ✓ ignores the row on origin/dev when the run there is closed 2693ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 2611ms
         ✓ wins over the row on origin/dev, which is then not needed 2777ms
         ✓ wins over the row in the checkout's own log while the run is open 2803ms
         ✓ still drops a commit id that is not on the branch 2713ms
         ✓ is ignored and removed when the checkout's log shows the run closed 2767ms
         ✓ is ignored when it was parked for another workflow 2737ms
         ✓ is removed once the record is rebuilt 2802ms
         ✓ is removed when the live record already stands for the open run 2259ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1153ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1145ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1678ms
     ✓ a stale record without a lock is replaced 1583ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1180ms
     ✓ refuses inherited unpublished dev commits in every ship mode 4349ms
     ✓ names inherited commits and ship recovery in the refusal 905ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1200ms
     ✓ ship names a missing feat branch 419ms
     ✓ ship on dev refuses with the releases-stay-manual text 158ms
     ✓ refuses dev / main as the ship branch 170ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1704ms
     ✓ --issue is ship only 99ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 410ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 272ms
     ✓ fails with a fetch error when there is no origin to rebase onto 411ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 292ms
       ✓ checks no disk when there are no cleanup step files 448ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 480ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 447ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 364ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 266ms
     ✓ never commits an entry only the main checkout's copy list names 417ms
   ✓ paths (2)
     ✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 102ms
     ✓ resolves the same marker from inside the worktree 219ms
   ✓ bkit worktrees remove (20)
     ✓ answers absent when there is no worktree 375ms
     ✓ leaves a worktree without the marker in place 235ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 511ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 338ms
     ✓ tells a caller inside the removed worktree where to cd 449ms
     ✓ fails with its own exit code when git cannot remove a marked path 293ms
     ✓ --branch (14)
       ✓ preserves staged-only content during landed cleanup 1112ms
       ✓ preserves staged-only mode during landed cleanup 1477ms
       ✓ preserves staged-only type during landed cleanup 1505ms
       ✓ preserves staged-only deletion during landed cleanup 1168ms
       ✓ removes landed staged content when both index and working contents are on dev 1274ms
       ✓ deletes the proved local and remote branch at their landed tips 1508ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1842ms
       ✓ removes the worktree and local branch when a later dev commit changed the branch's file 2180ms
       ✓ deletes the remote branch when a later dev commit changed the branch's file 2187ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 823ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 569ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 281ms
       ✓ refuses to delete dev (2) 107ms
       ✓ refuses to delete main (2) 109ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 498ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 540ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 958ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — adopt the checkout the session is already on > does not report a ~ hooks directory that exists
AssertionError: expected '~/.githooks' to be undefined

- Expected:
undefined

+ Received:
"~/.githooks"

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:305:41
    303|       const present = await setup(wt, "plan", "--worktrees");
    304|       expect(present.code).toBe(0);
    305|       expect(present.json.hooksMissing).toBeUndefined();
       |                                         ^
    306|       expect(present.err).not.toContain("~/.githooks");
    307|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 101 passed (102)
   Start at  18:10:47
   Duration  116.19s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-o8TVbD/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
