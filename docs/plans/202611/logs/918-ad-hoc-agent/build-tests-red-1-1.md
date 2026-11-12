Enforced: true
Red: 9
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/918-ad-hoc-agent-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "refuses a call with no workflow-run proof and prints no body" | red | failure: expected +0 to be 2 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "refuses an unproven post before any tracker request" | red | failure: expected +0 to be 2 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "session proof accepts a path under the outbox sessions folder even once deleted and refuses one outside it" | red | failure: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-issues-SF383J/other: expected +0 to be 2 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run" | red | failure: --workflow=build --file=missing.jsonl: expected +0 to be 2 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "audit proof accepts a body file in its own audit outbox folder and refuses one elsewhere" | red | failure: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-issues-OpQpCW/.git/bkit-outbox/audit-other/body.md: expected +0 to be 2 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "refuses a call whose proof cannot be resolved" | red | failure: expected +0 to be 2 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "checks the run proof before skipping an issue-less call" | red | failure: --fid=dev-ci-x: expected +0 to be 2 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "an ad-hoc comment with no run proof exits 2 and reaches no tracker" | red | failure: expected +0 to be 2 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "accepts a session minted in the main checkout from a linked worktree" | passed-accepted | passes; accepted by the tests step: sessionPublication already resolves the git-common-dir sessions folder, so the call is accepted today (no guard yet to refuse it); guards the new check against regressing |
| 2 | `.bkit/core/engine/commands/workflow/issues.test.ts` "the comment verb's summary says it is for workflow steps only" | red | failure: expected 'The exact body of a ###### bkit:gener…' to contain 'workflow steps only, never for ad-hoc…' |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/issues.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/issues.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/issues.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/issues.test.ts

[test-timeout-budget] load average 7.9 on 10 cores: unit limits 8450ms per test, 16900ms per hook (x1.69)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests | 8 failed) 5437ms
   ✓ bkit issues text (9)
     ✓ drops comments whose first line is the generated marker, keeps human ones 3ms
     ✓ a comment that only MENTIONS the marker later on is human input 0ms
     ✓ keeps only what follows the LAST whole-line cut marker, marker dropped 1ms
     ✓ a stamped marker and Jira's HTML <h6> markers count; HTML prose does not 1ms
     ✓ an inline mention of the cut token does not cut 0ms
     ✓ drops generated comments BEFORE cutting, so a marker inside bkit's own comment never cuts 0ms
     ✓ sorts oldest first when every comment has a timestamp, else keeps the given order 0ms
     ✓ reads files: GitHub created_at array and Linear {comments} wrapper; cut honours sort order 35ms
     ✓ exits 3 on a missing or malformed file and 2 with no input at all 25ms
   ✓ bkit issues labels (25)
     ✓ a new phase drops the old phase, next:* and bkit:failed, keeps bkit:auto and foreign labels 43ms
     ✓ drops every other phase label, however many there are 0ms
     ✓ debug is a phase: it replaces the phase it debugs and clears bkit:failed 36ms
     ✓ a Failure Path keeps the phase label and next:* is left alone without a phase 0ms
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 101ms
     ✓ merged drops every phase label and bkit:failed; refuses --failed=on with it 93ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 142ms
     ✓ refuses an unknown phase or on/off value 84ms
     ✓ builds the two board payloads from bkit.tracker.github.project 82ms
     ✓ board is null with a reason for {"tracker":{"default":"github","github":{"project":false}}} 76ms
     ✓ board is null with a reason for {"tracker":{"default":"github"}} 60ms
     ✓ board is null with a reason for {"tracker":{"default":"github","github":{"review":"QA"}}} 58ms
     ✓ board is null with a reason for {"tracker":{"default":"github","github":{"project":"https://github.com/acme/app"}}} 59ms
     ✓ board is null with a reason for {"tracker":{"default":"linear","github":{"project":"https://github.com/orgs/acme/projects/3/views/1"}}} 55ms
     ✓ board is null with a reason for {"tracker":{"default":"jira","github":{"project":"https://github.com/orgs/acme/projects/3/views/1"}}} 49ms
     ✓ board is null with a reason for {} 44ms
     ✓ trackerState for {"tracker":{"default":"linear"}}: phase start "started", hand-off "In Review" 133ms
     ✓ trackerState for {"tracker":{"default":"linear","linear":{"review":"Code Review"}}}: phase start "started", hand-off "Code Review" 138ms
     ✓ trackerState for {"tracker":{"default":"jira"}}: phase start "In Progress", hand-off "In Review" 132ms
     ✓ trackerState for {"tracker":{"default":"jira","jira":{"review":"Code Review"}}}: phase start "In Progress", hand-off "Code Review" 112ms
     ✓ trackerState for {"tracker":{"default":"jira","jira":{"progress":"Doing","review":"QA"}}}: phase start "Doing", hand-off "QA" 97ms
     ✓ trackerState for {"tracker":{"default":"github"}}: phase start null, hand-off null 102ms
     ✓ trackerState for {}: phase start null, hand-off null 103ms
     ✓ targets a personal board as owner_type user, with the Status option names overridden 61ms
     ✓ --board on a configured board needs --issue and --owner-repo 60ms
   ✓ bkit issues comment (33)
     ✓ Step 1 with the workflow heading and the tree link 65ms
     ✓ progress header reads Group: x/y 33ms
     ✓ renders header fields in the order the flags were given 152ms
     ✓ summary: artifact link at --ref, then the artifact verbatim 32ms
     ✓ artifact path#Heading links that section of the rendered doc 31ms
     ✓ headingAnchor("Overview") is GitHub's "overview" 0ms
     ✓ headingAnchor("Step 2 — Worktree Setup") is GitHub's "step-2--worktree-setup" 1ms
     ✓ headingAnchor("`bkit issues comment` (v4.9)") is GitHub's "bkit-issues-comment-v49" 0ms
     ✓ headingAnchor("snake_case and-hyphen") is GitHub's "snake_case-and-hyphen" 0ms
     ✓ headingAnchor("Ünïcode Überschrift") is GitHub's "ünïcode-überschrift" 0ms
     ✓ close: tree, PR and run links, then Artifacts and Telemetry sections 31ms
     ✓ raw lines follow the links (Fetch Context's not-configured line) 31ms
     ✓ failure: step, sub-step, error, and the last 20 stderr lines fenced 42ms
     ✓ failure: --error-file carries the error text, trailing newlines dropped; a missing file exits 3 34ms
     ✓ a stderr capture holding backticks cannot close its fence 34ms
     ✓ handover: link and handover content 30ms
     ✓ audit: slug heading, header fields, and the summary 29ms
     ✓ defuses a whole-line cut marker copied in from an artifact 29ms
     ✓ every body opens with the generated marker, so the next run's text drops it 31ms
     ✓ refuses ["--step-title=X"] (exit 2) 20ms
     ✓ refuses ["--step-number=1"] (exit 2) 20ms
     ✓ refuses ["--step-number=x1","--step-title=X"] (exit 2) 20ms
     ✓ refuses ["--kind=failure","--step-number=1","--step-title=X"] (exit 2) 21ms
     ✓ refuses ["--kind=other"] (exit 2) 19ms
     ✓ refuses ["--step-number=1","--step-title=X","--tree=dev"] (exit 2) 20ms
     ✓ refuses ["--step-number=1","--step-title=X","--owner-repo=o/r","--artifact=a.md"] (exit 2) 21ms
     ✓ refuses ["--step-number=1","--step-title=X","--owner-repo=o/r","--ref=dev","--artifact=a.md#"] (exit 2) 23ms
     ✓ refuses ["--step-number=1","--step-title=X","--field=novalue"] (exit 2) 23ms
     ✓ refuses ["--step-number=1","--step-title=X","--group-count=2"] (exit 2) 24ms
     ✓ refuses ["--step-number=1","--step-title=X","--workflow-heading"] (exit 2) 27ms
     ✓ refuses ["--kind=audit"] (exit 2) 27ms
     ✓ refuses ["--kind=audit","--audit-slug=Bad Slug"] (exit 2) 26ms
     ✓ exits 3 when a body, section or stderr file is missing 45ms
   ✓ issues reaches the tracker only through tracker.ts (1)
     ✓ never shells out or fetches itself 1ms
   ✓ bkit issues comment --post (7)
     ✓ without --post prints no tracker key and calls nothing 31ms
     ✓ skips tracker none and an issue-less FID 106ms
     ✓ posts the printed body; an identical recent comment is not posted twice 115ms
     ✓ renders audit comments from validated result and preserves tracker adapters 198ms
     ✓ a failed post exits 0 with done false and the reason 63ms
     ✓ prints commentFile: the multi-line comment byte-for-byte, for the MCP fallback 68ms
     ✓ --file: an engine-action row per run dedups a re-run without reading the issue 106ms
   ❯ bkit issues comment workflow-run proof (7)
     × refuses a call with no workflow-run proof and prints no body 38ms
     × refuses an unproven post before any tracker request 63ms
     × session proof accepts a path under the outbox sessions folder even once deleted and refuses one outside it 43ms
     × status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run 74ms
     × audit proof accepts a body file in its own audit outbox folder and refuses one elsewhere 64ms
     × refuses a call whose proof cannot be resolved 12ms
     × checks the run proof before skipping an issue-less call 57ms
   ❯ bkit issues comment summary (1)
     × the comment verb's summary says it is for workflow steps only 2ms
   ✓ bkit issues fetch (5)
     ✓ writes the description raw, comments oldest first and the facts; prints facts, never the body 43ms
     ✓ fetch prints terminal in its facts and in issue-facts.json 40ms
     ✓ needs --session-dir or --outbox; skips tracker none and an issue-less run 104ms
     ✓ exits 80 with the reason on a network failure and writes nothing 58ms
     ✓ exits 80 with reason auth when the key is unset, never printing a key 43ms
   ✓ bkit issues blocked-by (3)
     ✓ prints each blocker's state and how many are still open 39ms
     ✓ skips with tracker none 44ms
     ✓ exits 80 with the reason when the tracker read fails 46ms
   ✓ bkit issues related (4)
     ✓ fetches each hit in rank order, up to --top, and writes the related-issues layout 44ms
     ✓ GitHub headings carry #N; no hits writes None. 43ms
     ✓ a hit that cannot be fetched exits 80 and writes nothing 41ms
     ✓ a hits file that is not a list of ids exits 3 41ms
   ✓ bkit issues labels --write (5)
     ✓ reads the labels itself, writes the transition and the state, prints tracker done 80ms
     ✓ a failed read prints done false and the transition of the given --label set 76ms
     ✓ skips tracker none and a run with no issue 52ms
     ✓ a malformed board target is refused before any label is written 74ms
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 591ms
   ✓ bkit issues audit ledger keys (1)
     ✓ derives audit ledger keys under the audit-slug prefix 9ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/issues.test.ts > bkit issues comment workflow-run proof > refuses a call with no workflow-run proof and prints no body
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts:1005:23
    1003|     write(cwd, "secret-body.md", "Private body.\n");
    1004|     const bare = await run(cwd, STEP);
    1005|     expect(bare.code).toBe(2);
       |                       ^
    1006|     expect(bare.err).toContain("workflow steps only");
    1007|     expect(bare.err).toContain("plain markdown");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/issues.test.ts > bkit issues comment workflow-run proof > refuses an unproven post before any tracker request
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts:1032:20
    1030|     const cwd = dir({ tracker: { default: "linear" } });
    1031|     const r = await run(cwd, [...STEP, "--post", "--issue=ENG-4"]);
    1032|     expect(r.code).toBe(2);
       |                    ^
    1033|     expect(r.err).toContain("workflow steps only");
    1034|     expect(fetch).not.toHaveBeenCalled();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/issues.test.ts > bkit issues comment workflow-run proof > session proof accepts a path under the outbox sessions folder even once deleted and refuses one outside it
AssertionError: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-issues-SF383J/other: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts:1049:27
    1047|     for (const bad of [path.join(cwd, "other"), path.join(root, "live"…
    1048|       const r = await run(cwd, [...STEP, `--session-dir=${bad}`]);
    1049|       expect(r.code, bad).toBe(2);
       |                           ^
    1050|       expect(r.err).toContain("workflow steps only");
    1051|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/issues.test.ts > bkit issues comment workflow-run proof > status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run
AssertionError: --workflow=build --file=missing.jsonl: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts:1085:37
    1083|     ]) {
    1084|       const r = await run(cwd, [...STEP, ...bad]);
    1085|       expect(r.code, bad.join(" ")).toBe(2);
       |                                     ^
    1086|       expect(r.err).toContain("workflow steps only");
    1087|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/issues.test.ts > bkit issues comment workflow-run proof > audit proof accepts a body file in its own audit outbox folder and refuses one elsewhere
AssertionError: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-issues-OpQpCW/.git/bkit-outbox/audit-other/body.md: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts:1117:27
    1115|     ]) {
    1116|       const r = await run(cwd, [...AUDIT, `--body-file=${bad}`]);
    1117|       expect(r.code, bad).toBe(2);
       |                           ^
    1118|       expect(r.err).toContain("workflow steps only");
    1119|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/issues.test.ts > bkit issues comment workflow-run proof > refuses a call whose proof cannot be resolved
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts:1129:25
    1127|       `--session-dir=${path.join(outside, ".git", "bkit-outbox", "sess…
    1128|     ]);
    1129|     expect(noRepo.code).toBe(2);
       |                         ^
    1130|     expect(noRepo.err).toContain("workflow steps only");
    1131|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/issues.test.ts > bkit issues comment workflow-run proof > checks the run proof before skipping an issue-less call
AssertionError: --fid=dev-ci-x: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts:1147:30
    1145|       const cwd = dir(bkit);
    1146|       const bare = await run(cwd, [...STEP, "--post", fid]);
    1147|       expect(bare.code, fid).toBe(2);
       |                              ^
    1148|       expect(bare.err).toContain("workflow steps only");
    1149|       expect(bare.json?.tracker).toBeUndefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/issues.test.ts > bkit issues comment summary > the comment verb's summary says it is for workflow steps only
AssertionError: expected 'The exact body of a ###### bkit:gener…' to contain 'workflow steps only, never for ad-hoc…'

Expected: "workflow steps only, never for ad-hoc comments"
Received: "The exact body of a ###### bkit:generated step, failure, handover, or audit comment."

 ❯ .bkit/core/engine/commands/workflow/issues.test.ts:1160:50
    1158| describe("bkit issues comment summary", () => {
    1159|   it("the comment verb's summary says it is for workflow steps only", …
    1160|     expect(issuesCommand.verbs.comment!.summary).toContain(
       |                                                  ^
    1161|       "workflow steps only, never for ad-hoc comments",
    1162|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 93 passed (101)
   Start at  16:45:19
   Duration  5.77s (tests 97%, import 1%, transform 1%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-DYtkPe/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tracker.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tracker.integration.test.ts

[test-timeout-budget] load average 7.9 on 10 cores: unit limits 8450ms per test, 16900ms per hook (x1.69)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent

 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts (15 tests | 1 failed) 88745ms
   ❯ workflow comment lifecycle across real CLI processes (15)
     ✓ keeps auto startup with PR metadata and dispatch in one progress comment 2378ms
     ✓ redacts malformed Jira authorization from live probe diagnostics 632ms
     ✓ keeps published build completion and PR links in one terminal comment 4085ms
     ✓ continues after the prepared completion source disappears 2026ms
     ✓ records preparation and session association failures despite successful delivery 1962ms
     ✓ associates startup and run across restart or starts fresh safely 2982ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 9469ms
     ✓ keeps auto and phase progress separate across worktrees 3930ms
     ✓ continues close and cleanup after lost terminal response 3735ms
     ✓ starts fresh progress after cleanup and on a fresh clone 3712ms
     ✓ preserves substantive step results under every comment boundary fault 23633ms
     ✓ keeps clean build progress and completion to two comments 14903ms
     ✓ preserves legacy receipts issue less skips and exact fallback through resume 10089ms
     × an ad-hoc comment with no run proof exits 2 and reaches no tracker 1963ms
     ✓ accepts a session minted in the main checkout from a linked worktree 3244ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > an ad-hoc comment with no run proof exits 2 and reaches no tracker
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:765:25
    763|       "--step-title=Ad hoc research",
    764|     ]);
    765|     expect(result.code).toBe(2);
       |                         ^
    766|     expect(result.stderr).toContain("workflow steps only");
    767|     expect(result.out.comment).toBeUndefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 14 passed (15)
   Start at  16:45:26
   Duration  88.91s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-UmE0H3/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
