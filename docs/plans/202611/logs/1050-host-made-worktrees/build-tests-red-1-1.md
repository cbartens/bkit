Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1050-host-made-worktrees-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/lib.test.ts` "a host-made linked worktree holds the run" | red | failure: expected { …(2) } to deeply equal { …(2) } |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/lib.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/lib.test.ts

```

## Runner output — `.bkit/core/engine/commands/lib.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/lib.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees

 ❯ .bkit/core/engine/commands/lib.test.ts (79 tests | 1 failed) 3390ms
   ✓ parseFlags (20)
     ✓ accepts --flag=value and --flag value, camelCases kebab names 2ms
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
     ✓ runs a verb: text on stdout, tagged log on stderr 0ms
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
     ✓ every verb's text output reads back as its --json output, less its textOmit keys 11ms
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
   ❯ repo facts on a real repository (5)
     ✓ repoRoot resolves the main checkout from inside a linked worktree 110ms
     ✓ repoRoot outside a repository is a usage error 11ms
     ✓ design / plan / build / debug: worktree copy when it exists, else the main checkout 105ms
     × a host-made linked worktree holds the run 149ms
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 133ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1318ms
     ✓ runGit keeps output past Node's 1MB default 57ms
     ✓ runGit names ENOBUFS when output passes the limit 505ms
     ✓ runGit names a spawn error instead of failing silently 2ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 482ms
     ✓ runTool still reports a missing binary as not found 2ms
   ✓ resolveActiveRun (4)
     ✓ resolveActiveRun falls back to the cwd scan when --file names a non-status file 31ms
     ✓ still takes a status.jsonl --file as the run itself 20ms
     ✓ never files a --fid call under another feature's in-progress run 42ms
     ✓ finds a --fid run that started in an earlier month through the scan 40ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 194ms
     ✓ writes the engine-call row for an invocation-bound command 80ms
   ✓ bounded correction eligibility (1)
     ✓ exposes no-write correction eligibility only for declared pre-effect validation 1ms
   ✓ tests-lock status file (3)
     ✓ a lock wait is read from the status file and a reworded script sentence changes nothing 1ms
     ✓ a run stopped at the hold limit reads as could-not-run, never as a gate failure 0ms
     ✓ a status file for another lock or an empty one reads as a gate result 1ms
   ✓ writeInvocation folder mode (2)
     ✓ writeInvocation creates invocation-context owner-only 39ms
     ✓ writeInvocation narrows an existing invocation-context to 0700 38ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/lib.test.ts > repo facts on a real repository > a host-made linked worktree holds the run
AssertionError: expected { …(2) } to deeply equal { …(2) }

- Expected
+ Received

  {
-   "bookRoot": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-host-WrUfE2/wt",
-   "path": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-host-WrUfE2/wt/docs/plans/202610/logs/7-host/status.jsonl",
+   "bookRoot": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-lib-9WR5PA",
+   "path": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-lib-9WR5PA/docs/plans/202610/logs/7-host/status.jsonl",
  }

 ❯ .bkit/core/engine/commands/lib.test.ts:708:34
    706|     // Only the log directory exists: the host worktree still holds th…
    707|     fs.mkdirSync(path.dirname(path.join(host, rel)), { recursive: true…
    708|     expect(statusLocation(opts)).toEqual({ bookRoot: host, path: path.…
       |                                  ^
    709|     // The status file is written: same answer.
    710|     touch(path.join(host, rel));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 78 passed (79)
   Start at  15:43:31
   Duration  3.73s (tests 93%, import 4%, transform 2%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-T3ZP9I/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
