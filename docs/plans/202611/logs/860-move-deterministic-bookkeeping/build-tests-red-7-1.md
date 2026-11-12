Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 7, attempt 1

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 23 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "keeps ledger operation intents and receipts out of committed book paths" | red | failure: expected true to be false // Object.is equality |
| 24 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses line breaks in header-bound result values" | red | failure: expected 'rendered: Status: COMPLETE\nReport: d…' to be 6 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/ledgers.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/ledgers.test.ts

[test-timeout-budget] load average 3.6 on 10 cores: unit limits 6300ms per test, 12600ms per hook (x1.26)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (106 tests | 1 failed) 8626ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 153ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 136ms
     ✓ brand-new untracked ledger is staged and committed 129ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 125ms
     ✓ path containing a space is staged and committed 111ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 99ms
     ✓ staging failure: exit 4 and no commit is created, no false success 199ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 143ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 111ms
     ✓ --mode=stage stages the sweep but creates no commit 122ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 397ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 167ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 140ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 81ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 84ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 79ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 24ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 23ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 24ms
     ✓ root that is not a directory or not a repo exits 3 6ms
     ✓ --root defaults to the working directory 88ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 139ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 136ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 126ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 123ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 84ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 48ms
     ✓ a path outside the checkout exits 6 with nothing committed 64ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 90ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 52ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 189ms
     ✓ --path records its commit on the run's record, like every other commit mode 188ms
     ✓ a recorded ledger commits only the rows the run appended 271ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 315ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 287ms
     ✓ commitBookkeeping refuses when a recorded path changed 151ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 191ms
     ✓ under --mode=commit counts the squashed paths as something to commit 189ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 125ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 80ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 128ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 83ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 64ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 63ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 60ms
     ✓ carries untracked ledgers too 61ms
     ✓ keeps rows on separate lines when the destination has no final newline 62ms
     ✓ src that is not a git repo exits 3 7ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 121ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 159ms
     ✓ a source file in the range: exit 7, path listed 120ms
     ✓ another FID's plan file in the range: exit 7 118ms
     ✓ from not an ancestor of to: exit 7 105ms
     ✓ unknown commit exits 3; a missing flag exits 2 72ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 0ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 37ms
     ✓ append keeps a row's own repo 38ms
     ✓ append refuses a supplied ts 33ms
     ✓ append refuses a supplied schema or bkit 49ms
     ✓ append refuses a flat top-level field the top section moved into by 34ms
     ✓ append writes nothing when one row is invalid 33ms
     ✓ append refuses a row whose kind is not the ledger's 25ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 43ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 39ms
     ✓ append bumps a round-second mint 37ms
     ✓ append refuses an empty rows file 24ms
     ✓ append refuses an unknown or issues ledger 24ms
     ✓ append refuses a writer not listed for the kind 51ms
     ✓ append starts a new line when the ledger lacks its final newline 36ms
     ✓ append creates the ledger and its directory 37ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 36ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 45ms
     ✓ append replaces a supplied firstTs / updates with the computed values 35ms
     ✓ append continues the count from a compacted winner 35ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 36ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 2ms
     ✓ --ledger narrows the run to one ledger 1ms
     ✓ --dry-run counts without writing 1ms
     ✓ a second run changes nothing 1ms
     ✓ refuses an unknown --ledger with a usage error 0ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 1ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 1ms
     ✓ passes on None 1ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 1ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 52ms
     ✓ triage keeps an own-cycle deferral exempt 51ms
     ✓ triage marks an unjustified deferral lazy 62ms
     ✓ triage writes an unjustified row with a minted ts 67ms
     ✓ triage writes no row for a closed deferral 55ms
     ✓ triage reports an adjudicated unjustified row outside exempt 51ms
     ✓ triage ignores another feature's deferral rows 63ms
     ✓ triage writes nothing when the FID has no deferral row 55ms
     ✓ triage refuses a plan with no task blocks 76ms
     ✓ triage refuses a plan whose task blocks do not parse 75ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 66ms
   ✓ bkit ledgers append --invocation (5)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 153ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 119ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 128ms
     ✓ lands a standalone corrected candidate and reports the spend 84ms
     ✓ issues the same operation for rows whose keys are reordered 77ms
   ✓ bkit ledgers query (1)
     ✓ pages canonical winners with diagnostics and rejects stale cursors 26ms
   ❯ bkit ledgers append --operation (3)
     ✓ returns durable append receipt and permits a deliberate same-key update 50ms
     × keeps ledger operation intents and receipts out of committed book paths 42ms
     ✓ refuses --issue-operation without an invocation or beside --operation, writing nothing 24ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append --operation > keeps ledger operation intents and receipts out of committed book paths
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2253:74
    2251|
    2252|     // Nothing lands in the committed, union-carried store.
    2253|     expect(fs.existsSync(path.join(r, ".bkit/ledger-operations.jsonl")…
       |                                                                          ^
    2254|     // The intent and receipt live under the git common dir's private …
    2255|     const outbox = path.join(r, ".git", "bkit-outbox");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 105 passed (106)
   Start at  11:05:54
   Duration  8.84s (tests 98%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-aV6Bwa/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 3.6 on 10 cores: unit limits 6300ms per test, 12600ms per hook (x1.26)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (124 tests | 1 failed) 12407ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 164ms
     ✓ preserves local clamp enforcement when completing test rounds 45ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 46ms
     ✓ done prints progressLine 54ms
     ✓ progress output metadata 0ms
     ✓ gate progress number validation 46ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 126ms
     ✓ done --group writes group on the row 102ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 167ms
     ✓ --commit=none writes the row and leaves it uncommitted 52ms
     ✓ build-group-start records parentSha and group 50ms
     ✓ carries extra fields, parsed as JSON when they are JSON 101ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 38ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 39ms
     ✓ refuses an empty artifact 37ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 38ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 43ms
     ✓ rejects ["--verdict=MAYBE"] 39ms
     ✓ rejects ["--strategy=YOLO"] 39ms
     ✓ rejects ["--failures=-1"] 38ms
     ✓ rejects ["--field=verdict=PASS"] 39ms
     ✓ rejects ["--status=SKIPPED"] 40ms
     ✓ needs a message unless --commit=none 44ms
     ✓ reports a failed commit with exit 8 without writing the row 297ms
     ✓ a failed commit leaves no row staged in the index 224ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 277ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 258ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 228ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 209ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 236ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 52ms
     ✓ a missing artifact exits 4 37ms
     ✓ empty artifact exits 0 36ms
     ✓ pending artifact exits 1 36ms
     ✓ no marker artifact exits 2 37ms
     ✓ disallowed artifact exits 3 40ms
     ✓ bad failures artifact exits 4 38ms
     ✓ a required field that is absent is invalid (re-prompt) 36ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 39ms
     ✓ only reads above the marker 38ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 103ms
     ✓ fails when no row was written for the step 39ms
     ✓ --ref reads the status file as committed on that ref, not from disk 112ms
     ✓ --ref exits 3 when the ref does not carry the status file 118ms
     ✓ fails on a placeholder left in the artifact 109ms
     ✓ fails when the row's verdict differs from the artifact's 101ms
     ✓ fails when the row does not list the artifact, or carries another attempt 101ms
     ✓ fails on a missing artifact 101ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 102ms
     ✓ refuses a negative or non-integer attempt (2) 38ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 45ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 45ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 38ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 44ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 45ms
     ✓ fails a diagnose row missing its strategy, passes with it 88ms
     ✓ fails a run-tests row missing its scope, and an empty scope 134ms
     ✓ names every missing field at once 45ms
     ✓ asks nothing of a step that writes none of them 44ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 8ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 0ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 47ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 138ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 39ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 39ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 39ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 44ms
     ✓ a true | false header field is true when any agent sets it true 45ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 50ms
     ✓ records the header's Strategy on the row 51ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 49ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 120ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 37ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 95ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 152ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 205ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 169ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 192ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 285ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 187ms
     ✓ --post needs --number; without --post there is no tracker key 69ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 39ms
     ✓ --strip-header drops the prior version's own header 40ms
     ✓ exits 4 when the prior version is missing or empty 38ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 39ms
     ✓ checks the FID's shape for the wired tracker 50ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 87ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 45ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 173ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 131ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 88ms
       ✓ gate --issue without --fid is a usage error 38ms
       ✓ gate --issue="" under none keeps today's check 44ms
     ✓ --attempt-of checks the row carries the derived counter 104ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 263ms
     ✓ writeStepRow refuses when a recorded path changed 304ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 140ms
     ✓ writeStepRow appends its commit sha to the record 273ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 616ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 99ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 195ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 186ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 122ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 317ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 230ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 180ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 120ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 295ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 52ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 114ms
     ✓ does not count an artifact the run found committed when it started 147ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 90ms
     ✓ commits a package.json change outside bkit.workflows 147ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 271ms
   ❯ bkit steps stub --result-file (8)
     ✓ derives supported header fields and rejects stale bodies without false PASS 41ms
     ✓ registers every named header kind 6ms
     ✓ renders and verifies the header of every prompt that declares one 55ms
     ✓ renders no PASS from a result that omits its evidence 40ms
     × refuses line breaks in header-bound result values 42ms
     ✓ retains special verdict judgments and legacy stub behavior 41ms
     ✓ derives audit IDs totals ledger payloads and coverage from one result 45ms
     ✓ audit result render keeps an existing anchored report intact 42ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps stub --result-file > refuses line breaks in header-bound result values
AssertionError: expected 'rendered: Status: COMPLETE\nReport: d…' to be 6 // Object.is equality

- Expected:
6

+ Received:
"rendered: Status: COMPLETE
Report: docs/audits/x.md
Findings: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0
Findings: CRITICAL 1 · HIGH 0 · MEDIUM 0 · LOW 0
Issue: None
Parent: None
Fingerprint: 2df177bc1e1e93228a32c582c193bb6b4c550f7a364f8d0fad07e2ca33870dce
<!-- verdict:end -->

# Audit Summary: security

## Stopped

None

## Overview

None

## Suggested Issues

| ID | Severity | Title | Location | Prior key |
| --- | --- | --- | --- | --- |
| security-1 | CRITICAL | Token leak | `src/a.ts:1` | none |

## Not Checked

None

## Ledger

- `audit-security-token-leak` CRITICAL OPEN
"

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2414:71
    2412|
    2413|     // Each audit header-bound value is refused with exit 6, whichever…
    2414|     expect(outcome("bkit-audit-generate", audit({ report: forged }))).…
       |                                                                       ^
    2415|     expect(outcome("bkit-audit-generate", audit({ report: "a.md\r<!-- …
    2416|     expect(outcome("bkit-audit-generate", audit({ issue: "#1\nVerdict:…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 123 passed (124)
   Start at  11:06:03
   Duration  12.59s (tests 99%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-HTnrWC/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
