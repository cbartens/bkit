Enforced: true
Red: 10
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a named lock is machine-wide: checkouts of two different repos wait on the same named lock" | red | failure: ENOENT: no such file or directory, copyfile '/Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh' -> '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-yR5z1P/first-repo/scripts/ci/bkit-machine-lock.sh' |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "one process holds a named lock and the unnamed stack lock side by side" | red | failure: bash: line 1: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory bash: line 1: take_local_stack_lock: command not found : expected 11 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a runner started by a named-lock holder does not wait on that named lock" | red | failure: bash: line 1: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory bash: line 1: take_local_stack_lock: command not found : expected 11 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other" | red | failure: expected '' to be '/private/var/folders/td/lj74ml2d0jz3t…' // Object.is equality |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run --lock holds the named lock for the command and passes its exit status on" | red | failure: bash: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory : expected 127 to be 7 // Object.is equality |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 75 when the wait gives up, distinct from the command's own failure" | red | failure: holder blocking tests gate exited before writing /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-QU4MgE/cache/bkit/machine-lock/tests.lock.holder |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 73 naming the path when the lock dir cannot be written" | red | failure: expected 127 to be 73 // Object.is equality |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 73 naming /usr/bin/perl when perl is missing" | red | failure: ENOENT: no such file or directory, open '/Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh' |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy" | red | failure: holder separate stack holder exited before writing .holder |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name" | red | failure: bash: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory : expected 127 to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/machine-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/machine-lock.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts (26 tests | 26 failed) 332ms
   ❯ bkit-machine-lock.sh (26)
     × a second run cannot take the lock while the first holds it, and is told who holds it 34ms
     × a killed holder leaves no stale lock 32ms
     × a waiting run starts as soon as the holder finishes, having said who it waits for 33ms
     × the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder 33ms
     × release frees the lock before the caller exits 9ms
     × a caller under `set -e` survives a refused try 32ms
     × a caller under `set -e` survives releasing a holder that is already gone 7ms
     × a runner started by the holder does not wait on its parent 6ms
     × a stack named by BKIT_LOCAL_STACK never waits on the shared one 31ms
     × every worktree of one repo resolves the main checkout's lock, and waits on it 1ms
     × outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why 0ms
     × a holder that stops before it answers fails the take at once instead of hanging 0ms
     × CI=true is a no-op that creates no lock file 7ms
     × CI=1 is a no-op that creates no lock file 6ms
     × `run` holds the lock for the command and passes its exit status on 6ms
     × `run` with no arguments prints usage and exits 2 5ms
     × a named lock is machine-wide: checkouts of two different repos wait on the same named lock 1ms
     × one process holds a named lock and the unnamed stack lock side by side 5ms
     × a runner started by a named-lock holder does not wait on that named lock 5ms
     × the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 5ms
     × run --lock holds the named lock for the command and passes its exit status on 4ms
     × run exits 75 when the wait gives up, distinct from the command's own failure 27ms
     × run exits 73 naming the path when the lock dir cannot be written 5ms
     × run exits 73 naming /usr/bin/perl when perl is missing 0ms
     × a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 31ms
     × run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 5ms

⎯⎯⎯⎯⎯⎯ Failed Tests 26 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a second run cannot take the lock while the first holds it, and is told who holds it
Error: holder first run exited before writing .holder
 ❯ waitForHolder .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:98:13
     96|     if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes…
     97|     if (child.exitCode !== null || child.signalCode !== null) {
     98|       throw new Error("holder " + who + " exited before writing " + fi…
       |             ^
     99|     }
    100|     await delay(25);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:159:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a killed holder leaves no stale lock
Error: holder killed run exited before writing .holder
 ❯ waitForHolder .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:98:13
     96|     if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes…
     97|     if (child.exitCode !== null || child.signalCode !== null) {
     98|       throw new Error("holder " + who + " exited before writing " + fi…
       |             ^
     99|     }
    100|     await delay(25);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:169:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a waiting run starts as soon as the holder finishes, having said who it waits for
Error: holder short run exited before writing .holder
 ❯ waitForHolder .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:98:13
     96|     if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes…
     97|     if (child.exitCode !== null || child.signalCode !== null) {
     98|       throw new Error("holder " + who + " exited before writing " + fi…
       |             ^
     99|     }
    100|     await delay(25);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:181:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder
Error: holder long run exited before writing .holder
 ❯ waitForHolder .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:98:13
     96|     if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes…
     97|     if (child.exitCode !== null || child.signalCode !== null) {
     98|       throw new Error("holder " + who + " exited before writing " + fi…
       |             ^
     99|     }
    100|     await delay(25);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:193:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > release frees the lock before the caller exits
AssertionError: bash: line 1: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory
bash: line 1: take_local_stack_lock: command not found
: expected '' to contain 'released'

- Expected
+ Received

- released

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:210:32
    208|       envFor(),
    209|     );
    210|     expect(r.stdout, r.stderr).toContain("released");
       |                                ^
    211|     expect(r.status).toBe(0);
    212|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a caller under `set -e` survives a refused try
Error: holder busy run exited before writing .holder
 ❯ waitForHolder .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:98:13
     96|     if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes…
     97|     if (child.exitCode !== null || child.signalCode !== null) {
     98|       throw new Error("holder " + who + " exited before writing " + fi…
       |             ^
     99|     }
    100|     await delay(25);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:217:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a caller under `set -e` survives releasing a holder that is already gone
AssertionError: bash: line 1: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory
bash: line 1: take_local_stack_lock: command not found
: expected '' to contain 'after-release'

- Expected
+ Received

- after-release

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:227:38
    225|       envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" }),
    226|     );
    227|     expect(gone.stdout, gone.stderr).toContain("after-release");
       |                                      ^
    228|   });
    229|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a runner started by the holder does not wait on its parent
AssertionError: bash: line 1: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory
bash: line 1: take_local_stack_lock: command not found
: expected '' to contain 'nested-ok'

- Expected
+ Received

- nested-ok

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:236:32
    234|       envFor(),
    235|     );
    236|     expect(r.stdout, r.stderr).toContain("nested-ok");
       |                                ^
    237|     expect(r.stderr).not.toContain("waiting");
    238|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a stack named by BKIT_LOCAL_STACK never waits on the shared one
Error: holder shared run exited before writing .holder
 ❯ waitForHolder .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:98:13
     96|     if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes…
     97|     if (child.exitCode !== null || child.signalCode !== null) {
     98|       throw new Error("holder " + who + " exited before writing " + fi…
       |             ^
     99|     }
    100|     await delay(25);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:243:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > every worktree of one repo resolves the main checkout's lock, and waits on it
Error: ENOENT: no such file or directory, copyfile '/Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh' -> '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-4vAU67/app-main/scripts/ci/bkit-machine-lock.sh'
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:258:8
    256|     const worktree = path.join(tmp, "app-feature");
    257|     fs.mkdirSync(path.join(main, "scripts", "ci"), { recursive: true }…
    258|     fs.copyFileSync(SCRIPT, path.join(main, "scripts", "ci", "bkit-mac…
       |        ^
    259|     git(tmp, ["init", "-q", "-b", "dev", main]);
    260|     git(main, ["add", "."]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why
Error: ENOENT: no such file or directory, copyfile '/Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh' -> '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-LTiCEb/loose/bkit-machine-lock.sh'
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:281:8
    279|     const loose = path.join(tmp, "loose");
    280|     fs.mkdirSync(loose);
    281|     fs.copyFileSync(SCRIPT, path.join(loose, "bkit-machine-lock.sh"));
       |        ^
    282|     const r = run(
    283|       `take_local_stack_lock "loose run"`,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a holder that stops before it answers fails the take at once instead of hanging
Error: ENOENT: no such file or directory, open '/Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh'
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:294:21
    292|   it("a holder that stops before it answers fails the take at once ins…
    293|     const broken = path.join(tmp, "broken-lock.sh");
    294|     const text = fs.readFileSync(SCRIPT, "utf-8");
       |                     ^
    295|     expect(text).toContain("/usr/bin/perl -e '\n");
    296|     fs.writeFileSync(broken, text.replace("/usr/bin/perl -e '\n", "/us…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > CI=true is a no-op that creates no lock file
 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > CI=1 is a no-op that creates no lock file
AssertionError: bash: line 1: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory
bash: line 1: take_local_stack_lock: command not found
: expected '' to contain 'ok'

- Expected
+ Received

- ok

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:305:32
    303|   it.each(["true", "1"])("CI=%s is a no-op that creates no lock file",…
    304|     const r = run(`take_local_stack_lock ci-run && echo ok`, envFor({ …
    305|     expect(r.stdout, r.stderr).toContain("ok");
       |                                ^
    306|     expect(r.status).toBe(0);
    307|     expect(fs.existsSync(path.join(cache, "bkit"))).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > `run` holds the lock for the command and passes its exit status on
AssertionError: bash: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory
: expected 127 to be 3 // Object.is equality

- Expected
+ Received

- 3
+ 127

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:324:32
    322|       { env: envFor(), encoding: "utf-8" },
    323|     );
    324|     expect(r.status, r.stderr).toBe(3);
       |                                ^
    325|     expect(r.stdout).toContain("pkg script");
    326|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > `run` with no arguments prints usage and exits 2
AssertionError: expected 127 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 127

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:330:22
    328|   it("`run` with no arguments prints usage and exits 2", () => {
    329|     const r = spawnSync("bash", [SCRIPT], { env: envFor(), encoding: "…
    330|     expect(r.status).toBe(2);
       |                      ^
    331|     expect(r.stderr).toContain("usage");
    332|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[15/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a named lock is machine-wide: checkouts of two different repos wait on the same named lock
Error: ENOENT: no such file or directory, copyfile '/Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh' -> '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-yR5z1P/first-repo/scripts/ci/bkit-machine-lock.sh'
 ❯ checkout .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:135:6
    133|   const script = path.join(root, "scripts", "ci", "bkit-machine-lock.s…
    134|   fs.mkdirSync(path.dirname(script), { recursive: true });
    135|   fs.copyFileSync(SCRIPT, script);
       |      ^
    136|   git(tmp, ["init", "-q", "-b", "dev", root]);
    137|   return { root, script };
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:335:23

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[16/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > one process holds a named lock and the unnamed stack lock side by side
AssertionError: bash: line 1: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory
bash: line 1: take_local_stack_lock: command not found
: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:371:42
    369|       envFor(),
    370|     );
    371|     expect(result.status, result.stderr).toBe(0);
       |                                          ^
    372|     expect(result.stdout.match(/named run/g)).toHaveLength(1);
    373|     expect(result.stdout.match(/stack run/g)).toHaveLength(2);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[17/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a runner started by a named-lock holder does not wait on that named lock
AssertionError: bash: line 1: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory
bash: line 1: take_local_stack_lock: command not found
: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:385:42
    383|       envFor(),
    384|     );
    385|     expect(result.status, result.stderr).toBe(0);
       |                                          ^
    386|     expect(result.stdout).toContain("parent named run");
    387|     expect(result.stdout).not.toContain("child named run");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[18/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other
AssertionError: expected '' to be '/private/var/folders/td/lj74ml2d0jz3t…' // Object.is equality

- Expected
+ Received

- /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-oYQG5m/cache/bkit/local-stack-lock/compat-stack.lock

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:395:61
    393|     const env = envFor({ BKIT_LOCAL_STACK: "compat-stack", LOCAL_STACK…
    394|     const expected = path.join(cache, "bkit", "local-stack-lock", "com…
    395|     expect(run("local_stack_lock_file", env).stdout.trim()).toBe(expec…
       |                                                             ^
    396|     expect(run("local_stack_lock_file", env, OLD_SCRIPT).stdout.trim()…
    397|     const older = hold("older stack run", 30, env, OLD_SCRIPT);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[19/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > run --lock holds the named lock for the command and passes its exit status on
AssertionError: bash: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory
: expected 127 to be 7 // Object.is equality

- Expected
+ Received

- 7
+ 127

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:424:42
    422|       envFor(),
    423|     );
    424|     expect(result.status, result.stderr).toBe(7);
       |                                          ^
    425|     expect(result.stdout).toContain("named package script");
    426|     expect(result.stdout).toContain(CHECKOUT);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[20/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > run exits 75 when the wait gives up, distinct from the command's own failure
Error: holder blocking tests gate exited before writing /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-QU4MgE/cache/bkit/machine-lock/tests.lock.holder
 ❯ waitForHolder .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:98:13
     96|     if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes…
     97|     if (child.exitCode !== null || child.signalCode !== null) {
     98|       throw new Error("holder " + who + " exited before writing " + fi…
       |             ^
     99|     }
    100|     await delay(25);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:433:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[21/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > run exits 73 naming the path when the lock dir cannot be written
AssertionError: expected 127 to be 73 // Object.is equality

- Expected
+ Received

- 73
+ 127

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:459:27
    457|       envFor({ XDG_CACHE_HOME: notDirectory }),
    458|     );
    459|     expect(result.status).toBe(73);
       |                           ^
    460|     expect(result.stdout).not.toContain("should-not-run");
    461|     expect(result.stderr).toContain(notDirectory);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > run exits 73 naming /usr/bin/perl when perl is missing
Error: ENOENT: no such file or directory, open '/Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh'
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:469:21
    467|     const broken = path.join(tmp, "no-perl-machine-lock.sh");
    468|     const missingPerl = path.join(tmp, "missing-perl");
    469|     const text = fs.readFileSync(SCRIPT, "utf-8");
       |                     ^
    470|     expect(text).toContain("/usr/bin/perl");
    471|     fs.writeFileSync(broken, text.replaceAll("/usr/bin/perl", missingP…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[23/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy
Error: holder separate stack holder exited before writing .holder
 ❯ waitForHolder .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:98:13
     96|     if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes…
     97|     if (child.exitCode !== null || child.signalCode !== null) {
     98|       throw new Error("holder " + who + " exited before writing " + fi…
       |             ^
     99|     }
    100|     await delay(25);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:487:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[24/26]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name
AssertionError: bash: /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/templates/scripts/ci/bkit-machine-lock.sh: No such file or directory
: expected 127 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 127

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:521:60
    519|       }),
    520|     );
    521|     expect(fromEnvironment.status, fromEnvironment.stderr).toBe(0);
       |                                                            ^
    522|     expect(fromEnvironment.stdout).toContain("workflow tests run");
    523|     expect(fromEnvironment.stdout).not.toContain("test:integration");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[25/26]⎯


 Test Files  1 failed (1)
      Tests  26 failed (26)
   Start at  18:31:49
   Duration  425ms (tests 93%, setup 4%, import 2%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-7s6kMV/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
