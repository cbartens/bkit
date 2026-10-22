> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 27.4 on 10 cores: unit limits 13723ms per test, 27445ms per hook (x2.74)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/steps.test.ts (74 tests | 9 failed) 13292ms
✓ bkit steps done (16)
✓ captures parentSha first, writes the row, then commits on top of it 250ms
✓ --attempt=next advances with each row, so the next parentSha differs 375ms
✓ --commit=none writes the row and leaves it uncommitted 183ms
✓ carries extra fields, parsed as JSON when they are JSON 191ms
✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 101ms
✓ refuses artifact ["--artifact=../outside.md"] before writing anything 112ms
✓ refuses an empty artifact 107ms
✓ rejects ["--verdict=PASS","--failures=1"] 111ms
✓ rejects ["--verdict=FAIL","--failures=0"] 97ms
✓ rejects ["--verdict=MAYBE"] 117ms
✓ rejects ["--strategy=YOLO"] 148ms
✓ rejects ["--failures=-1"] 123ms
✓ rejects ["--field=verdict=PASS"] 134ms
✓ rejects ["--status=SKIPPED"] 102ms
✓ needs a message unless --commit=none 134ms
✓ reports a failed commit with exit 8 after writing the row 1456ms
✓ bkit steps verdict (10)
✓ returns the verdict and every header field 101ms
✓ a missing artifact exits 4 133ms
✓ empty artifact exits 0 114ms
✓ pending artifact exits 1 137ms
✓ no marker artifact exits 2 122ms
✓ disallowed artifact exits 3 107ms
✓ bad failures artifact exits 4 112ms
✓ a required field that is absent is invalid (re-prompt) 108ms
✓ takes the allowed values from the subagent's own prompt 144ms
✓ only reads above the marker 129ms
✓ bkit steps gate (8)
✓ passes after done wrote the row for the artifact 205ms
✓ fails when no row was written for the step 113ms
✓ --ref reads the status file as committed on that ref, not from disk 236ms
✓ --ref exits 3 when the ref does not carry the status file 236ms
✓ fails on a placeholder left in the artifact 235ms
✓ fails when the row's verdict differs from the artifact's 249ms
✓ fails when the row does not list the artifact, or carries another attempt 329ms
✓ fails on a missing artifact 253ms
✓ status row field names (5)
✓ writes attempt 0 rather than dropping it 192ms
✓ refuses a negative or non-integer attempt (2) 101ms
✓ records the complexity verdict as `verdict`, from the agent's own verdict set 143ms
✓ records a create-PR row's URL in artifacts, not a prUrl field 175ms
✓ the ship timeout row keeps its snake_case timeout_s key 103ms
✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
✓ fails a row missing its attempt 122ms
✓ passes attempt 0, and gate --attempt=0 matches it 166ms
✓ fails a diagnose row missing its strategy, passes with it 329ms
✓ fails a run-tests row missing its scope, and an empty scope 433ms
✓ names every missing field at once 111ms
✓ asks nothing of a step that writes none of them 153ms
✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 19ms
✓ placeholderLines (1)
✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
✓ bkit steps finish (10)
✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 238ms
✓ re-asks on a PENDING header (exit 5) and writes nothing 102ms
✓ re-asks (exit 6) when a field the prompt declares is missing 97ms
✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 120ms
✓ pairs agents with artifacts by position: worst verdict, failures summed 148ms
✓ records the header's Strategy on the row 174ms
✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 141ms
✓ fills <done> from the artifact's first DONE line, else the fallback 224ms
✓ rejects --attempt with --attempt-of, and --agent with --verdict 120ms
✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 153ms
✓ bkit steps stub (3)
✓ copies the prior version under a PENDING header 116ms
✓ --strip-header drops the prior version's own header 112ms
✓ exits 4 when the prior version is missing or empty 99ms
❯ bkit steps gate — placeholders, FID, derived attempt (9)
✓ checks held placeholders without a status file (Step 1) 99ms
✓ checks the FID's shape for the wired tracker 131ms
❯ --issue (6)
× gate --issue="" fails the fid check for 123-fix under github 116ms
× gate --issue="" passes the fid check for dev-ci-failures under github 153ms
× gate with --issue=<id> requires the tracker shape and a tracker issue id 108ms
× gate with --issue absent is unchanged: the tracker shape alone 377ms
✓ gate --issue without --fid is a usage error 109ms
× gate --issue="" under none keeps today's check 101ms
✓ --attempt-of checks the row carries the derived counter 192ms
❯ bkit steps done — in-place run with a shared-checkout record (5)
× writeStepRow with a shared-checkout record never commits a recorded path 330ms
× writeStepRow refuses when a recorded path changed 234ms
× writeStepRow appends its commit sha to the record 190ms
× a hook-refused own-path commit exits without staging a recorded path 237ms
✓ without a record the commit is the whole tree, as before 215ms

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
Start at 14:18:34
Duration 14.82s (tests 91%, transform 8%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-7uENuh/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
