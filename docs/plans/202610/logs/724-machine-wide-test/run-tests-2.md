
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats'


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/165 files need formatting

> @cbartens/bkit@6.0.0 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 449:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 132:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 350:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 358:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/.bkit/jsonl.md
 154:3    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 223:4    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 377:106  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/pipeline.md
 149:227  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/providers.md
 47:301   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 175:787  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 182:120  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 184:172  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 446:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 822:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 483:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 603:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 676:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 182:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 245:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 94:383    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 99:488    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 136:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 162:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 603:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 842:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1017:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1125:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1286:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1344:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-ci-performance.md
 127:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-database.md
 143:224  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-dependencies.md
 313:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/prompts/bkit-utility-update-tracker.md
 123:6  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/testing.md
 245:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 373:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 413:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 484:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 245:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 373:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 413:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 484:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 149 files.
passed: true
skipped: null
files: 149

> @cbartens/bkit@6.0.0 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> bkit ci slop

[bkit-ci] base 38102970a8a3a542798cc320c9691dced676efa2 (38102970a8a3a542798cc320c9691dced676efa2) vs working tree
[bkit-ci] added 1, resolved 1, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 38102970a8a3a542798cc320c9691dced676efa2
base: 38102970a8a3a542798cc320c9691dced676efa2
added: 1
resolved: 1
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 3.5 on 10 cores: unit limits 6250ms per test, 12500ms per hook (x1.25)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 16537ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 676ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 447ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 343ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 357ms
     ✓ --path records its commit on the run's record, like every other commit mode 399ms
     ✓ a recorded ledger commits only the rows the run appended 623ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 757ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 960ms
     ✓ commitBookkeeping refuses when a recorded path changed 309ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 414ms
     ✓ under --mode=commit counts the squashed paths as something to commit 360ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 398ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 313ms
     ✓ a source file in the range: exit 7, path listed 326ms
     ✓ another FID's plan file in the range: exit 7 314ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 16965ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 823ms
     ✓ may debug in place on dev 316ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 649ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 548ms
     ✓ a new run of the same FID rewrites startSha 905ms
     ✓ a resume of the same FID reuses the record 811ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 642ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 639ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1018ms
     ✓ a stale record without a lock is replaced 808ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 476ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 485ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 323ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 595ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 401ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 363ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 500ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 743ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 15059ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ linear with no key configured: a bare key names no issue, with a hint naming bkit.tracker.linear.team 301ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 753ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (114 tests) 33744ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 1945ms
     ✓ a failed commit leaves no row staged in the index 1331ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 979ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1437ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1257ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1339ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1162ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 351ms
     ✓ --ref exits 3 when the ref does not carry the status file 300ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 390ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 384ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 349ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 479ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 382ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 438ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 601ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 429ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 555ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 433ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 678ms
     ✓ writeStepRow refuses when a recorded path changed 712ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 357ms
     ✓ writeStepRow appends its commit sha to the record 635ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1922ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 411ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 399ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 534ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 454ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 671ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 306ms
     ✓ does not count an artifact the run found committed when it started 315ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 394ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 589ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 36722ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 965ms
     ✓ names each net-new and worsened finding in the log and the JSON 1396ms
     ✓ fails on a net score rise with no net count change 1257ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1484ms
     ✓ treats a net score at or below 0.001 as float noise 1584ms
     ✓ passes when the change only resolves findings 939ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1621ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1268ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 360ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1418ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 974ms
     ✓ exits 4 on a dropped net field instead of silently passing 992ms
     ✓ exits 4 on no summary instead of silently passing 946ms
     ✓ exits 4 on output that is not JSON instead of silently passing 976ms
     ✓ exits 5 when the base worktree cannot be created 301ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1155ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 816ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 805ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 848ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 894ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1825ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 933ms
     ✓ fails (exit 1) when vale reports alerts 885ms
     ✓ exits 6 on a vale runtime error 997ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 873ms
     ✓ falls back to vale sync when the main worktree has none 1690ms
     ✓ fails when vale sync cannot restore the required styles 1613ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 344ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 534ms
   ✓ bkit ci min-push (9)
     ✓ checks every --ref: one code ref among min-push refs fails the push 437ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 370ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 363ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 588ms
     ✓ a top-level glob in the setting does not reach into folders 309ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ❯ .bkit/core/engine/commands/workflow/context.test.ts (107 tests | 1 failed) 114067ms
   ✓ bkit context clamp (#427 T1) (22)
     ✓ leaves a file exactly at its cap byte-identical, with no footer 16ms
     ✓ clamps a file one line over its cap and footers it, keeping the FIRST lines 12ms
     ✓ counts a final line with no trailing newline 11ms
     ✓ fires the byte cap independently of the line cap 14ms
     ✓ reports counts that match the clamped file, and the artifact as given 13ms
     ✓ keeps both ends of a long failing run under debug-evidence 36ms
     ✓ never drops a signal line buried in the middle 53ms
     ✓ keeps every signal line when they are scattered throughout 50ms
     ✓ matches the multibyte signal glyphs too 34ms
     ✓ shortens an over-long line in place instead of evicting readable ones 34ms
     ✓ keeps a line whose signal text sits past the per-line cap 37ms
     ✓ marks every removal in place, not just in the footer 45ms
     ✓ bounds a file where nearly every line matches, and says the ceiling fired 117ms
     ✓ leaves a debug-evidence file under the threshold byte-identical 14ms
     ✓ an unreadable file exits 4; an unknown profile exits 2; neither rewrites 22ms
     ✓ the byte cap keeps the longest prefix that fits, and footers human sizes 13ms
     ✓ a ledger over its cap with no final newline is cut whole-line, sized as on disk 12ms
     ✓ shortens an over-long line by bytes, not characters 22ms
     ✓ over the threshold but every line kept by signal context: untouched, not clamped 56ms
     ✓ a gap no larger than its own marker is kept instead of marked 50ms
     ✓ debug-evidence with no final newline ends the kept tail with one 30ms
     ✓ keeps carriage returns verbatim and counts them as bytes 27ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ names the ledger, base and per-context profiles 0ms
     ✓ keeps each context's own section header and drops every other context's 607ms
     ✓ keeps each context's own section banner and drops every other context's 1509ms
     ✓ a ci artifact keeps a section header that carries none of the base signal words 49ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 223ms
   ✓ bkit context clamp — per-context saving (#697) (2)
     ✓ totals artifacts, lines, bytes and table / raw per context 1ms
     ✓ counts a record whose render is absent, and skips a record naming no context-fetch context 0ms
   ✓ untouched originals (keepRaw) (4)
     ✓ keepRaw copies the original byte-identical to {name}.raw.{ext} in the folder given 33ms
     ✓ clamp keeps the original in the outbox, never under logs/, and the record names it with its source 74ms
     ✓ a file left whole keeps no copy: raw is null 42ms
     ✓ outside a git repo the original has nowhere to go: clamped, raw null, and it says so 10ms
   ✓ bkit context clamp-log (#427 T1) (4)
     ✓ collects records across calls and survives a repeated read 20ms
     ✓ reports an empty array when a step clamped nothing, or the log is absent 1ms
     ✓ derives tmp/bkit-clamp-{fid}-{step}[-{attempt}].jsonl under the repo top 35ms
     ✓ needs a log 1ms
   ✓ humanBytes (9)
     ✓ 1023 -> 1023 B 0ms
     ✓ 1024 -> 1 KB 0ms
     ✓ 1535 -> 1 KB 0ms
     ✓ 1536 -> 2 KB 0ms
     ✓ 1048576 -> 1.0 MB 0ms
     ✓ 1310720 -> 1.2 MB 0ms
     ✓ 1835008 -> 1.8 MB 0ms
     ✓ 1415577 -> 1.3 MB 0ms
     ✓ 1415578 -> 1.4 MB 0ms
   ✓ bkit context ledger-scan (#427 T3) (10)
     ✓ keeps the top 40 by term overlap and footers the total 12ms
     ✓ ties break newest-line first 13ms
     ✓ emits no footer, and drops no line, below the cap 10ms
     ✓ keeps a literal tab inside a matching JSONL line intact 11ms
     ✓ writes None. when nothing matches and when the ledger is absent 21ms
     ✓ a sole term matches on its own; matching is case-insensitive 12ms
     ✓ counts distinct terms, ignoring repeats and stray spaces 41ms
     ✓ applies the same shape to the failures ledger and records the clamp 12ms
     ✓ blank lines in the ledger never match and still count toward newest-first 11ms
     ✓ --reset-log empties the log; without it records accumulate 22ms
   ✓ context-fetch block parsing (4)
     ✓ parses name and context, last token winning, context defaulting to runtime 1ms
     ✓ lists only blocks after <!-- bkit:end -->, with ordinal, body and artifact stem 1ms
     ✓ joins every fenced range in one block 0ms
     ✓ no bkit:end line means no consumer blocks 0ms
   ✓ bkit context list-blocks (3)
     ✓ emits blocks, coverage and configured contexts, and narrates coverage 2ms
     ✓ says loudly when nothing is configured 0ms
     ✓ emits each provision block's bash body below bkit:end, in file order, and no fetch body 1ms
   ✓ bkit context provision (3)
     ✓ runs every recipe, lists each failed one with its last error line, and keeps going 104ms
     ✓ removes a stale failure file once every recipe succeeds 61ms
     ✓ with no recipes, runs nothing and removes a stale failure file 13ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 149ms
     ✓ a clamped fetch keeps the whole payload in the outbox; the record carries the block body as its source 197ms
     ✓ an unclamped payload is wrapped whole; the block sees its context variables 74ms
     ✓ no stdout but a skip line writes the breadcrumb and says NOT CHECKED 54ms
     ✓ neither data nor a skip line writes nothing and says so 59ms
     ✓ block 4 is not run 28ms
     ✓ block 5 is not run 24ms
     ✓ block 9 is not run 19ms
     ✓ reads the attempt from status.jsonl, and refuses a run without one 70ms
     ✓ clamps a ci block with the ci profile and a runtime block without it 272ms
     ✓ finalise derives verdict, artifacts, configured contexts and clamp records 160ms
     ✓ finalise totals a rendered fetch per context (table vs raw) 121ms
     ✓ finalise totals a rendered fetch's origBytes as the bytes the block printed 114ms
     ✓ finalise with no artifacts is FAIL 37ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 405ms
     ✓ finalise --record needs --file 27ms
   ❯ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 246ms
     ✓ --base narrows the range to the commits after a group's start sha 289ms
     ✓ diff from a group start covers only the group's commits 344ms
     ✓ a base that is not a commit exits 5 and writes nothing 195ms
     ✓ an empty range writes a one-line note and zero numbers 316ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 548ms
     ✓ --reset-log empties the step's clamp log before the record lands 705ms
     × partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 104773ms
     ✓ whole: nothing omitted and no copy kept 469ms
     ✓ the budget honours topFiles and totalLines and says when the ceiling cut a file 348ms
   ✓ bkit context brief (15)
     ✓ brief --next picks the first group with an open task 16ms
     ✓ brief --next reads a build-plan-execute-*-log.md written before the step rename 3ms
     ✓ brief --next with every task done writes nothing and reports no group 3ms
     ✓ brief leaves out tasks with a DONE line 2ms
     ✓ brief carries DEPENDS ON summaries from earlier groups 4ms
     ✓ brief includes the note file under deviations 5ms
     ✓ brief prints path and sizes only 3ms
     ✓ brief carries the Reuse Inventory rows and Architecture entries for the group's files 4ms
     ✓ brief leaves out entries past the 8KB work cap and says how many and where 3ms
     ✓ --tests-only writes build-brief-tests-{group}-{n}.md with the open task blocks and no Reuse Inventory or Architecture entries 35ms
     ✓ --tests-only adds the Derived Test Matrix rows whose Target file a TEST FIRST line of the group names 15ms
     ✓ --tests-only lists each planned test its file already holds, with the line it starts on, and leaves the section out when none exists 36ms
     ✓ --tests-only --file leaves out a test a build-tests-red row of the group proved red, and a task with no test left 33ms
     ✓ --tests-only prints tests: 0 for a group with no planned test, and writes nothing 2ms
     ✓ brief refuses a group the plan does not have 2ms
 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests | 1 failed) 154714ms
   ✓ CI evidence test rounds (3)
     ✓ records a CI evidence round without executing a local gate 21ms
     ✓ runs local gates only after current-generation remediation or soak 1104ms
     ✓ rejects CI rounds without active matching debug selection 28ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 24ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 55ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 50ms
     ✓ no package.json, no scripts, or unparseable -> null 118ms
     ✓ debug's live-first chain stops at the deepest declared tier 75ms
     ✓ with no e2e gate, debug runs the integration gate build runs 68ms
   ✓ bkit tests run (16)
     ✓ a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run 36ms
     ✓ a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 44ms
     ✓ a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 51ms
     ✓ tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 44ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 729ms
     ✓ a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 31ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1444ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1073ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1141ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 937ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 56ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 97ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 124ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 1373ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1305ms
     ✓ --gate and --log are required 38ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1144ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1115ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 958ms
     ✓ PASS is 0 failures with or without reports 763ms
     ✓ clears a previous attempt's reports before the gate runs 721ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 475ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1087ms
     ✓ a log under the outbox is named main-checkout relative in the record 797ms
     ✓ a log small enough is copied whole: not clamped, raw null 970ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1152ms
     ✓ --artifact needs --fid and --step 32ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1156ms
     ✓ numbers runs within the workflow's active run and per step 1093ms
     ✓ without --file no row is written and the output carries row null 761ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 38ms
   ✓ parseJunit (4)
     ✓ reads names, outcomes and failure messages, decoding entities 34ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 41ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 39ms
     ✓ no testcase elements -> empty 32ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 37ms
     ✓ state: no report (misspelled path) 46ms
     ✓ state: load error named after the file 43ms
     ✓ state: zero tests 35ms
     ✓ state: the named test passed (code written first) 42ms
     ✓ state: the named test skipped (filter matched nothing) 48ms
     ✓ state: other tests only 42ms
     ✓ a name only matches whole trailing segments 37ms
     ✓ green needs every case of the named test to pass 39ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 47ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 46ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 46ms
     ✓ narrows to one group's tasks 34ms
     ✓ reads no task from old-format task lines 39ms
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
     ✓ plan-check follows bkit.workflows.tasks 104ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 118ms
     ✓ a missing plan file is a usage error 33ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 30ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 1638ms
     ✓ a planned test absent from a loaded report is a missing gap 1675ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1641ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1221ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 212ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1312ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 628ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 699ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 690ms
     ✓ green: --group audits only that group's tasks 519ms
     × green: --group naming a group with no tasks is refused 104345ms
     ✓ green: a code fence never closed is the reason, not missing task markers 348ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 902ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 319ms
     ✓ green: lists each gap kind, with the runner output 1007ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1364ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 280ms
       ✓ green clears an exception-only task from a human commit 253ms
 ❯ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests | 1 failed) 137684ms
   ✓ splitSlug (6)
     ✓ "cbartens/bkit" -> {"owner":"cbartens","repo":"bkit"} 73ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 892ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 897ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1079ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1656ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ prints nulls under github without a board, and for keys left unset 1045ms
   ❯ bkit repo info — whether this repo's bkit is behind the newest release (4)
     × prints the upgrade advisory when the pin is older than the newest release 104914ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 664ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 593ms
     ✓ an unpinned repo reports nulls and asks no registry 287ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 265ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 856ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 924ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1594ms
 ❯ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests | 1 failed) 156927ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 492ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 212ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1304ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1247ms
     ✓ exits 5 when the open-PR probe errors 1015ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1000ms
     ✓ prs open refuses --base=main 98ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 1083ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1262ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1149ms
     ✓ refuses a bad --state or --number 155ms
   ✓ bkit prs scan-body (10)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 155ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 147ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 204ms
   ✓ bkit prs cross-check (9)
     ✓ fails an mcp close with gh recorded unavailable and no transport-fallback row 6ms
     ✓ passes when the fallback row is present 4ms
     ✓ exempts transport gh even with gh recorded unavailable 3ms
     ✓ exempts transport git even with gh recorded unavailable 3ms
     ✓ passes when gh was available, or no runtime-resolved row exists 7ms
     ✓ reads the LATEST runtime-resolved row 4ms
     ✓ a runtime-resolved row with backslashes in its gh error does not make the log unreadable 4ms
     ✓ exits 3 on a missing or malformed log and 2 on an unknown transport 5ms
     ✓ a malformed log exits 3 for every transport: the gh / git exemption never hides it 5ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ refuses ["--kind=close","--shape=pr","--sha=x","--scan-result=dirty"] (exit 2, nothing written) 3ms
     ✓ refuses ["--kind=close","--shape=pr","--scan-result=clean"] (exit 2, nothing written) 4ms
     ✓ refuses ["--kind=fallback","--from=","--to=t","--reason=r","--asserted-by=a"] (exit 2, nothing written) 6ms
     ✓ refuses ["--kind=other"] (exit 2, nothing written) 4ms
     ✓ exits 3 when status.jsonl does not exist 3ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 930ms
     ✓ runs no merge when the PR is already MERGED 867ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1557ms
     ✓ prs merge refuses a PR whose base is main 1220ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 2168ms
     ✓ prs merge refuses when the PR base is unknown 1216ms
     ✓ prs merge reads the base from the one pr view it already makes 1165ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 645ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 767ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1194ms
     ✓ exits 2 on a bad --number 105ms
     ✓ never reads dev's required checks without --only-if-required 896ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ❯ bkit prs checks (6)
     ✓ is green when every check finished successfully 722ms
     × is not green when a check failed, naming it (exit 1) 104648ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 649ms
     ✓ is not green on an empty rollup (total 0) 831ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 311ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 400ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 666ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 200ms
     ✓ needs --scan or --scan-result 366ms
 ❯ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests | 1 failed) 123836ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 746ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 351ms
     ✓ source file is not treated as gate config 360ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ missing file path (no args.path) is ignored — no throw, no advice 62ms
     ✓ null args object is ignored — no throw 59ms
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 314ms
     ✓ non-edit tool (bash) is ignored 53ms
   ❯ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 1298ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 1564ms
     × apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 105574ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 729ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 751ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 477ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 896ms
     ✓ a refused dev push is logged, never fails the close 1331ms
     ✓ an unreachable remote is logged, never fails the close 456ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 8410ms
   ✓ bkit issues labels (25)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 1170ms
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (185 tests | 1 failed) 166104ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 2260ms
   ✓ preserves the requested event for selected-workflow verification 1769ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 171ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1713ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1206ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1829ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2492ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 33ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 22ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 23ms
     ✓ rate_limit returns the requested fixture state 28ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 28ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 60ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 83ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 22ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
   ✓ bkit runs gate (68)
     ✓ accepts a green capstone at the head (exit 0) and says so 92ms
     ✓ rejects a failed run (12) 89ms
     ✓ rejects no run at the head (10) 47ms
     ✓ rejects runs that have not completed (11) 59ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 95ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 93ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 83ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 83ms
       ✓ both floor steps failing is regenerable 94ms
       ✓ any failed step off the list makes the whole result unregenerable 86ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 112ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 86ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 104ms
       ✓ a timed-out step counts as failed 94ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 181ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 89ms
       ✓ refusals other than a failed run carry no failed steps 39ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 112ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 100ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 87ms
     ✓ tells an API error (20) from no run (10) 148ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 60ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 75ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 89ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 4ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 74ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
       ✓ a malformed ciRequired falls back to none, never crashes 67ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 126ms
     ✓ missing --head is a usage error (2) 1ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 10ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 32ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 34ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 63ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 50ms
       ✓ without --event the newer green pull_request run masks the failed push run 55ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 133ms
       ✓ a run still in progress whose capstone already passed passes 82ms
       ✓ a capstone still running is in progress (11) 59ms
       ✓ a failed capstone fails (12) even when every other job passed 64ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 126ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 106ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 328ms
       ✓ a source change past the validated head refuses (17) and names the path 347ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 389ms
       ✓ --validated equal to --head is the plain head check 66ms
       ✓ --validated without --month / --fid is a usage error (2) 258ms
       ✓ a validated sha that is not an ancestor refuses (17) 284ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ no push run yet inside the absent window keeps waiting 0ms
     ✓ still in progress at --max-minutes -> 4 0ms
     ✓ two API errors are retried; the third in a row -> 20 0ms
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 1965ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 1222ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 1ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 1ms
     ✓ found stops polling; every poll erroring is err with allErrored 0ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
     ✓ PR completed = no open checks; run targets are head-anchored 0ms
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 106ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 78ms
     ✓ CLI: a failed gh workflow run exits 5 89ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1151ms
     ✓ CLI: usage errors exit 2 22ms
   ❯ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 406ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 645ms
     ✓ a failed re-trigger push names the cause in the log 1359ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1286ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1364ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 600ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 317ms
     ✓ gh-error: every poll errored 347ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 531ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 554ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 597ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 598ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 405ms
     ✓ CLI: verdict JSON, body scan, exit codes 831ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 640ms
     × CLI: --poll-result is validated, --attempts needs it 104674ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1288ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 949ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1066ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 429ms
     ✓ re-trigger on dev only uses the record of its own FID 525ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 802ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ flags [SKIP CI] inherited into the landed commit body 144ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 240ms
     ✓ an empty or unreadable sha is an error, not a clean result 158ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 351ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 182ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 295ms
     ✓ a refused capstone records FAIL with its reason 232ms
     ✓ an unreadable PR is an API error (20) with no head 40ms
     ✓ takes exactly one of --head, --pr, --squash-of 13ms
   ✓ bkit runs revalidate (6)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 351ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 446ms
     ✓ ref uppercases a Linear or Jira key 0ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 307ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 348ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 380ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 436ms
     ✓ --file and --step go together 333ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (37 tests) 2622ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1096ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1177ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 979ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 759ms
     ✓ fetches the issue and its comments as GitHub returns them 616ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 443ms
     ✓ a recent identical comment counts as done (the final close comment) 454ms
     ✓ a failed post reports done false with the reason and never leaks a token 484ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1054ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 651ms
     ✓ a different marker hash posts 883ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1337ms
 ✓ .bkit/core/engine/commands/lib.test.ts (69 tests) 2580ms
   ✓ runGit / runTool output limit (5)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 627ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 662ms
     ✓ a push that fails without a server answer is returned once, never retried 513ms
     ✓ a failed fetch is returned before anything is built 353ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1166ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1438ms
     ✓ lands from a clone whose fetch refspec omits dev 945ms
     ✓ build throwing stops the landing and removes the throwaway checkout 493ms
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1026ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 936ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1152ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1317ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1202ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1360ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 962ms
     ✓ --file into a missing directory is refused, not created 590ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1543ms
     ✓ counts files committed since --base 1245ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1289ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1073ms
     ✓ runs the --fallback gate even when no file changed, as it did before 1433ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 811ms
     ✓ resolves config from the repo root when run from a subdirectory 1002ms
     ✓ exits 6 when the PUT fails 1230ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1234ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 938ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 903ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 360ms
     ✓ exits 6 when the api answer is not JSON 490ms
 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (152 tests | 1 failed) 183333ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 102ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ an OPEN decision mid-build prints its header fields 170ms
     ✓ reads Test attempt from a tests pause 149ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 251ms
     ✓ writes no row when status.jsonl does not exist 185ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 201ms
     ✓ aborts a rebase only when one is in progress 432ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 326ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 435ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 264ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 266ms
     ✓ --max-exceeded says a handover is due without any sentinel 211ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 175ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 307ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 295ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 207ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 394ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 143ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 139ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 118ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 149ms
     ✓ a debug run in SOAK mode always needs a handover 180ms
   ✓ bkit workflows close (26)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 374ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 457ms
     ✓ an unwritable stats path is logged and never fails the close 526ms
     ✓ appends the completeness row before the workflow-done row 493ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 591ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 529ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 758ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 479ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 498ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 428ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 447ms
     ✓ --number without --outbox is a usage error 422ms
     ✓ --flush is ship only 198ms
   ❯ bkit workflows handover (23)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 227ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 204ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 833ms
     ✓ --flush with nothing to record commits and pushes nothing 744ms
     ✓ --flush carries the named worktree's logs into the dev commit 1077ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1246ms
     ✓ --push on dev never carries a row whose references name another feature 1632ms
     × --push on dev with no start row carries no shared-ledger row, and says so 106125ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1311ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1681ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1638ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2274ms
     ✓ a close that landed releases the lock 1819ms
     ✓ removes the worktree before it releases the lock 1598ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 299ms
     ✓ names the branch, not the remote-tracking ref, in each URL 237ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 210ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 277ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 506ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 341ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 441ms
     ✓ record is present after workflows close and before the push 800ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1218ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 156ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 202ms
     ✓ a missing summary file exits 13 before anything is written 179ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 238ms
     ✓ a folder outside the outbox sessions folder is kept 216ms
     ✓ without --session-dir prints no sessionRemoved 237ms
   ✓ bkit workflows summary (8)
     ✓ passes publish into the summary input 49ms
     ✓ summary is FAIL when a plan task is not done 21ms
     ✓ summary is CONCERNS when a deferral was written 37ms
     ✓ summary recommends /bkit-debug on FAIL 47ms
     ✓ summary reports the last attempt 32ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 28ms
> [bkit] TRUNCATED HERE — 811 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 365 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 345ms
   ✓ guardRepoConfig (6)
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 388ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (50 tests) 1188ms
 ✓ .bkit/core/engine/tools/instructions-coverage.test.ts (24 tests) 1071ms
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-XMx0JQ/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 171ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 512ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 180ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 203ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 306ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 33ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 142ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 8508ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 8496ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-hY4qs7/nonexistent.md — skipping .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 223ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > a consumer edit survives a no-op upgrade and is a conflict on the next template change
[bkit-upgrade] conflict: .bkit/scripts/bkit-foo.sh — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > template with a slash-prefixed HTML marker (// <!-- bkit:start -->) is classified html-comment, not slash-comment (site-9 mis-classification trap)
[bkit-upgrade] upgrade (merge): weird.js

 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 214ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > a marker-less consumer file gets the block appended, its own content kept
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > the shipped hook template upgrades to its generated form: shared parts spliced into the block
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: auto-applies non-conflicting changes
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: does NOT overwrite consumer drift (conflict preserved)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 3698ms
   ✓ selected CI context evidence (3)
     ✓ accepts only matching complete CI receipts with nonempty logs 1317ms
     ✓ validates adapted legacy and fallback context through the same receipt path 500ms
stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: returns conflicts list with relPath and content
[bkit-upgrade] conflict: .claude/agents/bkit-test.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-test.md

 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 31ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 217ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 141ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 159ms
(node:6513) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:6513) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (66 tests) 135ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 85ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 124ms
 ✓ .bkit/core/engine/install/manifest.test.ts (49 tests) 89ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 130ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 146ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 50ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 77ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (50 tests) 61ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 119ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 70ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 71ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (40 tests) 83ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 146ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 102ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 107ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 129ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 38ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 115ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 111ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 160ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 81ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 72ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 123ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 98ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 36ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 67ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (28 tests) 89ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 51ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 64ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 32ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 35ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 54ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 36ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 110ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 45ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 29ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 29ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 42ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 33ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 60ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 28ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 68ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > is idempotent — a second run changes nothing
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > dry-run writes nothing but records the same write set (the `bkit check` drift signal)
[test] [dry-run] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > regenerates a hand-edited file whole
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > picks up consumer allowed-domains from .agents/context.md
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > removes the retired copy bkit recorded and records the removal
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > dry-run keeps the retired copy but reports the removal
[test] [dry-run] core: .bkit/allowlist.json
[test] [dry-run] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 33ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 22ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 96ms
(node:8977) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:8977) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:8977) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:8977) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 87ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 21ms
stdout | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
# bkit stats

> [!CAUTION]
> **Purpose:** This repo's workflow statistics, computed from `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Workflow closes append the rows; rows a direct chat wrote (`utility`) are reported apart.
>
> **Rules:**
>
> - Generated — do not edit. `bkit stats` rewrites this file.

## Rows

<!-- prettier-ignore -->
| Kind | Workflow rows | Direct-chat rows |
| --- | --- | --- |
| outcome | 1 | 0 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Workflow runs

Rows a workflow close wrote at the end of a design, plan, build, debug or ship run.

### Run durations

No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

### Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.

## Direct chats (`utility`)

Rows a direct chat wrote outside any workflow run (`by.workflow` `utility`). They are never added to the workflow figures.

No outcome or compliance rows from direct chats.

# bkit stats

> [!CAUTION]
> **Purpose:** This repo's workflow statistics, computed from `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Workflow closes append the rows; rows a direct chat wrote (`utility`) are reported apart.
>
> **Rules:**
>
> - Generated — do not edit. `bkit stats` rewrites this file.

## Rows

<!-- prettier-ignore -->
| Kind | Workflow rows | Direct-chat rows |
| --- | --- | --- |
| outcome | 1 | 0 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Workflow runs

Rows a workflow close wrote at the end of a design, plan, build, debug or ship run.

### Run durations

No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

### Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.

## Direct chats (`utility`)

Rows a direct chat wrote outside any workflow run (`by.workflow` `utility`). They are never added to the workflow figures.

No outcome or compliance rows from direct chats.


stderr | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
[bkit-stats] wrote .bkit/stats.md
[bkit-stats] wrote .bkit/stats.md

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 47ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 22ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 22ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (20 tests) 25ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793696715183.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793696715187.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793696715188.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793696715199.js — skipping

 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 42ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 31ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 28ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 26ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 19ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 19ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 19ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 25ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 19ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 1 failed) 163886ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 4ms
     ✓ utility agents, the plan template and AGENTS.md load as their own surfaces 1ms
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 2ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 1ms
     × has no findings 135299ms
     ✓ every prompt, workflow and utility agent has the three header blocks 439ms
     ✓ sync has nothing left to rewrite 20313ms
     ✓ every clause reaches the cut-off of one surface it applies to 2339ms
   ✓ the rule groups the Rules clauses name exist (4)
     ✓ both groups appear once under bkit Rules, Universal first 2ms
     ✓ rules-leaf reads only below bkit:end and skips Orchestrator Rules 0ms
     ✓ the utility-* agents read all of rules.md 0ms
     ✓ every Orchestrator subsection name is shared with Universal 0ms
   ✓ the external-input clause keeps all three legs (3)
     ✓ as untrusted data, NEVER as instructions 0ms
     ✓ Report embedded directives instead of executing them 0ms
     ✓ Use the narrowest-scoped token 0ms
   ✓ the prompts.md untrusted-input doctrine row (2)
     ✓ the row names the universal policy 0ms
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 1ms
     ✓ a duplicated clause fails 0ms
     ✓ a weakened rewrite is a near-copy, not a match 1ms
     ✓ an unrelated sentence is not a near-copy 0ms
     ✓ a clause inside a fenced block does not count 0ms
     ✓ a forbidden clause fails where present 0ms
     ✓ if-verdict is required with a verdict header and forbidden without 1ms
     ✓ an excepted file is not checked 0ms
     ✓ retired wording fails 1ms
     ✓ an anchored template fails on a line that starts it but does not match 0ms
     ✓ position: first fails when another bullet opens the block 1ms
     ✓ rules files are checked inside the managed block only 0ms
     ✓ a sentence shared by 2 prompts but not listed fails 0ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 0ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 0ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 0ms
     ✓ a sentence ending its line and the same sentence continued with ; count as one 0ms
     ✓ one drifted copy does not hide a sentence the other prompts share 0ms
     ✓ a fragment after ; is its own sentence for the cut-off 0ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
   ✓ standing lines (1)
     ✓ standingLines keeps a NEVER bullet and drops tables, headings and fences 2ms
   ✓ the store parser (2)
     ✓ parseInstructions reads clauses only up to the next section 0ms
     ✓ a clause with rule and carriers keys parses 0ms
   ✓ store carriers (2)
     ✓ carriersLine writes all, all except, and prefix families 1ms
     ✓ syncStore rewrites a stale carriers line and keeps a current one 0ms
   ✓ audit templates (6)
     ✓ the store accepts an audit mode 0ms
     ✓ a required clause is checked inside the managed block only 0ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 0ms
     ✓ a sentence shared by 2 audit templates but not listed fails 0ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
   ✓ checkboxes and sibling clauses (3)
     ✓ a gate checkbox is a line prefix, like a list marker 0ms
     ✓ a drifted gate item behind a checkbox is a near-copy 0ms
     ✓ a line carrying one clause verbatim is not a near-copy of its sibling 1ms
   ✓ sentence splitting (3)
     ✓ splits after . and ;, keeps the punctuation, and never splits after e.g. 0ms
     ✓ a clause ending in . matches a line that continues it with ; 0ms
     ✓ a drift that turns the clause's ; into , is still a near-copy 0ms
   ✓ modes (6)
     ✓ reads the tools list in block and inline form, skipping comment lines 0ms
     ✓ if-bash is required with Bash in the tools list and forbidden without 1ms
     ✓ if-search is required with Grep or Bash in the tools list and forbidden without 0ms
     ✓ if-no-search is required without Grep and Bash in the tools list and forbidden with either 0ms
     ✓ lines in a prompt's Rules block are rule copies, never clause carriers 0ms
     ✓ repeatable allows any number of copies but still flags near-copies 0ms
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 0ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 1ms
     ✓ two swapped lines in one block fail 0ms
     ✓ a clause in the wrong block fails 0ms
     ✓ a placed clause in the body fails 1ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 1ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 7ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 3ms
   ✓ fully retired clauses (6)
     ✓ parse with no text block and no surface 0ms
     ✓ reject a text block or a surface 0ms
     ✓ are a record only: their wording in a file is neither flagged nor rewritten 0ms
     ✓ never cover a sentence for the cut-off 0ms
     ✓ the removed clauses stay on record, and the cut-off skips them 0ms
     ✓ output-cap's sentence stays inline in the abort handover prompt 5025ms
   ✓ sync (7)
     ✓ rewrites a near-copy and keeps the list marker 0ms
     ✓ rewrites the text behind a different label when the clause is unlabelled 0ms
     ✓ rewrites retired wording, carrying slot values across 0ms
     ✓ rewrites a near-copy that closes a sentence opened by local text 0ms
     ✓ rewrites retired wording continued with ; and keeps the ; 0ms
     ✓ rewrites a near-copy continued with ; and keeps the ; 0ms
     ✓ is idempotent and leaves fenced examples alone 0ms
   ✓ issue-less workflow clauses (7)
     ✓ workflow-issue-id-missing leads into the branch recovery without a STOP 0ms
     ✓ the fids parse routes: hit, no issue, non-slug STOP 4ms
     ✓ Step 1 reads the issue and FID from the prompt file, and resolves FID in the engine 0ms
     ✓ changed issue clauses keep their old text in retired 0ms
     ✓ the issue-less gate clauses read as the issue-less behaviour 0ms
     ✓ the warning, the final-message line and the skip line are clauses 0ms
     ✓ the diff reaches each reader as a file written just before its step, not a guard rule 0ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 112ms
     ✓ every label's rows list exactly the prompts that carry it 298ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 13ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 5ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 5ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 7ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 6ms
 ❯ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts (4 tests | 1 failed) 26327ms
   ❯ GitHub selected-evidence context blocks (4)
     ✓ fetches pinned attempts without branch discovery and filters unpinned discovery 1780ms
     × emits complete receipts only after all selected job logs succeed 23915ms
     ✓ ends pinned diffs at selected commits with ancestral same-workflow baselines 629ms
     ✓ keeps adopted GitHub context blocks equal to shipped blocks 0ms
 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (245 tests | 3 failed) 514780ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 192ms
     ✓ rejects missing explicit and ambiguous existing branch selections 149ms
   ✓ branches rebase: classification (31)
     ✓ ledger list does not drift from .gitattributes merge=union 1ms
     ✓ classifies docs/knowledge.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/decisions.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/deferrals.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/failures.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/issues.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/roadmap.md as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/stats.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/friction.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/plans/202608/logs/234-x/status.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies every lockfile with a regenerate command as the lockfile shape 0ms
     ✓ refuses src.txt 0ms
     ✓ refuses package.json 0ms
     ✓ refuses .bkit/config.json 0ms
     ✓ refuses docs/testing.md 0ms
     ✓ refuses docs/plans/202608/234-plan.md 0ms
     ✓ refuses apps/web/data.jsonl 0ms
     ✓ refuses docs/plans/202608/logs/234-x/other.jsonl 0ms
     ✓ refuses packages/a/Cargo.lock 0ms
     ✓ matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match 0ms
     ✓ classifies pnpm-lock.yaml (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies package-lock.json (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies yarn.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies bun.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies Cargo.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies go.sum (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies uv.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies every generated register as the register shape, and only at its exact path 0ms
     ✓ classifies a doc as embedding a register only when the repo's script lists it 0ms
     ✓ classifies the install record, and only at its exact path 0ms
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 57ms
   ✓ branches rebase: behaviour (30)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 269ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 286ms
     ✓ --file records nothing for a refused rebase 295ms
     ✓ refuses a code conflict and aborts the rebase on the spot 456ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1245ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 374ms
     ✓ produces byte-identical output to merge=union 875ms
     ✓ restores a trailing newline so the next append starts on its own line 521ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 486ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 682ms
     ✓ refuses a union that leaves a line which is not JSON 458ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 629ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1707ms
     ✓ refuses a lockfile whose regenerate command fails 1646ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 879ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 842ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 777ms
     ✓ refuses and aborts when both sides changed the hand-written region 551ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 651ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 742ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 900ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 647ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 704ms
     ✓ refuses and aborts when a side deleted the install record 557ms
     ✓ refuses a conflicted doc the repo's script does not list 430ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 403ms
     ✓ removes a stale sentinel when the rebase succeeds 554ms
     ✓ exits 4 when no rebase is in progress 143ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 780ms
     ✓ resolves a conflict in each of two replayed commits across rounds 720ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 21ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 76ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 86ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 28ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 28ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 50ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 42ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 51ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 55ms
     ✓ fails closed on an empty --base-sha and writes nothing 2ms
     ✓ fails closed on a missing file 1ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 51ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 0ms
     ✓ stampAnchor: empty file 0ms
     ✓ stampAnchor: no trailing newline (kept as-is) 0ms
     ✓ stampAnchor: two blocks (both removed) 0ms
     ✓ stampAnchor: close on the line after open (body line kept) 0ms
     ✓ stampAnchor: inline lookalike marker is not a block 0ms
     ✓ stampAnchor: empty field block 0ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 47ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 2ms
     ✓ matches only inside the block, and the first occurrence wins 0ms
     ✓ exits 13 on a missing file and 2 on an unknown field 1ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 487ms
       ✓ skips (12) with no anchor 496ms
       ✓ skips (12) when the base is unreachable in this clone 512ms
       ✓ skips (12) when nothing landed since the base 507ms
       ✓ runs (0) with the landed path count once dev moved 996ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 434ms
     ✓ readAnchor: two blocks: the first block's value wins 0ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 0ms
   ❯ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 878ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 514ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 697ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1866ms
     ✓ runs exactly one git push 1970ms
     ✓ --set-upstream records the upstream 516ms
     ✓ refuses with no branch checked out 431ms
     ✓ --mode=dev refuses a feature checkout 406ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1047ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1616ms
     ✓ --require-ci pushes as-is when dev has not moved 850ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1315ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1865ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 681ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1422ms
     ✓ --mode=abort pushes when the branch has no open PR 1382ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1089ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 513ms
     ✓ --open-pr carries the MCP answer and skips gh 805ms
     ✓ --mode=abort on dev pushes plainly without probing 888ms
     × rejects an unknown mode 105039ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1079ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 486ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 741ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3469ms
     ✓ skip-ci HEAD on the replay is refused 1621ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1819ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2427ms
     ✓ a level local dev is a plain push, recording nothing extra 1006ms
     ✓ a record with no commits pushes nothing 597ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 426ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1569ms
     ✓ a rewritten branch is refused, never forced 697ms
     ✓ refuses dev and main with exit 21 and pushes nothing 500ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1077ms
     ✓ refuses a detached HEAD (exit 5) 411ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 818ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 840ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 833ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1100ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 493ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1094ms
     ✓ an up-to-date branch is a no-op 639ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1002ms
     ✓ a fetch that fails exits 10 423ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 593ms
     ✓ --paths with no match exits 1 517ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 392ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 750ms
     ✓ --marker reads a diff over 1 MiB 585ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 635ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 672ms
     ✓ scan-diff finds an added skip 710ms
     ✓ scan-diff ignores a skip predating the base 641ms
     ✓ scan-diff reports a disabled test with its line 734ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 723ms
     ✓ scan-diff ignores a removed comment in a test file 823ms
     ✓ scan-diff ignores an assertion moved within the file 925ms
     ✓ scan-diff still reports a removed assertion 838ms
     ✓ scan-diff reports an assertion re-added only outside the test file 866ms
     ✓ scan-diff finds an added pytest mark skip 968ms
     ✓ scan-diff finds an added unittest skip 921ms
     ✓ scan-diff finds an added bare skip call 782ms
     ✓ scan-diff ignores a quoted skip in a documentation file 820ms
     ✓ scan-diff ignores a marker literal in a non-test source file 993ms
     ✓ scan-diff ignores an assertion whose expectation changed 941ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 805ms
     ✓ scan-diff reports a deleted test file 809ms
     ✓ scan-diff never opens a symlinked test file's outside target 3ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 609ms
   ❯ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1688ms
     × a title that already carries the marker is left alone 23094ms
     ✓ with no open PR: pushes the marker commit and edits no title 861ms
     ✓ a re-run is deduped: no second marker commit 799ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 482ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 126ms
     ✓ --title-set skips gh entirely 205ms
     ✓ refuses dev and main (exit 21) 99ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 220ms
     ✓ Path B once dev moved; --head checks a given commit 465ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 478ms
     ✓ --merge-docs merges dev when docs/ is behind 580ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 554ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1082ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1068ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 973ms
     ✓ --merge-docs skips an empty bkit:generate script 577ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 496ms
     ✓ --merge-docs never merges on dev itself 444ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 640ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 643ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 608ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 622ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 372ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 807ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 839ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 927ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 826ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1117ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1005ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 730ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 889ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 600ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 415ms
     ✓ exits 10 when the fetch fails 267ms
     ✓ refuses --merge-docs with --head, and an unknown --head 282ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 525ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 801ms
     ✓ a failed install stops ship (16) 685ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 577ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 515ms
     ✓ exits 10 when the fetch fails 398ms
   ❯ branches land (27)
     ✓ refuses a workflow other than design or plan 199ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 412ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 944ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 938ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 964ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 967ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2101ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2251ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 483ms
     ✓ local: names unpushed dev as the cause when the branch carries it 553ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 606ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1418ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1268ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1117ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 875ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1232ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1143ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 777ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1348ms
     ✓ land removes the worktree when only the copied .env is untracked 1059ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 915ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 943ms
     × a concurrent landing already moved local dev past this close: localDev is current, no publish advice 240828ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 973ms
     ✓ landPr refuses a main-based PR without retrying 681ms
     ✓ landPr refuses when the PR base is unknown 674ms
     ✓ PR not open (closed): stops (17) at once, no retry 754ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 816ms
     ✓ --attempt names the merge round in a fix commit 765ms
     ✓ commits a rewritten and a deleted tracked file 787ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 697ms
     ✓ reports undeclared and runs nothing with no scripts 297ms
     ✓ reports undeclared and runs nothing with an empty script 297ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 681ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 726ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 313ms

⎯⎯⎯⎯⎯⎯ Failed Tests 12 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings
Error: Test timed out in 75000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:213:3
    211|   });
    212|
    213|   it("has no findings", CORPUS_CASE, () => {
       |   ^
    214|     const findings = checkClauses(CLAUSES, CORPUS).map(formatFinding);
    215|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/12]⎯

 FAIL  .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts > gateguard opencode plugin — multi-file patch tool > apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target
Error: Test timed out in 6250ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts:660:3
    658|   it.each(
    659|     ["patch", "apply_patch"].flatMap((tool) => [[tool, "v2"] as const,…
    660|   )("%s (%s driver): checks every Add / Update / Move-to / Delete targ…
       |   ^
    661|     const session = newSession();
    662|     const { hookInput, output } = patchInput(tool, session, PATCH);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/12]⎯

 FAIL  .bkit/core/engine/audits/templates/context-github-ci-block.test.ts > GitHub selected-evidence context blocks > emits complete receipts only after all selected job logs succeed
Error: Test timed out in 6250ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts:264:3
    262|   });
    263|
    264|   it("emits complete receipts only after all selected job logs succeed…
       |   ^
    265|     const f = githubBlockFixture();
    266|     const complete = f.invoke("ci");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches push > rejects an unknown mode
Error: Test timed out in 60000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1587:3
    1585|   });
    1586|
    1587|   it("rejects an unknown mode", async () => {
       |   ^
    1588|     const { clone } = feature("push-mode");
    1589|     expect((await run(clone, ["push", "--mode=sideways"])).code).toBe(…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches force-build > a title that already carries the marker is left alone
Error: Hook timed out in 12500ms.
If this is a long-running hook, pass a timeout value as the last argument or configure it globally with "hookTimeout".
 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:42:1
     40|
     41| const dirs: string[] = [];
     42| afterEach(() => {
       | ^
     43|   for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, forc…
     44| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches land > a concurrent landing already moved local dev past this close: localDev is current, no publish advice
Error: Test timed out in 60000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:3499:3
    3497|   });
    3498|
    3499|   it("a concurrent landing already moved local dev past this close: lo…
       |   ^
    3500|     const { repo, remote } = fixture();
    3501|     git(repo, "checkout", "-q", "dev");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/context.test.ts > bkit context diff > partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox
Error: Test timed out in 6250ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/context.test.ts:1539:3
    1537|   });
    1538|
    1539|   it("partial: prints and writes the files not shown whole, and keeps …
       |   ^
    1540|     const dir = repo("omitted");
    1541|     put(dir, "a.txt", numbered(6, "a"));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/prs.test.ts > bkit prs checks > is not green when a check failed, naming it (exit 1)
Error: Hook timed out in 12500ms.
If this is a long-running hook, pass a timeout value as the last argument or configure it globally with "hookTimeout".
 ❯ .bkit/core/engine/commands/workflow/prs.test.ts:67:1
     65| });
     66|
     67| afterEach(() => {
       | ^
     68|   process.env.PATH = ORIGINAL_PATH;
     69|   delete process.env.FAKE_GH_DIR;

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/repo.test.ts > bkit repo info — whether this repo's bkit is behind the newest release > prints the upgrade advisory when the pin is older than the newest release
Error: Test timed out in 6250ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/repo.test.ts:392:3
    390|     );
    391|
    392|   it("prints the upgrade advisory when the pin is older than the newes…
       |   ^
    393|     git(cwd, "remote", "add", "origin", "https://github.com/o/r.git");
    394|     pin("5.2.4");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs dispatch > CLI: --poll-result is validated, --attempts needs it
Error: Test timed out in 20000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:2212:3
    2210|   });
    2211|
    2212|   it("CLI: --poll-result is validated, --attempts needs it", async () …
       |   ^
    2213|     const { cwd } = closeRepo();
    2214|     expect((await cli(cwd, ["dispatch", "--fid=1-x", "--pr=7", "--poll…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > green: --group naming a group with no tasks is refused
Error: Hook timed out in 12500ms.
If this is a long-running hook, pass a timeout value as the last argument or configure it globally with "hookTimeout".
 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:83:1
     81|   checkout(scripts({ [SHALLOW]: "x", [DEEP]: "y" }));
     82| });
     83| afterEach(() => {
       | ^
     84|   vi.unstubAllEnvs();
     85|   for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, forc…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --push on dev with no start row carries no shared-ledger row, and says so
Error: Test timed out in 30000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1878:3
    1876|   });
    1877|
    1878|   it("--push on dev with no start row carries no shared-ledger row, an…
       |   ^
    1879|     const { cwd, remote } = withDevRemote();
    1880|     write(cwd, "docs/decisions.jsonl", jsonl([{ key: "x", workflow: "d…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/12]⎯


 Test Files  10 failed | 159 passed (169)
      Tests  12 failed | 7094 passed | 2 skipped (7108)
   Start at  19:01:58
   Duration  516.71s (tests 94%, setup 2%, worker 2%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/724-machine-wide-test/run-tests-2.log.reports/vitest-80799.xml
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.82 |    83.02 |   95.06 |   91.16 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   90.85 |    85.85 |   95.09 |   94.66 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   96.42 |    90.42 |     100 |   96.84 | 333-335           
  index.ts         |   85.71 |    71.84 |     100 |   97.15 | ...99,319,414-415 
  managed.ts       |   82.92 |    89.39 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |    97.5 |    95.31 |     100 |   98.46 | 325               
 .../checks/before |   94.55 |    88.63 |   95.55 |   97.81 |                   
  context-fetch.ts |    98.8 |    91.95 |     100 |     100 | ...17,539,553,600 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |      84 |    73.33 |     100 |     100 | ...39,147,155-174 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   93.38 |    93.75 |    87.5 |   93.61 | 194-202           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |   90.36 |    84.89 |   93.08 |   90.94 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.55 |    89.41 |   97.05 |   97.28 | ...49,485,537-540 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   96.49 |    86.95 |   87.27 |   97.42 |                   
  ci.ts            |   97.71 |    86.32 |   94.73 |   98.88 | 268,686,835       
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
 ...mmands/install |   47.86 |    45.74 |   58.75 |   48.22 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.34 |    30.88 |   33.33 |   33.45 | 350-378,560-1066  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |    92.5 |    84.32 |   96.42 |   94.03 |                   
  branches.ts      |   89.97 |    83.11 |    98.1 |   91.75 | ...2973,2998,3141 
  challenge.ts     |   96.59 |    83.03 |     100 |      98 | 178,368-370,652   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.28 |    93.96 |     100 |   98.72 | 217,516           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 195,300,369       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,379-380 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |   91.48 |    84.05 |    99.1 |   92.56 | ...2403,2435-2439 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 245,356           
  steps.ts         |   89.78 |    82.83 |   90.56 |   90.98 | ...1934,1939,1941 
  summary.ts       |   95.06 |    86.69 |   91.66 |   93.82 | ...99,407-413,441 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.39 |    88.23 |   96.55 |   96.61 | 23-24,235-236     
  tests-changed.ts |   92.85 |     75.8 |     100 |   95.23 | 81-82,85          
  tests.ts         |   96.84 |    88.88 |   96.73 |   98.15 | ...2335,2431-2433 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.39 |    82.52 |   97.29 |   95.04 | ...1750,1924,2647 
  worktrees.ts     |   61.87 |    59.85 |   66.66 |   62.87 | ...1107,1110-1111 
 engine/install    |   93.17 |    84.64 |   94.15 |   95.96 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.76 |    93.52 |   98.93 |   97.35 |                   
  status.ts        |   98.52 |    98.31 |     100 |     100 | 122,153,266       
  telemetry.ts     |   96.41 |     92.3 |    98.6 |   96.85 | ...1777,1820,2266 
 engine/render     |   90.67 |    82.42 |   98.33 |   92.72 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |   90.06 |    81.11 |     100 |    94.3 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.43 |    97.15 |     100 |     100 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |     100 |       75 |     100 |     100 | 42,105            
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 267,318           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.92 |    85.46 |   95.47 |   90.53 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.64 |    85.96 |   95.62 |    91.4 | ...1713-1795,1800 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.82% ( 18018/20058 )
Branches     : 83.02% ( 13160/15850 )
Functions    : 95.06% ( 2927/3079 )
Lines        : 91.16% ( 15774/17302 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1982 of 4011 lines (132 KB of 299 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
