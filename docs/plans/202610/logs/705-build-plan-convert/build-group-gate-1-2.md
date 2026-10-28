
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> pnpm bkit:gate:static-unit && pnpm test:integration


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs


0/148 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

✔ 0 errors, 0 warnings and 0 suggestions in 147 files.
passed: true
skipped: null
files: 147

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> bkit ci slop

[bkit-ci] base f8c67d9ab66de0c133922aad3959793b2bc2377f (f8c67d9ab66de0c133922aad3959793b2bc2377f) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: f8c67d9ab66de0c133922aad3959793b2bc2377f
base: f8c67d9ab66de0c133922aad3959793b2bc2377f
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
      Coverage enabled with v8

 ❯ .bkit/core/engine/tools/instructions-coverage.test.ts (22 tests | 1 failed) 809ms
   ✓ checkCoverage (8)
     ✓ the fixture passes 6ms
     ✓ a standing line no entry matches fails and prints the entry to add 1ms
     ✓ a local entry whose text left its file fails 0ms
     ✓ a listed verbatim carrier without the text fails 0ms
     ✓ a condensed carrier without a tagged local line fails 0ms
     ✓ a clause tagged with the rule backs a condensed carrier 0ms
     ✓ two entries 80% alike are flagged 2ms
     ✓ a drift excerpt not on its cited line fails 1ms
   ✓ checkCarry (5)
     ✓ a carry line naming each prompt that holds the whole rule passes 1ms
     ✓ a carry line naming a prompt without the whole rule fails 0ms
     ✓ a prompt holding a bkit rule its carry line does not name fails 0ms
     ✓ sync rewrites a copy of the rule's retired text in a carrying prompt's block 1ms
     ✓ a prompt that carries no rule is listed 0ms
   ✓ open review items (2)
     ✓ a fit tag without a keep reason is open 0ms
     ✓ a drift item without a kept reason is open 1ms
   ❯ the repo (7)
     × has no coverage findings 455ms
     ✓ has no unreviewed near-alike entries 136ms
     ✓ every fit tag matches its target or records why it stays 7ms
     ✓ every prompt carries verbatim each rule its carry line names 33ms
     ✓ no prompt carries a bkit rule its carry line does not name 26ms
     ✓ every prompt carries at least one rule 125ms
     ✓ every drift item is fixed or carries a kept reason 11ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 49923ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 1421ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 1873ms
     ✓ CI=true -> GITHUB_ACTION 2695ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 2236ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 3202ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 2678ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 3240ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 2436ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 2143ms
     ✓ LOCAL -> runtimeHeadless=false 2196ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 2587ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 2081ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 2264ms
     ✓ UNKNOWN -> runtimeHeadless=false 1023ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 1252ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 2089ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1963ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1624ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 1650ms
     ✓ re-derives per call: one run's answer does not leak into the next 1150ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 818ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1447ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1063ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1775ms
     ✓ --file into a missing directory is refused, not created 1692ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (47 tests) 59779ms
   ✓ bkit ci slop — gate decision (6)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 2056ms
     ✓ fails on a net score rise with no net count change 2871ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 2584ms
     ✓ treats a net score at or below 0.001 as float noise 3228ms
     ✓ passes when the change only resolves findings 3031ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 3125ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 2600ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 558ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 2581ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 2999ms
     ✓ exits 4 on a dropped net field instead of silently passing 2714ms
     ✓ exits 4 on no summary instead of silently passing 1842ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1405ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 2787ms
   ✓ bkit ci slop — real slop-scan (3)
     ✓ a genuinely new finding fails the gate 1333ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 2061ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 2063ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2813ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 1189ms
     ✓ fails (exit 1) when vale reports alerts 1680ms
     ✓ exits 6 on a vale runtime error 1898ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 2060ms
     ✓ falls back to vale sync when the main worktree has none 1524ms
     ✓ skips loudly with exit 0 when vale sync cannot restore it either 2938ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 338ms
   ✓ bkit ci min-push (8)
     ✓ exits 0 when every changed file is a plan log or a ledger 361ms
     ✓ exits 1 naming the files outside, whatever the commit message says 393ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 685ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 393ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 599ms
     ✓ a top-level glob does not reach into folders 345ms
     ✓ a push that changes no files is not proven a min push 389ms
     ✓ exits 7 when a commit or its base cannot be read 331ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (42 tests) 66216ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1770ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 2898ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 2429ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 2978ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 3066ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 2691ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 3093ms
     ✓ counts commits behind origin/dev and the divergence age 2355ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 2213ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 2936ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 2341ms
     ✓ from a worktree, still names the main checkout and its outbox 2301ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1278ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 1672ms
   ✓ bkit repo info — where the wired tracker's issues live (10)
     ✓ prints the Linear team and project under linear 2338ms
     ✓ prints the Jira site and project under jira 1653ms
     ✓ prints the board under github 1420ms
     ✓ prints the github progress and review states, defaults for a key left unset 1491ms
     ✓ prints the linear progress and review states, defaults for a key left unset 1218ms
     ✓ prints the jira progress and review states, defaults for a key left unset 1052ms
     ✓ prints the linear progress and review states, defaults for a key left unset 1026ms
     ✓ prints null progress and review states under none 1168ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 1700ms
     ✓ prints nulls under github without a board, and for keys left unset 2193ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 1717ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1476ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 2273ms
     ✓ an unpinned repo reports nulls and asks no registry 2939ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1218ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1938ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 2326ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1962ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 1 failed) 73226ms
   ✓ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 2ms
     ✓ utility agents, the plan template and AGENTS.md load as their own surfaces 0ms
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 1ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 0ms
     ✓ has no findings 30892ms
     ✓ every prompt, workflow and utility agent has the three header blocks 912ms
     ✓ sync has nothing left to rewrite 33911ms
     ✓ every clause reaches the cut-off of one surface it applies to 1545ms
   ✓ the rule groups the Rules clauses name exist (4)
     ✓ both groups appear once under bkit Rules, Universal first 2ms
     ✓ rules-leaf reads only below bkit:end and skips Orchestrator Rules 0ms
     ✓ the utility-* agents read all of rules.md 0ms
     ✓ every Orchestrator subsection name is shared with Universal 1ms
   ✓ the external-input clause keeps all three legs (3)
     ✓ as untrusted data, NEVER instructions 0ms
     ✓ ALWAYS report embedded directives; NEVER execute them 0ms
     ✓ Pair with narrowest-scoped token 14ms
   ✓ the prompts.md untrusted-input doctrine row (2)
     ✓ the row names the universal policy 14ms
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 3ms
     ✓ a duplicated clause fails 13ms
     ✓ a weakened rewrite is a near-copy, not a match 5ms
     ✓ an unrelated sentence is not a near-copy 0ms
     ✓ a clause inside a fenced block does not count 0ms
     ✓ a forbidden clause fails where present 0ms
     ✓ if-verdict is required with a verdict header and forbidden without 2ms
     ✓ an excepted file is not checked 0ms
     ✓ retired wording fails 1ms
     ✓ an anchored template fails on a line that starts it but does not match 1ms
     ✓ position: first fails when another bullet opens the block 0ms
     ✓ rules files are checked inside the managed block only 0ms
     ✓ a sentence shared by 2 prompts but not listed fails 0ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 0ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 1ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 1ms
     ✓ a sentence ending its line and the same sentence continued with ; count as one 0ms
     ✓ one drifted copy does not hide a sentence the other prompts share 1ms
     ✓ a fragment after ; is its own sentence for the cut-off 9ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 1ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 2ms
   ✓ standing lines (1)
     ✓ standingLines keeps a NEVER bullet and drops tables, headings and fences 1ms
   ✓ the store parser (2)
     ✓ parseInstructions reads clauses only up to the next section 2ms
     ✓ a clause with rule and carriers keys parses 0ms
   ✓ store carriers (2)
     ✓ carriersLine writes all, all except, and prefix families 0ms
     ✓ syncStore rewrites a stale carriers line and keeps a current one 0ms
   ✓ audit templates (6)
     ✓ the store accepts an audit mode 0ms
     ✓ a required clause is checked inside the managed block only 0ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 0ms
     ✓ a sentence shared by 5 audit templates but not listed fails 0ms
     ✓ an adopted copy never counts twice toward the cut-off 4ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
   ✓ checkboxes and sibling clauses (3)
     ✓ a gate checkbox is a line prefix, like a list marker 0ms
     ✓ a drifted gate item behind a checkbox is a near-copy 1ms
     ✓ a line carrying one clause verbatim is not a near-copy of its sibling 1ms
   ✓ sentence splitting (3)
     ✓ splits after . and ;, keeps the punctuation, and never splits after e.g. 0ms
     ✓ a clause ending in . matches a line that continues it with ; 1ms
     ✓ a drift that turns the clause's ; into , is still a near-copy 2ms
   ✓ modes (6)
     ✓ reads the tools list in block and inline form, skipping comment lines 0ms
     ✓ if-bash is required with Bash in the tools list and forbidden without 1ms
     ✓ if-search is required with Grep or Bash in the tools list and forbidden without 1ms
     ✓ if-no-search is required without Grep and Bash in the tools list and forbidden with either 2ms
     ✓ lines in a prompt's Rules block are rule copies, never clause carriers 0ms
     ✓ repeatable allows any number of copies but still flags near-copies 1ms
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 0ms
     ✓ a drifted anchored line fails 1ms
     ✓ a line two overlapping templates both fit counts once 1ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 1ms
     ✓ two swapped lines in one block fail 4ms
     ✓ a clause in the wrong block fails 2ms
     ✓ a placed clause in the body fails 1ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 3ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 50ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 4ms
   ❯ fully retired clauses (6)
     ✓ parse with no text block and no surface 2ms
     ✓ reject a text block or a surface 1ms
     ✓ are a record only: their wording in a file is neither flagged nor rewritten 0ms
     ✓ never cover a sentence for the cut-off 0ms
     ✓ the removed prompt clauses stay on record, and the cut-off skips them 0ms
     × output-cap's sentence stays inline in the abort handover prompt 5467ms
   ✓ sync (7)
     ✓ rewrites a near-copy and keeps the list marker 0ms
     ✓ rewrites the text behind a different label when the clause is unlabelled 0ms
     ✓ rewrites retired wording, carrying slot values across 0ms
     ✓ rewrites a near-copy that closes a sentence opened by local text 0ms
     ✓ rewrites retired wording continued with ; and keeps the ; 0ms
     ✓ rewrites a near-copy continued with ; and keeps the ; 0ms
     ✓ is idempotent and leaves fenced examples alone 0ms
   ✓ issue-less workflow clauses (7)
     ✓ workflow-issue-id-missing leads into the branch recovery without a STOP 0ms
     ✓ the fids parse routes: hit, no issue, non-slug STOP 0ms
     ✓ Step 1 reads the issue and FID from the prompt file, and resolves FID in the engine 0ms
     ✓ changed issue clauses keep their old text in retired 0ms
     ✓ the issue-less gate clauses read as the issue-less behaviour 0ms
     ✓ the warning, the final-message line and the skip line are clauses 0ms
     ✓ the diff reaches each reader as a file written just before its step, not a guard rule 0ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 172ms
     ✓ every label's rows list exactly the prompts that carry it 138ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (104 tests) 75429ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1908ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 2876ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 2447ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 2969ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 2820ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 3245ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 2374ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1996ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1627ms
     ✓ PASS is 0 failures with or without reports 2611ms
     ✓ clears a previous attempt's reports before the gate runs 2225ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 2286ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1755ms
     ✓ a log under the outbox is named main-checkout relative in the record 979ms
     ✓ a log small enough is copied whole: not clamped, raw null 1658ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 2346ms
   ✓ bkit tests red / green (25)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 1437ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 1226ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 1343ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 1229ms
     ✓ a script that cannot run is exit 4, not a rejected red 1537ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1722ms
     ✓ green: --group audits only that group's tasks 1447ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1446ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1743ms
     ✓ green: red recorded, test unchanged, named test passing -> no gaps 3195ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 1563ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 1514ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 2557ms
     ✓ green: every test a task names needs its own red and its own pass 1522ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 2455ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 1775ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 1633ms
       ✓ a test file that only gained lines since its red is no gap; the diff stays in the report 1576ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 2700ms
       ✓ green refuses an exception-only task from a workflow step commit 566ms
       ✓ green clears an exception-only task from a human commit 436ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (132 tests) 79793ms
   ✓ bkit workflows start (13)
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 371ms
   ✓ bkit workflows fail (18)
     ✓ aborts a rebase only when one is in progress 549ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 461ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 305ms
   ✓ bkit workflows close (16)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 318ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 316ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 383ms
     ✓ always writes the telemetry, whatever the runtime 315ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 355ms
     ✓ an unwritable stats path is logged and never fails the close 430ms
     ✓ ship: run.pr, size of the squash commit, and coverage 479ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 582ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 344ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 326ms
   ✓ bkit workflows close — commit, outbox, comment (8)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 520ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 434ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 415ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 452ms
     ✓ --record-step writes the close step's row before workflow-done 347ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 376ms
     ✓ --number without --outbox is a usage error 442ms
   ✓ bkit workflows handover (22)
     ✓ --push commits and pushes the record on the feature branch without a handover 575ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 717ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 751ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 612ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 326ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1377ms
     ✓ --flush with nothing to record commits and pushes nothing 1077ms
     ✓ --flush carries the named worktree's logs into the dev commit 1235ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4086ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1441ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2020ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1604ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1833ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1613ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1581ms
     ✓ --push on dev never carries a row whose references name another feature 1549ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1418ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2518ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2175ms
     ✓ --push commits in the named worktree, not the checkout it runs from 931ms
   ✓ bkit workflows close --flush (ship) (6)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1546ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1285ms
     ✓ a close that landed releases the lock 1665ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 6486ms
       ✓ closePr refuses when the PR base is unknown 5270ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1338ms
   ✓ bkit workflows promote (7)
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 324ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 339ms
     ✓ names the branch, not the remote-tracking ref, in each URL 399ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 360ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 371ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 613ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 443ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1083ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 551ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 516ms
     ✓ a second run's record does not let this FID's close commit 764ms
     ✓ record is present after workflows close and before the push 1205ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1510ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 525ms
     ✓ --plan is appended when the file exists and skipped when it does not 348ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 565ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 695ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 540ms
     ✓ puts each --line after the summary, in flag order 557ms
     ✓ --summary prints the file and keeps a copy in --outbox 491ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 514ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 23898ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 1944ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1995ms
     ✓ resolves config from the repo root when run from a subdirectory 1635ms
     ✓ exits 6 when the PUT fails 1305ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1668ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 1460ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 1678ms
     ✓ asks a human to log in when gh is not authenticated 2393ms
     ✓ exits 3 when gh repo view names no repository 2002ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1726ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1924ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1654ms
     ✓ exits 6 when the api answer is not JSON 2403ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (62 tests) 22303ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 458ms
     ✓ adopts in place when the session is already on feat/{fid} 370ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 909ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 791ms
     ✓ a new run of the same FID rewrites startSha 1252ms
     ✓ a resume of the same FID reuses the record 1500ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 878ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 958ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1022ms
     ✓ a stale record without a lock is replaced 1053ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 923ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 779ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 315ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 317ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 343ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 349ms
   ✓ bkit worktrees remove (12)
     ✓ removes a marked worktree with uncommitted changes and clears the marker 323ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 787ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 466ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 433ms
       ✓ a branch already gone everywhere is reported deleted 400ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 421ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 2967ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1298ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1991ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 2249ms
     ✓ fetches the issue and its comments as GitHub returns them 2001ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 1266ms
     ✓ a recent identical comment counts as done (the final close comment) 1649ms
     ✓ a failed post reports done false with the reason and never leaks a token 1530ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 2204ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 2060ms
     ✓ a different marker hash posts 1718ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1497ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 23205ms
   ✓ workflow shell fences (4)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 3027ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 2924ms
     ✓ retries a failed create once, and exits 5 when it fails twice 2255ms
     ✓ exits 5 when the open-PR probe errors 1677ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 2635ms
     ✓ prs open still opens against any other base 2229ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 1877ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1796ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1653ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 1039ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 2148ms
     ✓ runs no merge when the PR is already MERGED 1403ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1925ms
     ✓ prs merge refuses a PR whose base is main 1376ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 2256ms
     ✓ prs merge refuses when the PR base is unknown 2950ms
     ✓ prs merge reads the base from the one pr view it already makes 1328ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 1808ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1967ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1305ms
     ✓ never reads dev's required checks without --only-if-required 1583ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 1665ms
     ✓ is not green when a check failed, naming it (exit 1) 1917ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 2350ms
     ✓ is not green on an empty rollup (total 0) 1686ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1750ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 2059ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1756ms
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 2046ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1620ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1344ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1318ms
     ✓ runs from the checkout top even when called from a subfolder 1539ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 728ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 905ms
     ✓ a push that fails without a server answer is returned once, never retried 634ms
     ✓ a failed fetch is returned before anything is built 422ms
     ✓ build throwing stops the landing and removes the throwaway checkout 564ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (210 tests) 21802ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ 4. a stopword-only title falls back to the prompt; non-ASCII titles fold 355ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 308ms
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (159 tests | 1 failed) 108227ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 60ms
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 47ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 32ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 24ms
     ✓ rate_limit returns the requested fixture state 31ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 29ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 74ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 98ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 32ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
   ✓ bkit runs gate (58)
     ✓ accepts a green capstone at the head (exit 0) and says so 86ms
     ✓ rejects a failed run (12) 49ms
     ✓ rejects no run at the head (10) 40ms
     ✓ rejects runs that have not completed (11) 39ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 73ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 78ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 85ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 107ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 59ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 60ms
     ✓ tells an API error (20) from no run (10) 113ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 47ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 61ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 85ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 2ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 33ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
       ✓ a malformed shipGateRequiredLanes falls back to none, never crashes 62ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 129ms
     ✓ missing --head is a usage error (2) 1ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 10ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 35ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 31ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 62ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 32ms
       ✓ without --event the newer green pull_request run masks the failed push run 62ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 86ms
       ✓ a run still in progress whose capstone already passed passes 92ms
       ✓ a capstone still running is in progress (11) 85ms
       ✓ a failed capstone fails (12) even when every other job passed 72ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 160ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 132ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 534ms
       ✓ a source change past the validated head refuses (17) and names the path 355ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 398ms
       ✓ --validated equal to --head is the plain head check 98ms
       ✓ --validated without --month / --fid is a usage error (2) 323ms
       ✓ a validated sha that is not an ancestor refuses (17) 305ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ no push run yet inside the absent window keeps waiting 0ms
     ✓ still in progress at --max-minutes -> 4 0ms
     ✓ two API errors are retried; the third in a row -> 20 0ms
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 2409ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 3324ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 1ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 0ms
     ✓ found stops polling; every poll erroring is err with allErrored 0ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
     ✓ PR completed = no open checks; run targets are head-anchored 0ms
     × CLI: found exits 0; --once not found exits 81 (end the turn, call again) 5780ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 2201ms
     ✓ CLI: a failed gh workflow run exits 5 2211ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 3628ms
     ✓ CLI: usage errors exit 2 17ms
   ✓ bkit runs dispatch (14)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 340ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1195ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 572ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 414ms
     ✓ gh-error: every poll errored 365ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 702ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 666ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 884ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 725ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1739ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1517ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 580ms
     ✓ re-trigger on dev only uses the record of its own FID 622ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 575ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ flags [SKIP CI] inherited into the landed commit body 115ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 176ms
     ✓ an empty or unreadable sha is an error, not a clean result 83ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 1730ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 1444ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1942ms
     ✓ a refused capstone records FAIL with its reason 2260ms
     ✓ an unreadable PR is an API error (20) with no head 1863ms
     ✓ takes exactly one of --head, --pr, --squash-of 13ms
   ✓ bkit runs revalidate (6)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1538ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 3983ms
     ✓ ref uppercases a Linear or Jira key 0ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1742ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 2122ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1838ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1458ms
     ✓ --file and --step go together 1975ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 12268ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 2414ms
       ✓ falls back to event.before when gh prints unparseable output 1957ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2075ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 2236ms
         ✓ tests ancestry against --head, not HEAD 1390ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 1325ms
(node:13824) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 614ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1091ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 450ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (40 tests) 6503ms
   ✓ bkit roadmap mirror (6)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 534ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1233ms
     ✓ a refused dev push is logged, never fails the close 1482ms
     ✓ an unreachable remote is logged, never fails the close 655ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 1741ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 567ms
     ✓ is null when pnpm fails or prints something that is not a version 1130ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 8940ms
   ✓ bkit issues comment (33)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 736ms
     ✓ passes every rule on a clean head 337ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 418ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 3466ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 316ms
   ✓ bkit locks release (5)
     ✓ locks release removes the FID shared-checkout record 308ms
> [bkit] TRUNCATED HERE — 189 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 206 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 256 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 68 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 261 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 50 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — nuke > --nuke --yes deletes all present files without interactive prompt
[bkit-uninstall-test] delete: AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .bkit
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > strips allow/deny/ask together, including install's WebFetch enrichment
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > preserves a permission the consumer added themselves
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > deletes .claude/bkit-cloud.md when the claude host is uninstalled
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > leaves .claude/bkit-cloud.md untouched when claude is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (87 tests) 703ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > warns when Codex is also installed (skill-overlap advisory)
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[test] antigravity: .agents/plugins/bkit/plugin.json
[test] antigravity: GEMINI.md
[test] antigravity: .agents/plugins/bkit/hooks.json
[test] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 647ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > stays silent about the overlap when Codex is absent
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[test] antigravity: .agents/plugins/bkit/plugin.json
[test] antigravity: GEMINI.md
[test] antigravity: .agents/plugins/bkit/hooks.json
[test] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 995ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (87 tests) 25182ms
   ✓ bkit steps done (18)
     ✓ captures parentSha first, writes the row, then commits on top of it 532ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 555ms
     ✓ reports a failed commit with exit 8 without writing the row 1375ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 309ms
     ✓ --ref exits 3 when the ref does not carry the status file 422ms
     ✓ fails on a placeholder left in the artifact 312ms
     ✓ fails when the row's verdict differs from the artifact's 365ms
     ✓ fails when the row does not list the artifact, or carries another attempt 376ms
     ✓ fails on a missing artifact 349ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 413ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 328ms
     ✓ fails a run-tests row missing its scope, and an empty scope 411ms
   ✓ bkit steps finish (14)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 466ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 413ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 358ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 449ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 648ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 488ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 575ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1021ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 391ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 561ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 514ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 380ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 932ms
     ✓ writeStepRow refuses when a recorded path changed 970ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 581ms
     ✓ writeStepRow appends its commit sha to the record 859ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 990ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 667ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 476ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 274ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 604ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (81 tests) 395ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (50 tests) 397ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (94 tests) 222ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/checks/status-holes.test.ts (41 tests) 145ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (232 tests) 722ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-wzjiaH/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > a consumer edit survives a no-op upgrade and is a conflict on the next template change
[bkit-upgrade] conflict: .bkit/scripts/bkit-foo.sh — consumer drift detected, NOT overwriting

 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (73 tests) 487ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > template with a slash-prefixed HTML marker (// <!-- bkit:start -->) is classified html-comment, not slash-comment (site-9 mis-classification trap)
[bkit-upgrade] upgrade (merge): weird.js

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > a marker-less consumer file gets the block appended, its own content kept
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > the shipped hook template upgrades to its generated form: shared parts spliced into the block
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: auto-applies non-conflicting changes
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: does NOT overwrite consumer drift (conflict preserved)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: returns conflicts list with relPath and content
[bkit-upgrade] conflict: .claude/agents/bkit-test.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-test.md

 ✓ .bkit/core/engine/shared/settings.test.ts (26 tests) 300ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 521ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 151ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 219ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (96 tests) 291ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-2SRDDj/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 311ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 475ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (250 tests) 202ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 399ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (277 tests) 278ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 193ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 170ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 290ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 211ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (22 tests) 169ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (65 tests) 344ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 237ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 265ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 186ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 348ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 271ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 325ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 199ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (64 tests) 42ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 253ms
 ✓ .bkit/core/engine/install/manifest.test.ts (47 tests) 140ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (21 tests) 209ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (24 tests) 206ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (35 tests) 88ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (6 tests) 146ms
 ✓ .bkit/core/engine/render/hosts.test.ts (115 tests) 197ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (33 tests) 152ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 182ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 228ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 137ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 37ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 113ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (23 tests | 1 skipped) 122ms
 ✓ .bkit/core/engine/commands/workflow/workstreams.test.ts (9 tests) 141ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 101ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 151ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > is idempotent — a second run changes nothing
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > dry-run writes nothing but records the same write set (the `bkit check` drift signal)
[test] [dry-run] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > regenerates a hand-edited file whole
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > picks up consumer allowed-domains from .agents/context.md
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > removes the retired copy bkit recorded and records the removal
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > dry-run keeps the retired copy but reports the removal
[test] [dry-run] core: .bkit/allowlist.json
[test] [dry-run] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 89ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 46ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 81ms
stdout | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
# bkit stats

This repo only: `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Written by `bkit stats`; workflow closes append the rows.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| outcome | 1 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Run durations

No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

## Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.

# bkit stats

This repo only: `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Written by `bkit stats`; workflow closes append the rows.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| outcome | 1 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Run durations

No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

## Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.


stderr | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
[bkit-stats] wrote .bkit/stats.md
[bkit-stats] wrote .bkit/stats.md

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793067197393.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793067197397.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793067197398.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793067197410.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 27ms
 ✓ .bkit/core/engine/commands/stats.test.ts (8 tests) 85ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 63ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 114ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 92ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 161ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 18ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 19ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (25 tests) 64ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (5 tests) 128ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 21915ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 21819ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 121ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 21ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 99ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 153ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (17 tests) 72ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 17ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 18ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 19ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (21 tests) 139ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 48ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 141ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 8ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 42ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (20 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 56ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 41ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 6ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 144ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (6 tests) 5ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 28ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 12ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 68428ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 1011ms
     ✓ keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 1049ms
     ✓ (V1) keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 1114ms
     ✓ emits investigation checklist on a write to an EXISTING file 1221ms
     ✓ emits investigation checklist on first edit to a file 770ms
     ✓ dedups: second write to the same file in the same session emits nothing 802ms
     ✓ warns again for a different file in the same session 1427ms
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ throws with advisory text on first write (blocks edit) 940ms
     ✓ allows retry (second call is a no-op after dedup marked) 791ms
   ✓ gateguard opencode plugin — subagents are NOT exempt (3)
     ✓ a subagent session editing a file DOES get the advisory (exemption removed) 926ms
     ✓ orchestrator session gets the advisory too — same treatment either way 808ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ tsconfig.json triggers config advisory 1017ms
     ✓ flags vitest.config.ts as gate config 1322ms
     ✓ flags eslint.config.mjs as gate config 1276ms
     ✓ flags .prettierrc as gate config 795ms
     ✓ flags slop-scan.config.json as gate config 1042ms
     ✓ flags .vale.ini as gate config 1315ms
     ✓ flags .lintstagedrc.json as gate config 1380ms
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 1333ms
     ✓ source file is not treated as gate config 1402ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 1318ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 5494ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 4787ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 6275ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 6217ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 5792ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 2618ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ both drivers emit the same advisory for the same edit 2812ms
     ✓ V1 driver reads the real 1.x arg key `filePath` 1550ms
     ✓ deny mode blocks the first touch on BOTH drivers 2033ms
   ✓ gateguard plugin — docs/*.md density advisory (#422) (6)
     ✓ appends the density advisory for a docs/ markdown file 640ms
     ✓ does NOT match a Documents/ ancestor (segment match, not substring) 706ms
     ✓ excludes docs/plans/ (plan template governs those, not the docs register) 711ms
     ✓ does NOT match docs/knowledge.jsonl (gated on .md) 735ms
     ✓ matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md) 812ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (173 tests) 157239ms
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 794ms
     ✓ refuses a code conflict and aborts the rebase on the spot 632ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2334ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 310ms
     ✓ produces byte-identical output to merge=union 956ms
     ✓ restores a trailing newline so the next append starts on its own line 571ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 563ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 735ms
     ✓ refuses a union that leaves a line which is not JSON 343ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 497ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 3482ms
     ✓ refuses a lockfile whose regenerate command fails 3325ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 336ms
     ✓ removes a stale sentinel when the rebase succeeds 506ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 763ms
     ✓ resolves a conflict in each of two replayed commits across rounds 601ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 467ms
       ✓ skips (12) with no anchor 423ms
       ✓ skips (12) when the base is unreachable in this clone 451ms
       ✓ skips (12) when nothing landed since the base 474ms
       ✓ runs (0) with the landed path count once dev moved 876ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 404ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1026ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 638ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 688ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 3382ms
     ✓ runs exactly one git push 2747ms
     ✓ --set-upstream records the upstream 646ms
     ✓ refuses with no branch checked out 640ms
     ✓ --mode=dev refuses a feature checkout 582ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1254ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 553ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2253ms
     ✓ --mode=abort pushes when the branch has no open PR 2502ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 2136ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 482ms
     ✓ --open-pr carries the MCP answer and skips gh 700ms
     ✓ --mode=abort on dev pushes plainly without probing 672ms
     ✓ rejects an unknown mode 539ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1390ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1161ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1163ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4591ms
     ✓ skip-ci HEAD on the replay is refused 890ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1534ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4083ms
     ✓ a level local dev is a plain push, recording nothing extra 1084ms
     ✓ a record with no commits pushes nothing 823ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 538ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2930ms
     ✓ a rewritten branch is refused, never forced 848ms
     ✓ refuses dev and main with exit 21 and pushes nothing 470ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1258ms
     ✓ refuses a detached HEAD (exit 5) 606ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1119ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 968ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 831ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1025ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 553ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1481ms
     ✓ an up-to-date branch is a no-op 780ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1237ms
     ✓ a fetch that fails exits 10 606ms
   ✓ branches scan-diff (8)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 819ms
     ✓ --paths with no match exits 1 758ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 536ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 931ms
     ✓ --marker reads a diff over 1 MiB 787ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 849ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 788ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 642ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2584ms
     ✓ a title that already carries the marker is left alone 2961ms
     ✓ with no open PR: pushes the marker commit and edits no title 2165ms
     ✓ a re-run is deduped: no second marker commit 2551ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 2763ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 541ms
     ✓ --title-set skips gh entirely 795ms
     ✓ refuses dev and main (exit 21) 427ms
   ✓ branches sync (10)
     ✓ Path A when origin/dev is an ancestor of HEAD 806ms
     ✓ Path B once dev moved; --head checks a given commit 1221ms
     ✓ --merge-docs merges dev when docs/ is behind 1244ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1219ms
     ✓ --merge-docs never merges on dev itself 942ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1390ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1294ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1233ms
     ✓ exits 10 when the fetch fails 601ms
     ✓ refuses --merge-docs with --head, and an unknown --head 633ms
   ✓ branches sync-dev (5)
     ✓ fast-forwards local dev without checking it out 1188ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2464ms
     ✓ a failed install stops ship (16) 2046ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1505ms
     ✓ exits 10 when the fetch fails 1199ms
   ✓ branches land (23)
     ✓ refuses a workflow other than design or plan 526ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 839ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2818ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2661ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2509ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2477ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3935ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4194ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 1102ms
     ✓ local: names unpushed dev as the cause when the branch carries it 1196ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 1364ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2277ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2645ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1890ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2262ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2206ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1843ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1018ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2856ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 950ms
     ✓ landPr refuses a main-based PR without retrying 642ms
     ✓ landPr refuses when the PR base is unknown 493ms
     ✓ PR not open (closed): stops (17) at once, no retry 644ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions-coverage.test.ts > the repo > has no coverage findings
AssertionError: expected [ …(58) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/workflows/bkit-build.md:27: no entry — add under #### bkit-build: **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9; tasks tick `[x]` only in verify.",
+   ".bkit/core/workflows/bkit-build.md:181: no entry — add under #### bkit-build: **If** `DECISION_ROUTE` = `fix` → Step 7.",
+   ".bkit/core/workflows/bkit-build.md:182: no entry — add under #### bkit-build: **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 9.",
+   ".bkit/core/workflows/bkit-build.md:183: no entry — add under #### bkit-build: **If** `DECISION_ROUTE` = `retry` → Step 13.",
+   ".bkit/core/workflows/bkit-build.md:184: no entry — add under #### bkit-build: **If** `DECISION_ROUTE` = `verify` → re-run Step 8.",
+   ".bkit/core/workflows/bkit-build.md:381: no entry — add under #### bkit-build: **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.",
+   ".bkit/core/workflows/bkit-build.md:382: no entry — add under #### bkit-build: **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 2.",
+   ".bkit/core/workflows/bkit-build.md:383: no entry — add under #### bkit-build: **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.",
+   ".bkit/core/workflows/bkit-build.md:389: no entry — add under #### bkit-build: Finish, then re-run sub-step 1 with `CONVERTED` = true:",
+   ".bkit/core/workflows/bkit-build.md:396: no entry — add under #### bkit-build: Plan checked (`tests plan-check`)",
+   ".bkit/core/workflows/bkit-build.md:397: no entry — add under #### bkit-build: Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it",
+   ".bkit/core/workflows/bkit-build.md:398: no entry — add under #### bkit-build: Converted plan checked again (`tests plan-check`)",
+   ".bkit/core/workflows/bkit-build.md:410: no entry — add under #### bkit-build: **If** exit 12 → Step 6.",
+   ".bkit/core/workflows/bkit-build.md:421: no entry — add under #### bkit-build: **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.",
+   ".bkit/core/workflows/bkit-build.md:456: no entry — add under #### bkit-build: One pass of Steps 7-9 per plan group, in group order: Step 7 briefs the first group with an open task, Step 8 verifies that group's own diff, Step 9 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 10.",
+   ".bkit/core/workflows/bkit-build.md:466: no entry — add under #### bkit-build: Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 10.",
+   ".bkit/core/workflows/bkit-build.md:485: no entry — add under #### bkit-build: Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 8 ticks tasks:",
+   ".bkit/core/workflows/bkit-build.md:486: no entry — add under #### bkit-build: **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 7; its brief leaves out the `DONE` tasks.",
+   ".bkit/core/workflows/bkit-build.md:546: no entry — add under #### bkit-build: **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 7 (the next group, or Step 10 when none is open).",
+   ".bkit/core/workflows/bkit-build.md:554: no entry — add under #### bkit-build: **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 9 (a fixable-only round first).",
+   ".bkit/core/workflows/bkit-build.md:555: no entry — add under #### bkit-build: **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 9; group-gate failures are always fixed, never asked.",
+   ".bkit/core/workflows/bkit-build.md:610: no entry — add under #### bkit-build: **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.",
+   ".bkit/core/workflows/bkit-build.md:632: no entry — add under #### bkit-build: **If** `verdict` non-null → Step 11.",
+   ".bkit/core/workflows/bkit-build.md:646: no entry — add under #### bkit-build: **If** `verdict` = PASS or CONCERNS → Step 11.",
+   ".bkit/core/workflows/bkit-build.md:658: no entry — add under #### bkit-build: Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 12. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:",
+   ".bkit/core/workflows/bkit-build.md:662: no entry — add under #### bkit-build: `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 12. Then read the round limit, on every path:",
+   ".bkit/core/workflows/bkit-build.md:701: no entry — add under #### bkit-build: **If** `route` = `none` → Step 12.",
+   ".bkit/core/workflows/bkit-build.md:702: no entry — add under #### bkit-build: **If** `route` = `pause` → `PAUSE_STEP` = 11, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.",
+   ".bkit/core/workflows/bkit-build.md:703: no entry — add under #### bkit-build: **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 7; its brief takes the first new group.",
+   ".bkit/core/workflows/bkit-build.md:805: no entry — add under #### bkit-build: Finish → re-run Step 12:",
+   "bkit-build: local entry no longer in the file: **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 6-8; tasks tick `[x]` only in verify.",
+   "bkit-build: local entry no longer in the file: **If** `DECISION_ROUTE` = `fix` → Step 6.",
+   "bkit-build: local entry no longer in the file: **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 8.",
+   "bkit-build: local entry no longer in the file: **If** `DECISION_ROUTE` = `retry` → Step 12.",
+   "bkit-build: local entry no longer in the file: **If** `DECISION_ROUTE` = `verify` → re-run Step 7.",
+   "bkit-build: local entry no longer in the file: **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.",
+   "bkit-build: local entry no longer in the file: **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.",
+   "bkit-build: local entry no longer in the file: **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.",
+   "bkit-build: local entry no longer in the file: Finish, then re-run sub-step 2 with `CONVERTED` = true:",
+   "bkit-build: local entry no longer in the file: Plan checked (`tests plan-check`), converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it",
+   "bkit-build: local entry no longer in the file: **If** exit 12 → Step 5.",
+   "bkit-build: local entry no longer in the file: **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 6`. Every verdict → Step 5.",
+   "bkit-build: local entry no longer in the file: One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first group with an open task, Step 7 verifies that group's own diff, Step 8 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 9.",
+   "bkit-build: local entry no longer in the file: Hold `artifact` as `{BRIEF}`, `group` as `{GROUP}`, `tasks` as `{GROUP_TASKS}`. **If** `group` = null → Step 9.",
+   "bkit-build: local entry no longer in the file: Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:",
+   "bkit-build: local entry no longer in the file: **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.",
+   "bkit-build: local entry no longer in the file: **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).",
+   "bkit-build: local entry no longer in the file: **If** exit 0 **and** `VERIFY_VERDICT` = FAIL → Step 8 (a fixable-only round first).",
+   "bkit-build: local entry no longer in the file: **If** exit 0 **and** `VERIFY_VERDICT` = PASS (group gate FAIL alone) **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → Step 8; group-gate failures are always fixed, never asked.",
+   "bkit-build: local entry no longer in the file: **If** exit 1 (no source change) **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.",
+   "bkit-build: local entry no longer in the file: **If** `verdict` non-null → Step 10.",
+   "bkit-build: local entry no longer in the file: **If** `verdict` = PASS or CONCERNS → Step 10.",
+   "bkit-build: local entry no longer in the file: Set the challenge round. **If** `CHALLENGE_DONE` = true → Step 11. **If** `CHALLENGE_ROUND` is held → keep it. **Else** → read it from status.jsonl:",
+   "bkit-build: local entry no longer in the file: `CHALLENGE_ROUND` = `challengeRound`; `challengeDone` = true → Step 11. Then read the round limit, on every path:",
+   "bkit-build: local entry no longer in the file: **If** `route` = `none` → Step 11.",
+   "bkit-build: local entry no longer in the file: **If** `route` = `pause` → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE` → **Decision Pause**.",
+   "bkit-build: local entry no longer in the file: **If** `route` = `fix` → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1 → Step 6; its brief takes the first new group.",
+   "bkit-build: local entry no longer in the file: Finish → re-run Step 11:",
+ ]

 ❯ .bkit/core/engine/tools/instructions-coverage.test.ts:260:42
    258| describe("the repo", () => {
    259|   it("has no coverage findings", { timeout: 60_000 }, () => {
    260|     expect(checkCoverage(STORE, CORPUS)).toEqual([]);
       |                                          ^
    261|   });
    262|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > fully retired clauses > output-cap's sentence stays inline in the abort handover prompt
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:1021:3
    1019|   });
    1020|
    1021|   it("output-cap's sentence stays inline in the abort handover prompt"…
       |   ^
    1022|     const handover = CORPUS.find(
    1023|       (f) => f.id === ".bkit/core/prompts/bkit-debug-abort-handover.md…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs wait > CLI: found exits 0; --once not found exits 81 (end the turn, call again)
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:1108:3
    1106|     JSON.stringify({ statusCheckRollup: names.map((name) => ({ name, s…
    1107|
    1108|   it("CLI: found exits 0; --once not found exits 81 (end the turn, cal…
       |   ^
    1109|     fakeGhBin({ "pr-view": ROLLUP("bkit-tests-static") });
    1110|     const r = await cli(tmp(), ["wait", "--pr=7"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  3 failed | 149 passed (152)
      Tests  3 failed | 6267 passed | 1 skipped (6271)
   Start at  12:10:59
   Duration  158.93s (tests 96%, import 1%, transform 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/705-build-plan-convert/build-group-gate-1-2.log.reports/vitest-34601.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.43 |    82.35 |   95.19 |   90.72 |                   
 engine            |   75.47 |    79.27 |    87.5 |   75.86 |                   
  cli.ts           |   75.47 |    79.27 |    87.5 |   75.86 | ...11,921,926-928 
 ...e/checks/after |   90.62 |     85.4 |   94.44 |    94.4 |                   
  auth.ts          |   98.41 |    98.38 |     100 |   97.95 | 70                
  ci-yml.ts        |   90.09 |    82.06 |     100 |   92.49 | ...09,422-424,435 
  github.ts        |   96.42 |    90.42 |     100 |   96.84 | 333-335           
  index.ts         |   86.25 |    72.72 |     100 |   97.09 | ...97,317,412-413 
  managed.ts       |   82.92 |    89.39 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |   96.96 |       90 |     100 |   98.14 | 299               
 .../checks/before |   94.29 |    88.34 |   95.45 |   97.69 |                   
  context-fetch.ts |   98.72 |     92.4 |     100 |     100 | ...92,514,528,575 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |   83.78 |    73.33 |     100 |     100 | ...38,144,152-171 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   92.66 |    92.77 |   86.36 |   92.77 | 154-162           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |   90.26 |    85.15 |   91.66 |   90.06 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...67,376,444,492 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.14 |    89.74 |     100 |     100 | 70-74,134,140     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   98.39 |     93.6 |      96 |   98.73 | 283-284           
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   77.14 |    59.09 |   66.66 |   77.27 | ...58-171,201-202 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   98.36 |    86.09 |   96.29 |   99.53 |                   
  ci.ts            |   98.36 |    86.09 |   96.29 |   99.53 | 164               
 ...mmands/install |   47.55 |    45.73 |   59.49 |   48.12 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |    66.6 |    63.09 |      70 |   67.96 | ...1107,1130-1297 
  upgrade.ts       |   32.77 |    31.87 |   35.71 |   34.05 | 348-376,558-1049  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |    92.8 |     84.2 |   96.96 |   94.28 |                   
  branches.ts      |    88.9 |    81.22 |   97.11 |    90.6 | ...1847,1852,1877 
  challenge.ts     |   95.92 |    83.07 |     100 |   97.39 | ...17-319,553,577 
  context.ts       |   96.56 |    87.02 |   98.52 |    97.3 | ...1564,1719,1808 
  counters.ts      |   99.15 |       93 |     100 |   99.08 | 142               
  decisions.ts     |   94.05 |     74.4 |   97.36 |   98.13 | 160,259,327       
  disk.ts          |   92.88 |    84.69 |   95.55 |   95.54 | ...29,412-420,536 
  fids.ts          |    98.3 |    95.03 |   98.71 |   98.87 | 160,446,915-916   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   90.63 |       80 |   97.05 |   94.68 | ...1361,1371,1447 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,377-378 
  plan-blocks.ts   |   89.28 |    81.96 |     100 |   89.49 | ...70-572,575-576 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1153,1169-1170 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,219         
  roadmap.ts       |   96.63 |    91.42 |     100 |   97.15 | ...63,483-485,489 
  run-facts.ts     |    96.9 |    90.34 |     100 |   98.92 | 498-499           
  runs.ts          |   92.81 |     84.8 |     100 |    94.1 | ...1858,1890-1894 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...53,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 97,102            
  status.ts        |   97.29 |    95.54 |     100 |   98.45 | 103,203,407       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 319               
  steps.ts         |   87.57 |    81.59 |   89.06 |    88.7 | ...1385,1390,1392 
  summary.ts       |   93.93 |    87.09 |   88.37 |   93.03 | ...56-357,365-371 
  tests.ts         |   95.62 |    86.21 |   95.65 |   97.06 | ...1499,1561,1570 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.14 |    81.85 |   97.01 |   94.82 | ...1610,1783,2479 
  workstreams.ts   |   98.27 |    96.42 |     100 |     100 | 115               
  worktrees.ts     |   68.25 |    64.07 |   76.92 |   68.73 | ...93-896,899-900 
 engine/install    |   93.11 |    84.79 |   93.23 |   95.86 |                   
  cloud-env.ts     |   97.45 |    92.51 |     100 |     100 | ...98,722-774,877 
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 548-555           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.41 |    91.93 |   98.82 |   96.91 |                   
  status.ts        |     100 |    98.64 |     100 |     100 | 114               
  telemetry.ts     |   95.85 |    91.16 |   98.51 |   96.44 | ...1719,1762,2130 
 engine/render     |   90.02 |    81.39 |   98.07 |   92.24 |                   
  hosts.ts         |   88.31 |    78.89 |   94.73 |   89.69 | ...48-158,490-491 
  models.ts        |      90 |    81.11 |     100 |   94.26 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.36 |    97.29 |     100 |   99.26 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |      96 |       75 |     100 |   95.45 | 119               
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |     100 |    99.06 |     100 |     100 | 247               
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   90.71 |    85.83 |    95.4 |   91.43 |                   
  instructions.ts  |   90.71 |    85.83 |    95.4 |   91.43 | ...1662-1744,1749 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.43% ( 15006/16778 )
Branches     : 82.35% ( 10578/12845 )
Functions    : 95.19% ( 2398/2519 )
Lines        : 90.72% ( 13169/14516 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1762 of 3073 lines (129 KB of 241 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
