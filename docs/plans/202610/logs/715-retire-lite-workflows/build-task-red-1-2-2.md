
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/repo.test.ts

[test-timeout-budget] load average 10.1 on 10 cores: unit limits 5057ms per test, 10113ms per hook (x1.01)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests | 2 failed) 25469ms
   ✓ splitSlug (6)
     ✓ "cbartens/bkit" -> {"owner":"cbartens","repo":"bkit"} 56ms
     ✓ " o/r\n" -> {"owner":"o","repo":"r"} 74ms
     ✓ "o/" -> null 56ms
     ✓ "/r" -> null 61ms
     ✓ "o/r/x" -> null 63ms
     ✓ "" -> null 58ms
   ✓ resolveBkitBinary (3)
     ✓ prefers the repo-pinned binary over anything on PATH 63ms
     ✓ falls back to `bkit` on PATH when the repo has no pinned binary 64ms
     ✓ names the pinned location when neither exists 92ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 574ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 493ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 1307ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 916ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 957ms
     ✓ gh not on PATH at all also falls back to the remote 169ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 459ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 907ms
     ✓ counts commits behind origin/dev and the divergence age 1050ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 390ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1414ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 771ms
     ✓ from a worktree, still names the main checkout and its outbox 1068ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 748ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 928ms
   ❯ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 667ms
     ✓ prints the Jira site and project under jira 676ms
     ✓ prints the board under github 991ms
     ✓ prints the github progress and review states, defaults for a key left unset 684ms
     ✓ prints the linear progress and review states, defaults for a key left unset 702ms
     ✓ prints the jira progress and review states, defaults for a key left unset 1019ms
     ✓ prints the linear progress and review states, defaults for a key left unset 735ms
     ✓ prints null progress and review states under none 682ms
     × prints buildPublishRemote and buildPublishLocal 310ms
     × prints the publish defaults when package.json omits them 580ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 598ms
     ✓ prints nulls under github without a board, and for keys left unset 1285ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 544ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 322ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 304ms
     ✓ an unpinned repo reports nulls and asks no registry 818ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 566ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 230ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 234ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 780ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/repo.test.ts > bkit repo info — where the wired tracker's issues live > prints buildPublishRemote and buildPublishLocal
AssertionError: expected undefined to be true // Object.is equality

- Expected:
true

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/repo.test.ts:331:37
    329|     pkg({ workflows: { build: { publish: { remote: false, local: false…
    330|     const { json } = await run([]);
    331|     expect(json.buildPublishRemote).toBe(true);
       |                                     ^
    332|     expect(json.buildPublishLocal).toBe(false);
    333|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/repo.test.ts > bkit repo info — where the wired tracker's issues live > prints the publish defaults when package.json omits them
AssertionError: expected undefined to be true // Object.is equality

- Expected:
true

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/repo.test.ts:338:37
    336|     pkg({});
    337|     const { json } = await run([]);
    338|     expect(json.buildPublishRemote).toBe(true);
       |                                     ^
    339|     expect(json.buildPublishLocal).toBe(true);
    340|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 42 passed (44)
   Start at  06:54:52
   Duration  25.84s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-xTi71O/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
