> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/worktrees.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (57 tests | 6 failed) 6912ms
✓ bkit worktrees setup — usage (9)
✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 47ms
✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 52ms
✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 69ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 70ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 66ms
✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 79ms
✓ refuses ["--workflow=build","--month=202610"] 77ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 81ms
✓ refuses outside a git repository 26ms
✓ bkit worktrees setup — adopt in place (10)
✓ works in the main checkout on its own branch: no worktree, no copy, no install 254ms
✓ adopts the main checkout even when called from a linked worktree 311ms
✓ design refuses to work in place on dev 94ms
✓ plan refuses to work in place on dev 80ms
✓ build refuses to work in place on dev 74ms
✓ ship refuses to work in place on dev 63ms
✓ build in place on main is refused 60ms
✓ design and plan in place on main are refused 121ms
✓ still adopts a cloud session branch whose upstream is main 93ms
✓ refuses a detached HEAD 79ms
✓ bkit worktrees setup — debug (4)
✓ may debug in place on dev 78ms
✓ never in place on main 54ms
✓ refuses a detached HEAD before anything else 50ms
✓ adopts in place when the session is already on feat/{fid} 92ms
❯ bkit worktrees setup — debug in place on dev shares the checkout (6)
× in-place debug on dev writes the shared-checkout record 211ms
× in-place debug on dev returns startSha and aheadAtStart 204ms
× a new run of the same FID rewrites startSha 271ms
× a resume of the same FID reuses the record 215ms
× setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 235ms
× a stale record without a lock is replaced 207ms
✓ bkit worktrees setup — ship branch (5)
✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 259ms
✓ ship names a missing feat branch 100ms
✓ ship on dev refuses with the releases-stay-manual text 56ms
✓ refuses dev / main as the ship branch 49ms
✓ adopts in place when the session is already on the ship branch, even with --worktrees 100ms
✓ bkit worktrees setup — resume guard (6)
✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 77ms
✓ fails with a fetch error when there is no origin to rebase onto 123ms
✓ low disk (2)
✓ stops before minting when free disk stays under bkit.disk.minFreeGb after the max steps 84ms
✓ checks no disk when there are no cleanup step files 151ms
✓ ship resumes without fetching or rebasing, and copies the configured list 158ms
✓ narrates a copy entry that points outside the main checkout and skips it 157ms
✓ paths (2)
✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 50ms
✓ resolves the same marker from inside the worktree 92ms
✓ bkit worktrees remove (12)
✓ answers absent when there is no worktree 63ms
✓ leaves a worktree without the marker in place 91ms
✓ removes a marked worktree with uncommitted changes and clears the marker 134ms
✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 122ms
✓ tells a caller inside the removed worktree where to cd 113ms
✓ fails with its own exit code when git cannot remove a marked path 69ms
✓ --branch (6)
✓ deletes the local and remote branch once the marked worktree is gone 319ms
✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 192ms
✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 191ms
✓ a branch already gone everywhere is reported deleted 147ms
✓ refuses to delete dev (2) 38ms
✓ refuses to delete main (2) 37ms
✓ bkit worktrees setup --detect (3)
✓ refuses --detect with --worktrees 52ms
✓ a runtime that cannot mint worktrees adopts the checkout in place 141ms
✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 332ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev shares the checkout > in-place debug on dev writes the shared-checkout record
AssertionError: expected false to be true // Object.is equality

- Expected

* Received

- true

* false

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:269:44
267| const r = await setup(cwd, "debug");
268| expect(r.code).toBe(0);
269| expect(fs.existsSync(recordFile(cwd))).toBe(true);
| ^
270| const rec = record(cwd);
271| expect(rec).toMatchObject({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev shares the checkout > in-place debug on dev returns startSha and aheadAtStart
AssertionError: expected { …(14) } to match object { …(2) }
(14 matching properties omitted from actual)

- Expected

* Received

  {

- "aheadAtStart": 1,
- "startSha": "7405770e0297d12707f3e83e795199eb620b5f34",

* "baseRef": "dev",
* "baseSha": "7405770e0297d12707f3e83e795199eb620b5f34",
* "branch": "dev",
* "copied": [],
* "copyMissing": [],
* "direnvAllowed": false,
* "installed": false,
* "logDir": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-56mtiB/docs/plans/202610/logs/42-thing",
* "mode": "adopted",
* "owned": false,
* "rebaseConflict": false,
* "repoRoot": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-56mtiB",
* "sentinel": null,
* "worktreePath": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-56mtiB",
  }

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:291:20
289| const r = await setup(cwd, "debug");
290| expect(r.code).toBe(0);
291| expect(r.json).toMatchObject({ startSha: git(cwd, "rev-parse", "HE…
| ^
292| });
293|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev shares the checkout > a new run of the same FID rewrites startSha
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-stE3DD/.git/bkit/shared-checkout/42-thing.json'
❯ record .bkit/core/engine/commands/workflow/worktrees.test.ts:207:19
205| path.resolve(cwd, git(cwd, "rev-parse", "--git-path", `bkit/shared…
206| const record = (cwd: string, fid = FID) =>
207| JSON.parse(fs.readFileSync(recordFile(cwd, fid), "utf-8")) as Reco…
| ^
208| const hashOf = (cwd: string, rel: string) => git(cwd, "hash-object",…
209|
❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:300:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev shares the checkout > a resume of the same FID reuses the record
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-48fjPB/.git/bkit/shared-checkout/42-thing.json'
❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:307:22
305| const cwd = shared();
306| await setup(cwd, "debug");
307| const first = fs.readFileSync(recordFile(cwd), "utf-8");
| ^
308| await liveRun(cwd, FID);
309| git(cwd, "commit", "-q", "--allow-empty", "-m", "the run's own com…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev shares the checkout > setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock
AssertionError: expected +0 to be 13 // Object.is equality

- Expected

* Received

- 13

* 0

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:320:20
318| await liveRun(cwd, OTHER);
319| const r = await setup(cwd, "debug");
320| expect(r.code).toBe(13);
| ^
321| expect(r.err).toContain(OTHER);
322| expect(fs.existsSync(recordFile(cwd))).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev shares the checkout > a stale record without a lock is replaced
AssertionError: expected false to be true // Object.is equality

- Expected

* Received

- true

* false

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:330:44
328| const r = await setup(cwd, "debug");
329| expect(r.code).toBe(0);
330| expect(fs.existsSync(recordFile(cwd))).toBe(true);
| ^
331| expect(fs.existsSync(recordFile(cwd, OTHER))).toBe(false);
332| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯

Test Files 1 failed (1)
Tests 6 failed | 51 passed (57)
Start at 15:46:25
Duration 7.54s (tests 93%, transform 6%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-OENnqr/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
