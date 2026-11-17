# Design Brainstorm & Ideas

Lens: Optimal trade-off — best long-term shape, legacy constraints set aside.

## Approach A — One landing routine with a swappable destination, plus one shared publish resolver ⭐ Recommended

Split `pushToDev` (`.bkit/core/engine/commands/land.ts:222`) into the parts that never change (scratch `.worktrees/_land-{FID}` checkout, hooks off, build callback, check, retry) and two small parts that differ per destination: where the checkout starts and how it finishes. "Remote" destination: base `origin/dev`, finish with `git push HEAD:dev`, deepest push gate (today). "Local" destination: base local `dev`, take a lock, run affected tests plus static checks on the combined result, then move the local `dev` ref forward by compare-and-swap (`git update-ref dev <new> <old>`, fast-forward only), and refresh the main checkout's files only when `dev` is checked out and clean. The local finish squashes the run into one commit before the check. A single resolver (setting `bkit.workflows.{workflow}.publish.local` in `package.json`, then the `publish=` token, then forced `true` on cloud and Actions runs) is used by design, plan, build, debug and ship, so the precedence rules live in one place. Every workflow's start step reads one "start base" function: local mode means local `dev` always, with one ahead/behind warning when split.
- Complexity: MEDIUM.
- Extensibility: a third destination (for example a per-feature PR) is one more finish function. New workflows get local mode by calling the resolver.
- Risk: the refusal and retry branches in `pushToDev` (`refused`, `moved`, `raced`) are shaped around a remote. A careless split could leave a dead branch or a local path that skips the "checkout changed" guards. The compare-and-swap ref move must be the only write, or an interrupted run can leave `dev` half moved.
- Maintenance: low. One landing routine to test, one resolver, one start-base function. Tests need a two-clone fixture (ahead-only and split cases).
- Friction vs ideal: touches `land.ts`, the close steps of design, plan, ship and debug, the Step 2 exit-7 refusal, build and ship's "push dev first" narration, `.bkit/workflows.md` § Common Workflow Anatomy, the pre-push hook (`[skip ci]` tail refusal) and `bkit-cloud.yml` (needs the owner's sign-off, `.agents/rules.md` § CI edits). Nothing that works today breaks, because the remote destination is the default. This is the closest to the ideal shape.

## Approach B — Prompt-level local close in each workflow, engine untouched

Each workflow's close step gets a local branch written in its prompt: run a few git commands (`merge --squash`, commit, fast-forward `dev`) directly in the worktree and main checkout, with no engine change to `land.ts`.
- Complexity: LOW at first, HIGH over time.
- Extensibility: poor. Five workflows each carry their own copy of the sequence, and a rule change means editing all five prompts.
- Risk: it adds a second landing routine, which the issue forbids. The lock (Q7), the fast-forward-only guarantee and the "uncommitted edits block the move" check are hard to get right in prose, and the failure shows as local `dev` silently diverging.
- Maintenance: high. Prompt wording drifts, and `.bkit/instructions.md` clauses and 40-odd mirrors must be kept in sync.
- Friction vs ideal: little code churn now, but it violates a stated constraint and puts the riskiest operation (moving the owner's `dev`) where it is least testable. Not recommended.

## Approach C — Hold local work on a private queue ref and publish on demand

Local runs land on a private ref such as `refs/bkit/queue` (or a local-only integration branch) instead of `dev`. Starting a workflow bases on the queue; a final step merges the queue into `dev` at push time.
- Complexity: HIGH.
- Extensibility: good in theory (reordering, dropping a held feature before the push).
- Risk: it adds a second source of truth. The owner asked for work to sit on local `dev` and to push it by hand; with a queue, `git push origin dev` pushes nothing until some extra step runs, which is a bkit batch-push command in all but name (#715 turned that down, and this issue does not reopen it).
- Maintenance: high. Queue and `dev` can disagree, and the owner's own manual commits on `dev` need merging with it.
- Friction vs ideal: breaks the owner's "one `git push origin dev`" habit, which is the whole point. Rejected.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Reuse `pushToDev` with a destination strategy (remote or local), not a new routine | Prompt-level git in each close step (B); private queue ref (C) | The issue forbids a second landing routine. Locking, fast-forward-only and the checkout-changed guards belong in tested engine code. |
| Local finish is a compare-and-swap fast-forward of the `dev` ref, with a lock; the main checkout is touched only if `dev` is checked out and clean | `git merge` in the main checkout; reset or rebase | Matches the settled Q6, Q7 and the "never reset, rebase or force" constraint. A ref move works when the owner is on another branch. |
| One shared publish resolver (setting, then token, then cloud forces publish) for all five workflows | Per-workflow parsing in each prompt | Precedence stays identical across workflows, and build keeps its current behaviour as one caller. |
| One shared "start base" function; local mode always bases on local `dev`, warns once on a split | Keep design and plan on `origin/dev`; refuse on split | Settled by the scope-addition comment. It is the only way a feature B run can see feature A's local code. |
| Squash the run into one commit before the affected-test and static check, so the check runs on exactly what lands | Replay per-step commits; check before squashing | Settled Q1. Checking the squashed result on top of current local `dev` is what catches interaction with earlier local features. |
| Keep `[skip ci]` on local commits; the pre-push hook refuses a code push whose last commit has it | Strip the marker on local ship | Settled in the owner's answer 6. |
| Split into plan issues along the seams: (1) publish resolver and start base, (2) local destination in `land.ts`, (3) design/plan/debug/ship close wiring, (4) pre-push hook and `bkit-cloud.yml` range mapping (needs CI sign-off) | One large plan | The owner's comment says the work no longer fits size `L`. |
