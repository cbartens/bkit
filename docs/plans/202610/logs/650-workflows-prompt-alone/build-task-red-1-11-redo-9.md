> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 28.9 on 10 cores: unit limits 14427ms per test, 28853ms per hook (x2.89)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/steps.test.ts (73 tests | 4 failed) 6606ms
✓ bkit steps done (16)
✓ captures parentSha first, writes the row, then commits on top of it 180ms
✓ --attempt=next advances with each row, so the next parentSha differs 189ms
✓ --commit=none writes the row and leaves it uncommitted 97ms
✓ carries extra fields, parsed as JSON when they are JSON 129ms
✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 67ms
✓ refuses artifact ["--artifact=../outside.md"] before writing anything 73ms
✓ refuses an empty artifact 81ms
✓ rejects ["--verdict=PASS","--failures=1"] 70ms
✓ rejects ["--verdict=FAIL","--failures=0"] 70ms
✓ rejects ["--verdict=MAYBE"] 62ms
✓ rejects ["--strategy=YOLO"] 64ms
✓ rejects ["--failures=-1"] 58ms
✓ rejects ["--field=verdict=PASS"] 57ms
✓ rejects ["--status=SKIPPED"] 61ms
✓ needs a message unless --commit=none 70ms
✓ reports a failed commit with exit 8 after writing the row 268ms
✓ bkit steps verdict (10)
✓ returns the verdict and every header field 60ms
✓ a missing artifact exits 4 57ms
✓ empty artifact exits 0 60ms
✓ pending artifact exits 1 56ms
✓ no marker artifact exits 2 62ms
✓ disallowed artifact exits 3 61ms
✓ bad failures artifact exits 4 58ms
✓ a required field that is absent is invalid (re-prompt) 57ms
✓ takes the allowed values from the subagent's own prompt 59ms
✓ only reads above the marker 56ms
✓ bkit steps gate (8)
✓ passes after done wrote the row for the artifact 105ms
✓ fails when no row was written for the step 49ms
✓ --ref reads the status file as committed on that ref, not from disk 110ms
✓ --ref exits 3 when the ref does not carry the status file 111ms
✓ fails on a placeholder left in the artifact 111ms
✓ fails when the row's verdict differs from the artifact's 109ms
✓ fails when the row does not list the artifact, or carries another attempt 113ms
✓ fails on a missing artifact 108ms
✓ status row field names (5)
✓ writes attempt 0 rather than dropping it 109ms
✓ refuses a negative or non-integer attempt (2) 66ms
✓ records the complexity verdict as `verdict`, from the agent's own verdict set 78ms
✓ records a create-PR row's URL in artifacts, not a prUrl field 74ms
✓ the ship timeout row keeps its snake_case timeout_s key 67ms
✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
✓ fails a row missing its attempt 75ms
✓ passes attempt 0, and gate --attempt=0 matches it 72ms
✓ fails a diagnose row missing its strategy, passes with it 131ms
✓ fails a run-tests row missing its scope, and an empty scope 215ms
✓ names every missing field at once 76ms
✓ asks nothing of a step that writes none of them 76ms
✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 8ms
✓ placeholderLines (1)
✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
✓ bkit steps finish (10)
✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 144ms
✓ re-asks on a PENDING header (exit 5) and writes nothing 62ms
✓ re-asks (exit 6) when a field the prompt declares is missing 65ms
✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 66ms
✓ pairs agents with artifacts by position: worst verdict, failures summed 69ms
✓ records the header's Strategy on the row 65ms
✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 74ms
✓ fills <done> from the artifact's first DONE line, else the fallback 132ms
✓ rejects --attempt with --attempt-of, and --agent with --verdict 59ms
✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 96ms
✓ bkit steps stub (3)
✓ copies the prior version under a PENDING header 59ms
✓ --strip-header drops the prior version's own header 55ms
✓ exits 4 when the prior version is missing or empty 55ms
✓ bkit steps gate — placeholders, FID, derived attempt (9)
✓ checks held placeholders without a status file (Step 1) 57ms
✓ checks the FID's shape for the wired tracker 74ms
✓ --issue (6)
✓ gate --issue="" fails the fid check for 123-fix under github 63ms
✓ gate --issue="" passes the fid check for dev-ci-failures under github 68ms
✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 240ms
✓ gate with --issue absent is unchanged: the tracker shape alone 171ms
✓ gate --issue without --fid is a usage error 52ms
✓ gate --issue="" under none keeps today's check 62ms
✓ --attempt-of checks the row carries the derived counter 105ms
❯ bkit steps done — a run in place on dev that shares its checkout (4)
× writeStepRow with a shared-checkout record never commits a recorded path 131ms
× writeStepRow refuses when a recorded path changed 132ms
× writeStepRow appends its commit sha to the record 131ms
× a hook-refused own-path commit exits without staging a recorded path 269ms

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
  "56a778e8667bc98fda8822fa24f7abc933223ed7",
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
Start at 15:44:59
Duration 7.39s (tests 91%, transform 7%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-vDDlII/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
