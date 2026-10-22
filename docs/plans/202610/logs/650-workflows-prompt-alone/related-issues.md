## #639 — Land parallel workflow closes on dev without colliding (closed)

### Narrative

Running several `/bkit-design` and `/bkit-plan` runs at once collides at the very end, when each run lands its docs on `dev`. How it collides depends on where the run happens. `bkit runtime detect` (`.bkit/core/engine/commands/workflow/runtime.ts`) sorts runs into two groups, and each group lands a different way:

<!-- prettier-ignore -->
| Runtime | Can push `dev`? | How the close lands today |
| --- | --- | --- |
| `LOCAL` (laptop) | yes | `landLocal`: squash `feat/{FID}` into `dev` in the main checkout, push `dev` |
| `GITHUB_ACTION` (bkit-cloud runner), `CLOUD_CURSOR` (Cursor background agent) | yes | `landLocal`, same as a laptop, on the runner's own clone |
| `CLOUD_CLAUDE` (claude.ai cloud session) | no — the git proxy only lets a session push its current branch | `landPr`: push the session branch, open or reuse a PR, squash-merge it |

Both functions live in `.bkit/core/engine/commands/workflow/branches.ts`. Both already land the right _content_: only doc and ledger files (`CLOSE_DOCS`), then the worktree and branch are cleaned up. The collisions come from _how_ they land.

**1. Laptop: the close works inside the main checkout.** `landLocal` runs `git checkout dev`, `git pull --ff-only` and `git merge --squash` in the same folder you and other agents are working in.

- **Another session's work blocks the close.** Logged case: `.bkit/friction.jsonl` key `branches-land-blocked-by-concurrent-dev-work` (5.0.3, plan close). Another agent had 18 staged files on `dev` in the main checkout; git refused the squash ("Your local changes would be overwritten by merge") and the close died with exit 17.
- **The close can publish someone else's unfinished commits.** In that same case local `dev` was 3 commits ahead of `origin/dev`. `git pull --ff-only` succeeds when local is ahead (nothing to pull), and the close then runs a plain `git push origin dev`. Had the squash worked, those 3 commits would have gone out with the design.
- **The dev lock does not help.** `.bkit/.dev.lock` only stops two bkit closes overlapping. It cannot see a human or agent who is simply editing on `dev`.

**2. Cloud runners (GitHub Actions, Cursor): two closes racing to push `dev` — the loser fails.** Each runner has its own clone, so nobody else is in its folder. But `.bkit/.dev.lock` is a file on one machine, so it cannot stop two runners closing at the same moment. bkit-cloud runs design / plan for different features in parallel (#397). Both runners pull, squash and push `dev`; the second push is rejected because `dev` moved, and `landLocal` has no retry: it stops with "dev push failed" (exit 8) and the run goes down the Failure Path. Not seen in the logs yet; nothing prevents it.

**3. claude.ai cloud: the PR merge is tried once.** `landPr` calls `mergePr` (`.bkit/core/engine/commands/workflow/prs.ts`) once. If GitHub refuses the merge — for example `dev` requires branches to be up to date and another feature's close just landed — the close stops with "PR did not reach MERGED" and the PR is left open. Also not seen yet.

### Change

**One landing routine for every runtime**, built in a throwaway worktree started from `origin/dev`. It never touches the main checkout, retries a lost race, and falls back to a PR only when a direct push is not allowed.

1. `git worktree add --detach .worktrees/_land-{FID} origin/dev` — beside the feature worktrees. The `_land-` prefix cannot collide with a FID (FIDs start with an issue number or branch suffix).
2. `git merge --squash -X ours {BRANCH}` there (`feat/{FID}`; in a claude.ai session, the session branch). Per-feature docs are new files, so they cannot clash; shared ledgers are `merge=union` in `.gitattributes`, so both sides' rows are kept.
3. Keep today's guards: staged paths match `CLOSE_DOCS` only; the canonical `{FID}-design.md` / `{FID}-plan.md` (and sub-plans) blob equals `{BRANCH}`'s.
4. Roadmap row + `docs({FID}): {phase} DONE bkit [skip ci]` commit in the throwaway worktree.
5. `git push origin HEAD:dev`, in every runtime:
   - **Lands** → step 7.
   - **Rejected because `dev` moved** (non-fast-forward) → fetch, rebuild from the new `origin/dev`, retry. At most 10 attempts, with exponential backoff and random jitter between them: wait 2s, then double each time, capped at 30s (about 3.5 min worst case). The jitter stops two racing closes from retrying in lockstep.
   - **Refused for any other reason** (claude.ai proxy, branch protection on `dev`) → step 6.
6. **PR fallback** (today's `landPr`, hardened): push `{BRANCH}`, open or reuse the PR, squash-merge it. When GitHub refuses the merge, call `updateBranch` (`gh pr update-branch`, a server-side merge of `dev` into the PR) when the PR is behind, then retry the merge with the same backoff and 10-attempt budget. Exhausted → non-zero exit, PR left open.
7. **Laptop only:** fast-forward local `dev` to the landed commit, but only when that is a pure fast-forward (local `dev` has no commits `origin/dev` lacks):
   - main checkout on another branch → move the `dev` pointer only (`git fetch . <sha>:dev`); no files change;
   - main checkout on `dev` → `git merge --ff-only <sha>`; git refuses on its own when that would overwrite a local edit, and the close then skips the fast-forward with a log line;
   - local `dev` has local-only commits → skip with a log line; never rebase or merge them.
     A skipped fast-forward never fails the close: the landing already happened.
8. Remove the throwaway worktree, the feature worktree and `feat/{FID}` (a claude.ai session branch is kept, as today).

The `close-transport` row records which shape landed: `local` (direct push) or `pr` (fallback), as today.

Ship's close already uses this shape — detached worktree off `origin/dev`, push `dev`, refused → PR (`.bkit/workflows.md` § Ship, Step 15) — reuse what it can.

Design / plan closes then no longer need the dev lock: the push retry handles races on one machine and across machines alike. Ship and build / debug keep it, because they still work on `dev` in the main checkout.

### Success Criteria

- A design / plan close on a laptop lands on `origin/dev` while the main checkout has uncommitted, staged or untracked files, on any branch; local `dev` commits not on `origin/dev` are never pushed.
- The main checkout's branch, index and existing working-tree edits are untouched by the close; the only change is a fast-forward of `dev` when one is possible.
- Two closes racing to push `dev` — on one laptop or on two runners — both land; the loser backs off and retries.
- A claude.ai close whose PR merge GitHub refuses (branch behind `dev`) updates the branch, retries, and merges within the budget.
- Every runtime lands through the same routine; the PR route runs only when a direct `dev` push is refused for a reason other than "`dev` moved".

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Laptop: main checkout on `dev` with staged non-doc files from another agent | Close lands; the staged files stay staged and out of the close commit |
| Laptop: local `dev` ahead of `origin/dev` | Close lands on `origin/dev`; local-only commits are not pushed; local `dev` not fast-forwarded (logged) |
| Laptop: main checkout on another branch | Close lands; checkout stays on that branch; local `dev` pointer fast-forwarded |
| Laptop: main checkout on `dev`, edits that do not touch the landed files | Close lands; `dev` fast-forwarded in place; edits kept |
| Laptop: main checkout on `dev`, an uncommitted edit to a file the close changed (e.g. a ledger) | Close lands; git refuses the fast-forward; skipped with a log line; close exits 0 |
| Two closes (same laptop or two runners) push `dev` at the same moment | Loser's push rejected as non-fast-forward → refetch, rebuild, back off, retry; lands within 10 attempts |
| 10 push attempts exhausted | Exit non-zero; `{BRANCH}` and its worktree kept; throwaway worktree removed; nothing on `dev` |
| claude.ai: direct push refused by the proxy | PR fallback; shape `pr` recorded |
| Branch protection on `dev` forbids direct pushes (any runtime) | PR fallback, not a retry loop |
| PR merge refused, PR behind `dev` | `updateBranch`, back off, retry merge |
| PR merge refused 10 times | Exit non-zero; PR left open for a human; branch kept |
| `gh` unavailable during the PR fallback | Exit 80 hands the stage to MCP, as today |
| `{BRANCH}` carries a non-doc file | Refused before commit (same as today); nothing pushed; branch kept |
| Squash drops the branch's canonical doc (`-X ours` conflict) | Refused by the blob check (same as today); nothing pushed; branch kept |
| Close killed mid-run | A leftover `.worktrees/_land-{FID}` is pruned on the next close of the same FID |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Close lands while the main checkout has staged / untracked files on `dev` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Local `dev` ahead of `origin/dev` → close lands, local commits not on remote, no fast-forward | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Main checkout branch, index and existing edits unchanged after close | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Fast-forward: pointer-only on another branch; in place on `dev`; skipped when git refuses | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Non-fast-forward rejection → refetch + retry lands; 10 attempts exhausted → non-zero, branch kept | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Push refused for another reason (remote pre-receive hook rejects `dev`) → PR fallback taken, no retry loop | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| PR fallback: merge refused → `updateBranch` + retry merges; 10 refusals → non-zero, PR open | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` |
| Backoff schedule: doubles from 2s, capped at 30s, jittered, 10 attempts max | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Close `branches land` line run verbatim: lands with another session's work in the main checkout | Integration | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` |

### Tasks

- [ ] **Task 1:** One landing routine builds the close commit in `.worktrees/_land-{FID}` off `origin/dev`; the main checkout is never checked out, pulled or merged into. **Done when:** the dirty-main-checkout and local-`dev`-ahead cases land. **Test first:** `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land lands while the main checkout is dirty` fails on exit 17.
- [ ] **Task 2:** Push `HEAD:dev`; non-fast-forward rejection → refetch, rebuild, retry with exponential backoff + jitter (2s doubling, 30s cap, 10 attempts max; constants beside the existing ones in `TIMEOUTS`); exhausted → non-zero exit, branch kept, throwaway worktree removed. **Done when:** the race, exhausted-budget and backoff-schedule cases pass. **Test first:** `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land retries a rejected dev push` fails on the push-failed exit.
- [ ] **Task 3:** Any other push refusal → PR fallback (`landPr`), in every runtime; `close-transport` records the shape that landed. **Done when:** a pre-receive-hook refusal takes the PR route without retrying. **Test first:** `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land falls back to a PR when dev refuses the push` fails on the push-failed exit.
- [ ] **Task 4:** PR fallback retries a refused merge: `updateBranch` when the PR is behind, then retry with the same backoff and budget; exhausted → non-zero exit, PR left open. **Done when:** the refused-then-merged and 10-refusals cases pass. **Test first:** `.bkit/core/engine/commands/workflow/prs.test.ts` `merge retries after update-branch` fails on a single merge attempt.
- [ ] **Task 5:** After a landed direct push on a laptop, fast-forward local `dev` when it is a pure fast-forward: pointer-only when the main checkout is on another branch, `git merge --ff-only` when it is on `dev`; skip with a log line when local `dev` has local-only commits or git refuses; a skip never fails the close. **Done when:** the three fast-forward cases pass. **Test first:** `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land fast-forwards local dev` fails on local `dev` behind `origin/dev`.
- [ ] **Task 6:** Drop the dev lock from the design / plan close. **Done when:** the landing routine takes no `.bkit/.dev.lock`. **Test first:** n/a — covered by Task 2's race test.
- [ ] **Task 7:** Update `close-squash.integration.test.ts` to the new shape. **Done when:** its scenarios assert the main checkout's own edits are untouched. **Test first:** `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` fails on the main checkout still being switched to `dev`.
- [ ] **Task 8:** Docs in the same change: `.bkit/workflows.md` § Close squash, § Dev lock (sites list), § Runtime capability table (design / plan close now _tries_ `dev` in every runtime; `RUNTIME_DEVPUSHES` still governs ship, build, debug), the "Local happy path is byte-identical" and "PR-mode design/plan closes MUST push before `bkit prs open`" invariants, design Step 12 and plan close rows, `close-transport` shape descriptions, and the timeouts table (backoff constants). Design / plan workflow Step 12 text in `.bkit/core/workflows/bkit-design.md` / `bkit-plan.md` if the land line or its routes change. **Done when:** no doc describes the close as a main-checkout `dev` squash or as runtime-fixed local-vs-PR. **Test first:** n/a — docs.

### Open Questions & Assumptions

- Decided: push retries — at most 10 attempts, exponential backoff with jitter (2s doubling, 30s cap). The PR-merge retry uses the same budget.
- Decided: the close fast-forwards local `dev` when that is a pure fast-forward, in either main-checkout state (Change step 7).
- Decided: the throwaway worktree lives in `.worktrees/` beside the feature worktrees, as `.worktrees/_land-{FID}`. Nothing in the engine scans `.worktrees/*`; every lookup is keyed by FID, and `.worktrees/` is already excluded from repo checks.
- Decided: design / plan closes try a direct `dev` push in every runtime and fall back to a PR on refusal. A refused push leaves nothing behind in the throwaway worktree, so the reason `RUNTIME_DEVPUSHES` is a fixed default rather than probed (a wrong guess stranding a session on a `dev` checkout, `.bkit/workflows.md` § Runtime capability table) does not apply here.
- Assumed: telling "`dev` moved" (retry) apart from "push not allowed" (fall back) by git's rejection output (`[rejected] … (fetch first)` / `non-fast-forward` vs anything else) is reliable through the claude.ai proxy. Verify against a real claude.ai session during build.
- Assumed: GitHub's server-side squash-merge applies `merge=union` to the ledgers, so parallel PR fallbacks cannot conflict on them (`.bkit/workflows.md` § Why event log + `merge=union` records this). Not verified independently.

### Breaking Changes & Naming

- `close-transport` shapes `local` and `pr` keep their names. `local` now means "throwaway-worktree squash + direct `dev` push" in any runtime; `pr` means "direct push refused, PR fallback".
- A claude.ai session whose environment allows `dev` pushes now lands directly instead of through a PR.
- No consumer migration: behaviour lives in the engine and the workflow close step.

### Out of Scope

- **GitHub Actions-level concurrency** (one ship at a time globally, same-FID arbitration across trigger types): #397.
- **Ship, build and debug closes.** They still work on `dev` in the main checkout under the dev lock. Moving them to the same routine is a candidate follow-up once this lands.
- **The mid-run `feat/{FID}` push** (`bkit branches push --mode=feature`, design / plan Summary step) stays in every runtime: each feature has its own branch, so these pushes cannot collide, and they are the backup if the machine or container dies mid-run.

### References

- `.bkit/core/engine/commands/workflow/branches.ts` § `landLocal`, `landPr`, `CLOSE_DOCS`
- `.bkit/core/engine/commands/workflow/prs.ts` § `mergePr`, `updateBranch`
- `.bkit/core/engine/commands/workflow/runtime.ts` § `capable`, `detect`
- `.bkit/friction.jsonl` key `branches-land-blocked-by-concurrent-dev-work`
- `.bkit/workflows.md` § Close squash, § Dev lock, § Runtime capability table, § Ship (Step 15 close worktree)
- `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`
- #397 — bkit-cloud concurrency: global ship lock, FID arbitration — https://github.com/cbartens/bkit/issues/397

## Work done

Implemented on `dev` and staged. Not committed or pushed yet.

### What a design/plan close does now (every runtime)

1. `bkit branches land` fetches `origin/dev` and makes a throwaway checkout of it at `.worktrees/_land-{FID}`. Your main checkout and the feature worktree are never touched.
2. It squashes the feature branch into that checkout. It stops with nothing pushed if the squash would bring anything other than the design/plan docs and their logs, or if `dev` already has a different version of the design/plan doc.
3. It adds the roadmap row, commits `docs({FID}): design DONE` (or `plan DONE`) and pushes straight to `dev`.
4. If the push is turned away because `dev` moved in the meantime (another close landed first), it throws the checkout away, fetches again, rebuilds and tries again. That's up to 10 pushes, with waits starting at 2s, doubling, capped at 30s and randomly shortened so two closes don't retry in lockstep. That adds up to about 3 minutes of waiting at most (the issue said 3.5). If all 10 are used: exit 8, nothing landed, branch kept.
5. If the push is refused for any other reason (a protected `dev`, a cloud proxy), it falls back to closing through a PR. If the merge is refused while the PR is still open, it brings the PR branch up to date with `dev` and retries on the same schedule. If the PR is closed or attempts run out: exit 17, PR left open.
6. On the laptop only: local `dev` moves forward to the landed commit when that's a plain fast-forward. If local `dev` has commits of its own, or git refuses because of an uncommitted edit, it's left alone with a log line and the close still succeeds.
7. Design/plan closes no longer take the dev lock, so parallel closes don't queue behind each other.
8. Gate 12 reads `status.jsonl` from `origin/dev` (`bkit steps gate --ref=origin/dev`), so it passes whether or not local `dev` moved.

### Nothing is deleted until it's on dev

The only things removed are the throwaway `_land-{FID}` checkout (a copy of `origin/dev`, holding nothing of yours) and, on runtimes that push to `dev` directly, the feature worktree and `feat/{FID}`. Those last two go only after all of these hold:

- the close landed and the audit passed (design/plan docs present on `origin/dev`);
- every file the branch changed is identical on `origin/dev`, and every `.jsonl` line the branch added is there too (`docs/roadmap.md` is the one exception, since the close rewrites it). Otherwise: exit 18, branch and worktree kept, and the missing files are listed;
- the feature worktree has no uncommitted or untracked files. Otherwise the close succeeds but the worktree and branch are kept, the files are listed, and the result says `worktree.reason: uncommitted`.

A failed fetch leaves `origin/dev` out of date, so the check above fails safe: exit 18, nothing deleted. Stops before landing delete nothing. Cloud runtimes delete nothing locally.

### Cloud agents

- GitHub Actions and Cursor cloud push to `dev` directly, so they get the same path as the laptop: retries, fast-forward and cleanup.
- Claude cloud tries the direct push first. Its git proxy refuses pushes to `dev`, and that refusal doesn't look like "dev moved", so it goes straight to the PR close, with the merge retry.
- This was tested with a simulated refusal (a test git server that rejects `dev` pushes), not in a real Claude cloud session.

### Where this differs from the issue text

- The PR-merge retry test lives in `branches.test.ts`, not `prs.test.ts`.
- The worst-case wait is about 3 minutes, not 3.5.
- `bkit steps gate` gained `--ref`, so Gate 12 can read from `origin/dev`.
- A failed fetch now exits 10.
- The `workflow-dev-lock` wording clause was removed from `.bkit/wording.md`, since design/plan no longer use the lock.

### Tests

- `branches.test.ts`, `bkit branches land`: 15 tests. They cover the direct close, staged files left staged, local `dev` with its own commits left alone, another branch checked out, `dev` moving during the push (retried, and exhausted), non-doc files refused, the PR fallback (cloud and laptop), the PR merge retry, a closed PR, uncommitted worktree work kept, and branch work missing from `dev` (18, nothing deleted). A schedule test covers the backoff.
- I switched the two new protections off temporarily: both new tests failed, so they do catch the problem.
- `close-squash.integration.test.ts` runs the full local close from the workflow.
- Typecheck, lint and format are clean.
- Full suite: 6098 passed. The 7 failures are all in `issues.test.ts`, which is being changed separately and is unrelated to this work.
- `slop:delta` fails on `disk.ts` / `bkit-disk-prune.mjs` from #640, not on this work.

## Claude cloud: what a refused `dev` push looks like

This issue assumed that a claude.ai cloud session can't push `dev`, and that the close tells that refusal apart from "`dev` moved" by git's output. I checked both against the official docs and git's own code. No live cloud session was used.

### The proxy doesn't block pushes to `dev`

The cloud environments page (https://code.claude.com/docs/en/cloud-environments, § GitHub proxy) says:

> **Push restrictions**: the proxy rejects branch deletions and pushes of anything other than a branch, such as a tag. It doesn't limit which branches a push can update. To do that, use branch protection rules or rulesets on GitHub.

So in a claude.ai session, `bkit branches land` normally lands with the same direct `dev` push a laptop uses. The PR route runs only if GitHub itself refuses the push, through branch protection or a ruleset on `dev`.

Older bug reports show the proxy did block branches at one point: anthropics/claude-code#61307 and #57356, both closed. Back then a refused push came back as:

```
error: RPC failed; HTTP 403 curl 22 The requested URL returned error: 403
send-pack: unexpected disconnect while reading sideband packet
fatal: the remote end hung up unexpectedly
```

### A refusal can't be mistaken for "`dev` moved"

The close retries only when git prints `[rejected] ... (fetch first)` or `(non-fast-forward)`.

- **Git prints those two itself, before sending anything.** It first reads where the remote's branches point, sees that the remote `dev` has commits the local copy lacks, and stops. They appear only when `dev` on GitHub really moved. Source: `set_ref_status_for_push` and `print_one_push_report` in git's `transport.c`.
- **A proxy refusal is an HTTP 403**, as in the output above. It never contains `[rejected]`.
- **A refusal from GitHub branch protection prints `[remote rejected] ... (reason)`.** That line doesn't match the retry pattern either, so it goes to the PR route as intended.

So the retry-or-fall-back split holds in a cloud session.

### Two things this changes

- **Wording.** The docs and decisions written for this issue gave "the cloud git proxy" as a reason a push gets refused. They now say "branch protection or a ruleset on `dev`".
- **The PR route has its own cloud gap. This is inferred from the docs, not tested.** The same docs page says the proxy answers `gh pr` and `gh issue` with a 403, because those commands use GitHub's GraphQL API. bkit treats only a missing `gh` or a `gh` login failure (exit 4) as "use the GitHub tools instead". A 403 is exit 1, so a cloud close that needed the PR route would stop with an error instead of switching. This path is reached only when `dev` is protected.

### Follow-up outside this issue

bkit still sets `RUNTIME_DEVPUSHES=false` for `CLOUD_CLAUDE`, on the stated reason that the proxy only lets a session push its current branch (`.bkit/core/engine/commands/workflow/runtime.ts:110`). Adopt mode rests on the same reason (`.bkit/workflows.md`, "Adopt mode does no `git worktree add`"). The docs no longer support that reason. Changing it affects ship, build and debug, so it needs its own decision.

## Follow-up: ship, build and debug still write to `dev` from the main checkout

This issue fixed how design and plan land on `dev`. The same problems still exist in three other places, which the issue left out of scope.

### What stays as it is

Code reaches `dev` only through ship's PR merge, after CI is green. Nothing here changes that.

bkit also writes **bookkeeping** commits straight to `dev`: roadmap rows, status logs, ledger rows, no code. That is on purpose. Ship's close and failure records describe the merge or its failure, so they can't ride inside the PR being merged.

### What's wrong with how they land

On a laptop, all three of these work inside the main checkout, the folder you and other agents are working in:

<!-- prettier-ignore -->
| Where | What it does |
| --- | --- |
| End of build / debug: roadmap update (`.bkit/core/engine/commands/workflow/roadmap.ts`, `mirror`) | checks out `dev`, pulls, commits the roadmap row, pushes `dev`, switches back |
| Ship Step 13 and Step 15 close (`branches.ts` `switchVerb`, `workflows.ts` `shipClose`) | checks out `dev`, pushes any local `[skip ci]` commits, installs dependencies; Step 15 commits `ship DONE` on `dev` and pushes |
| Ship Failure Path (`workflows.ts` `shipFlush`) | checks out `dev`, pulls, commits `ship FAILED`, pushes |

These have the same three problems this issue fixed for design and plan:

- **They can publish other people's unpushed commits.** If local `dev` is ahead of GitHub, the pull does nothing and the plain `git push origin dev` sends every local-only commit. The roadmap update does this without saying so. At the time of writing, local `dev` on the maintainer's laptop was 13 commits ahead, and a build finishing there would have pushed all of them along with its one roadmap line.
- **They switch the branch under whoever else is working in the main checkout,** and fail on that person's uncommitted edits. The dev lock only stops two bkit runs overlapping.
- **They don't retry when `dev` moved.** The roadmap update just skips. Ship's laptop close exits 8 after the PR has already merged, so a shipped feature reports failure. Ship's cloud close already uses a throwaway checkout, but it treats "`dev` moved" as a refusal and opens a `ship-close/{FID}` PR instead of retrying.

### Proposed follow-up

Build every bookkeeping commit in a throwaway checkout of `origin/dev` and land it with this issue's routine: retry when `dev` moved, PR when GitHub refuses for any other reason. The main checkout is never touched.

The roadmap update is a small change. Ship is bigger: on a laptop, ship keeps its lock, status rows and stats rows as uncommitted files in the main checkout until Step 15, so they need a new home. That decision, and what Step 13 keeps, are being settled before a design issue is filed.

### `RUNTIME_DEVPUSHES` for claude.ai stays `false`

Only one of its two stated reasons is wrong. "The proxy only lets a session push its current branch" (`.bkit/core/engine/commands/workflow/runtime.ts:110`, `.bkit/workflows.md` "Adopt mode does no `git worktree add`") is out of date. The other reason still holds: a push to `dev` can't be tested without actually making it, and a wrong guess strands a session on a `dev` checkout (`.bkit/workflows.md` § Runtime capability table). Once bookkeeping lands through the throwaway checkout, the flag no longer affects landing at all. The stale comment gets corrected in the follow-up.

## Follow-up done: ship, build and debug no longer touch `dev` in the main checkout

Built on `dev` and staged. Not committed or pushed yet.

### Decisions

These were settled in the session before building. Each one is recorded in `docs/decisions.jsonl` under the key shown.

1. **Ship keeps its records in the feature worktree, not the main checkout.** The status rows, stats rows and summaries live in `.worktrees/{FID}`. The lock file stays in the main checkout. Ship's `workflows start` now runs after the worktree is set up, so its first row goes straight into the worktree. (`ship-dev-writes-through-throwaway-origin-dev-checkout`)
2. **Step 13 only moves local `dev` forward, without switching to it.** The dependency install runs only when you are already on `dev` and it moved. (`ship-sync-dev-fast-forward-only-never-push-local-dev`)
3. **Local-only `dev` commits are never pushed.** Step 13 lists them and prints the command to publish them yourself.
4. **The ship FAILED record lands like the close does, with no lock.** If `dev` refuses it, the record stays in the worktree and the next ship of the feature carries it. (`ship-failed-record-refused-stays-in-book`)
5. **The build/debug roadmap update never blocks.** If `dev` refuses it, it logs why and skips it. No PR. (`roadmap-mirror-every-runtime-fail-open`)

### What each one does now

All three use the same landing routine as design/plan closes (`pushToDev`, now in `.bkit/core/engine/commands/land.ts`). It builds the commit in a throwaway checkout of a fresh `origin/dev` at `.worktrees/_land-{FID}` and pushes it to `dev`. If `dev` moved, it rebuilds and pushes again, up to 10 times. Your main checkout is never switched, staged or committed in.

<!-- prettier-ignore -->
| Where | Now |
| --- | --- |
| Build / debug roadmap update (`bkit roadmap mirror`) | Builds the roadmap row commit in the throwaway checkout. If `dev` refuses it: a log line, skipped. The row on the feature branch is already written. |
| Ship Step 13, renamed "Update Local Dev" (`bkit branches sync-dev`) | Fetches and moves local `dev` forward if that's a plain fast-forward, without switching to it. Local-only commits are listed and left alone. |
| Ship Step 14 "Close Workflow" (`bkit workflows close --flush`) | Writes the close rows in the worktree, lands `docs({FID}): ship DONE bkit [skip ci]` through the throwaway checkout, releases the lock, then removes the worktree and branch. If GitHub refuses the push, it publishes through a `ship-close/{FID}` PR, as before. |
| Ship Failure Path (`bkit workflows handover --flush`) | Lands `chore({FID}): ship FAILED bkit [skip ci]` through the throwaway checkout. If refused or out of retries, it exits 10 and keeps the record in the worktree. |

### Removed

- The dev lock (`.bkit/.dev.lock`). Its `.gitignore` line is removed by `bkit upgrade`.
- `bkit branches switch` (replaced by `bkit branches sync-dev`).
- The `--dev-pushes` and `--deadline` flags.
- Ship's separate worktree-cleanup step. The close now removes the worktree, and only after the close has landed. Ship has 14 steps instead of 15.

### Found while testing

Ship's close checks whether any generated mirror file (`.claude/agents/`, `.claude/commands/`, and so on) was hand-edited. It checks the last commit in the folder it runs in. That folder is now the feature worktree, so it would only have looked at the feature's last commit. It now starts from the commit before the squash (`--squash-sha`), so the whole feature is checked again.

### Verification

- Full `pnpm vitest run`: 6108 passed, 1 failed. The failure is a row in `docs/decisions.jsonl:630` with a whole-second timestamp. It came from another session's commit `e6aae9ed`, not from this work.
- The staged files alone (a copy of `HEAD` plus only this work) give the same result. tsc, oxlint and prettier are clean, and so is `bkit check`.
- Tried for real with a packed tarball installed in a clean scratch repo with a bare remote:
  - **Ship close:** a real close landed `docs(1-x): ship DONE bkit [skip ci]` on the remote `dev`, with the status rows, summary and stats rows. It removed the worktree and branch and left the main checkout untouched, and the Step 14 gate passed.
  - **Step 13:** `branches sync-dev` moved local `dev` forward without switching to it. It left a local-only `dev` commit unpushed and printed the command to publish it.
  - **Dev lock:** `locks acquire --kind=dev` is rejected.
  - **Upgrade:** with the old `.bkit/.dev.lock` line put back in `.gitignore`, `bkit upgrade` removed it.

### Not done / open

- **Cloud sessions:** if `dev` refuses a ship FAILED record, it stays in the worktree. A claude.ai container is thrown away later, so there the record is lost.
- **`RUNTIME_DEVPUSHES` comment:** the earlier comment said its out-of-date wording (`.bkit/core/engine/commands/workflow/runtime.ts:110`) would be corrected here. It wasn't, and it is still out of date. Design/plan closes still read the flag through `devPushesOf`.
- **Consumer note:** a short note in `docs/migrations.md` about the removed flags and verb is suggested, not written.
- **Push blocked:** `pnpm slop:delta` currently fails on three findings from #640 (`disk.ts:385`, `disk.ts:150`, `bkit-disk-prune.mjs:37`), so a normal push is blocked until those are fixed.

### In progress: one way to keep every Failure Path's record

Today each workflow keeps its failure record differently:

- **Design and plan** never commit it. It lives only in the local worktree.
- **Build and debug** commit and push it on the feature branch, but only when a handover is written.
- **Ship** always lands it on `dev`.

There is also a real bug. When a session is on `dev`, debug works directly on `dev`. If debug then fails, the handover runs `git add -A`, so the half-finished fix ends up in an "aborted" commit pushed to `dev`.

Agreed fix: design, plan, build and debug always commit their failure record and push it on their own feature branch, never `dev`. When there is no feature branch to use (debug running on `dev` or `main`), only the logs and ledger rows land on `dev` through the throwaway checkout, never code. Ship stays as above. An open PR on the feature branch still stops the push, as today. A further comment follows when this is built.

## Follow-up done: every Failure Path keeps its record, and none pushes code to `dev`

Built on `dev` and staged with the earlier work. Not committed or pushed yet.

### What changed

Design, plan, build and debug now keep a failed run's record the same way. It's step 3 of the Failure Path for design and plan, and step 5 for build and debug. Each one runs:

```
bkit workflows handover --workflow={wf} --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
```

What that command does depends on the branch the run's checkout is on:

<!-- prettier-ignore -->
| Checkout is on | What happens |
| --- | --- |
| A feature branch | Everything in the run's checkout is committed as `docs({FID}): {workflow} aborted bkit [skip ci]` and pushed to that branch, whether or not a handover was written. If the branch has an open PR, nothing is pushed (exit 9) and the record stays committed locally, as before. |
| `dev`, `main` or no branch (debug can work directly on `dev`) | Nothing is committed in the checkout. Only the logs and ledger rows are copied into a throwaway `origin/dev` checkout and land as one `chore({FID}): {workflow} FAILED bkit [skip ci]` commit, the same way ship's Failure Path does. A half-finished fix stays as an uncommitted change in your checkout and never reaches `dev`. |

Ship is unchanged and still uses `--flush`.

Before this change, design and plan never committed their failure record at all. Build and debug only committed it when a handover was written. And debug failing on `dev` committed and pushed its half-finished fix to `dev`.

The decision is recorded in `docs/decisions.jsonl` under `failure-path-record-own-branch-dev-fallback`.

### A bug found while testing it for real, and fixed

After the record landed from a `dev` checkout, the checkout still had its own uncommitted copies of the same logs and ledger rows. The next fast-forward of local `dev` (ship's Step 13, `bkit branches sync-dev`) then stopped, because git won't overwrite untracked files even when their content is identical.

The command now hands those copies back once the record has landed. An untracked copy is deleted, and a changed tracked ledger is reset to the last commit. This only happens when every line of the file is already in what landed on `dev`, and nothing of it is staged, so nothing can be lost. Any other file is left alone and named in the log.

### Checked against the workflow authoring rules

All the workflow text I changed was checked against the rules in `.bkit/workflows.md` § Workflow Authoring Rules. Fixes made:

- **The new Failure Path step** no longer describes in prose what the command decides. It now uses the existing step shape: `git status --short` → remove unintended files, then commit and push the run's record — NEVER onto a branch with an open PR; **Skip if** `{WORKTREE_PATH}` is not set.
- **`bkit-ship.md`:** removed the explanations and reasons added in the earlier change: Step 1 item 8, Step 13, Gate 13, the Step 14 close step, the header "Status branch" and "Worktrees" bullets, and Failure Path step 5. The Gate 14 condition for an open close PR now just says which flags to change. Its value is written plainly (`close-pr-open`, no backticks), as the rules require for fixed values.
- The repeated sentences are registered in `.bkit/wording.md` as `workflow-keep-record`, `workflow-keep-record-open-pr` and `workflow-keep-record-comment`.

### Verification

- Full `pnpm vitest run`, both on the working tree and on the staged files alone (a copy of `HEAD` plus only this work): 6115 passed, 1 failed. The failure is the same `docs/decisions.jsonl:630` row as before, from another session's commit `e6aae9ed`.
- tsc and prettier are clean.
- New tests in `.bkit/core/engine/commands/workflow/workflows.test.ts`:
  - the feature-branch commit and push;
  - from `dev`, only logs and ledgers landing while the checkout's code is untouched;
  - the hand-back, followed by a fast-forward of local `dev` that succeeds;
  - a staged ledger being kept and named;
  - a refusal giving exit 10 with the record kept;
  - the named worktree being the one committed in.
- Tried for real with a packed tarball in a clean scratch repo with a bare remote:
  - **Debug failing on `dev` with a half-finished `src.ts`:** `dev` got only `chore(1-x): debug FAILED bkit [skip ci]` with the handover, status and ledger row. `src.ts` stayed an uncommitted local change. The landed files were handed back, and `bkit branches sync-dev` then fast-forwarded local `dev` onto the record.
  - **Design failing on a feature branch:** `docs(2-y): design aborted bkit [skip ci]` was pushed to `feat/2-y` only. Neither `dev` nor the main checkout changed.

### Still open

- Everything listed as open in the previous comment still is: the cloud-session caveat, the out-of-date `RUNTIME_DEVPUSHES` comment, the suggested `docs/migrations.md` note, and the #640 `slop:delta` findings that block a normal push.
