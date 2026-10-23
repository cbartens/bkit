> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/fids.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/fids.test.ts (87 tests | 10 failed) 358ms
✓ readIssueTracker (5)
✓ reads bkit.issueTracker github 7ms
✓ reads bkit.issueTracker linear 5ms
✓ reads bkit.issueTracker jira 4ms
✓ missing, invalid or unparseable falls back to none 13ms
✓ reads the main checkout's package.json from inside a linked worktree 41ms
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
❯ bkit fids check --issue (12)
× check --issue="" accepts dev-ci-failures under github 3ms
× check --issue="" accepts dev-ci-failures under linear 0ms
× check --issue="" accepts dev-ci-failures under jira 1ms
× check --issue="" rejects a FID with an all-digit word under every wired tracker 0ms
× check --tracker=any --issue="" applies the issue-less rule 0ms
× check --issue=650 requires the github shape and a github issue id 0ms
× check under none ignores --issue 0ms
× check takes the tracker from package.json with --issue="" 1ms
× fidProblem with --issue absent matches today 1ms
× fidProblem names the issue-less rule 0ms
✓ ISSUE_LESS_FID is a slug with no all-digit word 0ms
✓ ISSUE_ID_PATTERNS match each tracker's issue id 0ms
✓ bkit fids parse (27)
✓ github: the marker wins over the branch 5ms
✓ linear: marker issue id and lowercased FID 4ms
✓ jira: marker issue key and lowercased FID 4ms
✓ none: the fid-only marker 4ms
✓ github: a malformed marker falls through to the branch 4ms
✓ linear: a malformed marker falls through to the branch 4ms
✓ jira: a malformed marker falls through to the branch 4ms
✓ none: a marker for another tracker is not this tracker's marker 4ms
✓ jira: a marker for another tracker is not this tracker's marker 4ms
✓ github: a marker for another tracker is not this tracker's marker 4ms
✓ linear: a marker for another tracker is not this tracker's marker 4ms
✓ github branch feat/341-three-runtimes -> FID 341-three-runtimes, issueId "341" 4ms
✓ github branch feat/341 -> FID 341, issueId "341" 4ms
✓ linear branch feat/abc-123-slug -> FID abc-123-slug, issueId "ABC-123" 4ms
✓ jira branch feat/mba-7-slug -> FID mba-7-slug, issueId "MBA-7" 4ms
✓ jira branch feat/ab2-7-slug -> FID ab2-7-slug, issueId "AB2-7" 4ms
✓ none branch feat/anything-goes -> FID anything-goes, issueId null 5ms
✓ github branch "dev" -> exit 3 (is not feat/{FID}) 4ms
✓ github branch "feat/" -> exit 3 (is not a slug) 4ms
✓ github branch "feat/Upper-case" -> exit 3 (is not a slug) 4ms
✓ github branch "feat/abc-x" -> exit 3 (embeds no github issue id) 4ms
✓ linear branch "feat/341-x" -> exit 3 (embeds no linear issue id) 4ms
✓ linear branch "feat/ab2-7-x" -> exit 3 (embeds no linear issue id) 4ms
✓ jira branch "feat/341-x" -> exit 3 (embeds no jira issue id) 4ms
✓ jira branch "feat/m-7-x" -> exit 3 (embeds no jira issue id) 4ms
✓ needs --marker or --branch 0ms
✓ marker absent and no branch -> exit 3 4ms
✓ issueIdOf (1)
✓ matches auto's CI_DEV derivation (first numeric or team-number prefix, uppercased) 0ms
✓ bkit fids find (6)
✓ names the one feature logged for the issue (exit 0), never a longer issue number 18ms
✓ matches a Linear issue case-insensitively 13ms
✓ matches a Jira issue case-insensitively 13ms
✓ lists every feature when several are logged (exit 4) 13ms
✓ exits 1 when nothing is logged, or docs/plans does not exist 27ms
✓ ignores a non-month folder and a file named like a feature 14ms
✓ bkit fids design (3)
✓ finds the feature's design doc in the given bucket (exit 0) 14ms
✓ falls back to the newest bucket holding it when the given bucket has none 18ms
✓ exits 1 for no design doc, another feature's doc, a plan only, or no docs/plans 25ms

⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids check --issue > check --issue="" accepts dev-ci-failures under github
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/fids.test.ts:157:20
155| "--issue=",
156| ]);
157| expect(r.code).toBe(0);
| ^
158| expect(r.json).toMatchObject({ valid: true, issueId: null });
159| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids check --issue > check --issue="" accepts dev-ci-failures under linear
FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids check --issue > check --issue="" accepts dev-ci-failures under jira
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/fids.test.ts:170:22
168| "--issue=",
169| ]);
170| expect(r.code).toBe(0);
| ^
171| expect(r.json).toMatchObject({ valid: true, issueId: null });
172| },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids check --issue > check --issue="" rejects a FID with an all-digit word under every wired tracker
AssertionError: github 123-fix: expected 2 to be 1 // Object.is equality

- Expected

* Received

- 1

* 2

❯ .bkit/core/engine/commands/workflow/fids.test.ts:184:45
182| "--issue=",
183| ]);
184| expect(r.code, `${tracker} ${fid}`).toBe(1);
| ^
185| expect(r.json).toMatchObject({ valid: false, issueId: null });
186| expect(r.err).toContain("issue-less");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids check --issue > check --tracker=any --issue="" applies the issue-less rule
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/fids.test.ts:198:21
196| "--issue=",
197| ]);
198| expect(ok.code).toBe(0);
| ^
199| const bad = await run(project(), ["check", "--fid=123-fix", "--tra…
200| expect(bad.code).toBe(1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids check --issue > check --issue=650 requires the github shape and a github issue id
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/fids.test.ts:207:7
205| expect(
206| (await run(project(), ["check", "--fid=650-x", "--tracker=github…
207| ).toBe(0);
| ^
208| expect(
209| (await run(project(), ["check", "--fid=dev-ci", "--tracker=githu…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/10]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids check --issue > check under none ignores --issue
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/fids.test.ts:230:96
228| it("check under none ignores --issue", async () => {
229| for (const issue of ["--issue=", "--issue=650"]) {
230| expect((await run(project(), ["check", "--fid=123-fix", "--track…
| ^
231| 0,
232| );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/10]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids check --issue > check takes the tracker from package.json with --issue=""
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/fids.test.ts:239:7
237| expect(
238| (await run(project("github"), ["check", "--fid=dev-ci-failures",…
239| ).toBe(0);
| ^
240| expect((await run(project("github"), ["check", "--fid=123-fix", "-…
241| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/10]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids check --issue > fidProblem with --issue absent matches today
AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string
❯ .bkit/core/engine/commands/workflow/fids.test.ts:245:44
243| it("fidProblem with --issue absent matches today", () => {
244| expect(fidProblem("341-x", "github")).toBeUndefined();
245| expect(fidProblem("dev-ci", "github")).toContain("does not match t…
| ^
246| expect(fidProblem("123-fix", "none")).toBeUndefined();
247| expect(fidProblem("x_y", "none")).toContain("does not match the no…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/10]⎯

FAIL .bkit/core/engine/commands/workflow/fids.test.ts > bkit fids check --issue > fidProblem names the issue-less rule
AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string
❯ .bkit/core/engine/commands/workflow/fids.test.ts:252:53
250| it("fidProblem names the issue-less rule", () => {
251| expect(fidProblem("dev-ci-failures", "linear", "")).toBeUndefined(…
252| expect(fidProblem("fix-2-retry", "linear", "")).toContain("issue-l…
| ^
253| expect(fidProblem("Dev", "github", "")).toContain("issue-less");
254| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/10]⎯

Test Files 1 failed (1)
Tests 10 failed | 77 passed (87)
Start at 12:56:03
Duration 486ms (tests 82%, transform 15%, import 2%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Dofz0m/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
