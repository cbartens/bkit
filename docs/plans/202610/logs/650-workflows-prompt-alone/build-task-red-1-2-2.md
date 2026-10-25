> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/fids.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/fids.test.ts (101 tests | 11 failed) 427ms
✓ readIssueTracker (5)
✓ reads bkit.issueTracker github 7ms
✓ reads bkit.issueTracker linear 5ms
✓ reads bkit.issueTracker jira 4ms
✓ missing, invalid or unparseable falls back to none 14ms
✓ reads the main checkout's package.json from inside a linked worktree 43ms
✓ bkit fids check (33)
✓ tracker github, FID "341-three-runtimes" -> valid true, issueId "341" 1ms
✓ tracker github, FID "12-34-x" -> valid true, issueId "12" 0ms
✓ tracker linear, FID "abc-123-slug" -> valid true, issueId "ABC-123" 0ms
✓ tracker linear, FID "ABC-123-slug" -> valid true, issueId "ABC-123" 0ms
✓ tracker jira, FID "mba-7-slug" -> valid true, issueId "MBA-7" 0ms
✓ tracker jira, FID "MBA-7-slug" -> valid true, issueId "MBA-7" 0ms
✓ tracker jira, FID "ab2-7-slug" -> valid true, issueId "AB2-7" 0ms
✓ tracker none, FID "my-feature" -> valid true, issueId null 0ms
✓ tracker none, FID "a" -> valid true, issueId null 0ms
✓ tracker none, FID "341" -> valid true, issueId null 0ms
✓ tracker any, FID "341-x" -> valid true, issueId "341" 0ms
✓ tracker any, FID "abc-123-x" -> valid true, issueId "ABC-123" 0ms
✓ tracker any, FID "ab2-7-x" -> valid true, issueId "AB2-7" 0ms
✓ tracker github, FID "341" -> valid false, issueId null 0ms
✓ tracker github, FID "abc-1-x" -> valid false, issueId null 0ms
✓ tracker github, FID "341-Upper" -> valid false, issueId null 0ms
✓ tracker github, FID "x_y" -> valid false, issueId null 0ms
✓ tracker linear, FID "341-slug" -> valid false, issueId null 0ms
✓ tracker linear, FID "abc-x" -> valid false, issueId null 0ms
✓ tracker linear, FID "ab2-1-x" -> valid false, issueId null 0ms
✓ tracker jira, FID "m-7-slug" -> valid false, issueId null 0ms
✓ tracker jira, FID "2ab-7-slug" -> valid false, issueId null 0ms
✓ tracker jira, FID "341-slug" -> valid false, issueId null 0ms
✓ tracker none, FID "-leading-dash" -> valid false, issueId null 0ms
✓ tracker none, FID "has/slash" -> valid false, issueId null 0ms
✓ tracker none, FID "x_y" -> valid false, issueId null 0ms
✓ tracker any, FID "plain-slug" -> valid false, issueId null 0ms
✓ lowercases a linear FID in its output 0ms
✓ lowercases a jira FID in its output 0ms
✓ takes the tracker from package.json when --tracker is absent 8ms
✓ takes linear from package.json, lowercasing the key 4ms
✓ takes jira from package.json, lowercasing the key 4ms
✓ an unknown --tracker is a usage error 0ms
✓ bkit fids check --issue (12)
✓ check --issue="" accepts dev-ci-failures under github 0ms
✓ check --issue="" accepts dev-ci-failures under linear 0ms
✓ check --issue="" accepts dev-ci-failures under jira 0ms
✓ check --issue="" rejects a FID with an all-digit word under every wired tracker 1ms
✓ check --tracker=any --issue="" applies the issue-less rule 0ms
✓ check --issue=650 requires the github shape and a github issue id 1ms
✓ check under none ignores --issue 0ms
✓ check takes the tracker from package.json with --issue="" 9ms
✓ fidProblem with --issue absent matches today 0ms
✓ fidProblem names the issue-less rule 0ms
✓ ISSUE_LESS_FID is a slug with no all-digit word 0ms
✓ ISSUE_ID_PATTERNS match each tracker's issue id 0ms
❯ bkit fids parse (30)
✓ github: the marker wins over the branch 5ms
✓ linear: marker issue id and lowercased FID 4ms
✓ jira: marker issue key and lowercased FID 5ms
✓ none: the fid-only marker 4ms
✓ github: a malformed marker falls through to the branch 4ms
✓ linear: a malformed marker falls through to the branch 4ms
✓ jira: a malformed marker falls through to the branch 5ms
✓ none: a marker for another tracker is not this tracker's marker 5ms
✓ jira: a marker for another tracker is not this tracker's marker 4ms
✓ github: a marker for another tracker is not this tracker's marker 4ms
✓ linear: a marker for another tracker is not this tracker's marker 4ms
✓ github branch feat/341-three-runtimes -> FID 341-three-runtimes, issueId "341" 5ms
✓ github branch feat/341 -> FID 341, issueId "341" 4ms
✓ linear branch feat/abc-123-slug -> FID abc-123-slug, issueId "ABC-123" 4ms
✓ jira branch feat/mba-7-slug -> FID mba-7-slug, issueId "MBA-7" 4ms
✓ jira branch feat/ab2-7-slug -> FID ab2-7-slug, issueId "AB2-7" 4ms
✓ none branch feat/anything-goes -> FID anything-goes, issueId null 4ms
× github branch feat/abc-x -> FID abc-x, issueId null 7ms
× github branch feat/dev-ci-failures -> FID dev-ci-failures, issueId null 5ms
× linear branch feat/dev-ci-failures -> FID dev-ci-failures, issueId null 4ms
× jira branch feat/dev-ci-failures -> FID dev-ci-failures, issueId null 4ms
✓ github branch "dev" -> exit 3 (is not feat/{FID}) 4ms
✓ github branch "feat/" -> exit 3 (is not a slug) 4ms
✓ github branch "feat/Upper-case" -> exit 3 (is not a slug) 4ms
✓ linear branch "feat/341-x" -> exit 3 (embeds no linear issue id) 4ms
✓ linear branch "feat/ab2-7-x" -> exit 3 (embeds no linear issue id) 4ms
✓ jira branch "feat/341-x" -> exit 3 (embeds no jira issue id) 5ms
✓ jira branch "feat/m-7-x" -> exit 3 (embeds no jira issue id) 4ms
✓ needs --marker or --branch 0ms
✓ marker absent and no branch -> exit 3 4ms
❯ issue-less FID recovery (11)
× fromMarker returns issueId null for a FID-only marker under github 1ms
× fromMarker returns issueId null for a FID-only marker under linear 1ms
× fromMarker returns issueId null for a FID-only marker under jira 0ms
✓ fromMarker returns issueId null for a FID-only marker under none 0ms
× fromBranch returns issueId null for feat/dev-ci-failures under linear 0ms
× fromBranch returns issueId null for feat/dev-ci-failures under github 0ms
× fromBranch returns issueId null for feat/dev-ci-failures under jira 0ms
✓ a tracker-shaped marker or branch still parses as its issue 0ms
✓ a FID-only marker holding an all-digit word is not issue-less 0ms
✓ a malformed tracker marker does not fall back to the FID-only shape 0ms
× fids parse recovers an issue-less FID from the marker and from the branch 4ms
✓ issueIdOf (1)
✓ matches auto's CI_DEV derivation (first numeric or team-number prefix, uppercased) 0ms
✓ bkit fids find (6)
✓ names the one feature logged for the issue (exit 0), never a longer issue number 19ms
✓ matches a Linear issue case-insensitively 15ms
✓ matches a Jira issue case-insensitively 14ms
✓ lists every feature when several are logged (exit 4) 29ms
✓ exits 1 when nothing is logged, or docs/plans does not exist 26ms
✓ ignores a non-month folder and a file named like a feature 14ms
✓ bkit fids design (3)
✓ finds the feature's design doc in the given bucket (exit 0) 14ms
✓ falls back to the newest bucket holding it when the given bucket has none 24ms
✓ exits 1 for no design doc, another feature's doc, a plan only, or no docs/plans 26ms

⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids parse > github branch feat/abc-x -> FID abc-x, issueId null
FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids parse > github branch feat/dev-ci-failures -> FID dev-ci-failures, issueId null
FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids parse > linear branch feat/dev-ci-failures -> FID dev-ci-failures, issueId null
FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids parse > jira branch feat/dev-ci-failures -> FID dev-ci-failures, issueId null
AssertionError: expected 3 to be +0 // Object.is equality

- Expected

* Received

- 0

* 3

❯ .bkit/core/engine/commands/workflow/fids.test.ts:365:20
363| ])("%s branch %s -> FID %s, issueId %j", async (tracker, branch, fid…
364| const r = await run(project(tracker), ["parse", `--branch=${branch…
365| expect(r.code).toBe(0);
| ^
366| expect(r.json).toEqual({ fid, issueId, source: "branch", tracker }…
367| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > issue-less FID recovery > fromMarker returns issueId null for a FID-only marker under github
AssertionError: expected null to deeply equal { fid: 'dev-ci-failures', …(2) }

- Expected:
  {
  "fid": "dev-ci-failures",
  "issueId": null,
  "source": "marker",
  }

* Received:
  null

❯ .bkit/core/engine/commands/workflow/fids.test.ts:397:44
395|
396| it("fromMarker returns issueId null for a FID-only marker under gith…
397| expect(fromMarker(FID_ONLY, "github")).toEqual({
| ^
398| fid: "dev-ci-failures",
399| issueId: null,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > issue-less FID recovery > fromMarker returns issueId null for a FID-only marker under linear
FAIL .bkit/core/engine/commands/workflow/fids.test.ts > issue-less FID recovery > fromMarker returns issueId null for a FID-only marker under jira
AssertionError: expected null to match object { fid: 'dev-ci-failures', …(1) }

- Expected:
  {
  "fid": "dev-ci-failures",
  "issueId": null,
  }

* Received:
  null

❯ .bkit/core/engine/commands/workflow/fids.test.ts:407:45
405| "fromMarker returns issueId null for a FID-only marker under %s",
406| (tracker) => {
407| expect(fromMarker(FID_ONLY, tracker)).toMatchObject({
| ^
408| fid: "dev-ci-failures",
409| issueId: null,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > issue-less FID recovery > fromBranch returns issueId null for feat/dev-ci-failures under linear
AssertionError: expected { ok: false, …(1) } to deeply equal { ok: true, parsed: { …(3) } }

- Expected

* Received

  {

- "ok": true,
- "parsed": {
-     "fid": "dev-ci-failures",
-     "issueId": null,
-     "source": "branch",
- },

* "ok": false,
* "why": "\"dev-ci-failures\" embeds no linear issue id",
  }

❯ .bkit/core/engine/commands/workflow/fids.test.ts:415:58
413|
414| it("fromBranch returns issueId null for feat/dev-ci-failures under l…
415| expect(fromBranch("feat/dev-ci-failures", "linear")).toEqual({
| ^
416| ok: true,
417| parsed: { fid: "dev-ci-failures", issueId: null, source: "branch…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > issue-less FID recovery > fromBranch returns issueId null for feat/dev-ci-failures under github
FAIL .bkit/core/engine/commands/workflow/fids.test.ts > issue-less FID recovery > fromBranch returns issueId null for feat/dev-ci-failures under jira
AssertionError: expected { ok: false, …(1) } to match object { ok: true, parsed: { issueId: null } }
(1 matching property omitted from actual)

- Expected

* Received

  {

- "ok": true,
- "parsed": {
-     "issueId": null,
- },

* "ok": false,
  }

❯ .bkit/core/engine/commands/workflow/fids.test.ts:424:59
422| "fromBranch returns issueId null for feat/dev-ci-failures under %s…
423| (tracker) => {
424| expect(fromBranch("feat/dev-ci-failures", tracker)).toMatchObjec…
| ^
425| ok: true,
426| parsed: { issueId: null },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > issue-less FID recovery > fids parse recovers an issue-less FID from the marker and from the branch
AssertionError: expected undefined to deeply equal { fid: 'dev-ci-failures', …(3) }

- Expected:
  {
  "fid": "dev-ci-failures",
  "issueId": null,
  "source": "marker",
  "tracker": "github",
  }

* Received:
  undefined

❯ .bkit/core/engine/commands/workflow/fids.test.ts:455:20
453| it("fids parse recovers an issue-less FID from the marker and from t…
454| const m = await run(project("github"), ["parse", `--marker=${FID_O…
455| expect(m.json).toEqual({
| ^
456| fid: "dev-ci-failures",
457| issueId: null,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/11]⎯

Test Files 1 failed (1)
Tests 11 failed | 90 passed (101)
Start at 12:57:31
Duration 556ms (tests 84%, transform 13%, import 2%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-RhyRwu/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
