> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/worktrees.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (51 tests | 5 failed) 2922ms
✓ bkit worktrees setup — usage (9)
✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 24ms
✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 22ms
✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 21ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 21ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 23ms
✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 24ms
✓ refuses ["--workflow=build","--month=202610"] 20ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 22ms
✓ refuses outside a git repository 5ms
❯ bkit worktrees setup — adopt in place (10)
✓ works in the main checkout on its own branch: no worktree, no copy, no install 58ms
✓ adopts the main checkout even when called from a linked worktree 71ms
✓ design refuses to work in place on dev 43ms
✓ plan refuses to work in place on dev 41ms
✓ build refuses to work in place on dev 44ms
✓ ship refuses to work in place on dev 39ms
× build in place on main is refused 56ms
× design and plan in place on main are refused 55ms
✓ still adopts a cloud session branch whose upstream is main 62ms
✓ refuses a detached HEAD 43ms
✓ bkit worktrees setup — debug (4)
✓ may debug in place on dev 53ms
✓ never in place on main 41ms
✓ refuses a detached HEAD before anything else 35ms
✓ adopts in place when the session is already on feat/{fid} 62ms
❯ bkit worktrees setup — ship branch (5)
✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 178ms
× ship names a missing feat branch 55ms
× ship on dev refuses with the releases-stay-manual text 34ms
× refuses dev / main as the ship branch 34ms
✓ adopts in place when the session is already on the ship branch, even with --worktrees 62ms
✓ bkit worktrees setup — resume guard (6)
✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 48ms
✓ fails with a fetch error when there is no origin to rebase onto 96ms
✓ low disk (2)
✓ stops before minting when free disk stays under bkit.disk.minFreeGb after the max steps 58ms
✓ checks no disk when there are no cleanup step files 80ms
✓ ship resumes without fetching or rebasing, and copies the configured list 84ms
✓ narrates a copy entry that points outside the main checkout and skips it 82ms
✓ paths (2)
✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 24ms
✓ resolves the same marker from inside the worktree 46ms
✓ bkit worktrees remove (12)
✓ answers absent when there is no worktree 33ms
✓ leaves a worktree without the marker in place 44ms
✓ removes a marked worktree with uncommitted changes and clears the marker 68ms
✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 61ms
✓ tells a caller inside the removed worktree where to cd 59ms
✓ fails with its own exit code when git cannot remove a marked path 37ms
✓ --branch (6)
✓ deletes the local and remote branch once the marked worktree is gone 168ms
✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 127ms
✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 109ms
✓ a branch already gone everywhere is reported deleted 88ms
✓ refuses to delete dev (2) 22ms
✓ refuses to delete main (2) 22ms
✓ bkit worktrees setup --detect (3)
✓ refuses --detect with --worktrees 28ms
✓ a runtime that cannot mint worktrees adopts the checkout in place 83ms
✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 207ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — adopt in place > build in place on main is refused
AssertionError: expected +0 to be 7 // Object.is equality

- Expected

* Received

- 7

* 0

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:141:20
139| it("build in place on main is refused", async () => {
140| const r = await setup(repo("main"), "build");
141| expect(r.code).toBe(7);
| ^
142| expect(r.err).toContain("refusing to work in place on main");
143| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — adopt in place > design and plan in place on main are refused
AssertionError: expected +0 to be 7 // Object.is equality

- Expected

* Received

- 7

* 0

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:148:22
146| for (const workflow of ["design", "plan"]) {
147| const r = await setup(repo("main"), workflow);
148| expect(r.code).toBe(7);
| ^
149| expect(r.err).toContain("refusing to work in place on main");
150| }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — ship branch > ship names a missing feat branch
AssertionError: expected '[bkit-worktrees] adopt mode: cannot s…' to contain 'feat/42-thing does not exist — name t…'

- Expected

* Received

- feat/42-thing does not exist — name the feature branch to ship

* [bkit-worktrees] adopt mode: cannot switch to feat/42-thing — commit or stash local changes, then re-run (fatal: invalid reference: feat/42-thing)
*

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:214:19
212| const r = await setup(repo("dev"), "ship");
213| expect(r.code).toBe(7);
214| expect(r.err).toContain(`feat/${FID} does not exist — name the fea…
| ^
215| expect(r.err).not.toContain("commit or stash");
216| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — ship branch > ship on dev refuses with the releases-stay-manual text
AssertionError: expected '[bkit-worktrees] refusing to ship dev…' to contain 'ships a feature branch into dev only'

- Expected

* Received

- ships a feature branch into dev only

* [bkit-worktrees] refusing to ship dev as a feature branch
*

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:222:19
220| expect(r.code).toBe(7);
221| expect(r.err).toContain("refusing to ship dev");
222| expect(r.err).toContain("ships a feature branch into dev only");
| ^
223| expect(r.err).toContain("releases stay manual");
224| expect(r.err).toContain("Name the feature branch to ship.");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — ship branch > refuses dev / main as the ship branch
AssertionError: expected '[bkit-worktrees] refusing to ship mai…' to contain 'releases stay manual'

- Expected

* Received

- releases stay manual

* [bkit-worktrees] refusing to ship main as a feature branch
*

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:231:19
229| expect(r.code).toBe(7);
230| expect(r.err).toContain("refusing to ship main");
231| expect(r.err).toContain("releases stay manual");
| ^
232| });
233|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯

Test Files 1 failed (1)
Tests 5 failed | 46 passed (51)
Start at 13:08:31
Duration 3.07s (tests 97%, transform 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-swZl7U/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
