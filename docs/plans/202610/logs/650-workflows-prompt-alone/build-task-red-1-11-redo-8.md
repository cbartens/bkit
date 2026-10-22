> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 31.4 on 10 cores: unit limits 15723ms per test, 31446ms per hook (x3.14)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/steps.test.ts (73 tests | 4 failed) 7171ms
✓ bkit steps done (16)
✓ captures parentSha first, writes the row, then commits on top of it 188ms
✓ --attempt=next advances with each row, so the next parentSha differs 211ms
✓ --commit=none writes the row and leaves it uncommitted 95ms
✓ carries extra fields, parsed as JSON when they are JSON 134ms
✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 77ms
✓ refuses artifact ["--artifact=../outside.md"] before writing anything 70ms
✓ refuses an empty artifact 122ms
✓ rejects ["--verdict=PASS","--failures=1"] 79ms
✓ rejects ["--verdict=FAIL","--failures=0"] 68ms
✓ rejects ["--verdict=MAYBE"] 75ms
✓ rejects ["--strategy=YOLO"] 68ms
✓ rejects ["--failures=-1"] 72ms
✓ rejects ["--field=verdict=PASS"] 73ms
✓ rejects ["--status=SKIPPED"] 74ms
✓ needs a message unless --commit=none 81ms
✓ reports a failed commit with exit 8 after writing the row 754ms
✓ bkit steps verdict (10)
✓ returns the verdict and every header field 45ms
✓ a missing artifact exits 4 42ms
✓ empty artifact exits 0 46ms
✓ pending artifact exits 1 43ms
✓ no marker artifact exits 2 42ms
✓ disallowed artifact exits 3 43ms
✓ bad failures artifact exits 4 48ms
✓ a required field that is absent is invalid (re-prompt) 48ms
✓ takes the allowed values from the subagent's own prompt 50ms
✓ only reads above the marker 56ms
✓ bkit steps gate (8)
✓ passes after done wrote the row for the artifact 97ms
✓ fails when no row was written for the step 50ms
✓ --ref reads the status file as committed on that ref, not from disk 100ms
✓ --ref exits 3 when the ref does not carry the status file 101ms
✓ fails on a placeholder left in the artifact 103ms
✓ fails when the row's verdict differs from the artifact's 105ms
✓ fails when the row does not list the artifact, or carries another attempt 102ms
✓ fails on a missing artifact 96ms
✓ status row field names (5)
✓ writes attempt 0 rather than dropping it 112ms
✓ refuses a negative or non-integer attempt (2) 53ms
✓ records the complexity verdict as `verdict`, from the agent's own verdict set 72ms
✓ records a create-PR row's URL in artifacts, not a prUrl field 61ms
✓ the ship timeout row keeps its snake_case timeout_s key 60ms
✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
✓ fails a row missing its attempt 66ms
✓ passes attempt 0, and gate --attempt=0 matches it 62ms
✓ fails a diagnose row missing its strategy, passes with it 116ms
✓ fails a run-tests row missing its scope, and an empty scope 189ms
✓ names every missing field at once 66ms
✓ asks nothing of a step that writes none of them 70ms
✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 12ms
✓ placeholderLines (1)
✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
✓ bkit steps finish (10)
✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 128ms
✓ re-asks on a PENDING header (exit 5) and writes nothing 55ms
✓ re-asks (exit 6) when a field the prompt declares is missing 51ms
✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 50ms
✓ pairs agents with artifacts by position: worst verdict, failures summed 59ms
✓ records the header's Strategy on the row 67ms
✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 72ms
✓ fills <done> from the artifact's first DONE line, else the fallback 120ms
✓ rejects --attempt with --attempt-of, and --agent with --verdict 59ms
✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 80ms
✓ bkit steps stub (3)
✓ copies the prior version under a PENDING header 59ms
✓ --strip-header drops the prior version's own header 62ms
✓ exits 4 when the prior version is missing or empty 63ms
✓ bkit steps gate — placeholders, FID, derived attempt (9)
✓ checks held placeholders without a status file (Step 1) 65ms
✓ checks the FID's shape for the wired tracker 81ms
✓ --issue (6)
✓ gate --issue="" fails the fid check for 123-fix under github 69ms
✓ gate --issue="" passes the fid check for dev-ci-failures under github 73ms
✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 291ms
✓ gate with --issue absent is unchanged: the tracker shape alone 215ms
✓ gate --issue without --fid is a usage error 59ms
✓ gate --issue="" under none keeps today's check 73ms
✓ --attempt-of checks the row carries the derived counter 118ms
❯ bkit steps done — a run in place on dev that shares its checkout (4)
× writeStepRow with a shared-checkout record never commits a recorded path 163ms
× writeStepRow refuses when a recorded path changed 152ms
× writeStepRow appends its commit sha to the record 176ms
× a hook-refused own-path commit exits without staging a recorded path 311ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps done — a run in place on dev that shares its checkout > writeStepRow with a shared-checkout record never commits a recorded path
AssertionError: expected [ …(5) ] to deeply equal [ …(2) ]

- Expected

* Received

  [
  "docs/plans/202610/logs/650-shared/status.jsonl",
  "docs/plans/202610/logs/650-shared/verify-1.md",

* "notes.md",
* "src/a.txt",
* "src/staged.txt",
  ]

❯ .bkit/core/engine/commands/workflow/steps.test.ts:929:28
927| const r = await step(cwd);
928| expect(r.code).toBe(0);
929| expect(committed(cwd)).toEqual([`${LOGS}/status.jsonl`, `${LOGS}/v…
| ^
930| expect(staged(cwd)).toBe("src/staged.txt");
931| expect(fs.readFileSync(path.join(cwd, "src/a.txt"), "utf-8")).toBe…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps done — a run in place on dev that shares its checkout > writeStepRow refuses when a recorded path changed
AssertionError: expected +0 to be 10 // Object.is equality

- Expected

* Received

- 10

* 0

❯ .bkit/core/engine/commands/workflow/steps.test.ts:939:20
937| write(cwd, "src/a.txt", "a\nforeign\nedited mid-run\n");
938| const r = await step(cwd);
939| expect(r.code).toBe(10);
| ^
940| expect(r.err).toContain("src/a.txt");
941| expect(git(cwd, "rev-parse", "HEAD")).toBe(head);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps done — a run in place on dev that shares its checkout > writeStepRow appends its commit sha to the record
AssertionError: expected undefined to deeply equal [ Array(1) ]

- Expected:
  [
  "d4badf7c420ad0e3458efce852dbe086fbf4f794",
  ]

* Received:
  undefined

❯ .bkit/core/engine/commands/workflow/steps.test.ts:948:43
946| const r = await step(cwd);
947| expect(r.code).toBe(0);
948| expect(readRecord(cwd, FID)?.commits).toEqual([git(cwd, "rev-parse…
| ^
949| });
950|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps done — a run in place on dev that shares its checkout > a hook-refused own-path commit exits without staging a recorded path
AssertionError: expected 'docs/plans/202610/logs/650-shared/sta…' to be 'src/staged.txt' // Object.is equality

- Expected

* Received

* docs/plans/202610/logs/650-shared/status.jsonl
* docs/plans/202610/logs/650-shared/verify-1.md
* notes.md
* src/a.txt
  src/staged.txt

❯ .bkit/core/engine/commands/workflow/steps.test.ts:960:25
958| expect(r.code).toBe(8);
959| expect(r.err).toContain("blocked");
960| expect(staged(cwd)).toBe("src/staged.txt");
| ^
961| expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
962| expect(readRecord(cwd, FID)?.commits ?? []).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯

Test Files 1 failed (1)
Tests 4 failed | 69 passed (73)
Start at 15:44:51
Duration 8.00s (tests 91%, transform 8%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-YQImPm/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
