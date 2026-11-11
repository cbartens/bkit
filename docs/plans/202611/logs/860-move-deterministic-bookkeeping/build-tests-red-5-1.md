Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 5, attempt 1

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 13 | `.bkit/core/engine/commands/workflow/steps.test.ts` "audit result render keeps an existing anchored report intact" | red | failure: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-steps-zR3dj5/docs/audits/security.md' |
| 14 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "resolves a pending ledger intent after its invocation is stale" | red | failure: operation op-stale was already used for a different request; nothing written |
| 15 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "appends the printed audit ledgerRows verbatim under the standalone invocation" | red | failure: expected '[bkit-ledgers] row 1: conflict: by.st…' not to contain 'disagrees with invocation' |
| 16 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it" | red | failure: expected { phase: 'done', handoff: +0, …(6) } to match object { handoff: 6, ciDispatch: null } (6 matching properties omitted from actual) |
| 17 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "refuses to re-append a partly landed block after a foreign writer appended" | red | failure: expected [Function] to throw an error |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 19.9 on 10 cores: unit limits 14450ms per test, 28900ms per hook (x2.89)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (122 tests | 1 failed) 49337ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 699ms
     ✓ preserves local clamp enforcement when completing test rounds 164ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 159ms
     ✓ done prints progressLine 168ms
     ✓ progress output metadata 0ms
     ✓ gate progress number validation 182ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 468ms
     ✓ done --group writes group on the row 522ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 779ms
     ✓ --commit=none writes the row and leaves it uncommitted 231ms
     ✓ build-group-start records parentSha and group 256ms
     ✓ carries extra fields, parsed as JSON when they are JSON 443ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 218ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 190ms
     ✓ refuses an empty artifact 199ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 189ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 244ms
     ✓ rejects ["--verdict=MAYBE"] 150ms
     ✓ rejects ["--strategy=YOLO"] 274ms
     ✓ rejects ["--failures=-1"] 135ms
     ✓ rejects ["--field=verdict=PASS"] 159ms
     ✓ rejects ["--status=SKIPPED"] 172ms
     ✓ needs a message unless --commit=none 167ms
     ✓ reports a failed commit with exit 8 without writing the row 793ms
     ✓ a failed commit leaves no row staged in the index 738ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 892ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 887ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 873ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 746ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 817ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 171ms
     ✓ a missing artifact exits 4 141ms
     ✓ empty artifact exits 0 174ms
     ✓ pending artifact exits 1 151ms
     ✓ no marker artifact exits 2 167ms
     ✓ disallowed artifact exits 3 134ms
     ✓ bad failures artifact exits 4 168ms
     ✓ a required field that is absent is invalid (re-prompt) 124ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 176ms
     ✓ only reads above the marker 171ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 348ms
     ✓ fails when no row was written for the step 112ms
     ✓ --ref reads the status file as committed on that ref, not from disk 399ms
     ✓ --ref exits 3 when the ref does not carry the status file 519ms
     ✓ fails on a placeholder left in the artifact 617ms
     ✓ fails when the row's verdict differs from the artifact's 523ms
     ✓ fails when the row does not list the artifact, or carries another attempt 414ms
     ✓ fails on a missing artifact 396ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 297ms
     ✓ refuses a negative or non-integer attempt (2) 141ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 199ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 208ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 188ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 158ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 149ms
     ✓ fails a diagnose row missing its strategy, passes with it 337ms
     ✓ fails a run-tests row missing its scope, and an empty scope 467ms
     ✓ names every missing field at once 191ms
     ✓ asks nothing of a step that writes none of them 167ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 18ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 1ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 165ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 467ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 123ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 121ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 173ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 214ms
     ✓ a true | false header field is true when any agent sets it true 253ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 275ms
     ✓ records the header's Strategy on the row 193ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 248ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 642ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 137ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 317ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 798ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 937ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 1142ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 724ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1306ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 819ms
     ✓ --post needs --number; without --post there is no tracker key 290ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 184ms
     ✓ --strip-header drops the prior version's own header 132ms
     ✓ exits 4 when the prior version is missing or empty 163ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 134ms
     ✓ checks the FID's shape for the wired tracker 155ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 402ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 261ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 757ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 593ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 309ms
       ✓ gate --issue without --fid is a usage error 174ms
       ✓ gate --issue="" under none keeps today's check 192ms
     ✓ --attempt-of checks the row carries the derived counter 397ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 976ms
     ✓ writeStepRow refuses when a recorded path changed 1049ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 583ms
     ✓ writeStepRow appends its commit sha to the record 1095ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1324ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 520ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 802ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 1144ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 507ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1265ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 792ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 827ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 540ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1239ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 175ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 400ms
     ✓ does not count an artifact the run found committed when it started 722ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 297ms
     ✓ commits a package.json change outside bkit.workflows 456ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1148ms
   ❯ bkit steps stub --result-file (6)
     ✓ derives supported header fields and rejects stale bodies without false PASS 187ms
     ✓ registers every named header kind 14ms
     ✓ renders and verifies the header of every prompt that declares one 284ms
     ✓ retains special verdict judgments and legacy stub behavior 122ms
     ✓ derives audit IDs totals ledger payloads and coverage from one result 180ms
     × audit result render keeps an existing anchored report intact 145ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps stub --result-file > audit result render keeps an existing anchored report intact
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-steps-zR3dj5/docs/audits/security.md'
 ❯ write .bkit/core/engine/commands/workflow/steps.test.ts:57:6
     55|
     56| const write = (cwd: string, rel: string, body: string) =>
     57|   fs.writeFileSync(path.join(cwd, rel), body);
       |      ^
     58|
     59| async function run(cwd: string, argv: string[]) {
 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2502:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 121 passed (122)
   Start at  09:19:55
   Duration  50.26s (tests 99%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-9Ya7Pa/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/journal.integration.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/journal.integration.test.ts

[test-timeout-budget] load average 19.6 on 10 cores: unit limits 14300ms per test, 28600ms per hook (x2.86)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts (20 tests | 4 failed) 28955ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ writes friction to the run's own book root 287ms
     ✓ writes no friction row for a declared routing exit 252ms
     ✓ skips a call made outside the run's worktree 451ms
     ✓ writes nothing when no run is active in the cwd 283ms
     ✓ a call launched from a git hook writes no engine-call row 987ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 1099ms
     ✓ branches anchor-read with a plan --file journals into the active run 364ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 734ms
     ✓ keeps invocation events and engine-call rows inside the issuing worktree after receipt loss 593ms
     ✓ completes missing subagent attribution before a real append 532ms
   ✓ canonical ledger reads on real files (1)
     ✓ distinguishes unreadable missing malformed and clean ledger coverage without writing 379ms
   ❯ replay-safe ledger appends on real files (6)
     ✓ reconciles lost append response at each durable checkpoint without duplicate rows 442ms
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2882ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 538ms
     × resolves a pending ledger intent after its invocation is stale 578ms
     × appends the printed audit ledgerRows verbatim under the standalone invocation 484ms
     × refuses to re-append a partly landed block after a foreign writer appended 317ms
   ❯ persistent CI handoff on a real local remote (2)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 12681ms
     × blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 2347ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 2722ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > replay-safe ledger appends on real files > resolves a pending ledger intent after its invocation is stale
Error: operation op-stale was already used for a different request; nothing written
 ❯ .bkit/core/engine/commands/workflow/ledgers.ts:1700:17
    1698|         const intent = ledgerIntent(ops, operation);
    1699|         if (intent !== undefined && intent.hash !== hash)
    1700|           throw new CommandError(
       |                 ^
    1701|             EXIT_ROW_REFUSED,
    1702|             `operation ${operation} was already used for a different r…
 ❯ withTargetLock .bkit/core/engine/ledgers/status.ts:853:12
 ❯ .bkit/core/engine/commands/workflow/ledgers.ts:1681:14
 ❯ withTargetLock .bkit/core/engine/ledgers/status.ts:853:12
 ❯ appendLedgerRows .bkit/core/engine/commands/workflow/ledgers.ts:1674:12
 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:897:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > replay-safe ledger appends on real files > appends the printed audit ledgerRows verbatim under the standalone invocation
AssertionError: expected '[bkit-ledgers] row 1: conflict: by.st…' not to contain 'disagrees with invocation'

- Expected
+ Received

- disagrees with invocation
+ [bkit-ledgers] row 1: conflict: by.step="audit-security" disagrees with invocation inv-dd39c26e4b6e6739cdbb5a1e68da3ef2 ("audit:security")
+

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:968:30
    966|       ],
    967|     );
    968|     expect(appended.err).not.toContain("disagrees with invocation");
       |                              ^
    969|     expect(appended.code).toBe(0);
    970|     expect(rows(path.join(repo, "docs", "failures.jsonl")).map((r) => …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > replay-safe ledger appends on real files > refuses to re-append a partly landed block after a foreign writer appended
AssertionError: expected [Function] to throw an error

- Expected:
null

+ Received:
undefined

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:1002:7
    1000|     expect(() =>
    1001|       appendLedgerRows(root, "failures", request, undefined, { operati…
    1002|     ).toThrow(/uncertain/i);
       |       ^
    1003|     const after = fs.readFileSync(file, "utf-8");
    1004|     expect(after).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > persistent CI handoff on a real local remote > blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it
AssertionError: expected { phase: 'done', handoff: +0, …(6) } to match object { handoff: 6, ciDispatch: null }
(6 matching properties omitted from actual)

- Expected
+ Received

  {
-   "ciDispatch": null,
-   "handoff": 6,
+   "ciDispatch": {
+     "attempts": 7,
+     "head": "53d4441dd78bb8fc1d80dde9399687d6aec0a815",
+     "outcome": "self-healed",
+     "retrigger": true,
+   },
+   "handoff": 0,
  }

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:1272:21
    1270|       ...quiet(),
    1271|     });
    1272|     expect(blocked).toMatchObject({ handoff: 6, ciDispatch: null });
       |                     ^
    1273|     expect(moved.tip()).toBe(foreign);
    1274|     expect(moved.log()[0]).toBe("someone else moved the branch");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 16 passed (20)
   Start at  09:20:48
   Duration  29.67s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-24VCep/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
