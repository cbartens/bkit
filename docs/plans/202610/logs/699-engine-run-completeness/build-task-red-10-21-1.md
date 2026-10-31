
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bash scripts/ci/test-file.sh .bkit/core/engine/commands/lib.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/lib.test.ts (67 tests | 1 failed) 1340ms
   ✓ parseFlags (20)
     ✓ accepts --flag=value and --flag value, camelCases kebab names 1ms
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
     ✓ runs a verb: text on stdout, tagged log on stderr 1ms
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
     ✓ every verb's text output reads back as its --json output, less its textOmit keys 7ms
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
     ✓ repoRoot resolves the main checkout from inside a linked worktree 105ms
     ✓ repoRoot outside a repository is a usage error 15ms
     ✓ design / plan / build / debug: worktree copy when it exists, else the main checkout 99ms
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 119ms
   ✓ runGit / runTool output limit (5)
     ✓ runGit keeps output past Node's 1MB default 52ms
     ✓ runGit names ENOBUFS when output passes the limit 422ms
     ✓ runGit names a spawn error instead of failing silently 5ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 417ms
     ✓ runTool still reports a missing binary as not found 38ms
   ❯ resolveActiveRun (2)
     × resolveActiveRun falls back to the cwd scan when --file names a non-status file 28ms
     ✓ still takes a status.jsonl --file as the run itself 20ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/lib.test.ts > resolveActiveRun > resolveActiveRun falls back to the cwd scan when --file names a non-status file
AssertionError: expected undefined to deeply equal { workflow: 'build', …(2) }

- Expected:
{
  "bookRoot": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-active-run-B5Ijj1",
  "file": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-active-run-B5Ijj1/docs/plans/202610/logs/901-x/status.jsonl",
  "workflow": "build",
}

+ Received:
undefined

 ❯ .bkit/core/engine/commands/lib.test.ts:773:17
    771|     const { cwd, status } = treeWithOneRun();
    772|     const run = resolveActiveRun({ cwd, file: "docs/plans/202610/x-pla…
    773|     expect(run).toEqual({ workflow: "build", file: status, bookRoot: c…
       |                 ^
    774|   });
    775|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 66 passed (67)
   Start at  17:58:53
   Duration  2.15s (tests 65%, transform 28%, import 5%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-QyR8Z9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
