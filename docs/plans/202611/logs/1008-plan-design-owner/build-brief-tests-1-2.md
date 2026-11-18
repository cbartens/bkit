# Brief: group 1 — The run link in `status.jsonl` (tests)

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
  - TASK 1: The status fold carries the start row's `progress` link onto its run — done
  - TASK 2: A session's link comes from a random id in its folder, never from its path — done
  - TASK 3: `workflows start` records the run's link on its start row, and posts that name the status file read it there — done
  - TASK 4: A post after its run ended keeps that run's key and link — done
  - TASK 7: The moved-status-file test checks the run's folded status, and the code map matches the code — open
- Group 2: The Owner Answers steps and the docs — next
  - TASK 5: Plan Step 8 and design Step 12 post the Owner Answers comment with the run's status file, before the round's commit — open
  - TASK 6: The docs say where the session id and the run link live — open

## The work

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** The moved-status-file test checks the run's folded status, and the code map matches the code
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`: the last assertion of `keeps one progress comment when the status file moves to the main checkout` (`:800`) reads the folded run's status, or the absence of a close row, instead of `rows(cwd).at(-1)?.type`, because the keyed post from the main checkout appends an `engine-action` row after the start row
  - **UPDATE:** `docs/capabilities.md`: `pnpm bkit:graph:refresh` against the committed engine edits drops the `tracker.ts` to `shared/json` edge that the tree no longer produces
  - **UPDATE:** `DETAILS.md`: the same refresh rewrites its graph counts
  - **READ:** `docs/plans/202611/logs/1008-plan-design-owner/build-decision-1-1.md`: Q2 and Q3
  - **DEPENDS ON:** 3, 4
  - **DONE WHEN:** the moved-status-file test passes with its one-comment assertions unchanged and a last assertion that the folded run is still `IN_PROGRESS`; `pnpm bkit:test:file` passes on `tracker.integration.test.ts`; `pnpm bkit:graph:check` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout` fails on its last assertion reading the last status row's type instead of the folded run's status

<!-- bkit:task 7 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| A post that names only a deleted session folder still records association friction (existing test, kept green) | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 2 |
| A run's reports stay in one progress comment when its status file moves from the worktree to the main checkout while the run is in progress | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 3 |
| A run started with no session keeps one progress comment across two checkouts of its status file | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 3 |
| The moved-status-file test proves the run stays in progress from the folded run's status, not the last row's type | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 7 |
| After `workflows close --session-dir`, the Owner Answers post joins the run's progress comment, writes no `tracker-comment/comment-association` friction row and prints no "invocation association unavailable" line | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 4 |
| After a terminal close comment, two Owner Answers rounds share one new comment, write two `engine-action` rows with one key and different hashes, write no association friction, and a same-body re-run prints `deduped: true` and posts nothing | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 4 |
| A `--file` post whose status file holds no run of `--workflow` exits 2 and reaches no tracker (new regression guard, green before and after; the unit test `status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run` in `.bkit/core/engine/commands/workflow/issues.test.ts` covers the proof) | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 4 |
| An ad-hoc comment with no run proof exits 2 and reaches no tracker (existing test, kept green) | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 4 |
| A terminal post after close seals the run's progress cache: `keeps published build completion and PR links in one terminal comment` (existing test, kept green) | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 4 |

### Planned tests taken over from earlier tasks

- TASK 7 `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout` — taken over from TASK 3; rewrite that test case so it fails until this task's code exists

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
