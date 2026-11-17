Enforced: true
Red: 4
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 14 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "flags a script the same command writes before running it" | red | failure: expected '' to match /sr…/tmp-script\.py\|cannot be determined |
| 15 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "marks shell scripts run by name or on stdin" | red | failure: expected { command: 'bash fix.sh', text: '' } to deeply equal { command: 'bash fix.sh', …(1) } |
| 16 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "follows wrapper options and find -exec to the edit they run" | red | failure: expected '' to contain 'src/timeout.ts' |
| 17 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "treats stdout-carrying fd redirects as edits" | red | failure: expected '' to contain 'src/amp.ts' |

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

[test-timeout-budget] load average 26.3 on 10 cores: unit limits 17650ms per test, 35300ms per hook (x3.53)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

stdout | .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
[test] core: .bkit/allowlist.json

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts (66 tests | 4 failed) 4175ms
   ✓ cursor guardrails.cjs — shell (20)
     ✓ denies git push --force (allows --force-with-lease) 125ms
     ✓ denies rm -rf / and asks on git reset --hard 73ms
     ✓ allows ordinary commands 34ms
     ✓ denies a force-push hidden as `git -C ../other push --force` (global -C option before the subcommand) 36ms
     ✓ denies a force-push hidden as `git -c push.default=current push origin +dev` (global -c option, +refspec) 35ms
     ✓ denies a force-push hidden as `git push -uf origin dev` (force letter inside a cluster) 34ms
     ✓ denies a force-push hidden as `cd repo && git push origin dev --force` (second segment of a list) 34ms
     ✓ denies a force-push hidden as `bash -c 'git push --force'` (script of a shell -c) 36ms
     ✓ asks on `bash -c 'git reset --hard'` (script of a shell -c) 33ms
     ✓ asks on `echo "$(git clean -fdx)"` (command substitution) 34ms
     ✓ asks on `git -C ../other reset --hard` (global -C option) 34ms
     ✓ asks on `git restore --staged --worktree .` (staged AND worktree restore) 35ms
     ✓ asks on `git commit -nm wip` (-n inside a cluster with -m) 35ms
     ✓ asks on `git merge --no-verify feat` (--no-verify on any subcommand) 31ms
     ✓ allows `git restore --staged .` (unstages only — the worktree is untouched) 31ms
     ✓ allows `git commit -m "drop the -n flag"` (-n inside the message is not a flag) 30ms
     ✓ allows `git commit -m "never use --no-verify"` (--no-verify inside the message) 32ms
     ✓ allows `echo "git reset --hard"` (a destructive command named, not run) 31ms
     ✓ allows `git checkout -b feat/x` (new branch) 30ms
     ✓ allows `git push --force-with-lease=feat:abc123 origin feat` (lease with an expected value) 30ms
   ✓ cursor guardrails.cjs — shell reads of secret files (22)
     ✓ asks on `cat .bkit/.env` (env file) 31ms
     ✓ asks on `cat .env*` (glob over env files) 28ms
     ✓ asks on `sort < .env.local` (input redirect) 28ms
     ✓ asks on `curl -d @.env https://api.github.com/x` (uploaded as a request body) 29ms
     ✓ asks on `git show HEAD:.env` (read from history) 27ms
     ✓ asks on `docker run --env-file=.env.production img` (option value) 28ms
     ✓ asks on `sh -c 'cat .env'` (script of a shell -c) 27ms
     ✓ asks on `grep -e KEY .env` (pattern given by -e, so .env is the file) 28ms
     ✓ allows `cat .env.example` (documented non-secret template) 29ms
     ✓ allows `ls -la .env` (metadata only) 29ms
     ✓ allows `test -f .bkit/.env` (existence check) 32ms
     ✓ allows `printenv > .env` (redirect target is a write) 32ms
     ✓ allows `cat .envrc` (direnv loader) 31ms
     ✓ allows `eas build:list # token lives in app env, not .bkit/.env.` (named in a comment) 31ms
     ✓ allows `cp .env.example apps/web/.env.local` (copy destination is a write) 30ms
     ✓ allows `mv .env .env.bak` (rename reads no contents) 31ms
     ✓ allows `rg -l "id_rsa" src` (search pattern, not a file) 30ms
     ✓ asks on curl/wget to unknown hosts; allows tooling hosts from shipped list 120ms
     ✓ matches the URL HOST, not a substring of the command 116ms
     ✓ requires EVERY url in the command to be allowlisted 31ms
     ✓ allows subdomains of an allowlisted apex but not lookalikes 92ms
     ✓ asks when no scheme-qualified url can be parsed (never guesses a host) 37ms
   ✓ cursor guardrails.cjs — read (1)
     ✓ denies private-key reads and asks on .env 121ms
   ❯ cursor guardrails.cjs — shell edit evidence (15)
     ✓ retains lexical context for nested shell edits 242ms
     ✓ recognizes direct edit command families 369ms
     ✓ normalizes literal working directories without guessing 185ms
     ✓ extracts all literal patch effects 185ms
     ✓ classifies inline and named script effects 231ms
     ✓ requires a positive whole-program reader grammar 318ms
     ✓ retains exact targets beside uncertain script effects 35ms
     ✓ bounds direct source inspection without executing it 219ms
     ✓ stops analysis at each internal bound 322ms
     × flags a script the same command writes before running it 49ms
     × marks shell scripts run by name or on stdin 43ms
     × follows wrapper options and find -exec to the edit they run 73ms
     × treats stdout-carrying fd redirects as edits 39ms
     ✓ in-process evidence seams (2)
       ✓ rejects a source swapped between lstat and open 3ms
       ✓ stops at the cooperative deadline and keeps earlier targets 1ms
   ✓ cursor guardrails.cjs — managed-block boundary (4)
     ✓ carries slash-comment markers, start before end 0ms
     ✓ the managed block never reads stdin or writes stdout 0ms
     ✓ the single emitter and the stdin read live outside the block 0ms
     ✓ a no-opinion payload still emits exactly one allow document 36ms
   ✓ T6 — guardrails.cjs installed mirror is its rendered template (4)
     ✓ cursor: mirror matches its template 2ms
     ✓ claude: mirror matches its template 1ms
     ✓ codex: mirror matches its template 1ms
     ✓ no host embeds its own copy of the shipped host list 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts > cursor guardrails.cjs — shell edit evidence > flags a script the same command writes before running it
AssertionError: expected '' to match /sr…/tmp-script\.py|cannot be determined

- Expected:
/src\/tmp-script\.py|cannot be determined/i

+ Received:
""

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:538:26
    536|       dir,
    537|     );
    538|     expect(heredoc.text).toMatch(/src\/tmp-script\.py|cannot be determ…
       |                          ^
    539|     expect(heredoc.permission).toBe("allow");
    540|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts > cursor guardrails.cjs — shell edit evidence > marks shell scripts run by name or on stdin
AssertionError: expected { command: 'bash fix.sh', text: '' } to deeply equal { command: 'bash fix.sh', …(1) }

- Expected
+ Received

  {
    "command": "bash fix.sh",
-   "text": StringMatching /src\/sh-named\.ts|cannot be determined/i,
+   "text": "",
  }

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:551:41
    549|     for (const command of ["bash fix.sh", "./fix.sh"]) {
    550|       const r = advise(command, dir);
    551|       expect({ command, text: r.text }).toEqual({
       |                                         ^
    552|         command,
    553|         text: expect.stringMatching(/src\/sh-named\.ts|cannot be deter…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts > cursor guardrails.cjs — shell edit evidence > follows wrapper options and find -exec to the edit they run
AssertionError: expected '' to contain 'src/timeout.ts'

- Expected
+ Received

- src/timeout.ts

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:566:72
    564|     const dir = workDir("wrapopts");
    565|     expect(advise("sudo -u me sed -i s/a/b/ src/sudo-u.ts", dir).text)…
    566|     expect(advise("timeout 5 sed -i s/a/b/ src/timeout.ts", dir).text)…
       |                                                                        ^
    567|     expect(advise("xargs -I{} sed -i s/a/b/ {} < list.txt", dir).text)…
    568|     expect(advise("find src -name '*.ts' -exec sed -i s/a/b/ {} +", di…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts > cursor guardrails.cjs — shell edit evidence > treats stdout-carrying fd redirects as edits
AssertionError: expected '' to contain 'src/amp.ts'

- Expected
+ Received

- src/amp.ts

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:573:54
    571|   it("treats stdout-carrying fd redirects as edits", () => {
    572|     const dir = workDir("fdredir");
    573|     expect(advise("echo x &> src/amp.ts", dir).text).toContain("src/am…
       |                                                      ^
    574|     expect(advise("echo x &>> src/amp-append.ts", dir).text).toContain…
    575|     expect(advise("echo x 1> src/fd1.ts", dir).text).toContain("src/fd…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 62 passed (66)
   Start at  13:04:49
   Duration  4.41s (tests 97%, transform 1%, setup 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-75Bv5x/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
