
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (189 tests) 43282ms
   ✓ branches rebase: behaviour (17)
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 534ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 593ms
   ✓ branches push (17)
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 645ms
     ✓ runs exactly one git push 533ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 306ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 480ms
     ✓ --mode=abort pushes when the branch has no open PR 317ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 370ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 322ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1166ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 412ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 795ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 648ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 330ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 334ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 335ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 665ms
     ✓ a title that already carries the marker is left alone 347ms
     ✓ with no open PR: pushes the marker commit and edits no title 367ms
     ✓ a re-run is deduped: no second marker commit 395ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 430ms
   ✓ branches sync (10)
     ✓ --merge-docs merges dev when docs/ is behind 301ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 354ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 383ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 387ms
   ✓ branches sync-dev (5)
     ✓ on dev: moves the checkout too, and installs only because dev moved 515ms
     ✓ a failed install stops ship (16) 422ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 311ms
   ✓ branches land (23)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 575ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 540ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 536ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 559ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1316ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1495ms
     ✓ local: names unpushed dev as the cause when the branch carries it 317ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 347ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 985ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 748ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 676ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 617ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 795ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 681ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 514ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 783ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 572ms
     ✓ landPr refuses a main-based PR without retrying 491ms
     ✓ landPr refuses when the PR base is unknown 496ms
     ✓ PR not open (closed): stops (17) at once, no retry 577ms

 Test Files  1 passed (1)
      Tests  189 passed (189)
   Start at  12:59:41
   Duration  43.62s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-lPRguc/junit.xml
