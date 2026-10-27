
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/steps.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (88 tests | 1 failed) 5630ms
   ❯ bkit steps done (19)
     ✓ captures parentSha first, writes the row, then commits on top of it 88ms
     ✓ done --group writes group on the row 63ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 98ms
     ✓ --commit=none writes the row and leaves it uncommitted 38ms
     ✓ build-group-start records parentSha and group 37ms
     ✓ carries extra fields, parsed as JSON when they are JSON 67ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 29ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 29ms
     ✓ refuses an empty artifact 30ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 30ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 29ms
     ✓ rejects ["--verdict=MAYBE"] 29ms
     ✓ rejects ["--strategy=YOLO"] 30ms
     ✓ rejects ["--failures=-1"] 29ms
     ✓ rejects ["--field=verdict=PASS"] 30ms
     ✓ rejects ["--status=SKIPPED"] 29ms
     ✓ needs a message unless --commit=none 33ms
     ✓ reports a failed commit with exit 8 without writing the row 468ms
     × a failed commit leaves no row staged in the index 211ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 31ms
     ✓ a missing artifact exits 4 28ms
     ✓ empty artifact exits 0 28ms
     ✓ pending artifact exits 1 27ms
     ✓ no marker artifact exits 2 27ms
     ✓ disallowed artifact exits 3 27ms
     ✓ bad failures artifact exits 4 27ms
     ✓ a required field that is absent is invalid (re-prompt) 29ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 30ms
     ✓ only reads above the marker 29ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 66ms
     ✓ fails when no row was written for the step 30ms
     ✓ --ref reads the status file as committed on that ref, not from disk 74ms
     ✓ --ref exits 3 when the ref does not carry the status file 74ms
     ✓ fails on a placeholder left in the artifact 65ms
     ✓ fails when the row's verdict differs from the artifact's 67ms
     ✓ fails when the row does not list the artifact, or carries another attempt 66ms
     ✓ fails on a missing artifact 77ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 66ms
     ✓ refuses a negative or non-integer attempt (2) 31ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 33ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 36ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 32ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 33ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 36ms
     ✓ fails a diagnose row missing its strategy, passes with it 66ms
     ✓ fails a run-tests row missing its scope, and an empty scope 97ms
     ✓ names every missing field at once 32ms
     ✓ asks nothing of a step that writes none of them 36ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 2ms
   ✓ the build challenge is one step (2)
     ✓ no removed challenge step in the attempt table 0ms
     ✓ no writer list names a removed agent 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 0ms
   ✓ bkit steps finish (14)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 85ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 37ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 29ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 29ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 35ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 38ms
     ✓ records the header's Strategy on the row 50ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 35ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 71ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 29ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 51ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 93ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 125ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 92ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 98ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 145ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 87ms
     ✓ --post needs --number; without --post there is no tracker key 39ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 29ms
     ✓ --strip-header drops the prior version's own header 30ms
     ✓ exits 4 when the prior version is missing or empty 29ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 29ms
     ✓ checks the FID's shape for the wired tracker 43ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 65ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 34ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 130ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 101ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 67ms
       ✓ gate --issue without --fid is a usage error 34ms
       ✓ gate --issue="" under none keeps today's check 33ms
     ✓ --attempt-of checks the row carries the derived counter 66ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 186ms
     ✓ writeStepRow refuses when a recorded path changed 212ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 100ms
     ✓ writeStepRow appends its commit sha to the record 183ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 393ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps done > a failed commit leaves no row staged in the index
AssertionError: expected 'logs/status.jsonl\nlogs/verify-1.md' not to contain 'status.jsonl'

- Expected
+ Received

- status.jsonl
+ logs/status.jsonl
+ logs/verify-1.md

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:226:24
    224|     // the attempt staged is left behind either — the index matches th…
    225|     const staged = git(cwd, "diff", "--cached", "--name-only");
    226|     expect(staged).not.toContain("status.jsonl");
       |                        ^
    227|     expect(staged).toBe("");
    228|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 87 passed (88)
   Start at  00:21:10
   Duration  6.06s (tests 94%, transform 5%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-YoAXou/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
