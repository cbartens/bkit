> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/close-squash.integration.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/audits/workflows/close-squash.integration.test.ts (13 tests | 1 failed) 8852ms
✓ bkit-design.md local close squash (6)
✓ lands past another session's uncommitted edit to a file the close changes, and keeps the edit 695ms
✓ lands without pushing local dev's own commits, and leaves local dev where it was 688ms
✓ leaves the main checkout on its branch and moves only the dev pointer 718ms
✓ keeps feat/{FID} and pushes nothing when the squash does not carry this run's doc 554ms
✓ commits only the squash and bookkeeping, never another session's staged doc 688ms
✓ lands this run's doc and then removes the branch, leaving unrelated edits alone 671ms
✓ bkit-plan.md local close squash (6)
✓ lands past another session's uncommitted edit to a file the close changes, and keeps the edit 661ms
✓ lands without pushing local dev's own commits, and leaves local dev where it was 678ms
✓ leaves the main checkout on its branch and moves only the dev pointer 709ms
✓ keeps feat/{FID} and pushes nothing when the squash does not carry this run's doc 545ms
✓ commits only the squash and bookkeeping, never another session's staged doc 680ms
✓ lands this run's doc and then removes the branch, leaving unrelated edits alone 706ms
❯ bkit-design.md close with no issue (1)
× lands an issue-less run with a FID-only marker 859ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/workflows/close-squash.integration.test.ts > bkit-design.md close with no issue > lands an issue-less run with a FID-only marker
AssertionError: [bkit-branches] gh-preflight: runtimeGithubCli=false (exit=4 err='')
[bkit-branches] git hooks skipped in the throwaway dev checkout — it lands bookkeeping only
[bkit-branches] pre-existing docs/roadmap.md had no marker pair — its content is preserved under notes-post
[bkit-branches] origin refused the dev push — closing through a PR instead: remote: dev is protected  
To /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-close-squash-qVzoBK/remote.git
! [remote rejected] HEAD -> dev (pre-receive hook declined)
error: failed to push some refs to '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-close-squash-qVzoBK/remote.git'
[bkit-branches] pre-existing docs/roadmap.md had no marker pair — its content is preserved under notes-post
[bkit-branches] pushed feat/dev-close-squash (--force-with-lease)
[bkit-branches] --fid "dev-close-squash" is not a github FID slug
: expected 2 to be 80 // Object.is equality

- Expected

* Received

- 80

* 2

❯ .bkit/core/engine/audits/workflows/close-squash.integration.test.ts:266:36
264| });
265|
266| expect(res.status, res.stderr).toBe(80);
| ^
267| const printed = JSON.parse(res.stdout) as { stage: string; body: s…
268| expect(printed.stage).toBe("open");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

Test Files 1 failed (1)
Tests 1 failed | 12 passed (13)
Start at 13:05:27
Duration 8.93s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-4jc8Lh/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
