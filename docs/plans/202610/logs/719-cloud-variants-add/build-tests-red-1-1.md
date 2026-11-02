Enforced: true
Red: 10
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "github fetch marks a closed issue terminal and an open one not" | red | failure: expected undefined to be true // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "linear fetch marks a completed state renamed Shipped terminal" | red | failure: expected undefined to be true // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "linear fetch marks a canceled state terminal and a started state not" | red | failure: expected undefined to be true // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "jira fetch marks a done-category status renamed Shipped terminal and an indeterminate one not" | red | failure: expected undefined to be true // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "fetch prints terminal in its facts and in issue-facts.json" | red | failure: expected undefined to be true // Object.is equality |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "github issue without bkit:auto stops the Cursor background session" | red | failure: expected '[bkit] Required reading before any ot…' to contain 'bkit:auto' |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "github closed issue stops the session and an open labelled one passes" | red | failure: expected 1 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "github read failure stops the session naming the tracker and the reason" | red | failure: expected '[bkit] Required reading before any ot…' to match /github.*(could not\|failed)/i |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "linear completed state renamed Shipped stops the session" | red | failure: expected +0 to be 1 // Object.is equality |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "generated Claude and Cursor hooks carry the one preflight-tracker.sh part" | red | failure: expected false to be true // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tracker.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tracker.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tracker.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tracker.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts (60 tests | 4 failed) 4486ms
   ✓ trackerTarget (3)
     ✓ github: the issue from the FID, owner/repo from origin 45ms
     ✓ linear and jira: the uppercased key from the FID, plus team / site 63ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 136ms
   ✓ splitAt (3)
     ✓ keeps a body at the limit whole 1ms
     ✓ splits one over the limit at line breaks; every part generated-marked, labelled, under the limit 1ms
     ✓ hard-splits a single line longer than the limit 1ms
   ✓ classification (7)
     ✓ HTTP 401  -> auth 1ms
     ✓ HTTP 403 Resource not accessible by personal access token -> scope 1ms
     ✓ HTTP 403 API rate limit exceeded -> rate-limit 1ms
     ✓ HTTP 404  -> not-found 1ms
     ✓ HTTP 429  -> rate-limit 1ms
     ✓ HTTP 500  -> http-500 1ms
     ✓ network errors: DNS failure, refused connection, timeout 1ms
   ❯ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 210ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 160ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 157ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 149ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 170ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 191ms
     ✓ fetches the issue and its comments as GitHub returns them 175ms
     × github fetch marks a closed issue terminal and an open one not 163ms
   ❯ linear client (6)
     × linear fetch marks a completed state renamed Shipped terminal 41ms
     × linear fetch marks a canceled state terminal and a started state not 33ms
     ✓ posts through GraphQL commentCreate with the API key as Authorization 31ms
     ✓ no key -> auth, and fetch is never called 30ms
     ✓ GraphQL errors map by code; DNS failure is network 31ms
     ✓ fetches title, url, state, labels, description and comments 30ms
   ❯ jira client (MCP over HTTP) (6)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 32ms
     ✓ splits a body over 32,767 characters into consecutive comments 34ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 32ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 33ms
     × jira fetch marks a done-category status renamed Shipped terminal and an indeterminate one not 32ms
     ✓ pins the Rovo tool names .bkit/trackers.md lists 1ms
   ✓ postCommentOnce (4)
     ✓ skips issue-less runs and tracker none 68ms
     ✓ records an engine-action row and skips the same key + body on a re-run 199ms
     ✓ a recent identical comment counts as done (the final close comment) 170ms
     ✓ a failed post reports done false with the reason and never leaks a token 150ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 174ms
     ✓ linear: label ids by name (creating a missing one), then the state by name 32ms
     ✓ linear: a state the team lacks is not-found, after the labels landed 31ms
     ✓ jira: the full label set (keeping labels that are not bkit's), then the matching transition 30ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 194ms
     ✓ a board the token cannot see is scope 158ms
     ✓ an HTTP 403 from gh is scope 150ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 171ms
     ✓ github: no block, no blockers and no further reads 154ms
     ✓ linear: inverse blocks relations; done and canceled are closed 37ms
     ✓ jira: issues linked as 'is blocked by', open unless their status category is done 34ms
   ✓ generated marker hash (2)
     ✓ stamps a bare marker with the 12-hex hash of the rest; other bodies stay as they are 1ms
     ✓ reads the hash from a markdown heading, an HTML h6 and leading blank lines 1ms
   ✓ writeBodyFile (1)
     ✓ writes the body verbatim under the checkout's tmp/ and returns the absolute path 30ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 203ms
     ✓ linear: markdown round-tripped by Linear still dedups on the marker 35ms
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 31ms
     ✓ a different marker hash posts 161ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 159ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 36ms
     ✓ fetchIssue pages comments past the first page 30ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML 31ms
     ✓ an ADF comment or description body reads as text, never a JSON blob 29ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > github client > github fetch marks a closed issue terminal and an open one not
AssertionError: expected undefined to be true // Object.is equality

- Expected:
true

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:323:57
    321|     gh.resp("repos/o/r/issues/12/comments?per_page=100", "");
    322|     const closed = await fetchIssue(trackerTarget(github(), { fid: "12…
    323|     expect((closed as { terminal?: boolean }).terminal).toBe(true);
       |                                                         ^
    324|     gh.resp("repos/o/r/issues/12", reply("open"));
    325|     const open = await fetchIssue(trackerTarget(github(), { fid: "12-x…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > linear client > linear fetch marks a completed state renamed Shipped terminal
AssertionError: expected undefined to be true // Object.is equality

- Expected:
true

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:355:56
    353|     const issue = await fetchIssue(trackerTarget(linear(), { fid: "eng…
    354|     expect(issue.state).toBe("Shipped");
    355|     expect((issue as { terminal?: boolean }).terminal).toBe(true);
       |                                                        ^
    356|   });
    357|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > linear client > linear fetch marks a canceled state terminal and a started state not
AssertionError: expected undefined to be true // Object.is equality

- Expected:
true

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:362:72
    360|     const calls = stubFetch(linearReply("Dropped", "canceled"), linear…
    361|     const t = trackerTarget(linear(), { fid: "eng-4-x" });
    362|     expect(((await fetchIssue(t)) as { terminal?: boolean }).terminal)…
       |                                                                        ^
    363|     expect(((await fetchIssue(t)) as { terminal?: boolean }).terminal)…
    364|     expect(String(bodyOf(calls[0]!.init).query)).toMatch(/state \{[^}]…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > jira client (MCP over HTTP) > jira fetch marks a done-category status renamed Shipped terminal and an indeterminate one not
AssertionError: expected undefined to be true // Object.is equality

- Expected:
true

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:550:72
    548|     jiraMcp(issueOf("Shipped", "done"), empty);
    549|     const t = trackerTarget(jira(), { fid: "proj-9-x" });
    550|     expect(((await fetchIssue(t)) as { terminal?: boolean }).terminal)…
       |                                                                        ^
    551|     jiraMcp(issueOf("Done", "indeterminate"), empty);
    552|     expect(((await fetchIssue(t)) as { terminal?: boolean }).terminal)…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 56 passed (60)
   Start at  11:37:10
   Duration  4.60s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-lH0JKR/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/issues.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/issues.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/issues.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/issues.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts (91 tests | 1 failed) 2808ms
   ✓ bkit issues text (9)
     ✓ drops comments whose first line is the generated marker, keeps human ones 1ms
     ✓ a comment that only MENTIONS the marker later on is human input 0ms
     ✓ keeps only what follows the LAST whole-line cut marker, marker dropped 0ms
     ✓ a stamped marker and Jira's HTML <h6> markers count; HTML prose does not 0ms
     ✓ an inline mention of the cut token does not cut 0ms
     ✓ drops generated comments BEFORE cutting, so a marker inside bkit's own comment never cuts 0ms
     ✓ sorts oldest first when every comment has a timestamp, else keeps the given order 0ms
     ✓ reads files: GitHub created_at array and Linear {comments} wrapper; cut honours sort order 16ms
     ✓ exits 3 on a missing or malformed file and 2 with no input at all 14ms
   ✓ bkit issues labels (25)
     ✓ a new phase drops the old phase, next:* and bkit:failed, keeps bkit:auto and foreign labels 22ms
     ✓ drops every other phase label, however many there are 0ms
     ✓ debug is a phase: it replaces the phase it debugs and clears bkit:failed 21ms
     ✓ a Failure Path keeps the phase label and next:* is left alone without a phase 0ms
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 58ms
     ✓ merged drops every phase label and bkit:failed; refuses --failed=on with it 42ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 73ms
     ✓ refuses an unknown phase or on/off value 36ms
     ✓ builds the two board payloads from bkit.tracker.github.project 38ms
     ✓ board is null with a reason for {"tracker":{"default":"github","github":{"project":false}}} 25ms
     ✓ board is null with a reason for {"tracker":{"default":"github"}} 26ms
     ✓ board is null with a reason for {"tracker":{"default":"github","github":{"review":"QA"}}} 25ms
     ✓ board is null with a reason for {"tracker":{"default":"github","github":{"project":"https://github.com/acme/app"}}} 25ms
     ✓ board is null with a reason for {"tracker":{"default":"linear","github":{"project":"https://github.com/orgs/acme/projects/3/views/1"}}} 24ms
     ✓ board is null with a reason for {"tracker":{"default":"jira","github":{"project":"https://github.com/orgs/acme/projects/3/views/1"}}} 27ms
     ✓ board is null with a reason for {} 32ms
     ✓ trackerState for {"tracker":{"default":"linear"}}: phase start "started", hand-off "In Review" 72ms
     ✓ trackerState for {"tracker":{"default":"linear","linear":{"review":"Code Review"}}}: phase start "started", hand-off "Code Review" 68ms
     ✓ trackerState for {"tracker":{"default":"jira"}}: phase start "In Progress", hand-off "In Review" 62ms
     ✓ trackerState for {"tracker":{"default":"jira","jira":{"review":"Code Review"}}}: phase start "In Progress", hand-off "Code Review" 62ms
     ✓ trackerState for {"tracker":{"default":"jira","jira":{"progress":"Doing","review":"QA"}}}: phase start "Doing", hand-off "QA" 62ms
     ✓ trackerState for {"tracker":{"default":"github"}}: phase start null, hand-off null 67ms
     ✓ trackerState for {}: phase start null, hand-off null 72ms
     ✓ targets a personal board as owner_type user, with the Status option names overridden 37ms
     ✓ --board on a configured board needs --issue and --owner-repo 37ms
   ✓ bkit issues comment (33)
     ✓ Step 1 with the workflow heading and the tree link 39ms
     ✓ progress header reads Group: x/y 20ms
     ✓ renders header fields in the order the flags were given 99ms
     ✓ summary: artifact link at --ref, then the artifact verbatim 21ms
     ✓ artifact path#Heading links that section of the rendered doc 21ms
     ✓ headingAnchor("Overview") is GitHub's "overview" 0ms
     ✓ headingAnchor("Step 2 — Worktree Setup") is GitHub's "step-2--worktree-setup" 1ms
     ✓ headingAnchor("`bkit issues comment` (v4.9)") is GitHub's "bkit-issues-comment-v49" 0ms
     ✓ headingAnchor("snake_case and-hyphen") is GitHub's "snake_case-and-hyphen" 0ms
     ✓ headingAnchor("Ünïcode Überschrift") is GitHub's "ünïcode-überschrift" 0ms
     ✓ close: tree, PR and run links, then Artifacts and Telemetry sections 19ms
     ✓ raw lines follow the links (Fetch Context's not-configured line) 18ms
     ✓ failure: step, sub-step, error, and the last 20 stderr lines fenced 26ms
     ✓ failure: --error-file carries the error text, trailing newlines dropped; a missing file exits 3 18ms
     ✓ a stderr capture holding backticks cannot close its fence 19ms
     ✓ handover: link and handover content 19ms
     ✓ audit: slug heading, header fields, and the summary 20ms
     ✓ defuses a whole-line cut marker copied in from an artifact 19ms
     ✓ every body opens with the generated marker, so the next run's text drops it 18ms
     ✓ refuses ["--step-title=X"] (exit 2) 12ms
     ✓ refuses ["--step-number=1"] (exit 2) 13ms
     ✓ refuses ["--step-number=x1","--step-title=X"] (exit 2) 13ms
     ✓ refuses ["--kind=failure","--step-number=1","--step-title=X"] (exit 2) 12ms
     ✓ refuses ["--kind=other"] (exit 2) 12ms
     ✓ refuses ["--step-number=1","--step-title=X","--tree=dev"] (exit 2) 11ms
     ✓ refuses ["--step-number=1","--step-title=X","--owner-repo=o/r","--artifact=a.md"] (exit 2) 12ms
     ✓ refuses ["--step-number=1","--step-title=X","--owner-repo=o/r","--ref=dev","--artifact=a.md#"] (exit 2) 12ms
     ✓ refuses ["--step-number=1","--step-title=X","--field=novalue"] (exit 2) 12ms
     ✓ refuses ["--step-number=1","--step-title=X","--group-count=2"] (exit 2) 12ms
     ✓ refuses ["--step-number=1","--step-title=X","--workflow-heading"] (exit 2) 15ms
     ✓ refuses ["--kind=audit"] (exit 2) 12ms
     ✓ refuses ["--kind=audit","--audit-slug=Bad Slug"] (exit 2) 19ms
     ✓ exits 3 when a body, section or stderr file is missing 25ms
   ✓ issues reaches the tracker only through tracker.ts (1)
     ✓ never shells out or fetches itself 1ms
   ✓ bkit issues comment --post (6)
     ✓ without --post prints no tracker key and calls nothing 20ms
     ✓ skips tracker none and an issue-less FID 60ms
     ✓ posts the printed body; an identical recent comment is not posted twice 59ms
     ✓ a failed post exits 0 with done false and the reason 33ms
     ✓ prints commentFile: the multi-line comment byte-for-byte, for the MCP fallback 31ms
     ✓ --file: an engine-action row per run dedups a re-run without reading the issue 50ms
   ❯ bkit issues fetch (5)
     ✓ writes the description raw, comments oldest first and the facts; prints facts, never the body 26ms
     × fetch prints terminal in its facts and in issue-facts.json 29ms
     ✓ needs --session-dir or --outbox; skips tracker none and an issue-less run 65ms
     ✓ exits 80 with the reason on a network failure and writes nothing 32ms
     ✓ exits 80 with reason auth when the key is unset, never printing a key 30ms
   ✓ bkit issues blocked-by (3)
     ✓ prints each blocker's state and how many are still open 25ms
     ✓ skips with tracker none 26ms
     ✓ exits 80 with the reason when the tracker read fails 25ms
   ✓ bkit issues related (4)
     ✓ fetches each hit in rank order, up to --top, and writes the related-issues layout 27ms
     ✓ GitHub headings carry #N; no hits writes None. 25ms
     ✓ a hit that cannot be fetched exits 80 and writes nothing 26ms
     ✓ a hits file that is not a list of ids exits 3 26ms
   ✓ bkit issues labels --write (5)
     ✓ reads the labels itself, writes the transition and the state, prints tracker done 39ms
     ✓ a failed read prints done false and the transition of the given --label set 44ms
     ✓ skips tracker none and a run with no issue 52ms
     ✓ a malformed board target is refused before any label is written 41ms
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 401ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/issues.test.ts > bkit issues fetch > fetch prints terminal in its facts and in issue-facts.json
AssertionError: expected undefined to be true // Object.is equality

- Expected:
true

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts:1012:29
    1010|     const r = await run(cwd, ["issues", "fetch", "--issue=ENG-4", `--s…
    1011|     expect(r.code).toBe(0);
    1012|     expect(r.json.terminal).toBe(true);
       |                             ^
    1013|     const facts = JSON.parse(fs.readFileSync(path.join(out, "issue-fac…
    1014|     expect(facts).toEqual({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 90 passed (91)
   Start at  11:37:16
   Duration  2.92s (tests 98%, import 1%, setup 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-7XMYEV/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts (18 tests | 7 failed) 808ms
   ✓ BAR-186 — Claude SessionStart preflight.sh runtime behaviour (4)
     ✓ emits the rules advisory on a Claude IDE session 18ms
     ✓ a cloud session prints one JSON document carrying the advisory and the Linear guard result 11ms
     ✓ missing BKIT_LINEAR_API_KEY hard-stops when LINEAR_ISSUE_ID is present (regression guard) 11ms
     ✓ a context carrying a control character still yields one parseable JSON document 12ms
   ✓ Claude SessionStart preflight.sh — no Jira guard (2)
     ✓ a Jira session (token set, no LINEAR_ISSUE_ID) emits the advisory and exits 0 10ms
     ✓ neither generated hook reads the Jira token or calls Atlassian 0ms
   ✓ Cursor sessionStart preflight.sh runtime behaviour (3)
     ✓ a Cursor session emits the advisory without python3 and exits 0 12ms
     ✓ a background agent without BKIT_LINEAR_API_KEY hard-stops in Cursor's shape 19ms
     ✓ a background agent with a key but no LINEAR_ISSUE_ID hard-stops 20ms
   ✓ preflight.sh — the rules-read advisory (1)
     ✓ names .agents/rules.md and never AGENTS.md 21ms
   ❯ preflight.sh — generated from one tracker guard (1)
     × both generated hooks carry the shared guard verbatim and never call bkit 2ms
   ✓ BAR-186 — SessionStart preflight.sh source-level checks (1)
     ✓ brew-bin loop is wrapped in a Darwin OS gate 0ms
   ❯ preflight-tracker.sh — GitHub tracker (4)
     × github issue without bkit:auto stops the Cursor background session 38ms
     × github closed issue stops the session and an open labelled one passes 81ms
     × github read failure stops the session naming the tracker and the reason 38ms
     × github read failure stops the session naming the tracker and the reason 43ms
   ❯ preflight-tracker.sh — Linear tracker by state category (1)
     × linear completed state renamed Shipped stops the session 458ms
   ❯ preflight-tracker.sh — one shared part (1)
     × generated Claude and Cursor hooks carry the one preflight-tracker.sh part 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight.sh — generated from one tracker guard > both generated hooks carry the shared guard verbatim and never call bkit
Error: ENOENT: no such file or directory, open '/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/.bkit/core/hooks/preflight-tracker.sh'
 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:179:8
    177|   it("both generated hooks carry the shared guard verbatim and never c…
    178|     const guard = fs
    179|       .readFileSync(path.join(HOOK_SOURCES, "hooks", "preflight-tracke…
       |        ^
    180|       .trimEnd();
    181|     for (const hook of [CLAUDE_HOOK, CURSOR_HOOK]) {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — GitHub tracker > github issue without bkit:auto stops the Cursor background session
AssertionError: expected '[bkit] Required reading before any ot…' to contain 'bkit:auto'

- Expected
+ Received

- bkit:auto
+ [bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.
+
+ Guard pre-check: FAIL. BKIT_LINEAR_API_KEY is not set, so bkit cannot check (unset). HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop.

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:293:21
    291|     const context = onlyDocument(result.stdout);
    292|     expect(context).toContain("HARD STOP");
    293|     expect(context).toContain("bkit:auto");
       |                     ^
    294|   });
    295|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — GitHub tracker > github closed issue stops the session and an open labelled one passes
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:301:25
    299|     expect(onlyDocument(closed.stdout)).toContain("HARD STOP");
    300|     const open = run(githubIssue("open", ["bkit:auto"]));
    301|     expect(open.status).toBe(0);
       |                         ^
    302|     const context = onlyDocument(open.stdout);
    303|     expect(context).toContain("PASS");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — GitHub tracker > github read failure stops the session naming the tracker and the reason
AssertionError: expected '[bkit] Required reading before any ot…' to match /github.*(could not|failed)/i

- Expected:
/github.*(could not|failed)/i

+ Received:
"[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.

Guard pre-check: FAIL. BKIT_LINEAR_API_KEY is not set, so bkit cannot check (unset). HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:317:23
    315|       const context = onlyDocument(result.stdout);
    316|       expect(context).toContain("HARD STOP");
    317|       expect(context).toMatch(reason);
       |                       ^
    318|     },
    319|   );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — GitHub tracker > github read failure stops the session naming the tracker and the reason
AssertionError: expected '[bkit] Required reading before any ot…' to match /BKIT_GH_TOKEN/

- Expected:
/BKIT_GH_TOKEN/

+ Received:
"[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.

Guard pre-check: FAIL. BKIT_LINEAR_API_KEY is not set, so bkit cannot check (unset). HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:317:23
    315|       const context = onlyDocument(result.stdout);
    316|       expect(context).toContain("HARD STOP");
    317|       expect(context).toMatch(reason);
       |                       ^
    318|     },
    319|   );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — Linear tracker by state category > linear completed state renamed Shipped stops the session
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:340:27
    338|       { cwd: fixtureRepo("linear"), path: curlStub(reply) },
    339|     );
    340|     expect(result.status).toBe(1);
       |                           ^
    341|     const context = onlyDocument(result.stdout);
    342|     expect(context).toContain("HARD STOP");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — one shared part > generated Claude and Cursor hooks carry the one preflight-tracker.sh part
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:350:33
    348|   it("generated Claude and Cursor hooks carry the one preflight-tracke…
    349|     const part = path.join(HOOK_SOURCES, "hooks", "preflight-tracker.s…
    350|     expect(fs.existsSync(part)).toBe(true);
       |                                 ^
    351|     const guard = fs.readFileSync(part, "utf-8").trimEnd();
    352|     for (const hook of [CLAUDE_HOOK, CURSOR_HOOK]) {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 11 passed (18)
   Start at  11:37:19
   Duration  888ms (tests 97%, setup 2%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-9tq68R/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
