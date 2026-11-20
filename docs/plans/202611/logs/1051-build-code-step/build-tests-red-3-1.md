Enforced: true
Red: 6
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/1051-build-code-step-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a key the code agent's own bkit:generate run added rides the step commit" | red | failure: expected '[bkit-steps] the step\'s own edit cha…' not to contain 'own edit' |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a generated added key left by a finish the hook refused rides the re-run" | red | failure: expected '[bkit-steps] the step\'s own edit cha…' not to contain 'own edit' |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a hand-added bkit.workflows key that bkit:generate does not produce exits 13 and leaves package.json as the step wrote it" | red | failure: expected '{\n "name": "x",\n "scripts": {\n …' to be '{\n "name": "x",\n "scripts": {\n …' // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a seeded bkit.workflows key with a hand-changed value exits 13 and keeps the hand value" | red | failure: expected true to be false // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json" | passed-accepted | passes; accepted by the tests step: pins unchanged behaviour, already satisfied by the current exit 13 path in steps.ts |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a bkit:generate that fails after a bkit.workflows difference restores the step's package.json and exits 13" | red | failure: expected '{\n "name": "x",\n "scripts": {\n …' to be '{\n "name": "x",\n "scripts": {\n …' // Object.is equality |
| 6 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a failed bkit:generate friction row is not folded into an earlier test-lock row of the same step" | red | failure: expected 'a code step edited a planned test case' to be 'bkit:generate failed at a code step\'…' // Object.is equality |

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

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (197 tests | 6 failed) 70804ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 382ms
     ✓ finishes a CI round only with its own failed job count 434ms
     ✓ preserves local clamp enforcement when completing test rounds 113ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 98ms
     ✓ done prints progressLine 114ms
     ✓ progress output metadata 0ms
     ✓ gate progress number validation 153ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 315ms
     ✓ done --group writes group on the row 218ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 363ms
     ✓ --commit=none writes the row and leaves it uncommitted 118ms
     ✓ build-group-start records parentSha and group 118ms
     ✓ carries extra fields, parsed as JSON when they are JSON 227ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 83ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 89ms
     ✓ refuses an empty artifact 103ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 96ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 94ms
     ✓ rejects ["--verdict=MAYBE"] 87ms
     ✓ rejects ["--strategy=YOLO"] 91ms
     ✓ rejects ["--failures=-1"] 88ms
     ✓ rejects ["--field=verdict=PASS"] 82ms
     ✓ rejects ["--status=SKIPPED"] 73ms
     ✓ needs a message unless --commit=none 75ms
     ✓ reports a failed commit with exit 8 without writing the row 415ms
     ✓ a failed commit leaves no row staged in the index 453ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 506ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 485ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 420ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 356ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 680ms
   ✓ bkit steps verdict (11)
     ✓ returns the verdict and every header field 77ms
     ✓ reads a header with a leftover Fingerprint line 78ms
     ✓ a missing artifact exits 4 98ms
     ✓ empty artifact exits 0 85ms
     ✓ pending artifact exits 1 92ms
     ✓ no marker artifact exits 2 89ms
     ✓ disallowed artifact exits 3 82ms
     ✓ bad failures artifact exits 4 81ms
     ✓ a required field that is absent is invalid (re-prompt) 88ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 110ms
     ✓ only reads above the marker 86ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 224ms
     ✓ fails when no row was written for the step 73ms
     ✓ --ref reads the status file as committed on that ref, not from disk 265ms
     ✓ --ref exits 3 when the ref does not carry the status file 267ms
     ✓ fails on a placeholder left in the artifact 275ms
     ✓ fails when the row's verdict differs from the artifact's 287ms
     ✓ fails when the row does not list the artifact, or carries another attempt 398ms
     ✓ fails on a missing artifact 338ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 332ms
     ✓ refuses a negative or non-integer attempt (2) 81ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 124ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 133ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 166ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a row missing its attempt 159ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 120ms
     ✓ fails a diagnose row missing its strategy, passes with it 291ms
     ✓ fails a run-tests row missing its scope, and an empty scope 522ms
     ✓ steps finish records attempt and scope on a build-holistic-gate row 166ms
     ✓ names every missing field at once 121ms
     ✓ asks nothing of a step that writes none of them 136ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 16ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 1ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
   ✓ bkit steps finish (21)
     ✓ preserves challenge findings in the event when a later round overwrites the report 139ms
     ✓ steps finish refuses route=continue that decisions skip would refuse 138ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 407ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 98ms
     ✓ --derived-artifact (4)
       ✓ a --derived-artifact holding a whole-line PENDING passes and is recorded 132ms
       ✓ a PENDING in --artifact still refuses while a --derived-artifact is passed 115ms
       ✓ a PENDING in --optional-artifact still refuses while a --derived-artifact is passed 103ms
       ✓ a missing --derived-artifact is skipped and not recorded 159ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 110ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 107ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 120ms
     ✓ a true | false header field is true when any agent sets it true 116ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 115ms
     ✓ records the header's Strategy on the row 118ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 125ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 227ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 79ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 178ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 328ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 471ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 387ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 460ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 645ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 401ms
     ✓ --post needs --number; without --post there is no tracker key 138ms
   ✓ bkit steps stub (4)
     ✓ copies the prior version under a PENDING header 84ms
     ✓ --strip-header drops the prior version's own header 65ms
     ✓ refuses --result-file as an unknown flag 66ms
     ✓ exits 4 when the prior version is missing or empty 68ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 74ms
     ✓ checks the FID's shape for the wired tracker 101ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 170ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 100ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 369ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 325ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 186ms
       ✓ gate --issue without --fid is a usage error 68ms
       ✓ gate --issue="" under none keeps today's check 103ms
     ✓ --attempt-of checks the row carries the derived counter 297ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 634ms
     ✓ writeStepRow refuses when a recorded path changed 926ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 462ms
     ✓ writeStepRow appends its commit sha to the record 774ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 791ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 199ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 465ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 380ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 394ms
     ✓ finds the run's plan beside its status file 0ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 238ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 681ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 513ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 348ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 219ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 637ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 251ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 237ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 358ms
     ✓ the tests step's finish passes its own group's and taken-over tests 491ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 455ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 522ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 605ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 633ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 385ms
     ✓ the refusal names the BLOCKED line the engine reads 305ms
     ✓ the exit 11 help names the BLOCKED line that lets a change through 0ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 1115ms
     ✓ refuses a later code step that changes a BLOCKED change again 636ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 905ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 792ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 317ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 805ms
     ✓ the refusal of a re-change says the logged reason is already recorded 503ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 324ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 386ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 469ms
     ✓ the same contradicted finish run again adds no second task or row 551ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 305ms
     ✓ a mixed refusal names both tests and words the problem for each kind 367ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 349ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 309ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 461ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 580ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 387ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 529ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 523ms
     ✓ a changedTests record on a non-code-step row does not move the lock's baseline 256ms
     ✓ refuses a --field changedTests on a step finish 163ms
     ✓ the exit 11 refusal says verify reads a BLOCKED change's added lines 282ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 119ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 226ms
     ✓ does not count an artifact the run found committed when it started 333ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 224ms
     ✓ commits a package.json change outside bkit.workflows 378ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 649ms
   ✓ promptHeader (1)
     ✓ reads the Failures count rule of bkit-plan-review-1 1ms
   ✓ headerDeclaration (1)
     ✓ refuses an unknown count declaration 1ms
   ✓ bkit steps finish (12)
     ✓ checks Failures against the ## CRITICAL items and ignores OPTIONAL ones 97ms
     ✓ reads None under ## CRITICAL as zero items 103ms
     ✓ refuses a verify Fixable that disagrees with its gap lines 97ms
     ✓ counts only the Fixable gap lines under a verify gap-count line 118ms
     ✓ does not count a Fixable line inside a code fence under the verify gaps log 98ms
     ✓ refuses a challenge PASS with a HIGH task block 105ms
     ✓ refuses a challenge CONCERNS with a CRITICAL task block 86ms
     ✓ hands back a challenge task block it cannot read 91ms
     ✓ refuses a report the old render wrote whose Failures counted an OPTIONAL item 86ms
     ✓ checks each agent's count in a two-agent finish 75ms
     ✓ does not count a fenced line under ## CRITICAL as an item 88ms
     ✓ a fenced ## line under ## CRITICAL does not end the section 92ms
   ❯ bkit steps finish — a build code step makes the generated output current first (22)
     ✓ a code step finish builds the declared bkit:generate output first, so a stale-output hook lets the commit through 4807ms
     ✓ the gaps-remediate and holistic steps build the output too 1139ms
     ✓ a repo with no bkit:generate script runs nothing and a stale-output hook still exits 8 791ms
     ✓ an empty bkit:generate script counts as undeclared 649ms
     ✓ a step that is not a code step never runs bkit:generate 744ms
     ✓ a FAIL code step whose bkit:generate fails still lands its row so the remediate loop runs 1229ms
     ✓ a HANDOVER code step whose bkit:generate fails still lands its row so the handover re-run happens 1467ms
     ✓ a PASS code step whose bkit:generate fails lands with generate failed, a friction row and the commit 1308ms
     ✓ a failing bkit:generate exits 16 with nothing written and nothing committed 1006ms
     ✓ a hook refusal about something else stays exit 8 after bkit:generate ran 1656ms
     ✓ --commit=none does not run bkit:generate 267ms
     ✓ a generated bkit.workflows key in a repo that is not bkit's own exits 13, names bkit:generate and commits nothing 498ms
     ✓ in bkit's own repo a generated added bkit.workflows key rides the step commit and is printed and on the row 1458ms
     ✓ in bkit's own repo the step's own bkit.workflows edit made before bkit:generate exits 13 as the step's edit 861ms
     ✓ in bkit's own repo a bkit:generate that changes an existing bkit.workflows value exits 13 and names bkit:generate 1194ms
     × in bkit's own repo a key the code agent's own bkit:generate run added rides the step commit 714ms
     × in bkit's own repo a generated added key left by a finish the hook refused rides the re-run 1881ms
     × in bkit's own repo a hand-added bkit.workflows key that bkit:generate does not produce exits 13 and leaves package.json as the step wrote it 576ms
     × in bkit's own repo a seeded bkit.workflows key with a hand-changed value exits 13 and keeps the hand value 545ms
     ✓ outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json 374ms
     × in bkit's own repo a bkit:generate that fails after a bkit.workflows difference restores the step's package.json and exits 13 499ms
     × a failed bkit:generate friction row is not folded into an earlier test-lock row of the same step 965ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > in bkit's own repo a key the code agent's own bkit:generate run added rides the step commit
AssertionError: expected '[bkit-steps] the step\'s own edit cha…' not to contain 'own edit'

- Expected
+ Received

- own edit
+ [bkit-steps] the step's own edit changes bkit.workflows in package.json (seeded): restore HEAD's values, then finish again (nothing written)
+

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3778:23
    3776|     const head = git(cwd, "rev-parse", "HEAD");
    3777|     const r = await run(cwd, EXECUTE);
    3778|     expect(r.err).not.toContain("own edit");
       |                       ^
    3779|     expect(r.code).toBe(0);
    3780|     expect(git(cwd, "rev-parse", "HEAD")).not.toBe(head);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > in bkit's own repo a generated added key left by a finish the hook refused rides the re-run
AssertionError: expected '[bkit-steps] the step\'s own edit cha…' not to contain 'own edit'

- Expected
+ Received

- own edit
+ [bkit-steps] the step's own edit changes bkit.workflows in package.json (seeded): restore HEAD's values, then finish again (nothing written)
+

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3796:28
    3794|     expect(first.code).toBe(8);
    3795|     const second = await run(cwd, EXECUTE);
    3796|     expect(second.err).not.toContain("own edit");
       |                            ^
    3797|     expect(second.code).toBe(0);
    3798|     expect(JSON.parse(git(cwd, "show", "HEAD:package.json")).bkit.work…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > in bkit's own repo a hand-added bkit.workflows key that bkit:generate does not produce exits 13 and leaves package.json as the step wrote it
AssertionError: expected '{\n  "name": "x",\n  "scripts": {\n  …' to be '{\n  "name": "x",\n  "scripts": {\n  …' // Object.is equality

- Expected
+ Received

@@ -3,10 +3,11 @@
    "scripts": {
      "bkit:generate": "node -e 'const fs=require(\"fs\");const p=JSON.parse(fs.readFileSync(\"package.json\",\"utf-8\"));p.bkit={workflows:{...(p.bkit&&p.bkit.workflows),seeded:true}};fs.writeFileSync(\"package.json\",JSON.stringify(p,null,2)+\"\\n\")'"
    },
    "bkit": {
      "workflows": {
-       "hand": true
+       "hand": true,
+       "seeded": true
      }
    }
  }


 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3813:26
    3811|     expect(r.err).toContain("hand");
    3812|     expect(r.err).toContain("own edit");
    3813|     expect(pkgText(cwd)).toBe(written);
       |                          ^
    3814|     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    3815|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > in bkit's own repo a seeded bkit.workflows key with a hand-changed value exits 13 and keeps the hand value
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3826:60
    3824|     expect(r.err).toContain("seeded");
    3825|     expect(r.err).toContain("own edit");
    3826|     expect(JSON.parse(pkgText(cwd)).bkit.workflows.seeded).toBe(false);
       |                                                            ^
    3827|     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    3828|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > in bkit's own repo a bkit:generate that fails after a bkit.workflows difference restores the step's package.json and exits 13
AssertionError: expected '{\n  "name": "x",\n  "scripts": {\n  …' to be '{\n  "name": "x",\n  "scripts": {\n  …' // Object.is equality

- Expected
+ Received

@@ -3,10 +3,11 @@
    "scripts": {
      "bkit:generate": "node -e 'const fs=require(\"fs\");const p=JSON.parse(fs.readFileSync(\"package.json\",\"utf-8\"));p.bkit={workflows:{...(p.bkit&&p.bkit.workflows),seeded:true}};fs.writeFileSync(\"package.json\",JSON.stringify(p,null,2)+\"\\n\")'; exit 3"
    },
    "bkit": {
      "workflows": {
-       "hand": true
+       "hand": true,
+       "seeded": true
      }
    }
  }


 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3849:26
    3847|     expect(r.code).toBe(13);
    3848|     expect(r.err).toContain("own edit");
    3849|     expect(pkgText(cwd)).toBe(written);
       |                          ^
    3850|     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    3851|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > a failed bkit:generate friction row is not folded into an earlier test-lock row of the same step
AssertionError: expected 'a code step edited a planned test case' to be 'bkit:generate failed at a code step\'…' // Object.is equality

Expected: "bkit:generate failed at a code step's finish"
Received: "a code step edited a planned test case"

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3874:48
    3872|     const rows = frictionRows(cwd);
    3873|     expect(rows.length).toBeGreaterThanOrEqual(2);
    3874|     expect(rows[rows.length - 1]?.["summary"]).toBe("bkit:generate fai…
       |                                                ^
    3875|     expect(rows[0]?.["summary"]).toBe("a code step edited a planned te…
    3876|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 191 passed (197)
   Start at  07:24:21
   Duration  71.41s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-UC7bZC/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
