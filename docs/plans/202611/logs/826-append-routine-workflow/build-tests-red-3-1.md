Enforced: true
Red: 15
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/826-append-routine-workflow-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "associates startup and run across restart or starts fresh safely" | red | failure: [bkit-issues] unknown flag --session-dir : expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps successive phase runs separate in adopted and worktree execution" | red | failure: [bkit-workflows] unknown flag --session-dir : expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps auto and phase progress separate across worktrees" | red | failure: [bkit-issues] unknown flag --session-dir : expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "continues close and cleanup after lost terminal response" | red | failure: [bkit-workflows] unknown flag --session-dir : expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "starts fresh progress after cleanup and on a fresh clone" | red | failure: [bkit-workflows] unknown flag --session-dir : expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "preserves substantive step results under every comment boundary fault" | red | failure: [bkit-workflows] unknown flag --session-dir : expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps clean build progress and completion to two comments" | red | failure: [bkit-issues] unknown flag --session-dir : expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "preserves legacy receipts issue less skips and exact fallback through resume" | red | failure: [bkit-workflows] unknown flag --session-dir : expected 2 to be +0 // Object.is equality |
| 8 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "records redacted exhausted comment friction with authorized fields" | red | failure: comment fault must attempt a real friction row: expected false to be true // Object.is equality |
| 8 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "continues after friction and diagnostic writes fail without recursion" | red | failure: expected 'tracker comment failed (http-503): li…' to contain 'friction' |
| 8 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "distinguishes fallback attempts from known delivery and lost reports" | red | failure: comment fault must attempt a real friction row: expected false to be true // Object.is equality |
| 8 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "logs cache receipt lock and reconciliation problems with stable recurrence identity" | red | failure: comment fault must attempt a real friction row: expected false to be true // Object.is equality |
| 9 | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` "renders explicit invocation association at fileless and lifecycle posting sites" | red | failure: bkit-auto/github/claude: expected ' "{BKIT}" issues comment --post --i…' to match /--(?:session-dir\|file)=/ |
| 9 | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` "renders engine progress authority with verbatim create only agent fallback" | red | failure: bkit-auto/github/claude: expected '- **Comments:** A step\'s `bkit` bloc…' to match /engine[^\n]*(?:append\|edit\|updat)/i |
| 9 | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` "renders nonfatal comment fallback friction and attempted delivery gates" | red | failure: bkit-auto/github/claude: expected '- **Comments:** A step\'s `bkit` bloc…' to match /nonfatal\|non-fatal\|never[^\n]*(?:sto…/i |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tracker.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tracker.integration.test.ts

[test-timeout-budget] load average 2.2 on 10 cores: unit limits 5601ms per test, 11201ms per hook (x1.12)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow

 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts (8 tests | 8 failed) 3890ms
   ❯ workflow comment lifecycle across real CLI processes (8)
     × associates startup and run across restart or starts fresh safely 525ms
     × keeps successive phase runs separate in adopted and worktree execution 492ms
     × keeps auto and phase progress separate across worktrees 476ms
     × continues close and cleanup after lost terminal response 490ms
     × starts fresh progress after cleanup and on a fresh clone 500ms
     × preserves substantive step results under every comment boundary fault 467ms
     × keeps clean build progress and completion to two comments 463ms
     × preserves legacy receipts issue less skips and exact fallback through resume 477ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > associates startup and run across restart or starts fresh safely
AssertionError: [bkit-issues] unknown flag --session-dir
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ ok .bkit/core/engine/commands/workflow/tracker.integration.test.ts:141:38
    139| function ok(at: string, args: string[], extra?: NodeJS.ProcessEnv) {
    140|   const result = cli(at, args, extra);
    141|   expect(result.code, result.stderr).toBe(0);
       |                                      ^
    142|   return result.out;
    143| }
 ❯ report .bkit/core/engine/commands/workflow/tracker.integration.test.ts:183:10
 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:339:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > keeps successive phase runs separate in adopted and worktree execution
AssertionError: [bkit-workflows] unknown flag --session-dir
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ ok .bkit/core/engine/commands/workflow/tracker.integration.test.ts:141:38
    139| function ok(at: string, args: string[], extra?: NodeJS.ProcessEnv) {
    140|   const result = cli(at, args, extra);
    141|   expect(result.code, result.stderr).toBe(0);
       |                                      ^
    142|   return result.out;
    143| }
 ❯ start .bkit/core/engine/commands/workflow/tracker.integration.test.ts:162:10
 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:354:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > keeps auto and phase progress separate across worktrees
AssertionError: [bkit-issues] unknown flag --session-dir
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ ok .bkit/core/engine/commands/workflow/tracker.integration.test.ts:141:38
    139| function ok(at: string, args: string[], extra?: NodeJS.ProcessEnv) {
    140|   const result = cli(at, args, extra);
    141|   expect(result.code, result.stderr).toBe(0);
       |                                      ^
    142|   return result.out;
    143| }
 ❯ report .bkit/core/engine/commands/workflow/tracker.integration.test.ts:183:10
 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:370:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > continues close and cleanup after lost terminal response
AssertionError: [bkit-workflows] unknown flag --session-dir
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ ok .bkit/core/engine/commands/workflow/tracker.integration.test.ts:141:38
    139| function ok(at: string, args: string[], extra?: NodeJS.ProcessEnv) {
    140|   const result = cli(at, args, extra);
    141|   expect(result.code, result.stderr).toBe(0);
       |                                      ^
    142|   return result.out;
    143| }
 ❯ start .bkit/core/engine/commands/workflow/tracker.integration.test.ts:162:10
 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:390:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > starts fresh progress after cleanup and on a fresh clone
AssertionError: [bkit-workflows] unknown flag --session-dir
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ ok .bkit/core/engine/commands/workflow/tracker.integration.test.ts:141:38
    139| function ok(at: string, args: string[], extra?: NodeJS.ProcessEnv) {
    140|   const result = cli(at, args, extra);
    141|   expect(result.code, result.stderr).toBe(0);
       |                                      ^
    142|   return result.out;
    143| }
 ❯ start .bkit/core/engine/commands/workflow/tracker.integration.test.ts:162:10
 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:410:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > preserves substantive step results under every comment boundary fault
AssertionError: [bkit-workflows] unknown flag --session-dir
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ ok .bkit/core/engine/commands/workflow/tracker.integration.test.ts:141:38
    139| function ok(at: string, args: string[], extra?: NodeJS.ProcessEnv) {
    140|   const result = cli(at, args, extra);
    141|   expect(result.code, result.stderr).toBe(0);
       |                                      ^
    142|   return result.out;
    143| }
 ❯ start .bkit/core/engine/commands/workflow/tracker.integration.test.ts:162:10
 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:427:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > keeps clean build progress and completion to two comments
AssertionError: [bkit-issues] unknown flag --session-dir
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ ok .bkit/core/engine/commands/workflow/tracker.integration.test.ts:141:38
    139| function ok(at: string, args: string[], extra?: NodeJS.ProcessEnv) {
    140|   const result = cli(at, args, extra);
    141|   expect(result.code, result.stderr).toBe(0);
       |                                      ^
    142|   return result.out;
    143| }
 ❯ report .bkit/core/engine/commands/workflow/tracker.integration.test.ts:183:10
 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:465:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > preserves legacy receipts issue less skips and exact fallback through resume
AssertionError: [bkit-workflows] unknown flag --session-dir
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ ok .bkit/core/engine/commands/workflow/tracker.integration.test.ts:141:38
    139| function ok(at: string, args: string[], extra?: NodeJS.ProcessEnv) {
    140|   const result = cli(at, args, extra);
    141|   expect(result.code, result.stderr).toBe(0);
       |                                      ^
    142|   return result.out;
    143| }
 ❯ start .bkit/core/engine/commands/workflow/tracker.integration.test.ts:162:10
 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:494:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed (8)
   Start at  17:33:23
   Duration  3.98s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-5rGJct/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tracker.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tracker.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tracker.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tracker.test.ts

[test-timeout-budget] load average 2.2 on 10 cores: unit limits 5601ms per test, 11201ms per hook (x1.12)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts (99 tests | 4 failed) 7367ms
   ❯ best effort comment friction (4)
     × records redacted exhausted comment friction with authorized fields 44ms
     × continues after friction and diagnostic writes fail without recursion 35ms
     × distinguishes fallback attempts from known delivery and lost reports 56ms
     × logs cache receipt lock and reconciliation problems with stable recurrence identity 41ms
   ✓ routine publication policy (8)
     ✓ creates then appends routine sections under explicit invocation ownership 42ms
     ✓ deduplicates known reports using available receipts and bounded markers 45ms
     ✓ appends changed report versions without replacing prior text 41ms
     ✓ classifies attention and terminal reports from structured purpose 51ms
     ✓ rolls over after intervening comments external edits and deletion 59ms
     ✓ starts only new source after overflow or missing source 51ms
     ✓ keeps standalone fallback exact and unassociated calls conservative 21ms
     ✓ uses exact new comment after a failed eligibility read 40ms
   ✓ bounded nonfatal publication (9)
     ✓ falls back to a new comment after failed or uncertain append 41ms
     ✓ recognizes append success within budget without unnecessary resend 40ms
     ✓ contains exhausted append and create failures without fabricated success 42ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 51ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 31ms
     ✓ reserves new comment opportunity within total delivery budget 429ms
     ✓ contains preparation state lock and reconciliation exceptions 37ms
     ✓ attempts independent attention after routine uncertainty 55ms
     ✓ seals an acknowledged segment after a postflight intervening comment 51ms
   ✓ trackerTarget (3)
     ✓ github: the issue from the FID, owner/repo from origin 23ms
     ✓ linear and jira: the uppercased key from the FID, plus team / site 39ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 71ms
   ✓ splitAt (7)
     ✓ budgets continuation headers beyond ninety nine parts 1ms
     ✓ refuses aggregation with an unverified provider budget 0ms
     ✓ budgets the entire encoded body at limit and overflow 0ms
     ✓ keeps non BMP code points intact in deterministic parts 0ms
     ✓ keeps a body at the limit whole 0ms
     ✓ splits one over the limit at line breaks; every part generated-marked, labelled, under the limit 1ms
     ✓ hard-splits a single line longer than the limit 0ms
   ✓ progress inspection (11)
     ✓ rejects inconclusive Linear creation order before selecting recent comments 21ms
     ✓ orders Linear comments by creation instant across timestamp offsets 21ms
     ✓ reads Jira ownership evidence and seals HTML or anonymous representations 20ms
     ✓ edits Jira comments with verified preflight evidence 20ms
     ✓ edits by verified comment id through each existing transport 204ms
     ✓ seals unavailable or unstable representation evidence 181ms
     ✓ uses accepted final preflight eligibility without provider atomicity 167ms
     ✓ rejects marker preserving external edits 173ms
     ✓ preserves generated first line and extracts versioned h6 section markers 150ms
     ✓ returns owned comment identity and stable representation evidence 161ms
     ✓ selects newest created comment across complete pages 159ms
   ✓ classification (7)
     ✓ HTTP 401  -> auth 0ms
     ✓ HTTP 403 Resource not accessible by personal access token -> scope 0ms
     ✓ HTTP 403 API rate limit exceeded -> rate-limit 0ms
     ✓ HTTP 404  -> not-found 0ms
     ✓ HTTP 429  -> rate-limit 0ms
     ✓ HTTP 500  -> http-500 0ms
     ✓ network errors: DNS failure, refused connection, timeout 0ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 137ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 136ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 139ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 136ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 138ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 141ms
     ✓ fetches the issue and its comments as GitHub returns them 150ms
   ✓ linear client (4)
     ✓ posts through GraphQL commentCreate with the API key as Authorization 21ms
     ✓ no key -> auth, and fetch is never called 20ms
     ✓ GraphQL errors map by code; DNS failure is network 20ms
     ✓ fetches title, url, state, labels, description and comments 20ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 21ms
     ✓ splits a body over 32,767 characters into consecutive comments 21ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 20ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 21ms
     ✓ pins the Rovo tool names .bkit/trackers.md lists 1ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 199ms
     ✓ caches exact engine source with available progress identity 166ms
     ✓ keeps original body identity separate from time and changed output 177ms
     ✓ reuses matching invocation state without adopting foreign ownership 176ms
     ✓ invalidates missing corrupt and unsupported progress cache 283ms
     ✓ contains cache read and write failures as standalone degradation 180ms
     ✓ uses legacy receipts and contains receipt failures 146ms
     ✓ skips issue-less runs and tracker none 48ms
     ✓ records an engine-action row and skips the same key + body on a re-run 155ms
     ✓ a recent identical comment counts as done (the final close comment) 144ms
     ✓ a failed post reports done false with the reason and never leaks a token 145ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 165ms
     ✓ linear: label ids by name (creating a missing one), then the state by name 20ms
     ✓ linear: a state the team lacks is not-found, after the labels landed 20ms
     ✓ jira: the full label set (keeping labels that are not bkit's), then the matching transition 20ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 179ms
     ✓ a board the token cannot see is scope 144ms
     ✓ an HTTP 403 from gh is scope 156ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 176ms
     ✓ github: no block, no blockers and no further reads 150ms
     ✓ linear: inverse blocks relations; done and canceled are closed 23ms
     ✓ jira: issues linked as 'is blocked by', open unless their status category is done 21ms
   ✓ generated marker hash (2)
     ✓ stamps a bare marker with the 12-hex hash of the rest; other bodies stay as they are 1ms
     ✓ reads the hash from a markdown heading, an HTML h6 and leading blank lines 0ms
   ✓ writeBodyFile (1)
     ✓ writes the body verbatim under the checkout's tmp/ and returns the absolute path 20ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 155ms
     ✓ linear: markdown round-tripped by Linear still dedups on the marker 25ms
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 22ms
     ✓ a different marker hash posts 159ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 147ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 23ms
     ✓ fetchIssue pages comments past the first page 22ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML 20ms
     ✓ an ADF comment or description body reads as text, never a JSON blob 22ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > best effort comment friction > records redacted exhausted comment friction with authorized fields
AssertionError: comment fault must attempt a real friction row: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ commentFriction .bkit/core/engine/commands/workflow/tracker.test.ts:352:83
    350| function commentFriction(cwd: string): Array<Record<string, unknown>> {
    351|   const ledger = path.join(cwd, ".bkit/friction.jsonl");
    352|   expect(fs.existsSync(ledger), "comment fault must attempt a real fri…
       |                                                                                   ^
    353|   return fs
    354|     .readFileSync(ledger, "utf8")
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:400:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > best effort comment friction > continues after friction and diagnostic writes fail without recursion
AssertionError: expected 'tracker comment failed (http-503): li…' to contain 'friction'

Expected: "friction"
Received: "tracker comment failed (http-503): linear: test transport unavailable"

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:437:50
    435|     expect(warning.mock.calls.length).toBeGreaterThan(0);
    436|     expect(warning.mock.calls.length).toBeLessThanOrEqual(3);
    437|     expect(warning.mock.calls.flat().join("\n")).toContain("friction");
       |                                                  ^
    438|     expect(
    439|       f.state.requests.filter((request) => request.operation === "crea…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > best effort comment friction > distinguishes fallback attempts from known delivery and lost reports
AssertionError: comment fault must attempt a real friction row: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ commentFriction .bkit/core/engine/commands/workflow/tracker.test.ts:352:83
    350| function commentFriction(cwd: string): Array<Record<string, unknown>> {
    351|   const ledger = path.join(cwd, ".bkit/friction.jsonl");
    352|   expect(fs.existsSync(ledger), "comment fault must attempt a real fri…
       |                                                                                   ^
    353|   return fs
    354|     .readFileSync(ledger, "utf8")
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:464:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > best effort comment friction > logs cache receipt lock and reconciliation problems with stable recurrence identity
AssertionError: comment fault must attempt a real friction row: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ commentFriction .bkit/core/engine/commands/workflow/tracker.test.ts:352:83
    350| function commentFriction(cwd: string): Array<Record<string, unknown>> {
    351|   const ledger = path.join(cwd, ".bkit/friction.jsonl");
    352|   expect(fs.existsSync(ledger), "comment fault must attempt a real fri…
       |                                                                                   ^
    353|   return fs
    354|     .readFileSync(ledger, "utf8")
 ❯ stateFriction .bkit/core/engine/commands/workflow/tracker.test.ts:390:10
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:469:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 95 passed (99)
   Start at  17:33:28
   Duration  7.51s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-1dIoXf/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/catalog-parity.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/catalog-parity.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/catalog-parity.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/catalog-parity.test.ts

[test-timeout-budget] load average 2.2 on 10 cores: unit limits 5601ms per test, 11201ms per hook (x1.12)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow

 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (7 tests | 3 failed) 8183ms
   ✓ catalog parity — workflows (2)
     ✓ has at least one workflow file (sanity) 1ms
     ✓ every .bkit/workflows/*.md file has a `### `/<name>`` section in workflows.md 1ms
   ✓ catalog parity — prompts (2)
     ✓ has at least one prompt file (sanity) 0ms
     ✓ every .bkit/prompts/*.md agent is referenced in the prompts.md catalog 0ms
   ❯ rendered workflow comment contracts (3)
     × renders explicit invocation association at fileless and lifecycle posting sites 2406ms
     × renders engine progress authority with verbatim create only agent fallback 2271ms
     × renders nonfatal comment fallback friction and attempted delivery gates 3503ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts > renders explicit invocation association at fileless and lifecycle posting sites
AssertionError: bkit-auto/github/claude: expected '   "{BKIT}" issues comment --post --i…' to match /--(?:session-dir|file)=/

- Expected:
/--(?:session-dir|file)=/

+ Received:
"   \"{BKIT}\" issues comment --post --issue=\"{ISSUE_ID}\" --workflow=auto --workflow-heading --step-number=1 --step-title=\"Start Workflow\" --field=Phase={PHASE} --owner-repo={OWNER_REPO} --tree={BRANCH} --pr-number={PR_NUMBER} --pr-url={PR_URL} --run-id={RUN_ID}"

 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts:120:62
    118|       const commands = reportingCommands(body);
    119|       expect(commands.length, label).toBeGreaterThan(0);
    120|       for (const command of commands) expect(command, label).toMatch(/…
       |                                                              ^
    121|     }
    122|     for (const { body, label } of rendered.filter(isWired).filter(isAu…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts > renders engine progress authority with verbatim create only agent fallback
AssertionError: bkit-auto/github/claude: expected '- **Comments:** A step\'s `bkit` bloc…' to match /engine[^\n]*(?:append|edit|updat)/i

- Expected:
/engine[^\n]*(?:append|edit|updat)/i

+ Received:
"- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: \"{OWNER}\", repo: \"{REPO}\", issue_number: {ISSUE_ID}, body: \"{BODY}\" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content."

 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts:139:29
    137|       const clause = commentsClause(body);
    138|       expect(clause.length, label).toBeGreaterThan(0);
    139|       expect(clause, label).toMatch(/engine[^\n]*(?:append|edit|updat)…
       |                             ^
    140|       expect(clause, label).toContain("commentFile");
    141|       expect(clause, label).toMatch(/byte-for-byte|verbatim/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts > renders nonfatal comment fallback friction and attempted delivery gates
AssertionError: bkit-auto/github/claude: expected '- **Comments:** A step\'s `bkit` bloc…' to match /nonfatal|non-fatal|never[^\n]*(?:sto…/i

- Expected:
/nonfatal|non-fatal|never[^\n]*(?:stop|block)|does not[^\n]*(?:stop|block)/i

+ Received:
"- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: \"{OWNER}\", repo: \"{REPO}\", issue_number: {ISSUE_ID}, body: \"{BODY}\" })`; NEVER shorten, reword, or rebuild it. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content."

 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts:154:29
    152|     for (const { body, label } of renderedReportingWorkflows().filter(…
    153|       const clause = commentsClause(body);
    154|       expect(clause, label).toMatch(
       |                             ^
    155|         /nonfatal|non-fatal|never[^\n]*(?:stop|block)|does not[^\n]*(?…
    156|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 4 passed (7)
   Start at  17:33:36
   Duration  8.31s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-xaLwqE/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
