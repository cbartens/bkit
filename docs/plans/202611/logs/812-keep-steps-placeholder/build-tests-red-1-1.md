Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/812-keep-steps-placeholder-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a --derived-artifact holding a whole-line PENDING passes and is recorded" | red | failure: expected 2 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a PENDING in --artifact still refuses while a --derived-artifact is passed" | red | failure: expected '[bkit-steps] unknown flag --derived-a…' to contain 'placeholders logs/own.md' |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a PENDING in --optional-artifact still refuses while a --derived-artifact is passed" | red | failure: expected '[bkit-steps] unknown flag --derived-a…' to contain 'placeholders logs/opt.md' |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a missing --derived-artifact is skipped and not recorded" | red | failure: expected 2 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Fetch Context passes related-issues.md as a derived artifact" | red | failure: expected ' "{BKIT}" steps finish --file="{STA…' to contain '--derived-artifact=docs/plans/{YYYYMM…' |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/812-keep-steps-placeholder
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/812-keep-steps-placeholder
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/812-keep-steps-placeholder

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (171 tests | 4 failed) 18742ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 161ms
     ✓ finishes a CI round only with its own failed job count 156ms
     ✓ preserves local clamp enforcement when completing test rounds 43ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 43ms
     ✓ done prints progressLine 50ms
     ✓ progress output metadata 0ms
     ✓ gate progress number validation 46ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 126ms
     ✓ done --group writes group on the row 100ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 176ms
     ✓ --commit=none writes the row and leaves it uncommitted 53ms
     ✓ build-group-start records parentSha and group 49ms
     ✓ carries extra fields, parsed as JSON when they are JSON 100ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 39ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 37ms
     ✓ refuses an empty artifact 50ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 39ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 38ms
     ✓ rejects ["--verdict=MAYBE"] 38ms
     ✓ rejects ["--strategy=YOLO"] 38ms
     ✓ rejects ["--failures=-1"] 38ms
     ✓ rejects ["--field=verdict=PASS"] 46ms
     ✓ rejects ["--status=SKIPPED"] 38ms
     ✓ needs a message unless --commit=none 45ms
     ✓ reports a failed commit with exit 8 without writing the row 292ms
     ✓ a failed commit leaves no row staged in the index 214ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 273ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 254ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 233ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 203ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 238ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 44ms
     ✓ a missing artifact exits 4 36ms
     ✓ empty artifact exits 0 36ms
     ✓ pending artifact exits 1 36ms
     ✓ no marker artifact exits 2 36ms
     ✓ disallowed artifact exits 3 37ms
     ✓ bad failures artifact exits 4 38ms
     ✓ a required field that is absent is invalid (re-prompt) 38ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 38ms
     ✓ only reads above the marker 39ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 100ms
     ✓ fails when no row was written for the step 37ms
     ✓ --ref reads the status file as committed on that ref, not from disk 111ms
     ✓ --ref exits 3 when the ref does not carry the status file 112ms
     ✓ fails on a placeholder left in the artifact 102ms
     ✓ fails when the row's verdict differs from the artifact's 102ms
     ✓ fails when the row does not list the artifact, or carries another attempt 100ms
     ✓ fails on a missing artifact 99ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 100ms
     ✓ refuses a negative or non-integer attempt (2) 38ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 44ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 44ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 39ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a row missing its attempt 70ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 65ms
     ✓ fails a diagnose row missing its strategy, passes with it 90ms
     ✓ fails a run-tests row missing its scope, and an empty scope 138ms
     ✓ steps finish records attempt and scope on a build-holistic-gate row 45ms
     ✓ names every missing field at once 45ms
     ✓ asks nothing of a step that writes none of them 46ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 8ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 0ms
   ❯ bkit steps finish (21)
     ✓ preserves challenge findings in the event when a later round overwrites the report 46ms
     ✓ steps finish refuses route=continue that decisions skip would refuse 47ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 138ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 38ms
     ❯ --derived-artifact (4)
       × a --derived-artifact holding a whole-line PENDING passes and is recorded 42ms
       × a PENDING in --artifact still refuses while a --derived-artifact is passed 40ms
       × a PENDING in --optional-artifact still refuses while a --derived-artifact is passed 38ms
       × a missing --derived-artifact is skipped and not recorded 38ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 40ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 39ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 44ms
     ✓ a true | false header field is true when any agent sets it true 44ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 49ms
     ✓ records the header's Strategy on the row 61ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 51ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 121ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 39ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 86ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 154ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 204ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 153ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 194ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 285ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 189ms
     ✓ --post needs --number; without --post there is no tracker key 68ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 39ms
     ✓ --strip-header drops the prior version's own header 39ms
     ✓ exits 4 when the prior version is missing or empty 37ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 38ms
     ✓ checks the FID's shape for the wired tracker 51ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 91ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 46ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 174ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 136ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 93ms
       ✓ gate --issue without --fid is a usage error 39ms
       ✓ gate --issue="" under none keeps today's check 46ms
     ✓ --attempt-of checks the row carries the derived counter 107ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 268ms
     ✓ writeStepRow refuses when a recorded path changed 320ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 143ms
     ✓ writeStepRow appends its commit sha to the record 265ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 470ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 100ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 199ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 182ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 190ms
     ✓ finds the run's plan beside its status file 0ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 127ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 303ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 215ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 169ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 113ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 290ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 111ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 108ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 176ms
     ✓ the tests step's finish passes its own group's and taken-over tests 237ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 185ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 189ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 183ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 201ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 127ms
     ✓ the refusal names the BLOCKED line the engine reads 98ms
     ✓ the exit 11 help names the BLOCKED line that lets a change through 0ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 260ms
     ✓ refuses a later code step that changes a BLOCKED change again 193ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 274ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 283ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 127ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 192ms
     ✓ the refusal of a re-change says the logged reason is already recorded 195ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 119ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 142ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 130ms
     ✓ the same contradicted finish run again adds no second task or row 138ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 122ms
     ✓ a mixed refusal names both tests and words the problem for each kind 143ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 151ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 122ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 212ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 258ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 173ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 277ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 235ms
     ✓ a changedTests record on a non-code-step row does not move the lock's baseline 113ms
     ✓ refuses a --field changedTests on a step finish 88ms
     ✓ the exit 11 refusal says verify reads a BLOCKED change's added lines 113ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 54ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 115ms
     ✓ does not count an artifact the run found committed when it started 165ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 98ms
     ✓ commits a package.json change outside bkit.workflows 146ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 287ms
   ✓ bkit steps stub --result-file (12)
     ✓ derives supported header fields and rejects stale bodies without false PASS 43ms
     ✓ registers every named header kind 5ms
     ✓ renders and verifies the header of every prompt that declares one 56ms
     ✓ renders no PASS from a result that omits its evidence 38ms
     ✓ refuses line breaks in header-bound result values 39ms
     ✓ retains special verdict judgments and legacy stub behavior 39ms
     ✓ derives audit IDs totals ledger payloads and coverage from one result 43ms
     ✓ derives a fresh audit key when the ledger already holds it 39ms
     ✓ keeps the audit key when the same finding is rendered again after its append 39ms
     ✓ reads held audit keys from the linked worktree's own ledger 70ms
     ✓ refuses a result file left from an earlier round 42ms
     ✓ audit result render keeps an existing anchored report intact 39ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish > --derived-artifact > a --derived-artifact holding a whole-line PENDING passes and is recorded
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:1141:22
    1139|       write(cwd, "logs/related.md", "Quoted from another issue:\nPENDI…
    1140|       const r = await run(cwd, [...FINISH, ...DERIVED, "--derived-arti…
    1141|       expect(r.code).toBe(0);
       |                      ^
    1142|       expect(r.json.row.artifacts).toContain("logs/related.md");
    1143|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish > --derived-artifact > a PENDING in --artifact still refuses while a --derived-artifact is passed
AssertionError: expected '[bkit-steps] unknown flag --derived-a…' to contain 'placeholders logs/own.md'

- Expected
+ Received

- placeholders logs/own.md
+ [bkit-steps] unknown flag --derived-artifact
+

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:1156:21
    1154|       ]);
    1155|       expect(r.code).not.toBe(0);
    1156|       expect(r.err).toContain("placeholders logs/own.md");
       |                     ^
    1157|       expect(r.err).not.toContain("placeholders logs/related.md");
    1158|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish > --derived-artifact > a PENDING in --optional-artifact still refuses while a --derived-artifact is passed
AssertionError: expected '[bkit-steps] unknown flag --derived-a…' to contain 'placeholders logs/opt.md'

- Expected
+ Received

- placeholders logs/opt.md
+ [bkit-steps] unknown flag --derived-artifact
+

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:1171:21
    1169|       ]);
    1170|       expect(r.code).not.toBe(0);
    1171|       expect(r.err).toContain("placeholders logs/opt.md");
       |                     ^
    1172|       expect(r.err).not.toContain("placeholders logs/related.md");
    1173|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish > --derived-artifact > a missing --derived-artifact is skipped and not recorded
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:1178:22
    1176|       const cwd = repo();
    1177|       const r = await run(cwd, [...FINISH, ...DERIVED, "--derived-arti…
    1178|       expect(r.code).toBe(0);
       |                      ^
    1179|       expect(r.json.row.artifacts).not.toContain("logs/absent.md");
    1180|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 167 passed (171)
   Start at  20:52:39
   Duration  18.96s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fiZIaN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/812-keep-steps-placeholder
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/workflow-shape.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/812-keep-steps-placeholder
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/workflow-shape.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/812-keep-steps-placeholder

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (328 tests | 1 failed) 121ms
   ✓ engine calls (8)
     ✓ auto calls only verbs and flags the CLI has 1ms
     ✓ design calls only verbs and flags the CLI has 1ms
     ✓ plan calls only verbs and flags the CLI has 0ms
     ✓ build calls only verbs and flags the CLI has 1ms
     ✓ debug calls only verbs and flags the CLI has 2ms
     ✓ ship calls only verbs and flags the CLI has 1ms
     ✓ the call check reports an unknown verb and an unknown flag 0ms
     ✓ no workflow names a removed sub-plan flag 1ms
   ✓ bkit lookup (6)
     ✓ auto resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ design resolves the binary once, in Step 1, and holds it as BKIT 0ms
     ✓ plan resolves the binary once, in Step 1, and holds it as BKIT 0ms
     ✓ build resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ debug resolves the binary once, in Step 1, and holds it as BKIT 0ms
     ✓ ship resolves the binary once, in Step 1, and holds it as BKIT 0ms
   ✓ gate logs (13)
     ✓ auto writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ design writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ plan writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ debug writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ ship writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 0ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 0ms
     ✓ debug writes the trimmed gate log with `tests run --artifact` 0ms
     ✓ build never copies or clamps a gate log by hand 0ms
     ✓ debug never copies or clamps a gate log by hand 0ms
     ✓ build routes the test failures on the engine's count, never a count from the log 0ms
     ✓ debug routes the test failures on the engine's count, never a count from the log 0ms
   ✓ debug Step 1 start decisions (3)
     ✓ decides attempt, mode, repro and gates with one `status route --prompt-file` 1ms
     ✓ reconstructs nothing in shell or prose 0ms
     ✓ Step 3 reads `[live=off]` from the gates, never from the input file 0ms
   ✓ Step 1 FID check (10)
     ✓ design resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ plan resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ build resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ debug resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ ship resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ design writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ plan writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ build writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ debug writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ ship writes the session prompt to a file and reads it with `fids parse` 0ms
   ✓ resume facts (6)
     ✓ build resumes an open decision from `openDecision`, not a file scan 0ms
     ✓ build re-runs a red gate pause instead of asking it 0ms
     ✓ Resume asks every other open pause at Decision Pause step 3 0ms
     ✓ build leaves the red-gate re-run conditions to status resume 0ms
     ✓ bkit-build.md no longer mentions GATE_RERUN 0ms
     ✓ the Resume rule reads gateRerun and rerunFrom from status resume 0ms
   ✓ pre-worktree commit (3)
     ✓ design passes the repo root explicitly 0ms
     ✓ plan passes the repo root explicitly 0ms
     ✓ build passes the repo root explicitly 0ms
   ✓ Failure Path (23)
     ✓ design records the failure through one `workflows fail` call 0ms
     ✓ plan records the failure through one `workflows fail` call 0ms
     ✓ build records the failure through one `workflows fail` call 0ms
     ✓ debug records the failure through one `workflows fail` call 0ms
     ✓ ship records the failure through one `workflows fail` call 0ms
     ✓ design always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ plan always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ build always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ debug always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ design follows the handover's printed `route` and `message`, never its exit code 0ms
     ✓ plan follows the handover's printed `route` and `message`, never its exit code 0ms
     ✓ build follows the handover's printed `route` and `message`, never its exit code 0ms
     ✓ debug follows the handover's printed `route` and `message`, never its exit code 0ms
     ✓ ship follows the handover's printed `route` and `message`, never its exit code 0ms
     ✓ bkit-debug.md: the Loop Question's Stop takes the Failure Path's handover route, exit 80 included 0ms
     ✓ bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch 1ms
     ✓ bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch 0ms
     ✓ design removes only files the run created by mistake, never other agents' changes 0ms
     ✓ plan removes only files the run created by mistake, never other agents' changes 0ms
     ✓ build removes only files the run created by mistake, never other agents' changes 0ms
     ✓ debug removes only files the run created by mistake, never other agents' changes 0ms
     ✓ ship flushes through `workflows handover --flush` 0ms
     ✓ build routes exit 5 (lock left in place) on, like exit 0 0ms
   ✓ build (47)
     ✓ Step 13's diagnose agent reads the committed log, not the outbox copy 0ms
     ✓ writes the challenge attempt on every row, counted from the challenge's own rows 0ms
     ✓ Step 11 merges the findings into the plan and routes on the merge 0ms
     ✓ Step 11 records its round on the challenge row and reads it back from status.jsonl 0ms
     ✓ a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file 0ms
     ✓ the decision row records its route, which `status resume` maps 0ms
     ✓ the last allowed challenge round never runs another 0ms
     ✓ challenge merge exit 23 gets the same one retry as exit 22 0ms
     ✓ an execute cap stop is a handover, never a FAIL attempt 0ms
     ✓ build challenge runs the size gate first 0ms
     ✓ Branch Sync merges docs and finishes as its own step 0ms
     ✓ Plan Convert checks the plan, converts one with no task markers, and re-checks 0ms
     ✓ Plan Convert leaves a valid plan with no newer comments alone 0ms
     ✓ build's comment numbers match the step table 5ms
     ✓ the convert step posts under Plan Convert's number and title 0ms
     ✓ Plan Convert's finish carries the plan-check log as an optional artifact 0ms
     ✓ Plan Current posts a comment whether it runs or skips 0ms
     ✓ Plan Current's skipped comment says no plan anchor 0ms
     ✓ issue comments newer than a valid plan send the build through convert once 0ms
     ✓ only convert reads the build-input file, and nothing reads a sub-plan 1ms
     ✓ Step 7 takes the next group's brief and hands execute its path 0ms
     ✓ Step 7 writes a group's tests with their own subagent, records them red and only then invokes execute 0ms
     ✓ a re-run gate that is still red reaches the Decision Pause through the round count 0ms
     ✓ a green re-run gate continues without asking 0ms
     ✓ Step 8 verifies a diff cut from the group's start commit 0ms
     ✓ the Decision Pause checks a red gate against the base commit before composing 0ms
     ✓ a red holistic gate routes to the holistic fix round with a Holistic gate Context line 0ms
     ✓ a holistic pause with a red gate asks the loop question and never routes continue 0ms
     ✓ the Decision Pause reads a red holistic gate's log for the base check 0ms
     ✓ Step 10 reads no cleanBase and holds no HOLISTIC_BASE 0ms
     ✓ a no-progress round after a red gate pauses with the loop question 0ms
     ✓ a failing gate or suite test is never a pause item 0ms
     ✓ group-mode verify logs no gap for a test the group gate runs 0ms
     ✓ the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read 0ms
     ✓ a Fix now edit is checked with plan-check before the loop goes on 0ms
     ✓ a Fix now challenge task is rewritten to the owner's direction in place 0ms
     ✓ a hard blocker answered Fix now with no direction is asked again 0ms
     ✓ each Fix now item records its Fix task line before the decision row is finished 0ms
     ✓ Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check 0ms
     ✓ the owner decisions contract names the task block as the Fix now carrier 0ms
     ✓ Decision Pause step 5 writes no second acceptance for a reopened DECIDED or ASSUMED pause 0ms
     ✓ an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date 0ms
     ✓ build writes one input file with every input in Step 2, before any plan check 0ms
     ✓ convert and plan-generate prompts (3)
       ✓ convert copies an input's TEST EXCEPTION and never writes its own 0ms
       ✓ convert names no plan format but the task-block one 0ms
       ✓ convert reads the whole input file; the newer text wins where it and the plan disagree 0ms
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ live docs (1)
     ✓ live docs name no build step the table does not carry 2ms
   ✓ resume (10)
     ✓ design: the Resume line calls `status resume` 0ms
     ✓ plan: the Resume line calls `status resume` 0ms
     ✓ build: the Resume line calls `status resume` 0ms
     ✓ debug: the Resume line calls `status resume` 0ms
     ✓ ship: the Resume line calls `status resume` 0ms
     ✓ design: the step table matches the step headings and their --step= calls 1ms
     ✓ plan: the step table matches the step headings and their --step= calls 0ms
     ✓ build: the step table matches the step headings and their --step= calls 1ms
     ✓ debug: the step table matches the step headings and their --step= calls 1ms
     ✓ ship: the step table matches the step headings and their --step= calls 0ms
   ✓ plan convert skip row (1)
     ✓ writes a build-plan-convert row on the no-conversion route 0ms
   ✓ promoted parsers (1)
     ✓ holds the workflows to the step table 2ms
   ✓ debug (1)
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ verdict headers re-ask on PENDING (exit 5) as well as invalid (exit 6) (10)
     ✓ design: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ plan: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ build: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ debug: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ ship: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ design never reads a verdict outside `steps finish` 0ms
     ✓ plan never reads a verdict outside `steps finish` 0ms
     ✓ build never reads a verdict outside `steps finish` 0ms
     ✓ debug never reads a verdict outside `steps finish` 0ms
     ✓ ship never reads a verdict outside `steps finish` 0ms
   ✓ status route --require=strategy (3)
     ✓ status route --require=strategy is used at exactly the four strategy-routing sites 1ms
     ✓ every strategy route site holds repeatTests and passes Repeat tests in the agent Context 1ms
     ✓ gaps remediate and failure diagnose apply PIVOT and FINAL to Repeat tests only 0ms
   ✓ auto (2)
     ✓ resolves phase, mode and the CI context with one `runs context` call 0ms
     ✓ workflows impose no blanket runtime deadline on workflows or subagents 1ms
   ✓ diff per reader (10)
     ✓ build /Failure Path/ writes the diff right before its agents 0ms
     ✓ build /Step 10 — / writes the diff right before its agents 0ms
     ✓ build /Step 11 — Build Challenge/ writes the diff right before its agents 0ms
     ✓ debug /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Step 5 — / writes the diff right before its agents 0ms
     ✓ build group verify cuts its own diff from the group's start, right before the agent 0ms
     ✓ build hands no agent a raw `git diff` 0ms
     ✓ debug hands no agent a raw `git diff` 0ms
     ✓ ship hands no agent a raw `git diff` 0ms
   ✓ ship (8)
     ✓ ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12 0ms
     ✓ post-merge check reads the capstone job alone, at the squash commit 0ms
     ✓ the post-merge gate does its own wait: one command, no separate probe or wait 0ms
     ✓ the close removes the worktree and deletes the branch through the command, then leaves it 0ms
     ✓ brings local dev level through `branches sync-dev`, never a checkout 0ms
     ✓ skill prune warns and carries on rather than stopping the ship 0ms
     ✓ re-validates through `runs revalidate` and merges through `prs merge --match-head` 0ms
     ✓ closes through `workflows close --flush` 0ms
   ✓ plan caps (2)
     ✓ no prompt or workflow states a literal group cap 3ms
     ✓ plan and build hold the caps `repo info` prints 0ms
   ❯ plan (4)
     ✓ plan runs one review round 0ms
     ✓ bkit-plan runs plan-check after every plan-writing step 0ms
     × Fetch Context passes related-issues.md as a derived artifact 5ms
     ✓ carries draft formatting findings through review and update, with a strict final check 0ms
   ✓ design and plan close (7)
     ✓ design lands on dev through `branches land` 0ms
     ✓ plan lands on dev through `branches land` 0ms
     ✓ design reads its related issues through one `issues related` call 0ms
     ✓ plan reads its related issues through one `issues related` call 0ms
     ✓ debug reads its related issues through one `issues related` call 0ms
     ✓ design close names the file that holds the open questions 0ms
     ✓ plan close names the file that holds the open questions 0ms
   ✓ PR fallback (6)
     ✓ auto: every create_pull_request step passes the printed bodyFile 0ms
     ✓ design: every create_pull_request step passes the printed bodyFile 0ms
     ✓ plan: every create_pull_request step passes the printed bodyFile 0ms
     ✓ build: every create_pull_request step passes the printed bodyFile 0ms
     ✓ debug: every create_pull_request step passes the printed bodyFile 0ms
     ✓ ship: every create_pull_request step passes the printed bodyFile 0ms
   ✓ highest-version lookups (2)
     ✓ design never lists versions with an `ls` glob 0ms
     ✓ plan never lists versions with an `ls` glob 0ms
   ✓ summary step (5)
     ✓ design writes its summary with `workflows summary`, no summary subagent 0ms
     ✓ plan writes its summary with `workflows summary`, no summary subagent 0ms
     ✓ build writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ debug writes its summary with `workflows summary`, no summary subagent 0ms
     ✓ ship writes its summary with `workflows summary`, no summary subagent 0ms
   ✓ locks (5)
     ✓ design's Locks header no longer waits on the lock file's age 0ms
     ✓ plan's Locks header no longer waits on the lock file's age 0ms
     ✓ build's Locks header no longer waits on the lock file's age 0ms
     ✓ debug's Locks header no longer waits on the lock file's age 0ms
     ✓ ship's Locks header no longer waits on the lock file's age 0ms
   ✓ final return at the close (10)
     ✓ design builds its final message in `workflows close` and displays it verbatim 0ms
     ✓ plan builds its final message in `workflows close` and displays it verbatim 0ms
     ✓ build builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ debug builds its final message in `workflows close` and displays it verbatim 0ms
     ✓ ship builds its final message in `workflows close` and displays it verbatim 0ms
     ✓ design passes its summary file 0ms
     ✓ plan passes its summary file 0ms
     ✓ build passes its summary file 0ms
     ✓ debug passes its summary file 0ms
     ✓ ship passes its summary path plus the missing-summary line 0ms
   ✓ issue-less runs (74)
     ✓ design: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ plan: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 0ms
     ✓ build: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ debug: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 0ms
     ✓ ship: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 0ms
     ✓ design: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ plan: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ build: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ debug: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ ship: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ design: no wired-tracker block STOPs on a missing issue 0ms
     ✓ plan: no wired-tracker block STOPs on a missing issue 0ms
     ✓ build: no wired-tracker block STOPs on a missing issue 0ms
     ✓ debug: no wired-tracker block STOPs on a missing issue 0ms
     ✓ ship: no wired-tracker block STOPs on a missing issue 0ms
     ✓ design: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 1ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ ship: fids resolve and steps gate carry --issue in every workflow 1ms
     ✓ design: the No issue bullet sits in a tracker true block 0ms
     ✓ plan: the No issue bullet sits in a tracker true block 0ms
     ✓ build: the No issue bullet sits in a tracker true block 0ms
     ✓ debug: the No issue bullet sits in a tracker true block 0ms
     ✓ ship: the No issue bullet sits in a tracker true block 0ms
     ✓ design: final messages start with the no-issue warning clause 0ms
     ✓ plan: final messages start with the no-issue warning clause 0ms
     ✓ build: final messages start with the no-issue warning clause 0ms
     ✓ debug: final messages start with the no-issue warning clause 0ms
     ✓ ship: final messages start with the no-issue warning clause 0ms
     ✓ design: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ plan: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ build: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ debug: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ ship: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ design: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ plan: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ build: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ debug: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ ship: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ ship checks the plan with `fids plans`; build checks it with `tests plan-check` 1ms
     ✓ plan reads the parent design and audit reports from `fids design` 0ms
     ✓ design: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ plan: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ ship's merge MCP fallback proves the scoped dev base through the engine before merging 0ms
     ✓ design: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ plan: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ build: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ debug: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ ship: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ design: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ plan: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ debug: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ design: tracker gate items name the attempt, never its skip rule 0ms
     ✓ plan: tracker gate items name the attempt, never its skip rule 0ms
     ✓ build: tracker gate items name the attempt, never its skip rule 1ms
     ✓ debug: tracker gate items name the attempt, never its skip rule 1ms
     ✓ ship: tracker gate items name the attempt, never its skip rule 0ms
     ✓ design: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ plan: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ build: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ debug: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ ship: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ design: the no-issue warning flag sits outside every issue-only span 0ms
     ✓ plan: the no-issue warning flag sits outside every issue-only span 0ms
     ✓ build: the no-issue warning flag sits outside every issue-only span 1ms
     ✓ debug: the no-issue warning flag sits outside every issue-only span 0ms
     ✓ ship: the no-issue warning flag sits outside every issue-only span 0ms
     ✓ build 16.9 and debug 11.9 post-push label re-reads skip when ISSUE_ID is empty 1ms
     ✓ build 16.9 and debug 11.9 report a removed bkit:auto and stop nothing 1ms
     ✓ build Step 1 blocker check skips when ISSUE_ID is empty 0ms
     ✓ design Step 11 requires an issue 0ms
     ✓ design Step 11 posts plans 0ms
     ✓ debug Step 1 never probes for a PR on dev or main 0ms
   ✓ workflow routing (5)
     ✓ AGENTS.md sends only a bkit-{command} prompt to router.md 0ms
     ✓ router.md hands back a prompt that only mentions a workflow 0ms
     ✓ router.md reads the issue through bkit verbs, never a tracker MCP tool 0ms
     ✓ router.md names an existing command file for every host and command 0ms
     ✓ phase workflows read the issue themselves, never from AGENTS.md 1ms
   ✓ debug on dev (5)
     ✓ debug passes --base only when it runs in place on dev, outside the no-leak scan 0ms
     ✓ build migration scan and debug off-dev no-leak scan pass --base=origin/dev 0ms
     ✓ debug Steps 9 and 10 push nothing on dev 0ms
     ✓ the TRIGGER_PR commit is unreachable on dev 0ms
     ✓ debug stops and asks on a foreign path 0ms
   ✓ ship deferred sweep base (1)
     ✓ ship sweep and Failure Path context diff lines pass --base=origin/dev 0ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 2ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 0ms
   ✓ fix loops ask only when the last round made no progress (5)
     ✓ build takes a further test round without asking unless the trend is stuck or worse 0ms
     ✓ debug takes a further fix or soak attempt without asking unless the trend is stuck or worse 0ms
     ✓ debug Loop Question states the engine's trend line, never a fixed claim 0ms
     ✓ debug Loop Question at the used-up soak limit states the trend line 0ms
     ✓ ship asks the Merge Question only when the merge attempts are used up 0ms
   ✓ build publish ending (8)
     ✓ resolves publish through status route 0ms
     ✓ re-derives publish on resume 0ms
     ✓ warns when a non-LOCAL run resolves publish false 0ms
     ✓ skips push, PR and CI on a held close 0ms
     ✓ keeps the publish=true close path 0ms
     ✓ appends the held roadmap row without roadmap mirror 0ms
     ✓ makes Gate 15 conditional on the held path 0ms
     ✓ runs only the close gate on the held path 0ms
   ✓ build Decision Pause continue route (8)
     ✓ a verify or holistic pause routes continue before the verify and holistic re-runs 0ms
     ✓ the Decision Pause continue route is taken only through decisions skip 0ms
     ✓ continue sends holistic to Step 11 and verify to the decision tick then Step 7 0ms
     ✓ the continue decision tick runs before the build-decision row is recorded 0ms
     ✓ the holistic continue tick runs without --group before the build-decision row is recorded 0ms
     ✓ both VERIFY_GAPS lists title an item Task {N} for the decision tick 0ms
     ✓ a verify or holistic decision file records Source changed and a resume holds it 1ms
     ✓ the continue decision tick routes a non-zero exit to the Failure Path 0ms
   ✓ questions never re-run a check without a change (1)
     ✓ debug and ship questions offer no answer that re-runs a check without a change 0ms
   ✓ planned tests a code step changed (9)
     ✓ an exit 11 re-ask offers the BLOCKED test line the engine reads 1ms
     ✓ Step 15 asks once about planned tests a code step changed, before the unproven ones 0ms
     ✓ a changed-test item offers Accept or Stop, recommended Accept 0ms
     ✓ the execute prompt's BLOCKED test line is one the engine reads 0ms
     ✓ the remediate prompt's BLOCKED test line is one the engine reads 0ms
     ✓ a changed-test item shows the test's line diff since its baseline 0ms
     ✓ the code prompts say a BLOCKED line lets through only a change that adds lines 0ms
     ✓ the verify prompt notes a planned test a code step changed and raises no gap 0ms
     ✓ the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment 0ms
   ✓ build planned-test takeovers (2)
     ✓ the build routes a tests-step exit 11 once, and leaves the takeover write to the engine 1ms
     ✓ Step 8 runs pending takeovers first, and a holistic fix goes back through Step 7 1ms
   ✓ build gaps-fix source checks (1)
     ✓ bkit-build gaps-fix source checks measure from the previous step, never HEAD~1 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > plan > Fetch Context passes related-issues.md as a derived artifact
AssertionError: expected '   "{BKIT}" steps finish --file="{STA…' to contain '--derived-artifact=docs/plans/{YYYYMM…'

Expected: "--derived-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md"
Received: "   "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-fetch-context --attempt=1 --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-deferrals.md --artifact=docs/plans/{YYYYMM}/logs/{FID}/related-failures.md --clamp-log=plan-fetch-context --message="chore({FID}): fetch-context" --number=4 --post --title="Fetch Context" --link-ref=dev"

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:1590:24
    1588|     const finish4 = commandLines(section(plan, /Step 4 — Fetch Context…
    1589|     expect(finish4).toHaveLength(1);
    1590|     expect(finish4[0]).toContain(`--derived-artifact=${LOG}/related-is…
       |                        ^
    1591|     expect(finish4[0]).not.toContain(`--optional-artifact=${LOG}/relat…
    1592|     expect(finish4[0]).not.toContain(`--artifact=${LOG}/related-issues…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 327 passed (328)
   Start at  20:52:59
   Duration  326ms (tests 46%, import 30%, transform 17%, setup 7%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-YkDAEc/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
