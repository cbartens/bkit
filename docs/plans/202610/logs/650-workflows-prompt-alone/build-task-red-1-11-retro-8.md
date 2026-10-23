> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 26.6 on 10 cores: unit limits 13277ms per test, 26553ms per hook (x2.66)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/steps.test.ts (74 tests | 9 failed) 7032ms
✓ bkit steps done (16)
✓ captures parentSha first, writes the row, then commits on top of it 176ms
✓ --attempt=next advances with each row, so the next parentSha differs 193ms
✓ --commit=none writes the row and leaves it uncommitted 97ms
✓ carries extra fields, parsed as JSON when they are JSON 131ms
✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 70ms
✓ refuses artifact ["--artifact=../outside.md"] before writing anything 76ms
✓ refuses an empty artifact 74ms
✓ rejects ["--verdict=PASS","--failures=1"] 78ms
✓ rejects ["--verdict=FAIL","--failures=0"] 72ms
✓ rejects ["--verdict=MAYBE"] 80ms
✓ rejects ["--strategy=YOLO"] 68ms
✓ rejects ["--failures=-1"] 83ms
✓ rejects ["--field=verdict=PASS"] 136ms
✓ rejects ["--status=SKIPPED"] 70ms
✓ needs a message unless --commit=none 79ms
✓ reports a failed commit with exit 8 after writing the row 285ms
✓ bkit steps verdict (10)
✓ returns the verdict and every header field 67ms
✓ a missing artifact exits 4 61ms
✓ empty artifact exits 0 63ms
✓ pending artifact exits 1 70ms
✓ no marker artifact exits 2 63ms
✓ disallowed artifact exits 3 65ms
✓ bad failures artifact exits 4 69ms
✓ a required field that is absent is invalid (re-prompt) 69ms
✓ takes the allowed values from the subagent's own prompt 61ms
✓ only reads above the marker 55ms
✓ bkit steps gate (8)
✓ passes after done wrote the row for the artifact 111ms
✓ fails when no row was written for the step 58ms
✓ --ref reads the status file as committed on that ref, not from disk 121ms
✓ --ref exits 3 when the ref does not carry the status file 135ms
✓ fails on a placeholder left in the artifact 122ms
✓ fails when the row's verdict differs from the artifact's 114ms
✓ fails when the row does not list the artifact, or carries another attempt 108ms
✓ fails on a missing artifact 132ms
✓ status row field names (5)
✓ writes attempt 0 rather than dropping it 112ms
✓ refuses a negative or non-integer attempt (2) 58ms
✓ records the complexity verdict as `verdict`, from the agent's own verdict set 68ms
✓ records a create-PR row's URL in artifacts, not a prUrl field 81ms
✓ the ship timeout row keeps its snake_case timeout_s key 62ms
✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
✓ fails a row missing its attempt 65ms
✓ passes attempt 0, and gate --attempt=0 matches it 74ms
✓ fails a diagnose row missing its strategy, passes with it 134ms
✓ fails a run-tests row missing its scope, and an empty scope 181ms
✓ names every missing field at once 56ms
✓ asks nothing of a step that writes none of them 56ms
✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 11ms
✓ placeholderLines (1)
✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
✓ bkit steps finish (10)
✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 109ms
✓ re-asks on a PENDING header (exit 5) and writes nothing 52ms
✓ re-asks (exit 6) when a field the prompt declares is missing 49ms
✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 57ms
✓ pairs agents with artifacts by position: worst verdict, failures summed 73ms
✓ records the header's Strategy on the row 69ms
✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 73ms
✓ fills <done> from the artifact's first DONE line, else the fallback 144ms
✓ rejects --attempt with --attempt-of, and --agent with --verdict 72ms
✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 101ms
✓ bkit steps stub (3)
✓ copies the prior version under a PENDING header 74ms
✓ --strip-header drops the prior version's own header 72ms
✓ exits 4 when the prior version is missing or empty 84ms
❯ bkit steps gate — placeholders, FID, derived attempt (9)
✓ checks held placeholders without a status file (Step 1) 77ms
✓ checks the FID's shape for the wired tracker 92ms
❯ --issue (6)
× gate --issue="" fails the fid check for 123-fix under github 82ms
× gate --issue="" passes the fid check for dev-ci-failures under github 76ms
× gate with --issue=<id> requires the tracker shape and a tracker issue id 70ms
× gate with --issue absent is unchanged: the tracker shape alone 235ms
✓ gate --issue without --fid is a usage error 78ms
× gate --issue="" under none keeps today's check 71ms
✓ --attempt-of checks the row carries the derived counter 149ms
❯ bkit steps done — in-place run with a shared-checkout record (5)
× writeStepRow with a shared-checkout record never commits a recorded path 168ms
× writeStepRow refuses when a recorded path changed 157ms
× writeStepRow appends its commit sha to the record 156ms
× a hook-refused own-path commit exits without staging a recorded path 161ms
✓ without a record the commit is the whole tree, as before 155ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 9 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps gate — placeholders, FID, derived attempt > --issue > gate --issue="" fails the fid check for 123-fix under github
AssertionError: expected 2 to be 1 // Object.is equality

- Expected

* Received

- 1

* 2

❯ .bkit/core/engine/commands/workflow/steps.test.ts:820:22
818| it('gate --issue="" fails the fid check for 123-fix under github',…
819| const r = await gate(wired(), "123-fix", "--issue=");
820| expect(r.code).toBe(1);
| ^
821| expect(r.json.checks[0]).toMatchObject({ check: "fid 123-fix", o…
822| expect(r.err).toContain("issue-less");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/9]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps gate — placeholders, FID, derived attempt > --issue > gate --issue="" passes the fid check for dev-ci-failures under github
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/steps.test.ts:827:22
825| it('gate --issue="" passes the fid check for dev-ci-failures under…
826| const r = await gate(wired(), "dev-ci-failures", "--issue=");
827| expect(r.code).toBe(0);
| ^
828| expect(r.json.checks[0]).toMatchObject({ check: "fid dev-ci-fail…
829| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/9]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps gate — placeholders, FID, derived attempt > --issue > gate with --issue=<id> requires the tracker shape and a tracker issue id
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/steps.test.ts:832:66
830|
831| it("gate with --issue=<id> requires the tracker shape and a tracke…
832| expect((await gate(wired(), "650-x", "--issue=650")).code).toBe(…
| ^
833| expect((await gate(wired(), "dev-ci", "--issue=650")).code).toBe…
834| expect((await gate(wired(), "650-x", "--issue=ABC-1")).code).toB…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/9]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps gate — placeholders, FID, derived attempt > --issue > gate with --issue absent is unchanged: the tracker shape alone
AssertionError: expected 2 to be 1 // Object.is equality

- Expected

* Received

- 1

* 2

❯ .bkit/core/engine/commands/workflow/steps.test.ts:841:65
839| expect((await gate(wired(), "650-x")).code).toBe(0);
840| expect((await gate(wired(), "dev-ci-failures")).code).toBe(1);
841| expect((await gate(wired(), "123-fix", "--issue=")).code).toBe(1…
| ^
842| });
843|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/9]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps gate — placeholders, FID, derived attempt > --issue > gate --issue="" under none keeps today's check
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/steps.test.ts:859:64
857|
858| it('gate --issue="" under none keeps today\'s check', async () => {
859| expect((await gate(repo(), "123-fix", "--issue=")).code).toBe(0);
| ^
860| });
861| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/9]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps done — in-place run with a shared-checkout record > writeStepRow with a shared-checkout record never commits a recorded path
TypeError: newRecord is not a function
❯ sharedRepo .bkit/core/engine/commands/workflow/steps.test.ts:901:22
899| write(cwd, "src/staged.txt", "s\nforeign staged\n");
900| git(cwd, "add", "src/staged.txt");
901| writeRecord(cwd, newRecord(cwd, FID, "dev"));
| ^
902| fs.mkdirSync(path.join(cwd, LOGS), { recursive: true });
903| write(cwd, `${LOGS}/verify-1.md`, "Verdict: PASS\nFailures: 0\n\n<…
❯ .bkit/core/engine/commands/workflow/steps.test.ts:920:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/9]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps done — in-place run with a shared-checkout record > writeStepRow refuses when a recorded path changed
TypeError: newRecord is not a function
❯ sharedRepo .bkit/core/engine/commands/workflow/steps.test.ts:901:22
899| write(cwd, "src/staged.txt", "s\nforeign staged\n");
900| git(cwd, "add", "src/staged.txt");
901| writeRecord(cwd, newRecord(cwd, FID, "dev"));
| ^
902| fs.mkdirSync(path.join(cwd, LOGS), { recursive: true });
903| write(cwd, `${LOGS}/verify-1.md`, "Verdict: PASS\nFailures: 0\n\n<…
❯ .bkit/core/engine/commands/workflow/steps.test.ts:929:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/9]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps done — in-place run with a shared-checkout record > writeStepRow appends its commit sha to the record
TypeError: newRecord is not a function
❯ sharedRepo .bkit/core/engine/commands/workflow/steps.test.ts:901:22
899| write(cwd, "src/staged.txt", "s\nforeign staged\n");
900| git(cwd, "add", "src/staged.txt");
901| writeRecord(cwd, newRecord(cwd, FID, "dev"));
| ^
902| fs.mkdirSync(path.join(cwd, LOGS), { recursive: true });
903| write(cwd, `${LOGS}/verify-1.md`, "Verdict: PASS\nFailures: 0\n\n<…
❯ .bkit/core/engine/commands/workflow/steps.test.ts:940:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/9]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps done — in-place run with a shared-checkout record > a hook-refused own-path commit exits without staging a recorded path
TypeError: newRecord is not a function
❯ sharedRepo .bkit/core/engine/commands/workflow/steps.test.ts:901:22
899| write(cwd, "src/staged.txt", "s\nforeign staged\n");
900| git(cwd, "add", "src/staged.txt");
901| writeRecord(cwd, newRecord(cwd, FID, "dev"));
| ^
902| fs.mkdirSync(path.join(cwd, LOGS), { recursive: true });
903| write(cwd, `${LOGS}/verify-1.md`, "Verdict: PASS\nFailures: 0\n\n<…
❯ .bkit/core/engine/commands/workflow/steps.test.ts:947:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/9]⎯

Test Files 1 failed (1)
Tests 9 failed | 65 passed (74)
Start at 14:20:11
Duration 7.62s (tests 93%, transform 6%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ShLxy7/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
