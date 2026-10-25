> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/worktrees.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (59 tests | 13 failed) 6672ms
✓ bkit worktrees setup — usage (9)
✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 51ms
✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 42ms
✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 41ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 42ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 45ms
✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 53ms
✓ refuses ["--workflow=build","--month=202610"] 41ms
✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 41ms
✓ refuses outside a git repository 8ms
❯ bkit worktrees setup — adopt in place (10)
✓ works in the main checkout on its own branch: no worktree, no copy, no install 105ms
✓ adopts the main checkout even when called from a linked worktree 133ms
✓ design refuses to work in place on dev 83ms
✓ plan refuses to work in place on dev 82ms
✓ build refuses to work in place on dev 83ms
✓ ship refuses to work in place on dev 78ms
× build in place on main is refused 109ms
× design and plan in place on main are refused 102ms
✓ still adopts a cloud session branch whose upstream is main 124ms
✓ refuses a detached HEAD 78ms
✓ bkit worktrees setup — debug (4)
✓ may debug in place on dev 99ms
✓ never in place on main 67ms
✓ refuses a detached HEAD before anything else 74ms
✓ adopts in place when the session is already on feat/{fid} 127ms
❯ bkit worktrees setup — debug in place on dev (shared-checkout record) (8)
× in-place debug on dev writes the shared-checkout record 101ms
× in-place debug on dev returns startSha and aheadAtStart 114ms
× counts the commits local dev holds beyond origin/dev as aheadAtStart 172ms
× a feature branch run writes no record and no start fields 97ms
× a new run of the same FID rewrites startSha 47ms
× a resume of the same FID reuses the record 40ms
× setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 39ms
× a stale record without a lock is replaced 40ms
❯ bkit worktrees setup — ship branch (5)
✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 373ms
× ship names a missing feat branch 112ms
× ship on dev refuses with the releases-stay-manual text 61ms
× refuses dev / main as the ship branch 57ms
✓ adopts in place when the session is already on the ship branch, even with --worktrees 132ms
✓ bkit worktrees setup — resume guard (6)
✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 97ms
✓ fails with a fetch error when there is no origin to rebase onto 144ms
✓ low disk (2)
✓ stops before minting when free disk stays under bkit.disk.minFreeGb after the max steps 159ms
✓ checks no disk when there are no cleanup step files 145ms
✓ ship resumes without fetching or rebasing, and copies the configured list 173ms
✓ narrates a copy entry that points outside the main checkout and skips it 195ms
✓ paths (2)
✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 57ms
✓ resolves the same marker from inside the worktree 105ms
✓ bkit worktrees remove (12)
✓ answers absent when there is no worktree 72ms
✓ leaves a worktree without the marker in place 98ms
✓ removes a marked worktree with uncommitted changes and clears the marker 152ms
✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 136ms
✓ tells a caller inside the removed worktree where to cd 127ms
✓ fails with its own exit code when git cannot remove a marked path 84ms
✓ --branch (6)
✓ deletes the local and remote branch once the marked worktree is gone 424ms
✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 259ms
✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 249ms
✓ a branch already gone everywhere is reported deleted 184ms
✓ refuses to delete dev (2) 44ms
✓ refuses to delete main (2) 42ms
✓ bkit worktrees setup --detect (3)
✓ refuses --detect with --worktrees 58ms
✓ a runtime that cannot mint worktrees adopts the checkout in place 164ms
✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 409ms

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
- "startSha": "6bdb8869a65c9d2abdfc5c6775e927adfb8b48a3",

* "baseRef": "origin/dev",
* "baseSha": null,
* "branch": "dev",
* "copied": [],
* "copyMissing": [],
* "direnvAllowed": false,
* "installed": false,
* "logDir": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-px9Y45/docs/plans/202610/logs/42-thing",
* "mode": "adopted",
* "owned": false,
* "rebaseConflict": false,
* "repoRoot": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-px9Y45",
* "sentinel": null,
* "worktreePath": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-px9Y45",
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
Start at 14:22:17
Duration 6.99s (tests 97%, transform 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-e91gq9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
