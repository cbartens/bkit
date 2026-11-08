Enforced: true
Red: 0
Accepted: 0
Updated: 0
Gaps: 4

<!-- verdict:end -->

# Tests Red — group 1, attempt 2

Plan: `docs/plans/202611/826-append-routine-workflow-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "edits by verified comment id through each existing transport" | missing | "edits by verified comment id through each existing transport" did not run; the report holds "trackerTarget > github: the issue from the FID, owner/repo from origin", "trackerTarget > linear and jira: the uppercased key from the FID, plus team / site", "trackerTarget > an explicit --issue wins (# stripped); an issue-less FID gives no issue", "splitAt > budgets the entire encoded body at limit and overflow", "splitAt > keeps non BMP code points intact in deterministic parts", … |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "seals unavailable or unstable representation evidence" | missing | "seals unavailable or unstable representation evidence" did not run; the report holds "trackerTarget > github: the issue from the FID, owner/repo from origin", "trackerTarget > linear and jira: the uppercased key from the FID, plus team / site", "trackerTarget > an explicit --issue wins (# stripped); an issue-less FID gives no issue", "splitAt > budgets the entire encoded body at limit and overflow", "splitAt > keeps non BMP code points intact in deterministic parts", … |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "uses accepted final preflight eligibility without provider atomicity" | missing | "uses accepted final preflight eligibility without provider atomicity" did not run; the report holds "trackerTarget > github: the issue from the FID, owner/repo from origin", "trackerTarget > linear and jira: the uppercased key from the FID, plus team / site", "trackerTarget > an explicit --issue wins (# stripped); an issue-less FID gives no issue", "splitAt > budgets the entire encoded body at limit and overflow", "splitAt > keeps non BMP code points intact in deterministic parts", … |
| 2 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "refuses aggregation with an unverified provider budget" | missing | "refuses aggregation with an unverified provider budget" did not run; the report holds "trackerTarget > github: the issue from the FID, owner/repo from origin", "trackerTarget > linear and jira: the uppercased key from the FID, plus team / site", "trackerTarget > an explicit --issue wins (# stripped); an issue-less FID gives no issue", "splitAt > budgets the entire encoded body at limit and overflow", "splitAt > keeps non BMP code points intact in deterministic parts", … |

## Gaps

- TASK 1 `.bkit/core/engine/commands/workflow/tracker.test.ts` "edits by verified comment id through each existing transport" `missing` — "edits by verified comment id through each existing transport" did not run; the report holds "trackerTarget > github: the issue from the FID, owner/repo from origin", "trackerTarget > linear and jira: the uppercased key from the FID, plus team / site", "trackerTarget > an explicit --issue wins (# stripped); an issue-less FID gives no issue", "splitAt > budgets the entire encoded body at limit and overflow", "splitAt > keeps non BMP code points intact in deterministic parts", …
- TASK 1 `.bkit/core/engine/commands/workflow/tracker.test.ts` "seals unavailable or unstable representation evidence" `missing` — "seals unavailable or unstable representation evidence" did not run; the report holds "trackerTarget > github: the issue from the FID, owner/repo from origin", "trackerTarget > linear and jira: the uppercased key from the FID, plus team / site", "trackerTarget > an explicit --issue wins (# stripped); an issue-less FID gives no issue", "splitAt > budgets the entire encoded body at limit and overflow", "splitAt > keeps non BMP code points intact in deterministic parts", …
- TASK 1 `.bkit/core/engine/commands/workflow/tracker.test.ts` "uses accepted final preflight eligibility without provider atomicity" `missing` — "uses accepted final preflight eligibility without provider atomicity" did not run; the report holds "trackerTarget > github: the issue from the FID, owner/repo from origin", "trackerTarget > linear and jira: the uppercased key from the FID, plus team / site", "trackerTarget > an explicit --issue wins (# stripped); an issue-less FID gives no issue", "splitAt > budgets the entire encoded body at limit and overflow", "splitAt > keeps non BMP code points intact in deterministic parts", …
- TASK 2 `.bkit/core/engine/commands/workflow/tracker.test.ts` "refuses aggregation with an unverified provider budget" `missing` — "refuses aggregation with an unverified provider budget" did not run; the report holds "trackerTarget > github: the issue from the FID, owner/repo from origin", "trackerTarget > linear and jira: the uppercased key from the FID, plus team / site", "trackerTarget > an explicit --issue wins (# stripped); an issue-less FID gives no issue", "splitAt > budgets the entire encoded body at limit and overflow", "splitAt > keeps non BMP code points intact in deterministic parts", …

## Lint output — `.bkit/core/engine/commands/workflow/tracker.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tracker.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tracker.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tracker.test.ts

[test-timeout-budget] load average 69.8 on 10 cores: unit limits 30000ms per test, 60000ms per hook (x6.00)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts (69 tests | 11 failed) 49821ms
   ✓ trackerTarget (3)
     ✓ github: the issue from the FID, owner/repo from origin 137ms
     ✓ linear and jira: the uppercased key from the FID, plus team / site 237ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 441ms
   ❯ splitAt (5)
     ✓ budgets the entire encoded body at limit and overflow 3ms
     × keeps non BMP code points intact in deterministic parts 36ms
     ✓ keeps a body at the limit whole 5ms
     ✓ splits one over the limit at line breaks; every part generated-marked, labelled, under the limit 2ms
     ✓ hard-splits a single line longer than the limit 5ms
   ❯ progress inspection (4)
     × rejects marker preserving external edits 1798ms
     × preserves generated first line and extracts versioned h6 section markers 2596ms
     × returns owned comment identity and stable representation evidence 2760ms
     × selects newest created comment across complete pages 3075ms
   ✓ classification (7)
     ✓ HTTP 401  -> auth 3ms
     ✓ HTTP 403 Resource not accessible by personal access token -> scope 2ms
     ✓ HTTP 403 API rate limit exceeded -> rate-limit 4ms
     ✓ HTTP 404  -> not-found 2ms
     ✓ HTTP 429  -> rate-limit 2ms
     ✓ HTTP 500  -> http-500 1ms
     ✓ network errors: DNS failure, refused connection, timeout 2ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 2922ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 2843ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 2206ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 2212ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 2287ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 2430ms
     ✓ fetches the issue and its comments as GitHub returns them 2038ms
   ✓ linear client (4)
     ✓ posts through GraphQL commentCreate with the API key as Authorization 116ms
     ✓ no key -> auth, and fetch is never called 130ms
     ✓ GraphQL errors map by code; DNS failure is network 103ms
     ✓ fetches title, url, state, labels, description and comments 86ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 94ms
     ✓ splits a body over 32,767 characters into consecutive comments 173ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 73ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 102ms
     ✓ pins the Rovo tool names .bkit/trackers.md lists 4ms
   ❯ postCommentOnce (11)
     × reuses original section time without changing duplicate identity 1943ms
     × caches exact engine source with available progress identity 1800ms
     × keeps original body identity separate from time and changed output 1597ms
     × reuses matching invocation state without adopting foreign ownership 572ms
     × invalidates missing corrupt and unsupported progress cache 1319ms
     × contains cache read and write failures as standalone degradation 665ms
     ✓ uses legacy receipts and contains receipt failures 892ms
     ✓ skips issue-less runs and tracker none 377ms
     ✓ records an engine-action row and skips the same key + body on a re-run 745ms
     ✓ a recent identical comment counts as done (the final close comment) 626ms
     ✓ a failed post reports done false with the reason and never leaks a token 1110ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 785ms
     ✓ linear: label ids by name (creating a missing one), then the state by name 116ms
     ✓ linear: a state the team lacks is not-found, after the labels landed 190ms
     ✓ jira: the full label set (keeping labels that are not bkit's), then the matching transition 125ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 1126ms
     ✓ a board the token cannot see is scope 650ms
     ✓ an HTTP 403 from gh is scope 711ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 770ms
     ✓ github: no block, no blockers and no further reads 701ms
     ✓ linear: inverse blocks relations; done and canceled are closed 113ms
     ✓ jira: issues linked as 'is blocked by', open unless their status category is done 195ms
   ✓ generated marker hash (2)
     ✓ stamps a bare marker with the 12-hex hash of the rest; other bodies stay as they are 3ms
     ✓ reads the hash from a markdown heading, an HTML h6 and leading blank lines 1ms
   ✓ writeBodyFile (1)
     ✓ writes the body verbatim under the checkout's tmp/ and returns the absolute path 190ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 636ms
     ✓ linear: markdown round-tripped by Linear still dedups on the marker 252ms
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 215ms
     ✓ a different marker hash posts 978ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 817ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 129ms
     ✓ fetchIssue pages comments past the first page 233ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML 155ms
     ✓ an ADF comment or description body reads as text, never a JSON blob 150ms

⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > splitAt > keeps non BMP code points intact in deterministic parts
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:300:56
    298|     expect(parts.length).toBeGreaterThan(1);
    299|     expect(parts.every((part) => part.length <= 101)).toBe(true);
    300|     expect(parts.every((part) => part.isWellFormed())).toBe(true);
       |                                                        ^
    301|     expect(parts.map((part) => part.split("\n").slice(2).join("\n")).j…
    302|     expect(splitAt(body, 101)).toEqual(parts);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > progress inspection > rejects marker preserving external edits
AssertionError: expected [ …(2) ] to include '3ad35073f2ce0139b78bf4b45da0118c2d155…'
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:364:33
    362|     const edited = await recentComments(f.target, 1);
    363|     expect(markerHashOf(original[0]!.body)).toBe(markerHashOf(edited[0…
    364|     expect(stringsOf(original)).toContain(actionHash(f.body));
       |                                 ^
    365|     expect(stringsOf(edited)).toContain(actionHash(editedBody));
    366|     expect(stringsOf(edited)).not.toContain(actionHash(f.body));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > progress inspection > preserves generated first line and extracts versioned h6 section markers
AssertionError: expected [ …(2) ] to include '74a739086408ebb36991b940dd89c27fb1abe…'
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:402:34
    400|     const inspected = await recentComments(f.target, 1);
    401|     expect(inspected[0]?.body.split("\n")[0]).toBe(body.split("\n")[0]…
    402|     expect(stringsOf(inspected)).toContain(section);
       |                                  ^
    403|     expect(markerHashOf(body)).toMatch(/^[a-f0-9]{12}$/);
    404|     expect(markerHashOf(`<h6>bkit:generated ${markerHashOf(body)}</h6>…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > progress inspection > returns owned comment identity and stable representation evidence
AssertionError: expected [ …(2) ] to include '101'
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:413:28
    411|     const githubResult = await postComment(f.target, f.body);
    412|     const githubEvidence = stringsOf(githubResult);
    413|     expect(githubEvidence).toContain("101");
       |                            ^
    414|     expect(githubEvidence).toContain("7");
    415|     expect(githubEvidence).toContain(actionHash(f.body));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > progress inspection > selects newest created comment across complete pages
AssertionError: expected [ 'comment 2', 'comment 3', …(98) ] to deeply equal [ 'older but edited later', …(100) ]

- Expected
+ Received

@@ -1,7 +1,6 @@
  [
-   "older but edited later",
    "comment 2",
    "comment 3",
    "comment 4",
    "comment 5",
    "comment 6",

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:491:53
    489|     );
    490|     const comments = await recentComments(target, 101);
    491|     expect(comments.map((comment) => comment.body)).toEqual([
       |                                                     ^
    492|       older.body,
    493|       ...newer.map((c) => c.body),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > postCommentOnce > reuses original section time without changing duplicate identity
AssertionError: expected '###### bkit:generated e0b24d1a0759\n#…' to match /2026-11-01[T ]01:02:03(?:\.000)?(?:Z|…/

- Expected:
/2026-11-01[T ]01:02:03(?:\.000)?(?:Z| UTC)/

+ Received:
"###### bkit:generated e0b24d1a0759
### Step 7 — Plan Execute
exact 😀 source
"

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:812:28
    810|     const firstWrite = gh.calls().findIndex((call) => call.includes("-…
    811|     const submitted: { body: string } = JSON.parse(gh.stdin(firstWrite…
    812|     expect(submitted.body).toMatch(/2026-11-01[T ]01:02:03(?:\.000)?(?…
       |                            ^
    813|     expect(alreadyDone(f.file, f.options.key!, actionHash(f.body))?.re…
    814|     fs.appendFileSync(f.file, `${JSON.stringify({ ...completed, at: "2…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > postCommentOnce > caches exact engine source with available progress identity
AssertionError: expected 0 to be greater than 0
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:828:26
    826|     expect(await postCommentOnce(f.target, f.body, f.options)).toMatch…
    827|     const files = progressFiles(f.cwd);
    828|     expect(files.length).toBeGreaterThan(0);
       |                          ^
    829|     const values = files.flatMap((file) => stringsOf(JSON.parse(fs.rea…
    830|     const firstWrite = gh.calls().findIndex((call) => call.includes("-…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > postCommentOnce > keeps original body identity separate from time and changed output
AssertionError: expected 0 to be greater than 0
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:845:26
    843|     await postCommentOnce(f.target, f.body, f.options);
    844|     const files = progressFiles(f.cwd);
    845|     expect(files.length).toBeGreaterThan(0);
       |                          ^
    846|     const original = files.map((file) => fs.readFileSync(file, "utf-8"…
    847|     expect(await postCommentOnce(f.target, f.body, f.options)).toMatch…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > postCommentOnce > reuses matching invocation state without adopting foreign ownership
AssertionError: expected 0 to be greater than 0
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:859:41
    857|     const f = progressFixture();
    858|     await postCommentOnce(f.target, f.body, f.options);
    859|     expect(progressFiles(f.cwd).length).toBeGreaterThan(0);
       |                                         ^
    860|     expect(await postCommentOnce(f.target, f.body, f.options)).toMatch…
    861|     const otherTarget = trackerTarget(f.cwd, { issue: "13", fid: "13-p…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > postCommentOnce > invalidates missing corrupt and unsupported progress cache
AssertionError: expected 0 to be greater than 0
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:883:33
    881|     const corruptFiles = progressFiles(corrupt.cwd);
    882|     const unsupportedFiles = progressFiles(unsupported.cwd);
    883|     expect(missingFiles.length).toBeGreaterThan(0);
       |                                 ^
    884|     expect(corruptFiles.length).toBeGreaterThan(0);
    885|     expect(unsupportedFiles.length).toBeGreaterThan(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > postCommentOnce > contains cache read and write failures as standalone degradation
AssertionError: expected 0 to be greater than 0
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:926:26
    924|     await postCommentOnce(f.target, f.body, f.options);
    925|     const files = progressFiles(f.cwd);
    926|     expect(files.length).toBeGreaterThan(0);
       |                          ^
    927|     files.forEach((file) => {
    928|       fs.unlinkSync(file);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/11]⎯


 Test Files  1 failed (1)
      Tests  11 failed | 58 passed (69)
   Start at  08:58:41
   Duration  51.20s (tests 98%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fL96FS/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
