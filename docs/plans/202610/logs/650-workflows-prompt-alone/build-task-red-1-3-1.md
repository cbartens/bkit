> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/steps.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/steps.test.ts (68 tests | 5 failed) 3086ms
✓ bkit steps done (16)
✓ captures parentSha first, writes the row, then commits on top of it 80ms
✓ --attempt=next advances with each row, so the next parentSha differs 81ms
✓ --commit=none writes the row and leaves it uncommitted 38ms
✓ carries extra fields, parsed as JSON when they are JSON 58ms
✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 31ms
✓ refuses artifact ["--artifact=../outside.md"] before writing anything 31ms
✓ refuses an empty artifact 31ms
✓ rejects ["--verdict=PASS","--failures=1"] 31ms
✓ rejects ["--verdict=FAIL","--failures=0"] 32ms
✓ rejects ["--verdict=MAYBE"] 32ms
✓ rejects ["--strategy=YOLO"] 31ms
✓ rejects ["--failures=-1"] 31ms
✓ rejects ["--field=verdict=PASS"] 30ms
✓ rejects ["--status=SKIPPED"] 30ms
✓ needs a message unless --commit=none 33ms
✓ reports a failed commit with exit 8 after writing the row 409ms
✓ bkit steps verdict (10)
✓ returns the verdict and every header field 48ms
✓ a missing artifact exits 4 31ms
✓ empty artifact exits 0 27ms
✓ pending artifact exits 1 27ms
✓ no marker artifact exits 2 28ms
✓ disallowed artifact exits 3 27ms
✓ bad failures artifact exits 4 30ms
✓ a required field that is absent is invalid (re-prompt) 31ms
✓ takes the allowed values from the subagent's own prompt 36ms
✓ only reads above the marker 29ms
✓ bkit steps gate (8)
✓ passes after done wrote the row for the artifact 56ms
✓ fails when no row was written for the step 30ms
✓ --ref reads the status file as committed on that ref, not from disk 63ms
✓ --ref exits 3 when the ref does not carry the status file 63ms
✓ fails on a placeholder left in the artifact 55ms
✓ fails when the row's verdict differs from the artifact's 54ms
✓ fails when the row does not list the artifact, or carries another attempt 55ms
✓ fails on a missing artifact 55ms
✓ status row field names (5)
✓ writes attempt 0 rather than dropping it 57ms
✓ refuses a negative or non-integer attempt (2) 29ms
✓ records the complexity verdict as `verdict`, from the agent's own verdict set 33ms
✓ records a create-PR row's URL in artifacts, not a prUrl field 34ms
✓ the ship timeout row keeps its snake_case timeout_s key 30ms
✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
✓ fails a row missing its attempt 34ms
✓ passes attempt 0, and gate --attempt=0 matches it 33ms
✓ fails a diagnose row missing its strategy, passes with it 68ms
✓ fails a run-tests row missing its scope, and an empty scope 99ms
✓ names every missing field at once 34ms
✓ asks nothing of a step that writes none of them 33ms
✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 8ms
✓ placeholderLines (1)
✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 0ms
✓ bkit steps finish (10)
✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 66ms
✓ re-asks on a PENDING header (exit 5) and writes nothing 30ms
✓ re-asks (exit 6) when a field the prompt declares is missing 30ms
✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 28ms
✓ pairs agents with artifacts by position: worst verdict, failures summed 35ms
✓ records the header's Strategy on the row 33ms
✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 39ms
✓ fills <done> from the artifact's first DONE line, else the fallback 60ms
✓ rejects --attempt with --attempt-of, and --agent with --verdict 29ms
✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 49ms
✓ bkit steps stub (3)
✓ copies the prior version under a PENDING header 31ms
✓ --strip-header drops the prior version's own header 31ms
✓ exits 4 when the prior version is missing or empty 30ms
❯ bkit steps gate — placeholders, FID, derived attempt (8)
✓ checks held placeholders without a status file (Step 1) 30ms
✓ checks the FID's shape for the wired tracker 38ms
❯ --issue (5)
× gate --issue="" fails the fid check for 123-fix under github 32ms
× gate --issue="" passes the fid check for dev-ci-failures under github 31ms
× gate with --issue=<id> requires the tracker shape and a tracker issue id 30ms
× gate with --issue absent is unchanged: the tracker shape alone 98ms
× gate --issue="" under none keeps today's check 29ms
✓ --attempt-of checks the row carries the derived counter 56ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps gate — placeholders, FID, derived attempt > --issue > gate --issue="" fails the fid check for 123-fix under github
AssertionError: expected 2 to be 1 // Object.is equality

- Expected

* Received

- 1

* 2

❯ .bkit/core/engine/commands/workflow/steps.test.ts:819:22
817| it('gate --issue="" fails the fid check for 123-fix under github',…
818| const r = await gate(wired(), "123-fix", "--issue=");
819| expect(r.code).toBe(1);
| ^
820| expect(r.json.checks[0]).toMatchObject({ check: "fid 123-fix", o…
821| expect(r.err).toContain("issue-less");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps gate — placeholders, FID, derived attempt > --issue > gate --issue="" passes the fid check for dev-ci-failures under github
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/steps.test.ts:826:22
824| it('gate --issue="" passes the fid check for dev-ci-failures under…
825| const r = await gate(wired(), "dev-ci-failures", "--issue=");
826| expect(r.code).toBe(0);
| ^
827| expect(r.json.checks[0]).toMatchObject({ check: "fid dev-ci-fail…
828| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps gate — placeholders, FID, derived attempt > --issue > gate with --issue=<id> requires the tracker shape and a tracker issue id
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/steps.test.ts:831:66
829|
830| it("gate with --issue=<id> requires the tracker shape and a tracke…
831| expect((await gate(wired(), "650-x", "--issue=650")).code).toBe(…
| ^
832| expect((await gate(wired(), "dev-ci", "--issue=650")).code).toBe…
833| expect((await gate(wired(), "650-x", "--issue=ABC-1")).code).toB…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps gate — placeholders, FID, derived attempt > --issue > gate with --issue absent is unchanged: the tracker shape alone
AssertionError: expected 2 to be 1 // Object.is equality

- Expected

* Received

- 1

* 2

❯ .bkit/core/engine/commands/workflow/steps.test.ts:840:65
838| expect((await gate(wired(), "650-x")).code).toBe(0);
839| expect((await gate(wired(), "dev-ci-failures")).code).toBe(1);
840| expect((await gate(wired(), "123-fix", "--issue=")).code).toBe(1…
| ^
841| });
842|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

FAIL .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps gate — placeholders, FID, derived attempt > --issue > gate --issue="" under none keeps today's check
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/steps.test.ts:844:64
842|
843| it('gate --issue="" under none keeps today\'s check', async () => {
844| expect((await gate(repo(), "123-fix", "--issue=")).code).toBe(0);
| ^
845| });
846| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯

Test Files 1 failed (1)
Tests 5 failed | 63 passed (68)
Start at 13:00:03
Duration 3.40s (tests 92%, transform 7%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-N1yRFh/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
