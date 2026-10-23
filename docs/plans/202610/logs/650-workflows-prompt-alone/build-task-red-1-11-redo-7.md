> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/worktrees.test.ts

[test-timeout-budget] load average 36.0 on 10 cores: unit limits 17991ms per test, 35982ms per hook (x3.60)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (57 tests | 6 failed) 8166ms
✓ bkit worktrees setup — usage (9)
✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 53ms
✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 49ms
✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 47ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 47ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 45ms
✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 58ms
✓ refuses ["--workflow=build","--month=202610"] 45ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 45ms
✓ refuses outside a git repository 10ms
✓ bkit worktrees setup — adopt in place (10)
✓ works in the main checkout on its own branch: no worktree, no copy, no install 118ms
✓ adopts the main checkout even when called from a linked worktree 166ms
✓ design refuses to work in place on dev 93ms
✓ plan refuses to work in place on dev 89ms
✓ build refuses to work in place on dev 90ms
✓ ship refuses to work in place on dev 76ms
✓ build in place on main is refused 73ms
✓ design and plan in place on main are refused 140ms
✓ still adopts a cloud session branch whose upstream is main 121ms
✓ refuses a detached HEAD 76ms
✓ bkit worktrees setup — debug (4)
✓ may debug in place on dev 85ms
✓ never in place on main 61ms
✓ refuses a detached HEAD before anything else 60ms
✓ adopts in place when the session is already on feat/{fid} 103ms
❯ bkit worktrees setup — debug in place on dev shares the checkout (6)
× in-place debug on dev writes the shared-checkout record 254ms
× in-place debug on dev returns startSha and aheadAtStart 248ms
× a new run of the same FID rewrites startSha 325ms
× a resume of the same FID reuses the record 270ms
× setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 274ms
× a stale record without a lock is replaced 282ms
✓ bkit worktrees setup — ship branch (5)
✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 344ms
✓ ship names a missing feat branch 157ms
✓ ship on dev refuses with the releases-stay-manual text 79ms
✓ refuses dev / main as the ship branch 79ms
✓ adopts in place when the session is already on the ship branch, even with --worktrees 247ms
✓ bkit worktrees setup — resume guard (6)
✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 150ms
✓ fails with a fetch error when there is no origin to rebase onto 267ms
✓ low disk (2)
✓ stops before minting when free disk stays under bkit.disk.minFreeGb after the max steps 163ms
✓ checks no disk when there are no cleanup step files 254ms
✓ ship resumes without fetching or rebasing, and copies the configured list 226ms
✓ narrates a copy entry that points outside the main checkout and skips it 210ms
✓ paths (2)
✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 58ms
✓ resolves the same marker from inside the worktree 106ms
✓ bkit worktrees remove (12)
✓ answers absent when there is no worktree 81ms
✓ leaves a worktree without the marker in place 108ms
✓ removes a marked worktree with uncommitted changes and clears the marker 161ms
✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 151ms
✓ tells a caller inside the removed worktree where to cd 134ms
✓ fails with its own exit code when git cannot remove a marked path 82ms
✓ --branch (6)
✓ deletes the local and remote branch once the marked worktree is gone 369ms
✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 228ms
✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 217ms
✓ a branch already gone everywhere is reported deleted 164ms
✓ refuses to delete dev (2) 42ms
✓ refuses to delete main (2) 42ms
✓ bkit worktrees setup --detect (3)
✓ refuses --detect with --worktrees 58ms
✓ a runtime that cannot mint worktrees adopts the checkout in place 174ms
✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 411ms

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
- "startSha": "44dcfe1be741133bb1a919940d2440f4f29961af",

* "baseRef": "dev",
* "baseSha": "44dcfe1be741133bb1a919940d2440f4f29961af",
* "branch": "dev",
* "copied": [],
* "copyMissing": [],
* "direnvAllowed": false,
* "installed": false,
* "logDir": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-QxOIPF/docs/plans/202610/logs/42-thing",
* "mode": "adopted",
* "owned": false,
* "rebaseConflict": false,
* "repoRoot": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-QxOIPF",
* "sentinel": null,
* "worktreePath": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-QxOIPF",
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
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-JfowuS/.git/bkit/shared-checkout/42-thing.json'
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
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-GkJeMl/.git/bkit/shared-checkout/42-thing.json'
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
Start at 15:44:41
Duration 8.87s (tests 93%, transform 6%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jdWFVl/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
