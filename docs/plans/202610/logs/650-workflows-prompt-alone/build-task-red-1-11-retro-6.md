> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/worktrees.test.ts

[test-timeout-budget] load average 34.1 on 10 cores: unit limits 17066ms per test, 34132ms per hook (x3.41)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (59 tests | 13 failed) 7494ms
✓ bkit worktrees setup — usage (9)
✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 63ms
✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 56ms
✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 58ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 64ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 61ms
✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 76ms
✓ refuses ["--workflow=build","--month=202610"] 63ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 62ms
✓ refuses outside a git repository 11ms
❯ bkit worktrees setup — adopt in place (10)
✓ works in the main checkout on its own branch: no worktree, no copy, no install 144ms
✓ adopts the main checkout even when called from a linked worktree 199ms
✓ design refuses to work in place on dev 107ms
✓ plan refuses to work in place on dev 114ms
✓ build refuses to work in place on dev 125ms
✓ ship refuses to work in place on dev 108ms
× build in place on main is refused 148ms
× design and plan in place on main are refused 145ms
✓ still adopts a cloud session branch whose upstream is main 163ms
✓ refuses a detached HEAD 118ms
✓ bkit worktrees setup — debug (4)
✓ may debug in place on dev 149ms
✓ never in place on main 89ms
✓ refuses a detached HEAD before anything else 94ms
✓ adopts in place when the session is already on feat/{fid} 162ms
❯ bkit worktrees setup — debug in place on dev (shared-checkout record) (8)
× in-place debug on dev writes the shared-checkout record 145ms
× in-place debug on dev returns startSha and aheadAtStart 145ms
× counts the commits local dev holds beyond origin/dev as aheadAtStart 251ms
× a feature branch run writes no record and no start fields 134ms
× a new run of the same FID rewrites startSha 51ms
× a resume of the same FID reuses the record 62ms
× setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 58ms
× a stale record without a lock is replaced 54ms
❯ bkit worktrees setup — ship branch (5)
✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 485ms
× ship names a missing feat branch 157ms
× ship on dev refuses with the releases-stay-manual text 82ms
× refuses dev / main as the ship branch 85ms
✓ adopts in place when the session is already on the ship branch, even with --worktrees 152ms
✓ bkit worktrees setup — resume guard (6)
✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 137ms
✓ fails with a fetch error when there is no origin to rebase onto 217ms
✓ low disk (2)
✓ stops before minting when free disk stays under bkit.disk.minFreeGb after the max steps 116ms
✓ checks no disk when there are no cleanup step files 189ms
✓ ship resumes without fetching or rebasing, and copies the configured list 173ms
✓ narrates a copy entry that points outside the main checkout and skips it 161ms
✓ paths (2)
✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 48ms
✓ resolves the same marker from inside the worktree 88ms
✓ bkit worktrees remove (12)
✓ answers absent when there is no worktree 63ms
✓ leaves a worktree without the marker in place 94ms
✓ removes a marked worktree with uncommitted changes and clears the marker 143ms
✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 120ms
✓ tells a caller inside the removed worktree where to cd 126ms
✓ fails with its own exit code when git cannot remove a marked path 73ms
✓ --branch (6)
✓ deletes the local and remote branch once the marked worktree is gone 331ms
✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 201ms
✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 211ms
✓ a branch already gone everywhere is reported deleted 160ms
✓ refuses to delete dev (2) 36ms
✓ refuses to delete main (2) 33ms
✓ bkit worktrees setup --detect (3)
✓ refuses --detect with --worktrees 49ms
✓ a runtime that cannot mint worktrees adopts the checkout in place 137ms
✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 347ms

⎯⎯⎯⎯⎯⎯ Failed Tests 13 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — adopt in place > build in place on main is refused
AssertionError: expected +0 to be 7 // Object.is equality

- Expected

* Received

- 7

* 0

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:142:20
140| it("build in place on main is refused", async () => {
141| const r = await setup(repo("main"), "build");
142| expect(r.code).toBe(7);
| ^
143| expect(r.err).toContain("refusing to work in place on main");
144| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — adopt in place > design and plan in place on main are refused
AssertionError: expected +0 to be 7 // Object.is equality

- Expected

* Received

- 7

* 0

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:149:22
147| for (const workflow of ["design", "plan"]) {
148| const r = await setup(repo("main"), workflow);
149| expect(r.code).toBe(7);
| ^
150| expect(r.err).toContain("refusing to work in place on main");
151| }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev (shared-checkout record) > in-place debug on dev writes the shared-checkout record
TypeError: readRecord is not a function
❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:247:17
245| const r = await setup(cwd, "debug");
246| expect(r.code).toBe(0);
247| const rec = readRecord(cwd, FID);
| ^
248| expect(rec).toMatchObject({
249| fid: FID,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev (shared-checkout record) > in-place debug on dev returns startSha and aheadAtStart
AssertionError: expected { …(14) } to match object { …(2) }
(14 matching properties omitted from actual)

- Expected

* Received

  {

- "aheadAtStart": 0,
- "startSha": "85369c8e24ddeba094e75d3a1ac6b7968aa7e550",

* "baseRef": "origin/dev",
* "baseSha": null,
* "branch": "dev",
* "copied": [],
* "copyMissing": [],
* "direnvAllowed": false,
* "installed": false,
* "logDir": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-quOFim/docs/plans/202610/logs/42-thing",
* "mode": "adopted",
* "owned": false,
* "rebaseConflict": false,
* "repoRoot": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-quOFim",
* "sentinel": null,
* "worktreePath": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-quOFim",
  }

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:264:20
262| const cwd = repo("dev");
263| const r = await setup(cwd, "debug");
264| expect(r.json).toMatchObject({ startSha: git(cwd, "rev-parse", "HE…
| ^
265| });
266|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev (shared-checkout record) > counts the commits local dev holds beyond origin/dev as aheadAtStart
AssertionError: expected undefined to be 2 // Object.is equality

- Expected:
  2

* Received:
  undefined

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:273:33
271| git(cwd, "commit", "-q", "--allow-empty", "-m", "local two");
272| const r = await setup(cwd, "debug");
273| expect(r.json.aheadAtStart).toBe(2);
| ^
274| expect(readRecord(cwd, FID)?.aheadAtStart).toBe(2);
275| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev (shared-checkout record) > a feature branch run writes no record and no start fields
TypeError: readRecord is not a function
❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:281:12
279| const r = await setup(cwd, "debug");
280| expect(r.json).not.toHaveProperty("startSha");
281| expect(readRecord(cwd, FID)).toBeNull();
| ^
282| });
283|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev (shared-checkout record) > a new run of the same FID rewrites startSha
TypeError: writeRecord is not a function
❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:286:5
284| it("a new run of the same FID rewrites startSha", async () => {
285| const cwd = repo("dev");
286| writeRecord(cwd, record(FID));
| ^
287| await setup(cwd, "debug");
288| const rec = readRecord(cwd, FID);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev (shared-checkout record) > a resume of the same FID reuses the record
TypeError: writeRecord is not a function
❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:295:5
293| it("a resume of the same FID reuses the record", async () => {
294| const cwd = repo("dev");
295| writeRecord(cwd, record(FID));
| ^
296| statusRows(cwd, FID, [{ type: "workflow-started", workflow: "debug…
297| const r = await setup(cwd, "debug");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev (shared-checkout record) > setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock
TypeError: writeRecord is not a function
❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:304:5
302| it("setup refuses with EXIT_SHARED_BUSY when another FID has a recor…
303| const cwd = repo("dev");
304| writeRecord(cwd, record(OTHER));
| ^
305| running(cwd, OTHER);
306| const r = await setup(cwd, "debug");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev (shared-checkout record) > a stale record without a lock is replaced
TypeError: writeRecord is not a function
❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:315:5
313| it("a stale record without a lock is replaced", async () => {
314| const cwd = repo("dev");
315| writeRecord(cwd, record(OTHER));
| ^
316| const r = await setup(cwd, "debug");
317| expect(r.code).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — ship branch > ship names a missing feat branch
AssertionError: expected '[bkit-worktrees] adopt mode: cannot s…' to contain 'feat/42-thing does not exist — name t…'

- Expected

* Received

- feat/42-thing does not exist — name the feature branch to ship

* [bkit-worktrees] adopt mode: cannot switch to feat/42-thing — commit or stash local changes, then re-run (fatal: invalid reference: feat/42-thing)
*

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:337:19
335| const r = await setup(repo("dev"), "ship");
336| expect(r.code).toBe(7);
337| expect(r.err).toContain(`feat/${FID} does not exist — name the fea…
| ^
338| expect(r.err).not.toContain("commit or stash");
339| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — ship branch > ship on dev refuses with the releases-stay-manual text
AssertionError: expected '[bkit-worktrees] refusing to ship dev…' to contain 'ships a feature branch into dev only'

- Expected

* Received

- ships a feature branch into dev only

* [bkit-worktrees] refusing to ship dev as a feature branch
*

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:345:19
343| expect(r.code).toBe(7);
344| expect(r.err).toContain("refusing to ship dev");
345| expect(r.err).toContain("ships a feature branch into dev only");
| ^
346| expect(r.err).toContain("releases stay manual");
347| expect(r.err).toContain("Name the feature branch to ship.");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/13]⎯

FAIL .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — ship branch > refuses dev / main as the ship branch
AssertionError: expected '[bkit-worktrees] refusing to ship mai…' to contain 'releases stay manual'

- Expected

* Received

- releases stay manual

* [bkit-worktrees] refusing to ship main as a feature branch
*

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:354:19
352| expect(r.code).toBe(7);
353| expect(r.err).toContain("refusing to ship main");
354| expect(r.err).toContain("releases stay manual");
| ^
355| });
356|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/13]⎯

Test Files 1 failed (1)
Tests 13 failed | 46 passed (59)
Start at 14:19:55
Duration 8.06s (tests 95%, transform 4%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-mpM3zh/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
