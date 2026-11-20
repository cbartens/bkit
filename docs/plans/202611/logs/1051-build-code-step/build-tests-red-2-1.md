Enforced: true
Red: 8
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/1051-build-code-step-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a FAIL code step whose bkit:generate fails still lands its row so the remediate loop runs" | red | failure: expected 16 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a HANDOVER code step whose bkit:generate fails still lands its row so the handover re-run happens" | red | failure: expected 16 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a PASS code step whose bkit:generate fails lands with generate failed, a friction row and the commit" | red | failure: expected 16 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a failing bkit:generate exits 16 with nothing written and nothing committed" | red | failure: expected 16 to be +0 // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a generated bkit.workflows key in a repo that is not bkit's own exits 13, names bkit:generate and commits nothing" | red | failure: expected '[bkit-steps] the step\'s commit would…' to contain 'bkit:generate' |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a generated added bkit.workflows key rides the step commit and is printed and on the row" | red | failure: expected 13 to be +0 // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo the step's own bkit.workflows edit made before bkit:generate exits 13 as the step's edit" | red | failure: expected '[bkit-steps] the step\'s commit would…' to contain 'own edit' |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a bkit:generate that changes an existing bkit.workflows value exits 13 and names bkit:generate" | red | failure: expected '[bkit-steps] the step\'s commit would…' to contain 'bkit:generate' |

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

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (190 tests | 8 failed) 58316ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 395ms
     ✓ finishes a CI round only with its own failed job count 275ms
     ✓ preserves local clamp enforcement when completing test rounds 86ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 79ms
     ✓ done prints progressLine 94ms
     ✓ progress output metadata 0ms
     ✓ gate progress number validation 89ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 256ms
     ✓ done --group writes group on the row 259ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 299ms
     ✓ --commit=none writes the row and leaves it uncommitted 96ms
     ✓ build-group-start records parentSha and group 95ms
     ✓ carries extra fields, parsed as JSON when they are JSON 186ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 68ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 92ms
     ✓ refuses an empty artifact 100ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 76ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 81ms
     ✓ rejects ["--verdict=MAYBE"] 84ms
     ✓ rejects ["--strategy=YOLO"] 82ms
     ✓ rejects ["--failures=-1"] 83ms
     ✓ rejects ["--field=verdict=PASS"] 134ms
     ✓ rejects ["--status=SKIPPED"] 89ms
     ✓ needs a message unless --commit=none 75ms
     ✓ reports a failed commit with exit 8 without writing the row 753ms
     ✓ a failed commit leaves no row staged in the index 778ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 796ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1103ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 862ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 602ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 454ms
   ✓ bkit steps verdict (11)
     ✓ returns the verdict and every header field 72ms
     ✓ reads a header with a leftover Fingerprint line 72ms
     ✓ a missing artifact exits 4 73ms
     ✓ empty artifact exits 0 95ms
     ✓ pending artifact exits 1 75ms
     ✓ no marker artifact exits 2 92ms
     ✓ disallowed artifact exits 3 78ms
     ✓ bad failures artifact exits 4 65ms
     ✓ a required field that is absent is invalid (re-prompt) 72ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 78ms
     ✓ only reads above the marker 120ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 261ms
     ✓ fails when no row was written for the step 104ms
     ✓ --ref reads the status file as committed on that ref, not from disk 333ms
     ✓ --ref exits 3 when the ref does not carry the status file 287ms
     ✓ fails on a placeholder left in the artifact 207ms
     ✓ fails when the row's verdict differs from the artifact's 200ms
     ✓ fails when the row does not list the artifact, or carries another attempt 225ms
     ✓ fails on a missing artifact 255ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 256ms
     ✓ refuses a negative or non-integer attempt (2) 91ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 104ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 74ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 65ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a row missing its attempt 85ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 115ms
     ✓ fails a diagnose row missing its strategy, passes with it 167ms
     ✓ fails a run-tests row missing its scope, and an empty scope 262ms
     ✓ steps finish records attempt and scope on a build-holistic-gate row 78ms
     ✓ names every missing field at once 126ms
     ✓ asks nothing of a step that writes none of them 89ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 15ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
   ✓ bkit steps finish (21)
     ✓ preserves challenge findings in the event when a later round overwrites the report 147ms
     ✓ steps finish refuses route=continue that decisions skip would refuse 132ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 265ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 77ms
     ✓ --derived-artifact (4)
       ✓ a --derived-artifact holding a whole-line PENDING passes and is recorded 121ms
       ✓ a PENDING in --artifact still refuses while a --derived-artifact is passed 74ms
       ✓ a PENDING in --optional-artifact still refuses while a --derived-artifact is passed 72ms
       ✓ a missing --derived-artifact is skipped and not recorded 101ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 90ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 65ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 90ms
     ✓ a true | false header field is true when any agent sets it true 102ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 96ms
     ✓ records the header's Strategy on the row 100ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 99ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 262ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 96ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 164ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 292ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 421ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 315ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 394ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 592ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 393ms
     ✓ --post needs --number; without --post there is no tracker key 172ms
   ✓ bkit steps stub (4)
     ✓ copies the prior version under a PENDING header 80ms
     ✓ --strip-header drops the prior version's own header 74ms
     ✓ refuses --result-file as an unknown flag 65ms
     ✓ exits 4 when the prior version is missing or empty 68ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 83ms
     ✓ checks the FID's shape for the wired tracker 110ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 209ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 90ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 359ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 291ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 184ms
       ✓ gate --issue without --fid is a usage error 78ms
       ✓ gate --issue="" under none keeps today's check 75ms
     ✓ --attempt-of checks the row carries the derived counter 178ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 440ms
     ✓ writeStepRow refuses when a recorded path changed 548ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 263ms
     ✓ writeStepRow appends its commit sha to the record 527ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 962ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 209ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 401ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 457ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 469ms
     ✓ finds the run's plan beside its status file 0ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 230ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1054ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 468ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 364ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 226ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 571ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 333ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 288ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 555ms
     ✓ the tests step's finish passes its own group's and taken-over tests 529ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 469ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 447ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 838ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 1122ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 387ms
     ✓ the refusal names the BLOCKED line the engine reads 316ms
     ✓ the exit 11 help names the BLOCKED line that lets a change through 0ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 843ms
     ✓ refuses a later code step that changes a BLOCKED change again 460ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 633ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 721ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 272ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 836ms
     ✓ the refusal of a re-change says the logged reason is already recorded 680ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 318ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 519ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 401ms
     ✓ the same contradicted finish run again adds no second task or row 416ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 360ms
     ✓ a mixed refusal names both tests and words the problem for each kind 563ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 385ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 297ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 620ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 578ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 412ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 657ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 645ms
     ✓ a changedTests record on a non-code-step row does not move the lock's baseline 236ms
     ✓ refuses a --field changedTests on a step finish 168ms
     ✓ the exit 11 refusal says verify reads a BLOCKED change's added lines 238ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 112ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 233ms
     ✓ does not count an artifact the run found committed when it started 261ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 166ms
     ✓ commits a package.json change outside bkit.workflows 306ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 582ms
   ✓ promptHeader (1)
     ✓ reads the Failures count rule of bkit-plan-review-1 1ms
   ✓ headerDeclaration (1)
     ✓ refuses an unknown count declaration 1ms
   ✓ bkit steps finish (12)
     ✓ checks Failures against the ## CRITICAL items and ignores OPTIONAL ones 92ms
     ✓ reads None under ## CRITICAL as zero items 84ms
     ✓ refuses a verify Fixable that disagrees with its gap lines 69ms
     ✓ counts only the Fixable gap lines under a verify gap-count line 79ms
     ✓ does not count a Fixable line inside a code fence under the verify gaps log 93ms
     ✓ refuses a challenge PASS with a HIGH task block 91ms
     ✓ refuses a challenge CONCERNS with a CRITICAL task block 94ms
     ✓ hands back a challenge task block it cannot read 105ms
     ✓ refuses a report the old render wrote whose Failures counted an OPTIONAL item 84ms
     ✓ checks each agent's count in a two-agent finish 83ms
     ✓ does not count a fenced line under ## CRITICAL as an item 84ms
     ✓ a fenced ## line under ## CRITICAL does not end the section 94ms
   ❯ bkit steps finish — a build code step makes the generated output current first (15)
     ✓ a code step finish builds the declared bkit:generate output first, so a stale-output hook lets the commit through 5804ms
     ✓ the gaps-remediate and holistic steps build the output too 1082ms
     ✓ a repo with no bkit:generate script runs nothing and a stale-output hook still exits 8 509ms
     ✓ an empty bkit:generate script counts as undeclared 669ms
     ✓ a step that is not a code step never runs bkit:generate 492ms
     × a FAIL code step whose bkit:generate fails still lands its row so the remediate loop runs 275ms
     × a HANDOVER code step whose bkit:generate fails still lands its row so the handover re-run happens 249ms
     × a PASS code step whose bkit:generate fails lands with generate failed, a friction row and the commit 250ms
     × a failing bkit:generate exits 16 with nothing written and nothing committed 241ms
     ✓ a hook refusal about something else stays exit 8 after bkit:generate ran 608ms
     ✓ --commit=none does not run bkit:generate 168ms
     × a generated bkit.workflows key in a repo that is not bkit's own exits 13, names bkit:generate and commits nothing 360ms
     × in bkit's own repo a generated added bkit.workflows key rides the step commit and is printed and on the row 374ms
     × in bkit's own repo the step's own bkit.workflows edit made before bkit:generate exits 13 as the step's edit 722ms
     × in bkit's own repo a bkit:generate that changes an existing bkit.workflows value exits 13 and names bkit:generate 568ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > a FAIL code step whose bkit:generate fails still lands its row so the remediate loop runs
AssertionError: expected 16 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 16

 ❯ landsDespiteFailedGenerate .bkit/core/engine/commands/workflow/steps.test.ts:3609:20
    3607|     const r = await run(cwd, EXECUTE);
    3608|     vi.unstubAllEnvs();
    3609|     expect(r.code).toBe(0);
       |                    ^
    3610|     expect(r.err).toContain("generate-boom");
    3611|     expect(r.json.generate).toBe("failed");
 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3619:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > a HANDOVER code step whose bkit:generate fails still lands its row so the handover re-run happens
AssertionError: expected 16 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 16

 ❯ landsDespiteFailedGenerate .bkit/core/engine/commands/workflow/steps.test.ts:3609:20
    3607|     const r = await run(cwd, EXECUTE);
    3608|     vi.unstubAllEnvs();
    3609|     expect(r.code).toBe(0);
       |                    ^
    3610|     expect(r.err).toContain("generate-boom");
    3611|     expect(r.json.generate).toBe("failed");
 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3624:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > a PASS code step whose bkit:generate fails lands with generate failed, a friction row and the commit
AssertionError: expected 16 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 16

 ❯ landsDespiteFailedGenerate .bkit/core/engine/commands/workflow/steps.test.ts:3609:20
    3607|     const r = await run(cwd, EXECUTE);
    3608|     vi.unstubAllEnvs();
    3609|     expect(r.code).toBe(0);
       |                    ^
    3610|     expect(r.err).toContain("generate-boom");
    3611|     expect(r.json.generate).toBe("failed");
 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3629:24

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > a failing bkit:generate exits 16 with nothing written and nothing committed
AssertionError: expected 16 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 16

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3646:20
    3644|     const r = await run(cwd, EXECUTE);
    3645|     vi.unstubAllEnvs();
    3646|     expect(r.code).toBe(0);
       |                    ^
    3647|     expect(r.code).not.toBe(16);
    3648|     expect(r.err).toContain("generate-boom");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > a generated bkit.workflows key in a repo that is not bkit's own exits 13, names bkit:generate and commits nothing
AssertionError: expected '[bkit-steps] the step\'s commit would…' to contain 'bkit:generate'

- Expected
+ Received

- bkit:generate
+ [bkit-steps] the step's commit would change bkit.workflows in package.json (seeded): restore HEAD's values, then finish again (nothing written)
+

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3707:19
    3705|     const r = await run(cwd, EXECUTE);
    3706|     expect(r.code).toBe(13);
    3707|     expect(r.err).toContain("bkit:generate");
       |                   ^
    3708|     expect(r.err).toContain("seeded");
    3709|     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > in bkit's own repo a generated added bkit.workflows key rides the step commit and is printed and on the row
AssertionError: expected 13 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 13

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3718:20
    3716|     const head = git(cwd, "rev-parse", "HEAD");
    3717|     const r = await run(cwd, EXECUTE);
    3718|     expect(r.code).toBe(0);
       |                    ^
    3719|     expect(git(cwd, "rev-parse", "HEAD")).not.toBe(head);
    3720|     expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toCon…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > in bkit's own repo the step's own bkit.workflows edit made before bkit:generate exits 13 as the step's edit
AssertionError: expected '[bkit-steps] the step\'s commit would…' to contain 'own edit'

- Expected
+ Received

- own edit
+ [bkit-steps] the step's commit would change bkit.workflows in package.json (limit): restore HEAD's values, then finish again (nothing written)
+

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3741:19
    3739|     expect(r.code).toBe(13);
    3740|     expect(r.err).toContain("limit");
    3741|     expect(r.err).toContain("own edit");
       |                   ^
    3742|     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    3743|     expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).toBe(SEED…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > in bkit's own repo a bkit:generate that changes an existing bkit.workflows value exits 13 and names bkit:generate
AssertionError: expected '[bkit-steps] the step\'s commit would…' to contain 'bkit:generate'

- Expected
+ Received

- bkit:generate
+ [bkit-steps] the step's commit would change bkit.workflows in package.json (limit): restore HEAD's values, then finish again (nothing written)
+

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3753:19
    3751|     const r = await run(cwd, EXECUTE);
    3752|     expect(r.code).toBe(13);
    3753|     expect(r.err).toContain("bkit:generate");
       |                   ^
    3754|     expect(r.err).toContain("limit");
    3755|     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 182 passed (190)
   Start at  06:21:26
   Duration  58.94s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-H6rsn3/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
