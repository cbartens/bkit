> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts

[test-timeout-budget] load average 11.6 on 10 cores: unit limits 5796ms per test, 11592ms per hook (x1.16)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (7 tests | 6 failed) 2817ms
❯ the push of a debug run in place on dev sends only the run's commits (4)
× push from an ahead local dev lands only the run commits 427ms
× a foreign commit made mid-run never reaches the remote 465ms
× feature-mode push on dev with a record never pushes the foreign commit 487ms
✓ push from a level local dev is a plain push 386ms
❯ the commits of a debug run in place on dev carry only the run's own paths (3)
× foreign staged and untracked files survive a run commit 300ms
× close commit tree excludes foreign files 370ms
× debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not 381ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the push of a debug run in place on dev sends only the run's commits > push from an ahead local dev lands only the run commits
AssertionError: expected { pushed: true, ref: 'dev', …(5) } to match object { pushed: true, ref: 'dev', …(1) }
(4 matching properties omitted from actual)

- Expected

* Received

  {
  "pushed": true,
  "ref": "dev",

- "replayed": true,

* "replayed": false,
  }

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:175:20
173| const r = await push(cwd, "dev");
174| expect(r.code).toBe(0);
175| expect(r.json).toMatchObject({ pushed: true, ref: "dev", replayed:…
| ^
176| expect(r.json.sha).toBe(git(origin, "rev-parse", "dev"));
177| const log = remoteLog(origin);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the push of a debug run in place on dev sends only the run's commits > a foreign commit made mid-run never reaches the remote
AssertionError: expected [ Array(5) ] to not include 'foreign commit made mid-run'
❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:190:35
188| await finishedRun(cwd);
189| await push(cwd, "dev");
190| expect(remoteLog(origin)).not.toContain("foreign commit made mid-r…
| ^
191| // The run's own commit made after the foreign one still went out.
192| expect(remoteLog(origin)).toContain(`chore(${FID}): close`);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the push of a debug run in place on dev sends only the run's commits > feature-mode push on dev with a record never pushes the foreign commit
AssertionError: expected { pushed: true, ref: 'dev', …(5) } to match object { pushed: true, replayed: true }
(5 matching properties omitted from actual)

- Expected

* Received

  {
  "pushed": true,

- "replayed": true,

* "replayed": false,
  }

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:200:20
198| const r = await push(cwd, "feature");
199| expect(r.code).toBe(0);
200| expect(r.json).toMatchObject({ pushed: true, replayed: true });
| ^
201| expect(remoteLog(origin)).not.toContain("foreign local commit");
202| expect(remoteLog(origin)).not.toContain("foreign commit made mid-r…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the commits of a debug run in place on dev carry only the run's own paths > foreign staged and untracked files survive a run commit
AssertionError: expected [ '.bkit/issues.jsonl', …(7) ] to not include 'notes.md'
❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:242:35
240| expect(done.code).toBe(0);
241| expect(git(cwd, "log", "-1", "--format=%s")).toBe(`chore(${FID}): …
    242|     expect(tree(cwd, "HEAD")).not.toContain("notes.md");
       |                                   ^
    243|     for (const p of changed(cwd, "HEAD")) expect(p.startsWith(`${LOGS}…
244| untouched(cwd, foreign);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the commits of a debug run in place on dev carry only the run's own paths > close commit tree excludes foreign files
AssertionError: expected [ '.bkit/issues.jsonl', …(8) ] to not include 'notes.md'
❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:254:35
252| expect(closed.code).toBe(0);
253| expect(git(cwd, "log", "-1", "--format=%s")).toBe(`chore(${FID}): …
254| expect(tree(cwd, "HEAD")).not.toContain("notes.md");
| ^
255| expect(changed(cwd, "HEAD")).not.toEqual(
256| expect.arrayContaining([expect.stringMatching(/^(src\/|notes\.md…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

FAIL .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts > the commits of a debug run in place on dev carry only the run's own paths > debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not
AssertionError: expected [ 'base', 'foreign-row', …(1) ] to deeply equal [ 'base', '650-shared-dev' ]

- Expected

* Received

  [
  "base",

* "foreign-row",
  "650-shared-dev",
  ]

❯ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts:273:49
271| .split("\n")
272| .map((l) => JSON.parse(l) as Record<string, unknown>);
273| expect(committed.map((r) => r.id ?? r.key)).toEqual(["base", FID]);
| ^
274| expect(read(cwd, ISSUES)).toContain('"id":"foreign-row"');
275| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯

Test Files 1 failed (1)
Tests 6 failed | 1 passed (7)
Start at 15:46:10
Duration 3.16s (tests 91%, transform 8%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-QMUne3/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
