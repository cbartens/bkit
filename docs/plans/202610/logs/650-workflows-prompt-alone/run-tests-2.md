
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

(node:52903) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:52903) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:52903) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:52903) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:52903) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:52903) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:52903) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.

 Test Files  135 passed (135)
      Tests  5258 passed (5258)
   Start at  11:35:42
   Duration  59.24s (tests 97%, transform 1%, import 1%, worker 1%)

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

> @cbartens/bkit@5.5.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> pnpm exec bats tests/*.bats

1..31
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login)
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression)
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression)
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session
ok 7 gh absent from PATH is stated plainly rather than falling through silently
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable)
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN
ok 15 runs each context-fetch:provision recipe bkit context list-blocks returns, and only those below bkit:end
ok 16 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list
ok 17 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted
ok 18 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape)
ok 19 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path)
ok 20 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE)
ok 21 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent)
ok 22 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers
ok 23 stub: --paginate emits one document per page; --slurp collapses them into an array
ok 24 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file
ok 25 a key removed from the env file is unset on the next run
ok 26 an empty value unsets the key instead of setting an empty string
ok 27 non-BKIT_ keys are skipped
ok 28 one failing key does not stop the others and the exit status is non-zero
ok 29 a failed unsetenv is retried on the next run
ok 30 logs key names only, never values
ok 31 missing env file exits 0 without calling launchctl

> @cbartens/bkit@5.5.1 test:integration /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run integration.test


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

npm warn Unknown env config "npm-globalconfig". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "block-exotic-subdeps". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "minimum-release-age". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "strict-dep-builds". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "trust-policy". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "npm-globalconfig". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "block-exotic-subdeps". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "minimum-release-age". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "strict-dep-builds". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "trust-policy". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "npm-globalconfig". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "block-exotic-subdeps". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "minimum-release-age". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "strict-dep-builds". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "trust-policy". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "npm-globalconfig". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "block-exotic-subdeps". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "minimum-release-age". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "strict-dep-builds". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "trust-policy". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "npm-globalconfig". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "block-exotic-subdeps". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "minimum-release-age". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "strict-dep-builds". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "trust-policy". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

 Test Files  46 passed (46)
      Tests  1527 passed (1527)
   Start at  11:36:48
   Duration  74.84s (tests 99%)

