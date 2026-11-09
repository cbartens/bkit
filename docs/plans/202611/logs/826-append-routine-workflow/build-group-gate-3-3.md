
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/165 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 449:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 353:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 361:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/.bkit/jsonl.md
 196:3    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 265:4    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 419:106  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/pipeline.md
 144:227  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/providers.md
 47:301   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 177:787  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 184:120  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 186:172  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 448:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 824:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 504:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 626:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 699:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 190:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 264:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 628:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 867:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1044:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1152:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1313:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1371:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-ci-performance.md
 127:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-database.md
 143:224  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-dependencies.md
 313:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/prompts/bkit-utility-update-tracker.md
 124:6  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/testing.md
 254:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 382:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 422:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 493:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 254:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 382:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 422:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 493:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 150 files.
passed: true
skipped: null
files: 150

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> bkit ci slop

[bkit-ci] base 0f425fca22c88b4133182835840e4d7437cc56f0 (0f425fca22c88b4133182835840e4d7437cc56f0) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 0f425fca22c88b4133182835840e4d7437cc56f0
base: 0f425fca22c88b4133182835840e4d7437cc56f0
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 2.4 on 10 cores: unit limits 5700ms per test, 11400ms per hook (x1.14)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 40901ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1237ms
     ✓ names each net-new and worsened finding in the log and the JSON 1488ms
     ✓ fails on a net score rise with no net count change 1019ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1941ms
     ✓ treats a net score at or below 0.001 as float noise 821ms
     ✓ passes when the change only resolves findings 826ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1446ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1094ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 427ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1442ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1389ms
     ✓ exits 4 on a dropped net field instead of silently passing 1219ms
     ✓ exits 4 on no summary instead of silently passing 976ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1268ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1507ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 840ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 811ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 794ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 792ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2704ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1103ms
     ✓ explicit globs can select ignored prose and nested checkout files 1486ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 764ms
     ✓ fails (exit 1) when vale reports alerts 811ms
     ✓ exits 6 on a vale runtime error 963ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 896ms
     ✓ falls back to vale sync when the main worktree has none 1404ms
     ✓ fails when vale sync cannot restore the required styles 1440ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 348ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 301ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 349ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 628ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 446ms
     ✓ exits 1 naming the files outside, whatever the commit message says 303ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 508ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 336ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 436ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 42360ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1228ms
     ✓ runs code.ts through its declared gate in the built checkout 1431ms
     ✓ runs code.ts through its declared gate in the built checkout 1500ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1141ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1452ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1369ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 788ms
     ✓ runs the full gate for replayed debug code 1386ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1401ms
     ✓ installs local dependencies against the built target tree 1136ms
     ✓ runs the configured frozen install even without root dependencies 1098ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1177ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1224ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1368ms
     ✓ never pushes local dev commits missing from origin/dev 1131ms
     ✓ dev moved: rebuilds on the new dev and pushes again 2386ms
     ✓ dev moved before every push: exhausted, nothing landed 3655ms
     ✓ any other refusal is returned, not retried 2612ms
     ✓ pushToDev replays a commit range onto origin/dev 1569ms
     ✓ a replay retries on the new dev when dev moved 2545ms
     ✓ pushToDev log line names what it lands 1204ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1060ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1234ms
     ✓ a push that fails without a server answer is returned once, never retried 1166ms
     ✓ a failed fetch is returned before anything is built 420ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2195ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1331ms
     ✓ lands from a clone whose fetch refspec omits dev 1453ms
     ✓ build throwing stops the landing and removes the throwaway checkout 675ms
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts (99 tests | 1 failed) 46281ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 244ms
     ✓ continues after friction and diagnostic writes fail without recursion 185ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 228ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1364ms
   ✓ routine publication policy (8)
     ✓ creates then appends routine sections under explicit invocation ownership 159ms
     ✓ deduplicates known reports using available receipts and bounded markers 194ms
     ✓ appends changed report versions without replacing prior text 210ms
     ✓ classifies attention and terminal reports from structured purpose 245ms
     ✓ rolls over after intervening comments external edits and deletion 236ms
     ✓ starts only new source after overflow or missing source 206ms
     ✓ keeps standalone fallback exact and unassociated calls conservative 103ms
     ✓ uses exact new comment after a failed eligibility read 274ms
   ❯ bounded nonfatal publication (9)
     ✓ falls back to a new comment after failed or uncertain append 180ms
     ✓ recognizes append success within budget without unnecessary resend 195ms
     ✓ contains exhausted append and create failures without fabricated success 197ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 305ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 133ms
     × reserves new comment opportunity within total delivery budget 730ms
     ✓ contains preparation state lock and reconciliation exceptions 185ms
     ✓ attempts independent attention after routine uncertainty 302ms
     ✓ seals an acknowledged segment after a postflight intervening comment 250ms
   ✓ trackerTarget (3)
     ✓ github: the issue from the FID, owner/repo from origin 111ms
     ✓ linear and jira: the uppercased key from the FID, plus team / site 184ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 388ms
   ✓ splitAt (7)
     ✓ budgets continuation headers beyond ninety nine parts 8ms
     ✓ refuses aggregation with an unverified provider budget 4ms
     ✓ budgets the entire encoded body at limit and overflow 2ms
     ✓ keeps non BMP code points intact in deterministic parts 1ms
     ✓ keeps a body at the limit whole 1ms
     ✓ splits one over the limit at line breaks; every part generated-marked, labelled, under the limit 2ms
     ✓ hard-splits a single line longer than the limit 1ms
   ✓ progress inspection (11)
     ✓ rejects inconclusive Linear creation order before selecting recent comments 96ms
     ✓ orders Linear comments by creation instant across timestamp offsets 98ms
     ✓ reads Jira ownership evidence and seals HTML or anonymous representations 147ms
     ✓ edits Jira comments with verified preflight evidence 84ms
     ✓ edits by verified comment id through each existing transport 1445ms
     ✓ seals unavailable or unstable representation evidence 1003ms
     ✓ uses accepted final preflight eligibility without provider atomicity 939ms
     ✓ rejects marker preserving external edits 981ms
     ✓ preserves generated first line and extracts versioned h6 section markers 1520ms
     ✓ returns owned comment identity and stable representation evidence 1531ms
     ✓ selects newest created comment across complete pages 933ms
   ✓ classification (7)
     ✓ HTTP 401  -> auth 1ms
     ✓ HTTP 403 Resource not accessible by personal access token -> scope 1ms
     ✓ HTTP 403 API rate limit exceeded -> rate-limit 1ms
     ✓ HTTP 404  -> not-found 1ms
     ✓ HTTP 429  -> rate-limit 1ms
     ✓ HTTP 500  -> http-500 1ms
     ✓ network errors: DNS failure, refused connection, timeout 1ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 1163ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1030ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1458ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1207ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1234ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1257ms
     ✓ fetches the issue and its comments as GitHub returns them 1052ms
   ✓ linear client (4)
     ✓ posts through GraphQL commentCreate with the API key as Authorization 76ms
     ✓ no key -> auth, and fetch is never called 71ms
     ✓ GraphQL errors map by code; DNS failure is network 67ms
     ✓ fetches title, url, state, labels, description and comments 73ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 66ms
     ✓ splits a body over 32,767 characters into consecutive comments 85ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 85ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 84ms
     ✓ pins the Rovo tool names .bkit/trackers.md lists 7ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 723ms
     ✓ caches exact engine source with available progress identity 769ms
     ✓ keeps original body identity separate from time and changed output 1708ms
     ✓ reuses matching invocation state without adopting foreign ownership 842ms
     ✓ invalidates missing corrupt and unsupported progress cache 1729ms
     ✓ contains cache read and write failures as standalone degradation 1246ms
     ✓ uses legacy receipts and contains receipt failures 911ms
     ✓ skips issue-less runs and tracker none 138ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1289ms
     ✓ a recent identical comment counts as done (the final close comment) 1418ms
     ✓ a failed post reports done false with the reason and never leaks a token 759ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 919ms
     ✓ linear: label ids by name (creating a missing one), then the state by name 89ms
     ✓ linear: a state the team lacks is not-found, after the labels landed 118ms
     ✓ jira: the full label set (keeping labels that are not bkit's), then the matching transition 98ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 894ms
     ✓ a board the token cannot see is scope 876ms
     ✓ an HTTP 403 from gh is scope 1150ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 1519ms
     ✓ github: no block, no blockers and no further reads 778ms
     ✓ linear: inverse blocks relations; done and canceled are closed 110ms
     ✓ jira: issues linked as 'is blocked by', open unless their status category is done 99ms
   ✓ generated marker hash (2)
     ✓ stamps a bare marker with the 12-hex hash of the rest; other bodies stay as they are 2ms
     ✓ reads the hash from a markdown heading, an HTML h6 and leading blank lines 5ms
   ✓ writeBodyFile (1)
     ✓ writes the body verbatim under the checkout's tmp/ and returns the absolute path 123ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 699ms
     ✓ linear: markdown round-tripped by Linear still dedups on the marker 124ms
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 92ms
     ✓ a different marker hash posts 1311ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 759ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 96ms
     ✓ fetchIssue pages comments past the first page 80ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML 74ms
     ✓ an ADF comment or description body reads as text, never a JSON blob 95ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 57797ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 726ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1772ms
     ✓ always writes the marker, even with no plan 826ms
     ✓ writes the linear marker shape, taking the tracker from package.json 1063ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1679ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 826ms
     ✓ refuses a PR from dev, main, or the base itself 374ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1091ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1126ms
     ✓ exits 5 when the open-PR probe errors 837ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1584ms
     ✓ prs open still opens against any other base 1081ms
     ✓ exits 6 when the created PR's base is not --base 977ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1241ms
     ✓ exits 1 with found=false when there is none 994ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1529ms
     ✓ --number reads one PR, mergeable included 1167ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1364ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1195ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 663ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 867ms
     ✓ drops the force-build marker from the title subject 1557ms
     ✓ takes an explicit --subject 776ms
     ✓ runs no merge when the PR is already MERGED 964ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 946ms
     ✓ prs merge refuses a PR whose base is main 1059ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1002ms
     ✓ prs merge refuses when the PR base is unknown 1376ms
     ✓ prs merge reads the base from the one pr view it already makes 1499ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 821ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 712ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 379ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 820ms
     ✓ never reads dev's required checks without --only-if-required 1159ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1446ms
     ✓ updates when a dev ruleset requires status checks 1238ms
     ✓ updates when dev's branch protection requires status checks 827ms
     ✓ ignores dev rulesets that require no checks 783ms
     ✓ updates when the repo cannot be resolved 1468ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1129ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 915ms
     ✓ is not green when a check failed, naming it (exit 1) 1038ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1055ms
     ✓ is not green on an empty rollup (total 0) 778ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1239ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1774ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1089ms
     ✓ is a no-op when the title already says so 1031ms
     ✓ strips the marker, with or without its bkit prefix 946ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 572ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 58115ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 31899ms
     ✓ every prompt, workflow and utility agent has the three header blocks 440ms
     ✓ sync has nothing left to rewrite 19971ms
     ✓ every clause reaches the cut-off of one surface it applies to 1825ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 3602ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 61376ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1912ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 1154ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1718ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 813ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 826ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1440ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 657ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1389ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1221ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1378ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1223ms
     ✓ PASS is 0 failures with or without reports 1320ms
     ✓ clears a previous attempt's reports before the gate runs 930ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 988ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1695ms
     ✓ a log under the outbox is named main-checkout relative in the record 1247ms
     ✓ a log small enough is copied whole: not clamped, raw null 1160ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1068ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1554ms
     ✓ numbers runs within the workflow's active run and per step 762ms
     ✓ without --file no row is written and the output carries row null 968ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1087ms
     ✓ a planned test that passes is a vacuous gap, exit 1 1304ms
     ✓ a planned test absent from a loaded report is a missing gap 1451ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1164ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 781ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1181ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1109ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1381ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1735ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 897ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1452ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1252ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1839ms
     ✓ green: a passed-accepted test is already landed, not a gap 1162ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1281ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 972ms
     ✓ green: --group audits only that group's tasks 1890ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1088ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1136ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 939ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 947ms
     ✓ green: lists each gap kind, with the runner output 1027ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1732ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 421ms
       ✓ green clears an exception-only task from a human commit 313ms
[feat/test 348a452] gate
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (185 tests) 67770ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 2175ms
   ✓ preserves the requested event for selected-workflow verification 1133ms
   ✓ requires selected other-workflow success at the exact pushed head 3288ms
   ✓ bkit runs locate (11)
     ✓ locates CI evidence using prompt saved issue and local precedence 2753ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 305ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1547ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1575ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2207ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3113ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 1549ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 501ms
       ✓ a source change past the validated head refuses (17) and names the path 390ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 416ms
       ✓ --validated without --month / --fid is a usage error (2) 313ms
       ✓ a validated sha that is not an ancestor refuses (17) 338ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 387ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 711ms
     ✓ a failed re-trigger push names the cause in the log 1446ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1660ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1046ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 806ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 472ms
     ✓ gh-error: every poll errored 398ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 638ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 483ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 690ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 766ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1806ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1948ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 556ms
     ✓ re-trigger on dev only uses the record of its own FID 636ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 747ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 306ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 459ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 344ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 387ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 545ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 599ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 553ms
     ✓ --file and --step go together 499ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 22115ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2184ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2239ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 343ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2084ms
     ✓ does not fall back through a malformed later success receipt 1246ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 813ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 965ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1601ms
     ✓ requires proof even when the pushed increment changes no files 830ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 638ms
     ✓ does not record a committed tree 603ms
     ✓ records no proof for a failed gate or lighter gate 1047ms
     ✓ requires integration proof when integration is declared 1223ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2004ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 2113ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1202ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1204ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 665ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 489ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 496ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 498ms
     ✓ an unpinned repo reports nulls and asks no registry 468ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 393ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 369ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 439ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 372ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ done --group writes group on the row 321ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 461ms
     ✓ reports a failed commit with exit 8 without writing the row 1402ms
     ✓ a failed commit leaves no row staged in the index 1041ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 831ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1021ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1229ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1017ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 2118ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 306ms
     ✓ --ref exits 3 when the ref does not carry the status file 327ms
     ✓ fails on a placeholder left in the artifact 354ms
     ✓ fails when the row does not list the artifact, or carries another attempt 326ms
     ✓ fails on a missing artifact 314ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 309ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 476ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 365ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 593ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 859ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 505ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 325ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 585ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 431ms
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 714ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 318ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 370ms
> [bkit] TRUNCATED HERE — 70 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1146ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 963ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 639ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1099ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1084ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1366ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 748ms
     ✓ --file into a missing directory is refused, not created 902ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 10059ms
   ✓ issue-less runs render only under a wired tracker (20)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 458ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1809ms
     ✓ a refused dev push is logged, never fails the close 2064ms
     ✓ an unreachable remote is logged, never fails the close 580ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 7133ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1247ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1074ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1470ms
     ✓ reports excluded intervals as unread even when pagination finishes 642ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 974ms
     ✓ reports an unread remainder at the page cap 686ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 720ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 347ms
     ✓ rejects missing summaries instead of treating them as empty results 497ms
     ✓ reports a failed first page as unavailable 478ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 374ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 560ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 484ms
     ✓ follows summary cursors even when the first page is shorter than the limit 706ms
     ✓ reports excluded intervals as unread even when pagination finishes 526ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 572ms
     ✓ reports an unread remainder at the page cap 465ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 907ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 846ms
     ✓ rejects missing summaries instead of treating them as empty results 645ms
     ✓ reports a failed first page as unavailable 739ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 866ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 10384ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 983ms
     ✓ resolves config from the repo root when run from a subdirectory 530ms
     ✓ exits 6 when the PUT fails 528ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 752ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 636ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 372ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 560ms
     ✓ exits 6 when the api answer is not JSON 619ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 100592ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ a new run has no last step and no open decision 304ms
     ✓ an OPEN decision of an earlier run never resurfaces 312ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 383ms
     ✓ aborts a rebase only when one is in progress 664ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 528ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 650ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 310ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 326ms
   ✓ bkit workflows close (26)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 392ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 445ms
     ✓ an unwritable stats path is logged and never fails the close 412ms
     ✓ appends the completeness row before the workflow-done row 438ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 490ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 547ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 734ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 522ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 476ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 471ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 503ms
     ✓ --number without --outbox is a usage error 509ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 767ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 684ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 505ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1401ms
     ✓ --flush with nothing to record commits and pushes nothing 888ms
     ✓ --flush carries the named worktree's logs into the dev commit 1770ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2591ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2226ms
     ✓ a close that landed releases the lock 2435ms
     ✓ removes the worktree before it releases the lock 2432ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ closePr refuses when the PR base is unknown 4515ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1663ms
   ✓ --post on fail / links (4)
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 302ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 677ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 486ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 623ms
     ✓ record is present after workflows close and before the push 1130ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2073ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 356ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 569ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1051ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 406ms
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 4666ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1357ms
     ✓ runGit names ENOBUFS when output passes the limit 1029ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1118ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 879ms
     ✓ counts files committed since --base 1447ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 616ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 671ms
     ✓ runs the --fallback gate even when no file changed, as it did before 624ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 611ms
     ✓ passes every rule on a clean head 316ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 319ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (75 tests) 2724ms
   ✓ source derivation (6)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ accepts only matching complete CI receipts with nonempty logs 1180ms
     ✓ validates adapted legacy and fallback context through the same receipt path 492ms
 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (7 tests | 3 failed) 23458ms
   ✓ catalog parity — workflows (2)
     ✓ has at least one workflow file (sanity) 2ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ every .bkit/prompts/*.md agent is referenced in the prompts.md catalog 0ms
   ❯ rendered workflow comment contracts (3)
     × renders explicit invocation association at fileless and lifecycle posting sites 7010ms
     × renders engine progress authority with verbatim create only agent fallback 7654ms
     × renders nonfatal comment fallback friction and attempted delivery gates 8788ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 2164ms
   ✓ repoConfigFile (3)
     ✓ answers for the cwd, not an inherited GIT_DIR 404ms
   ✓ guardRepoConfig (6)
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 303ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (89 tests) 1749ms
   ✓ .bkit/templates/context/ (89)
> [bkit] TRUNCATED HERE — 970 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — nuke > --nuke --yes deletes all present files without interactive prompt
[bkit-uninstall-test] delete: AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .bkit
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > strips allow/deny/ask together, including install's WebFetch enrichment
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > preserves a permission the consumer added themselves
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > deletes .claude/bkit-cloud.md when the claude host is uninstalled
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > leaves .claude/bkit-cloud.md untouched when claude is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .cursor/bkit-cloud.md cleanup > deletes .cursor/bkit-cloud.md when the cursor host is uninstalled
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .cursor/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .cursor/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
.cursor/hooks.json                               | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.cursor/cli.json                                 | skip-absent            | file not found — nothing to do
.cursor/rules/bkit-rules.mdc                     | skip-absent            | file not found — nothing to do
.cursor/mcp.json                                 | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .cursor/bkit-cloud.md cleanup > leaves .cursor/bkit-cloud.md untouched when cursor is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .codex/bkit-cloud.md cleanup > deletes .codex/bkit-cloud.md when the codex host is uninstalled
[bkit-uninstall-test] absent: .codex/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-rules.cjs (file not found — nothing to do)
[bkit-uninstall-test] delete: .codex/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .codex

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .codex/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
.codex/hooks.json                                | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-gateguard.cjs                  | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-readguard.cjs                  | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-guardrails.cjs                 | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-rules.cjs                      | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .codex/bkit-cloud.md cleanup > leaves .codex/bkit-cloud.md untouched when codex is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 287ms
 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 443ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 346ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 244ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 423ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 198ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 252ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-7aaElU/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 247ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 253ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 174ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 220ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 254ms
 ✓ .bkit/core/engine/install/manifest.test.ts (49 tests) 69ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 153ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-rLyukb/nonexistent.md — skipping .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 124ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > a consumer edit survives a no-op upgrade and is a conflict on the next template change
[bkit-upgrade] conflict: .bkit/scripts/bkit-foo.sh — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > template with a slash-prefixed HTML marker (// <!-- bkit:start -->) is classified html-comment, not slash-comment (site-9 mis-classification trap)
[bkit-upgrade] upgrade (merge): weird.js

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > a marker-less consumer file gets the block appended, its own content kept
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 138ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > the shipped hook template upgrades to its generated form: shared parts spliced into the block
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: auto-applies non-conflicting changes
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

(node:17954) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:17954) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: does NOT overwrite consumer drift (conflict preserved)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: returns conflicts list with relPath and content
[bkit-upgrade] conflict: .claude/agents/bkit-test.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-test.md

 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (68 tests) 135ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (57 tests) 151ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 178ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 110ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 123ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 89ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 102ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 155ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 89ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 106ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 133ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 154ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 97ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 123ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 93ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 74ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 104ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 124ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 84ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 96ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 121ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 94ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (40 tests) 114ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 86ms
(node:18762) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:18762) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:18762) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18762) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 71ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 118ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 74ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 34ms
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

 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 67ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 35ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 49ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 61ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 84ms
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

 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 28ms
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

 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 47ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 36ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 35ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793876400916.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793876400920.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793876400921.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793876400931.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 32ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 110ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 55ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 27ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 40ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 41ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 48ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 52ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 56ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 33ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 29ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 34ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (40 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 31ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 37ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 29ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 30ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 25ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 30ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 48ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 40ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 46ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 20ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 26ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 29ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 18ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 16ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 12ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (259 tests) 175026ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 429ms
     ✓ rejects missing explicit and ambiguous existing branch selections 305ms
   ✓ branches rebase: behaviour (30)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 581ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 676ms
     ✓ --file records nothing for a refused rebase 556ms
     ✓ refuses a code conflict and aborts the rebase on the spot 474ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1738ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 419ms
     ✓ produces byte-identical output to merge=union 1286ms
     ✓ restores a trailing newline so the next append starts on its own line 820ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 623ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1079ms
     ✓ refuses a union that leaves a line which is not JSON 681ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 702ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1683ms
     ✓ refuses a lockfile whose regenerate command fails 1306ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 751ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 797ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 713ms
     ✓ refuses and aborts when both sides changed the hand-written region 433ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 538ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 675ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 757ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 447ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 544ms
     ✓ refuses and aborts when a side deleted the install record 448ms
     ✓ refuses a conflicted doc the repo's script does not list 457ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 394ms
     ✓ removes a stale sentinel when the rebase succeeds 515ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 781ms
     ✓ resolves a conflict in each of two replayed commits across rounds 648ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 394ms
       ✓ skips (12) with no anchor 411ms
       ✓ skips (12) when the base is unreachable in this clone 448ms
       ✓ skips (12) when nothing landed since the base 486ms
       ✓ runs (0) with the landed path count once dev moved 902ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 457ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 667ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 447ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 729ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1420ms
     ✓ runs exactly one git push 1628ms
     ✓ --set-upstream records the upstream 609ms
     ✓ refuses with no branch checked out 423ms
     ✓ --mode=dev refuses a feature checkout 411ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 908ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1546ms
     ✓ --require-ci pushes as-is when dev has not moved 740ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1459ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2091ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 409ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1724ms
     ✓ --mode=abort pushes when the branch has no open PR 1547ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1089ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 460ms
     ✓ --open-pr carries the MCP answer and skips gh 682ms
     ✓ --mode=abort on dev pushes plainly without probing 751ms
     ✓ rejects an unknown mode 587ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1960ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1159ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1193ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4393ms
     ✓ skip-ci HEAD on the replay is refused 842ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2361ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3230ms
     ✓ a level local dev is a plain push, recording nothing extra 1149ms
     ✓ a record with no commits pushes nothing 907ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 655ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1248ms
     ✓ a rewritten branch is refused, never forced 971ms
     ✓ refuses dev and main with exit 21 and pushes nothing 596ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1430ms
     ✓ refuses a detached HEAD (exit 5) 639ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1228ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1074ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1132ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1409ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 613ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1409ms
     ✓ an up-to-date branch is a no-op 727ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1157ms
     ✓ a fetch that fails exits 10 556ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 722ms
     ✓ scan-diff still reports a new skip when its test … 871ms
     ✓ scan-diff reports a skip moved onto a different t… 752ms
     ✓ scan-diff does not cancel a skip moved between am… 601ms
     ✓ scan-diff does not spend an unchanged duplicate t… 517ms
     ✓ scan-diff recognizes a renamed test file 486ms
     ✓ scan-diff recognizes a suite moved into a differe… 509ms
     ✓ scan-diff does not let unrelated additions hide a… 510ms
     ✓ scan-diff attributes deletion to its old test ins… 586ms
     ✓ scan-diff consumes each moved assertion once and … 554ms
     ✓ scan-diff does not match identical assertions fro… 546ms
     ✓ scan-diff does not match the same leaf test name … 621ms
     ✓ scan-diff does not match a same-named test with d… 632ms
     ✓ scan-diff does not match a same-named test with c… 653ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 717ms
     ✓ --paths with no match exits 1 725ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 552ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 987ms
     ✓ --marker reads a diff over 1 MiB 815ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 925ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 773ms
     ✓ scan-diff finds an added skip 686ms
     ✓ scan-diff ignores a skip predating the base 686ms
     ✓ scan-diff reports a disabled test with its line 762ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 637ms
     ✓ scan-diff ignores a removed comment in a test file 574ms
     ✓ scan-diff ignores an assertion moved within the file 692ms
     ✓ scan-diff still reports a removed assertion 652ms
     ✓ scan-diff reports an assertion re-added only outside the test file 588ms
     ✓ scan-diff finds an added pytest mark skip 727ms
     ✓ scan-diff finds an added unittest skip 864ms
     ✓ scan-diff finds an added bare skip call 765ms
     ✓ scan-diff ignores a quoted skip in a documentation file 895ms
     ✓ scan-diff ignores a marker literal in a non-test source file 785ms
     ✓ scan-diff ignores an assertion whose expectation changed 829ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 887ms
     ✓ scan-diff reports a deleted test file 900ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 664ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1847ms
     ✓ a title that already carries the marker is left alone 1408ms
     ✓ with no open PR: pushes the marker commit and edits no title 1497ms
     ✓ a re-run is deduped: no second marker commit 2021ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 2096ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 773ms
     ✓ --title-set skips gh entirely 1088ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 314ms
     ✓ Path B once dev moved; --head checks a given commit 498ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 485ms
     ✓ --merge-docs merges dev when docs/ is behind 565ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 570ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 825ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 812ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 675ms
     ✓ --merge-docs skips an empty bkit:generate script 591ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 499ms
     ✓ --merge-docs never merges on dev itself 454ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 645ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 677ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 603ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 632ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 348ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 815ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 916ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 966ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 854ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 843ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1047ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 872ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 899ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 622ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 420ms
     ✓ exits 10 when the fetch fails 374ms
     ✓ refuses --merge-docs with --head, and an unknown --head 306ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 531ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 843ms
     ✓ a failed install stops ship (16) 699ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 565ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 545ms
     ✓ exits 10 when the fetch fails 434ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1275ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1270ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1262ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1313ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2856ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3527ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 511ms
     ✓ local: names unpushed dev as the cause when the branch carries it 594ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 610ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1530ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1573ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1111ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1203ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1265ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1277ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 800ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1557ms
     ✓ land removes the worktree when only the copied .env is untracked 1296ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1201ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1228ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2162ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1279ms
     ✓ landPr refuses a main-based PR without retrying 630ms
     ✓ landPr refuses when the PR base is unknown 641ms
     ✓ PR not open (closed): stops (17) at once, no retry 774ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 537ms
     ✓ --attempt names the merge round in a fix commit 500ms
     ✓ commits a rewritten and a deleted tracked file 510ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 463ms
     ✓ reports undeclared and runs nothing with an empty script 322ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 393ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 479ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 338ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts > renders explicit invocation association at fileless and lifecycle posting sites
Error: Test timed out in 5700ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts:109:3
    107|
    108| describe("rendered workflow comment contracts", () => {
    109|   it("renders explicit invocation association at fileless and lifecycl…
       |   ^
    110|     const rendered = renderedReportingWorkflows();
    111|     expect(rendered).toHaveLength(6 * 4 * 5);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts > renders engine progress authority with verbatim create only agent fallback
Error: Test timed out in 5700ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts:134:3
    132|   });
    133|
    134|   it("renders engine progress authority with verbatim create only agen…
       |   ^
    135|     const rendered = renderedReportingWorkflows().filter(isWired);
    136|     for (const { body, label } of rendered) {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts > renders nonfatal comment fallback friction and attempted delivery gates
Error: Test timed out in 5700ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts:151:3
    149|   });
    150|
    151|   it("renders nonfatal comment fallback friction and attempted deliver…
       |   ^
    152|     for (const { body, label } of renderedReportingWorkflows().filter(…
    153|       const clause = commentsClause(body);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > bounded nonfatal publication > reserves new comment opportunity within total delivery budget
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tracker-gh-HwYGie/slow-calls'
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:701:26
    699|     expect(result).toMatchObject({ done: false });
    700|     expect(performance.now() - childStart).toBeLessThan(1500);
    701|     const slowCalls = fs.readFileSync(path.join(fake, "slow-calls"), "…
       |                          ^
    702|     expect(slowCalls.some((call) => call.includes("--method POST"))).t…
    703|     expect(slowCalls.length).toBeLessThanOrEqual(3);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  2 failed | 171 passed (173)
      Tests  4 failed | 7321 passed | 2 skipped (7327)
   Start at  20:58:06
   Duration  176.40s (tests 97%, import 1%, setup 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/826-append-routine-workflow/build-group-gate-3-3.log.reports/vitest-98394.xml
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.78 |    83.29 |   95.09 |   91.13 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   90.47 |     85.6 |   95.19 |   94.36 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   93.15 |    88.61 |     100 |    94.4 | ...76-277,405-407 
  index.ts         |   85.45 |    71.42 |     100 |   97.19 | ...00,320,417-418 
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
 engine/commands   |   89.65 |    84.15 |   93.25 |    90.4 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.55 |    89.53 |   97.05 |   97.28 | ...51,487,539-542 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   95.78 |    86.92 |   90.41 |   97.88 |                   
  ci.ts            |   97.38 |    88.56 |   95.34 |    98.8 | 271,719,798,973   
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   93.22 |    81.74 |     100 |   99.03 | 210               
 ...mmands/install |   47.86 |    45.74 |   58.75 |   48.22 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.34 |    30.88 |   33.33 |   33.45 | 350-378,560-1066  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.31 |     84.6 |   96.34 |   93.76 |                   
  branches.ts      |   90.28 |    83.51 |   98.22 |   92.02 | ...3018,3043,3186 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.28 |    93.96 |     100 |   98.72 | 217,516           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 195,300,369       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   96.88 |    89.88 |   96.55 |   97.66 | ...,767,1056-1066 
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   93.22 |    86.44 |   96.29 |   95.36 | ...04-305,474-475 
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
  steps.ts         |   89.89 |    83.02 |   90.82 |   91.09 | ...1960,1965,1967 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...93-499,511,534 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |     75.8 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   88.93 |    80.45 |   96.66 |   91.05 | ...2059,2085-2090 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1763,1937,2669 
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
 engine/render     |   90.61 |    82.85 |   98.36 |   92.72 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |   90.06 |    81.11 |     100 |    94.3 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.44 |     97.2 |     100 |     100 |                   
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
Statements   : 89.78% ( 18829/20971 )
Branches     : 83.29% ( 14031/16845 )
Functions    : 95.09% ( 3043/3200 )
Lines        : 91.13% ( 16500/18106 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1824 of 3427 lines (128 KB of 263 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
