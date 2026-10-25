
> @cbartens/bkit@5.5.1 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> pnpm bkit:gate:static-unit && pnpm test:integration


> @cbartens/bkit@5.5.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@5.5.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@5.5.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@5.5.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> tsc -p tsconfig.test.json


> @cbartens/bkit@5.5.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@5.5.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@5.5.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/shared .bkit/core/.agents .bkit/core/docs


0/158 files need formatting

> @cbartens/bkit@5.5.1 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/workflows.md
 774:159  warning  Try to avoid using clichés like 'on the spot'.  write-good.Cliches 


 .bkit/core/workflows/bkit-ship.md
 542:379  warning  'empty' is repeated!  write-good.Illusions 


 .bkit/shared/docs/deployments.md
 438:123  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 438:123  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 546:142  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 

✖ 0 errors, 5 warnings and 0 suggestions in 157 files.
{"passed":true,"skipped":null,"files":157}

> @cbartens/bkit@5.5.1 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> bkit ci slop

[bkit-ci] base 785f39589254fce31497308f035e809383fd82af (785f39589254fce31497308f035e809383fd82af) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
{"passed":true,"skipped":null,"baseRef":"785f39589254fce31497308f035e809383fd82af","base":"785f39589254fce31497308f035e809383fd82af","added":0,"resolved":0,"worsened":0,"netFindingCount":0,"netScore":0}

> @cbartens/bkit@5.5.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/harvest,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/wording}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
      Coverage enabled with v8

(node:83654) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:83654) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:83654) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:83654) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:83654) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:83654) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:83654) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests | 1 failed) 11785ms
   ❯ lookupLatestPublished (3)
     × is null when pnpm fails or prints something that is not a version 8719ms
 ❯ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests | 5 failed) 43501ms
   ❯ resolve-push-base (17)
     ❯ exit 0 always (7)
       × falls back to event.before when git fails unexpectedly 7412ms
       × reports last-green-run as the source when the green head is an ancestor 6566ms
       ❯ local mode (3)
         × uses the last green run when it is an ancestor of --head, looked up on origin's repo 7986ms
         × tests ancestry against --head, not HEAD 7736ms
         × falls back to origin/dev with the reason on stderr when gh fails 6592ms
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (153 tests | 1 failed) 114934ms
   ❯ bkit runs revalidate (6)
     × exits 1 when the PR head cannot be read, 80 when gh needs auth 7081ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/resolve-push-base.test.ts > resolve-push-base > exit 0 always > falls back to event.before when git fails unexpectedly
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/repo/resolve-push-base.test.ts:153:5
    151|     const runs = `echo '[{"run_number":1,"head_sha":"${GREEN}"}]'`;
    152|
    153|     it("falls back to event.before when git fails unexpectedly", () =>…
       |     ^
    154|       const r = runWithFakes(runs, "exit 3");
    155|       expect(r.status).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/audits/repo/resolve-push-base.test.ts > resolve-push-base > exit 0 always > reports last-green-run as the source when the green head is an ancestor
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/repo/resolve-push-base.test.ts:167:5
    165|     });
    166|
    167|     it("reports last-green-run as the source when the green head is an…
       |     ^
    168|       const r = runWithFakes(runs, "exit 0");
    169|       expect(r).toMatchObject({ status: 0, stdout: GREEN, source: "las…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/audits/repo/resolve-push-base.test.ts > resolve-push-base > exit 0 always > local mode > uses the last green run when it is an ancestor of --head, looked up on origin's repo
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/repo/resolve-push-base.test.ts:192:7
    190|       const ciEnv = { REPO: "ci/repo", BEFORE_SHA: "f".repeat(40) };
    191|
    192|       it("uses the last green run when it is an ancestor of --head, lo…
       |       ^
    193|         const r = runWithFakes(runs, git, args, ciEnv);
    194|         expect(r).toMatchObject({ status: 0, stdout: GREEN, source: "l…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/audits/repo/resolve-push-base.test.ts > resolve-push-base > exit 0 always > local mode > tests ancestry against --head, not HEAD
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/repo/resolve-push-base.test.ts:199:7
    197|       });
    198|
    199|       it("tests ancestry against --head, not HEAD", () => {
       |       ^
    200|         const r = runWithFakes(runs, git, ["--local", "--branch=dev", …
    201|         expect(r.stdout).toBe(ORIGIN);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/audits/repo/resolve-push-base.test.ts > resolve-push-base > exit 0 always > local mode > falls back to origin/dev with the reason on stderr when gh fails
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/repo/resolve-push-base.test.ts:205:7
    203|       });
    204|
    205|       it("falls back to origin/dev with the reason on stderr when gh f…
       |       ^
    206|         const r = runWithFakes("echo 'gh: not logged in' >&2; exit 4",…
    207|         expect(r).toMatchObject({ status: 0, stdout: ORIGIN });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/shared/bkit-latest.test.ts > lookupLatestPublished > is null when pnpm fails or prints something that is not a version
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/shared/bkit-latest.test.ts:157:3
    155|   });
    156|
    157|   it("is null when pnpm fails or prints something that is not a versio…
       |   ^
    158|     fakePnpm("echo 'ERR_PNPM_FETCH_404' >&2; exit 1");
    159|     expect(lookupLatestPublished(root)).toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs revalidate > exits 1 when the PR head cannot be read, 80 when gh needs auth
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:1892:3
    1890|   });
    1891|
    1892|   it("exits 1 when the PR head cannot be read, 80 when gh needs auth",…
       |   ^
    1893|     const { cwd, code, file } = shipRepo();
    1894|     prThenFixtureGh(null);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  3 failed | 132 passed (135)
      Tests  7 failed | 5251 passed (5258)
   Start at  11:31:20
   Duration  126.72s (tests 97%, transform 1%, import 1%, worker 1%)

[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    87.7 |    81.28 |    94.7 |   89.06 |                   
 engine            |   74.45 |     78.1 |    87.5 |   74.81 |                   
  cli.ts           |   74.45 |     78.1 |    87.5 |   74.81 | ...44,954,959-961 
 ...e/checks/after |   90.09 |    85.47 |   94.25 |   93.75 |                   
  auth.ts          |   98.41 |    98.38 |     100 |   97.95 | 70                
  ci-yml.ts        |   89.86 |    82.06 |     100 |   92.27 | ...00,413-415,426 
  github.ts        |   95.45 |       92 |     100 |   95.89 | 255-257           
  index.ts         |   86.05 |    72.16 |     100 |   96.47 | ...16,371,409-410 
  managed.ts       |   82.92 |    89.39 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |    94.8 |    91.37 |     100 |   95.31 | 272-273,342       
 .../checks/before |   94.64 |    87.69 |   98.36 |   98.56 |                   
  context-fetch.ts |   98.28 |     92.1 |     100 |     100 | ...06,239,392,406 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.53 |    89.74 |   93.75 |   98.07 | 128               
  index.ts         |   84.74 |    74.28 |     100 |     100 | 123-150           
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |     100 |      100 |     100 |     100 |                   
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |    85.9 |    83.44 |    93.8 |   85.56 |                   
  analysis.ts      |    89.3 |    88.34 |    92.3 |   88.43 | 528-558           
  comply.ts        |    72.5 |    78.37 |   93.33 |   71.02 | ...22-323,373-423 
  harvest.ts       |   77.01 |       60 |   93.33 |   77.63 | ...81-382,437-457 
  land.ts          |   97.14 |    89.74 |     100 |     100 | 70-74,134,140     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   98.76 |    93.79 |   94.87 |   98.56 | 267-268           
  registry.ts      |     100 |      100 |     100 |     100 |                   
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 22                
 ...ne/commands/ci |   98.36 |    86.09 |   96.29 |   99.53 |                   
  ci.ts            |   98.36 |    86.09 |   96.29 |   99.53 | 164               
 ...mmands/install |   48.92 |    46.77 |   61.84 |    49.6 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   21.35 |    28.02 |   54.54 |   19.04 | 78-87,202-574     
  uninstall.ts     |   69.19 |    65.11 |   73.68 |   70.88 | ...1074,1097-1260 
  upgrade.ts       |   32.77 |    31.87 |   35.71 |   34.05 | 348-376,558-1049  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.43 |    84.56 |   97.07 |   93.99 |                   
  branches.ts      |   89.22 |    81.41 |    97.7 |   91.05 | ...1475,1480,1503 
  context.ts       |   97.25 |    89.78 |   96.72 |   97.64 | ...46,680,823,894 
  counters.ts      |     100 |    96.96 |     100 |     100 | 50,66             
  disk.ts          |   92.88 |    84.69 |   95.55 |   95.54 | ...29,412-420,536 
  fids.ts          |   99.43 |    96.83 |     100 |     100 | ...13,179,202,414 
  issues.ts        |   98.09 |    93.35 |     100 |   98.66 | 94-95,151         
  ledgers.ts       |   89.76 |    78.47 |   96.42 |   93.79 | ...,991,1001,1077 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,377-378 
  prs.ts           |   92.32 |    88.36 |     100 |   93.65 | ...1037,1053-1054 
  repo.ts          |   98.59 |    95.45 |     100 |     100 | 65-66,184         
  roadmap.ts       |   96.63 |    91.42 |     100 |   97.15 | ...54,474-476,480 
  runs.ts          |   92.69 |     84.6 |   98.64 |   94.14 | ...1838,1870-1874 
  runtime.ts       |   98.85 |    84.93 |     100 |     100 | ...32,280,300-305 
  skills.ts        |     100 |     92.3 |     100 |     100 | 97,102            
  status.ts        |    97.2 |       95 |     100 |   98.06 | 98,194,349        
  steps.ts         |   87.39 |       81 |   87.09 |   88.36 | ...1328,1333,1335 
  tests.ts         |   94.82 |    83.81 |   96.07 |   96.78 | ...60-761,767-768 
  workflows.ts     |   92.29 |    79.53 |     100 |   94.93 | ...1322-1323,1775 
  workstreams.ts   |   98.24 |    96.42 |     100 |     100 | 113               
  worktrees.ts     |   77.37 |    72.98 |   88.46 |      78 | ...60-663,666-667 
 engine/install    |   93.09 |    84.77 |   93.18 |   95.85 |                   
  cloud-env.ts     |   97.45 |    92.51 |     100 |     100 | ...98,722-774,877 
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 546-553           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.55 |     100 |     100 | 70,289            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   94.08 |    90.12 |   98.27 |   94.71 |                   
  status.ts        |   98.64 |    96.82 |     100 |     100 | 104,197           
  telemetry.ts     |    92.8 |     88.5 |   97.05 |   93.33 | ...1085,1087,1125 
 engine/render     |   89.89 |    81.04 |   98.03 |   92.15 |                   
  hosts.ts         |   88.31 |    78.89 |   94.73 |   89.69 | ...47-157,486-487 
  models.ts        |   89.65 |    80.23 |     100 |   94.06 | ...80,254,276,310 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.06 |    97.29 |     100 |   98.93 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |      96 |       75 |     100 |   95.45 | 119               
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |     100 |      100 |     100 |     100 |                   
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   94.04 |    89.65 |   98.21 |   95.04 |                   
  wording.ts       |   94.04 |    89.65 |   98.21 |   95.04 | ...31,724-741,746 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 87.7% ( 10319/11765 )
Branches     : 81.28% ( 7250/8919 )
Functions    : 94.7% ( 1448/1529 )
Lines        : 89.06% ( 9168/10294 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
