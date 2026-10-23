> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts

[test-timeout-budget] load average 10.6 on 10 cores: unit limits 5311ms per test, 10622ms per hook (x1.06)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (8 tests | 8 failed) 4301ms
❯ a debug run in place on dev shares its checkout with foreign work (4)
× foreign staged and untracked files survive a run commit 385ms
× close commit tree excludes foreign files 638ms
× debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not 644ms
× a pre-dirty file changed during the run is refused with exit 10 and nothing is committed 437ms
❯ the push of a debug run in place on dev sends only the run's commits (4)
× push from an ahead local dev lands only the run commits 689ms
× a foreign commit made mid-run never reaches the remote 611ms
× feature-mode push on dev with a record never pushes the foreign commit 565ms
× push from a level local dev is a plain push 329ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > a debug run in place on dev shares its checkout with foreign work > foreign staged and untracked files survive a run commit
AssertionError: expected undefined to be 1 // Object.is equality

- Expected:
  1

* Received:
  undefined

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:153:37
151| const { cwd, foreign } = fixture();
152| const { setup } = await startRun(cwd);
153| expect(setup.json.aheadAtStart).toBe(1);
| ^
154| const done = await step(cwd);
155| expect(done.code).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > a debug run in place on dev shares its checkout with foreign work > close commit tree excludes foreign files
AssertionError: expected '.bkit/issues.jsonl\n.bkit/stats.jsonl…' not to contain 'notes.md'

- Expected

* Received

* .bkit/issues.jsonl
* .bkit/stats.jsonl
* .bkit/version
* docs/plans/202610/logs/650-shared-dev/.lock
* docs/plans/202610/logs/650-shared-dev/status.jsonl
* docs/plans/202610/logs/650-shared-dev/verify-1.md
  notes.md
* src/a.txt
* src/staged.txt

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:196:66
194| expect(closeFiles).toContain(`${LOGS}/status.jsonl`);
195| for (const rel of Object.keys(foreign)) expect(closeFiles).not.toC…
196| expect(git(cwd, "ls-tree", "-r", "--name-only", "HEAD")).not.toCon…
| ^
197| untouched(cwd, foreign);
198| expect(readRecord(cwd, FID)).not.toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > a debug run in place on dev shares its checkout with foreign work > debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not
AssertionError: expected '{"id":"base"}\n{"id":"foreign-row"}\n…' not to contain 'foreign-row'

- Expected

* Received

- foreign-row

* {"id":"base"}
* {"id":"foreign-row"}
* {"ts":1792642919005,"kind":"feature","repo":"bkit-shared-yTGzz8/origin","bkitVersion":"5.5.0","workflow":"debug","step":"debug-close-workflow","key":"650-shared-dev","category":"agentic","description":"Debug closed for 650-shared-dev","status":"DEBUGGED"}

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:221:27
219| expect(committed).toContain('"base"');
220| expect(committed).toContain(FID);
221| expect(committed).not.toContain("foreign-row");
| ^
222| // The working file still carries the foreign row, uncommitted.
223| expect(read(cwd, ISSUES)).toContain("foreign-row");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > a debug run in place on dev shares its checkout with foreign work > a pre-dirty file changed during the run is refused with exit 10 and nothing is committed
AssertionError: expected +0 to be 10 // Object.is equality

- Expected

* Received

- 10

* 0

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:233:23
231| const before = git(cwd, "rev-parse", "HEAD");
232| const done = await step(cwd);
233| expect(done.code).toBe(10);
| ^
234| expect(done.err).toContain("notes.md");
235| expect(git(cwd, "rev-parse", "HEAD")).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the push of a debug run in place on dev sends only the run's commits > push from an ahead local dev lands only the run commits
TypeError: recordOnBranch is not a function
❯ pushBranch .bkit/core/engine/commands/workflow/branches.ts:606:24
604| }
605| const shared = isSharedBranch(branch);
606| const rec = shared ? recordOnBranch(cwd, branch) : null;
| ^
607| if (o.requireCi === true) {
608| // With a record, the commit that reaches the remote last is the r…
❯ Object.pushVerb [as run] .bkit/core/engine/commands/workflow/branches.ts:813:19
❯ runCommand .bkit/core/engine/commands/lib.ts:322:23
❯ bkit .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:52:22
❯ push .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:259:47
❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:264:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the push of a debug run in place on dev sends only the run's commits > a foreign commit made mid-run never reaches the remote
TypeError: recordOnBranch is not a function
❯ pushBranch .bkit/core/engine/commands/workflow/branches.ts:606:24
604| }
605| const shared = isSharedBranch(branch);
606| const rec = shared ? recordOnBranch(cwd, branch) : null;
| ^
607| if (o.requireCi === true) {
608| // With a record, the commit that reaches the remote last is the r…
❯ Object.pushVerb [as run] .bkit/core/engine/commands/workflow/branches.ts:813:19
❯ runCommand .bkit/core/engine/commands/lib.ts:322:23
❯ bkit .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:52:22
❯ push .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:259:47
❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:280:11

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the push of a debug run in place on dev sends only the run's commits > feature-mode push on dev with a record never pushes the foreign commit
TypeError: recordOnBranch is not a function
❯ pushBranch .bkit/core/engine/commands/workflow/branches.ts:606:24
604| }
605| const shared = isSharedBranch(branch);
606| const rec = shared ? recordOnBranch(cwd, branch) : null;
| ^
607| if (o.requireCi === true) {
608| // With a record, the commit that reaches the remote last is the r…
❯ Object.pushVerb [as run] .bkit/core/engine/commands/workflow/branches.ts:813:19
❯ runCommand .bkit/core/engine/commands/lib.ts:322:23
❯ bkit .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:52:22
❯ push .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:259:47
❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:289:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the push of a debug run in place on dev sends only the run's commits > push from a level local dev is a plain push
TypeError: recordOnBranch is not a function
❯ pushBranch .bkit/core/engine/commands/workflow/branches.ts:606:24
604| }
605| const shared = isSharedBranch(branch);
606| const rec = shared ? recordOnBranch(cwd, branch) : null;
| ^
607| if (o.requireCi === true) {
608| // With a record, the commit that reaches the remote last is the r…
❯ Object.pushVerb [as run] .bkit/core/engine/commands/workflow/branches.ts:813:19
❯ runCommand .bkit/core/engine/commands/lib.ts:322:23
❯ bkit .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:52:22
❯ push .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:259:47
❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:301:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯

Test Files 1 failed (1)
Tests 8 failed (8)
Start at 14:21:56
Duration 4.95s (tests 89%, transform 10%, import 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-6JQIoQ/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
