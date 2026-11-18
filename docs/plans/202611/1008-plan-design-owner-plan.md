<!-- bkit:anchor
baseSha: 5ae256a78f7eacb028421578eb6aabe882206cf4
baseRef: origin/dev
bkitVersion: 6.2.0
bkitLatest: 6.2.0
-->

Verdict: CONCERNS
<!-- verdict:end -->

# Owner Answers Comment Keeps Its Run Link Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

An owner answers a plan's or design's open questions after the run closed, and the answers comment lands with the run's other reports, with no friction row and no warning line.

> Assumed from Q1 A until the owner answers Q1: the issue has no Narrative, so this sentence is Q1's proposal, not text from the issue.

### Success Criteria

- After `workflows close --session-dir`, a post with `--session-dir` (plan Step 8, design Step 12) joins the same progress comment as the run's earlier reports. An integration test closes a run, then posts, and checks this.
- That sequence writes no `tracker-comment/comment-association` friction row and prints no "invocation association unavailable" line.
- The run's link is kept somewhere that outlives the session folder, for example the run's `status.jsonl`, and is not worked out from the folder's path.
- A post with no proof of a run at all is still refused, and a test keeps proving it.

> The criteria are the issue's words. Under Q2 A, the first criterion's "a post with `--session-dir`" is read as the plan Step 8 and design Step 12 Owner Answers post, which names the run's status file with `--file`.

### Process Sketch

- **WHEN** a plan or design run starts **→ THEN** `repo info` writes a random progress id into the session folder, the Step 1 report opens the run's progress comment, and `workflows start` writes the run's link as `progress` on its `workflow-started` row.
- **WHEN** a later step reports with the run's status file **→ THEN** the engine reads the link from `status.jsonl` and appends the report to the progress comment, from the worktree or the main checkout.
- **WHEN** `workflows close` has deleted the session folder and the owner answers **→ THEN** the Owner Answers post names the run's status file, finds the link there, joins the progress comment while it is the issue's newest comment, and writes no association friction.
- **IF** the Close Workflow comment is newer than the progress comment **→ THEN** the first answers round opens one new comment, and later rounds append to it.
- **IF** a post carries no proof of a run, or names a status file with no run of its workflow **→ THEN** it exits 2 and reaches no tracker.
- **IF** a run's start row holds no link **→ THEN** its posts use a link built from its FID, workflow, run number and start time, the same from every checkout.

### Concrete Example

**Setup:** The owner runs `/bkit-plan #1008` with the GitHub tracker wired. The run works in `.worktrees/1008-plan-design-owner`; its session folder is `.git/bkit-outbox/sessions/20261118T090000Z-1a2b3c4d/`.

**Steps:**

1. The orchestrator runs `repo info` → the engine creates the session folder with a random `progress-id` file, and the Step 1 report opens progress comment P on #1008.
2. The orchestrator runs `workflows start --session-dir=…` → the engine appends a `workflow-started` row whose `progress` field is the link P was opened with.
3. Steps 2-7 post with the run's status file → each report appends to P.
4. Step 8 runs `workflows close --session-dir=…` → the session folder is deleted, and `branches land` moves the run's `status.jsonl` to the main checkout on `dev`. Step 8 sub-step 4 posts the Close Workflow links comment C, a terminal report that opens a new comment after P.
5. The owner answers the open questions → the orchestrator runs `issues comment --post --workflow=plan --step-number=8 --step-title="Owner Answers" --file="{REPO_ROOT}/docs/plans/202611/logs/1008-plan-design-owner/status.jsonl"` → the engine reads the link from the run's start row and keys the post to run 1. Because C is newer than P, the post opens one answers comment A, linked to the run.
6. The orchestrator commits the round's files, including the post's `engine-action` row in `status.jsonl`.
7. The owner answers a second round → the post appends to A while A is the newest comment, and the round's commit holds a second `engine-action` row with the same key and a new body hash.

**Outcome:** The answers reports are linked to the run and share comment A. No `[bkit-tracker] invocation association unavailable` line is printed, `.bkit/friction.jsonl` gains no `tracker-comment/comment-association` row, and `status.jsonl` on `dev` holds each post's `engine-action` row in its round's commit.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| The Close Workflow comment (`workflows links --post`, terminal) is newer than the progress comment | The newest-comment rule holds: the first answers round opens one new comment; later rounds append to that comment. |
| The owner answers in two rounds | Both rounds share the key `plan/{run}/step/8/comment`; each round's post gets its own `engine-action` row (the same key, a new body hash) and its own section; a re-run of the same round with the same body prints `deduped: true` and posts nothing. |
| A plan-check stop route ends the round (`commit nothing from this round`) | The round stops before the comment bullet, so nothing is posted and no `engine-action` row is written. |
| Local `dev` does not hold the run's `status.jsonl` (`branches land` did not fast-forward) | The step's existing `test -f` check stops the round, and nothing is posted. |
| The run was started by an older engine, so its start row has no `progress` | Posts use the link built from FID, workflow, run number and `startedAt`; the run may open one fresh progress comment. |
| The session folder was created by an older engine, so it has no `progress-id` file | A post before `workflows start` records association friction and posts a standalone comment, as a deleted folder does today. `workflows start` exits 0, prints the association line, records association friction and writes the start row without `progress`. |
| A post names only a deleted session folder and no status file | Association friction and a standalone comment, unchanged. |
| A `--file` post names a status file that holds no run of `--workflow` | Exit 2 with the "workflow steps only" message; no tracker call. |
| A post carries no proof of a run | Exit 2 with the "workflow steps only" message; no tracker call. |
| A run resumes with a new session folder | The run keeps the link of its first start; the resumed Step 1 report, posted before `workflows start`, opens a new comment, as it does today. |
| `ISSUE_ID` is empty or the tracker is `none` | The comment sub-step is skipped; the engine prints `skipped`. |
| The outbox is deleted or the repo is freshly cloned | The link survives in `status.jsonl`, but the progress cache is gone, so the next report opens a fresh comment (the existing degradation). |
| The post fails after the round's files are written | Delivery is nonfatal; no `engine-action` row is written, and the commit still lands the round. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| The status fold carries a `workflow-started` row's `progress` link onto its run | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 1 |
| `repo info` writes a random progress id into each new session folder | Unit | `.bkit/core/engine/commands/workflow/repo.test.ts` | 2 |
| Two session folders holding the same progress id give the same link, so no path goes into it | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 2 |
| `sessionPublication` throws for an existing session folder whose `progress-id` is missing or empty, instead of hashing the folder's path | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 2 |
| A post that names only a deleted session folder still records association friction (existing test, kept green) | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 2 |
| `workflows start --session-dir` writes the session's link as `progress` on the new run's `workflow-started` row | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 3 |
| A resumed `workflows start` with another session keeps the run's first link and appends no second start row | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 3 |
| `workflows start --session-dir` naming an existing folder with no `progress-id` exits 0, writes the `workflow-started` row without `progress`, prints the "invocation association unavailable" line and records a `tracker-comment/comment-association` friction row | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 3 |
| A run's reports stay in one progress comment when its status file moves from the worktree to the main checkout while the run is in progress | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 3 |
| A run started with no session keeps one progress comment across two checkouts of its status file | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 3 |
| The moved-status-file test proves the run stays in progress from the folded run's status, not the last row's type | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 7 |
| `runActionKey` names the latest run of the workflow after that run ended | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 4 |
| After `workflows close --session-dir`, the Owner Answers post joins the run's progress comment, writes no `tracker-comment/comment-association` friction row and prints no "invocation association unavailable" line | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 4 |
| After a terminal close comment, two Owner Answers rounds share one new comment, write two `engine-action` rows with one key and different hashes, write no association friction, and a same-body re-run prints `deduped: true` and posts nothing | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 4 |
| A `--file` post whose status file holds no run of `--workflow` exits 2 and reaches no tracker (new regression guard, green before and after; the unit test `status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run` in `.bkit/core/engine/commands/workflow/issues.test.ts` covers the proof) | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 4 |
| An ad-hoc comment with no run proof exits 2 and reaches no tracker (existing test, kept green) | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 4 |
| A terminal post after close seals the run's progress cache: `keeps published build completion and PR links in one terminal comment` (existing test, kept green) | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 4 |
| Plan Step 8 and design Step 12 post the Owner Answers comment with the run's status file, before the round's commit, and the plan's plan-check exit 0 route continues to the next bullet | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

<!-- prettier-ignore -->
| Item | Kind | Detail |
| --- | --- | --- |
| `progress` on the `workflow-started` row of `status.jsonl` | New field (name) | Optional string: the run's progress link, a sha256 hex. Additive; older engines ignore it. The name matches the `###### bkit:progress v1 {id}` marker the id already appears in. |
| `progress-id` in each session folder | New file (name) | Written by `repo info`; holds a random hex id. A session folder made by an older engine has none, so its pre-run reports record association friction once. |
| `runActionKey` | Changed meaning (engine-internal export) | Names the latest run of the workflow, active or ended, instead of the next run once the latest ended. Every caller is in the engine and its tests. |
| `endedRunActionKey`, `bindRunPublication`, `runPublicationFile` | Removed (engine-internal) | No caller outside `.bkit/core/engine/`; the CLI surface and every flag stay. |
| The session link's value | Changed value | A session's link is now built from its `progress-id`, not its path, so a run in flight across the upgrade may open one fresh progress comment. |
| `bkit-outbox/invocations/*.json` | No longer read or written | Private files left on existing clones; harmless (`Out of Scope`). |
| Plan Step 8 / design Step 12 Owner Answers command | Changed flag and order | `--file` with the run's status file replaces `--session-dir`; the comment bullet moves above the commit bullet. In plan Step 8, the plan-check exit 0 route reads `→ the next bullet.` instead of `→ the commit below.`, so it reaches the comment first; the stop routes keep their wording. |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Q1 — Narrative:** The issue has no Narrative: it is written as a bug report (What happens, Why, Where, Done when), not in the change shape, and there is no design. The Narrative above holds the proposal below, marked as assumed until you answer. You resolve it by taking the proposal or by writing one or two sentences of your own.
  - A) Take the proposal: "An owner answers a plan's or design's open questions after the run closed, and the answers comment lands with the run's other reports, with no friction row and no warning line." — it describes the outcome the four criteria measure.
  - B) Write your own Narrative — when you want the plan to stress a different outcome.
  - Recommended: A) the proposal — it adds nothing the Success Criteria do not already measure.
  - Default if unanswered: the plan assumes A
- **Q2 — How the Owner Answers post tells the engine which run it belongs to:** The first criterion says the post names the session folder (`--session-dir`). After close the session folder is gone, so the engine can find the run only through the run's status file, which the main checkout holds once the run has landed. The question is whether the two Owner Answers lines keep the session flag.
  - A) Replace `--session-dir` with `--file` naming the run's status file on both lines — the post finds its run and its link; each line keeps its word count, so neither workflow total grows. The criterion is read as "the plan Step 8 and design Step 12 post".
  - B) Keep `--session-dir` and add `--file` — the same behaviour, but the session flag does nothing after close and the workflow total grows by two words, which the run's brief forbids.
  - C) Keep only `--session-dir` and have the engine look the status file up from the issue number — the lookup is ambiguous when one issue has two FIDs, and it is a second way to find a run.
  - Recommended: A) replace the flag — it is the only option that finds the run without a second lookup and keeps the word totals.
  - Default if unanswered: the plan assumes A
- **Q3 — The Close Workflow comment comes between the progress comment and the answers:** The engine adds a report to the run's progress comment only while that comment is the issue's newest one, so a newer comment makes the next report open its own comment (decision `826-progress-chronology-owner-gate`). In a tracked plan or design run, Step 8 (design Step 12) posts the Close Workflow links comment, a terminal report that always opens a new comment, before the owner can answer. So in a real run the first answers round opens one new comment, and later rounds append to it. The first criterion's integration test closes a run and then posts, as the issue states, and joins the progress comment; a second test pins the real sequence.
  - A) Keep the newest-comment rule — the answers are linked to the run, deduped by the run's status file and free of friction, and they share one comment with each other.
  - B) Post the Close Workflow links comment as a routine report, so it and the answers append to the progress comment — changes the rule that terminal reports always open a new comment in every workflow, which is a major change.
  - Recommended: A) keep the rule — the issue's harm (friction, the warning line, the latest-5 fallback) goes away without changing how every workflow reports its close.
  - Default if unanswered: the plan assumes A
- **Assumption:** Q1 A is taken, so the Narrative is the plan's own proposal → if the owner meant a different outcome, the Narrative stresses one the owner did not intend; the Success Criteria, the matrix and the tests stay valid, because they come from the issue.
- **Assumption:** No workflow posts with `--file` before its own `workflows start`, so `runActionKey` can name the latest run, active or ended. Today this holds: ship Step 1 starts its run (`.bkit/core/workflows/bkit-ship.md:215`) before its `--file` post (`:238`), and the build's `--file` post (`.bkit/core/workflows/bkit-build.md:1471`) is the terminal Create PR post after close → a workflow that posted with `--file` before starting a new run would key that post to the previous run.
- **Assumption:** A session folder serves one run from `repo info` to `workflows close`, and `repo info` runs again only when the orchestrator lost `SESSION_DIR` → a folder shared by two runs would give both runs the same link and mix their reports.
- **Assumption:** Upgrading the engine in the middle of a run is rare, so a run whose session folder has no `progress-id` file, or whose start row has no `progress`, may open one fresh progress comment → if mid-run upgrades were common, owners would see an extra comment per upgraded run.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Make `sessionPublication` tolerate a deleted folder (resolve the nearest existing parent, as `commentRunProof` does) | Rejected | The smallest diff, but the link stays worked out from the folder's path, which the third criterion rules out, and the status file's path-keyed cache still misses after `branches land`. |
| Copy the session folder's path hash into the start row, and keep hashing the path for posts made before the run exists | Rejected | Fixes the post-close case, but the link is still a hash of the folder's path, which the brief's `Removes:` line and the third criterion exclude. |
| Keep the `bkit-outbox/invocations/` cache and key it by FID and run instead of the path | Rejected | Private state that an outbox cleanup or a fresh clone loses, and a second home for run state next to `status.jsonl`. |
| Move every Step 1 report after `workflows start`, so every post has a status file | Rejected | Removes the session link entirely, but restructures Step 1 and Step 2 of every phase workflow, far outside this issue. |
| Record the link on a `workflow-meta` row, which `fold` already merges onto the run (`status.ts:453-458`) | Rejected | Needs no `fold` change, and a resumed run with no link could gain one, but it adds a row per run and breaks the start-row precedent for frozen run-level fields (`parentSha`, `limits`) that decision `1008-run-progress-link-recorded-on-workflow-started-row` follows. |
| Find the run from `--session-dir` plus the issue number after close | Rejected | A glob over `docs/plans/*/logs/{issue}-*/` is ambiguous when an issue has two FIDs, and it is a second way to find a run. |
| **Random id in the session folder, link on the start row, Owner Answers names the status file** | **Chosen** | The link is never built from a path, lives in `status.jsonl` from `workflows start` on, and is found from any checkout after close; the proofs and the verbs stay as they are. |

**Recommendation for a later phase:** #1005's answers command should post its comment with the run's status file, as this plan's Step 8 and Step 12 lines do; it then needs no session folder at all. The leftover `bkit-outbox/invocations/` files belong to a later outbox cleanup (`Out of Scope`).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Removing the leftover `bkit-outbox/invocations/*.json` files on clones that ran an older engine | No criterion, scenario or test row needs them gone: after this change nothing reads or writes them, they sit outside committed content and hold only a hash. | A later outbox cleanup, for example next to the session-folder pruning in `repo info` (deferral `1008-leftover-outbox-invocation-cache-files`). |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| The answers command that replaces the guards of plan Step 8 and design Step 12 | #1005 item 4 | The two Owner Answers lines Task 5 edits | Keep separate: #1005 lands on its own and takes over the post call this plan fixes (`Context & Goals`). |
| The audit run proof accepts a traversal `--audit-slug` such as `x/../../..` | `docs/deferrals.jsonl` `918-ad-hoc-agent-challenge-low-bkit-core-engine-commands-workflow-tracker-ts-2019` (open, LOW) | `commentRunProof` in `tracker.ts`, which Task 4 edits | Keep deferred: a proof-hardening fix with its own test, unrelated to where the run link lives. |
| The `steps` verbs' `--post` still keys the next run once a run ended | Plan review (tightness), out of scope: `runNumber` in `steps.ts:1658-1665` | The latest-run rule Task 4 gives `runActionKey` | Keep separate: no workflow posts through it after close today; a key-rule consistency issue of its own. |
| Session-only posts always key run 1 | Plan review (tightness), out of scope: `postForVerb` builds `actionKey(publication.workflow, 1, ...)` (`tracker.ts:2162-2174`) | `postForVerb`, which Tasks 2-4 read | Keep separate: no criterion here needs it. |
| Other phase workflows (`bkit-build`, `bkit-debug`, `bkit-ship`) may post with `--session-dir` after their own `workflows close` | Scope check, out of scope | The lost-link fault this plan fixes for plan and design | Propose a separate sweep of every post after close. |
| A resumed run with a new session could adopt that session's link, so its resumed Step 1 report joins the run's comment | Plan review (regression risk), out of scope | `workflows start` and `sessionPublication` (Tasks 2-3) | Keep separate: the run keeps its first link today and under this plan. |
| `.bkit/core/.bkit/workflows.md:474` says every step posts a new comment and no bodies are concatenated, which routine append no longer matches | Plan review (regression risk), out of scope | § Comment Lifecycle, which Task 6 edits | Keep separate: a docs fix for its own issue. |

## Security & Privacy

- [ ] **New API Route** — not applicable: no route.
- [ ] **New DB Table/Column** — not applicable: no database. The new `workflow-started.progress` field is committed with the run's log; it is a one-way sha256 of a random id and the workflow name, holds no path, and the same id already appears in the public `bkit:progress` marker of the run's progress comment.
- [ ] **Role-Gated Mutation** — not applicable.
- [ ] **User Input** — the flags are parsed in the engine's verb handlers as today; `--file` still resolves to a status file that must hold a run of `--workflow` before `commentRunProof` accepts it, and a post with no proof still exits 2.
- [ ] **PII** — none logged: the diagnostics and friction rows stay free of bodies, paths and personal data (`docs/observability.md` § Tracker reporting diagnostics). The `progress-id` file is private (mode `0600`) under the Git-common outbox.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable.

`docs/security.md` § Workflow comment ownership holds: ownership still comes only from an explicit session or an exact run, and the proof stays a check against accidental posts, not a boundary.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added or removed; `package.json` and `pnpm-lock.yaml` stay in sync (`pnpm install --frozen-lockfile` inside `pnpm bkit:gate:install-static-unit-build`).
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-18) lists `oxlint` 1.92.0 → 1.93.0, `@types/node` 24.19.2 → 26.6.6 and `vite` 6.4.5 → 8.3.8, all dev-only and none blocking this change. Toolchain: Node v24.16.0 (engines `>=24`), pnpm 10.34.9, `gh` 2.102.0; no backend CLI is involved.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`; every capability extends an existing symbol, and no file is created.
- [ ] **User Context:** read access to `tracker.ts`, `workflows.ts`, `issues.ts`, `repo.ts`, `status.ts`, their tests, both workflow sources and the docs below is confirmed; issue #1005 was read (`gh issue view 1005 --repo cbartens/bkit --comments`: no comments). No user information is missing apart from Q1.
- [ ] **Project Context:** read `docs/decisions.jsonl` rows `58-followup-routing-state-reread-from-status-jsonl`, `467-ledger-rows-only-through-bkit-commands`, `918-comment-guard-workflow-run-proof`, `826-progress-chronology-owner-gate`, `826-progress-invocation-lifecycle` and `826-commenting-best-effort-never-fails-workflow`, and the `tracker-comment/comment-association` row in `.bkit/friction.jsonl`. `docs/knowledge.jsonl` rows that apply: `workflow-push-retry-keeps-close-effects-and-original-return-once` (Tasks 3 and 4), `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e`, `wording-retired-prefix-of-new-text-and-loose-list-items` and `consumer-tests-guard-asserted-comment-prose` (Task 5), and `tracker-post-unit-tests-clear-ambient-linear-credential` (any new unit test that posts).
- [ ] **Project Documents:** `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` are assessed through `.agents/docs.md`; the tiers follow `docs/testing.md` § Which tier does a behaviour need? Sources are in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable — no credential or env var is added.
- [ ] **Schema State:** not applicable — no database. The `status.jsonl` row shape is documented in `.bkit/core/.bkit/workflows.md` § status.jsonl, which Task 6 updates.
- [ ] **Architecture & UI:** the topology is checked against `docs/architecture.md` (the tracker delivery paragraph and § Deterministic bookkeeping); no UI.
- [ ] **Observability:** the existing `[bkit-tracker]` diagnostics and `comment-association` friction stay for posts that name only a missing session folder, per `docs/observability.md` § Tracker reporting diagnostics; no new log name.
- [ ] **Deployments & Setup:** not applicable — no release, CI or local-setup change.
- [ ] **Notifications:** not applicable — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| index | `.agents/docs.md` | yes | `.agents/docs.md` § Project Documents | covered | None. |
| architecture | `docs/architecture.md` | yes | `docs/architecture.md` line 27 (tracker delivery paragraph) and § Deterministic bookkeeping (line 220) | covered | Line 27 says the Git-common `bkit-outbox` holds the run associations; after this change the run's `status.jsonl` holds them. Task 6 rewrites the sentence. |
| technology | `docs/technology.md` | yes | `docs/technology.md` § Runtime & Language | covered | None: Node 24, TypeScript and `tsx` cover the change. |
| security | `docs/security.md` | yes | `docs/security.md` § Workflow comment ownership | covered | Its last paragraph names "invocation files" under `bkit-outbox`; Task 6 removes them from it and names the committed `progress` link, a sha256 that holds no path. |
| testing | `docs/testing.md` | yes | `docs/testing.md` § Which tier does a behaviour need?, § Tiers, § Spawning `bkit` from tests, § Routine tracker reporting coverage | covered | § Routine tracker reporting coverage lists what the integration file covers; Task 6 adds the post-close and moved-status-file cases. |
| data schema | `docs/data-schema.md` | no — no database; the `status.jsonl` row shape lives in `.bkit/core/.bkit/workflows.md` § status.jsonl | `.bkit/core/.bkit/workflows.md` § status.jsonl (the `workflow-started` row) | covered | Task 6 adds `progress?` to the `workflow-started` row. |
| observability | `docs/observability.md` | yes | `docs/observability.md` § Tracker reporting diagnostics | covered | None: the diagnostics and friction stages are unchanged. |
| deployments | `docs/deployments.md` | no — no release, CI or branch behaviour changes | none | none | None. |
| design | `docs/design.md` | no — no UI | none | none | None. |
| noise | `docs/noise.md` | no — no signal is downgraded | none | none | None. |
| setup | `docs/setup.md` | no — no local-setup change | none | none | None. |
| capabilities | `docs/capabilities.md` | yes | `docs/capabilities.md` header rules (lines 9, 21, 55) | covered | Removing symbols from `tracker.ts` changes its generated graph counts; Task 4 runs `pnpm bkit:graph:refresh` after the last engine edit. |
| tracker contract | `.bkit/trackers.md` | yes | `.bkit/core/.bkit/trackers.md` § Workflow comment delivery | covered | Its second paragraph places the run association in `bkit-outbox`; Task 6 rewrites it. |
| workflow contract | `.bkit/workflows.md` | yes | `.bkit/core/.bkit/workflows.md` comment paragraph (line 45), status row table (line 290) and § Comment Lifecycle **Posted once** (line 476) | covered | Task 6 updates all three, and Task 5's workflow edit keeps the index current. |

## Documentation Warnings

None

## Data Schema Integration

No database. The change uses the run's append-only `status.jsonl` (documented in `.bkit/core/.bkit/workflows.md` § status.jsonl) and the private session folder under `<git common dir>/bkit-outbox/sessions/`.

### Data Schema Usage

- **Input (Read):** `status.jsonl` `workflow-started` rows (`workflow`, `at`, `progress`), the folded run's `startedAt` and run number, and `engine-action` rows (`key`, `hash`); the session folder's `progress-id` file.
- **Output (Write):** `workflow-started.progress` (written once by `workflows start` for a new run); the Owner Answers post's `engine-action` row; the session folder's `progress-id` file (written by `repo info`).

### Data Schema Changes

None in `docs/data-schema.md` (no database). The file-ledger changes, recorded in `.bkit/core/.bkit/workflows.md` by Task 6:

- **ADD:** `workflow-started.progress` (string, optional): the run's progress link, a sha256 hex of the session's random id and the workflow name.
- **ADD:** `progress-id` in each new session folder (text, mode `0600`): a random hex id from `randomBytes`.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A random id per session, minted when the folder is made | `.bkit/core/engine/commands/workflow/repo.ts` | `grep -rn -e 'newSessionDir' -e 'randomBytes' .bkit/core/engine/commands`; references to `newSessionDir`; `docs/capabilities.md` | `newSessionDir` in `repo.ts` — creates the folder with a random suffix, writes no file into it | EXTEND | Write `progress-id` (random hex) into the folder it creates. |
| The session's link built from that id, with no path | `.bkit/core/engine/commands/workflow/tracker.ts` | references to `sessionPublication` (`tracker.ts:2068`, `:2148`); `grep -n 'actionHash' tracker.ts` | `sessionPublication` — validates the folder and hashes its real path with the workflow | EXTEND | Keep the folder check; build `invocation` from `progress-id` and the workflow instead of the path. |
| The run's link recorded in durable run state | `.bkit/core/engine/commands/workflow/workflows.ts` | references to `bindRunPublication` (`workflows.ts:2163`); `grep -rn '"workflow-started"' .bkit/core/engine`; `activeRunStart` in `counters.ts` (the `limits` precedent) | the `workflow-started` row built in `workflows start` — already carries frozen run-level fields (`parentSha`, `limits`); `bindRunPublication` writes the outbox cache | EXTEND | Add `progress` to the row it appends for a new run; drop the `bindRunPublication` call. |
| The run's link on the folded run | `.bkit/core/engine/ledgers/status.ts` | references to `fold`, `readRunsLenient` (`locks.ts:285`); `grep -n 'workflow-meta' status.ts` | `fold` — builds each run from its `workflow-started` row; `workflow-meta` merges other run-level fields | EXTEND | Carry `progress` from the start row onto the run, so `progressBinding`, which already holds the folded run, reads it without a second file read. |
| Posts that name a status file read the link from it | `.bkit/core/engine/commands/workflow/tracker.ts` | references to `runPublicationFile` (`tracker.ts:1456`, `:2072`); `grep -n 'invocations' -r .bkit/core/engine` | `progressBinding` — hashes the status file's absolute path, then reads the path-keyed cache | EXTEND | Read `run.progress`; with none, hash FID, workflow, run number and `startedAt`. |
| A post's key names the run it reports on, after that run ended | `.bkit/core/engine/commands/workflow/tracker.ts` | references to `runActionKey` (`issues.ts:1350`, `tracker.test.ts` x8) and `endedRunActionKey` (`issues.ts:1349`, `workflows.ts:420`, `tracker.ts:2015`) | `runActionKey` (next run once ended), `endedRunActionKey` (latest run) | EXTEND | `runActionKey` takes the latest-run rule; `endedRunActionKey` is a `Supersession Inventory` `DELETE`. |
| The Owner Answers post names the run's status file | `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-design.md` | `grep -n 'Owner Answers' .bkit/core/workflows/*.md`; `pnpm instructions:show --file bkit-plan.md` (Task 5) | plan Step 8.8 and design Step 12.8 comment lines; the same steps' `status invocation` line already names the status file | EXTEND | Swap the flag, move the comment bullet above the commit bullet, and point the plan's plan-check exit 0 route at the next bullet. |
| A check that the two lines keep naming the status file | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | `grep -rn 'session-dir' .bkit/core/engine/audits/workflows/*.ts` | `catalog-parity.test.ts` accepts `--session-dir` or `--file` on every comment call; `workflow-shape.test.ts` holds step-shape checks per workflow | EXTEND | Add one test to `workflow-shape.test.ts` for the two Owner Answers lines and their order. |
| Real-CLI tests of the post-close and moved-file sequences | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | `grep -n 'it(' tracker.integration.test.ts`; `docs/testing.md` § Routine tracker reporting coverage | the file's `session`, `start`, `report`, `close` helpers and its persistent GitHub stand-in | EXTEND | Add the new cases to the existing `describe`, reusing its helpers. |

## Architecture & Component Changes

Every change extends an existing file (`Reuse Inventory`); no file is created or deleted. The engine edits rebuild `dist/` (`pnpm build`), and the workflow edits re-render the host mirrors (`pnpm tsx .bkit/core/engine/cli.ts upgrade`).

**Ledger rows:** `1008-run-progress-link-recorded-on-workflow-started-row`, `1008-owner-answers-comment-names-run-status-file`, `1008-comment-key-names-latest-run`, `1008-leftover-outbox-invocation-cache-files`

### Database Migrations

None — no database. The `workflow-started.progress` field is optional and additive: an older engine's fold ignores it, and a run without it uses the path-free fallback link.

### Engine — session and run link

#### [MODIFY] `.bkit/core/engine/commands/workflow/repo.ts`

- **Existence Check:** `newSessionDir` exists at `repo.ts:113-130`.
- `newSessionDir` writes `progress-id` (a random hex id, file mode `0600`) into the folder it creates. Pruning is unchanged.

#### [MODIFY] `.bkit/core/engine/ledgers/status.ts`

- **Existence Check:** `StatusEvent` (`status.ts:383-397`) and `fold` (`status.ts:423-463`) exist.
- The `workflow-started` member of `StatusEvent` gains `progress?: string`. `fold` copies a string `progress` from the start row onto the run it pushes; a row without it folds as today.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tracker.ts`

- **Existence Check:** `sessionPublication` (`:2037`), `runPublicationFile` (`:2051`), `bindRunPublication` (`:2061`), `runActionKey` (`:2092`), `endedRunActionKey` (`:2104`), `commentKey` (`:2114`), `progressBinding` (`:1425`) and `commentRunProof` (`:1999`) exist.
- `sessionPublication` keeps its folder check and builds `invocation` as `actionHash` of the folder's `progress-id` content and the workflow; a missing or empty `progress-id` throws, which `postForVerb` already turns into the association diagnostic.
- `progressBinding` reads the folded run's `progress`; with none, the invocation is `actionHash` of FID, workflow, run number and `startedAt`, with no path.
- `runActionKey` names the latest run of the workflow, active or ended; `commentKey` loses its `numberOf` parameter. `commentRunProof` calls `runActionKey`.
- Docstrings on these symbols describe the new sources of the link.

#### [DELETE] `runPublicationFile`, `bindRunPublication` and `endedRunActionKey` in `.bkit/core/engine/commands/workflow/tracker.ts`

- Superseded by the `progress` field on the start row and by `runActionKey` (`Supersession Inventory`).

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** the `workflows start` run (`:2128-2165`), the failure-comment key (`:420`) and the `bindRunPublication` import (`:151`) exist.
- `workflows start` builds the new run's `workflow-started` row with `progress` from `sessionPublication` when `--session-dir` is given; a `sessionPublication` error prints `[bkit-tracker] invocation association unavailable; progress may start fresh` through `commentDiagnostic` and writes the row without `progress`. A resumed run writes nothing. The `bindRunPublication` call and import go.
- The failure comment's key uses `runActionKey`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/issues.ts`

- **Existence Check:** the `issues comment` key choice (`issues.ts:1347-1350`) exists.
- The key is `runActionKey(file, workflow, ...keyParts)` for every purpose; the `endedRunActionKey` import goes.

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-plan.md`

- **Existence Check:** Step 8 sub-step 8 holds the plan-check route (`:552-556`), the commit bullet and the Owner Answers comment (`:557-563`).
- The Owner Answers command passes `--file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"` instead of `--session-dir="{SESSION_DIR}"`. The tracker block holding it moves above the commit bullet, so the commit carries the post's `engine-action` row.
- The plan-check route's exit 0 line (`:553`) reads `→ the next bullet.` instead of `→ the commit below.`, so the route reaches the comment before the commit; the stop routes keep their wording and end the round before the comment.

#### [MODIFY] `.bkit/core/workflows/bkit-design.md`

- **Existence Check:** Step 12 sub-step 8 holds the commit bullet and the Owner Answers comment (`:642-648`).
- The flag swap and the block move of the plan workflow; Step 12 has no plan-check route to reword.

### Tests

- `[MODIFY]` `.bkit/core/engine/ledgers/status.test.ts`, `.bkit/core/engine/commands/workflow/repo.test.ts`, `.bkit/core/engine/commands/workflow/tracker.test.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts`, `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` and `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the `Derived Test Matrix` rows.
- `[MODIFY]` `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: the plan-check exit 0 route line, checked by `.bkit/core/engine/render/trackers.test.ts` (`none render baselines`); `bkit-design.none.txt` stays unchanged.

### Docs

- `[MODIFY]` `.bkit/core/.bkit/trackers.md`, `.bkit/core/.bkit/workflows.md`, `docs/architecture.md`, `docs/security.md`, `docs/testing.md`: `Documentation Updates`.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `bindRunPublication` in `.bkit/core/engine/commands/workflow/tracker.ts` | `progress` on the `workflow-started` row, written by `workflows start` | DELETE | Its only caller is `workflows start`, which writes the link into the row instead. |
| `runPublicationFile` in `.bkit/core/engine/commands/workflow/tracker.ts` and the `bkit-outbox/invocations/` cache it names | `progressBinding` reading the folded run's `progress` | DELETE | The cache is keyed by a hash of the status file's absolute path, which `branches land` changes. |
| `endedRunActionKey` in `.bkit/core/engine/commands/workflow/tracker.ts` | `runActionKey` with the latest-run rule | DELETE | One key rule serves all three callers. |
| The path hash inside `sessionPublication` and the status-path hash fallback inside `progressBinding` | The session's `progress-id`, and the FID-based fallback | DELETE | The link must not be worked out from a path. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | None: no new gotcha beyond the decisions. |
| `docs/decisions.jsonl` | Rows `1008-run-progress-link-recorded-on-workflow-started-row`, `1008-owner-answers-comment-names-run-status-file` and `1008-comment-key-names-latest-run`, written by this plan. |
| `docs/architecture.md` | The tracker delivery paragraph (line 27): the run's link lives on its `workflow-started` row; the Git-common outbox holds the progress source cache only. |
| `docs/technology.md` | None. |
| `docs/data-schema.md` | None: no database. |
| `docs/design.md` | None: no UI. |
| `docs/testing.md` | § Routine tracker reporting coverage: the file also covers a post after close and a status file moved to the main checkout. |
| `docs/observability.md` | None: diagnostics and friction stages unchanged. |
| `docs/security.md` | § Workflow comment ownership, last paragraph: the outbox holds progress files and session ids; the run's committed `progress` link holds no path. |
| `docs/capabilities.md` | The generated graph block, refreshed with `pnpm bkit:graph:refresh` after the engine edits. |
| `.bkit/core/.bkit/trackers.md` | § Workflow comment delivery, second paragraph: where the session id and the run link live. |
| `.bkit/core/.bkit/workflows.md` | The comment paragraph (line 45); the `workflow-started` row in the status row table (`progress?`); § Comment Lifecycle **Posted once**: a `--file` post after its run ended is keyed to that run. Covers the index rule for the workflow edit. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database. |
| **Code** | `git revert {COMMIT}` of the squash commit on `dev` | The reverted engine ignores `progress` on start rows and `progress-id` files, and writes the outbox cache again; runs in flight may open one fresh progress comment. |
| **Risk window** | None | Nothing is deployed; a consumer gets the change with their next `bkit upgrade`. |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: the status fold, the session id, the start row and its readers, the post key, then the workflow lines and the docs. One PR for all tasks is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: The run link in `status.jsonl`

<!-- bkit:task 1 start -->

- [x] **TASK 1:** The status fold carries the start row's `progress` link onto its run
  - **UPDATE:** `StatusEvent` in `.bkit/core/engine/ledgers/status.ts`: the `workflow-started` member gains `progress?: string`
  - **UPDATE:** `fold` in `.bkit/core/engine/ledgers/status.ts`: copies a string `progress` from the start row onto the run it pushes
  - **READ:** `.bkit/core/.bkit/workflows.md`: the status row table and the **Fold** rules (Task 6 updates them)
  - **READ:** `docs/testing.md`: § Which tier does a behaviour need?
  - **DONE WHEN:** `fold` returns `progress` on a run whose start row carries it and leaves the key out otherwise, and `pnpm bkit:test:file .bkit/core/engine/ledgers/status.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/status.test.ts` `carries the workflow-started progress link onto its run` fails on the folded run having no `progress`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** A session's link comes from a random id in its folder, never from its path
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

- [x] **TASK 3:** `workflows start` records the run's link on its start row, and posts that name the status file read it there
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

- [x] **TASK 4:** A post after its run ended keeps that run's key and link
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

<!-- bkit:task 7 start -->

- [x] **TASK 7:** The moved-status-file test checks the run's folded status, and the code map matches the code
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`: the last assertion of `keeps one progress comment when the status file moves to the main checkout` (`:800`) reads the folded run's status, or the absence of a close row, instead of `rows(cwd).at(-1)?.type`, because the keyed post from the main checkout appends an `engine-action` row after the start row
  - **UPDATE:** `docs/capabilities.md`: `pnpm bkit:graph:refresh` against the committed engine edits drops the `tracker.ts` to `shared/json` edge that the tree no longer produces
  - **UPDATE:** `DETAILS.md`: the same refresh rewrites its graph counts
  - **READ:** `docs/plans/202611/logs/1008-plan-design-owner/build-decision-1-1.md`: Q2 and Q3
  - **DEPENDS ON:** 3, 4
  - **DONE WHEN:** the moved-status-file test passes with its one-comment assertions unchanged and a last assertion that the folded run is still `IN_PROGRESS`; `pnpm bkit:test:file` passes on `tracker.integration.test.ts`; `pnpm bkit:graph:check` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout` fails on its last assertion reading the last status row's type instead of the folded run's status

<!-- bkit:task 7 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: The Owner Answers steps and the docs

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Plan Step 8 and design Step 12 post the Owner Answers comment with the run's status file, before the round's commit
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: Step 8 sub-step 8's Owner Answers command passes `--file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"` instead of `--session-dir="{SESSION_DIR}"`, and its tracker block moves above the commit bullet, kept tight with no blank line inside the list item
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: the plan-check route's exit 0 line (`:553`) reads `**If** exit 0 → the next bullet.` instead of `→ the commit below.`, the same word count, so it reaches the comment first and still reads right in the `none` render, where the comment block is stripped. The two stop routes keep their `commit nothing from this round` wording (shared clauses at `.bkit/instructions.md:10743` and `:10745`, pinned by `workflow-shape.test.ts:1579`): they end the round before the comment bullet, so a stop posts nothing
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: the flag swap and the block move in Step 12 sub-step 8, which has no plan-check route
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: one test for the two Owner Answers lines: the flag, the bullet order and the plan's exit 0 route, asserted on those tokens and not on bullet prose
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: the route line at `:437`, the only expected change, its diff read before the snapshot is regenerated
  - **READ:** `.bkit/instructions.md`: the clauses `pnpm instructions:show --file bkit-plan.md` and `--file bkit-design.md` list for the edited sentences
  - **READ:** `.bkit/core/engine/audits/workflows/catalog-parity.test.ts`: every comment call keeps a `--session-dir` or `--file` proof
  - **READ:** `docs/knowledge.jsonl`: rows `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e`, `wording-retired-prefix-of-new-text-and-loose-list-items` and `consumer-tests-guard-asserted-comment-prose`
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `LC_ALL=C cat .bkit/core/workflows/*.md | wc -w` prints 58536 or less and `LC_ALL=C cat .bkit/core/prompts/*.md | wc -w` prints 86494 or less; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` reports no change to a shared clause; `pnpm exec prettier --check .bkit/core/workflows/bkit-plan.md .bkit/core/workflows/bkit-design.md` passes; `pnpm bkit:test:file .bkit/core/engine/render/trackers.test.ts` passes (`none render baselines`), with `bkit-design.none.txt` unchanged and `bkit-plan.none.txt` changed only at the route line; `pnpm bkit:test:file` passes on `workflow-shape.test.ts` and `catalog-parity.test.ts`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `plan and design post the Owner Answers comment with the run's status file before the round's commit` fails on the Owner Answers line carrying `--session-dir`, sitting after the commit bullet, and the plan's exit 0 route still naming "the commit below"

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [x] **TASK 6:** The docs say where the session id and the run link live
  - **UPDATE:** `.bkit/core/.bkit/trackers.md`: § Workflow comment delivery, second paragraph: the session folder holds its random id, the run's `workflow-started` row holds the run's link, and the Git-common outbox holds the progress source cache only
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the comment paragraph (line 45); `progress?` on the `workflow-started` row in the status row table; § Comment Lifecycle **Posted once**: a `--file` post after its run ended is keyed to that run
  - **UPDATE:** `docs/architecture.md`: the tracker delivery paragraph (line 27)
  - **UPDATE:** `docs/security.md`: § Workflow comment ownership, last paragraph
  - **UPDATE:** `docs/testing.md`: § Routine tracker reporting coverage
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files and § Docs
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `grep -n -e 'run association' -e 'invocation files' docs/architecture.md docs/security.md .bkit/core/.bkit/trackers.md .bkit/core/.bkit/workflows.md` finds nothing (today it matches `docs/architecture.md:27` "progress source and run associations", `docs/security.md:66` "progress and invocation files" and `.bkit/core/.bkit/trackers.md:25` "progress cache and run association"); `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-renders `.bkit/trackers.md`, `.bkit/workflows.md` and the host mirrors of the two workflows; `pnpm tsx .bkit/core/engine/cli.ts check` reports no drift.
  - **TEST FIRST:** n/a — docs and re-rendered mirrors only; no behaviour change

<!-- bkit:task 6 end -->

<!-- bkit:group 2 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row (none planned).
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran. A later task that names an earlier task's test takes it over: the build reports the takeover and does not refuse it.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN` or `TEST FIRST`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task names exists and passes.
- [ ] **Verify observability:** the association diagnostic and friction still fire for a post that names only a missing session folder, per `docs/observability.md` § Tracker reporting diagnostics.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `pnpm tsx .bkit/core/engine/cli.ts check` pass.
- [ ] **Test Synchronization:** no E2E suite exists for bkit; the workflow audits in `.bkit/core/engine/audits/workflows/` run with the unit tier.
- [ ] **Build Configuration:** test files stay `*.test.ts` / `*.integration.test.ts`, which `tsconfig.json` keeps out of `dist/`; `pnpm build` output holds no test file.
- [ ] **Unit (`status.test.ts`, `repo.test.ts`, `tracker.test.ts`, `workflows.test.ts`, `workflow-shape.test.ts`):** the matrix rows of Tasks 1-5; each test builds its own temp repo under `os.tmpdir()` and removes it, and any new unit test that posts clears `BKIT_LINEAR_API_KEY` in `beforeEach` (`docs/knowledge.jsonl` row `tracker-post-unit-tests-clear-ambient-linear-credential`).
- [ ] **Integration (`tracker.integration.test.ts`):** the matrix rows of Tasks 2-4 run the real CLI against real Git repositories, linked worktrees and the persistent GitHub stand-in; no mock at the tracker or file boundary.
- [ ] **Apply local migrations:** not applicable — no database.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch consumer, run `pnpm build`, then `node dist/cli.js repo info --json` and check that the printed `sessionDir` holds a `progress-id` file.
- [ ] **Step 2:** Run `node dist/cli.js workflows start --workflow=plan --fid={FID} --month={YYYYMM} --session-dir={sessionDir}` and check that the new `workflow-started` row in `status.jsonl` carries `progress` and no path.
- [ ] **Step 3:** On the next real `/bkit-plan` run with a tracker, answer one open question after the close, then check that `.bkit/friction.jsonl` gained no `tracker-comment/comment-association` row, that the round's commit holds the post's `engine-action` row, and that the answers land in one new comment after the Close Workflow comment, which a second round appends to.
