Enforced: true
Red: 3
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 3

Plan: `docs/plans/202611/826-append-routine-workflow-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "edits by verified comment id through each existing transport" | red | failure: expected [ Array(1) ] to deeply equal [ Array(1) ] |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "seals unavailable or unstable representation evidence" | red | failure: expected { id: '101', authorId: '7', …(5) } to be undefined |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "uses accepted final preflight eligibility without provider atomicity" | passed-accepted | passes; accepted by the tests step: recentComments returns complete numeric identity, author and returned-body revision evidence without an ETag or provider atomicity field, and retains a null stable author ID for login-only ownership. This is adapter evidence coverage; publisher authorization remains Task 5's work. |
| 2 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "refuses aggregation with an unverified provider budget" | red | failure: expected [ …(4) ] to deeply equal [ Array(1) ] |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tracker.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tracker.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tracker.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tracker.test.ts

[test-timeout-budget] load average 45.2 on 10 cores: unit limits 22609ms per test, 45218ms per hook (x4.52)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts (73 tests | 3 failed) 24801ms
   ✓ trackerTarget (3)
     ✓ github: the issue from the FID, owner/repo from origin 121ms
     ✓ linear and jira: the uppercased key from the FID, plus team / site 302ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 459ms
   ❯ splitAt (6)
     × refuses aggregation with an unverified provider budget 17ms
     ✓ budgets the entire encoded body at limit and overflow 2ms
     ✓ keeps non BMP code points intact in deterministic parts 2ms
     ✓ keeps a body at the limit whole 2ms
     ✓ splits one over the limit at line breaks; every part generated-marked, labelled, under the limit 2ms
     ✓ hard-splits a single line longer than the limit 34ms
   ❯ progress inspection (7)
     × edits by verified comment id through each existing transport 601ms
     × seals unavailable or unstable representation evidence 1750ms
     ✓ uses accepted final preflight eligibility without provider atomicity 509ms
     ✓ rejects marker preserving external edits 409ms
     ✓ preserves generated first line and extracts versioned h6 section markers 450ms
     ✓ returns owned comment identity and stable representation evidence 704ms
     ✓ selects newest created comment across complete pages 565ms
   ✓ classification (7)
     ✓ HTTP 401  -> auth 2ms
     ✓ HTTP 403 Resource not accessible by personal access token -> scope 2ms
     ✓ HTTP 403 API rate limit exceeded -> rate-limit 2ms
     ✓ HTTP 404  -> not-found 2ms
     ✓ HTTP 429  -> rate-limit 1ms
     ✓ HTTP 500  -> http-500 1ms
     ✓ network errors: DNS failure, refused connection, timeout 1ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 373ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 461ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 365ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 694ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 481ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 447ms
     ✓ fetches the issue and its comments as GitHub returns them 507ms
   ✓ linear client (4)
     ✓ posts through GraphQL commentCreate with the API key as Authorization 112ms
     ✓ no key -> auth, and fetch is never called 80ms
     ✓ GraphQL errors map by code; DNS failure is network 95ms
     ✓ fetches title, url, state, labels, description and comments 117ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 227ms
     ✓ splits a body over 32,767 characters into consecutive comments 201ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 112ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 109ms
     ✓ pins the Rovo tool names .bkit/trackers.md lists 4ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 419ms
     ✓ caches exact engine source with available progress identity 823ms
     ✓ keeps original body identity separate from time and changed output 1163ms
     ✓ reuses matching invocation state without adopting foreign ownership 917ms
     ✓ invalidates missing corrupt and unsupported progress cache 1505ms
     ✓ contains cache read and write failures as standalone degradation 776ms
     ✓ uses legacy receipts and contains receipt failures 584ms
     ✓ skips issue-less runs and tracker none 252ms
     ✓ records an engine-action row and skips the same key + body on a re-run 669ms
     ✓ a recent identical comment counts as done (the final close comment) 639ms
     ✓ a failed post reports done false with the reason and never leaks a token 417ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 566ms
     ✓ linear: label ids by name (creating a missing one), then the state by name 101ms
     ✓ linear: a state the team lacks is not-found, after the labels landed 105ms
     ✓ jira: the full label set (keeping labels that are not bkit's), then the matching transition 72ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 708ms
     ✓ a board the token cannot see is scope 825ms
     ✓ an HTTP 403 from gh is scope 415ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 551ms
     ✓ github: no block, no blockers and no further reads 424ms
     ✓ linear: inverse blocks relations; done and canceled are closed 149ms
     ✓ jira: issues linked as 'is blocked by', open unless their status category is done 116ms
   ✓ generated marker hash (2)
     ✓ stamps a bare marker with the 12-hex hash of the rest; other bodies stay as they are 4ms
     ✓ reads the hash from a markdown heading, an HTML h6 and leading blank lines 5ms
   ✓ writeBodyFile (1)
     ✓ writes the body verbatim under the checkout's tmp/ and returns the absolute path 110ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 618ms
     ✓ linear: markdown round-tripped by Linear still dedups on the marker 96ms
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 146ms
     ✓ a different marker hash posts 405ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 459ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 94ms
     ✓ fetchIssue pages comments past the first page 110ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML 120ms
     ✓ an ADF comment or description body reads as text, never a JSON blob 108ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > splitAt > refuses aggregation with an unverified provider budget
AssertionError: expected [ …(4) ] to deeply equal [ Array(1) ]

- Expected
+ Received

  [
    "###### bkit:generated a7e0f4a3cea4
- 😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀",
+ _(part 1/4)_
+ 😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀",
+   "###### bkit:generated a7e0f4a3cea4
+ _(part 2/4)_
+ 😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀",
+   "###### bkit:generated a7e0f4a3cea4
+ _(part 3/4)_
+ 😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀",
+   "###### bkit:generated a7e0f4a3cea4
+ _(part 4/4)_
+ 😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀",
  ]

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:285:58
    283|       splitAt;
    284|     const body = stampMarker(`###### bkit:generated\n${"😀".repeat(100…
    285|     expect(render(body, 101, { verifiedBudget: false })).toEqual([body…
       |                                                          ^
    286|     expect(render(body, 101, { verifiedBudget: true }).length).toBeGre…
    287|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > progress inspection > edits by verified comment id through each existing transport
AssertionError: expected [ Array(1) ] to deeply equal [ Array(1) ]

- Expected
+ Received

  [
-   "api repos/o/r/issues/comments/101 --method PATCH --input -",
+   "api repos/o/r/issues/12/comments --method POST --input -",
  ]

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:365:24
    363|       commentId: "101",
    364|     });
    365|     expect(gh.calls()).toEqual(["api repos/o/r/issues/comments/101 --m…
       |                        ^
    366|     expect(JSON.parse(gh.stdin(1))).toEqual({ body });
    367|     expect(edited.evidence).toMatchObject({ id: "101", fingerprint: ac…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > progress inspection > seals unavailable or unstable representation evidence
AssertionError: expected { id: '101', authorId: '7', …(5) } to be undefined

- Expected:
undefined

+ Received:
{
  "authorId": "7",
  "createdAt": "2026-11-01T01:01:00Z",
  "fingerprint": "3ad35073f2ce0139b78bf4b45da0118c2d1559400a012655a4516fc4add1ca89",
  "id": "101",
  "representation": "markdown",
  "sectionIds": [],
  "updatedAt": "not-a-timestamp",
}

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:442:38
    440|       const inspected = await recentComments(f.target, 1);
    441|       expect(inspected).toHaveLength(1);
    442|       expect(inspected[0]?.evidence).toBeUndefined();
       |                                      ^
    443|     }
    444|     expect(gh.calls().every((call) => !call.includes("--method PATCH")…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 70 passed (73)
   Start at  11:37:45
   Duration  25.55s (tests 98%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-0eCsVm/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
