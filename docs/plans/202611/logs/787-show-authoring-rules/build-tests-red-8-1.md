Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 8, attempt 1

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 26 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "keeps edit advice beside an off-list fetch" | red | failure: expected 'Command requires confirmation: curl h…' to contain 'edits files through the shell' |
| 27 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "analyses dense script sources in linear time" | red | failure: expected 2438 to be less than 1000 |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts

[test-timeout-budget] load average 2.6 on 10 cores: unit limits 5800ms per test, 11600ms per hook (x1.16)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

stdout | .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
[test] core: .bkit/allowlist.json

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts (76 tests | 2 failed) 6036ms
   ✓ cursor guardrails.cjs — shell (20)
     ✓ denies git push --force (allows --force-with-lease) 65ms
     ✓ denies rm -rf / and asks on git reset --hard 41ms
     ✓ allows ordinary commands 21ms
     ✓ denies a force-push hidden as `git -C ../other push --force` (global -C option before the subcommand) 20ms
     ✓ denies a force-push hidden as `git -c push.default=current push origin +dev` (global -c option, +refspec) 20ms
     ✓ denies a force-push hidden as `git push -uf origin dev` (force letter inside a cluster) 19ms
     ✓ denies a force-push hidden as `cd repo && git push origin dev --force` (second segment of a list) 21ms
     ✓ denies a force-push hidden as `bash -c 'git push --force'` (script of a shell -c) 21ms
     ✓ asks on `bash -c 'git reset --hard'` (script of a shell -c) 20ms
     ✓ asks on `echo "$(git clean -fdx)"` (command substitution) 19ms
     ✓ asks on `git -C ../other reset --hard` (global -C option) 19ms
     ✓ asks on `git restore --staged --worktree .` (staged AND worktree restore) 20ms
     ✓ asks on `git commit -nm wip` (-n inside a cluster with -m) 20ms
     ✓ asks on `git merge --no-verify feat` (--no-verify on any subcommand) 21ms
     ✓ allows `git restore --staged .` (unstages only — the worktree is untouched) 21ms
     ✓ allows `git commit -m "drop the -n flag"` (-n inside the message is not a flag) 22ms
     ✓ allows `git commit -m "never use --no-verify"` (--no-verify inside the message) 23ms
     ✓ allows `echo "git reset --hard"` (a destructive command named, not run) 20ms
     ✓ allows `git checkout -b feat/x` (new branch) 20ms
     ✓ allows `git push --force-with-lease=feat:abc123 origin feat` (lease with an expected value) 20ms
   ✓ cursor guardrails.cjs — shell reads of secret files (22)
     ✓ asks on `cat .bkit/.env` (env file) 19ms
     ✓ asks on `cat .env*` (glob over env files) 20ms
     ✓ asks on `sort < .env.local` (input redirect) 20ms
     ✓ asks on `curl -d @.env https://api.github.com/x` (uploaded as a request body) 21ms
     ✓ asks on `git show HEAD:.env` (read from history) 20ms
     ✓ asks on `docker run --env-file=.env.production img` (option value) 22ms
     ✓ asks on `sh -c 'cat .env'` (script of a shell -c) 21ms
     ✓ asks on `grep -e KEY .env` (pattern given by -e, so .env is the file) 21ms
     ✓ allows `cat .env.example` (documented non-secret template) 21ms
     ✓ allows `ls -la .env` (metadata only) 20ms
     ✓ allows `test -f .bkit/.env` (existence check) 20ms
     ✓ allows `printenv > .env` (redirect target is a write) 20ms
     ✓ allows `cat .envrc` (direnv loader) 20ms
     ✓ allows `eas build:list # token lives in app env, not .bkit/.env.` (named in a comment) 24ms
     ✓ allows `cp .env.example apps/web/.env.local` (copy destination is a write) 22ms
     ✓ allows `mv .env .env.bak` (rename reads no contents) 22ms
     ✓ allows `rg -l "id_rsa" src` (search pattern, not a file) 21ms
     ✓ asks on curl/wget to unknown hosts; allows tooling hosts from shipped list 86ms
     ✓ matches the URL HOST, not a substring of the command 85ms
     ✓ requires EVERY url in the command to be allowlisted 22ms
     ✓ allows subdomains of an allowlisted apex but not lookalikes 63ms
     ✓ asks when no scheme-qualified url can be parsed (never guesses a host) 22ms
   ✓ cursor guardrails.cjs — read (1)
     ✓ denies private-key reads and asks on .env 80ms
   ❯ cursor guardrails.cjs — shell edit evidence (24)
     ✓ retains lexical context for nested shell edits 174ms
     ✓ recognizes direct edit command families 267ms
     ✓ normalizes literal working directories without guessing 128ms
     ✓ extracts all literal patch effects 132ms
     ✓ classifies inline and named script effects 151ms
     ✓ requires a positive whole-program reader grammar 217ms
     ✓ retains exact targets beside uncertain script effects 24ms
     ✓ bounds direct source inspection without executing it 131ms
     ✓ stops analysis at each internal bound 179ms
     ✓ flags a script the same command writes before running it 53ms
     ✓ marks shell scripts run by name or on stdin 86ms
     ✓ follows wrapper options and find -exec to the edit they run 84ms
     ✓ treats stdout-carrying fd redirects as edits 88ms
     ✓ never echoes inspected source text as hook instructions 44ms
     ✓ parses hostile patch lines in linear time 24ms
     ✓ keeps commands after a heredoc substitution that holds an apostrophe 23ms
     ✓ flags a script an earlier copy or move produced 46ms
     ✓ flags a script produced by a directory copy or a bundled or remote-name download 371ms
     ✓ flags a script copied into a new directory or by a glob 67ms
     × keeps edit advice beside an off-list fetch 25ms
     × analyses dense script sources in linear time 2439ms
     ✓ marks scripts run by unanalysed interpreters as uncertain 64ms
     ✓ in-process evidence seams (2)
       ✓ rejects a source swapped between lstat and open 2ms
       ✓ stops at the cooperative deadline and keeps earlier targets 0ms
   ✓ cursor guardrails.cjs — managed-block boundary (4)
     ✓ carries slash-comment markers, start before end 0ms
     ✓ the managed block never reads stdin or writes stdout 0ms
     ✓ the single emitter and the stdin read live outside the block 0ms
     ✓ a no-opinion payload still emits exactly one allow document 22ms
   ✓ T6 — guardrails.cjs installed mirror is its rendered template (5)
     ✓ cursor: mirror matches its template 1ms
     ✓ claude: mirror matches its template 0ms
     ✓ codex: mirror matches its template 0ms
     ✓ agents: mirror matches its template 0ms
     ✓ no host embeds its own copy of the shipped host list 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts > cursor guardrails.cjs — shell edit evidence > keeps edit advice beside an off-list fetch
AssertionError: expected 'Command requires confirmation: curl h…' to contain 'edits files through the shell'

Expected: "edits files through the shell"
Received: "Command requires confirmation: curl https://off-list.example/x -o /dev/null && sed -i s/a/b/ src/fetch-edit.ts"

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:696:20
    694|     );
    695|     expect(r.permission).toBe("ask");
    696|     expect(r.text).toContain("edits files through the shell");
       |                    ^
    697|     expect(r.text).toContain("src/fetch-edit.ts");
    698|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts > cursor guardrails.cjs — shell edit evidence > analyses dense script sources in linear time
AssertionError: expected 2438 to be less than 1000
 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:704:18
    702|     const r = advise("node -e '" + "a;".repeat(125 * 1024) + "'", dir);
    703|     expect(r.permission).toBe("allow");
    704|     expect(r.ms).toBeLessThan(1000);
       |                  ^
    705|   });
    706|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 74 passed (76)
   Start at  22:00:52
   Duration  6.12s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-u5tU1O/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
