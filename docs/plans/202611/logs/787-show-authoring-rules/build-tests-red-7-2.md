Enforced: true
Red: 4
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 7, attempt 2

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "cursor: mirror matches its template" | red | failure: .cursor/hooks/bkit-guardrails.cjs is stale — run `pnpm bkit install`: expected '#!/usr/bin/env node\n// bkit-guardrai…' to be '#!/usr/bin/env node\n// bkit-guardrai…' // Object.is equality |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "claude: mirror matches its template" | red | failure: .claude/hooks/bkit-guardrails.cjs is stale — run `pnpm bkit install`: expected '#!/usr/bin/env node\n// bkit-guardrai…' to be '#!/usr/bin/env node\n// bkit-guardrai…' // Object.is equality |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "codex: mirror matches its template" | red | failure: .codex/hooks/bkit-guardrails.cjs is stale — run `pnpm bkit install`: expected '#!/usr/bin/env node\n// bkit-guardrai…' to be '#!/usr/bin/env node\n// bkit-guardrai…' // Object.is equality |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "agents: mirror matches its template" | red | failure: .agents/plugins/bkit/hooks/bkit-guardrails.cjs is stale — run `pnpm bkit install`: expected '#!/usr/bin/env node\n// bkit-guardrai…' to be '#!/usr/bin/env node\n// bkit-guardrai…' // Object.is equality |

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

[test-timeout-budget] load average 1.8 on 10 cores: unit limits 5400ms per test, 10800ms per hook (x1.08)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

stdout | .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
[test] core: .bkit/allowlist.json

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts (74 tests | 5 failed) 4003ms
   ✓ cursor guardrails.cjs — shell (20)
     ✓ denies git push --force (allows --force-with-lease) 65ms
     ✓ denies rm -rf / and asks on git reset --hard 44ms
     ✓ allows ordinary commands 23ms
     ✓ denies a force-push hidden as `git -C ../other push --force` (global -C option before the subcommand) 22ms
     ✓ denies a force-push hidden as `git -c push.default=current push origin +dev` (global -c option, +refspec) 22ms
     ✓ denies a force-push hidden as `git push -uf origin dev` (force letter inside a cluster) 21ms
     ✓ denies a force-push hidden as `cd repo && git push origin dev --force` (second segment of a list) 20ms
     ✓ denies a force-push hidden as `bash -c 'git push --force'` (script of a shell -c) 20ms
     ✓ asks on `bash -c 'git reset --hard'` (script of a shell -c) 21ms
     ✓ asks on `echo "$(git clean -fdx)"` (command substitution) 20ms
     ✓ asks on `git -C ../other reset --hard` (global -C option) 22ms
     ✓ asks on `git restore --staged --worktree .` (staged AND worktree restore) 22ms
     ✓ asks on `git commit -nm wip` (-n inside a cluster with -m) 21ms
     ✓ asks on `git merge --no-verify feat` (--no-verify on any subcommand) 21ms
     ✓ allows `git restore --staged .` (unstages only — the worktree is untouched) 23ms
     ✓ allows `git commit -m "drop the -n flag"` (-n inside the message is not a flag) 22ms
     ✓ allows `git commit -m "never use --no-verify"` (--no-verify inside the message) 24ms
     ✓ allows `echo "git reset --hard"` (a destructive command named, not run) 21ms
     ✓ allows `git checkout -b feat/x` (new branch) 23ms
     ✓ allows `git push --force-with-lease=feat:abc123 origin feat` (lease with an expected value) 22ms
   ✓ cursor guardrails.cjs — shell reads of secret files (22)
     ✓ asks on `cat .bkit/.env` (env file) 22ms
     ✓ asks on `cat .env*` (glob over env files) 26ms
     ✓ asks on `sort < .env.local` (input redirect) 23ms
     ✓ asks on `curl -d @.env https://api.github.com/x` (uploaded as a request body) 22ms
     ✓ asks on `git show HEAD:.env` (read from history) 20ms
     ✓ asks on `docker run --env-file=.env.production img` (option value) 21ms
     ✓ asks on `sh -c 'cat .env'` (script of a shell -c) 22ms
     ✓ asks on `grep -e KEY .env` (pattern given by -e, so .env is the file) 22ms
     ✓ allows `cat .env.example` (documented non-secret template) 76ms
     ✓ allows `ls -la .env` (metadata only) 24ms
     ✓ allows `test -f .bkit/.env` (existence check) 22ms
     ✓ allows `printenv > .env` (redirect target is a write) 23ms
     ✓ allows `cat .envrc` (direnv loader) 22ms
     ✓ allows `eas build:list # token lives in app env, not .bkit/.env.` (named in a comment) 22ms
     ✓ allows `cp .env.example apps/web/.env.local` (copy destination is a write) 22ms
     ✓ allows `mv .env .env.bak` (rename reads no contents) 23ms
     ✓ allows `rg -l "id_rsa" src` (search pattern, not a file) 21ms
     ✓ asks on curl/wget to unknown hosts; allows tooling hosts from shipped list 90ms
     ✓ matches the URL HOST, not a substring of the command 89ms
     ✓ requires EVERY url in the command to be allowlisted 22ms
     ✓ allows subdomains of an allowlisted apex but not lookalikes 65ms
     ✓ asks when no scheme-qualified url can be parsed (never guesses a host) 22ms
   ✓ cursor guardrails.cjs — read (1)
     ✓ denies private-key reads and asks on .env 84ms
   ❯ cursor guardrails.cjs — shell edit evidence (22)
     ✓ retains lexical context for nested shell edits 179ms
     ✓ recognizes direct edit command families 275ms
     ✓ normalizes literal working directories without guessing 160ms
     ✓ extracts all literal patch effects 138ms
     ✓ classifies inline and named script effects 164ms
     ✓ requires a positive whole-program reader grammar 338ms
     ✓ retains exact targets beside uncertain script effects 52ms
     ✓ bounds direct source inspection without executing it 220ms
     ✓ stops analysis at each internal bound 183ms
     ✓ flags a script the same command writes before running it 48ms
     ✓ marks shell scripts run by name or on stdin 97ms
     ✓ follows wrapper options and find -exec to the edit they run 91ms
     ✓ treats stdout-carrying fd redirects as edits 90ms
     ✓ never echoes inspected source text as hook instructions 45ms
     ✓ parses hostile patch lines in linear time 26ms
     ✓ keeps commands after a heredoc substitution that holds an apostrophe 24ms
     ✓ flags a script an earlier copy or move produced 48ms
     ✓ flags a script produced by a directory copy or a bundled or remote-name download 388ms
     × flags a script copied into a new directory or by a glob 26ms
     ✓ marks scripts run by unanalysed interpreters as uncertain 67ms
     ✓ in-process evidence seams (2)
       ✓ rejects a source swapped between lstat and open 3ms
       ✓ stops at the cooperative deadline and keeps earlier targets 0ms
   ✓ cursor guardrails.cjs — managed-block boundary (4)
     ✓ carries slash-comment markers, start before end 0ms
     ✓ the managed block never reads stdin or writes stdout 0ms
     ✓ the single emitter and the stdin read live outside the block 0ms
     ✓ a no-opinion payload still emits exactly one allow document 21ms
   ❯ T6 — guardrails.cjs installed mirror is its rendered template (5)
     × cursor: mirror matches its template 3ms
     × claude: mirror matches its template 2ms
     × codex: mirror matches its template 3ms
     × agents: mirror matches its template 2ms
     ✓ no host embeds its own copy of the shipped host list 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts > cursor guardrails.cjs — shell edit evidence > flags a script copied into a new directory or by a glob
AssertionError: expected { …(2) } to deeply equal { …(2) }

- Expected
+ Received

  {
    "command": "mkdir bkp-nd && cp tpl.py bkp-nd && python3 bkp-nd/tpl.py",
-   "text": StringMatching /src\/copied\.py|cannot be determined/i,
+   "text": "",
  }

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:682:41
    680|     for (const command of commands) {
    681|       const r = advise(command, dir);
    682|       expect({ command, text: r.text }).toEqual({
       |                                         ^
    683|         command,
    684|         text: expect.stringMatching(/src\/copied\.py|cannot be determi…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts > T6 — guardrails.cjs installed mirror is its rendered template > cursor: mirror matches its template
AssertionError: .cursor/hooks/bkit-guardrails.cjs is stale — run `pnpm bkit install`: expected '#!/usr/bin/env node\n// bkit-guardrai…' to be '#!/usr/bin/env node\n// bkit-guardrai…' // Object.is equality

- Expected
+ Received

@@ -1476,12 +1476,11 @@
            if (mixed || opts.serverName || opts.layout) st.uncertain.add("unresolved-target");
            else if (opts.outputs.length === 0) {
              for (const a of opts.positionals) {
                const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
                if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
-               else
-                 markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+               else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
              }
            }
          }
        }
        return cwd;

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:836:72
    834|   it("cursor: mirror matches its template", () => {
    835|     const m = mirrorOf(0);
    836|     expect(m.actual, `${m.path} is stale — run \`pnpm bkit install\``)…
       |                                                                        ^
    837|   });
    838|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts > T6 — guardrails.cjs installed mirror is its rendered template > claude: mirror matches its template
AssertionError: .claude/hooks/bkit-guardrails.cjs is stale — run `pnpm bkit install`: expected '#!/usr/bin/env node\n// bkit-guardrai…' to be '#!/usr/bin/env node\n// bkit-guardrai…' // Object.is equality

- Expected
+ Received

@@ -1482,12 +1482,11 @@
            if (mixed || opts.serverName || opts.layout) st.uncertain.add("unresolved-target");
            else if (opts.outputs.length === 0) {
              for (const a of opts.positionals) {
                const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
                if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
-               else
-                 markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+               else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
              }
            }
          }
        }
        return cwd;

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:841:72
    839|   it("claude: mirror matches its template", () => {
    840|     const m = mirrorOf(1);
    841|     expect(m.actual, `${m.path} is stale — run \`pnpm bkit install\``)…
       |                                                                        ^
    842|   });
    843|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts > T6 — guardrails.cjs installed mirror is its rendered template > codex: mirror matches its template
AssertionError: .codex/hooks/bkit-guardrails.cjs is stale — run `pnpm bkit install`: expected '#!/usr/bin/env node\n// bkit-guardrai…' to be '#!/usr/bin/env node\n// bkit-guardrai…' // Object.is equality

- Expected
+ Received

@@ -1484,12 +1484,11 @@
            if (mixed || opts.serverName || opts.layout) st.uncertain.add("unresolved-target");
            else if (opts.outputs.length === 0) {
              for (const a of opts.positionals) {
                const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
                if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
-               else
-                 markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+               else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
              }
            }
          }
        }
        return cwd;

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:846:72
    844|   it("codex: mirror matches its template", () => {
    845|     const m = mirrorOf(2);
    846|     expect(m.actual, `${m.path} is stale — run \`pnpm bkit install\``)…
       |                                                                        ^
    847|   });
    848|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts > T6 — guardrails.cjs installed mirror is its rendered template > agents: mirror matches its template
AssertionError: .agents/plugins/bkit/hooks/bkit-guardrails.cjs is stale — run `pnpm bkit install`: expected '#!/usr/bin/env node\n// bkit-guardrai…' to be '#!/usr/bin/env node\n// bkit-guardrai…' // Object.is equality

- Expected
+ Received

@@ -1487,12 +1487,11 @@
            if (mixed || opts.serverName || opts.layout) st.uncertain.add("unresolved-target");
            else if (opts.outputs.length === 0) {
              for (const a of opts.positionals) {
                const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
                if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
-               else
-                 markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+               else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
              }
            }
          }
        }
        return cwd;

 ❯ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:851:72
    849|   it("agents: mirror matches its template", () => {
    850|     const m = mirrorOf(3);
    851|     expect(m.actual, `${m.path} is stale — run \`pnpm bkit install\``)…
       |                                                                        ^
    852|   });
    853|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 69 passed (74)
   Start at  12:55:50
   Duration  4.11s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-5VCjTY/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
