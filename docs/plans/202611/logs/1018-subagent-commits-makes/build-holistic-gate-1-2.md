
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-gaps-remediate-holistic-1-1-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-holistic-1-2.md docs/plans/202611/logs/1018-subagent-commits-makes/status.jsonl


[bkit:gate:changed] related: vitest related --run --passWithNoTests docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-gaps-remediate-holistic-1-1-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-holistic-1-2.md docs/plans/202611/logs/1018-subagent-commits-makes/status.jsonl

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes

No affected test files found, exiting with code 0

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1018-subagent-commits-makes/build-holistic-gate-2.log.reports/vitest-49765.xml

[bkit:gate:changed] named: vitest run --passWithNoTests .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts .bkit/core/engine/audits/workflows/close-squash.integration.test.ts .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts .bkit/core/engine/audits/workflows/ship-invariants.test.ts .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/checks/before/repo.test.ts .bkit/core/engine/checks/status-holes.test.ts .bkit/core/engine/commands/ci/ci.test.ts .bkit/core/engine/commands/lib.test.ts .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/challenge.test.ts .bkit/core/engine/commands/workflow/completeness.test.ts .bkit/core/engine/commands/workflow/context.test.ts .bkit/core/engine/commands/workflow/counters.test.ts .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/fids.test.ts .bkit/core/engine/commands/workflow/issues.test.ts .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/commands/workflow/locks.test.ts .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts .bkit/core/engine/commands/workflow/progress.integration.test.ts .bkit/core/engine/commands/workflow/prs.test.ts .bkit/core/engine/commands/workflow/run-facts.test.ts .bkit/core/engine/commands/workflow/runs.test.ts .bkit/core/engine/commands/workflow/runtime.test.ts .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts .bkit/core/engine/commands/workflow/status.test.ts .bkit/core/engine/commands/workflow/ste … [bkit] line shortened, 1049 bytes dropped

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes

 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (187 tests) 74900ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 444ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records no context block, and still closes, outside a Claude Code session 302ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 477ms
     ✓ defaults the close row to ending done 301ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 328ms
     ✓ writes one completeness row per close 432ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 409ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 334ms
   ✓ bkit workflows handover (29)
     ✓ --push commits and pushes the record on the feature branch without a handover 321ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 338ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 399ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 399ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 353ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 808ms
     ✓ --flush with nothing to record commits and pushes nothing 420ms
     ✓ --flush carries the named worktree's logs into the dev commit 784ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1609ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 10, the push refused → route stop with the not-pushed line 714ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 837ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 812ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1015ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 782ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1239ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1054ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1035ms
     ✓ --push on dev never carries a row whose references name another feature 1018ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 994ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1861ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1434ms
     ✓ --push commits in the named worktree, not the checkout it runs from 482ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1225ms
     ✓ preserves unlanded file deletions and ledger additions on close 2627ms
     ✓ preserves dirty work and uncertain branch evidence during close 2494ms
     ✓ preserves a local feature ref changed after its cleanup proof 2786ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1463ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1085ms
     ✓ a close that landed releases the lock 1428ms
     ✓ removes the worktree before it releases the lock 1603ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2259ms
       ✓ closePr refuses when the PR base is unknown 2011ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1088ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 400ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 594ms
     ✓ a second run's record does not let this FID's close commit 332ms
     ✓ record is present after workflows close and before the push 656ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1503ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1451ms
       ✓ a run closed by workflow-failed keeps no parked copy 1353ms
       ✓ a run closed by workflow-done keeps no parked copy 1393ms
       ✓ a FAILED run gets no row 1371ms
       ✓ a DONE run gets no row 1370ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1291ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 475ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 412ms
     ✓ puts each --line after the summary, in flag order 398ms
     ✓ --summary prints the file and keeps a copy in --outbox 359ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 431ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (61 tests) 80732ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 1087ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 7891ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 867ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 733ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 759ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 800ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1182ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1431ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 740ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 936ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 558ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 878ms
     ✓ design installs dependencies like build and debug 887ms
     ✓ plan installs dependencies like build and debug 752ms
     ✓ design stops on a failed install (5) 640ms
     ✓ plan stops on a failed install (5) 618ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1335ms
     ✓ tracks origin/feat/{fid} when only the remote has it 737ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 745ms
     ✓ reports a package manager that could not run (127) apart from a failed install 943ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 1155ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 2095ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 2049ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 1696ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 1755ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 1590ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1344ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1142ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1370ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1242ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1761ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1517ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 1764ms
     ✓ commits leftovers when a copy entry points outside the checkout 1585ms
     ✓ never commits the entries setup copies in from the main checkout 1489ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1572ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 773ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 804ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 912ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 917ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 977ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 875ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 1296ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1539ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 1486ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 832ms
     ✓ leaves a clean worktree's history alone 1683ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 1787ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 2121ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 2108ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 2102ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 2573ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 2217ms
     ✓ does not mark a resumed worktree it did not create 1106ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 550ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1267ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1562ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 900ms
 ✓ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (134 tests) 134548ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 368ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 353ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 389ms
     ✓ .husky/pre-push: empty stdin → gates still run 390ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 385ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 456ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ tag on a commit no origin branch holds → gates run 555ms
     ✓ tag pushed with a branch → gates run 584ms
     ✓ branch with files no origin dev / main tip has → gates run 526ms
     ✓ dev push with the files origin/dev already has → gates run 635ms
     ✓ main push with the files origin/main already has → gates run 556ms
     ✓ no origin dev / main ref fetched → a branch push gates 563ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 516ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 697ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 878ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 979ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 877ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 794ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 653ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 1069ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 767ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 1383ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1217ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 921ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 683ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 831ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 528ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 604ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 982ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 1064ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 821ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 678ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 913ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 631ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 380ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 972ms
     ✓ .husky/pre-push: a gate fails → no disk prune 430ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 485ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 416ms
     ✓ a stale register stops the push before any gate runs 637ms
     ✓ bkit check fails → the push stops before any gate runs 383ms
     ✓ the dependency audit runs before any gate, when its script is present 700ms
     ✓ no dependency-audit script → skipped, the gates still run 404ms
     ✓ no register script → skipped, the gates still run 720ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 609ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 446ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1046ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 483ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 713ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 524ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 533ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 728ms
   ✓ graphify register pre-push gate (18)
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 594ms
     ✓ branch with an open PR into dev, register current → push goes on 349ms
     ✓ branch with no open PR → no check, push goes on 449ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 583ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 363ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 591ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 611ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 498ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 763ms
   ✓ .husky/pre-push min push (24)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 2365ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 1987ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 1315ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 2285ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1331ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 1331ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1476ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1632ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1653ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1713ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 1684ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 2435ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 2259ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 1489ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 2807ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1395ms
     ✓ .husky/pre-push: a code file in the push → the full gate 1442ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1900ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1741ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 2399ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 2258ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 1782ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 1465ms
     ✓ .husky/pre-push: a code push still runs them 1507ms
   ✓ .husky/pre-push direnv (11)
     ✓ trusted .envrc → the gate sees its variables 975ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 471ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 525ms
     ✓ untrusted .envrc still prints the direnv allow line 400ms
     ✓ no .envrc → no direnv call 642ms
     ✓ direnv not on PATH → gates run, no warning 1292ms
     ✓ CI set → no direnv call 614ms
     ✓ delete-only push through direnv exec → exit 0, no gate 688ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1009ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1454ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 1408ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 2285ms
   ✓ .husky/pre-push PR conflict (16)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 2706ms
     ✓ open PR that merges cleanly → gates run, no message 2388ms
     ✓ no open PR → no fetch, gates run 2021ms
     ✓ gh not on PATH → warns, gates run 1863ms
     ✓ gh not on PATH → warns, gates run for both hook copies 1557ms
     ✓ base fetch fails → warns, gates run 2106ms
     ✓ dev push → no PR lookup 1784ms
     ✓ min push of a conflicting PR → blocked 2220ms
     ✓ BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run 2301ms
     ✓ open PR whose only conflict is a merge=union ledger → blocked 3038ms
     ✓ single-branch fetch refspec → checks the fetched base, no false block 2821ms
     ✓ fork PR with the same head branch name → ignored, gates run 2564ms
     ✓ shallow clone → no base fetch, warns, gates run 2836ms
     ✓ fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard 2197ms
     ✓ full page of fork PRs with a skip-ci head → CI-suppressor guard does not read it as no open PR 2301ms
     ✓ fork PRs past gh's page limit → same-repo PR still found, conflict blocked 2165ms
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 78736ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 2522ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 1354ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 1981ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 1190ms
     ✓ feat/** path — bkit_gate outcomes (10)
       ✓ github feat run passes the gate through the real bkit and stub gh 1379ms
       ✓ label removed gives label-absent, skip and a summary row 1353ms
       ✓ %s recorded fetch reply carrying bkit:auto passes the gate 1406ms
       ✓ jira marker AB2-12 dispatches 1284ms
       ✓ exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green 1406ms
       ✓ exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value 1031ms
       ✓ exit 80 reason=%s is unreadable with that reason and exits green 1540ms
       ✓ %s fetch output is unreadable reason=output-unparseable 1628ms
       ✓ absent node_modules/.bin/bkit warns bkit unavailable and exits green 526ms
       ✓ feat branch with no marker and no feature row gives no-issue 1403ms
     ✓ dev path — engine parse of the squash subject and merged-PR body (7)
       ✓ dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row 2706ms
       ✓ linear-shaped FID under the github tracker gives no-issue and no dispatch 1232ms
       ✓ dev subject naming several issues is a no-FID no-op 1772ms
       ✓ dev arm passes the gate for a closed issue that still carries bkit:auto 1946ms
       ✓ dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches 1688ms
       ✓ traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/ 3012ms
     ✓ a github tracker in package.json passes the tracker gate and dispatches 2527ms
     ✓ dev path — cross-session loop cap (T5) (4)
       ✓ refuses to dispatch uncounted when package.json cannot be read 1129ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 1763ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 1926ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 3164ms
     ✓ fix/** is not a routed surface (3)
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1256ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1868ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 1881ms
       ✓ F3: a non-FID-shaped branch (feat/add-oauth) no-ops cleanly instead of aborting the step 1599ms
       ✓ F3: a non-FID-shaped branch (feat/hotfix-login) no-ops cleanly instead of aborting the step 1294ms
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1446ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1355ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 1516ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2143ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 1931ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 1459ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 1653ms
       ✓ a branch with no status.jsonl dispatches as before 1689ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 1913ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 2239ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 1649ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 1995ms
     ✓ kill switch precedes the stale-run guard: a revoked FID writes no drop telemetry 1786ms
     ✓ FID recovery reads the commit SUBJECT, not a scoped line in the body 1327ms
   ✓ bkit-cloud.yml summary row — jobs field from the Select hand-off (2)
     ✓ pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason 1363ms
     ✓ no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets 1337ms
 ✓ .bkit/core/engine/commands/workflow/tracker.integration.test.ts (23 tests) 90454ms
   ✓ workflow comment lifecycle across real CLI processes (23)
     ✓ keeps auto startup with PR metadata and dispatch in one progress comment 2646ms
     ✓ redacts malformed Jira authorization from live probe diagnostics 679ms
     ✓ keeps published build completion and PR links in one terminal comment 3832ms
     ✓ continues after the prepared completion source disappears 2153ms
     ✓ records preparation and session association failures despite successful delivery 2286ms
     ✓ associates startup and run across restart or starts fresh safely 3605ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 9183ms
     ✓ keeps auto and phase progress separate across worktrees 4644ms
     ✓ continues close and cleanup after lost terminal response 3945ms
     ✓ starts fresh progress after cleanup and on a fresh clone 4451ms
     ✓ preserves substantive step results under a preparation comment boundary fault 5912ms
     ✓ preserves substantive step results under a cache comment boundary fault 5250ms
     ✓ preserves substantive step results under a receipt comment boundary fault 4270ms
     ✓ preserves substantive step results under a lock comment boundary fault 3822ms
     ✓ preserves substantive step results under a read comment boundary fault 4644ms
     ✓ preserves substantive step results under a append comment boundary fault 3964ms
     ✓ preserves substantive step results under a create comment boundary fault 4423ms
     ✓ preserves substantive step results under a reconciliation comment boundary fault 4142ms
     ✓ preserves substantive step results under a diagnostic comment boundary fault 3821ms
     ✓ keeps clean build progress and completion to two comments 6271ms
     ✓ preserves legacy receipts issue less skips and exact fallback through resume 4307ms
     ✓ an ad-hoc comment with no run proof exits 2 and reaches no tracker 652ms
     ✓ accepts a session minted in the main checkout from a linked worktree 1554ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (282 tests) 181013ms
   ✓ branches rebase: behaviour (32)
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 624ms
     ✓ produces byte-identical output to merge=union 564ms
     ✓ restores a trailing newline so the next append starts on its own line 332ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 302ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 468ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 368ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 876ms
     ✓ refuses a lockfile whose regenerate command fails 386ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 455ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 414ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 420ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 478ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 353ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 529ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 365ms
     ✓ resolves a conflict in each of two replayed commits across rounds 360ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ runs (0) with the landed path count once dev moved 413ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 396ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 368ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 930ms
     ✓ runs exactly one git push 1018ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 591ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 984ms
     ✓ --require-ci pushes as-is when dev has not moved 335ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 593ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 841ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 856ms
     ✓ --mode=abort pushes when the branch has no open PR 1126ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 686ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 721ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 449ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 490ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1645ms
     ✓ skip-ci HEAD on the replay is refused 412ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1122ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1825ms
     ✓ a level local dev is a plain push, recording nothing extra 505ms
     ✓ a record with no commits pushes nothing 414ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 309ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1268ms
     ✓ a rewritten branch is refused, never forced 456ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 644ms
     ✓ refuses a detached HEAD (exit 5) 300ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 575ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 458ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 476ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 673ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 651ms
     ✓ an up-to-date branch is a no-op 379ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 715ms
     ✓ a fetch that fails exits 10 341ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 441ms
     ✓ scan-diff still reports a new skip when its test … 388ms
     ✓ scan-diff reports a skip moved onto a different t… 379ms
     ✓ scan-diff does not cancel a skip moved between am… 346ms
     ✓ scan-diff does not spend an unchanged duplicate t… 366ms
     ✓ scan-diff recognizes a renamed test file 387ms
     ✓ scan-diff recognizes a suite moved into a differe… 368ms
     ✓ scan-diff does not let unrelated additions hide a… 374ms
     ✓ scan-diff attributes deletion to its old test ins… 309ms
     ✓ scan-diff consumes each moved assertion once and … 383ms
     ✓ scan-diff does not match identical assertions fro… 422ms
     ✓ scan-diff does not match the same leaf test name … 412ms
     ✓ scan-diff does not match a same-named test with d… 371ms
     ✓ scan-diff does not match a same-named test with c… 386ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 359ms
     ✓ --paths with no match exits 1 393ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 485ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 510ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 358ms
     ✓ --marker reads a diff over 1 MiB 381ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 477ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 415ms
     ✓ scan-diff finds an added skip 433ms
     ✓ scan-diff ignores a skip predating the base 380ms
     ✓ scan-diff reports a disabled test with its line 448ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 454ms
     ✓ scan-diff ignores a removed comment in a test file 420ms
     ✓ scan-diff ignores an assertion moved within the file 407ms
     ✓ scan-diff still reports a removed assertion 436ms
     ✓ scan-diff reports an assertion re-added only outside the test file 418ms
     ✓ scan-diff finds an added pytest mark skip 423ms
     ✓ scan-diff finds an added unittest skip 371ms
     ✓ scan-diff finds an added bare skip call 378ms
     ✓ scan-diff ignores a quoted skip in a documentation file 373ms
     ✓ scan-diff ignores a marker literal in a non-test source file 399ms
     ✓ scan-diff ignores an assertion whose expectation changed 405ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 408ms
     ✓ scan-diff reports a deleted test file 344ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 959ms
     ✓ a title that already carries the marker is left alone 914ms
     ✓ with no open PR: pushes the marker commit and edits no title 1061ms
     ✓ a re-run is deduped: no second marker commit 762ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1188ms
     ✓ --title-set skips gh entirely 574ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1197ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1924ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1065ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2262ms
     ✓ continues only the explicitly recorded target through the public merge command 1556ms
     ✓ fetches the unseen feature head before classifying the base 1098ms
     ✓ fast forwards the feature before either base path is chosen 2324ms
     ✓ merges divergent feature tips without rebasing either side 1347ms
     ✓ continues the feature merge before starting a dev merge 2343ms
     ✓ publishes local code with a CI running head before bookkeeping 2131ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3718ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2405ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1601ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 443ms
     ✓ Path B once dev moved; --head checks a given commit 631ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 644ms
     ✓ --merge-docs merges dev when docs/ is behind 718ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 762ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1190ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1250ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 992ms
     ✓ --merge-docs skips an empty bkit:generate script 868ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 815ms
     ✓ --merge-docs never merges on dev itself 791ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1113ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1142ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 886ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 798ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 458ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1321ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1551ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1440ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1142ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1288ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1609ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 893ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 640ms
     ✓ exits 10 when the fetch fails 411ms
     ✓ refuses --merge-docs with --head, and an unknown --head 414ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 743ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1011ms
     ✓ a failed install stops ship (16) 978ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 921ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1064ms
     ✓ exits 10 when the fetch fails 776ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 446ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1701ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1515ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1489ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1077ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2112ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 572ms
     ✓ reports undeclared and runs nothing with an empty script 538ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 580ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 681ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 404ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 6872ms
     ✓ records the failed job count and reads an uncounted local round as unknown 4675ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 3418ms
     ✓ finishes the first CI evidence round of the second debug run 2113ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1449ms
     ✓ saves the failed job count without the capstone job 491ms
     ✓ a CI selection keeps the failed job names, capstone left out 830ms
     ✓ counts the capstone job when it is the only failed job 407ms
     ✓ saves no failed job count when no job failed 416ms
     ✓ filters branch and PR discovery by configured workflow and exact head 562ms
     ✓ freezes explicit workflow run attempt and all failed job pages 427ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 902ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1149ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 874ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1226ms
     ✓ checks the named repository base and fails closed on missing evidence 629ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 521ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 574ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 327ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 378ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 432ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ bkit runs dispatch (21)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 636ms
     ✓ a failed re-trigger push names the cause in the log 874ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1052ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1333ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 681ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 308ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 641ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 666ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 416ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 744ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 915ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 846ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 370ms
     ✓ re-trigger on dev only uses the record of its own FID 479ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 593ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1363ms
   ✓ bkit runs context (21)
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 630ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 528ms
     ✓ debug: a failure test run is a failed run 594ms
     ✓ debug: a timed_out test run is a failed run 541ms
     ✓ debug: a startup_failure test run is a failed run 629ms
     ✓ debug: a test run still in progress or cancelled is not returned 605ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 525ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 513ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1169ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 303ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 417ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 461ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 439ms
     ✓ --file and --step go together 369ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 1984ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 391ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 390ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 372ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 523ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 586ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 504ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 508ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 828ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 474ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 493ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 701ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 305ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 488ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 446ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 408ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 324ms
     ✓ PASS is 0 failures with or without reports 426ms
     ✓ clears a previous attempt's reports before the gate runs 315ms
   ✓ bkit tests run --artifact (5)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a log small enough is copied whole: not clamped, raw null 307ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 742ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 380ms
     ✓ numbers runs within the workflow's active run and per step 751ms
     ✓ tests run --file records the tested snapshot on its test-run row 379ms
     ✓ a FAIL test-run row records each failing case as file and name 362ms
     ✓ a PASS test-run row records no failed tests 674ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 343ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 660ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 487ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 923ms
     ✓ --since-pass-of skips failing runs and steps it does not name 823ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 861ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 458ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 448ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 516ms
     ✓ a deleted file that no file mentions passes and the log says so 310ms
     ✓ a failed importer search runs the whole check 535ms
     ✓ --changed-since=feature-base starts at the feature's start commit 585ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 501ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 421ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 449ms
     ✓ a failing required push gate leaves the failed marker 403ms
     ✓ uncommitted code blocks the receipt until it is committed 592ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 414ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 418ms
     ✓ a planned test absent from a loaded report is a missing gap 433ms
     ✓ a file that fails to load is a red of kind red-not-loaded 634ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 371ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 641ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 302ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 327ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 474ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 407ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 429ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 530ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 565ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 863ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 526ms
     ✓ green: lists each gap kind, with the runner output 538ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 956ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 377ms
       ✓ green clears an exception-only task from a human commit 348ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (91 tests) 50613ms
   ✓ bkit worktrees setup — debug (5)
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 829ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 333ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 352ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 372ms
     ✓ finishes a CI round only with its own failed job count 306ms
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 309ms
     ✓ reports a failed commit with exit 8 without writing the row 647ms
     ✓ a failed commit leaves no row staged in the index 384ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 530ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 401ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 568ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 766ms
   ✓ bkit steps finish (17)
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 390ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 334ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 577ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 476ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
> [bkit] TRUNCATED HERE — 80 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 314ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 420ms
     ✓ retries a failed create once, and exits 5 when it fails twice 575ms
     ✓ exits 5 when the open-PR probe errors 418ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 580ms
     ✓ prs open still opens against any other base 369ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 514ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 451ms
     ✓ exits 4 when gh errors and 80 when it needs auth 939ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 849ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 552ms
     ✓ runs no merge when the PR is already MERGED 363ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 400ms
     ✓ prs merge refuses a PR whose base is main 639ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 430ms
     ✓ prs merge refuses when the PR base is unknown 547ms
     ✓ prs merge reads the base from the one pr view it already makes 1154ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1028ms
   ✓ bkit prs update-branch (5)
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 330ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 308ms
     ✓ never reads dev's required checks without --only-if-required 519ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 897ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 892ms
     ✓ is not green when a check failed, naming it (exit 1) 743ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 566ms
     ✓ is not green on an empty rollup (total 0) 922ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 852ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 606ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 779ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 35621ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 791ms
     ✓ names each net-new and worsened finding in the log and the JSON 913ms
     ✓ fails on a net score rise with no net count change 510ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 767ms
     ✓ treats a net score at or below 0.001 as float noise 872ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1099ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 440ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 566ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 946ms
     ✓ exits 4 on a dropped net field instead of silently passing 651ms
     ✓ exits 4 on no summary instead of silently passing 782ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1116ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 810ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 882ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1039ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 890ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 728ms
     ✓ fails (exit 1) when vale reports alerts 934ms
     ✓ exits 6 on a vale runtime error 539ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 760ms
     ✓ falls back to vale sync when the main worktree has none 495ms
     ✓ fails when vale sync cannot restore the required styles 899ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 517ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 308ms
     ✓ exits 1 naming the files outside, whatever the commit message says 309ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 652ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 349ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 310ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 814ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1132ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1059ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1223ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 713ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 515ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 718ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 311ms
     ✓ fetches the issue and its comments as GitHub returns them 331ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 426ms
     ✓ invalidates missing corrupt and unsupported progress cache 907ms
     ✓ contains cache read and write failures as standalone degradation 393ms
     ✓ uses legacy receipts and contains receipt failures 529ms
     ✓ records an engine-action row and skips the same key + body on a re-run 388ms
     ✓ a recent identical comment counts as done (the final close comment) 346ms
     ✓ a failed post reports done false with the reason and never leaks a token 320ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 441ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 319ms
     ✓ a different marker hash posts 362ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 325ms
 ✓ .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts (25 tests) 15610ms
   ✓ bkit [auto route] marker comes from the re-read labels (25)
> [bkit] TRUNCATED HERE — 421 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 195 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 169 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 205 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 171 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 453 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 134 lines omitted. Dropped content was NOT read.
     ✓ the marker is read from the main checkout even when run inside a linked worktree 754ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 345ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees not allowed (cloud) -> adopts the repo root 572ms
   ✓ bkit runtime row (6)
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 359ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 420ms
     ✓ --file into a missing directory is refused, not created 399ms
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 91 lines omitted. Dropped content was NOT read.
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write: .claude/commands/bkit-auto.md
[bkit-install] write: .claude/commands/bkit-build.md
[bkit-install] write: .claude/commands/bkit-debug.md
[bkit-install] write: .claude/commands/bkit-design.md
[bkit-install] write: .claude/commands/bkit-plan.md
[bkit-install] write: .claude/commands/bkit-ship.md
[bkit-install] write: .claude/agents/bkit-audit-generate.md
[bkit-install] write: .claude/agents/bkit-build-challenge-1.md
[bkit-install] write: .claude/agents/bkit-build-challenge-2.md
[bkit-install] write: .claude/agents/bkit-build-install-skills.md
[bkit-install] write: .claude/agents/bkit-build-plan-convert.md
[bkit-install] write: .claude/agents/bkit-build-plan-current.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-install] write: .claude/agents/bkit-build-plan-tests.md
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .claude/agents/bkit-design-generate.md
[bkit-install] write: .claude/agents/bkit-design-organise.md
[bkit-install] write: .claude/agents/bkit-design-review-1.md
[bkit-install] write: .claude/agents/bkit-design-review-2.md
[bkit-install] write: .claude/agents/bkit-design-spike.md
[bkit-install] write: .claude/agents/bkit-design-update.md
[bkit-install] write: .claude/agents/bkit-plan-generate.md
[bkit-install] write: .claude/agents/bkit-plan-review-1.md
[bkit-install] write: .claude/agents/bkit-plan-review-2.md
[bkit-install] write: .claude/agents/bkit-plan-scope-check.md
[bkit-install] write: .claude/agents/bkit-plan-update.md
[bkit-install] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .claude/agents/bkit-ship-update-docs.md
[bkit-install] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-install] claude: CLAUDE.md
[bkit-install] claude: .claude/settings.json
[bkit-install] claude: .claude/hooks/bkit-preflight.sh
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-readguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .mcp.json
[bkit-install] claude: .bkit/.env.example
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .cursor/commands/bkit-auto.md
[bkit-install] write: .cursor/commands/bkit-build.md
[bkit-install] write: .cursor/commands/bkit-debug.md
[bkit-install] write: .cursor/commands/bkit-design.md
[bkit-install] write: .cursor/commands/bkit-plan.md
[bkit-install] write: .cursor/commands/bkit-ship.md
[bkit-install] write: .cursor/agents/bkit-audit-generate.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-1.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-2.md
[bkit-install] write: .cursor/agents/bkit-build-install-skills.md
[bkit-install] write: .cursor/agents/bkit-build-plan-convert.md
[bkit-install] write: .cursor/agents/bkit-build-plan-current.md
[bkit-install] write: .cursor/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tasks.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tests.md
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .cursor/agents/bkit-design-generate.md
[bkit-install] write: .cursor/agents/bkit-design-organise.md
[bkit-install] write: .cursor/agents/bkit-design-review-1.md
[bkit-install] write: .cursor/agents/bkit-design-review-2.md
[bkit-install] write: .cursor/agents/bkit-design-spike.md
[bkit-install] write: .cursor/agents/bkit-design-update.md
[bkit-install] write: .cursor/agents/bkit-plan-generate.md
[bkit-install] write: .cursor/agents/bkit-plan-review-1.md
[bkit-install] write: .cursor/agents/bkit-plan-review-2.md
[bkit-install] write: .cursor/agents/bkit-plan-scope-check.md
[bkit-install] write: .cursor/agents/bkit-plan-update.md
[bkit-install] write: .cursor/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .cursor/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .cursor/agents/bkit-ship-update-docs.md
[bkit-install] write: .cursor/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .cursor/agents/bkit-utility-update-decisions.md
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .cursor/agents/bkit-utility-update-tracker.md
[bkit-install] cursor: .cursor/hooks.json
[bkit-install] cursor: .cursor/hooks/bkit-preflight.sh
[bkit-install] cursor: .cursor/rules/bkit-rules.mdc
[bkit-install] cursor: .cursor/hooks/bkit-guardrails.cjs
[bkit-install] cursor: .cursor/hooks/bkit-gateguard.cjs
[bkit-install] cursor: .cursor/hooks/bkit-readguard.cjs
[bkit-install] cursor: .cursor/mcp.json
[bkit-install] cursor: .cursor/cli.json
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .codex/agents/bkit-audit-generate.toml
[bkit-install] write: .codex/agents/bkit-build-challenge-1.toml
[bkit-install] write: .codex/agents/bkit-build-challenge-2.toml
[bkit-install] write: .codex/agents/bkit-build-install-skills.toml
[bkit-install] write: .codex/agents/bkit-build-plan-convert.toml
[bkit-install] write: .codex/agents/bkit-build-plan-current.toml
[bkit-install] write: .codex/agents/bkit-build-plan-gaps-remediate.toml
[bkit-install] write: .codex/agents/bkit-build-plan-tasks.toml
[bkit-install] write: .codex/agents/bkit-build-plan-tests.toml
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-3.toml
[bkit-install] write: .codex/agents/bkit-design-generate.toml
[bkit-install] write: .codex/agents/bkit-design-organise.toml
[bkit-install] write: .codex/agents/bkit-design-review-1.toml
[bkit-install] write: .codex/agents/bkit-design-review-2.toml
[bkit-install] write: .codex/agents/bkit-design-spike.toml
[bkit-install] write: .codex/agents/bkit-design-update.toml
[bkit-install] write: .codex/agents/bkit-plan-generate.toml
[bkit-install] write: .codex/agents/bkit-plan-review-1.toml
[bkit-install] write: .codex/agents/bkit-plan-review-2.toml
[bkit-install] write: .codex/agents/bkit-plan-scope-check.toml
[bkit-install] write: .codex/agents/bkit-plan-update.toml
[bkit-install] write: .codex/agents/bkit-ship-conflict-resolve.toml
[bkit-install] write: .codex/agents/bkit-ship-deferred-sweep.toml
[bkit-install] write: .codex/agents/bkit-ship-update-docs.toml
[bkit-install] write: .codex/agents/bkit-utility-compress-markdown.toml
[bkit-install] write: .codex/agents/bkit-utility-update-decisions.toml
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
[bkit-install] write: .codex/agents/bkit-utility-update-tracker.toml
[bkit-install] write: .agents/skills/bkit-auto/SKILL.md
[bkit-install] write: .agents/skills/bkit-build/SKILL.md
[bkit-install] write: .agents/skills/bkit-debug/SKILL.md
[bkit-install] write: .agents/skills/bkit-design/SKILL.md
[bkit-install] write: .agents/skills/bkit-plan/SKILL.md
[bkit-install] write: .agents/skills/bkit-ship/SKILL.md
[bkit-install] codex: .codex/hooks.json
[bkit-install] codex: .codex/hooks/bkit-gateguard.cjs
[bkit-install] codex: .codex/hooks/bkit-readguard.cjs
[bkit-install] codex: .codex/hooks/bkit-rules.cjs
[bkit-install] codex: .codex/hooks/bkit-guardrails.cjs
[bkit-install] codex: .codex/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[bkit-install] antigravity: .agents/plugins/bkit/plugin.json
[bkit-install] antigravity: GEMINI.md
[bkit-install] antigravity: .agents/plugins/bkit/hooks.json
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs
[bkit-install] write version pin: .bkit/version (6.2.0)
[bkit-install] Running core payload pass
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] cursor: .cursor/hooks/bkit-guardrails.cjs
[bkit-install] cursor: .cursor/hooks/bkit-gateguard.cjs
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] codex: .codex/hooks/bkit-gateguard.cjs
[bkit-install] codex: .codex/hooks/bkit-guardrails.cjs
[bkit-install] codex: .codex/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs
[bkit-install] write version pin: .bkit/version (6.2.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > shared hook behaviour footprint (fresh install and upgrade) > upgrades shipped registrations without dropping consumer hook groups or permissions
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] core: .agents/docs.md
[bkit-install] core: .agents/rules.md
[bkit-install] core: .agents/skills.md
[bkit-install] core: AGENTS.md
[bkit-install] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] core: docs/templates/bkit-audit-adoption.md
[bkit-install] core: docs/templates/bkit-audit-agents.md
[bkit-install] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] core: docs/templates/bkit-audit-analytics.md
[bkit-install] core: docs/templates/bkit-audit-annotations.md
[bkit-install] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] core: docs/templates/bkit-audit-app-store.md
[bkit-install] core: docs/templates/bkit-audit-architecture.md
[bkit-install] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] core: docs/templates/bkit-audit-config.md
[bkit-install] core: docs/templates/bkit-audit-cost.md
[bkit-install] core: docs/templates/bkit-audit-coverage.md
[bkit-install] core: docs/templates/bkit-audit-database.md
[bkit-install] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
[bkit-install] core: docs/templates/bkit-audit-issues.md
[bkit-install] core: docs/templates/bkit-audit-llm.md
[bkit-install] core: docs/templates/bkit-audit-logs.md
[bkit-install] core: docs/templates/bkit-audit-models.md
[bkit-install] core: docs/templates/bkit-audit-privacy.md
[bkit-install] core: docs/templates/bkit-audit-prompts.md
[bkit-install] core: docs/templates/bkit-audit-red-team.md
[bkit-install] core: docs/templates/bkit-audit-reliability.md
[bkit-install] core: docs/templates/bkit-audit-repo.md
[bkit-install] core: docs/templates/bkit-audit-security.md
[bkit-install] core: docs/templates/bkit-audit-slop.md
[bkit-install] core: docs/templates/bkit-audit-testing.md
[bkit-install] core: docs/templates/bkit-audit-usability.md
[bkit-install] core: docs/templates/bkit-plan.md
[bkit-install] core: .gitignore
[bkit-install] core: .gitattributes
[bkit-install] Running bkit docs pass
[bkit-install] core: .bkit/authoring.md
[bkit-install] core: .bkit/cloud.md
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
[bkit-install] core: .bkit/router.md
[bkit-install] core: .bkit/templates.md
[bkit-install] core: .bkit/trackers.md
[bkit-install] core: .bkit/workflows.md
[bkit-install] core: .bkit/README.md
[bkit-install] Running template copies pass
[bkit-install] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] template added: .bkit/templates/.cursor/environment.json
[bkit-install] template added: .bkit/templates/.cursor/settings.json
[bkit-install] template added: .bkit/templates/.envrc
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write: .claude/commands/bkit-auto.md
[bkit-install] write: .claude/commands/bkit-build.md
[bkit-install] write: .claude/commands/bkit-debug.md
[bkit-install] write: .claude/commands/bkit-design.md
[bkit-install] write: .claude/commands/bkit-plan.md
[bkit-install] write: .claude/commands/bkit-ship.md
[bkit-install] write: .claude/agents/bkit-audit-generate.md
[bkit-install] write: .claude/agents/bkit-build-challenge-1.md
[bkit-install] write: .claude/agents/bkit-build-challenge-2.md
[bkit-install] write: .claude/agents/bkit-build-install-skills.md
[bkit-install] write: .claude/agents/bkit-build-plan-convert.md
[bkit-install] write: .claude/agents/bkit-build-plan-current.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-install] write: .claude/agents/bkit-build-plan-tests.md
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .claude/agents/bkit-design-generate.md
[bkit-install] write: .claude/agents/bkit-design-organise.md
[bkit-install] write: .claude/agents/bkit-design-review-1.md
[bkit-install] write: .claude/agents/bkit-design-review-2.md
[bkit-install] write: .claude/agents/bkit-design-spike.md
[bkit-install] write: .claude/agents/bkit-design-update.md
[bkit-install] write: .claude/agents/bkit-plan-generate.md
[bkit-install] write: .claude/agents/bkit-plan-review-1.md
[bkit-install] write: .claude/agents/bkit-plan-review-2.md
[bkit-install] write: .claude/agents/bkit-plan-scope-check.md
[bkit-install] write: .claude/agents/bkit-plan-update.md
[bkit-install] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .claude/agents/bkit-ship-update-docs.md
[bkit-install] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-install] claude: CLAUDE.md
[bkit-install] claude: .claude/settings.json
[bkit-install] claude: .claude/hooks/bkit-preflight.sh
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-readguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .mcp.json
[bkit-install] claude: .bkit/.env.example
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .cursor/commands/bkit-auto.md
[bkit-install] write: .cursor/commands/bkit-build.md
[bkit-install] write: .cursor/commands/bkit-debug.md
[bkit-install] write: .cursor/commands/bkit-design.md
[bkit-install] write: .cursor/commands/bkit-plan.md
[bkit-install] write: .cursor/commands/bkit-ship.md
[bkit-install] write: .cursor/agents/bkit-audit-generate.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-1.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-2.md
[bkit-install] write: .cursor/agents/bkit-build-install-skills.md
[bkit-install] write: .cursor/agents/bkit-build-plan-convert.md
[bkit-install] write: .cursor/agents/bkit-build-plan-current.md
[bkit-install] write: .cursor/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tasks.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tests.md
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .cursor/agents/bkit-design-generate.md
[bkit-install] write: .cursor/agents/bkit-design-organise.md
[bkit-install] write: .cursor/agents/bkit-design-review-1.md
[bkit-install] write: .cursor/agents/bkit-design-review-2.md
[bkit-install] write: .cursor/agents/bkit-design-spike.md
[bkit-install] write: .cursor/agents/bkit-design-update.md
[bkit-install] write: .cursor/agents/bkit-plan-generate.md
[bkit-install] write: .cursor/agents/bkit-plan-review-1.md
[bkit-install] write: .cursor/agents/bkit-plan-review-2.md
[bkit-install] write: .cursor/agents/bkit-plan-scope-check.md
[bkit-install] write: .cursor/agents/bkit-plan-update.md
[bkit-install] write: .cursor/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .cursor/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .cursor/agents/bkit-ship-update-docs.md
[bkit-install] write: .cursor/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .cursor/agents/bkit-utility-update-decisions.md
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .cursor/agents/bkit-utility-update-tracker.md
[bkit-install] cursor: .cursor/hooks.json
[bkit-install] cursor: .cursor/hooks/bkit-preflight.sh
[bkit-install] cursor: .cursor/rules/bkit-rules.mdc
[bkit-install] cursor: .cursor/hooks/bkit-guardrails.cjs
[bkit-install] cursor: .cursor/hooks/bkit-gateguard.cjs
[bkit-install] cursor: .cursor/hooks/bkit-readguard.cjs
[bkit-install] cursor: .cursor/mcp.json
[bkit-install] cursor: .cursor/cli.json
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[bkit-install] antigravity: .agents/plugins/bkit/plugin.json
[bkit-install] antigravity: GEMINI.md
[bkit-install] antigravity: .agents/plugins/bkit/hooks.json
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs
[bkit-install] write version pin: .bkit/version (6.2.0)
[bkit-install] Running core payload pass
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > shared hook behaviour footprint (fresh install and upgrade) > upgrades a shipped Claude edit group without dropping a consumer hook inside it
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] core: .agents/docs.md
[bkit-install] core: .agents/rules.md
[bkit-install] core: .agents/skills.md
[bkit-install] core: AGENTS.md
[bkit-install] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] core: docs/templates/bkit-audit-adoption.md
[bkit-install] core: docs/templates/bkit-audit-agents.md
[bkit-install] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] core: docs/templates/bkit-audit-analytics.md
[bkit-install] core: docs/templates/bkit-audit-annotations.md
[bkit-install] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] core: docs/templates/bkit-audit-app-store.md
[bkit-install] core: docs/templates/bkit-audit-architecture.md
[bkit-install] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] core: docs/templates/bkit-audit-config.md
[bkit-install] core: docs/templates/bkit-audit-cost.md
[bkit-install] core: docs/templates/bkit-audit-coverage.md
[bkit-install] core: docs/templates/bkit-audit-database.md
[bkit-install] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
[bkit-install] core: docs/templates/bkit-audit-issues.md
[bkit-install] core: docs/templates/bkit-audit-llm.md
[bkit-install] core: docs/templates/bkit-audit-logs.md
[bkit-install] core: docs/templates/bkit-audit-models.md
[bkit-install] core: docs/templates/bkit-audit-privacy.md
[bkit-install] core: docs/templates/bkit-audit-prompts.md
[bkit-install] core: docs/templates/bkit-audit-red-team.md
[bkit-install] core: docs/templates/bkit-audit-reliability.md
[bkit-install] core: docs/templates/bkit-audit-repo.md
[bkit-install] core: docs/templates/bkit-audit-security.md
[bkit-install] core: docs/templates/bkit-audit-slop.md
[bkit-install] core: docs/templates/bkit-audit-testing.md
[bkit-install] core: docs/templates/bkit-audit-usability.md
[bkit-install] core: docs/templates/bkit-plan.md
[bkit-install] core: .gitignore
[bkit-install] core: .gitattributes
[bkit-install] Running bkit docs pass
[bkit-install] core: .bkit/authoring.md
[bkit-install] core: .bkit/cloud.md
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
[bkit-install] core: .bkit/router.md
[bkit-install] core: .bkit/templates.md
[bkit-install] core: .bkit/trackers.md
[bkit-install] core: .bkit/workflows.md
[bkit-install] core: .bkit/README.md
[bkit-install] Running template copies pass
[bkit-install] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] template added: .bkit/templates/.cursor/environment.json
[bkit-install] template added: .bkit/templates/.cursor/settings.json
[bkit-install] template added: .bkit/templates/.envrc
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write: .claude/commands/bkit-auto.md
[bkit-install] write: .claude/commands/bkit-build.md
[bkit-install] write: .claude/commands/bkit-debug.md
[bkit-install] write: .claude/commands/bkit-design.md
[bkit-install] write: .claude/commands/bkit-plan.md
[bkit-install] write: .claude/commands/bkit-ship.md
[bkit-install] write: .claude/agents/bkit-audit-generate.md
[bkit-install] write: .claude/agents/bkit-build-challenge-1.md
[bkit-install] write: .claude/agents/bkit-build-challenge-2.md
[bkit-install] write: .claude/agents/bkit-build-install-skills.md
[bkit-install] write: .claude/agents/bkit-build-plan-convert.md
[bkit-install] write: .claude/agents/bkit-build-plan-current.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-install] write: .claude/agents/bkit-build-plan-tests.md
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .claude/agents/bkit-design-generate.md
[bkit-install] write: .claude/agents/bkit-design-organise.md
[bkit-install] write: .claude/agents/bkit-design-review-1.md
[bkit-install] write: .claude/agents/bkit-design-review-2.md
[bkit-install] write: .claude/agents/bkit-design-spike.md
[bkit-install] write: .claude/agents/bkit-design-update.md
[bkit-install] write: .claude/agents/bkit-plan-generate.md
[bkit-install] write: .claude/agents/bkit-plan-review-1.md
[bkit-install] write: .claude/agents/bkit-plan-review-2.md
[bkit-install] write: .claude/agents/bkit-plan-scope-check.md
[bkit-install] write: .claude/agents/bkit-plan-update.md
[bkit-install] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .claude/agents/bkit-ship-update-docs.md
[bkit-install] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-install] claude: CLAUDE.md
[bkit-install] claude: .claude/settings.json
[bkit-install] claude: .claude/hooks/bkit-preflight.sh
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-readguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .mcp.json
[bkit-install] claude: .bkit/.env.example
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write version pin: .bkit/version (6.2.0)

 ✓ .bkit/core/engine/install/modules/core.integration.test.ts (165 tests) 16355ms
   ✓ deterministic bookkeeping contracts in a fresh consumer (1)
     ✓ installs and upgrades fresh consumers with deterministic bookkeeping contracts 8294ms
   ✓ shared hook behaviour footprint (fresh install and upgrade) (3)
     ✓ installs and upgrades shared hook behavior without replacing owned drivers 602ms
     ✓ upgrades shipped registrations without dropping consumer hook groups or permissions 472ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 14903ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 874ms
     ✓ a failing file absent at the base commit is the branch's 561ms
     ✓ an undeclared bkit:test:file reads unknown 552ms
     ✓ a failed base install reads unknown and removes the worktree 577ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 811ms
     ✓ copies the worktreeCopy entries into the base checkout 722ms
     ✓ no origin/dev ref reads unknown 321ms
     ✓ a base file run that writes no report reads unknown 749ms
     ✓ a passing CI run at the exact base sha settles none without a local run 513ms
     ✓ a CI run that cannot settle the base falls back to the local run 3914ms
     ✓ a pull_request-event CI run at the base sha does not settle none 912ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 796ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 744ms
     ✓ the base test run does not inherit the hooks-off git config 673ms
     ✓ adopt follows the run's runtimeWorktrees 1335ms
     ✓ worktreeInstall off reads unknown 374ms
 ✓ .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts (5 tests) 8288ms
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 688ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 425ms
     ✓ stops the step when the command crashed or was misused 984ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
     ✓ ship pushes the held branch and opens a dev PR 2583ms
     ✓ ship gates on CI and merges the pinned head 3606ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 13728ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 622ms
     ✓ keeps each context's own section banner and drops every other context's 1244ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 456ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 378ms
     ✓ --base narrows the range to the commits after a group's start sha 372ms
     ✓ diff from a group start covers only the group's commits 361ms
     ✓ an empty range writes a one-line note and zero numbers 367ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 484ms
     ✓ --reset-log empties the step's clamp log before the record lands 786ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 419ms
     ✓ whole: nothing omitted and no copy kept 333ms
     ✓ the budget honours topFiles and totalLines and says when the ceiling cut a file 311ms
   ✓ featureBase (#960) (7)
     ✓ featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev 405ms
     ✓ featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged 344ms
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 710ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 644ms
     ✓ context diff without --base leaves out an unpushed local dev commit 435ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 9221ms
   ✓ bkit issues comment (33)
     ✓ renders header fields in the order the flags were given 325ms
   ✓ bkit issues comment --post (7)
     ✓ renders audit comments from validated result and preserves tracker adapters 443ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 789ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (28 tests) 13338ms
   ✓ changedFiles (2)
     ✓ adds files changed in commits since the base, and drops one a later commit deleted 383ms
   ✓ snapshotTree / changedBetween (5)
     ✓ the tested snapshot holds uncommitted and untracked files 314ms
     ✓ snapshotting leaves the index and working tree as they were 389ms
     ✓ changedBetween lists the existing files that differ from a snapshot, and the deleted ones apart 442ms
   ✓ deletedFiles (1)
     ✓ deletedFiles lists a file removed since the base 377ms
   ✓ tests changed (13)
     ✓ runs bkit:gate:changed with the changed files as its arguments 819ms
     ✓ counts files committed since --base 761ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 563ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1055ms
     ✓ runs the --fallback gate even when no file changed, as it did before 538ms
     ✓ exits 4 when the gate could not run 490ms
     ✓ changed-since exits 81 with the holder read from the status file 488ms
     ✓ exits 4 with no verdict when the status file says the hold limit stopped the gate 752ms
     ✓ exits 1 when the gate exits 75 and writes no status file 873ms
   ✓ tests changed default base (3)
     ✓ lists a file the subagent committed after the last step-done commit 988ms
     ✓ lists the same file when it is left uncommitted 929ms
     ✓ leaves out a file only the previous step's own commit touched 858ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 4815ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1341ms
     ✓ runGit names ENOBUFS when output passes the limit 908ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 876ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 388ms
 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (3 tests) 9860ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 2583ms
   ✓ a takeover of an earlier task's planned test (2)
     ✓ a takeover across groups lets the next code step finish 1791ms
     ✓ a mid-build contradiction adds a takeover task and the next code step finishes 5484ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 5188ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 683ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1165ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 404ms
     ✓ challenge gate without --base sizes only the branch's own lines 558ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 9790ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 1109ms
     ✓ workflow progress command wiring progress specialized completion producers 4703ms
     ✓ workflow progress command wiring progress gate only completions 483ms
     ✓ progress excludes noncompletions 2176ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (26 tests) 3967ms
   ✓ publication ownership lock (4)
     ✓ reclaims only a proven dead matching process identity 356ms
   ✓ bkit locks release (5)
     ✓ locks release removes the FID shared-checkout record 300ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 3679ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 3367ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 414ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 395ms
     ✓ currency emits no hunk outside the matched set 334ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 539ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 2948ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 688ms
   ✓ bkit counters progress (19)
     ✓ judges codeChanged on source only, from the rounds' parent commits 348ms
     ✓ judges codeChanged between the compared same-scope rounds 309ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 3201ms
   ✓ bkit status invocation (7)
     ✓ binds group and attempt and registers setup, remediation and ship steps 327ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 2188ms
   ✓ runLines (5)
     ✓ counts code, tests and docs apart, and leaves out plans, run logs and the ledgers 306ms
     ✓ counts deleted lines into changed 427ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 599ms
     ✓ is null when first is not an ancestor of last, or either is missing 375ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 2308ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (301 tests) 663ms
 ✓ .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts (6 tests) 1721ms
   ✓ design close: archive before overwrite (4)
     ✓ moves an existing canonical design into archive/ and writes the new one 314ms
 ✓ .bkit/core/engine/commands/workflow/step-base.test.ts (4 tests) 1869ms
   ✓ stepBase (4)
     ✓ returns the commit that holds the last step-done row 588ms
     ✓ with a step name returns the commit of the row before that step's latest row 544ms
     ✓ falls back to the run start commit, and null with no run 396ms
     ✓ returns the parentSha of an uncommitted row even after a later commit sweeps it in 339ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 488ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1756ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 149ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 274ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 118ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (327 tests) 417ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 95ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 73ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 55ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (19 tests) 21ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 45ms

 Test Files  53 passed (53)
      Tests  4216 passed (4216)
   Start at  10:57:55
   Duration  335.05s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1018-subagent-commits-makes/build-holistic-gate-2.log.reports/vitest-49797.xml

[bkit:gate:changed] named: bats tests/shell/bkit-status-holes-sweep.bats
1..2
ok 1 the sweep prints the summary line the lane greps for
ok 2 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] format: prettier --check --ignore-unknown docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-gaps-remediate-holistic-1-1-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-holistic-1-2.md docs/plans/202611/logs/1018-subagent-commits-makes/status.jsonl
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 2312 of 12202 lines (164 KB of 822 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
