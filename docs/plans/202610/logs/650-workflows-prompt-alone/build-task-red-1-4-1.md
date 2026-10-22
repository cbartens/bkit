> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/prs.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/prs.test.ts (93 tests | 4 failed) 7203ms
❯ bkit prs open (31)
✓ creates the PR with the github marker first and the plan in the bkit block 169ms
✓ always writes the marker, even with no plan 138ms
✓ puts notes above the plan path 1ms
✓ writes the linear marker shape, taking the tracker from package.json 147ms
✓ writes the jira marker shape, taking the tracker from package.json 142ms
× prMarker writes a FID-only marker with github wired and no issue 4ms
✓ a FID-only marker for a tracker-shaped FID is refused (the FID would read as an issue) 1ms
✓ writes the no-tracker marker shape 1ms
✓ refuses a github marker with fid "../../etc" issue "12" (exit 2) 27ms
✓ refuses a github marker with fid "12-x" issue undefined (exit 2) 29ms
✓ refuses a github marker with fid "12-x" issue "abc" (exit 2) 29ms
✓ refuses a linear marker with fid "12-x" issue "ABC-1" (exit 2) 25ms
✓ refuses a linear marker with fid "abc-1-x" issue undefined (exit 2) 25ms
✓ refuses a linear marker with fid "ab2-1-x" issue "AB2-1" (exit 2) 26ms
✓ refuses a jira marker with fid "mba-7-x" issue "mba-7" (exit 2) 25ms
✓ refuses a jira marker with fid "12-x" issue "MBA-7" (exit 2) 29ms
✓ refuses a jira marker with fid "mba-7-x" issue undefined (exit 2) 27ms
✓ refuses a none marker with fid "-x" issue undefined (exit 2) 26ms
✓ refuses a title carrying [skip ci] before calling gh (exit 4) 29ms
✓ refuses a title carrying [CI SKIP] before calling gh (exit 4) 27ms
✓ refuses a title carrying [no ci] before calling gh (exit 4) 27ms
✓ refuses a title carrying [skip actions] before calling gh (exit 4) 26ms
✓ refuses a title carrying [actions skip] before calling gh (exit 4) 30ms
✓ refuses a PR from dev, main, or the base itself 78ms
✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 191ms
✓ retries a failed create once, and exits 5 when it fails twice 235ms
✓ exits 5 when the open-PR probe errors 140ms
✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 144ms
× prs open refuses --base=main 149ms
✓ prs open still opens against any other base 145ms
✓ exits 6 when the created PR's base is not --base 141ms
✓ bkit prs probe (7)
✓ returns the open PR for the current branch, filtering by --base when given 136ms
✓ exits 1 with found=false when there is none 133ms
✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 151ms
✓ --number reads one PR, mergeable included 133ms
✓ reports a CI-suppressing token in the title, any spelling, else null 163ms
✓ exits 4 when gh errors and 80 when it needs auth 167ms
✓ refuses a bad --state or --number 41ms
✓ bkit prs scan-body (10)
✓ flags [skip ci] in the landed commit body (exit 1) 40ms
✓ flags [ci skip] in the landed commit body (exit 1) 43ms
✓ flags [no ci] in the landed commit body (exit 1) 40ms
✓ flags [skip actions] in the landed commit body (exit 1) 40ms
✓ flags [actions skip] in the landed commit body (exit 1) 42ms
✓ flags [SKIP CI] in the landed commit body (exit 1) 40ms
✓ passes a token-free body 41ms
✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 40ms
✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 41ms
✓ a failed --remote-ref fetch is logged and the local commit is still scanned 57ms
✓ bkit prs cross-check (9)
✓ fails an mcp close with gh recorded unavailable and no transport-fallback row 1ms
✓ passes when the fallback row is present 1ms
✓ exempts transport gh even with gh recorded unavailable 1ms
✓ exempts transport git even with gh recorded unavailable 1ms
✓ passes when gh was available, or no runtime-resolved row exists 1ms
✓ reads the LATEST runtime-resolved row 1ms
✓ a runtime-resolved row with backslashes in its gh error does not make the log unreadable 1ms
✓ exits 3 on a missing or malformed log and 2 on an unknown transport 1ms
✓ a malformed log exits 3 for every transport: the gh / git exemption never hides it 1ms
✓ bkit prs transport-row (8)
✓ appends a fallback row, keeping backslash arguments verbatim 2ms
✓ appends a close-transport row 1ms
✓ refuses ["--kind=close","--shape=A","--sha=x","--scan-result=clean"] (exit 2, nothing written) 1ms
✓ refuses ["--kind=close","--shape=pr","--sha=x","--scan-result=dirty"] (exit 2, nothing written) 1ms
✓ refuses ["--kind=close","--shape=pr","--scan-result=clean"] (exit 2, nothing written) 1ms
✓ refuses ["--kind=fallback","--from=","--to=t","--reason=r","--asserted-by=a"] (exit 2, nothing written) 1ms
✓ refuses ["--kind=other"] (exit 2, nothing written) 1ms
✓ exits 3 when status.jsonl does not exist 1ms
❯ bkit prs merge (9)
✓ squash-merges with an empty body and the title subject, then reads MERGED back 215ms
✓ appends the auto-route marker on an exact bkit:auto label only 224ms
✓ takes an explicit --subject 130ms
✓ runs no merge when the PR is already MERGED 126ms
✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 189ms
× prs merge refuses a PR whose base is main 143ms
× prs merge refuses when the PR base is unknown 141ms
✓ prs merge reads the base from the one pr view it already makes 134ms
✓ exits 80 when gh needs auth, and 2 on a bad --number 151ms
✓ bkit prs update-branch (4)
✓ asks gh to refresh the PR head server-side 125ms
✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 145ms
✓ exits 5 when gh fails, naming the 403 scope hint 139ms
✓ exits 2 on a bad --number 30ms
✓ bkit prs checks (6)
✓ is green when every check finished successfully 129ms
✓ is not green when a check failed, naming it (exit 1) 129ms
✓ counts an unfinished check run and a PENDING commit status as pending 126ms
✓ is not green on an empty rollup (total 0) 132ms
✓ treats NEUTRAL and SKIPPED conclusions as passing 151ms
✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 201ms
✓ bkit prs verbose-ci (4)
✓ adds the marker to the title 158ms
✓ is a no-op when the title already says so 130ms
✓ strips the marker, with or without its bkit prefix 160ms
✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 201ms
✓ bkit prs transport-row --kind=close --scan (5)
✓ scans a clean landed body and records the close-transport row 38ms
✓ records a skip token found in the body, then exits 1 39ms
✓ exits 8 on an unreadable commit, writing nothing 37ms
✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 43ms
✓ needs --scan or --scan-result 36ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/prs.test.ts > bkit prs open > prMarker writes a FID-only marker with github wired and no issue
Error: --fid "dev-ci-failures" is not a github FID slug
❯ prMarker .bkit/core/engine/commands/workflow/prs.ts:184:11
182| export function prMarker(tracker: IssueTracker, fid: string, issue: st…
183| if (!FID_FORMAT[tracker].test(fid)) {
184| throw new CommandError(EXIT.USAGE, `--fid "${fid}" is not a ${trac…
       |           ^
    185|   }
    186|   if (tracker === "none") return `<!-- bkit:fid=${fid} -->`;
❯ .bkit/core/engine/commands/workflow/prs.test.ts:187:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

FAIL .bkit/core/engine/commands/workflow/prs.test.ts > bkit prs open > prs open refuses --base=main
AssertionError: expected +0 to be 7 // Object.is equality

- Expected

* Received

- 7

* 0

❯ .bkit/core/engine/commands/workflow/prs.test.ts:310:20
308| gh.view(pr({ baseRefName: "main" }));
309| const r = await open(cwd, "--issue=12", "--base=main");
310| expect(r.code).toBe(EXIT_BASE_MAIN);
| ^
311| expect(r.err).toContain("main");
312| expect(gh.calls()).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

FAIL .bkit/core/engine/commands/workflow/prs.test.ts > bkit prs merge > prs merge refuses a PR whose base is main
AssertionError: expected +0 to be 8 // Object.is equality

- Expected

* Received

- 8

* 0

❯ .bkit/core/engine/commands/workflow/prs.test.ts:689:20
687| gh.viewAfterMerge(pr({ baseRefName: "main", state: "MERGED" }));
688| const r = await merge();
689| expect(r.code).toBe(EXIT_BASE_NOT_DEV);
| ^
690| expect(r.err).toContain("main");
691| expect(r.json).toMatchObject({ merged: false, verdict: "FAIL" });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

FAIL .bkit/core/engine/commands/workflow/prs.test.ts > bkit prs merge > prs merge refuses when the PR base is unknown
AssertionError: expected +0 to be 8 // Object.is equality

- Expected

* Received

- 8

* 0

❯ .bkit/core/engine/commands/workflow/prs.test.ts:699:20
697| gh.viewAfterMerge(pr({ state: "MERGED" }));
698| const r = await merge();
699| expect(r.code).toBe(EXIT_BASE_NOT_DEV);
| ^
700| expect(mergeCall()).toBe("");
701| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯

Test Files 1 failed (1)
Tests 4 failed | 89 passed (93)
Start at 13:03:48
Duration 7.51s (tests 97%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-hSEuUl/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
