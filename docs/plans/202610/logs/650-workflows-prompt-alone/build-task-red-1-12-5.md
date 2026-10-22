> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (8 tests | 4 failed) 3685ms
✓ a debug run in place on dev shares its checkout with foreign work (4)
✓ foreign staged and untracked files survive a run commit 408ms
✓ close commit tree excludes foreign files 506ms
✓ debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not 531ms
✓ a pre-dirty file changed during the run is refused with exit 10 and nothing is committed 297ms
❯ the push of a debug run in place on dev sends only the run's commits (4)
× push from an ahead local dev lands only the run commits 555ms
× a foreign commit made mid-run never reaches the remote 493ms
× feature-mode push on dev with a record never pushes the foreign commit 521ms
× push from a level local dev is a plain push 373ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the push of a debug run in place on dev sends only the run's commits > push from an ahead local dev lands only the run commits
AssertionError: expected { pushed: true, ref: 'dev', …(4) } to match object { pushed: true, ref: 'dev', …(1) }
(4 matching properties omitted from actual)

- Expected

* Received

  {
  "pushed": true,
  "ref": "dev",

- "replayed": true,
  }

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:266:20
264| const r = await push(cwd, "dev");
265| expect(r.code).toBe(0);
266| expect(r.json).toMatchObject({ pushed: true, ref: "dev", replayed:…
| ^
267| expect(r.json.sha).toBe(git(origin, "rev-parse", "dev"));
268| const log = remoteLog(origin);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the push of a debug run in place on dev sends only the run's commits > a foreign commit made mid-run never reaches the remote
AssertionError: expected [ Array(5) ] to not include 'foreign commit made mid-run'
❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:281:35
279| await finishedRun(cwd);
280| await push(cwd, "dev");
281| expect(remoteLog(origin)).not.toContain("foreign commit made mid-r…
| ^
282| // The run's own commit made after the foreign one still went out.
283| expect(remoteLog(origin)).toContain(`chore(${FID}): close`);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the push of a debug run in place on dev sends only the run's commits > feature-mode push on dev with a record never pushes the foreign commit
AssertionError: expected { pushed: true, ref: 'dev', …(4) } to match object { pushed: true, replayed: true }
(5 matching properties omitted from actual)

- Expected

* Received

  {
  "pushed": true,

- "replayed": true,
  }

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:291:20
289| const r = await push(cwd, "feature");
290| expect(r.code).toBe(0);
291| expect(r.json).toMatchObject({ pushed: true, replayed: true });
| ^
292| expect(remoteLog(origin)).not.toContain("foreign local commit");
293| expect(remoteLog(origin)).not.toContain("foreign commit made mid-r…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the push of a debug run in place on dev sends only the run's commits > push from a level local dev is a plain push
AssertionError: expected { pushed: true, ref: 'dev', …(4) } to match object { pushed: true, replayed: false }
(5 matching properties omitted from actual)

- Expected

* Received

  {
  "pushed": true,

- "replayed": false,
  }

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:303:20
301| const r = await push(cwd, "dev");
302| expect(r.code).toBe(0);
303| expect(r.json).toMatchObject({ pushed: true, replayed: false });
| ^
304| expect(r.json.sha).toBe(git(cwd, "rev-parse", "HEAD"));
305| expect(git(origin, "rev-parse", "dev")).toBe(git(cwd, "rev-parse",…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯

Test Files 1 failed (1)
Tests 4 failed | 4 passed (8)
Start at 13:19:39
Duration 4.00s (tests 93%, transform 6%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-qCbqP1/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
