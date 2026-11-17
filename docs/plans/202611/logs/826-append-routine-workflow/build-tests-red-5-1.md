Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 5, attempt 1

Plan: `docs/plans/202611/826-append-routine-workflow-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 13 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "preserves a human correction after lost append recognition and a later report" | red | failure: expected '###### bkit:generated d46779259e31\n#…' to be '###### bkit:generated d46779259e31\n#…' // Object.is equality |
| 14 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps auto startup with PR metadata and dispatch in one progress comment" | red | failure: expected [ Array(2) ] to have a length of 1 but got 2 |
| 15 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "redacts malformed Jira authorization from live probe diagnostics" | red | failure: expected '{"version":1,"stage":"credential","va…' not to contain 'synthetic-jira-prefix-1234' |

## Gaps

None.

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

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts (100 tests | 1 failed) 15001ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 96ms
     ✓ continues after friction and diagnostic writes fail without recursion 86ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 126ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 693ms
   ✓ routine publication policy (8)
     ✓ creates then appends routine sections under explicit invocation ownership 74ms
     ✓ deduplicates known reports using available receipts and bounded markers 77ms
     ✓ appends changed report versions without replacing prior text 73ms
     ✓ classifies attention and terminal reports from structured purpose 95ms
     ✓ rolls over after intervening comments external edits and deletion 100ms
     ✓ starts only new source after overflow or missing source 91ms
     ✓ keeps standalone fallback exact and unassociated calls conservative 44ms
     ✓ uses exact new comment after a failed eligibility read 84ms
   ❯ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 73ms
     ✓ recognizes append success within budget without unnecessary resend 76ms
     × preserves a human correction after lost append recognition and a later report 97ms
     ✓ contains exhausted append and create failures without fabricated success 84ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 102ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 84ms
     ✓ reserves new comment opportunity within total delivery budget 406ms
     ✓ contains preparation state lock and reconciliation exceptions 77ms
     ✓ attempts independent attention after routine uncertainty 123ms
     ✓ seals an acknowledged segment after a postflight intervening comment 88ms
   ✓ trackerTarget (3)
     ✓ github: the issue from the FID, owner/repo from origin 44ms
     ✓ linear and jira: the uppercased key from the FID, plus team / site 68ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 123ms
   ✓ splitAt (7)
     ✓ budgets continuation headers beyond ninety nine parts 2ms
     ✓ refuses aggregation with an unverified provider budget 1ms
     ✓ budgets the entire encoded body at limit and overflow 1ms
     ✓ keeps non BMP code points intact in deterministic parts 1ms
     ✓ keeps a body at the limit whole 1ms
     ✓ splits one over the limit at line breaks; every part generated-marked, labelled, under the limit 1ms
     ✓ hard-splits a single line longer than the limit 1ms
   ✓ progress inspection (11)
     ✓ rejects inconclusive Linear creation order before selecting recent comments 38ms
     ✓ orders Linear comments by creation instant across timestamp offsets 37ms
     ✓ reads Jira ownership evidence and seals HTML or anonymous representations 38ms
     ✓ edits Jira comments with verified preflight evidence 37ms
     ✓ edits by verified comment id through each existing transport 547ms
     ✓ seals unavailable or unstable representation evidence 324ms
     ✓ uses accepted final preflight eligibility without provider atomicity 286ms
     ✓ rejects marker preserving external edits 296ms
     ✓ preserves generated first line and extracts versioned h6 section markers 313ms
     ✓ returns owned comment identity and stable representation evidence 309ms
     ✓ selects newest created comment across complete pages 388ms
   ✓ classification (7)
     ✓ HTTP 401  -> auth 1ms
     ✓ HTTP 403 Resource not accessible by personal access token -> scope 1ms
     ✓ HTTP 403 API rate limit exceeded -> rate-limit 1ms
     ✓ HTTP 404  -> not-found 1ms
     ✓ HTTP 429  -> rate-limit 1ms
     ✓ HTTP 500  -> http-500 1ms
     ✓ network errors: DNS failure, refused connection, timeout 1ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 275ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 286ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 354ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 412ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 465ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 274ms
     ✓ fetches the issue and its comments as GitHub returns them 352ms
   ✓ linear client (4)
     ✓ posts through GraphQL commentCreate with the API key as Authorization 38ms
     ✓ no key -> auth, and fetch is never called 37ms
     ✓ GraphQL errors map by code; DNS failure is network 36ms
     ✓ fetches title, url, state, labels, description and comments 36ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 35ms
     ✓ splits a body over 32,767 characters into consecutive comments 35ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 35ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 35ms
     ✓ pins the Rovo tool names .bkit/trackers.md lists 2ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 310ms
     ✓ caches exact engine source with available progress identity 272ms
     ✓ keeps original body identity separate from time and changed output 308ms
     ✓ reuses matching invocation state without adopting foreign ownership 318ms
     ✓ invalidates missing corrupt and unsupported progress cache 520ms
     ✓ contains cache read and write failures as standalone degradation 369ms
     ✓ uses legacy receipts and contains receipt failures 309ms
     ✓ skips issue-less runs and tracker none 78ms
     ✓ records an engine-action row and skips the same key + body on a re-run 333ms
     ✓ a recent identical comment counts as done (the final close comment) 300ms
     ✓ a failed post reports done false with the reason and never leaks a token 279ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 338ms
     ✓ linear: label ids by name (creating a missing one), then the state by name 39ms
     ✓ linear: a state the team lacks is not-found, after the labels landed 38ms
     ✓ jira: the full label set (keeping labels that are not bkit's), then the matching transition 35ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 316ms
     ✓ a board the token cannot see is scope 287ms
     ✓ an HTTP 403 from gh is scope 265ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 288ms
     ✓ github: no block, no blockers and no further reads 270ms
     ✓ linear: inverse blocks relations; done and canceled are closed 38ms
     ✓ jira: issues linked as 'is blocked by', open unless their status category is done 39ms
   ✓ generated marker hash (2)
     ✓ stamps a bare marker with the 12-hex hash of the rest; other bodies stay as they are 1ms
     ✓ reads the hash from a markdown heading, an HTML h6 and leading blank lines 1ms
   ✓ writeBodyFile (1)
     ✓ writes the body verbatim under the checkout's tmp/ and returns the absolute path 37ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 338ms
     ✓ linear: markdown round-tripped by Linear still dedups on the marker 44ms
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 49ms
     ✓ a different marker hash posts 311ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 305ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 39ms
     ✓ fetchIssue pages comments past the first page 37ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML 37ms
     ✓ an ADF comment or description body reads as text, never a JSON blob 36ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > bounded nonfatal publication > preserves a human correction after lost append recognition and a later report
AssertionError: expected '###### bkit:generated d46779259e31\n#…' to be '###### bkit:generated d46779259e31\n#…' // Object.is equality

- Expected
+ Received

@@ -7,7 +7,10 @@

  ###### bkit:section v1 e6d03334f930ef308037e2002a09080c1f33d35ee80acd4a0a4f491a0f5e0ee5 1/1
  ### ack lost
  exact current 😀 report

- Human correction retained after acknowledgment was lost
+
+ ###### bkit:section v1 5ceed126ee9001ec074890629bbcbd84eb6c084b68848e26e5d72e4003adc83c 1/1
+ ### later routine report
+ exact current 😀 report


 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:639:28
    637|     f.state.loseEditResponse = false;
    638|     expect(await f.publish("later routine report")).toMatchObject({ do…
    639|     expect(corrected.body).toBe(correctedBody);
       |                            ^
    640|     expect(f.state.comments).toHaveLength(2);
    641|     expect(f.state.comments.at(-1)?.body).toBe(f.report("later routine…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 99 passed (100)
   Start at  08:40:57
   Duration  15.21s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-XkOjfj/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tracker.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tracker.integration.test.ts

[test-timeout-budget] load average 2.0 on 10 cores: unit limits 5500ms per test, 11000ms per hook (x1.10)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow

 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts (13 tests | 2 failed) 54967ms
   ❯ workflow comment lifecycle across real CLI processes (13)
     × keeps auto startup with PR metadata and dispatch in one progress comment 1488ms
     × redacts malformed Jira authorization from live probe diagnostics 539ms
     ✓ keeps published build completion and PR links in one terminal comment 3269ms
     ✓ continues after the prepared completion source disappears 1746ms
     ✓ records preparation and session association failures despite successful delivery 1651ms
     ✓ associates startup and run across restart or starts fresh safely 2560ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 7696ms
     ✓ keeps auto and phase progress separate across worktrees 3398ms
     ✓ continues close and cleanup after lost terminal response 2801ms
     ✓ starts fresh progress after cleanup and on a fresh clone 3182ms
     ✓ preserves substantive step results under every comment boundary fault 18304ms
     ✓ keeps clean build progress and completion to two comments 5084ms
     ✓ preserves legacy receipts issue less skips and exact fallback through resume 3246ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > keeps auto startup with PR metadata and dispatch in one progress comment
AssertionError: expected [ Array(2) ] to have a length of 1 but got 2

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:382:31
    380|     ]);
    381|     expect(dispatched.tracker).toMatchObject({ done: true });
    382|     expect(remote().comments).toHaveLength(1);
       |                               ^
    383|     const progress = remote().comments[0]?.body;
    384|     expect(progress).toContain("bkit:progress");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > redacts malformed Jira authorization from live probe diagnostics
AssertionError: expected '{"version":1,"stage":"credential","va…' not to contain 'synthetic-jira-prefix-1234'

- Expected
+ Received

- synthetic-jira-prefix-1234
+ {"version":1,"stage":"credential","value":{"name":"BKIT_GH_TOKEN","present":false}}
+ {"version":1,"stage":"credential","value":{"name":"BKIT_LINEAR_API_KEY","present":false}}
+ {"version":1,"stage":"credential","value":{"name":"BKIT_JIRA_API_KEY","present":true}}
+ {"version":1,"stage":"linear-unavailable","value":{"name":"TrackerError","message":"BKIT_LINEAR_API_KEY is not set"}}
+ {"version":1,"stage":"jira-schema-unavailable","value":{"name":"TypeError","message":"Headers.append: \"Bearer synthetic-jira-prefix-1234\nsynthetic-jira-tail-5678\" is an invalid header value."}}
+ {"version":1,"stage":"jira-unavailable","value":{"name":"TrackerError","message":"fetch failed"}}
+

 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:451:26
    449|     }
    450|     for (const { token, output } of observed) {
    451|       expect(output).not.toContain(token.split("\n")[0]);
       |                          ^
    452|       expect(output).not.toContain(token.split("\n")[1]);
    453|       expect(output).not.toContain("synthetic-jira-");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 11 passed (13)
   Start at  08:41:14
   Duration  55.11s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-YXT27W/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
