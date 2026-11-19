Enforced: true
Red: 4
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/1050-host-made-worktrees-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "refuses design, plan and build in place in a submodule's main checkout on feat/{fid}" | red | failure: design: expected +0 to be 7 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "debug in place on dev from a linked worktree records its own checkout" | red | failure: expected false to be true // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "refuses plan from a host-made worktree whose branch carries unpushed dev work" | red | failure: expected +0 to be 7 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "says so when the adopted worktree has no hooks directory" | red | failure: expected undefined to be '.husky/_' // Object.is equality |

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

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (101 tests | 3 failed) 84162ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 97ms
     ✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 81ms
     ✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 75ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 68ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 79ms
     ✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 165ms
     ✓ refuses ["--workflow=build","--month=202610"] 75ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 91ms
     ✓ refuses outside a git repository 25ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 282ms
     ✓ adopts the main checkout even when called from a linked worktree 360ms
     ✓ design refuses to work in place on dev 198ms
     ✓ plan refuses to work in place on dev 168ms
     ✓ build refuses to work in place on dev 138ms
     ✓ ship refuses to work in place on dev 113ms
     ✓ build in place on main is refused 119ms
     ✓ design and plan in place on main are refused 263ms
     ✓ still adopts a cloud session branch whose upstream is main 218ms
     ✓ refuses a detached HEAD 145ms
   ❯ bkit worktrees setup — adopt the checkout the session is already on (7)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 1456ms
     ✓ ship run from a linked worktree on its target branch adopts that worktree 385ms
     ✓ the adopted linked worktree holds the log directory 331ms
     ✓ refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees 403ms
     × refuses design, plan and build in place in a submodule's main checkout on feat/{fid} 801ms
     × says so when the adopted worktree has no hooks directory 385ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 675ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 970ms
     ✓ may debug in place on dev 495ms
     ✓ never in place on main 142ms
     ✓ refuses a detached HEAD before anything else 145ms
     ✓ adopts in place when the session is already on feat/{fid} 237ms
   ❯ bkit worktrees setup — debug in place on dev shares the checkout (26)
     ✓ in-place debug on dev writes the shared-checkout record 1100ms
     × debug in place on dev from a linked worktree records its own checkout 1128ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1041ms
     ✓ a new run of the same FID rewrites startSha 1566ms
     ✓ a resume of the same FID reuses the record 1483ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 1659ms
       ✓ drops a commit id that is not on the branch 1755ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 1646ms
       ✓ writes an empty commit list when the run has no run-commits row 1995ms
       ✓ ignores a row from before the open run started 2125ms
       ✓ restores the commits from the row on origin/dev when the handover landed 2224ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 2172ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 1979ms
       ✓ ignores the row on origin/dev when the run there is closed 2219ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 2016ms
         ✓ wins over the row on origin/dev, which is then not needed 2309ms
         ✓ wins over the row in the checkout's own log while the run is open 2059ms
         ✓ still drops a commit id that is not on the branch 2340ms
         ✓ is ignored and removed when the checkout's log shows the run closed 2564ms
         ✓ is ignored when it was parked for another workflow 2220ms
         ✓ is removed once the record is rebuilt 2247ms
         ✓ is removed when the live record already stands for the open run 1940ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 976ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1004ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1200ms
     ✓ a stale record without a lock is replaced 1255ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1077ms
     ✓ refuses inherited unpublished dev commits in every ship mode 3378ms
     ✓ names inherited commits and ship recovery in the refusal 842ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 970ms
     ✓ ship names a missing feat branch 312ms
     ✓ ship on dev refuses with the releases-stay-manual text 155ms
     ✓ refuses dev / main as the ship branch 133ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 918ms
     ✓ --issue is ship only 86ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 324ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 199ms
     ✓ fails with a fetch error when there is no origin to rebase onto 346ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 238ms
       ✓ checks no disk when there are no cleanup step files 327ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 377ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 369ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 383ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 213ms
     ✓ never commits an entry only the main checkout's copy list names 398ms
   ✓ paths (2)
     ✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 121ms
     ✓ resolves the same marker from inside the worktree 209ms
   ✓ bkit worktrees remove (20)
     ✓ answers absent when there is no worktree 141ms
     ✓ leaves a worktree without the marker in place 183ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 365ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 218ms
     ✓ tells a caller inside the removed worktree where to cd 269ms
     ✓ fails with its own exit code when git cannot remove a marked path 206ms
     ✓ --branch (14)
       ✓ preserves staged-only content during landed cleanup 1008ms
       ✓ preserves staged-only mode during landed cleanup 976ms
       ✓ preserves staged-only type during landed cleanup 1032ms
       ✓ preserves staged-only deletion during landed cleanup 845ms
       ✓ removes landed staged content when both index and working contents are on dev 953ms
       ✓ deletes the proved local and remote branch at their landed tips 1838ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1739ms
       ✓ removes the worktree and local branch when a later dev commit changed the branch's file 2106ms
       ✓ deletes the remote branch when a later dev commit changed the branch's file 1951ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 517ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 481ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 267ms
       ✓ refuses to delete dev (2) 110ms
       ✓ refuses to delete main (2) 90ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 123ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 379ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1572ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — adopt the checkout the session is already on > refuses design, plan and build in place in a submodule's main checkout on feat/{fid}
AssertionError: design: expected +0 to be 7 // Object.is equality

- Expected
+ Received

- 7
+ 0

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:267:32
    265|       git(inner, "switch", "-q", "-c", `feat/${FID}`);
    266|       const r = await setup(inner, workflow, "--worktrees");
    267|       expect(r.code, workflow).toBe(7);
       |                                ^
    268|       expect(fs.existsSync(path.join(inner, "docs/plans", MONTH, "logs…
    269|         false,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — adopt the checkout the session is already on > says so when the adopted worktree has no hooks directory
AssertionError: expected undefined to be '.husky/_' // Object.is equality

- Expected:
".husky/_"

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:280:39
    278|     const missing = await setup(wt, "plan", "--worktrees");
    279|     expect(missing.code).toBe(0);
    280|     expect(missing.json.hooksMissing).toBe(".husky/_");
       |                                       ^
    281|     expect(missing.err).toContain(".husky/_");
    282|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev shares the checkout > debug in place on dev from a linked worktree records its own checkout
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:477:47
    475|     const r = await setup(wtReal, "debug", "--branch=dev", "--worktree…
    476|     expect(r.code).toBe(0);
    477|     expect(fs.existsSync(recordFile(wtReal))).toBe(true);
       |                                               ^
    478|     expect(fs.existsSync(path.join(cwd, ".git/bkit/shared-checkout", `…
    479|     expect(record(wtReal).paths).toEqual(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 98 passed (101)
   Start at  16:14:35
   Duration  84.84s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-7wUr1g/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/worktrees.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/worktrees.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees

 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (63 tests | 1 failed) 148208ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 3020ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 18781ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 2010ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1290ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1503ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1798ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2068ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 3018ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1502ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1020ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 485ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 1066ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 1088ms
     ✓ design installs dependencies like build and debug 1198ms
     ✓ plan installs dependencies like build and debug 1091ms
     ✓ design stops on a failed install (5) 1118ms
     ✓ plan stops on a failed install (5) 1142ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1082ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1166ms
     ✓ fails without minting when origin cannot be reached 254ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1297ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1687ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2533ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 4812ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 4964ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 3664ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 3903ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 3584ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2507ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2144ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2092ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 2435ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3682ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2353ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3364ms
     ✓ commits leftovers when a copy entry points outside the checkout 2786ms
     ✓ never commits the entries setup copies in from the main checkout 2932ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 2989ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 1337ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 1314ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1840ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 1883ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 1550ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 1504ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 1546ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 2284ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 2671ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 1098ms
     ✓ leaves a clean worktree's history alone 2186ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 2622ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 3758ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 3258ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 3351ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 3771ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 2757ms
     ✓ does not mark a resumed worktree it did not create 1290ms
   ❯ bkit worktrees setup — a host-made worktree on feat/{fid} (2)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 765ms
     × refuses plan from a host-made worktree whose branch carries unpushed dev work 437ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 343ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 755ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 2448ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 2288ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1260ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.integration.test.ts > bkit worktrees setup — a host-made worktree on feat/{fid} > refuses plan from a host-made worktree whose branch carries unpushed dev work
AssertionError: expected +0 to be 7 // Object.is equality

- Expected
+ Received

- 7
+ 0

 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts:1183:20
    1181|
    1182|     const r = await setup(hostReal, "plan", "--worktrees");
    1183|     expect(r.code).toBe(7);
       |                    ^
    1184|     expect(r.err).toContain("1 commit(s) of unpushed dev");
    1185|     expect(fs.existsSync(path.join(hostReal, "docs/plans", MONTH, "log…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 62 passed (63)
   Start at  16:16:02
   Duration  149.00s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-cE5fGA/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
