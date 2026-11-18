Enforced: true
Red: 4
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/919-worktree-setup-tries-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "adopts the linked worktree already on feat/{fid} for design, plan, build and debug" | red | failure: design: expected '[bkit-worktrees] git worktree add fai…' not to contain 'already used by worktree' |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "ship run from a linked worktree on its target branch adopts that worktree" | red | failure: expected 7 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "the adopted linked worktree holds the log directory" | red | failure: expected 8 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "a plan session on another branch still mints .worktrees/{fid}" | passed-accepted | passes; accepted by the tests step: current code already mints when the session is on another branch; the test guards that behaviour |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "plan from a host-made worktree on feat/{fid} adopts it without rebasing" | red | failure: expected '[bkit-worktrees] git worktree add fai…' not to contain 'already used by worktree' |

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

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (95 tests | 3 failed) 85740ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 1247ms
     ✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 2013ms
     ✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 643ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 546ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 2155ms
     ✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 758ms
     ✓ refuses ["--workflow=build","--month=202610"] 682ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 820ms
     ✓ refuses outside a git repository 21ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 1387ms
     ✓ adopts the main checkout even when called from a linked worktree 695ms
     ✓ design refuses to work in place on dev 235ms
     ✓ plan refuses to work in place on dev 232ms
     ✓ build refuses to work in place on dev 247ms
     ✓ ship refuses to work in place on dev 293ms
     ✓ build in place on main is refused 292ms
     ✓ design and plan in place on main are refused 430ms
     ✓ still adopts a cloud session branch whose upstream is main 456ms
     ✓ refuses a detached HEAD 178ms
   ❯ bkit worktrees setup — adopt the checkout the session is already on (4)
     × adopts the linked worktree already on feat/{fid} for design, plan, build and debug 324ms
     × ship run from a linked worktree on its target branch adopts that worktree 466ms
     × the adopted linked worktree holds the log directory 386ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 1039ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1110ms
     ✓ may debug in place on dev 562ms
     ✓ never in place on main 157ms
     ✓ refuses a detached HEAD before anything else 157ms
     ✓ adopts in place when the session is already on feat/{fid} 288ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (25)
     ✓ in-place debug on dev writes the shared-checkout record 1258ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1241ms
     ✓ a new run of the same FID rewrites startSha 1975ms
     ✓ a resume of the same FID reuses the record 1756ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 2107ms
       ✓ drops a commit id that is not on the branch 2409ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 1996ms
       ✓ writes an empty commit list when the run has no run-commits row 2045ms
       ✓ ignores a row from before the open run started 2010ms
       ✓ restores the commits from the row on origin/dev when the handover landed 2589ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 2521ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 1918ms
       ✓ ignores the row on origin/dev when the run there is closed 2074ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 1767ms
         ✓ wins over the row on origin/dev, which is then not needed 2067ms
         ✓ wins over the row in the checkout's own log while the run is open 1779ms
         ✓ still drops a commit id that is not on the branch 1823ms
         ✓ is ignored and removed when the checkout's log shows the run closed 1725ms
         ✓ is ignored when it was parked for another workflow 1789ms
         ✓ is removed once the record is rebuilt 1767ms
         ✓ is removed when the live record already stands for the open run 1464ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 812ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 816ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1030ms
     ✓ a stale record without a lock is replaced 1079ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 852ms
     ✓ refuses inherited unpublished dev commits in every ship mode 2933ms
     ✓ names inherited commits and ship recovery in the refusal 754ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1040ms
     ✓ ship names a missing feat branch 307ms
     ✓ ship on dev refuses with the releases-stay-manual text 112ms
     ✓ refuses dev / main as the ship branch 122ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 804ms
     ✓ --issue is ship only 75ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 282ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 195ms
     ✓ fails with a fetch error when there is no origin to rebase onto 314ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 213ms
       ✓ checks no disk when there are no cleanup step files 335ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 340ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 513ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 292ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 207ms
     ✓ never commits an entry only the main checkout's copy list names 332ms
   ✓ paths (2)
     ✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 97ms
     ✓ resolves the same marker from inside the worktree 183ms
   ✓ bkit worktrees remove (18)
     ✓ answers absent when there is no worktree 128ms
     ✓ leaves a worktree without the marker in place 194ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 452ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 303ms
     ✓ tells a caller inside the removed worktree where to cd 466ms
     ✓ fails with its own exit code when git cannot remove a marked path 304ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1166ms
       ✓ preserves staged-only mode during landed cleanup 1079ms
       ✓ preserves staged-only type during landed cleanup 1215ms
       ✓ preserves staged-only deletion during landed cleanup 1492ms
       ✓ removes landed staged content when both index and working contents are on dev 1324ms
       ✓ deletes the proved local and remote branch at their landed tips 1247ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1668ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 529ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 544ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 259ms
       ✓ refuses to delete dev (2) 95ms
       ✓ refuses to delete main (2) 98ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 173ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 348ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 716ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — adopt the checkout the session is already on > adopts the linked worktree already on feat/{fid} for design, plan, build and debug
AssertionError: design: expected '[bkit-worktrees] git worktree add fai…' not to contain 'already used by worktree'

- Expected
+ Received

- already used by worktree
+ [bkit-worktrees] git worktree add failed: Preparing worktree (checking out 'feat/42-thing')
+ fatal: 'feat/42-thing' is already used by worktree at '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-host-0NBreL/42-thing'
+

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:206:35
    204|       const wt = hostWorktree(cwd);
    205|       const r = await setup(wt, workflow, "--worktrees");
    206|       expect(r.err, workflow).not.toContain("already used by worktree"…
       |                                   ^
    207|       expect(r.code, workflow).toBe(0);
    208|       expect(r.json, workflow).toMatchObject({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — adopt the checkout the session is already on > ship run from a linked worktree on its target branch adopts that worktree
AssertionError: expected 7 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 7

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:222:20
    220|     const wt = hostWorktree(cwd);
    221|     const r = await setup(wt, "ship", "--worktrees");
    222|     expect(r.code).toBe(0);
       |                    ^
    223|     expect(r.json).toMatchObject({ mode: "adopted", branch: `feat/${FI…
    224|     expect(git(cwd, "branch", "--show-current")).toBe("dev");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — adopt the checkout the session is already on > the adopted linked worktree holds the log directory
AssertionError: expected 8 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 8

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:232:20
    230|     const wt = hostWorktree(cwd);
    231|     const r = await setup(wt, "plan", "--worktrees");
    232|     expect(r.code).toBe(0);
       |                    ^
    233|     expect(r.json.logDir).toBe(path.join(wt, "docs/plans", MONTH, "log…
    234|     expect(fs.existsSync(r.json.logDir)).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 92 passed (95)
   Start at  18:37:16
   Duration  86.36s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-oR4FtB/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/919-worktree-setup-tries
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/worktrees.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/919-worktree-setup-tries
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/worktrees.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/919-worktree-setup-tries

 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (62 tests | 1 failed) 140301ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 5945ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 23262ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 2096ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1408ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1278ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1652ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1726ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2675ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1230ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 896ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 433ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 1171ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 868ms
     ✓ design installs dependencies like build and debug 886ms
     ✓ plan installs dependencies like build and debug 1218ms
     ✓ design stops on a failed install (5) 1283ms
     ✓ plan stops on a failed install (5) 1043ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1004ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1017ms
     ✓ fails without minting when origin cannot be reached 183ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1143ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1231ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2078ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 3724ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 4373ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 3108ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 2429ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 2887ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1792ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2315ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2040ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1706ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2309ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1905ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2998ms
     ✓ commits leftovers when a copy entry points outside the checkout 2951ms
     ✓ never commits the entries setup copies in from the main checkout 3434ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 2025ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 814ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 1309ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1558ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 1468ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 1109ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 1330ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 1949ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 2107ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 2266ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 1062ms
     ✓ leaves a clean worktree's history alone 2107ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 2513ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 4054ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 3623ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 3132ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 3405ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 2646ms
     ✓ does not mark a resumed worktree it did not create 1276ms
   ❯ bkit worktrees setup — a host-made worktree on feat/{fid} (1)
     × plan from a host-made worktree on feat/{fid} adopts it without rebasing 712ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 349ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 726ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1305ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 2144ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1077ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.integration.test.ts > bkit worktrees setup — a host-made worktree on feat/{fid} > plan from a host-made worktree on feat/{fid} adopts it without rebasing
AssertionError: expected '[bkit-worktrees] git worktree add fai…' not to contain 'already used by worktree'

- Expected
+ Received

- already used by worktree
+ [bkit-worktrees] git worktree add failed: Preparing worktree (checking out 'feat/42-thing')
+ fatal: 'feat/42-thing' is already used by worktree at '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-4cskZk/host-wt'
+

 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts:1161:23
    1159|
    1160|     const r = await setup(hostReal, "plan", "--worktrees");
    1161|     expect(r.err).not.toContain("already used by worktree");
       |                       ^
    1162|     expect(r.code).toBe(0);
    1163|     expect(r.json).toMatchObject({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 61 passed (62)
   Start at  18:38:44
   Duration  141.19s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-F1Rdmm/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
