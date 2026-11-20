Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 2

Plan: `docs/plans/202611/1051-build-code-step-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a finish that cannot write package.json back says it was not restored and names the write error" | red | failure: EISDIR: illegal operation on a directory, read |

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

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (199 tests | 1 failed) 142575ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 554ms
     ✓ finishes a CI round only with its own failed job count 671ms
     ✓ preserves local clamp enforcement when completing test rounds 187ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 146ms
     ✓ done prints progressLine 144ms
     ✓ progress output metadata 0ms
     ✓ gate progress number validation 126ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 424ms
     ✓ done --group writes group on the row 374ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 625ms
     ✓ --commit=none writes the row and leaves it uncommitted 159ms
     ✓ build-group-start records parentSha and group 197ms
     ✓ carries extra fields, parsed as JSON when they are JSON 541ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 146ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 155ms
     ✓ refuses an empty artifact 175ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 175ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 212ms
     ✓ rejects ["--verdict=MAYBE"] 188ms
     ✓ rejects ["--strategy=YOLO"] 122ms
     ✓ rejects ["--failures=-1"] 132ms
     ✓ rejects ["--field=verdict=PASS"] 136ms
     ✓ rejects ["--status=SKIPPED"] 147ms
     ✓ needs a message unless --commit=none 176ms
     ✓ reports a failed commit with exit 8 without writing the row 847ms
     ✓ a failed commit leaves no row staged in the index 603ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 961ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 704ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 980ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 603ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 971ms
   ✓ bkit steps verdict (11)
     ✓ returns the verdict and every header field 133ms
     ✓ reads a header with a leftover Fingerprint line 130ms
     ✓ a missing artifact exits 4 195ms
     ✓ empty artifact exits 0 141ms
     ✓ pending artifact exits 1 138ms
     ✓ no marker artifact exits 2 177ms
     ✓ disallowed artifact exits 3 161ms
     ✓ bad failures artifact exits 4 187ms
     ✓ a required field that is absent is invalid (re-prompt) 132ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 156ms
     ✓ only reads above the marker 196ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 499ms
     ✓ fails when no row was written for the step 171ms
     ✓ --ref reads the status file as committed on that ref, not from disk 444ms
     ✓ --ref exits 3 when the ref does not carry the status file 413ms
     ✓ fails on a placeholder left in the artifact 351ms
     ✓ fails when the row's verdict differs from the artifact's 428ms
     ✓ fails when the row does not list the artifact, or carries another attempt 368ms
     ✓ fails on a missing artifact 587ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 542ms
     ✓ refuses a negative or non-integer attempt (2) 197ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 162ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 152ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 138ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a row missing its attempt 176ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 164ms
     ✓ fails a diagnose row missing its strategy, passes with it 447ms
     ✓ fails a run-tests row missing its scope, and an empty scope 543ms
     ✓ steps finish records attempt and scope on a build-holistic-gate row 209ms
     ✓ names every missing field at once 238ms
     ✓ asks nothing of a step that writes none of them 218ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 18ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
   ✓ bkit steps finish (21)
     ✓ preserves challenge findings in the event when a later round overwrites the report 288ms
     ✓ steps finish refuses route=continue that decisions skip would refuse 247ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 742ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 161ms
     ✓ --derived-artifact (4)
       ✓ a --derived-artifact holding a whole-line PENDING passes and is recorded 167ms
       ✓ a PENDING in --artifact still refuses while a --derived-artifact is passed 129ms
       ✓ a PENDING in --optional-artifact still refuses while a --derived-artifact is passed 176ms
       ✓ a missing --derived-artifact is skipped and not recorded 228ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 196ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 151ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 171ms
     ✓ a true | false header field is true when any agent sets it true 153ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 155ms
     ✓ records the header's Strategy on the row 253ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 179ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 846ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 451ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 1134ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 4077ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1037ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 1175ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1727ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1900ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 2092ms
     ✓ --post needs --number; without --post there is no tracker key 555ms
   ✓ bkit steps stub (4)
     ✓ copies the prior version under a PENDING header 256ms
     ✓ --strip-header drops the prior version's own header 441ms
     ✓ refuses --result-file as an unknown flag 383ms
     ✓ exits 4 when the prior version is missing or empty 335ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 304ms
     ✓ checks the FID's shape for the wired tracker 580ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 578ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 195ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 756ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 1025ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 695ms
       ✓ gate --issue without --fid is a usage error 247ms
       ✓ gate --issue="" under none keeps today's check 281ms
     ✓ --attempt-of checks the row carries the derived counter 602ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1126ms
     ✓ writeStepRow refuses when a recorded path changed 1357ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 451ms
     ✓ writeStepRow appends its commit sha to the record 1075ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1705ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 584ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 971ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 785ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 911ms
     ✓ finds the run's plan beside its status file 0ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 2088ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 2355ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 997ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 743ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 606ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1069ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 504ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 445ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 651ms
     ✓ the tests step's finish passes its own group's and taken-over tests 2111ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 1279ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 841ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 850ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 846ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 524ms
     ✓ the refusal names the BLOCKED line the engine reads 384ms
     ✓ the exit 11 help names the BLOCKED line that lets a change through 1ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 1319ms
     ✓ refuses a later code step that changes a BLOCKED change again 1197ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 1516ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 2728ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 1454ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 1649ms
     ✓ the refusal of a re-change says the logged reason is already recorded 1375ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 462ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 599ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 588ms
     ✓ the same contradicted finish run again adds no second task or row 835ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 609ms
     ✓ a mixed refusal names both tests and words the problem for each kind 581ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 641ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 645ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 811ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 1290ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 909ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 1167ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 1068ms
     ✓ a changedTests record on a non-code-step row does not move the lock's baseline 611ms
     ✓ refuses a --field changedTests on a step finish 484ms
     ✓ the exit 11 refusal says verify reads a BLOCKED change's added lines 613ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 1ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 338ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 650ms
     ✓ does not count an artifact the run found committed when it started 727ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 381ms
     ✓ commits a package.json change outside bkit.workflows 825ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1647ms
   ✓ promptHeader (1)
     ✓ reads the Failures count rule of bkit-plan-review-1 4ms
   ✓ headerDeclaration (1)
     ✓ refuses an unknown count declaration 2ms
   ✓ bkit steps finish (12)
     ✓ checks Failures against the ## CRITICAL items and ignores OPTIONAL ones 301ms
     ✓ reads None under ## CRITICAL as zero items 355ms
     ✓ refuses a verify Fixable that disagrees with its gap lines 161ms
     ✓ counts only the Fixable gap lines under a verify gap-count line 212ms
     ✓ does not count a Fixable line inside a code fence under the verify gaps log 272ms
     ✓ refuses a challenge PASS with a HIGH task block 185ms
     ✓ refuses a challenge CONCERNS with a CRITICAL task block 230ms
     ✓ hands back a challenge task block it cannot read 218ms
     ✓ refuses a report the old render wrote whose Failures counted an OPTIONAL item 371ms
     ✓ checks each agent's count in a two-agent finish 165ms
     ✓ does not count a fenced line under ## CRITICAL as an item 248ms
     ✓ a fenced ## line under ## CRITICAL does not end the section 188ms
   ❯ bkit steps finish — a build code step makes the generated output current first (24)
     ✓ a code step finish builds the declared bkit:generate output first, so a stale-output hook lets the commit through 7347ms
     ✓ the gaps-remediate and holistic steps build the output too 2439ms
     ✓ a repo with no bkit:generate script runs nothing and a stale-output hook still exits 8 951ms
     ✓ an empty bkit:generate script counts as undeclared 921ms
     ✓ a step that is not a code step never runs bkit:generate 837ms
     ✓ a FAIL code step whose bkit:generate fails still lands its row so the remediate loop runs 1337ms
     ✓ a HANDOVER code step whose bkit:generate fails still lands its row so the handover re-run happens 1456ms
     ✓ a PASS code step whose bkit:generate fails lands with generate failed, a friction row and the commit 1203ms
     ✓ a failing bkit:generate exits 16 with nothing written and nothing committed 1245ms
     ✓ a hook refusal about something else stays exit 8 after bkit:generate ran 1227ms
     ✓ --commit=none does not run bkit:generate 348ms
     ✓ a generated bkit.workflows key in a repo that is not bkit's own exits 13, names bkit:generate and commits nothing 738ms
     ✓ in bkit's own repo a generated added bkit.workflows key rides the step commit and is printed and on the row 1450ms
     ✓ in bkit's own repo the step's own bkit.workflows edit made before bkit:generate exits 13 as the step's edit 1302ms
     ✓ in bkit's own repo a bkit:generate that changes an existing bkit.workflows value exits 13 and names bkit:generate 1220ms
     ✓ in bkit's own repo a key the code agent's own bkit:generate run added rides the step commit 1798ms
     ✓ in bkit's own repo a generated added key left by a finish the hook refused rides the re-run 5613ms
     ✓ in bkit's own repo a hand-added bkit.workflows key that bkit:generate does not produce exits 13 and leaves package.json as the step wrote it 1638ms
     ✓ in bkit's own repo a seeded bkit.workflows key with a hand-changed value exits 13 and keeps the hand value 1248ms
     ✓ outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json 1432ms
     ✓ in bkit's own repo a bkit:generate that fails after a bkit.workflows difference restores the step's package.json and exits 13 2351ms
     ✓ in bkit's own repo a bkit:generate that leaves package.json unparseable gets the step's original package.json back and exits 13 1056ms
     × in bkit's own repo a finish that cannot write package.json back says it was not restored and names the write error 858ms
     ✓ a failed bkit:generate friction row is not folded into an earlier test-lock row of the same step 1791ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — a build code step makes the generated output current first > in bkit's own repo a finish that cannot write package.json back says it was not restored and names the write error
Error: EISDIR: illegal operation on a directory, read
 ❯ readPackage .bkit/core/engine/commands/workflow/steps.ts:1121:24
    1119|         : { ok: true as const, value: {} }
    1120|       : fs.existsSync(file)
    1121|         ? parseJson(fs.readFileSync(file, "utf-8"))
       |                        ^
    1122|         : { ok: true as const, value: {} };
    1123|   return parsed.ok ? parsed.value : null;
 ❯ writeWorkflows .bkit/core/engine/commands/workflow/steps.ts:1143:15
 ❯ restoreKept .bkit/core/engine/commands/workflow/steps.ts:1163:7
 ❯ Object.finish [as run] .bkit/core/engine/commands/workflow/steps.ts:1552:16
 ❯ Module.runCommand .bkit/core/engine/commands/lib.ts:982:29
 ❯ run .bkit/core/engine/commands/workflow/steps.test.ts:77:22
 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3868:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 198 passed (199)
   Start at  08:06:43
   Duration  143.52s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-FgR0hK/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
