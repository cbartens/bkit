Verdict: CONCERNS
Failures: 3
Fingerprint: 35f02a924d9f7d63c8c619cc19f7e324b5f9c65a41d76e5c73dbd7223242ab80
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Diff: `tmp/bkit-diff-1008-plan-design-owner.md`, read in full (1426 lines; its first line carries no `partial diff coverage` marker). Plan: `docs/plans/202611/1008-plan-design-owner-plan.md`.
- Code read in the worktree at `0c6332e4f`: `progressBinding`, `sessionPublication`, `runActionKey` / `commentKey`, `commentRunProof`, `postForVerb`, `postCommentOnce` (dedupe, seal, aggregation), `progressSection` and `commentDiagnostic` in `tracker.ts`; the `start` verb, `failVerb`, `sessionRemoval` and `previousRunWarning` in `workflows.ts`; the `comment` verb in `issues.ts`; `newSessionDir` and pruning in `repo.ts`; `fold`, `runNumber`, `actionKey`, `alreadyDone` and `recordAction` in `ledgers/status.ts`; `readRunsLenient` in `locks.ts`; `status invocation` in `status.ts`; plan Step 8 and design Step 12 in the workflow sources; the new and touched tests and their helpers.
- Docs loaded (`.agents/docs.md`, Build column): `.bkit/workflows.md` § Tracker reporting, § status.jsonl and § Comment Lifecycle; `docs/architecture.md` § Tracker reporting boundary; `docs/security.md` § Workflow comment ownership; `docs/observability.md` § Tracker reporting diagnostics; `docs/data-schema.md` § Checkout records and § Private outbox records; `docs/knowledge.jsonl` rows `workflow-push-retry-keeps-close-effects-and-original-return-once` and `tracker-post-unit-tests-clear-ambient-linear-credential`. No listed doc was missing, empty or a starter.
- Not run: no build and no tests (mandate). Each proposed test was checked for red by reading the code the diff leaves, not by running it.

## Notes

- Probed with no finding: every `sessionPublication` caller (`postForVerb`, `workflows start`) catches its new throws; `ctx.publication` is never set elsewhere; `fold` and `readRunsLenient` carry `progress` to `progressBinding` (`WorkflowRun` has an index signature, and the only `workflow-started` writer is `workflows start`); the path-free fallback link takes the FID from the status file's folder name and is the same from every checkout; `runActionKey`'s latest-run rule changes behaviour only for routine `--file` posts after close: ship Step 1 starts its run before its `--file` post, and the build's Create PR post and `failVerb` already used the latest-run rule; `issues comment` resolves `--file` against the cwd; session pruning and `sessionRemoval` remove folders recursively, and nothing lists a session folder's files, so the new `progress-id` file breaks neither; `dist/` matches the sources; and the new tests fail on the pre-change code and do not pass vacuously (the GitHub stand-in records `calls`).
- Cross-references (step 8): task 1 conflicts with `.bkit/workflows.md` § Comment Lifecycle **Posted once** ("An edited body posts again"): round 3 differs from round 2 yet is deduped. Task 2 conflicts with the plan's Edge Cases row for a local `dev` that did not fast-forward, and with `docs/architecture.md` § Tracker reporting boundary, which makes the checkout records authoritative, so a stale record is trusted. Task 3 concerns the workflow's nonfatal **Comments** rule: a stop route that does not end the round lets a post and its status row through. `docs/security.md` § Workflow comment ownership raises no conflict for this lens.
- Out of this diff, proposed separately and not a task: `status invocation` prints `run` with the next-run rule (`.bkit/core/engine/commands/workflow/status.ts:772`), so in an Owner Answers round after close its invocation row, and the `by` of any decision row appended with it, names run N+1, while this diff keys the same round's comment to run N.
- Tooling: Serena indexes the main checkout rather than this worktree, so code was read from the worktree with `sed` and `grep`.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** An owner who answers Q1 with A, then B, then A again never sees the third round on the tracker: its body hashes the same as round 1 under the shared key `plan/{run}/step/8/-/-/comment`, so the post prints `deduped: true` and the issue's last word stays B
  **Severity:** LOW · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/tracker.ts:1703` · **Round:** 1
  - **DONE WHEN:** A later Owner Answers round whose body equals an earlier round's body (not the latest round's) posts and writes its own `engine-action` row, while a retry of the latest round with the same body still prints `deduped: true`. No agent can settle it alone: `alreadyDone` (`.bkit/core/engine/ledgers/status.ts:687`) matches any earlier row with the same key and hash, and the progress section id is `actionHash(key, hash)` (`tracker.ts:1550`), so both dedupe layers treat a flip-back as a retry. The owner must choose between giving each round its own key (for example the round's `INVOCATION` id passed as `--sub-step` on `.bkit/core/workflows/bkit-plan.md:560` and `.bkit/core/workflows/bkit-design.md:645`, which changes the plan's "both rounds share the key" edge case and the word totals) or deduping comments only against the latest row for a key (a change to a primitive shared with `prs.ts:510` and `branches.ts:1132`, plus the section id).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `posts a third Owner Answers round whose answers repeat the first round` fails on the third `answers()` call (bodies "Q1: A", "Q1: B", "Q1: A" after `closePlan(cwd, dir, true)`) printing `tracker.deduped: true` and `answerActions()` holding 2 rows instead of 3
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** On a second plan run of the same FID whose `branches land` could not fast-forward local `dev`, the Owner Answers post passes the `test -f` guard on run 1's landed `status.jsonl`, is keyed `plan/1/step/8/-/-/comment` and binds to run 1's progress link, so dev's log records run 2's answers against run 1
  **Severity:** LOW · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-plan.md:532` · **Round:** 1
  - **DONE WHEN:** An Owner Answers round in plan Step 8 and design Step 12 records and posts nothing when the main checkout's `status.jsonl` does not hold run `{RUN}` of the workflow, not only when the file is absent. No agent can settle it alone: the guard gap (`bkit-plan.md:532`, `bkit-design.md:626`) predates this diff and also lets the round's `status invocation`, decision rows and plan update run on the stale checkout, so fixing it widens this issue's scope; `status invocation` prints `run` with next-run semantics (`runNumber`, `.bkit/core/engine/ledgers/status.ts:616`), so it would print 2 on that stale file and cannot serve as the check unchanged. The owner must decide whether this issue hardens the guard (and with which engine check) or a separate issue does, and whether the plan's Edge Cases row "Local dev does not hold the run's status.jsonl -> test -f stops the round" is narrowed meanwhile.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `plan and design Owner Answers rounds check that local dev holds the answered run` fails on plan Step 8 and design Step 12 sub-step 8 guarding the round only with `test -f docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, which passes when local dev holds only an earlier run of the workflow
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** After plan-check fails twice in plan Step 8, the stop route only says "commit nothing from this round", so an agent that reads on to the now-earlier comment bullet posts the answers for a plan that failed its check and leaves the post's `engine-action` row uncommitted in dev's `status.jsonl`
  **Severity:** LOW · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-plan.md:554` · **Round:** 1
  - **DONE WHEN:** Both plan-check stop routes in plan Step 8 sub-step 8 (`bkit-plan.md:554` and `:556`) end the whole round, so no Owner Answers comment and no `engine-action` row follow a stop, and a test pins it. No agent can settle it alone: the wording is a shared clause (`.bkit/instructions.md:10743` and `:10745`) pinned by `workflow-shape.test.ts:1579`, and the plan chose to keep it ("they end the round before the comment bullet"). Before this diff the comment came after the commit and, after close, wrote no status row; now it writes one before the commit. The owner must decide whether the stop routes say "record nothing from this round", as the `test -f` guard at `:532` does, and approve the clause edit with its `instructions:sync`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `plan Step 8 plan-check stop routes end the round before the Owner Answers comment` fails on both stop routes saying only "commit nothing from this round", which forbids the commit but not the comment bullet placed between the route and the commit
<!-- bkit:task 3 end -->
