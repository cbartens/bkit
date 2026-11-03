
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (183 tests) 41079ms
   ✓ branches rebase: behaviour (17)
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 308ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 328ms
   ✓ branches push (17)
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 402ms
     ✓ runs exactly one git push 552ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 311ms
     ✓ --mode=abort pushes when the branch has no open PR 366ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 400ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 301ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 351ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 938ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 391ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 809ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1067ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 333ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 326ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 335ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 415ms
     ✓ a title that already carries the marker is left alone 334ms
     ✓ with no open PR: pushes the marker commit and edits no title 360ms
     ✓ a re-run is deduped: no second marker commit 389ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 423ms
   ✓ branches sync (10)
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 342ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 383ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 333ms
   ✓ branches sync-dev (5)
     ✓ on dev: moves the checkout too, and installs only because dev moved 464ms
     ✓ a failed install stops ship (16) 434ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 326ms
   ✓ branches land (23)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 571ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 534ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 541ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 550ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1417ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1554ms
     ✓ local: names unpushed dev as the cause when the branch carries it 320ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 346ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 730ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 766ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 719ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 508ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 830ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 718ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 530ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 721ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 546ms
     ✓ landPr refuses a main-based PR without retrying 524ms
     ✓ landPr refuses when the PR base is unknown 498ms
     ✓ PR not open (closed): stops (17) at once, no retry 580ms

 Test Files  1 passed (1)
      Tests  183 passed (183)
   Start at  08:39:16
   Duration  41.41s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-uEw8vj/junit.xml
