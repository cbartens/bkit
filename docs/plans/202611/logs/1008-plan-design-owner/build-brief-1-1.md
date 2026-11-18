# Brief: group 1 — The run link in `status.jsonl`

Plan: Owner Answers Comment Keeps Its Run Link Implementation Plan

## Why and what

### Context & Goals

**Workstreams:** none named; the plan covers issue #1008 (findings D1 and N4 of #964), with no parent design.

**Problem.** At the end of `/bkit-plan` and `/bkit-design`, `workflows close --session-dir` deletes the run's session folder (`sessionRemoval`, `.bkit/core/engine/commands/workflow/workflows.ts:1822-1836`). The Owner Answers step comes later and posts with `--session-dir` (`.bkit/core/workflows/bkit-plan.md:561`, `.bkit/core/workflows/bkit-design.md:646`). `sessionPublication` (`.bkit/core/engine/commands/workflow/tracker.ts:2037-2049`) works the link out as a hash of the folder's real path, so it throws once the folder is gone. `postForVerb` (`tracker.ts:2132-2192`) catches the error, prints `[bkit-tracker] invocation association unavailable; progress may start fresh`, writes the `tracker-comment/comment-association` friction row (16 recurrences, all plan runs) and falls back to comparing the latest `RECENT_COMMENTS` = 5 comments.

Two more faults sit on the same path, found while reading the code:

- The cache that ties a status file's run to its session (`runPublicationFile`, `bindRunPublication`, `tracker.ts:2051-2085`) is keyed by a hash of the status file's absolute path. `branches land` moves the status file from the worktree to the main checkout, so a post naming the main checkout's copy misses the cache.
- `issues comment --file` keys a routine post with `runActionKey`, which names the next run once the current run has ended (`runNumber`, `.bkit/core/engine/ledgers/status.ts:610-613`). A post after close then points at a run that does not exist, and loses its link even with the right status file.

**Goal.** A run's link lives in the run's `status.jsonl`, the engine's durable run state (decisions `58-followup-routing-state-reread-from-status-jsonl`, `467-ledger-rows-only-through-bkit-commands`). It is built from a random id that `repo info` writes into the session folder, never from a path. `workflows start` writes it on the run's `workflow-started` row, and every post that names the run's status file reads it there, after close and from any checkout. The two Owner Answers posts name the run's status file instead of the deleted session folder. Run proof is unchanged: the same three proofs, and a post with none is still refused.

**Removes:**

- The path-hash derivation of the run link: the session link stops hashing the session folder's real path (`sessionPublication`), `runPublicationFile` and `bindRunPublication` go with the `bkit-outbox/invocations/` cache they keep, and the `progressBinding` fallback stops hashing the status file's absolute path.
- `endedRunActionKey`: `runActionKey` names the latest run, active or ended, for all three callers.
- For the Owner Answers posts: the session-folder lookup and the latest-5-comments comparison. The post carries an engine-action key from the run's status file, so `RECENT_COMMENTS` is not consulted. `RECENT_COMMENTS` stays for the posts that name no run file (`workflows links`, `close` and `handover`).
- Word totals: `.bkit/core/workflows/*.md` stays at 58536 words (`LC_ALL=C cat .bkit/core/workflows/*.md | wc -w`), because each Owner Answers line swaps the one-word `--session-dir="{SESSION_DIR}"` for the one-word `--file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"`, the comment bullet moves above the commit bullet, and the plan's exit 0 route swaps `the commit below.` for `the next bullet.`, three words for three. `.bkit/core/prompts/*.md` stays at 86494 words; no prompt changes.

**How this fits #1005.** #1005 item 4 replaces the guards of plan Step 8 and design Step 12 with one answers command that applies, checks and lands the owner's answers. This plan changes one flag and the order of two bullets on those steps, and puts the run link in the engine. Neither change blocks the other:

- **1008 lands first:** the answers command posts its comment through `postForVerb` with the run's status file, and gets the link this plan records. It deletes the two lines this plan edits.
- **1005 lands first:** this plan's workflow edit becomes the answers command's post call, and this plan's engine tasks are unchanged. The rebase conflict is the one comment line in each file. The answers command must then post with the run's status file, and post before it commits, so its `engine-action` row lands in the round's commit.
- **Either order:** this plan's new `workflow-shape.test.ts` check pins the `issues comment` Owner Answers lines, so #1005 takes that test over or deletes it when its answers command replaces them.

**Related Issues:**

- #964 — Review: tech debt findings and consolidation work (open)
- #1005 — Workflows: close and pull-request steps print their route (open)

---

### Narrative

An owner answers a plan's or design's open questions after the run closed, and the answers comment lands with the run's other reports, with no friction row and no warning line.

> Assumed from Q1 A until the owner answers Q1: the issue has no Narrative, so this sentence is Q1's proposal, not text from the issue.

### Success Criteria

- After `workflows close --session-dir`, a post with `--session-dir` (plan Step 8, design Step 12) joins the same progress comment as the run's earlier reports. An integration test closes a run, then posts, and checks this.
- That sequence writes no `tracker-comment/comment-association` friction row and prints no "invocation association unavailable" line.
- The run's link is kept somewhere that outlives the session folder, for example the run's `status.jsonl`, and is not worked out from the folder's path.
- A post with no proof of a run at all is still refused, and a test keeps proving it.

> The criteria are the issue's words. Under Q2 A, the first criterion's "a post with `--session-dir`" is read as the plan Step 8 and design Step 12 Owner Answers post, which names the run's status file with `--file`.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Removing the leftover `bkit-outbox/invocations/*.json` files on clones that ran an older engine | No criterion, scenario or test row needs them gone: after this change nothing reads or writes them, they sit outside committed content and hold only a hash. | A later outbox cleanup, for example next to the session-folder pruning in `repo info` (deferral `1008-leftover-outbox-invocation-cache-files`). |

## Where it fits

- Group 1: The run link in `status.jsonl` — this group
  - TASK 1: The status fold carries the start row's `progress` link onto its run — open
  - TASK 2: A session's link comes from a random id in its folder, never from its path — open
  - TASK 3: `workflows start` records the run's link on its start row, and posts that name the status file read it there — open
  - TASK 4: A post after its run ended keeps that run's key and link — open
- Group 2: The Owner Answers steps and the docs — next
  - TASK 5: Plan Step 8 and design Step 12 post the Owner Answers comment with the run's status file, before the round's commit — open
  - TASK 6: The docs say where the session id and the run link live — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** The status fold carries the start row's `progress` link onto its run
  - **UPDATE:** `StatusEvent` in `.bkit/core/engine/ledgers/status.ts`: the `workflow-started` member gains `progress?: string`
  - **UPDATE:** `fold` in `.bkit/core/engine/ledgers/status.ts`: copies a string `progress` from the start row onto the run it pushes
  - **READ:** `.bkit/core/.bkit/workflows.md`: the status row table and the **Fold** rules (Task 6 updates them)
  - **READ:** `docs/testing.md`: § Which tier does a behaviour need?
  - **DONE WHEN:** `fold` returns `progress` on a run whose start row carries it and leaves the key out otherwise, and `pnpm bkit:test:file .bkit/core/engine/ledgers/status.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/status.test.ts` `carries the workflow-started progress link onto its run` fails on the folded run having no `progress`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A session's link comes from a random id in its folder, never from its path
  - **UPDATE:** `newSessionDir` in `.bkit/core/engine/commands/workflow/repo.ts`: writes a random hex `progress-id` file (mode `0600`) into the folder it creates
  - **UPDATE:** `.bkit/core/engine/commands/workflow/repo.ts`: the `sessionDir` field description (`:164`) says the new folder holds its `progress-id` file instead of being empty
  - **UPDATE:** `sessionPublication` in `.bkit/core/engine/commands/workflow/tracker.ts`: keeps the folder check, and builds `invocation` as `actionHash` of the `progress-id` content and the workflow; a missing or empty `progress-id` throws
  - **READ:** `commentRunProof` in `.bkit/core/engine/commands/workflow/tracker.ts`: the session proof stays the folder's location, unchanged
  - **READ:** `docs/security.md`: § Workflow comment ownership
  - **DONE WHEN:** a session folder from `repo info` holds a non-empty `progress-id`; two folders holding the same id give the same `invocation`; a folder with no or an empty `progress-id` makes `sessionPublication` throw; Task 2's three `TEST FIRST` tests pass; the existing tests `records preparation and session association failures despite successful delivery` and `accepts a session minted in the main checkout from a linked worktree` in `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` pass; every existing `tracker.test.ts` test this change breaks is fixed in this task and passes; `pnpm bkit:test:file` passes on `repo.test.ts` and `issues.test.ts`. No whole-file pass of `tracker.test.ts` or `tracker.integration.test.ts` is required here, because those files hold Task 3 and Task 4 tests that stay red until their code lands.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/repo.test.ts` `writes a random progress id into each new session folder` fails on the new folder holding no `progress-id` file
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `gives two session folders holding the same progress id the same link` fails on the two links differing, because the folder path is hashed
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `throws for a session folder whose progress id is missing or empty` fails on a link being returned, because the folder path is hashed instead

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `workflows start` records the run's link on its start row, and posts that name the status file read it there
  - **UPDATE:** `workflowsCommand` in `.bkit/core/engine/commands/workflow/workflows.ts`: the `start` verb adds `progress` from `sessionPublication` to a new run's `workflow-started` row; a `sessionPublication` error goes through `commentDiagnostic` with `[bkit-tracker] invocation association unavailable; progress may start fresh` and the row is written without `progress`; a resumed run writes nothing; the `bindRunPublication` call and import go
  - **UPDATE:** `progressBinding` in `.bkit/core/engine/commands/workflow/tracker.ts`: reads the folded run's `progress`; with none, the invocation is `actionHash` of FID, workflow, run number and `startedAt`
  - **DELETE:** `bindRunPublication` in `.bkit/core/engine/commands/workflow/tracker.ts`: superseded by the start row's `progress`
  - **DELETE:** `runPublicationFile` in `.bkit/core/engine/commands/workflow/tracker.ts`: the path-keyed `bkit-outbox/invocations/` cache goes with it
  - **READ:** `activeRunStart` in `.bkit/core/engine/commands/workflow/counters.ts`: the frozen start-row field precedent (`limits`)
  - **READ:** `docs/architecture.md`: the tracker delivery paragraph and § Deterministic bookkeeping
  - **READ:** `docs/knowledge.jsonl`: row `workflow-push-retry-keeps-close-effects-and-original-return-once` (the terminal post seals the run's progress cache only while the start row's `progress` equals the session link the earlier posts used)
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** `grep -rn '"invocations"' .bkit/core/engine` finds nothing; a new run's start row carries `progress` when `--session-dir` is given, and the start-row test compares it against `sessionPublication(...)?.invocation` for the same folder, never a hand-computed hash; the moved-status-file test keeps the run `IN_PROGRESS` while the file moves (it copies the status file to the main checkout with no `workflows close` and no `branches land`); Task 3's five `TEST FIRST` tests pass; the existing tests `associates startup and run across restart or starts fresh safely`, `keeps clean build progress and completion to two comments`, `starts fresh progress after cleanup and on a fresh clone` and `keeps published build completion and PR links in one terminal comment` in `tracker.integration.test.ts` pass; every existing `tracker.test.ts` test this change breaks is fixed in this task and passes; `pnpm bkit:test:file` passes on `workflows.test.ts`. No whole-file pass of `tracker.test.ts` or `tracker.integration.test.ts` is required here, because those files hold Task 4 tests that stay red until Task 4's code lands.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `start with --session-dir writes the session's link as progress on the workflow-started row` fails on the start row having no `progress`
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `a resumed start with another session keeps the run's first link` fails on the run's `progress` being absent after the second start
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `start with a session folder that holds no progress id writes the row without progress and records association friction` fails on no `tracker-comment/comment-association` friction row and no "invocation association unavailable" line
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout` fails on the report from the main checkout opening a second comment
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps one progress comment across checkouts for a run started with no session` fails on each checkout's report opening its own comment

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A post after its run ended keeps that run's key and link
  - **UPDATE:** `runActionKey` in `.bkit/core/engine/commands/workflow/tracker.ts`: names the latest run of the workflow, active or ended
  - **UPDATE:** `commentKey` in `.bkit/core/engine/commands/workflow/tracker.ts`: drops its `numberOf` parameter
  - **UPDATE:** `commentRunProof` in `.bkit/core/engine/commands/workflow/tracker.ts`: the status proof calls `runActionKey`
  - **DELETE:** `endedRunActionKey` in `.bkit/core/engine/commands/workflow/tracker.ts`: superseded by `runActionKey`
  - **UPDATE:** `issuesCommand` in `.bkit/core/engine/commands/workflow/issues.ts`: the `comment` verb keys every purpose with `runActionKey`; the `endedRunActionKey` import goes
  - **UPDATE:** `failVerb` in `.bkit/core/engine/commands/workflow/workflows.ts`: the failure comment's key uses `runActionKey`
  - **READ:** `postForVerb` in `.bkit/core/engine/commands/workflow/tracker.ts`: a keyed post skips the session lookup and the `RECENT_COMMENTS` comparison
  - **READ:** `docs/observability.md`: § Tracker reporting diagnostics
  - **READ:** `docs/knowledge.jsonl`: row `workflow-push-retry-keeps-close-effects-and-original-return-once` (`endedRunActionKey` is the terminal post's binding to the ended run today; `runActionKey` takes it over)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `grep -rn 'endedRunActionKey' .bkit/core/engine` finds nothing; the two-rounds test asserts two `engine-action` rows with the same key and different hashes, and that a same-body re-run of a round prints `deduped: true` and posts nothing; the existing tests `an ad-hoc comment with no run proof exits 2 and reaches no tracker` and `keeps published build completion and PR links in one terminal comment` pass; the new regression guard `a --file post whose status file holds no run of the workflow exits 2`, written in this task's tests step and green before and after the code (the existing unit test `status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run` in `issues.test.ts` covers the same proof), passes; `pnpm bkit:test:file` passes on `tracker.test.ts`, `tracker.integration.test.ts`, `issues.test.ts` and `workflows.test.ts`; `pnpm build` rebuilds `dist/`; `pnpm bkit:graph:refresh` rewrites the `docs/capabilities.md` graph block and `pnpm bkit:graph:check` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `runActionKey names the latest run after it ended` fails on the key naming the next run, "plan/2/"
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `joins the run's progress comment with the Owner Answers after workflows close` fails on the answers post opening a second comment instead of joining the run's progress comment
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps two Owner Answers rounds in one comment after a terminal close comment` fails on each round opening its own comment

<!-- bkit:task 4 end -->

Reuse Inventory rows left out: 6; Architecture entries left out: 6 — read them in docs/plans/202611/1008-plan-design-owner-plan.md § Reuse Inventory and § Architecture & Component Changes.

## Deviations

Run rules from the v6.3 orchestrator (the owner is away):
- Work only in the workflow's own worktree under .worktrees/. Never stage, commit or switch branch in the main checkout.
- Do not touch .worktrees/1035-ledger-commit-outbox, .worktrees/919-worktree-setup-tries or .worktrees/1041-host-neutral-core, or their files.
- Load guard: before every test gate run uptime. While the 1-minute load is above 6, wait and check once a minute; after 15 minutes start anyway.
- publish=false means a held close: no push, no PR, no merge into dev.
- Where the Decision Pause asks a question that has a recommendation, take the recommendation. A question with no recommendation: stop and ask the orchestrator.
- Word ceiling: after text changes run pnpm -s bkit:text:ceiling check. Below the record, pnpm -s bkit:text:ceiling lower is fine. Above the record: shorten, or stop and report. Never run pnpm bkit:text:ceiling raise.
- A second Failure Path in this run: stop, leave the bkit:failed label, report.
- A permission refusal: do not route around it in any way; report it.
- Never name a bkit consumer in any file, commit or tracker text. Never print a secret.
- Prefer removing text or code to adding it; add no second way of doing one thing.
