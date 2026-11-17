Enforced: true
Red: 18
Accepted: 4
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/826-append-routine-workflow-plan.md`

| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/locks.test.ts` "serializes publication for one target and invocation" | red | failure: expected 'undefined' to be 'function' // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/locks.test.ts` "bounds acquisition and preserves unverifiable owners" | red | failure: expected 'undefined' to be 'function' // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/locks.test.ts` "reclaims only a proven dead matching process identity" | red | failure: expected 'undefined' to be 'function' // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/locks.test.ts` "releases only its delivery token on every exit" | red | failure: expected 'undefined' to be 'function' // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "creates then appends routine sections under explicit invocation ownership" | red | failure: expected 'https://linear.app/issue/ENG-12#comme…' to be 'https://linear.app/issue/ENG-12#comme…' // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "deduplicates known reports using available receipts and bounded markers" | red | failure: expected { done: true, action: 'comment', …(1) } to match object { done: true, deduped: true } (2 matching properties omitted from actual) |
| 5 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "appends changed report versions without replacing prior text" | red | failure: expected [ { id: 'comment-1', …(5) }, …(1) ] to have a length of 1 but got 2 |
| 5 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "classifies attention and terminal reports from structured purpose" | red | failure: expected [ { id: 'comment-1', …(5) }, …(1) ] to have a length of 1 but got 2 |
| 5 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "rolls over after intervening comments external edits and deletion" | red | failure: expected '###### bkit:generated 4bda333e9bb3\n#…' to be '###### bkit:generated 08e2447cb5d8\n#…' // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "starts only new source after overflow or missing source" | passed-accepted | passes; accepted by the tests step: existing postCommentOnce only creates fresh source and falls back to exact standalone bytes after unavailable cached source (tracker.ts:1511-1524) |
| 5 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "keeps standalone fallback exact and unassociated calls conservative" | red | failure: expected '' to match /aggregation.unavailable\|association.…/i |
| 5 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "uses exact new comment after a failed eligibility read" | red | failure: expected '###### bkit:generated 9f0c573364a9\n#…' to be '###### bkit:generated df3451d214e2\n#…' // Object.is equality |
| 6 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "falls back to a new comment after failed or uncertain append" | red | failure: expected [] to have a length of 1 but got +0 |
| 6 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "recognizes append success within budget without unnecessary resend" | red | failure: expected [ { id: 'comment-1', …(5) }, …(1) ] to have a length of 1 but got 2 |
| 6 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "contains exhausted append and create failures without fabricated success" | red | failure: expected false to be true // Object.is equality |
| 6 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "keeps multipart loss and duplicate handling bounded and nonfatal" | passed-accepted | passes; accepted by the tests step: existing postComment splitting, action receipts and classified write failures already satisfy the bounded failed-create/retry case (tracker.ts:1499-1504,1529-1538) |
| 6 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "keeps positive acknowledgment after receipt cache or postflight failure" | passed-accepted | passes; accepted by the tests step: existing postCommentOnce catches receipt/cache writes after acknowledged posting and returns the posted URL (tracker.ts:1539-1576) |
| 6 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "reserves new comment opportunity within total delivery budget" | red | failure: expected '###### bkit:generated 6ff8e05d0806\n#…' to be '###### bkit:generated 348c0082440a\n#…' // Object.is equality |
| 6 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "contains preparation state lock and reconciliation exceptions" | passed-accepted | passes; accepted by the tests step: existing association/cache containment and guarded diagnostic handling preserve exact standalone successful posting (tracker.ts:1491-1524) |
| 6 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "attempts independent attention after routine uncertainty" | red | failure: expected '###### bkit:generated b38132f4691b\n#…' to be '###### bkit:generated e19731409dc6\n#…' // Object.is equality |
| 6 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "seals an acknowledged segment after a postflight intervening comment" | red | failure: expected 'https://linear.app/issue/ENG-12#comme…' to be 'https://linear.app/issue/ENG-12#comme…' // Object.is equality |
| 6 | `.bkit/core/engine/commands/lib.test.ts` "bounds a slow child with an optional deadline and classifies timeout" | red | failure: expected 1032.193167 to be less than 700 |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/locks.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/locks.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/locks.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/locks.test.ts

[test-timeout-budget] load average 16.8 on 10 cores: unit limits 8415ms per test, 16829ms per hook (x1.68)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow

 ❯ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests | 4 failed) 1447ms
   ❯ publication ownership lock (4)
     × serializes publication for one target and invocation 7ms
     × bounds acquisition and preserves unverifiable owners 1ms
     × reclaims only a proven dead matching process identity 1ms
     × releases only its delivery token on every exit 0ms
   ✓ bkit locks acquire --kind=workflow — month bucket (5)
     ✓ takes the feature's existing bucket 62ms
     ✓ ignores other features' buckets, even one sharing the issue digits 56ms
     ✓ refuses a feature split across two buckets and takes no lock 57ms
     ✓ a new feature takes this UTC month, not the local one 60ms
     ✓ --month is used as given 68ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ refuses while the holder's run stepped in the last 30 minutes 62ms
     ✓ reclaims an IN_PROGRESS run idle 30+ minutes 59ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 122ms
     ✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 72ms
     ✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 55ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 110ms
     ✓ reads the feature worktree's status copy before the main checkout's 57ms
   ✓ bkit locks acquire --kind=workflow — ship (1)
     ✓ takes the lock in the main checkout, from the worktree being shipped too 94ms
   ✓ bkit locks acquire — kinds (1)
     ✓ knows only the workflow kind 48ms
   ✓ bkit locks release (5)
     ✓ removes its own lock, by token or by workflow and fid 103ms
     ✓ leaves another owner's lock in place: other workflow, or other token 77ms
     ✓ releases an old-format lock line by workflow name 69ms
     ✓ a missing lock is already released 74ms
     ✓ locks release removes the FID shared-checkout record 131ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > serializes publication for one target and invocation
AssertionError: expected 'undefined' to be 'function' // Object.is equality

Expected: "function"
Received: "undefined"

 ❯ publicationApi .bkit/core/engine/commands/workflow/locks.test.ts:82:26
     80|   const acquire = exported.acquirePublicationLock;
     81|   const release = exported.releasePublicationLock;
     82|   expect(typeof acquire).toBe("function");
       |                          ^
     83|   expect(typeof release).toBe("function");
     84|   if (!isAcquirePublication(acquire) || !isReleasePublication(release))
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts:98:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > bounds acquisition and preserves unverifiable owners
AssertionError: expected 'undefined' to be 'function' // Object.is equality

Expected: "function"
Received: "undefined"

 ❯ publicationApi .bkit/core/engine/commands/workflow/locks.test.ts:82:26
     80|   const acquire = exported.acquirePublicationLock;
     81|   const release = exported.releasePublicationLock;
     82|   expect(typeof acquire).toBe("function");
       |                          ^
     83|   expect(typeof release).toBe("function");
     84|   if (!isAcquirePublication(acquire) || !isReleasePublication(release))
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts:116:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > reclaims only a proven dead matching process identity
AssertionError: expected 'undefined' to be 'function' // Object.is equality

Expected: "function"
Received: "undefined"

 ❯ publicationApi .bkit/core/engine/commands/workflow/locks.test.ts:82:26
     80|   const acquire = exported.acquirePublicationLock;
     81|   const release = exported.releasePublicationLock;
     82|   expect(typeof acquire).toBe("function");
       |                          ^
     83|   expect(typeof release).toBe("function");
     84|   if (!isAcquirePublication(acquire) || !isReleasePublication(release))
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts:136:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > releases only its delivery token on every exit
AssertionError: expected 'undefined' to be 'function' // Object.is equality

Expected: "function"
Received: "undefined"

 ❯ publicationApi .bkit/core/engine/commands/workflow/locks.test.ts:82:26
     80|   const acquire = exported.acquirePublicationLock;
     81|   const release = exported.releasePublicationLock;
     82|   expect(typeof acquire).toBe("function");
       |                          ^
     83|   expect(typeof release).toBe("function");
     84|   if (!isAcquirePublication(acquire) || !isReleasePublication(release))
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts:166:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 19 passed (23)
   Start at  12:34:04
   Duration  1.70s (tests 91%, transform 5%, import 2%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-0pXclx/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tracker.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tracker.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tracker.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tracker.test.ts

[test-timeout-budget] load average 16.4 on 10 cores: unit limits 8181ms per test, 16362ms per hook (x1.64)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts (95 tests | 13 failed) 13080ms
   ❯ routine publication policy (8)
     × creates then appends routine sections under explicit invocation ownership 101ms
     × deduplicates known reports using available receipts and bounded markers 83ms
     × appends changed report versions without replacing prior text 186ms
     × classifies attention and terminal reports from structured purpose 172ms
     × rolls over after intervening comments external edits and deletion 253ms
     ✓ starts only new source after overflow or missing source 270ms
     × keeps standalone fallback exact and unassociated calls conservative 236ms
     × uses exact new comment after a failed eligibility read 219ms
   ❯ bounded nonfatal publication (9)
     × falls back to a new comment after failed or uncertain append 198ms
     × recognizes append success within budget without unnecessary resend 139ms
     × contains exhausted append and create failures without fabricated success 327ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 191ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 106ms
     × reserves new comment opportunity within total delivery budget 84ms
     ✓ contains preparation state lock and reconciliation exceptions 98ms
     × attempts independent attention after routine uncertainty 111ms
     × seals an acknowledged segment after a postflight intervening comment 111ms
   ✓ trackerTarget (3)
     ✓ github: the issue from the FID, owner/repo from origin 85ms
     ✓ linear and jira: the uppercased key from the FID, plus team / site 141ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 216ms
   ✓ splitAt (7)
     ✓ budgets continuation headers beyond ninety nine parts 3ms
     ✓ refuses aggregation with an unverified provider budget 2ms
     ✓ budgets the entire encoded body at limit and overflow 2ms
     ✓ keeps non BMP code points intact in deterministic parts 1ms
     ✓ keeps a body at the limit whole 1ms
     ✓ splits one over the limit at line breaks; every part generated-marked, labelled, under the limit 3ms
     ✓ hard-splits a single line longer than the limit 2ms
   ✓ progress inspection (11)
     ✓ rejects inconclusive Linear creation order before selecting recent comments 62ms
     ✓ orders Linear comments by creation instant across timestamp offsets 69ms
     ✓ reads Jira ownership evidence and seals HTML or anonymous representations 68ms
     ✓ edits Jira comments with verified preflight evidence 72ms
     ✓ edits by verified comment id through each existing transport 720ms
     ✓ seals unavailable or unstable representation evidence 315ms
     ✓ uses accepted final preflight eligibility without provider atomicity 256ms
     ✓ rejects marker preserving external edits 337ms
     ✓ preserves generated first line and extracts versioned h6 section markers 301ms
     ✓ returns owned comment identity and stable representation evidence 336ms
     ✓ selects newest created comment across complete pages 299ms
   ✓ classification (7)
     ✓ HTTP 401  -> auth 2ms
     ✓ HTTP 403 Resource not accessible by personal access token -> scope 1ms
     ✓ HTTP 403 API rate limit exceeded -> rate-limit 1ms
     ✓ HTTP 404  -> not-found 1ms
     ✓ HTTP 429  -> rate-limit 1ms
     ✓ HTTP 500  -> http-500 1ms
     ✓ network errors: DNS failure, refused connection, timeout 1ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 239ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 252ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 276ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 301ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 258ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 218ms
     ✓ fetches the issue and its comments as GitHub returns them 228ms
   ✓ linear client (4)
     ✓ posts through GraphQL commentCreate with the API key as Authorization 38ms
     ✓ no key -> auth, and fetch is never called 36ms
     ✓ GraphQL errors map by code; DNS failure is network 45ms
     ✓ fetches title, url, state, labels, description and comments 37ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 36ms
     ✓ splits a body over 32,767 characters into consecutive comments 37ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 35ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 35ms
     ✓ pins the Rovo tool names .bkit/trackers.md lists 1ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 225ms
     ✓ caches exact engine source with available progress identity 191ms
     ✓ keeps original body identity separate from time and changed output 211ms
     ✓ reuses matching invocation state without adopting foreign ownership 220ms
     ✓ invalidates missing corrupt and unsupported progress cache 373ms
     ✓ contains cache read and write failures as standalone degradation 279ms
     ✓ uses legacy receipts and contains receipt failures 231ms
     ✓ skips issue-less runs and tracker none 76ms
     ✓ records an engine-action row and skips the same key + body on a re-run 223ms
     ✓ a recent identical comment counts as done (the final close comment) 210ms
     ✓ a failed post reports done false with the reason and never leaks a token 209ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 258ms
     ✓ linear: label ids by name (creating a missing one), then the state by name 38ms
     ✓ linear: a state the team lacks is not-found, after the labels landed 35ms
     ✓ jira: the full label set (keeping labels that are not bkit's), then the matching transition 37ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 259ms
     ✓ a board the token cannot see is scope 189ms
     ✓ an HTTP 403 from gh is scope 186ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 216ms
     ✓ github: no block, no blockers and no further reads 201ms
     ✓ linear: inverse blocks relations; done and canceled are closed 41ms
     ✓ jira: issues linked as 'is blocked by', open unless their status category is done 39ms
   ✓ generated marker hash (2)
     ✓ stamps a bare marker with the 12-hex hash of the rest; other bodies stay as they are 1ms
     ✓ reads the hash from a markdown heading, an HTML h6 and leading blank lines 1ms
   ✓ writeBodyFile (1)
     ✓ writes the body verbatim under the checkout's tmp/ and returns the absolute path 52ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 224ms
     ✓ linear: markdown round-tripped by Linear still dedups on the marker 36ms
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 33ms
     ✓ a different marker hash posts 201ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 188ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 41ms
     ✓ fetchIssue pages comments past the first page 31ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML 34ms
     ✓ an ADF comment or description body reads as text, never a JSON blob 31ms

⎯⎯⎯⎯⎯⎯ Failed Tests 13 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > routine publication policy > creates then appends routine sections under explicit invocation ownership
AssertionError: expected 'https://linear.app/issue/ENG-12#comme…' to be 'https://linear.app/issue/ENG-12#comme…' // Object.is equality

Expected: "https://linear.app/issue/ENG-12#comment-1"
Received: "https://linear.app/issue/ENG-12#comment-2"

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:355:39
    353|     const original = soleComment(f).body;
    354|     const second = await f.publish("second");
    355|     expect(requireOutcomeUrl(second)).toBe(requireOutcomeUrl(first));
       |                                       ^
    356|     expect(soleComment(f).body).toContain(original);
    357|     expect(soleComment(f).body).toContain("second");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > routine publication policy > deduplicates known reports using available receipts and bounded markers
AssertionError: expected { done: true, action: 'comment', …(1) } to match object { done: true, deduped: true }
(2 matching properties omitted from actual)

- Expected
+ Received

  {
-   "deduped": true,
    "done": true,
  }

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:375:49
    373|         .join("\n"),
    374|     );
    375|     expect(await f.publish("same", "same-key")).toMatchObject({ done: …
       |                                                 ^
    376|     expect(f.state.requests.filter((r) => r.operation !== "read")).toH…
    377|     expect(f.state.requests.filter((r) => r.operation === "read").leng…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > routine publication policy > appends changed report versions without replacing prior text
AssertionError: expected [ { id: 'comment-1', …(5) }, …(1) ] to have a length of 1 but got 2

- Expected
+ Received

- 1
+ 2

 ❯ soleComment .bkit/core/engine/commands/workflow/tracker.test.ts:322:28
    320|
    321| function soleComment(f: ReturnType<typeof publicationFixture>): Public…
    322|   expect(f.state.comments).toHaveLength(1);
       |                            ^
    323|   const comment = f.state.comments[0];
    324|   if (!comment) throw new Error("expected one delivered comment");
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:385:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > routine publication policy > classifies attention and terminal reports from structured purpose
AssertionError: expected [ { id: 'comment-1', …(5) }, …(1) ] to have a length of 1 but got 2

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:394:30
    392|     await f.publish("failure misleading title", "routine-first");
    393|     await f.publish("Summary", "routine-summary");
    394|     expect(f.state.comments).toHaveLength(1);
       |                              ^
    395|     const old = soleComment(f).body;
    396|     const attention = f.report("routine-looking title");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > routine publication policy > rolls over after intervening comments external edits and deletion
AssertionError: expected '###### bkit:generated 4bda333e9bb3\n#…' to be '###### bkit:generated 08e2447cb5d8\n#…' // Object.is equality

- Expected
+ Received

- ###### bkit:generated 08e2447cb5d8
+ ###### bkit:generated 4bda333e9bb3
+ ###### bkit:progress v1 036eaf59fd4bda2f7dbef5b54eec3482bf7bc66f31fd9526629d750ba828484b 1 1
+ ###### bkit:section v1 5215744ad37b3d58fe4fdf8fa5f3d4720a8e0df7c5cc9277ae63f98725d58a7f 1/1
  ### after external edit
  exact current 😀 report


 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:413:39
    411|     await f.publish("after external edit");
    412|     expect(f.state.comments).toHaveLength(2);
    413|     expect(f.state.comments[1]?.body).toBe(f.report("after external ed…
       |                                       ^
    414|     f.state.comments.push(f.make("human reply", "human"));
    415|     await f.publish("after human");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > routine publication policy > keeps standalone fallback exact and unassociated calls conservative
AssertionError: expected '' to match /aggregation.unavailable|association.…/i

- Expected:
/aggregation.unavailable|association.unavailable/i

+ Received:
""

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:447:29
    445|     await postCommentOnce(f.target, body, options);
    446|     expect(soleComment(f).body).toBe(body);
    447|     expect(logs.join("\n")).toMatch(/aggregation.unavailable|associati…
       |                             ^
    448|     expect(f.state.requests.filter((r) => r.operation === "edit")).toH…
    449|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > routine publication policy > uses exact new comment after a failed eligibility read
AssertionError: expected '###### bkit:generated 9f0c573364a9\n#…' to be '###### bkit:generated df3451d214e2\n#…' // Object.is equality

- Expected
+ Received

- ###### bkit:generated df3451d214e2
+ ###### bkit:generated 9f0c573364a9
+ ###### bkit:progress v1 ed2e7b88e87994c5bd3d6626a4cae6ae2136c14a5fc55ec373487055be8f8da3 1 1
+ ###### bkit:section v1 1d187dd7f47dfd5a16f1c5e0776aa67ffce7a5648564e334a3f0554c97010391 1/1
  ### fallback
  exact current 😀 report


 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:457:43
    455|     await f.publish("fallback");
    456|     expect(f.state.requests.filter((r) => r.operation === "edit")).toH…
    457|     expect(f.state.comments.at(-1)?.body).toBe(f.report("fallback"));
       |                                           ^
    458|     expect(f.state.requests.filter((r) => r.operation === "create")).t…
    459|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > bounded nonfatal publication > falls back to a new comment after failed or uncertain append
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:469:82
    467|     const before = f.state.requests.length;
    468|     expect(await f.publish("fallback")).toMatchObject({ done: true });
    469|     expect(f.state.requests.slice(before).filter((r) => r.operation ==…
       |                                                                                  ^
    470|     expect(f.state.comments.at(-1)?.body).toBe(f.report("fallback"));
    471|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > bounded nonfatal publication > recognizes append success within budget without unnecessary resend
AssertionError: expected [ { id: 'comment-1', …(5) }, …(1) ] to have a length of 1 but got 2

- Expected
+ Received

- 1
+ 2

 ❯ soleComment .bkit/core/engine/commands/workflow/tracker.test.ts:322:28
    320|
    321| function soleComment(f: ReturnType<typeof publicationFixture>): Public…
    322|   expect(f.state.comments).toHaveLength(1);
       |                            ^
    323|   const comment = f.state.comments[0];
    324|   if (!comment) throw new Error("expected one delivered comment");
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:481:44

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > bounded nonfatal publication > contains exhausted append and create failures without fabricated success
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:498:56
    496|     });
    497|     const writes = f.state.requests.slice(before).filter((r) => r.oper…
    498|     expect(writes.some((r) => r.operation === "edit")).toBe(true);
       |                                                        ^
    499|     expect(writes.some((r) => r.operation === "create")).toBe(true);
    500|     expect(writes.length).toBeLessThanOrEqual(3);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > bounded nonfatal publication > reserves new comment opportunity within total delivery budget
AssertionError: expected '###### bkit:generated 6ff8e05d0806\n#…' to be '###### bkit:generated 348c0082440a\n#…' // Object.is equality

- Expected
+ Received

- ###### bkit:generated 348c0082440a
+ ###### bkit:generated 6ff8e05d0806
+ ###### bkit:progress v1 93022cd65474657af621bec2e924871e3d56d267a6fad992c5b27aac9cafba21 1 1
+ ###### bkit:section v1 8e1b82212db42308ede9443eb6a8fab868822446e585064348b546a6f92d05b9 1/1
  ### bounded fallback
  exact current 😀 report


 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:549:43
    547|     expect(calls.filter((r) => r.operation === "create")).toHaveLength…
    548|     expect(calls.filter((r) => r.operation !== "read").length).toBeLes…
    549|     expect(f.state.comments.at(-1)?.body).toBe(f.report("bounded fallb…
       |                                           ^
    550|     expect(calls.every((r) => r.signal !== undefined)).toBe(true);
    551|     const g = progressFixture();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > bounded nonfatal publication > attempts independent attention after routine uncertainty
AssertionError: expected '###### bkit:generated b38132f4691b\n#…' to be '###### bkit:generated e19731409dc6\n#…' // Object.is equality

- Expected
+ Received

- ###### bkit:generated e19731409dc6
+ ###### bkit:generated b38132f4691b
+ ###### bkit:progress v1 94fbdb9f297be4f740c22fad45a814d51d687061074694c57b25ee04ada17e93 1 1
+ ###### bkit:section v1 6b6345dcc128fe1282a62abef0aeda00244b19a9822af7e297890516c1b125ad 1/1
  ### independent failure report
  exact current 😀 report


 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:612:43
    610|       postCommentOnce(f.target, body, f.options("attention", "attentio…
    611|     ).resolves.toMatchObject({ done: true });
    612|     expect(f.state.comments.at(-1)?.body).toBe(body);
       |                                           ^
    613|     const before = f.state.requests.length;
    614|     await f.publish("after attention");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > bounded nonfatal publication > seals an acknowledged segment after a postflight intervening comment
AssertionError: expected 'https://linear.app/issue/ENG-12#comme…' to be 'https://linear.app/issue/ENG-12#comme…' // Object.is equality

Expected: "https://linear.app/issue/ENG-12#comment-1"
Received: "https://linear.app/issue/ENG-12#comment-2"

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:623:65
    621|     const firstUrl = soleComment(f).url;
    622|     f.state.postflightHuman = true;
    623|     expect(requireOutcomeUrl(await f.publish("accepted race"))).toBe(f…
       |                                                                 ^
    624|     expect(f.state.comments).toHaveLength(2);
    625|     expect(f.state.comments[0]?.body).toContain("accepted race");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/13]⎯


 Test Files  1 failed (1)
      Tests  13 failed | 82 passed (95)
   Start at  12:34:08
   Duration  13.42s (tests 98%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-K8xa5M/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/lib.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/lib.test.ts

```

## Runner output — `.bkit/core/engine/commands/lib.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/lib.test.ts

[test-timeout-budget] load average 14.0 on 10 cores: unit limits 7000ms per test, 13999ms per hook (x1.40)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow

 ❯ .bkit/core/engine/commands/lib.test.ts (70 tests | 1 failed) 2220ms
   ✓ parseFlags (20)
     ✓ accepts --flag=value and --flag value, camelCases kebab names 2ms
     ✓ collects repeatable flags and sets booleans 0ms
     ✓ ["--fid=1","--nope=x"] is a usage error 0ms
     ✓ ["--verify-attempt=1"] is a usage error 0ms
     ✓ ["--fid=1","--fid=2"] is a usage error 0ms
     ✓ ["--fid"] is a usage error 0ms
     ✓ ["--fid","--dry-run"] is a usage error 0ms
     ✓ ["--fid=1","--dry-run=yes"] is a usage error 0ms
     ✓ ["467"] is a usage error 0ms
     ✓ ["--fid="] is a usage error 0ms
     ✓ ["--fid",""] is a usage error 0ms
     ✓ rejects an empty entry of a required repeatable flag 0ms
     ✓ keeps an empty value for an optional string flag 0ms
     ✓ fills a positional flag from one bare argument, and only once 0ms
     ✓ fills keys in argv order 0ms
     ✓ refuses a literal workflow placeholder in ["--fid={FID}"] (exit 2) 0ms
     ✓ refuses a literal workflow placeholder in ["--fid=1","--artifact=docs/plans/{YYYYMM}/x.md"] (exit 2) 0ms
     ✓ refuses a literal workflow placeholder in ["--fid","{LOCK_TOKEN}"] (exit 2) 0ms
     ✓ refuses a placeholder in a positional argument 0ms
     ✓ lets through braces that are not an upper-case placeholder 0ms
   ✓ runCommand (18)
     ✓ returns null for anything that is not a registered noun 0ms
     ✓ runs a verb: text on stdout, tagged log on stderr 0ms
     ✓ prints one JSON object with --json 0ms
     ✓ leaves a verb's textOmit keys out of text and keeps them in --json 0ms
     ✓ passes the verb's own exit code through 0ms
     ✓ maps a usage error to exit 2 with a tagged message 0ms
     ✓ maps a CommandError to its code 0ms
     ✓ passes the command's exit code through when the journal write throws 0ms
     ✓ logs one [bkit-telemetry] line when the journal throws, however many writes fail 0ms
     ✓ hands the journal the failure only for an undeclared exit 1ms
     ✓ refuses a second JSON object 0ms
     ✓ prints noun help: exit 0 for --help, exit 2 for no verb 0ms
     ✓ rejects an unknown verb 0ms
     ✓ prints verb help without running the verb 0ms
     ✓ leaves a classic verb alone unless the second word is one of the command's verbs 0ms
     ✓ still answers `--help` for a noun that is also a classic verb 0ms
     ✓ takes the global --json flag on any verb, sets ctx.json and prints JSON 0ms
     ✓ refuses --json with a value 0ms
   ✓ --json on every registered command (3)
     ✓ no verb declares its own --json flag 0ms
     ✓ every verb's flag parsing accepts --json 2ms
     ✓ every verb's text output reads back as its --json output, less its textOmit keys 9ms
   ✓ help (3)
     ✓ noun help lists every verb and the shared exit codes 0ms
     ✓ verb help lists flags with required / repeatable, output keys, and own exit codes 0ms
     ✓ verb help marks the keys text output leaves out 0ms
   ✓ ghUnavailable (2)
     ✓ hands off when gh is missing, not logged in, or answered HTTP 403 0ms
     ✓ keeps every other failure, and any success, with gh 0ms
   ✓ utcMonth (1)
     ✓ uses UTC, not local time, at a month boundary 0ms
   ✓ SKIP_CI_TOKEN (9)
     ✓ matches [skip ci] 0ms
     ✓ matches [ci skip] 0ms
     ✓ matches [no ci] 0ms
     ✓ matches [skip actions] 0ms
     ✓ matches [actions skip] 0ms
     ✓ matches [SKIP CI] 0ms
     ✓ does not match skip ci 0ms
     ✓ does not match [skip-ci] 0ms
     ✓ does not match [force full] 0ms
   ✓ repo facts on a real repository (4)
     ✓ repoRoot resolves the main checkout from inside a linked worktree 94ms
     ✓ repoRoot outside a repository is a usage error 7ms
     ✓ design / plan / build / debug: worktree copy when it exists, else the main checkout 78ms
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 90ms
   ❯ runGit / runTool output limit (6)
     × bounds a slow child with an optional deadline and classifies timeout 1035ms
     ✓ runGit keeps output past Node's 1MB default 33ms
     ✓ runGit names ENOBUFS when output passes the limit 389ms
     ✓ runGit names a spawn error instead of failing silently 4ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 380ms
     ✓ runTool still reports a missing binary as not found 2ms
   ✓ resolveActiveRun (4)
     ✓ resolveActiveRun falls back to the cwd scan when --file names a non-status file 21ms
     ✓ still takes a status.jsonl --file as the run itself 15ms
     ✓ never files a --fid call under another feature's in-progress run 25ms
     ✓ finds a --fid run that started in an earlier month through the scan 25ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/lib.test.ts > runGit / runTool output limit > bounds a slow child with an optional deadline and classifies timeout
AssertionError: expected 1032.193167 to be less than 700
 ❯ .bkit/core/engine/commands/lib.test.ts:709:41
    707|     const options = { input: undefined, timeoutMs: 80 };
    708|     const result = runTool(process.execPath, ["-e", code], cwd, option…
    709|     expect(performance.now() - started).toBeLessThan(700);
       |                                         ^
    710|     expect(result.found).toBe(true);
    711|     expect(result.status).not.toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 69 passed (70)
   Start at  12:34:23
   Duration  2.57s (tests 89%, transform 5%, import 5%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-E6G07N/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
