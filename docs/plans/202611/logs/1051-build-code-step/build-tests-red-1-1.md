Enforced: true
Red: 8
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1051-build-code-step-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a code step finish builds the declared bkit:generate output first, so a stale-output hook lets the commit through" | red | failure: expected 8 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the gaps-remediate and holistic steps build the output too" | red | failure: expected 8 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a repo with no bkit:generate script runs nothing and a stale-output hook still exits 8" | red | failure: expected undefined to be 'undeclared' // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "an empty bkit:generate script counts as undeclared" | red | failure: expected undefined to be 'undeclared' // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a step that is not a code step never runs bkit:generate" | red | failure: expected undefined to be null |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a failing bkit:generate exits 16 with nothing written and nothing committed" | red | failure: expected 8 to be 16 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a hook refusal about something else stays exit 8 after bkit:generate ran" | red | failure: expected undefined to be 'ran' // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "--commit=none does not run bkit:generate" | red | failure: expected undefined to be null |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1051-build-code-step
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1051-build-code-step
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1051-build-code-step

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (183 tests | 8 failed) 23994ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 184ms
     ✓ finishes a CI round only with its own failed job count 185ms
     ✓ preserves local clamp enforcement when completing test rounds 45ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 50ms
     ✓ done prints progressLine 55ms
     ✓ progress output metadata 0ms
     ✓ gate progress number validation 53ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 143ms
     ✓ done --group writes group on the row 105ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 189ms
     ✓ --commit=none writes the row and leaves it uncommitted 59ms
     ✓ build-group-start records parentSha and group 60ms
     ✓ carries extra fields, parsed as JSON when they are JSON 103ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 46ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 49ms
     ✓ refuses an empty artifact 41ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 45ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 47ms
     ✓ rejects ["--verdict=MAYBE"] 39ms
     ✓ rejects ["--strategy=YOLO"] 44ms
     ✓ rejects ["--failures=-1"] 42ms
     ✓ rejects ["--field=verdict=PASS"] 42ms
     ✓ rejects ["--status=SKIPPED"] 44ms
     ✓ needs a message unless --commit=none 62ms
     ✓ reports a failed commit with exit 8 without writing the row 513ms
     ✓ a failed commit leaves no row staged in the index 327ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 339ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 266ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 508ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 288ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 473ms
   ✓ bkit steps verdict (11)
     ✓ returns the verdict and every header field 43ms
     ✓ reads a header with a leftover Fingerprint line 46ms
     ✓ a missing artifact exits 4 51ms
     ✓ empty artifact exits 0 52ms
     ✓ pending artifact exits 1 44ms
     ✓ no marker artifact exits 2 89ms
     ✓ disallowed artifact exits 3 47ms
     ✓ bad failures artifact exits 4 41ms
     ✓ a required field that is absent is invalid (re-prompt) 43ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 40ms
     ✓ only reads above the marker 55ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 114ms
     ✓ fails when no row was written for the step 42ms
     ✓ --ref reads the status file as committed on that ref, not from disk 125ms
     ✓ --ref exits 3 when the ref does not carry the status file 128ms
     ✓ fails on a placeholder left in the artifact 109ms
     ✓ fails when the row's verdict differs from the artifact's 110ms
     ✓ fails when the row does not list the artifact, or carries another attempt 110ms
     ✓ fails on a missing artifact 111ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 96ms
     ✓ refuses a negative or non-integer attempt (2) 40ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 50ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 41ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 38ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a row missing its attempt 43ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 47ms
     ✓ fails a diagnose row missing its strategy, passes with it 95ms
     ✓ fails a run-tests row missing its scope, and an empty scope 135ms
     ✓ steps finish records attempt and scope on a build-holistic-gate row 47ms
     ✓ names every missing field at once 46ms
     ✓ asks nothing of a step that writes none of them 48ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 9ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 0ms
   ✓ bkit steps finish (21)
     ✓ preserves challenge findings in the event when a later round overwrites the report 63ms
     ✓ steps finish refuses route=continue that decisions skip would refuse 57ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 178ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 43ms
     ✓ --derived-artifact (4)
       ✓ a --derived-artifact holding a whole-line PENDING passes and is recorded 44ms
       ✓ a PENDING in --artifact still refuses while a --derived-artifact is passed 40ms
       ✓ a PENDING in --optional-artifact still refuses while a --derived-artifact is passed 42ms
       ✓ a missing --derived-artifact is skipped and not recorded 47ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 38ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 37ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 43ms
     ✓ a true | false header field is true when any agent sets it true 51ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 52ms
     ✓ records the header's Strategy on the row 64ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 52ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 124ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 39ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 91ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 162ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 233ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 172ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 231ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 292ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 197ms
     ✓ --post needs --number; without --post there is no tracker key 78ms
   ✓ bkit steps stub (4)
     ✓ copies the prior version under a PENDING header 42ms
     ✓ --strip-header drops the prior version's own header 40ms
     ✓ refuses --result-file as an unknown flag 37ms
     ✓ exits 4 when the prior version is missing or empty 45ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 42ms
     ✓ checks the FID's shape for the wired tracker 53ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 108ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 46ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 183ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 139ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 91ms
       ✓ gate --issue without --fid is a usage error 50ms
       ✓ gate --issue="" under none keeps today's check 67ms
     ✓ --attempt-of checks the row carries the derived counter 116ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 345ms
     ✓ writeStepRow refuses when a recorded path changed 358ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 155ms
     ✓ writeStepRow appends its commit sha to the record 274ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 403ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 101ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 212ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 199ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 228ms
     ✓ finds the run's plan beside its status file 0ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 141ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 332ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 239ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 198ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 135ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 329ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 126ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 139ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 191ms
     ✓ the tests step's finish passes its own group's and taken-over tests 285ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 210ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 213ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 246ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 261ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 162ms
     ✓ the refusal names the BLOCKED line the engine reads 111ms
     ✓ the exit 11 help names the BLOCKED line that lets a change through 0ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 298ms
     ✓ refuses a later code step that changes a BLOCKED change again 198ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 316ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 383ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 124ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 197ms
     ✓ the refusal of a re-change says the logged reason is already recorded 193ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 122ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 141ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 134ms
     ✓ the same contradicted finish run again adds no second task or row 143ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 116ms
     ✓ a mixed refusal names both tests and words the problem for each kind 143ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 171ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 145ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 237ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 277ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 175ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 272ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 244ms
     ✓ a changedTests record on a non-code-step row does not move the lock's baseline 122ms
     ✓ refuses a --field changedTests on a step finish 90ms
     ✓ the exit 11 refusal says verify reads a BLOCKED change's added lines 119ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 52ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 115ms
     ✓ does not count an artifact the run found committed when it started 157ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 110ms
     ✓ commits a package.json change outside bkit.workflows 150ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 292ms
   ✓ promptHeader (1)
     ✓ reads the Failures count rule of bkit-plan-review-1 0ms
   ✓ headerDeclaration (1)
     ✓ refuses an unknown count declaration 0ms
   ✓ bkit steps finish (12)
     ✓ checks Failures against the ## CRITICAL items and ignores OPTIONAL ones 47ms
     ✓ reads None under ## CRITICAL as zero items 46ms
     ✓ refuses a verify Fixable that disagrees with its gap lines 38ms
     ✓ counts only the Fixable gap lines under a verify gap-count line 44ms
     ✓ does not count a Fixable line inside a code fence under the verify gaps log 45ms
     ✓ refuses a challenge PASS with a HIGH task block 39ms
     ✓ refuses a challenge CONCERNS with a CRITICAL task block 38ms
     ✓ hands back a challenge task block it cannot read 40ms
     ✓ refuses a report the old render wrote whose Failures counted an OPTIONAL item 40ms
     ✓ checks each agent's count in a two-agent finish 38ms
     ✓ does not count a fenced line under ## CRITICAL as an item 46ms
     ✓ a fenced ## line under ## CRITICAL does not end the section 49ms
   ❯ bkit steps finish — a build code step makes the generated output current first (8)
     × a code step finish builds the declared bkit:generate output first, so a stale-output hook lets the commit through 267ms
     × the gaps-remediate and holistic steps build the output too 266ms
     × a repo with no bkit:generate script runs nothing and a stale-output hook still exits 8 617ms
     × an empty bkit:generate script counts as undeclared 269ms
     × a step that is not a code step never runs bkit:generate 275ms
     × a failing bkit:generate exits 16 with nothing written and nothing committed 445ms
     × a hook refusal about something else stays exit 8 after bkit:generate ran 318ms
     × --commit=none does not run bkit:generate 81ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > a code step finish builds the declared bkit:generate output first, so a stale-output hook lets the commit through
AssertionError: expected 8 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 8

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3526:20
    3524|     const cwd = stale(COPY);
    3525|     const r = await run(cwd, EXECUTE);
    3526|     expect(r.code).toBe(0);
       |                    ^
    3527|     expect(r.json.generate).toBe("ran");
    3528|     expect(git(cwd, "show", "HEAD:built.txt")).toBe("v2");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > the gaps-remediate and holistic steps build the output too
AssertionError: expected 8 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 8

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3535:20
    3533|     const cwd = stale(COPY);
    3534|     const r = await run(cwd, REMEDIATE);
    3535|     expect(r.code).toBe(0);
       |                    ^
    3536|     expect(r.json.generate).toBe("ran");
    3537|     expect(git(cwd, "show", "HEAD:built.txt")).toBe("v2");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > a repo with no bkit:generate script runs nothing and a stale-output hook still exits 8
AssertionError: expected undefined to be 'undeclared' // Object.is equality

- Expected:
"undeclared"

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3548:29
    3546|     const cwd = stale(undefined);
    3547|     const r = await run(cwd, EXECUTE);
    3548|     expect(r.json.generate).toBe("undeclared");
       |                             ^
    3549|     expect(r.code).toBe(8);
    3550|     expect(fs.readFileSync(path.join(cwd, "built.txt"), "utf-8")).toBe…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > an empty bkit:generate script counts as undeclared
AssertionError: expected undefined to be 'undeclared' // Object.is equality

- Expected:
"undeclared"

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3556:29
    3554|     const cwd = stale("");
    3555|     const r = await run(cwd, EXECUTE);
    3556|     expect(r.json.generate).toBe("undeclared");
       |                             ^
    3557|     expect(r.code).toBe(8);
    3558|     expect(fs.existsSync(path.join(cwd, "generate-ran.txt"))).toBe(fal…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > a step that is not a code step never runs bkit:generate
AssertionError: expected undefined to be null

- Expected:
null

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3565:29
    3563|     const r = await run(cwd, SYNC);
    3564|     expect(r.code).toBe(0);
    3565|     expect(r.json.generate).toBeNull();
       |                             ^
    3566|     expect(fs.existsSync(path.join(cwd, "generate-ran.txt"))).toBe(fal…
    3567|     expect(fs.readFileSync(path.join(cwd, "built.txt"), "utf-8")).toBe…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > a failing bkit:generate exits 16 with nothing written and nothing committed
AssertionError: expected 8 to be 16 // Object.is equality

- Expected
+ Received

- 16
+ 8

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3574:20
    3572|     const head = git(cwd, "rev-parse", "HEAD");
    3573|     const r = await run(cwd, EXECUTE);
    3574|     expect(r.code).toBe(16);
       |                    ^
    3575|     expect(r.err).toContain("generate-boom");
    3576|     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > a hook refusal about something else stays exit 8 after bkit:generate ran
AssertionError: expected undefined to be 'ran' // Object.is equality

- Expected:
"ran"

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3584:29
    3582|     const head = git(cwd, "rev-parse", "HEAD");
    3583|     const r = await run(cwd, EXECUTE);
    3584|     expect(r.json.generate).toBe("ran");
       |                             ^
    3585|     expect(r.code).toBe(8);
    3586|     expect(r.err).toContain("unrelated refusal");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > --commit=none does not run bkit:generate
AssertionError: expected undefined to be null

- Expected:
null

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3594:29
    3592|     const r = await run(cwd, [...EXECUTE, "--commit=none"]);
    3593|     expect(r.code).toBe(0);
    3594|     expect(r.json.generate).toBeNull();
       |                             ^
    3595|     expect(fs.existsSync(path.join(cwd, "generate-ran.txt"))).toBe(fal…
    3596|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 175 passed (183)
   Start at  05:05:46
   Duration  24.27s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-0UKY96/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
