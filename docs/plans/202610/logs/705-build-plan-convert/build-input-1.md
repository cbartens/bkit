## Session Prompt — this run's, newer than everything below

#705

---

# Build Feature (Workflow 3/5)

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Build feature and raise PR for default integration branch.

**Protocol:** Work through this file exactly as written.

- **Rules file:** Read `.agents/rules.md` → follow all rules.
- **Order:** Execute steps sequentially unless stated otherwise.
- **No improv:** No ad-hoc steps, no skipping.
- **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does not mean silent.
- **Failures:** **If** any step, tool, command fails, or gate cannot pass → **Failure Path**.
- **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` may be empty). **Else** → **Failure Path**.
- **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys as `{VAR}`, a `"quoted"` value without its quotes. Exit non-zero with no `Route:` for it → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
- **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.
- **CI wait turn-loop:** **If** a `bkit runs dispatch` block exits 81 (runtime cannot wait) or 80 (`gh` unavailable) → resolve the poll in the agent turn loop: each orchestrator turn run once `bkit runs wait --pr={PR_NUMBER} --once` (on exit 80 read the PR's checks via `pull_request_read` instead) — check present → `found`; 6th unresolved turn → `none`, or `err` when every turn errored; **Else** → end turn and repeat. Re-run the block with `{CI_REENTRY}` = `--poll-result=<found|none|err> --attempts=<total>`, plus `--all-errored` when every turn errored and `--retriggered` when the printed `phase` = repoll. `{CI_REENTRY}` is empty on a block's first run.

**Contract:** The terms between this agent and whoever runs it.

- **Friction:** Watch own context and subagent returns for human confirm prompts, manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; logging does not replace **Failure Path**.
- **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 always run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `after` = `build-challenge` → Step 10 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `{CHALLENGE_MAX}`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `{VERIFY_ATTEMPT}`, `testAttempt` as `{TEST_ATTEMPT}`, `PAUSE_POINT` = `build.{from}`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `{CHALLENGE_MAX}`) and Step 10 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `{CHALLENGE_TASKS}` → back to **Decision Pause** step 3, never sub-step 6.

- **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook): groups of <= `{MAX_TASKS_PER_GROUP}` tasks and <= `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 6-8; tasks tick `[x]` only in verify.
- **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
- **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); release in last step and Failure Path with that token; assert lock released before exiting. **If** still held → **Failure Path** with `Lock removal failed`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
- **Status branch:** status.jsonl committed on `feat/{FID}` (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`); per-step commits, no pushes.
- **Worktrees:** **If** `runtimeWorktrees` = true (mint mode) → `bkit worktrees setup` creates / resumes `.worktrees/{FID}`. **Else** → adopts current branch in place. `cd` into its `worktreePath` = `{WORKTREE_PATH}`. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**.
- **gh MCP fallback:** `gh` primary for PR / CI / merge surface. **If** a command exits 80, **or** `runtimeGithubCli` = false in the `runtime-resolved` row of `{STATUS}` → use mapped MCP tool (needs `actions` toolset in `.mcp.json`): `bkit prs open` / `bkit branches land` stage `open` → `create_pull_request` with the printed `title` / `base` / `head` and the content of the printed `bodyFile` as `body`, byte-for-byte; `bkit prs probe --number` → `pull_request_read` (`get`, minimal fields); `bkit prs probe --head` / `bkit workflows handover --push` → `list_pull_requests`; `bkit prs merge` / `bkit branches land` stage `merge` → `merge_pull_request` (printed skip-token-free `subject` as `commit_message`, empty body; `--match-head` SHA as `sha`); `bkit prs verbose-ci` → `update_pull_request`; `bkit prs update-branch --number` → `update_pull_request_branch`; `bkit prs checks --number` → `pull_request_read` (`get_status`); `bkit runs wait` / `bkit runs dispatch` / `bkit runs revalidate` / `bkit runs gate` → `actions_list`; `gh run view {id} --json jobs` → `actions_get`; `gh run view --log-failed` → `get_job_logs` (`failed_only=true`). Max 1 transition per run, recorded as a `transport-fallback` row via `bkit prs transport-row --file={STATUS} --kind=fallback --from=<gh command> --to=<MCP tool> --reason=<why> --asserted-by=<re-read>` — **Skip if** `{STATUS}` not set. Tracker reads and writes go through `bkit` verbs; the tracker MCP only when a verb prints `tracker.done: false` or exits 80.

- **Tracker:** GitHub Issues — `bkit` verbs read and write it; MCP server `github` (`.mcp.json` `mcpServers.github`) only when a verb exits 80 or prints `done` = false. Tools: `mcp__github__issue_read` (method `get` / `get_comments` / `get_labels`), `mcp__github__issue_write` (method `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`, `mcp__github__projects_write` (method `add_project_item` / `update_project_item`); board status sync needs `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and `package.json` `bkit.tracker.github.project`, absent either → silently skipped. Assert `{ISSUE_ID}` / `{STATE}` / `{LABELS}` non-empty before tool calls; writes best-effort, never gate; **If** failure → retry once after 5s → continue.
- **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive; a phase start drops the old phase, every `next:*` and `bkit:failed`). Additive labels: `bkit:auto` (bkit-auto trigger gate), `bkit:failed` (Failure Path). `bkit issues labels --write` computes and writes each transition. Fallback (`tracker.done` = false): `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`; `boardWrite.done` = false → `mcp__github__projects_write({BOARD}.addItem)` → `mcp__github__projects_write({BOARD}.updateItem)`.
- **Comments:** A step's `bkit` block posts the `comment` it prints with `--post` before its gate and prints `tracker`; every gate includes `Issue comment attempted (Step N section)`. **If** `tracker.done` = false → post the content of the printed `commentFile` byte-for-byte as a new comment via `mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })`; never shorten, reword, or rebuild it. never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content.

- **No issue:** `ISSUE_ID` empty → run issue-less; skip every issue-tied tracker read, label, comment and board call. Once Step 1 sub-step 4 holds `FID`, emit: Warning: no issue named — running issue-less as {FID}; no tracker reads, labels or comments. Name {FID} in the next prompt to continue this run.

- **Limits:** `bkit.workflows.build.verify` / `.challenge` / `.tests` each hold `ask` and `maxAttempts`, read via `bkit counters route --point=` in fenced routing blocks below; `bkit counters max --point=` reads a limit alone. Verify counts rounds per group, challenge counts rounds (`CHALLENGE_ROUND`, Step 10; the last round never fixes on its own), tests counts test rounds. A limit used up → **Failure Path**; a question never resets a count. `ask` = false, or headless → the **Decision Pause** takes each recommendation (`bkit decisions apply --by=headless`); hard blockers (no recommendation) are asked in a session and go to the **Failure Path** headless.

## Issue description — oldest

## Problem

A `/bkit-build` run's issue comments should line up one-to-one with the workflow's numbered steps. On #703 they do not: the comments jump **Step 3 → Step 5**, the plan-convert post is indistinguishable from Branch Sync, and Plan Current posts nothing.

Three defects on one surface:

1. **Plan convert shares Branch Sync's step number and heading.** Step 3 runs both `@bkit-build-plan-convert` and the Branch Sync work, and both finishes post with `--number=3 --title="Branch Sync"` (`.bkit/core/workflows/bkit-build.md:377,381`). The convert comment is told apart only by its `- Attempt: 1` suffix.
2. **Branch Sync "posts as plan convert".** Because of (1), the convert step's comment reads as a Branch Sync comment; there is no Plan Convert step, heading or number in the issue.
3. **Plan Current posts nothing when it self-skips.** When the plan was written mid-build by `@bkit-build-plan-convert`, it carries no `bkit:anchor`, so Step 4's trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` exits 12 (`EXIT_ANCHOR_SKIP`, `.bkit/core/engine/commands/workflow/branches.ts:85`; `skip("no-anchor", …)` at :1946), so the route jumps to Step 5 — no agent, no `step-done` row, no comment (`.bkit/workflows.md:876`, `:1429`).

## Evidence — issue #703

Comments the run posted (all by the owner):

<!-- prettier-ignore -->
| # | body heading | posted (UTC) |
| --- | --- | --- |
| `6410901734` | `### Step 1 — Start Workflow` + tree | 07:48:17 |
| `6410910890` | `### Step 2 — Worktree Setup` + tree | 07:48:54 |
| `6411021634` | `### Step 3 — Branch Sync - Attempt: 1` | 07:56:19 |
| `6411023661` | `### Step 3 — Branch Sync` + tree | 07:56:27 |
| `6411035792` | `### Step 5 — Install Skills` | 07:57:15 |

- `6411021634` is the **plan-convert** post: `status.jsonl` carries the action-row key `build/1/build-plan-convert/-/1/comment` → `#issuecomment-6411021634`, and commit `a9fcfdb19 chore(…): plan-convert attempt 1`.
- **No Step 4 comment.** `status.jsonl` goes `build-branch-sync` → `build-install-skills`; there is no `build-plan-current` row.
- The plan `docs/plans/202610/703-standardise-question-option-plan.md` carries no `<!-- bkit:anchor -->` block, so `anchor-read` returns `skip: no-anchor` (exit 12).

## Required behaviour (agreed with the owner)

1. **Plan convert is its own step, with its own number.** `@bkit-build-plan-convert` runs as its own numbered `/bkit-build` step and posts under its own step number and heading — never Branch Sync's.
2. **When plan convert does not run, it posts nothing.** A plan already in task-block form with no comments newer than it leaves the Plan Convert number with no comment (accepted gap).
3. **Branch Sync posts as Branch Sync only.** Its comment heading and number are its own.
4. **Plan Current always posts its own comment.** Skipped or run, the step leaves a comment, so the issue's step comments stay in sequence.

## Proposed numbering

Pulling plan-convert out of Branch Sync's number shifts every later step by one:

<!-- prettier-ignore -->
| today | step | proposed |
| --- | --- | --- |
| 1 | Start Workflow | 1 |
| 2 | Worktree Setup | 2 |
| 3 | Branch Sync (convert + sync) | 3 Branch Sync · **4 Plan Convert** |
| 4 | Plan Current | 5 |
| 5 | Install Skills | 6 |
| 6 | Plan Execute | 7 |
| 7 | Plan Verify (+ group gate) | 8 |
| 8 | Plan Gaps Remediate | 9 |
| 9 | Plan Verify Holistic | 10 |
| 10 | Build Challenge | 11 |
| 11 | Run Tests | 12 |
| 12 | Failure Diagnose | 13 |
| 13 | Failure Remediate | 14 |
| 14 | Summary | 15 |
| 15 | Close Workflow & Create PR | 16 |

Split of today's Step 3:

- **Step 3 — Branch Sync**: `branches sync --merge-docs` only; finishes and posts `### Step 3 — Branch Sync`.
- **Step 4 — Plan Convert**: `tests plan-check` first, then the route — exit 0 with a valid plan and no newer comments → skip (no post, no row); no plan / no task markers / newer comments → `@bkit-build-plan-convert` → finish and post `### Step 4 — Plan Convert - Attempt: n` → re-check.
- **Step 5 — Plan Current**: `anchor-read`; exit 12 (no anchor) → post a `### Step 5 — Plan Current` skipped comment; exit 0 → `@bkit-build-plan-current` → finish and post, with `Affected` when CONCERNS/FAIL.

## Findings — touchpoints

**Source of truth (`.bkit/core/`):**

- `.bkit/core/workflows/bkit-build.md` — Step 3 heading, sub-steps and both `steps finish --number=3` calls; Step 4 heading, route and `--number=4`; every later `## Step N —` heading and `--number=N`; the cross-references ("Step 5", "Step 6", "Steps 6-8", "Step 7", "Step 8", "Step 10", "Step 11", "Step 12", "Step 15"); the **Resume** contract; **Failure Path** `--step-number={N}`; **Decision Pause** routes ("→ Step 6 / 8 / 11 / 12").
- `.bkit/core/engine/commands/workflow/step-table.ts` — the `build` rows' `number` / `title` / `resumeAt` (`build-plan-convert` at 3 with `resumeAt: build-branch-sync`, `build-branch-sync` at 3, `build-plan-current` at 4, every later row) and its comments. `workflow-shape.test.ts` holds this table to the workflow's headings and `--step=` calls.
- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` — `section(build, /Step 3 — Branch Sync/)` assertions (plan-check ordering, the convert dispatch, `markers`, the `newerThanPlan` route, `workflows input` absent from Step 3) and any other `## Step N —` matchers.
- `.bkit/core/.bkit/workflows.md` — the build step table (`2 —`, `3 —`, `4 —`, `7 —`, …), the `@bkit-build-plan-convert` / `@bkit-build-plan-current` agent rows (`:683`), the anchor note (`:626`) and the "No plan" note (`:1429`).
- `.bkit/core/prompts/bkit-build-plan-convert.md` — any step reference; its "No anchor authoring" rule if the Plan Current decision changes.

**Generated mirrors (regenerated, never hand-edited):** `.bkit/workflows.md`, `.bkit/pipeline.md`, `.bkit/instructions.md`, `.claude/commands/bkit-build.md`, `.cursor/commands/bkit-build.md`, `.opencode/commands/bkit-build.md`, `.agents/skills/bkit-build/SKILL.md`, `.agents/plugins/bkit/skills/bkit-build/SKILL.md`, `dist/`.

**Tests and snapshots:** `.bkit/core/engine/render/__snapshots__/bkit-build.*.txt`, `.bkit/core/engine/commands/workflow/steps.test.ts`, `.bkit/core/engine/commands/step-table.test.ts`.

**Docs / ledgers:** `docs/knowledge.jsonl` (`plan-line-anchors-…` references "Step 4 — Plan Current"), `docs/testing.md`.

## Acceptance criteria

- A `/bkit-build` on an issue with no plan posts a **Plan Convert** comment under the Plan Convert step's own number, and the following comments are Branch Sync, Plan Current, Install Skills, … in order.
- A run whose plan is already valid (no conversion) posts no Plan Convert comment.
- A run whose plan is converted posts a **Plan Current** comment — a "skipped (no plan anchor)" comment when `anchor-read` exits 12.
- No comment heading reads `Step N — Branch Sync` for the convert step.
- No number is reused for two different steps (except the intended pairs: Plan Verify + Group Gate at one number; the Decision Pause carrying its paused step's number).
- `workflow-shape.test.ts` and `step-table.ts` agree with the workflow headings and `--step=` calls; `pnpm test`, `pnpm typecheck`, `pnpm lint:prose`, `pnpm format:check` pass; `dist/` rebuilt; mirrors regenerated and consistent.

## Edge cases

- A run resumed mid-step: the **Resume** contract keys on step names, so `step-table.ts` numbers and `resumeAt` targets move with the headings and a resume still lands on the right step.
- The convert retry (`CONVERT_RETRY`) posts once per attempt with `- Attempt: n`; a second attempt keeps the Plan Convert heading and number.
- A converted plan still carries no `bkit:anchor`: Plan Current's comment must say skipped, and the build must not start stamping anchors — re-stamping belongs to `/bkit-plan`.
- An in-flight `IN_PROGRESS` run that started on the old numbering finishes on the bkit version it started on; `status resume` ignores rows for steps the workflow no longer has.
- Issue-less (`tracker=none` or no `ISSUE_ID`) runs post nothing, unchanged.

## Open questions

- **Plan Current when skipped:** post a "skipped (no plan anchor)" comment (recommended — smallest change, keeps "a converted plan carries no anchor"), or have the build stamp an anchor after convert so the step always runs?
- **Order:** Branch Sync then Plan Convert (recommended — keeps the docs merge before the plan work), or the reverse?
- **Renumber:** confirm shifting Steps 5-15 to 6-16 is acceptable, or keep the later numbers and only give plan-convert a fresh number.

## Out of scope

- Changing when a plan must be converted, the plan check, or the convert prompt's scope.
- Making `/bkit-build` stamp a `bkit:anchor`.
- Any other workflow's step numbering.

## References

- Issue #703 — the run this was found in.
- `.bkit/core/workflows/bkit-build.md` — Steps 3-4.
- `.bkit/core/engine/commands/workflow/step-table.ts` · `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`
- `.bkit/workflows.md` § Anchor Block, § The steps (`:874-879`), `:1429`.
