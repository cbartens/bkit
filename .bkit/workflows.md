# Workflows

> [!CAUTION]
> **Purpose:** Agent-pipeline reference — workflow conventions, execution patterns, IDE integration, subagent catalog.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Subagents are leaves — never invoke other subagents.
> - Subagents NEVER touch the tracker. Tracker MCP tools (GitHub Issues, Linear, etc.) are orchestrator/workflow-layer exclusive.
> - When you change a workflow file (`.bkit/workflows/bkit-*.md`), mirror change here.

## File Layout

Canonical source lives in `.bkit/workflows/`. `bkit install` regenerates `.claude/commands/` (byte-identical) and `.cursor/commands/` (T1/T2/T3 transformed). Never edit the generated copies.

```
.bkit/workflows/
├── bkit-design.md         # Workflow 1/6 — 10 steps; hard stop after summary
├── bkit-plan.md           # Workflow 2/6 — 11 steps; hard stop after summary
├── bkit-build.md          # Workflow 3/6 — 18 steps; CI takes over after PR
├── bkit-debug.md          # Workflow 4/6 — 10 steps; normal / soak modes
├── bkit-ship.md           # Workflow 5/6 — 13 steps; merge → archive → In Review (human closes)
├── bkit-audit.md          # Workflow 6/6 — 7 steps; hard stop after summary
├── bkit-auto.md          # Utility — phase-routed cloud dispatch (ship/debug by CI; design/plan/build by dispatch)
├── bkit-worktree-sync.md  # Utility — human-triggered; merge worktree branch into IDE branch
└── bkit-worktree-prune.md # Utility — human-triggered; remove worktree(s) and optionally branch
```

<!-- prettier-ignore -->
| Command | FID-driven | Hard stop | Output |
| --- | --- | --- | --- |
| `/bkit-design` | yes | yes | `docs/plans/{YYYYMM}/{FID}-design.md` |
| `/bkit-plan` | yes | yes | `docs/plans/{YYYYMM}/{FID}-plan.md` (+ `{FID}-plan-N.md` if SPLIT) |
| `/bkit-build` | yes | no — CI continues | PR to `dev` with plan-link URL |
| `/bkit-debug` | yes | no | Remediated commit pushed to feature branch |
| `/bkit-ship` | yes | yes | Squash-merged PR; plans canonical at `docs/plans/{YYYYMM}/` (no archive move — `{YYYYMM}` = creation month); worktree gone |
| `/bkit-audit` | yes | yes | `docs/audits/{FID}-audit.md` + one Linear sub-issue per workstream |
| `/bkit-auto` | args `{PHASE} {ARG}` (`{ARG}` = PR for ship/debug, issue for design/plan/build) | n/a (dispatches into the matching `/bkit-{phase}`) | Phase-routed; same session continues into the dispatched skill |
| `/bkit-worktree-sync` | arg `{FID}` | n/a (interactive) | Merged or rebased commits in current branch |
| `/bkit-worktree-prune` | optional arg `{FID}` | n/a (interactive) | Deleted worktree (and optionally branch) |

## Workflow Authoring Rules

`.bkit/workflows/*.md` are AI-only execution surfaces. Every byte is paid on every run.

- **Instructions only:** NO rationale, NO parentheticals explaining "why", NO "we don't do X because Y" notes, NO inline comments justifying behaviour.
- **Removal = delete:** When dropping an instruction, delete it. NEVER replace it with an explanation of the removal.
- **No internal labels, no coined guard names:** NEVER cite a bkit-internal identifier (`DE-25`, `EC-1`, `KN-11`, `#261`) in a workflow file — consumers receive the workflow and not the doc that defines the label, so it reads as an unexplained token. Do NOT swap it for a coined name either (`EC-1 pre-flight` -> `open-PR pre-flight`): a name still makes the reader hold a definition. Drop the label; the step's own lead-in says what it does. The label belongs here.
- **Bash decides, prose routes:** where a fenced block determines something, the prose after it branches on the **exit code** (`**If** exit non-zero → **Failure Path**.`) — NEVER on a restatement of the domain condition (`**If** an open PR exists → …`), which invites the orchestrator to re-derive what the block already resolved. A constraint the block enforces internally is stated imperatively on the lead-in (`— NEVER onto a branch with an open PR:`), not as an `**If**`.
- **Self-contained:** Each workflow file MUST stand alone. NO cross-references to `.bkit/workflows.md` or other meta docs. If the orchestrator needs the rule, inline it; if it doesn't, leave it out.
- **Sibling-blind subagent Context:** `Context:` strings stay generic — agent prompts handle their own lens via Process. Canonical phrasings: "You are a subagent in the {Phase} phase running in parallel with N other agents"; for reconcilers, "Inputs carry distinct lenses — merge across them, max-wins on CRITICAL findings".
- **Rationale lives here:** Decisions, trade-offs, history, meta-commentary belong in this file (`.bkit/workflows.md`) — NEVER in the per-workflow files.
- **Reuse wording and formatting:** ALWAYS `grep .bkit/workflows/` before writing. Copy closest existing phrasing AND formatting verbatim (backticks, indentation, line breaks, punctuation, spacing, etc). Match existing shape exactly for any sections that appear more than once (subagent invocations, gate checklists, `bash` blocks, comment fences, etc).
- **Cross-workflow alignment:** ALWAYS change shared lines in ALL workflows using them.
- **Procedural conditionals:** Any flow-gating conditional uses bold `**If** {condition} → {action}.` (with `**Else** → {action}.` for branches), regardless of syntactic shape. Test: if reordering reads as "If {X}, {Y}" naturally, it IS one. Excludes inline qualifiers (`if any`, `if defined`), dispatch tables (`PASS = …`, `STANDARD → …`), iteration (`For each …`), bash inside backticks, and output-template placeholders.
- **Labeled decision blocks:** A conditional decision with 2+ branches is a labeled heading-row + `-` bullet sub-points (one branch per bullet) — NEVER inline on one line, NEVER spread across numbered sub-steps. Two labels: `Route:` (branch to a next Step / Failure Path) and `Decide \`VAR\`:` (select a value for a variable). Single-branch guards (`**If** {X} → **Failure Path**`) stay inline.
- **ASCII operators:** Use ASCII comparison/logic operators only — `!=`, `>=`, `<=`, `=>` — and `x` for "times"/dimensions. NEVER Unicode math glyphs (not-equal, greater-or-equal, less-or-equal, implies, multiplication). The flow-arrow `→` in procedural conditionals / dispatch tables is the **sole intentional non-ASCII glyph** — deliberately kept (it is the uniform, documented flow notation used in every conditional, not a stray operator; it reads clearer than `->`, which is also overloaded as member-access). Do NOT convert `→`.
- **Variable references:** In prose, variable names / field labels / placeholder identifiers go in backticks. Two forms with distinct meaning: bare `VAR` = reference (conditionals, schema); `{VAR}` = interpolation site (orchestrator substitutes value — paths, JSON, commit msgs, Context payloads). Operators stay outside (`VERIFY_ATTEMPT` = 0). Singular literal enum values stay plain when compared (**If** `VERDICT` = PASS); enum unions are one backticked unit (`PASS|CONCERNS|FAIL`). Inside fenced output-format blocks: keep plain. NEVER use `${VAR}` outside bash code fences.
- **Gate items:** Each `- [ ]` gate item leads with a prose label (the thing checked); variable / placeholder names appear ONLY inside a trailing parenthetical, backticked — `- [ ] Test attempt incremented (\`TEST_ATTEMPT\` + 1)`, NEVER `- [ ] \`TEST_ATTEMPT\` incremented`(no bare var as subject). A verdict / value check that asserts BOTH extraction and validity is ONE item, never two:`- [ ] Verdict extracted and valid (\`SUMMARY_VERDICT\` in \`PASS|CONCERNS|FAIL\`)`.

## Tracker Blocks

`.bkit/workflows/bkit-*.md` source files carry the wired tracker variants inline — `github` and `linear` — so the full per-tracker behaviour (MCP call shapes, label semantics, state transitions) is visible at the call site in one place. No substitution from `.bkit/trackers.md`; the resolver only selects/strips inline blocks. Markers:

**Per-tracker pair.** Every tracker call site defines a consecutive `github` → `linear` pair (no authored `none` block — the no-tracker rendering is a single generic message):

```text
<!-- bkit:tracker github start -->
mcp__github__… call
<!-- bkit:tracker github end -->
<!-- bkit:tracker linear start -->
mcp__linear__… call
<!-- bkit:tracker linear end -->
```

At `bkit install` time the installer reads `bkit.issueTracker` from the consumer manifest, keeps the block matching the chosen tracker, and drops the other when mirroring to `.claude/commands/bkit-*.md` and `.cursor/commands/bkit-*.md`. Under `none` the whole pair collapses to **`_No tracker connected, skip step._`**. A list-number prefix (`3. `) is preserved on the kept block / stub. A handful of sites that must still function without a tracker (`issue-id-extraction`, `fid-format`, `pr-body-marker`, `pr-body-metadata`) add a trailing `<!-- bkit:tracker false start/end -->` block right after the pair, which is used under `none` instead of the generic message.

**Conditional blocks (`bkit:tracker true` / `bkit:tracker false`).** Boolean tracker-presence gates for tracker-agnostic content (no per-tracker body): `true` is kept when a tracker is connected and **removed entirely under `none`** (used for shared content like comment `{BODY}` fences, identical for github/linear); `false` is kept ONLY under `none`. A removed block consumes its leading newline so no blank gap remains.

A `github`/`linear` pair is only for content whose **call genuinely differs**. When the two bodies would be **byte-identical** (same text/call for both trackers), use a single `true` block instead — duplicating identical content as a pair is redundant. Enforced by a test (`bkit-trackers.test.ts` — "no identical github/linear pair"). Note the `none` difference: a pair collapses to the `_No tracker connected, skip step._` stub, whereas a `true` block is removed outright — so only use `true` where the content can vanish under `none` (inline notes, gate items), not where a standalone numbered step needs a stub to keep its number.

```text
<!-- bkit:tracker true start -->
… shared content (kept when wired; removed under none) …
<!-- bkit:tracker true end -->
```

**Hoist shared content out of the blocks — but only at `false`-block sites.** Text identical across the variants belongs on the numbered step line, with only the genuinely per-tracker part inside the blocks (`issue-id-extraction` keeps just the extraction patterns + create call; `fid-format` keeps just the assert regex). Every byte inside a pair is authored two or three times and drifts independently.

The limit is the `none` rendering. A bare `github`/`linear` pair collapses to `_No tracker connected, skip step._`, so anything hoisted above it survives as prose introducing a step that then says "skip" — a `{QUERY}` definition with no search, a "NEW comment" instruction with no comment. Hoist only where a trailing `false` block supplies a real `none` body (`issue-id-extraction`, `fid-format`, `pr-body-marker`, `pr-body-metadata`); at pair-only sites keep the shared text inside both blocks so the whole step vanishes cleanly. This is why the issue-scan `{QUERY}` prefix and the `— NEW comment, no edit.` suffix stay duplicated.

Re-runnable: source workflows carry the wired variants; switching trackers (`--tracker=linear` after `--tracker=github`) operates on the same source, producing fresh mirrors. The resolver reports a lone `github`/`linear` block or an unbalanced `true`/`false` pair as an orphan — silent regressions unacceptable. New tracker call site → add the `github`/`linear` pair inline (no `trackers.md` edit; add a `none` block only if the step must do something specific without a tracker). `.bkit/trackers.md` is reference-only (marker contract + cross-cutting per-tracker conventions); it is not a substitution source.

**Rationale rehomed from the workflow files** (stripped there per § Workflow Authoring Rules; kept here):

- **`git push --force-with-lease` on the personal branch:** the Step 2 `git rebase origin/dev` rewrites SHAs, so a plain push is non-fast-forward. Mirrors `rules.md` § Force push. Never applies to `dev` / `main`.
- **`BKIT_VER` reads `pinnedVersion`, not `version`,** and takes the `[ -z … ] &&` fallback rather than a piped one: a pipeline's status is its LAST command's, so a `| tr … || echo` fallback never fires on a failed grep.
- **`deferrals` / `failures` on the ship `outcome` row are a CUMULATIVE count of DISTINCT `key`s, not lines:** rows update by appending a same-`key` row (§ Updating a Row in `.bkit/jsonl.md`), so `wc -l` double-counts a deferral the moment triage closes it. Readers derive this cycle from the delta against the previous outcome row — see `newFailuresThisRun` in `bkit-analysis.ts`.
- **CI-Dispatch kernel constants:** `POLL_BUDGET_S` / `POLL_INTERVAL_S` give ATTEMPTS = BUDGET / INTERVAL = 6. `poll_decide` echoes `found` / `none` / `err` and never `set -e`s out. Self-heal is capped at 1 and asserts the re-trigger suffix matches the close-workflow suffix. The `ciDispatch` verdict is always written onto the step-done record as an additive field.
- **Open-PR pre-flight (EC-1 in #261):** a blind `gh pr create` on a branch with an existing open PR errors, triggers retry, then Failure Path — so build detects it first. Idempotent-resume (reuse the existing PR instead of Failure Path) is not built.
- **Build's close-workflow push does not trigger CI** — no PR exists yet; `gh pr create` on the pushed HEAD is the single CI-triggering event.
- **Design / plan close on a HARD STOP** because the phase requires human review before the next phase runs.
- **No archive step in ship:** plan/design artifacts are written to canonical `docs/plans/{YYYYMM}/` at design start, so there is nothing to move at close.
- **Debug's three attempt counters are mode-matched pairs** — DE-25, DE-36.

**Per-tracker operational notes** (rationale kept here, not in the workflow files per § Workflow Authoring Rules):

- **Related-issues scan** (issue-scan): a numbered step at design ideate-entry, plan-generate entry, and debug fetch-context, authored as a `github`/`linear` pair so under `none` it collapses to the standard `_No tracker connected, skip step._` (number preserved) — without a tracker there is no scan and no `related-issues.md` / `debug-context-related` file. Best-effort: a broad keyword search (title+body, all states open+closed, recency-sorted) — fetch 15, drop the workflow's own issue, keep the first 10 — with one `get_comments` / `list_comments` fetch per kept hit; writes `Search unavailable.` on error/timeout; never gates and never auto-expands scope (the content is advisory — dedup / conflicting-design avoidance / prior-incident awareness). All states because the strongest dedup/recurrence signals are closed: an already-shipped feature or an already-resolved incident. The file holds, per hit, a `## #{number} — {title} ({state})` section with the issue body + every comment verbatim (rich context for the synthesiser, not just refs — issue comments carry most of the signal); no redundant top-level heading. Design + plan write `related-issues.md`, read back by `bkit-design-generate` / `bkit-plan-generate` as an `(if present)` input that informs the design/plan and is condensed to a one-line `- #N — title (state)` ref list in `## Related Issues` (else `None`) — no marker gating needed since the prompt tolerates absence. Debug writes `debug-context-related-${DEBUG_ATTEMPT}.md` in the same shape, picked up by `bkit-debug-failure-diagnose` via its `debug-context-*` glob (excluded from `FETCH_VERDICT`). Plan runs its own fresh scan rather than consuming the design's so a standalone plan (no design) is still covered.
- **Projects v2 board sync** (`issue-update-status`): best-effort — never gates; on failure the workflow retries once after 5s then continues. The `update_project_item` call needs the numeric `item_id`, NOT the node id returned by `add_project_item` — hence the intervening `projects_list` resolve step. The status `value` is the single-select **option id** (e.g. `47fc9ee4`), not the option name. Linear has no separate board (issue state carries the status) → its `issue-update-status` is a no-op.
- **Blocked-by edges:** GitHub Issues have no native `blockedBy` field → encoded via a `<!-- bkit:blocked-by -->` marker block in the issue body. Linear has a native `blockedBy` (append-only; re-runs with unchanged edges are no-ops).
- **Workstream milestone assignment (design Step 9):** a `MILESTONE`-labelled parent groups its workstream issues under a native milestone, NOT as sub-issues. The parent must already carry the target — GitHub milestone / Linear project + project milestone — because the MCP servers cannot create one (GitHub exposes only an assign-by-number `milestone` param; no create/list milestone tool), so an unset target is a Step 9 Failure Path (assign it on the parent first). Each workstream is created assigned to the same target: GitHub `issue_write` `milestone` (number, read from the parent via `issue_read` get → `milestone.number`); Linear `save_issue` `projectId` + `projectMilestoneId` (read via `get_issue` → `project.id` / `projectMilestone.id`). Existing-workstream detection no longer walks a sub-issue tree — GitHub `search_issues` `milestone:"{title}" in:title WS-` (subject to search-index lag, best-effort, never gates), Linear `list_issues` filtered by `projectId` + `projectMilestoneId`; matched by `^WS-N:` title prefix. `Requires` → block-by edges are unchanged (`set-blocked-by`).
- **issue-update-review** (phase-close hand-off): **update state only — never change a label on close.** GitHub: no-op (the `issue-update-phase` phase label carries the signal until ship's `issue-update-merged`). Linear: `save_issue({ id, state: "In Review" })` — no `labels` param (partial update; sending `labels` full-replaces and would drop additive labels like `bkit:auto`/`bkit:debug`).
- **issue-update-merged** (ship terminal): bkit **never auto-closes / never sets Done**. Ship drops the phase labels, adds `bkit:merged`, and moves the issue to **In Review** — Linear `state: "In Review"`, GitHub left **open** (the board, if wired, goes to the review option, not done). A human reviews the merged change and closes the issue manually. Rationale: a merge is not an acceptance — a person should confirm the shipped result before the issue is considered done, so closing stays a deliberate human act.

## Two-Layer Separation Rules

> **Agents NEVER call tracker MCP tools.** Tracker MCP tools (`mcp__github__issue_*`, `mcp__linear__*_issue`, `*_comment`, `list_issues`, etc.) are exclusive to the workflow layer. Agent that calls a tracker is a protocol violation.

<!-- prettier-ignore -->
| Capability | Workflow (`.bkit/workflows/`) | Agent (`.bkit/prompts/`) |
| --- | --- | --- |
| Invoke tracker MCP | ✅ | ❌ |
| Read/write `docs/` | ✅ | ✅ |
| Read/write source | via subagent delegation | ✅ (gated by tool surface) |
| Run `git` | ✅ (`add`, `commit`, `push`, worktree ops) | read-only checks (`status`, `branch`, `log`) only |
| Invoke subagents | ✅ via `@agent-name` (Agent tool) | ❌ leaves only |
| Write `status.jsonl` / hold `.lock` | ✅ | ❌ |

**Why:** agent must be runnable standalone (`@bkit-build-challenge .worktrees/xxx-123` works without a live tracker issue). All inputs arrive via filesystem paths from orchestrator. All outputs land on disk under `docs/plans/{YYYYMM}/logs/{FID}/`, plan/design doc, source files, or structured docs at `docs/{knowledge,decisions,completed,pending}.md`. Workflow reads agent outputs and decides what (if anything) to mirror to the tracker.

## Common Workflow Anatomy

Every phase command (`design`, `plan`, `build`, `debug`, `ship`) follows the same skeleton:

```
1. YAML frontmatter (description)
2. Header (output)
3. Execution Protocol caution block (canonical invariants — see below)
4. Failure Path
5. Step 1 — Start Workflow         (fetch `origin/dev`, lock acquire, tracker init, first-step comment post — status init deferred to Step 2; ZERO commits on `dev`)
6. Step 2 — Worktree Setup         (create/resume .worktrees/{FID}, copy env, pnpm install, save input, status init + `start-workflow` + `worktree-setup` step entries committed on `feat/{FID}`)
7. Phase-specific steps            (subagent invocations, gates, per-step new comment post)
8. Summary step                    (subagent → commit → push → verdict)
9. Close Workflow                  (status done, lock release, state → hand-off via `issue-update-review`; ship terminal `bkit:merged` + In Review via `issue-update-merged` (issue left OPEN — human reviews + closes); non-ship phases update state only, phase label unchanged; **final return** = verbatim `{phase}-summary.md` to user as the last action)
```

**Step convention:** every step ends with `### 🔒 Gate N — {Step Name}` checklist (must verify before proceeding), and posts a NEW tracker comment with one fenced section (see § Comment Lifecycle).

**Managed-version marker:** the renderer injects `<!-- bkit:managed vX.Y.Z — do NOT edit; run \`bkit upgrade\` to refresh -->`(one blank line below) after the frontmatter for claude commands, or at the top for cursor/opencode commands whose transforms strip the frontmatter. Stamped at`bkit install`/`upgrade`render time by`stampManagedVersion`— NEVER add a version line to a source workflow.`bkit check`flags`bkit-rendered-prompts-stale`when a rendered marker drifts from the installed version — a hard-failing blocker on`main`/`dev` (or a PR into them), a non-blocking advisory on feature branches (the drift is inherited from the base, not created by the branch) — so consumers cannot silently run outdated workflows on a protected branch.

**Pre-worktree git scope:** Step 1 and Step 2's pre-worktree guard run on the originating branch (often `dev`). Allow-list `git add docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl` only (FID-scoped — NEVER the whole `docs/plans/` tree, which sweeps a concurrent run's untracked status under another `{FID}`); guard the commit with `git diff --cached --quiet ||`. NEVER `git add -A` until after `cd "$WORKTREE_PATH"` — it sweeps the user's unrelated in-flight edits into the workflow commit, which then rides feat → dev on merge. Post-worktree (Step 3+) `git add -A` is fine; cwd is the sandbox. `git worktree add` does not inherit dirty state, so leaving other edits on dev's working dir is correct.

**Worktree isolation (no Step 1 dev sync gate):** ALL phase workflows (`design`, `plan`, `build`, `debug`, `ship`) Step 1 makes ZERO commits on `dev` and does NOT assert local `dev` is in sync with `origin/dev`. Step 1 only `git fetch origin dev`; workflow work runs in `.worktrees/{FID}` on `feat/{FID}` (or `fix/{FID}` for debug), rebased against `origin/dev` in Step 2. Local `dev` ahead-of-`origin/dev` is irrelevant at start — Close Workflow reconciles with `origin/dev` at merge time (`git pull --ff-only origin dev` before squash-merge for design/plan; ship Step 9 re-checks only when switching to `dev` post-merge). Rationale: blocking start on unpushed local `dev` commits forces manual intervention before any isolated work can begin; those commits do not affect the worktree branch until Close merges back.

**Branch placement:** `design`/`plan`/`build`/`debug` write + commit `status.jsonl` on `feat/{FID}` (the worktree) with NO mid-lifecycle `dev` push — state reaches `dev` once via the Close squash-merge (`design`/`plan`) or ship's PR squash-merge (`build`/`debug`); `ship` writes Steps 1-8 on `feat/{FID}` and Steps 9-13 on `dev`; `cloud` is a stateless dispatcher — it writes NO `status.jsonl` (its run is recorded only by the tracker comment). See § `status.jsonl` — workflow state SoT for the full table, event model, and fold.

### Execution Protocol — canonical invariants

Lifted verbatim into every workflow's caution block. If you change one wording, change all five workflow files.

<!-- prettier-ignore -->
| Invariant | Rule |
| --- | --- |
| **Order** | Execute sequentially unless step explicitly says "in parallel". |
| **Placeholders** | Assert `{FID}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{PR_NUMBER}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}` non-empty before any tool call → else **Failure Path**. `{OWNER}` + `{REPO}` derived from `{OWNER_REPO}` at Step 1. |
| **Tools** | Verify every return; do NOT assume success. |
| **Subagents** | Invoke via `@name` with Agent tool. Orchestrator provides Read paths and context; subagent executes and writes directly. **PROHIBITED:** inlining subagent steps or producing artifact yourself — same filenames/conclusions != compliance. |
| **Artifacts** | `Write:` artifact IS the deliverable; always emit; assert non-empty; empty → **Failure Path**. |
| **Gates** | Verify all checkboxes before next step. Skipped gate = invalid work. |
| **No improv** | No ad-hoc task lists, no skipping, no alternative approaches, no scope beyond the file. |
| **Narrate** | Emit user-visible lines at key points (step start, subagent return, pivot, blocker). Silence between actions = compliance regression; Auto-apply does NOT mean silent. |
| **Git** | Pre `add`/`commit`: log `git status --short`; NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Pre `push`: assert `{BRANCH}` non-empty. |
| **Worktree** | Step 2 `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. If any later step finds `pwd` outside worktree → **Failure Path**. |
| **Status** | `status.jsonl` (append-only NDJSON event log) is the state file; placement per § `status.jsonl` (design/plan/build/debug→`feat/{FID}`; ship→`feat/{FID}` then `dev` post-merge; `cloud` writes none). Fold the log to derive the run array; `parentSha` captured at step START. |
| **Resume** | On start, fold status.jsonl and pick up after last `done` step in active `in_progress` workflow. |
| **Labels** | Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:ship`, `bkit:merged` mutually exclusive — drop old phase before adding new. `bkit:failed` (Failure Path), `bkit:debug` (Debug Workflow), `bkit:auto` (cloud CI-mode trigger gate) are additive — added without dropping phase (see § Tracker Integration). |
| **Comments** | NEW comment per workflow step via tracker MCP. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content (see § Comment Lifecycle). |
| **Failures** | Any step, tool, command failure, or gate that cannot pass → **Failure Path**. |
| **Timeouts** | Any workflow or subagent run > 3600 seconds → **Failure Path**. |
| **Locks** | Acquire `.lock` in Step 1 right after `mkdir -p` of logs dir. Lock path is **absolute** (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock`, anchored to main repo working tree via `git rev-parse --path-format=absolute --git-common-dir`) so acquire/release resolve to the same inode regardless of cwd. Existing lock → Step 1 cross-checks its owning workflow's folded status.jsonl: `DONE`/`FAILED` → clean silently; `IN_PROGRESS` + last step <30min → Failure Path with `Workflow already running for {FID}`; `IN_PROGRESS` + last step >=30min → stale, clean. Released in Close Workflow and Failure Path; **both must assert the lock file is absent before exiting** (else Failure Path with `Lock removal failed`). |
| **Dev lock** | Repo-global `$REPO_ROOT/.bkit/.dev.lock` (gitignored), held ONLY across a **dev critical section** — any block that checks out, stages, commits, or pushes `dev` in the **main checkout**. Scope is cross-FID: the per-FID `.lock` guards two runs of the SAME feature, but concurrent runs of DIFFERENT features share `dev`, the main working tree, `.git/config` and `.bkit/stats.jsonl`, and corrupt each other with no per-FID contention. Sites: `design` + `plan` close-workflow squash; `ship` Step 6 (pre-merge dirty-dev), Step 9 (switch-to-dev), Step 13 (close), Failure Path. `build`/`debug` have none — they close via PR and never touch `dev`. Acquire is atomic (`set -C` = `O_EXCL`; a plain `>` truncate-creates and cannot arbitrate). Release via `trap 'rm -f "$DEVLOCK"' EXIT` so every `exit 1` inside the section releases. Holder line is `{ISO} {workflow} {FID}` — reported verbatim on contention. Worktree-phase work stays fully parallel; only the dev sections serialise. |

| **Artifact tree** | A subagent's artifact is asserted **under the working directory its dispatch supplied** — `{WORKTREE_PATH}` for worktree-phase agents, the main checkout for ship's deferred-sweep / update-docs / summary agents. The subagent's reported path is not evidence: the `cd` + `pwd` line in the dispatch Context is prose, and agents have written to the main checkout despite it. design/plan additionally assert no `{FID}` artifact is left untracked in the main checkout before the close squash — an untracked file at the same path makes `git merge --squash` fail with `untracked working tree files would be overwritten`. |
| **Main-checkout staging** | Every `git add` **and** `git commit` that targets the main checkout carries an explicit pathspec. `add` alone is not enough: a pathspec-less `git commit` commits the **whole index**, sweeping work a user staged themselves. Worktree-phase `git add -A` is unrestricted — that tree holds only this feature's work. |

### `status.jsonl` — workflow state SoT

`docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` is the canonical workflow-state source of truth: an **append-only NDJSON event log** (one JSON event per line; prior lines NEVER mutated). Written by workflows only; agents MUST NOT read or write it. Enables resume of an interrupted run without re-reading the plan. Current state is derived by **folding** the log (see Fold below); the canonical reducer is `.bkit/src/bkit-status.ts` (`fold` / `parseStatus`, unit-tested in `bkit-status.test.ts`), and each workflow inlines a jq filter that mirrors it.

**Why an event log + `merge=union`:** the prior single `status.json` (a mutated JSON array) for one FID was committed on **both** `dev` (design/plan/build dev commits) and `feat/{FID}` (per-step worktree commits) → divergent content on the same path → the feature PR became unmergeable → GitHub never built `refs/pull/N/merge` → `pull_request` CI never ran (a `dev`-push status commit could also become the PR-branch tip and suppress CI). Append-only NDJSON + `docs/plans/**/status.jsonl merge=union` (`.gitattributes`, template at `.bkit/templates/.gitattributes` — path-scoped, NOT a blanket `*.jsonl`) lets git concatenate both branches' appended lines **server-side** — the per-FID log can never block a merge. Union may interleave or duplicate lines, so the reader de-dupes by `(workflow, step, parentSha, at)` and orders by `at` before reducing.

**Branch placement (§3):**

<!-- prettier-ignore -->
| Workflow | Location | Mechanism |
| --- | --- | --- |
| `build`, `debug` | `feat/{FID}` worktree (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`) | Written + committed on `feat/{FID}` via the per-step commits. NO mid-lifecycle `dev` push (Close or Failure Path). State reaches `dev` once, at ship's PR squash-merge. |
| `design`, `plan` | `feat/{FID}` worktree (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`) | Written + committed on the throwaway `feat/{FID}` via the per-step commits — exactly like `build`/`debug`. NO mid-lifecycle `dev` push; status + generated docs reach `dev` together via the **Close-Workflow squash-merge** (`docs({FID}): {phase} DONE`). Failure Path appends `workflow-failed` to the retained worktree copy (no `dev` push); the tracker comment carries the failure signal. |
| `ship` | Steps 1-8 on `feat/{FID}` (worktree); Steps 9-13 on `dev` (`$REPO_ROOT/...`) post-merge | Steps 1-8 commit on `feat/{FID}` (reach `dev` via the Step-6 squash-merge); Steps 9-13 append to dev's copy. Ship is terminal, so its `dev` commit + push (Close / Failure Path) is the legitimate state landing. |
| `cloud` | — (none) | Stateless phase dispatcher — writes NO `status.jsonl` and makes no `dev` commit; the run is recorded only by its tracker comment. The dispatched skill owns its own state/FID/worktree. |

Rationale: relocating per-run state onto `feat/{FID}` removes the dev↔feat divergence at its source; the NDJSON+union change makes it merge-safe regardless. `design`/`plan` write status on their throwaway `feat/{FID}` worktree exactly like `build`/`debug` — status and generated docs travel together and reach `dev` via the single Close squash-merge, so the only thing hard-coded to `dev` is the doc-link URLs in tracker comment blocks. `cloud` is a pure dispatcher — no worktree, no state: it writes no `status.jsonl` at all (the tracker comment is its only record). The design/plan close-workflow `dev` commit is the substantive feature commit and runs CI. (`audit` is not yet built; per its design it will follow the design/plan feat-located pattern.)

**Event types (one per line):**

<!-- prettier-ignore -->
| Event | Shape | Meaning |
| --- | --- | --- |
| `workflow-started` | `{type, workflow, at}` | Opens a new run of a phase workflow. |
| `step-done` | `{type, workflow, step, status, at, parentSha, artifacts, verdict?, attempt?, subPlan?, failures?, strategy?}` | One completed step (the bulk). |
| `workflow-meta` | `{type, workflow, at, …fields}` | Workflow-level metadata merged onto the run (e.g. `debugAttempt`). |
| `workflow-done` | `{type, workflow, at}` | Terminal — sets the run's `status` to `DONE`. |
| `workflow-failed` | `{type, workflow, at}` | Terminal — sets the run's `status` to `FAILED`. |

`workflow` ∈ `design`/`plan`/`build`/`debug`/`ship`/`audit`; `step` is a kebab slug (`build-run-tests`, `plan-verify`); `parentSha` = `git rev-parse HEAD` at step START (before any commit the step produces, forensic only); `verdict` ∈ `PASS`/`CONCERNS`/`FAIL`; `strategy` ∈ `STANDARD`/`PIVOT`/`FINAL`; `artifacts` are `docs/plans/{YYYYMM}/logs/{FID}/...` paths (or PR URL). Cross-field: when `failures` present, `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0` (`validateInvariants` in `bkit-status.ts`).

**Fold** (NDJSON events → run array). De-dupe by identity (`step-done`: `(workflow, step, parentSha, at)`; workflow-level: `(type, workflow, at)`), keep first occurrence, order by `at`, then reduce: `workflow-started` pushes a run; `step-done` appends the bare step (routing fields stripped) to the latest run of that workflow; `workflow-meta` merges fields onto it; `workflow-done`/`workflow-failed` set its `status`. Canonical reducer = `bkit-status.ts`; each workflow inlines a one-line jq filter byte-equal to it.

**Append / read patterns** (every workflow uses these; `$STATUS` resolves per the branch-placement table — `$(git rev-parse --show-toplevel)/...` on feat, `$REPO_ROOT/...` on dev):

```bash
# migrate-once: a legacy status.json array (in-flight pre-NDJSON FID) -> events
if [ -f "$DIR/status.json" ] && [ ! -f "$STATUS" ]; then
  jq -c '.[] as $w | ($w.workflow) as $wf
    | {type:"workflow-started",workflow:$wf,at:$w.startedAt}
    , ($w.steps[] | {type:"step-done",workflow:$wf} + .)
    , (if $w.status=="DONE" then {type:"workflow-done",workflow:$wf,at:($w.steps[-1].at // $w.startedAt)}
       elif $w.status=="FAILED" then {type:"workflow-failed",workflow:$wf,at:($w.steps[-1].at // $w.startedAt)}
       else empty end)' "$DIR/status.json" > "$STATUS"
fi
[ -f "$STATUS" ] || : > "$STATUS"

# start a run only if one is not already in progress (FOLD = the inlined fold filter)
LATEST=$(jq -s "$FOLD"' fold | (.[-1] // {}) | {workflow, status}' "$STATUS")
if [ "$(echo "$LATEST" | jq -r '.workflow // ""')" != "build" ] \
   || [ "$(echo "$LATEST" | jq -r '.status // ""')" != "IN_PROGRESS" ]; then
  jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-started", workflow:"build", at:$t}' >> "$STATUS"
fi

# append a step (parentSha captured BEFORE the step's commit, if any)
PARENT_SHA=$(git rev-parse HEAD)
jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$VERIFY_VERDICT" \
  '{type:"step-done", workflow:"build", step:"verify-plan", status:"DONE", verdict:$v, at:$t, parentSha:$p, artifacts:["..."]}' \
  >> "$STATUS"

# close (two lines): final step-done, then workflow-done
jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-done", workflow:"build", at:$t}' >> "$STATUS"

# Failure Path
jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-failed", workflow:"build", at:$t}' >> "$STATUS"
```

**Resume rule:** read the run array via `jq -s "$FOLD"' fold | …'`. For `design`/`plan`/`build`/`debug`/`ship` prefer the `feat/{FID}` worktree copy when it exists (`SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"`), else the dev copy. (`cloud` writes no status.) `status=IN_PROGRESS` → resume after last `DONE` step (re-run if its gate artifacts missing on disk). `status=DONE`/`FAILED` → start a new run. A legacy `status.json` (no `.jsonl` yet) is read as an already-folded array (see `parseStatus`).

### Concurrency lock

`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` is plain text file holding `{ISO_TIMESTAMP} {workflow}`. Path is **absolute** (anchored to main repo via `git rev-parse --path-format=absolute --git-common-dir`) so acquire and release resolve to the same inode whether cwd is the main repo or a worktree. Acquired in Step 1 right after `mkdir -p`; released in Step N (Close Workflow) and in Failure Path; both must assert the lock file is absent before exiting.

```bash
REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
mkdir -p "$REPO_ROOT/docs/plans/logs/{FID}"
LOCK="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock"
STATUS_REL="docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
if [ -f "$LOCK" ]; then
  LOCK_WORKFLOW=$(awk '{print $2}' "$LOCK")
  SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"
  LAST=$(jq -s --arg w "$LOCK_WORKFLOW" "$FOLD"' fold | [.[] | select(.workflow==$w)] | last' "$SRC" 2>/dev/null || echo 'null')
  LAST_STATUS=$(echo "$LAST" | jq -r '.status // ""')
  LAST_AT=$(echo "$LAST" | jq -r '.steps | last | .at // ""')
  if [ "$LAST_STATUS" = "IN_PROGRESS" ] && [ -n "$LAST_AT" ]; then
    LAST_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$LAST_AT" +%s 2>/dev/null || date -d "$LAST_AT" +%s)
    IDLE=$(( $(date +%s) - LAST_EPOCH ))
    [ "$IDLE" -lt 1800 ] && { echo "Workflow already running for {FID} (workflow=$LOCK_WORKFLOW, idle ${IDLE}s)" >&2; exit 1; }
  fi
  rm -f "$LOCK"
fi
printf '%s build\n' "$(date -u +%FT%TZ)" > "$LOCK"
```

**Staleness rule:** read the owning workflow's status.jsonl via the fold (`design`/`plan`/`build`/`debug`/`ship` prefer the `feat/{FID}` worktree copy, else dev). (`cloud` holds no lock and writes no status — no staleness check applies.) `DONE` / `FAILED` status → clean silently; `IN_PROGRESS` with last step <30min idle → genuine concurrent run, Failure Path; `IN_PROGRESS` with last step >=30min idle → orphaned, clean and proceed. Lock with no matching workflow run in the folded log is treated as stale and cleaned.

### Comment Lifecycle

Every workflow step posts a NEW tracker comment via its inline `comment-post-step` tracker block (per-tracker `github`/`linear`/`none`, resolved at install; see § Tracker Blocks). NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Each step's comment is independent — no comment-ID carry-forward, no body concatenation.

**Step 1 (first comment):**

```comment
## {Phase} Workflow
### Step 1 — Start Workflow
[{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
```

**Steps 2..N (subsequent comments):**

Each step posts its own fenced section as a fresh comment.

**Standard step section (no artifact link):**

```comment
### Step {N} — {Step Name}
```

**Verdict-bearing step:**

```comment
### Step {N} — {Step Name} - Verdict: {VERDICT}
```

**Loop step (sub-plan or attempt counter):**

```comment
### Step {N} — {Step Name}
(sub-plan {N}/{SUB_COUNT}, attempt {VERIFY_ATTEMPT})
```

**Summary / handover step (artifact blob link + verbatim body):**

```comment
### Step {N} — Summary - Verdict: {SUMMARY_VERDICT}
[{phase}-summary.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/{phase}-summary.md)
{summary.md content verbatim}
```

**Failure Path comment (always appended):**

```comment
### Workflow Failure
Step: {N} — {Step Name}; Sub-step: {M}
Error: {error message / tool response}
Stderr: {last 20 lines if shell}
```

**Failure Path handover (only when max-retry exhausted, see § Failure Path):**

```comment
### Workflow Handover
[{phase}-handover.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/{YYYYMM}/logs/{FID}/{phase}-handover.md)
{handover.md content verbatim}
```

### Tracker Writes Are Best-Effort

Tracker write calls (issue update, comment post) are observability, NOT gates. NEVER block, hang, or fail a workflow on tracker write failure. Tracker reads (issue read, list comments) remain authoritative.

**Wrapper semantics — every tracker write call:**

1. Attempt the call.
2. On `rate_limited` / transient error → wait 5s, retry once.
3. On second failure → set `TRACKER_DEFERRED` = true, append the literal token `TRACKER_DEFERRED=true reason={error}` to the next workflow commit message, proceed to next step.

**Gate phrasing:** tracker-dependent gate items read as `Issue update attempted (label set X)` and `Issue comment attempted (Step N section)`. Do NOT phrase as `Issue state X set` or `Issue comment created` — those imply the write succeeded.

### Versioned Outputs

Every transformation step writes ONE new versioned file in `docs/plans/{YYYYMM}/logs/{FID}/`. Steps NEVER write the canonical `docs/plans/{YYYYMM}/{FID}-*.md` directly — the canonical artifact is populated only by close-workflow as a copy of the highest-version file. `{YYYYMM}` = canonical month bucket, decided once at first workflow start (`date +%Y%m`) and discovered by downstream workflows via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/`.

**Naming:** `logs/{FID}/{workflow}-v{N}-{action}.md` — incrementing `N`, `action` describes what produced this version. Directory conveys FID; do NOT prefix the filename.

**Step output classification** (each step picks exactly one):

<!-- prettier-ignore -->
| Type | Output shape | Example agents |
| --- | --- | --- |
| **Versioned draft** | `{workflow}-v{N}-{action}.md` containing verdict header + record + the (modified) doc body. Single file; NO separate summary. | `plan-generate`, `plan-apply-review`, `plan-apply-scope`, `plan-complexity-split`, `design-generate`, `design-apply-review`, `build-plan-verify`, `build-challenge`, `build-challenge-tests`, `debug-failure-diagnose` |
| **Opinion-only log** | `{step-name}.md` with verdict + findings; never produces a versioned draft. | `plan-review-1/2/3`, `plan-scope-check-1/2`, `plan-complexity-check`, `design-brainstorm-ideate-1/2/3`, `design-review-1/2` |
| **Summary-only** | `{workflow}-summary.md` (or `{workflow}-handover.md`); produced once at end of workflow. | `plan-summary`, `design-summary`, `build-summary`, `debug-summary`, `ship-summary`, `debug-abort-handover` |
| **Code-mutation** | NO versioned draft; step's summary log records `git diff --stat` instead of restating intent. | `build-plan-execute`, `build-plan-gaps-remediate`, `build-challenge-remediate`, `debug-failure-remediate`, `ship-update-docs` |

**Versioned chain — design** (`{YYYYMM}/{FID}-design.md` is the canonical artifact; populated only at close):

<!-- prettier-ignore -->
| Step | Output (in `logs/{FID}/`) | Type |
| --- | --- | --- |
| `design-brainstorm-1` | `design-brainstorm-ideate-1.md` | opinion-only log |
| `design-brainstorm-2` | `design-brainstorm-ideate-2.md` | opinion-only log |
| `design-brainstorm-3` | `design-brainstorm-ideate-3.md` | opinion-only log |
| `design-generate` | `design-v1-draft.md` | versioned draft |
| `design-review-1`, `design-review-2` | `design-review-1.md`, `design-review-2.md` | opinion-only log |
| `design-apply-review` | `design-v2-reviewed.md` | versioned draft |
| `design-organise` | `design-v3-organised.md` | versioned draft |
| `summary` | `design-summary.md` | summary-only |
| `design-workstream-issues` | (milestone/project issues + `blockedBy` edges) | side-effect only — no file deliverable |
| `close-workflow` (copy) | `{YYYYMM}/{FID}-design.md` | canonical (copy of v3) |

**Versioned chain — plan** (`{YYYYMM}/{FID}-plan.md` is the canonical artifact; populated only at close):

<!-- prettier-ignore -->
| Step | Path | Output (in `logs/{FID}/`) | Type |
| --- | --- | --- | --- |
| `plan-generate` | both | `plan-v1-draft.md` | versioned draft |
| `plan-review-1`, `plan-review-2`, `plan-review-3` | both | `plan-review-1.md`, `-2.md`, `-3.md` | opinion-only log |
| `plan-apply-review` | both | `plan-v2-reviewed.md` | versioned draft |
| `plan-scope-check-1`, `-2` | both | `plan-scope-check-1.md`, `-2.md` | opinion-only log |
| `plan-apply-scope` | both | `plan-v3-checked.md` | versioned draft |
| `plan-complexity-check` | both | `plan-complexity-check.md` | opinion-only log |
| `plan-complexity-split` | NO-SPLIT | `plan-v4-split.md` | versioned draft (single) |
| `close-workflow` (copy) | NO-SPLIT | `{YYYYMM}/{FID}-plan.md` | canonical (copy of v4) |
| `plan-complexity-split` | SPLIT | `plan-v4-split.md` (parent) + `plan-v4-1.md`, `-2.md`, `-N.md` | versioned working files (parent + N children) |
| `close-workflow` (copy) | SPLIT | `{YYYYMM}/{FID}-plan.md` (parent) + `{YYYYMM}/{FID}-plan-1.md`, `-2.md`, `-N.md` | canonical (copies) |

**Build / debug / ship:** doc-producing steps adopt the same `{workflow}-v{N}-{action}.md` naming inside `logs/{FID}/`. NO canonical-copy at close — those phases don't produce a canonical artifact in `{YYYYMM}/` (only plan + design do).

**Close-workflow copy semantics (plan + design only):** find highest `v{N}` matching `logs/{FID}/{workflow}-v*.md`; copy file verbatim to `{YYYYMM}/{FID}-{workflow}.md`. SPLIT case: copy parent + each numbered sibling.

### Verdict Validation

Verdict-bearing subagents (any agent that returns `PASS | CONCERNS | FAIL`) MUST emit the verdict header as the first non-blank line of their output file, BEFORE any other content. The orchestrator validates and re-issues on invalid verdicts.

**Subagent contract:**

1. Write verdict line FIRST: `Verdict: PASS | CONCERNS | FAIL` (one of the three; NEVER `PENDING`, NEVER blank).
2. Then `<!-- verdict:end -->` delimiter.
3. Then the rest of the output (record, body, etc.).

If the agent terminates mid-stream after the verdict line is written, the orchestrator gets a usable verdict + truncated body. The truncation is detectable separately (artifact length / body integrity), and the verdict signal isn't lost.

**Orchestrator contract:**

1. After subagent return, read the output file until `<!-- verdict:end -->`.
2. Extract `Verdict:` value as `{VERDICT}`.
3. Assert `{VERDICT} ∈ {PASS, CONCERNS, FAIL}`.
4. **If invalid** (missing, empty, `PENDING`, or any other value):
   - Re-issue the same subagent with a tightening prompt: "Your prior output `{file}` is missing/invalid verdict. Re-emit ONLY the verdict header (`Verdict: PASS|CONCERNS|FAIL` + `<!-- verdict:end -->`) at the top of that file. Do NOT redo the work; the body is already in place."
   - Increment a local `VERDICT_RETRY` = 1.
5. **If retry also fails** (`VERDICT_RETRY` > 1) → **Failure Path**.
6. Orchestrator NEVER synthesizes a verdict itself — that would mask truncation/budget signals that humans need to see.

**Per-step gate item (universal for verdict-bearing steps):**

```
[ ] Verdict valid ({VERDICT} ∈ {PASS, CONCERNS, FAIL})
```

### Gates

Every step ends with `### 🔒 Gate N — {Step Name}` and a checklist.

**Format:** Every gate item MUST follow `[ ] What (settings)` — verb-led clause, parenthetical for specifics. Do NOT lead with the value, the file path, or the variable list.

Canonical patterns:

- `[ ] Placeholders non-empty (X, Y, Z)` — placeholder existence
- `[ ] Subagent invoked (@{name}, no inline work)` — subagent invocation
- `[ ] Artifact written (docs/plans/{YYYYMM}/logs/{FID}/{file}.md, non-empty)` — artifact existence
- `[ ] {VARIABLE} extracted` — verdict / value capture
- `[ ] Verdict valid ({VERDICT} ∈ {PASS, CONCERNS, FAIL})` — verdict-bearing-step validation
- `[ ] Workflow status updated ({phase} {STATE}, step {step-name} recorded with parentSha[, verdict, attempt, …])` — status.jsonl mutation
- `[ ] Issue update attempted (state X, label Y)` — tracker `issue-update-*` snippet
- `[ ] Issue comment attempted (Step {N} section)` — tracker `comment-post-step` snippet

Skipped gate = invalid work. Workflow MUST verify every checkbox before advancing.

### Subagent Invocation

All subagents invoked via `@agent-name` with Agent tool. Per-step convention:

```
Context: You are a subagent in the {Phase} phase {modifier — e.g. "running in parallel with other agents"}
Read:    {paths the agent reads, read-only}
Update:  {existing paths the agent modifies in-place}        ← omit if no in-place edits
Create:  {paths the agent writes fresh, with annotations e.g. (MAX 500 token summary)}
```

Then assert each Update/Create artifact exists and is non-empty. Empty → **Failure Path**.

**Per-agent description, scope, effort tier, tool surface, and `maxTurns` calibration → see `.bkit/prompts.md`.** That file indexes every `.bkit/prompts/*.md` agent and is single source of truth for agent metadata; this file only describes how workflow layer composes them.

**Cross-platform tool surface:** subagent frontmatter `tools:` allowlist is enforced on both Claude (native) and Cursor (passthrough — Cursor 2.4+). Removing `Edit`/`Bash` makes an agent provably non-mutating on both hosts. `bkit install` T3 transform passes `tools:` through verbatim; never emits `readonly:` (Cursor honours `tools:` allowlist directly).

**Parallel fan-outs** (effort / model diversity, sibling-blind):

<!-- prettier-ignore -->
| Siblings | Used in step | Sibling-blind contract |
| --- | --- | --- |
| `@bkit-design-brainstorm-ideate-1` / `-2` / `-3` | `/bkit-design` Step 3 | Each agent's prompt forbids reading any sibling output. Triplet — pragmatic / optimal-tradeoff / risk-premortem lenses. |
| `@bkit-design-review-1` / `-2` | `/bkit-design` Step 5 | Same; pair. |
| `@bkit-plan-review-1` / `-2` / `-3` | `/bkit-plan` Step 4 | Same; triplet — tightness / dependency-correctness / regression-risk lenses. |
| `@bkit-plan-scope-check-1` / `-2` | `/bkit-plan` Step 6 | Same; pair. |
| `@bkit-ship-update-docs` / `@bkit-ship-summary` | `/bkit-ship` Step 10 | `bkit-ship-summary` MUST NOT read `update-docs.md`. |

### Verdict vocabulary

3-way `PASS | CONCERNS | FAIL` for verdict-bearing agents that have a meaningful "addressable" middle state. 2-way `PASS | FAIL` for atomic-action agents (binary outcome — succeeded or didn't):

<!-- prettier-ignore -->
| Agent | Verdict values | Routing |
| --- | --- | --- |
| `@bkit-build-plan-verify` | `PASS` / `CONCERNS` / `FAIL` | `PASS` → next sub-plan or Step 8; `CONCERNS`/`FAIL` → `@bkit-build-plan-gaps-remediate` loop (max `MAX_VERIFY_ATTEMPT` = 3 → Failure Path). |
| `@bkit-build-challenge-reconcile` | `PASS` / `CONCERNS` / `FAIL` | `PASS` → Step 13; `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11 → Step 12 → Step 13; `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Step 13; `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11 → Step 12 → re-Step 9; `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Failure Path. Findings carry `class: mechanical | architectural`; `@bkit-build-challenge-remediate` classify-gate FAILs (no fixes) when any architectural finding is present, else fixes mechanical findings. One re-Challenge bite — bounded by `CHALLENGE_REMEDIATE_ATTEMPT` < 1. |
| `@bkit-design-review-1` / `-2` | `PASS` / `CONCERNS` / `FAIL` | `REVIEW_VERDICT` = worst-of-two. `PASS`/`CONCERNS` → Step 6 apply-review; `FAIL` → Failure Path (design fundamentally not viable, human reframe required). |
| `@bkit-design-update` | `PASS` / `CONCERNS` / `FAIL` | All paths continue to Step 7 design-organise; CRITICAL items applied, OPTIONAL applied on consensus, OUT-OF-SCOPE deferred. |
| `@bkit-design-organise` | `PASS` / `CONCERNS` / `FAIL` | `PASS`/`CONCERNS` → Step 8 summary; `FAIL` → Failure Path (cycles detected, human review required). |
| `@*-summary` (`design`, `plan`, `build`, `debug`, `ship`) | `PASS` / `CONCERNS` / `FAIL` | `PASS` or `CONCERNS` → close workflow / next step; `FAIL` → Failure Path. |
| 2-way agents (`@bkit-build-plan-execute`, `@bkit-debug-abort-handover`, `@bkit-design-generate`, `@bkit-design-brainstorm-ideate-1/2/3`, `@bkit-plan-complexity-check`, `@bkit-plan-complexity-split`, `@bkit-ship-update-docs`, `@bkit-ship-conflict-resolve`, `@bkit-ship-deferred-sweep`) | `PASS` / `FAIL` | `PASS` → continue; `FAIL` → Failure Path. Atomic action — no middle state (cannot proceed → fail; no partial-progress CONCERNS). For `@bkit-ship-conflict-resolve`: `PASS` clears `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` sentinel and Step 4 continues; `FAIL` leaves sentinel and routes to `@bkit-debug-abort-handover`. For `@bkit-ship-deferred-sweep`: `PASS` → Merge (Step 6); `FAIL` touches `docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked` and routes to `@bkit-debug-abort-handover` (merge never happens). |

### Retry / timeout / iteration constants

<!-- prettier-ignore -->
| Constant | Value | Where |
| --- | --- | --- |
| `MAX_VERIFY_ATTEMPT` | 3 | `/bkit-build` per-sub-plan verify→remediate-gaps loop |
| `MAX_TEST_ATTEMPT` | 3 | `/bkit-build` test→diagnose→remediate loop |
| `MAX_DEBUG_ATTEMPT` | 3 | `/bkit-debug` invocation index (read from status.jsonl `workflow == "debug"` entry); `DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` starts a fresh run in `SOAK` |
| `MAX_NORMAL_ATTEMPT` | 3 | `/bkit-debug` NORMAL diagnose→remediate loop |
| `MAX_SOAK_ATTEMPT` | 3 | `/bkit-debug` SOAK loop (reset to 0 on each SOAK entry) |
| `MAX_MERGE_ATTEMPT` | 3 | `/bkit-ship` PR merge retries |
| Step timeout | 3600s | Any workflow or subagent run exceeding this → Failure Path |
| Lock idle threshold | 1800s | Concurrent-run cut-off: lock with `status.jsonl` last-step age <30min and `IN_PROGRESS` → Failure Path; >=30min or `DONE`/`FAILED` → stale, clean |
| Dev lock stale threshold | 900s | `.bkit/.dev.lock` mtime age at which a holder is presumed dead → clear and retry. Bounds the blast radius of a leaked dev lock to 15min |
| Dev lock wait budget | 600s | How long a dev critical section waits for the lock before Failure Path with the holder line. Failure Path itself uses 60s and SKIPS its dev ops rather than hard-failing |

Reference these constants by name in retry checks — never use literal `3`.

### Failure Path

Every command has `## 🤖 Failure Path` section before Step 1. Triggered by any step / tool / gate failure.

**Standard failure (always run):**

1. Mark `status.jsonl` last entry `status: "FAILED"`; remove `.lock` at `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` (absolute path); **assert lock file is absent** (else exit non-zero with `Lock removal failed`). For `plan`/`design`, the failed-status commit additionally pushes to `dev` (best-effort — `2>/dev/null || true`).
2. Add `Failed` to `{LABELS}` (additive — phase label persists) → update issue via `issue-update-failed` tracker snippet.
3. Append `### Workflow Failure` block to workflow comment with step number, error, and last 20 lines of stderr.

**Conditional handover** — runs ONLY if failure was triggered by max-retry exhaustion (`MAX_VERIFY_ATTEMPT` / `MAX_TEST_ATTEMPT` / `MAX_NORMAL_ATTEMPT` / `MAX_SOAK_ATTEMPT` / `MAX_MERGE_ATTEMPT` exceeded) **and** the worktree exists (the handover agent `cd`s into `.worktrees/{FID}`; `/bkit-debug` decides `DEBUG_MODE` in Step 1 before the worktree exists, so its Failure Path guards on `.worktrees/{FID}` existence before routing a mode-triggered handover — a pre-worktree failure with the mode already set goes straight to STOP):

4. Invoke `@bkit-debug-abort-handover` with all relevant prior logs as Read context; Write `docs/plans/{YYYYMM}/logs/{FID}/{phase}-handover.md`.
5. `git add -A` → commit `docs({FID}): {phase} aborted bkit [skip ci]` → push, guarded on an open PR (EC-2 in #261): before pushing, probe `gh pr list --head "$(git branch --show-current)" --base dev --json number --jq '.[0].number'`. Open PR found (non-empty result) → **do NOT push** the `[skip ci]` abort commit; preserve last validated remote HEAD and log `[bkit-ci-gate] abort-guard: open PR on branch — preserving last validated remote HEAD (no push)`. No open PR → push as normal. **Probe failed (non-zero exit) → inverted safe default: treat as "PR exists, do NOT push"** (cost-asymmetry: pushing a `[skip ci]` abort HEAD onto a live PR silently empties the PR's rollup; not-pushing on a no-PR branch is harmless) — log the probe failure with the `[bkit-ci-gate]` prefix.
6. Append `### Workflow Handover` block to workflow comment with handover blob link and verbatim body.

7. **STOP** — no further downstream steps.

`/bkit-design` is only command without conditional handover (no max-retry loop).

### Rebase Conflict Tiering

`/bkit-ship`, `/bkit-build`, `/bkit-debug` Step 2 all rebase the feature worktree against `origin/dev`. Three-tier recovery:

<!-- prettier-ignore -->
| Tier | Conflict shape | Recovery | Mechanism |
| --- | --- | --- | --- |
| 1 | Append-only ledgers (`docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/completed.md`, `.bkit/stats.jsonl`) + per-FID `status.jsonl` (`docs/plans/**/status.jsonl`) | `merge=union` — git auto-concatenates both sides | `.gitattributes` (template at `.bkit/templates/.gitattributes`, installed to consumer roots by `bkit install`); conflict never reaches the workflow |
| 2 | `pnpm-lock.yaml` only | Inline `git checkout --theirs pnpm-lock.yaml` + `pnpm install --lockfile-only` + `git add` + `git rebase --continue` | Bash block in Step 2 of all three workflows |
| 3 | Code, configs, anything else | Touch sentinel `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` → Failure Path → conditional handover | Sentinel-file pattern; `/bkit-ship` Failure Path additionally invokes `@bkit-ship-conflict-resolve` before `@bkit-debug-abort-handover` |

**Why Tier 1 is `merge=union` and not a workflow step:** the trade-off is interleaved or duplicated rows when both branches append — resolved by the reader's identity-tuple dedup (`(kind, repo, key)`), not a regression. `.gitattributes` is the standard git mechanism; pre-empts the conflict at the git layer for all callers without workflow surface area. Excludes `.bkit/friction.jsonl` (same-`key` update rows break the strict-append contract that union-safety requires).

**Why Tier 2 is inline bash and not a subagent:** mechanical recovery, deterministic git plumbing, no judgement call. A subagent or new Step would add status.jsonl / gate / Linear-comment overhead for what is a 4-line shell idiom.

**Why Tier 3 invokes `@bkit-ship-conflict-resolve` only in `/bkit-ship`:** ship is the only workflow that rebases against an active integration target where conflicts are common. `/bkit-build` and `/bkit-debug` operate on the feature branch in isolation; conflicts there are rarer and usually point to a deeper problem worth a human glance — they keep sentinel → handover only. The resolver's verdict signal (`pnpm install` + `typecheck` + `test` + `build` all PASS) is necessary but not sufficient for a merge — tests can pass while one side's intent is silently dropped — so the resolver refuses semantic overlaps and falls through to handover on any ambiguity. `bkit-debug` itself is **not** repurposed for git plumbing because its diagnose/remediate subagents are scoped to test/runtime failures with the same insufficient verdict signal.

**Failure Path routing:** rebase sentinel triggers conditional handover via `@bkit-debug-abort-handover` (same path as max-retry exhaustion), so Tier 3 unrecovered conflicts always end with a written handover doc, `Failed` label, and `In Review` state — not a silent stop.

### `bkit [auto route]` Marker Propagation

`bkit [auto route]` is a CI commit-message marker that enables the free-tier `bkit-cloud.yml` CI auto-route gate. It is placed on the **close-workflow commit** (and the debug **re-trigger commit**) — ONLY when the issue carried `bkit:auto` at close time. It is NOT a CI-suppressing token (the HEAD-Subject Assertion treats it as legitimate — deny-list, so it passes automatically).

**Placement logic (mode-dependent):**

- `/bkit-build` Step 18: a `bkit:auto` presence re-read happens BEFORE the close-workflow commit. If `bkit:auto` present → commit subject = `chore({FID}): close-workflow bkit [auto route]`. This close-workflow commit IS the feat-branch HEAD that fires CI → free-tier gate checks `head_commit.message` for `bkit [auto route]`.
- `/bkit-debug` Step 12 (PR-mode): same pattern — `bkit:auto` re-read before the close-workflow commit (Step 12 sub-step 3). Marker on close-workflow commit. The create-pr commit (Step 12 sub-step 9) does NOT run in PR-mode (`TRIGGER_PR=0`).
- `/bkit-debug` Step 12 (local-mode): `bkit:auto` re-read before the create-pr commit (Step 12 sub-step 9). Marker on create-pr commit (the CI-triggering HEAD in local-mode, not close-workflow).

**Why the re-read must precede the commit (R2-1/R2-2 ordering fix):** the existing kill-switch re-read at build Step 18 sub-step 4 / debug Step 12 sub-step 11 runs AFTER the commit + push — it cannot source the marker on a commit that already exists. A fresh `bkit:auto` read BEFORE the commit construction is the authoritative "at close time" signal.

**Coexistence with `bkit [verbose ci]`:** in debug local-mode, both markers may appear on the same commit subject: `chore({FID}): close-workflow bkit [verbose ci] bkit [auto route]`. The HEAD-Subject Assertion treats both as legitimate (neither is a suppressor). The two-tier CI gate reads `bkit [auto route]` via `contains(head_commit.message, 'bkit [auto route]')` — the `bkit [verbose ci]` suffix does not interfere.

**Cleanup:** the marker is self-clearing per push — only close-workflow + debug re-trigger commits carry it; all other workflow commits never have it. No PR-title edit needed (unlike `bkit [verbose ci]` in debug PR-mode); the CI auto-route fires on the commit message, not the PR title.

### `bkit [verbose ci]` Marker Propagation

`bkit [verbose ci]` is a CI commit-message / PR-title marker (registered in `docs/deployments.md` § Commit-message force tags) that escalates log detail for one run. `/bkit-debug` auto-applies it on every CI-triggering push so retry attempts have rich evidence to read; `/bkit-build` and `/bkit-ship` never apply it. Read template ci.yml § `bkit:start verbose-ci-env` for the env block that consumes the marker, and `docs/testing.md` § "CI verbosity" for the full knob list.

**Why debug is always-verbose, build is never-verbose:**

- **Debug is failure-recovery by definition.** Once `/bkit-debug` activates, we're already in "something is broken" mode and want maximum signal. Verbose on every push means attempt N+1's diagnose reads rich logs produced by attempt N's verify run, eliminating the one-cycle latency a "verbose only on retry" rule would introduce.
- **Build pushes are happy-path / ship-eligible.** Build's verify-retry loop runs locally (no pushes between attempts); only the final summary / create-pr / close-workflow pushes touch CI, and those commits can be merged. Tagging them with verbose would carry the marker downstream onto ship paths. The escalation handoff to verbose CI happens automatically when build's Failure Path triggers `/bkit-debug` for a still-broken state.
- **Ship is the green-path workflow.** Verbose on green runs is pure cost (artifact storage + run time) with zero diagnostic payoff.

**Mode-dependent propagation in `/bkit-debug`:**

GitHub Actions surfaces commit messages and PR titles to workflows via two distinct event payloads — `push.head_commit.message` vs `pull_request.title`. The template ci.yml's `on:` filter `branches: [main, dev]` means **push events ONLY fire for direct pushes to dev / main**; feature-branch pushes fire `pull_request.synchronize` instead. `PUSH_MODE` (decided in Step 1 sub-step 6 from `gh pr list --head <branch>`) drives which surface carries the marker:

<!-- prettier-ignore -->
| `PUSH_MODE` | When | CI event fired by debug push | Marker surface | Mechanism |
| --- | --- | --- | --- | --- |
| `LOCAL` | Debug invoked on a `dev` / `main` failure (no PR involved) | `push` event reads `head_commit.message` | **Commit message** | `bkit [verbose ci]` appended conditionally via `VERBOSE_SUFFIX=""; [ "$PUSH_MODE" = "LOCAL" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"` immediately before the relevant commits in `bkit-debug.md` (Step 6 `fix`, Step 7 `soak`, Step 9 `summary`, Step 10 `close-workflow`, Step 10 `create-pr`). PR-mode runs skip the suffix (`pull_request` events ignore commit messages). Self-clearing per push — non-debug pushes return to default. |
| `PR` | Debug invoked on a feature branch with an open PR (the dominant case) | `pull_request.synchronize` reads `pull_request.title` | **PR title** | Step 10 (Push Remediation) runs `gh pr edit --title` to idempotently append `bkit [verbose ci]` to the PR title (skip if already present) immediately before the push. Step 12 (Close Workflow) strips it via `sed` + `gh pr edit` on a successful close. Failure Path / handover **do NOT strip** — the post-handover human investigator wants continued verbose CI. |

Both paths idempotent — re-running debug doesn't double-append the marker (Step 10 skips when already present); orphan markers (workflow killed mid-run) are cleaned by the next debug invocation's Step 12 strip on successful close.

**Cleanup invariant:** the PR-title `bkit [verbose ci]` marker is stripped on a successful `/bkit-debug` close (Step 12, `PUSH_MODE = PR`). Failure Path / handover preserve the marker intentionally — the post-handover human investigator wants continued verbose CI without re-adding it. Cleanup of a preserved marker then happens via one of: (a) the next `/bkit-debug` run closing successfully, (b) the human stripping it manually, or (c) PR merge — the squash commit subject inherits `bkit [verbose ci]` so one post-merge dev CI run is verbose (harmless, occasionally useful as recovery-state evidence).

**Manual override:** users can append `bkit [verbose ci]` to any commit message or PR title directly — the env block honours both surfaces unconditionally. Debug's auto-propagation just removes the need to do it manually for the dominant retry-evidence-escalation case.

## Per-Phase Workflows

Each subsection below documents what command actually does — step list, subagents invoked, artifacts written, verdict routing, close behavior. For agent capability and effort details, cross-reference `.bkit/prompts.md`.

### `/bkit-design` — 10 steps

**Goal:** design doc only. No plan, no code. Always hard-stops after summary for human review (do NOT invoke `/bkit-plan`).

<!-- prettier-ignore -->
| Step | Subagent(s) | Read | Write | Notes |
| --- | --- | --- | --- | --- |
| 1 — Start Workflow | — | tracker issue | `.lock`, tracker comment | Fetch `origin/dev`. Resolve / create `{ISSUE_ID}`, set label `bkit:design`, state `In Progress`. NO commits on `dev` — `status.jsonl` init + `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | repo | `.worktrees/{FID}`, env files, `design-input.md` | Create or resume worktree on `feat/{FID}` (fallback: `HEAD`). `pnpm install --frozen-lockfile`. |
| 3 — Brainstorm & Ideate | `@bkit-design-brainstorm-ideate-1` ‖ `-2` ‖ `-3` (parallel triplet) | `design-input.md` | `design-brainstorm-ideate-1.md`, `-2.md`, `-3.md` | Pragmatic / optimal-tradeoff / risk-premortem lenses; effort-tier diversity (`high`/`medium`/`high`); sibling-blind. `BRAINSTORM_VERDICT` = worst of three. |
| 4 — Generate Design | `@bkit-design-generate` | both brainstorms | `design-v1-draft.md` (versioned draft) | First write of deliverable design doc. |
| 5 — Design Review | `@bkit-design-review-1` ‖ `@bkit-design-review-2` (parallel) | `design-v1-draft.md`, `design-input.md` | `design-review-1.md`, `design-review-2.md` (opinion-only logs) | Effort-tier diversity (high vs medium); sibling-blind. `REVIEW_VERDICT` = worst of two. `FAIL` → Failure Path. |
| 6 — Apply Review | `@bkit-design-update` | `design-v1-draft.md`, both reviews | `design-v2-reviewed.md` (versioned draft) | CRITICAL items always applied; OPTIONAL applied on consensus; OUT-OF-SCOPE deferred. |
| 7 — Design Organise | `@bkit-design-organise` | `design-v2-reviewed.md` | `design-v3-organised.md` (versioned draft) | Decompose design into dependency-annotated workstreams (`WS-N`). `ORGANISE_VERDICT` = `FAIL` (cycles) → Failure Path. |
| 8 — Summary | `@bkit-design-summary` | highest design-v* + glob design-* | `design-summary.md` | Commit `chore({FID}): summary bkit [skip ci]` → push. `SUMMARY_VERDICT` = FAIL → Failure Path. |
| 9 — Design Workstream Issues | — | `design-v3-organised.md` | milestone/project issues + block-by edges, `status.jsonl` | Read parent's milestone (GitHub) / project + project milestone (Linear); unset → Failure Path. Per `WS-N` block in `## Design Workstreams`: list existing milestone issues → existing match → sync comment (body untouched); else create issue assigned to that milestone/project (NOT a sub-issue) with `**Parent issue:**` + `**Parent design:**` + `**Workstream:**` + `**Requires:**` markers and inline `### Scope` / `### Rationale`. Single unified `WORKSTREAM_ISSUE_ID` map covers create + update branches. Second pass: add block-by edge per `Requires`. Idempotent; orphans get a `## Workstream Delete` comment, body untouched. |
| 10 — Close Workflow | — | — | `{YYYYMM}/{FID}-design.md` (copy of v3) | Copy v3 to canonical bucket → `cd $REPO_ROOT` → checkout `dev` → merge `feat/{FID}` → push `dev` → `git worktree remove` → delete local + remote `feat/{FID}` → `git worktree prune`. Set state `In Review`; phase label `Design` persists. Final return displays `design-summary.md` verbatim. |

**Hard stop in Step 10 caution block:** "Design requires human review. Do NOT invoke `/bkit-plan`."

**Step 9 contract:** the workstream-issue body carries everything `/bkit-plan` needs — no tracker-specific labels, no `WS_ID` parameter, no parent-shape detection. The two markdown markers (`**Parent design:**`, `**Workstream:**`) are load-bearing and parsed by `/bkit-plan` Step 1 (`PARENT_FID`) and `bkit-plan-generate` Contract (workstream scope). The `**Parent design:**` value is wrapped as a markdown link (`[docs/plans/{YYYYMM}/{FID}-design.md](URL)`) — display text is the canonical bare path so plan's parser can extract the slug. `Requires:` translates 1:1 to tracker block-by edges so `/bkit-build` Step 1's `issue-blockers-check` tracker snippet enforces ordering — no new build-side gate needed. Workstream issues are grouped by the parent's native milestone (GitHub) / project + project milestone (Linear), NOT nested as sub-issues — the MCP servers cannot create a milestone/project, so the parent must already carry it or Step 9 hits a Failure Path. Re-runs are non-destructive: existing bodies/titles are never rewritten (only sync comments appended); orphaned issues stay in the milestone with a `## Workstream Delete` notification comment. Even single-workstream designs spawn one issue; design and plan never share an FID.

### `/bkit-plan` — 11 steps

**Goal:** plan at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical bucket; `{YYYYMM}` = creation month). No code, no execution. Always hard-stops after summary for human review.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Set label `Plan`, `In Progress`. Parse `**Parent design:**` from `DESCRIPTION` → set `PARENT_FID` (sub-issue case); **else** leave empty (standalone plan run on issue input alone). NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Worktree on `feat/{FID}`; `plan-input.md` = session prompt + tracker issue description + comments. **If** `PARENT_FID` set → also concatenates `{PARENT_FID}-design.md` (missing file → Failure Path). Standalone plans skip the design append. |
| 3 — Generate Plan | `@bkit-plan-generate` | Reads `docs/plans/template.md` (canonical plan template). Writes `plan-generate.md` log + `docs/plans/{YYYYMM}/{FID}-plan.md`. |
| 4 — Review Plan | `@bkit-plan-review-1` ‖ `-2` ‖ `-3` (parallel triplet) | Tightness / dependency-correctness / regression-risk lenses. All three write critique logs. Missing or vague `**Done when:**` on any task → CRITICAL. |
| 5 — Apply Review | `@bkit-plan-update` | In-place edits to `{FID}-plan.md`; writes `plan-apply-review.md` log. Preserves every task's `**Done when:**` line (may tighten, never remove/weaken). |
| 6 — Check Scope | `@bkit-plan-scope-check-1` ‖ `@bkit-plan-scope-check-2` (parallel) | Scope completeness audit. `**Done when:**` is the literal criteria slot; missing on any task → FAIL. |
| 7 — Apply Scope | `@bkit-plan-update` | In-place edits; scope expansions → APPEND `docs/deferrals.jsonl`. |
| 8 — Check Complexity | `@bkit-plan-complexity-check` | `COMPLEXITY_VERDICT` ∈ {single, split}. |
| 9 — Split Plan | `@bkit-plan-complexity-split` _(only if `split`)_ | Writes `{FID}-plan-N.md` sub-plans + `plan-split.md` log; self-verifies losslessness (`SPLIT_VERDICT` ∈ {PASS, FAIL}; `FAIL` → Failure Path). |
| 10 — Summary | `@bkit-plan-summary` | Commit `chore({FID}): summary bkit [skip ci]` → push. |
| 11 — Close Workflow | — | Sync to `dev`, prune worktree, delete branches (same as `/bkit-design` Step 10). Set state `In Review`; phase label `Plan` persists. Final return displays `plan-summary.md` verbatim. |

**Hard stop in Step 11 caution block:** "Plan requires human review. Do NOT invoke `/bkit-build`."

### `/bkit-build` — 18 steps

**Goal:** implementation + PR creation. CI takes over after PR exists. Workflow stops on PR creation; no human gate within build itself.

**Sub-plan loop (Steps 5–7):** if `docs/plans/{YYYYMM}/{FID}-plan-N.md` exists, loop `N = 1..SUB_COUNT`, resetting `VERIFY_ATTEMPT` = 1 per N. Else `SINGLE_PLAN` = true and execute once on `{FID}-plan.md`.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Set label `Build`, `In Progress`. Check `relations.blocked_by` — any blocker not in `{Done, Cancelled}` → Failure Path with `Blocked by {BLOCKER_ID}`. Plan must exist at `docs/plans/{YYYYMM}/{FID}-plan.md` — else Failure Path with `Build requires plan.` NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Init `SUB_COUNT` (count `docs/plans/{YYYYMM}/{FID}-plan-*.md`), `VERIFY_ATTEMPT` = 1, `TEST_ATTEMPT` = 1. `build-input.md` includes the canonical plan. No path moves — plan stays at canonical bucket from design close. |
| 3 — Branch Sync | — | `git fetch origin`; if `git log HEAD..origin/dev --oneline -- docs/` non-empty → merge `origin/dev` (prefer `dev` for `docs/` conflicts). |
| 4 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
| 5 — Execute Plan | `@bkit-build-plan-execute` | Per sub-plan N: `build-plan-execute-N-log.md`. Single-attempt; writes stub-first then incremental `DONE` / `BLOCKED` log entries via `Bash echo >>`; writes source. Does NOT modify the sub-plan markdown — checkbox ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). On timeout (`EXECUTE_VERDICT = PENDING`), no in-Step retry — the verify→remediate loop (Step 6 → Step 7, bounded by `MAX_VERIFY_ATTEMPT` = 3) absorbs the recovery via `bkit-build-plan-gaps-remediate`. `EXECUTE_VERDICT`: `PASS` → Step 6. Other → Failure Path. |
| 6 — Verify Plan | `@bkit-build-plan-verify` | Per sub-plan N, attempt-numbered: `build-plan-verify-N-{VERIFY_ATTEMPT}.md`. Reads glob of execute attempts' `DONE —` lines + each task's `**Done when:**` line to cross-reference against `git diff`; ticks plan `[ ]`→`[x]` ONLY when task's `**Done when:**` criterion is satisfied in the codebase (NEVER on `DONE —` claim alone). Missing `**Done when:**` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. `PASS` → next N or Step 8. `CONCERNS` / `FAIL` → Step 7. Reads prior verify and remediate logs to know what was already verified. |
| 7 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` _(only if Step 6 CONCERNS or FAIL)_ | Attempt-numbered: `build-plan-gaps-remediate-N-{VERIFY_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Increment `VERIFY_ATTEMPT`; re-run Step 6. > `MAX_VERIFY_ATTEMPT` → Failure Path. |
| 8 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) _(only if `SUB_COUNT` >= 2)_ | Cross-sub-plan integration check; writes `build-plan-verify-holistic.md`. `HOLISTIC_VERDICT` `FAIL` → Failure Path. |
| 9 — Challenge Build (parallel) | `@bkit-build-challenge-1`, `@bkit-build-challenge-2` (parallel) | Launch parallel pair. Each reviewer gets same diff; `CHALLENGE_REMEDIATE_ATTEMPT` init 0 on first entry (persists across re-runs). Large-diff guard applied. Outputs: `build-challenge-1.md`, `build-challenge-2.md`. Both must be non-empty → Failure Path on partial (reconciler does not run on partial input). → Step 10. |
| 10 — Reconcile Challenge | `@bkit-build-challenge-reconcile` | Merge `build-challenge-1.md` + `build-challenge-2.md` into unified `build-challenge.md`. Dedup same `file:line` or root-cause cluster; severity max-wins. Verdict max-wins (`FAIL > CONCERNS > PASS`). Extraction of `CHALLENGE_VERDICT`/`CHALLENGE_FAILURES` happens here. `PASS` → Step 13. `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11. `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Step 13. `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11. `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Failure Path. |
| 11 — Remediate Challenge | `@bkit-build-challenge-remediate` _(only if Step 10 CONCERNS or FAIL at `CHALLENGE_REMEDIATE_ATTEMPT` < 1)_ | Reads `class` field on findings (data-driven). Any `architectural` → classify-gate emits `FAIL` (no fixes; architectural BLOCKED entries logged) → Failure Path. Else apply mechanical fixes. Increments `CHALLENGE_REMEDIATE_ATTEMPT` at step entry. Stub-first artifact + flat append-only log (`DONE —` per finding fixed; `BLOCKED —` per blocked finding; appended via `Bash echo >>`). Verdict `PASS` / `CONCERNS` / `FAIL`. → Step 12. |
| 12 — Generate Tests | `@bkit-build-challenge-tests` _(only if Step 10 CONCERNS or FAIL at `CHALLENGE_REMEDIATE_ATTEMPT` < 1)_ | Add edge-case tests from verify + challenge findings. If `CHALLENGE_VERDICT` = FAIL → re-runs Step 9 (safety net; counter persists, NOT reset); else falls through to Step 13. |
| 13 — Run Tests | — | Detect `turbo.json`: present → `pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue`; absent → single-package fallback `&&`-chains `pnpm $script` for any present in `package.json#scripts` (typecheck, test, format:check, lint:slop, lint:prose) — fail-fast (bkit is a single-package repo — plain `pnpm turbo` exits with `Command "turbo" not found` when `turbo.json` is absent). Pre-PR: lint/typecheck/unit only — NO mocked integration / E2E (CI covers those on the resulting PR). Build does NOT run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). When the repo declares `test:coverage:unit`, append it LAST — the unit branch-coverage gate that mirrors the CI unit lane's `--coverage.thresholds.branches`; both callers run the SAME `package.json` script (one source for the threshold), so a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 16. `FAIL` → Step 14 if `TEST_ATTEMPT` <= `MAX_TEST_ATTEMPT`. |
| 14 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if Step 13 FAIL)_ | Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. |
| 15 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if Step 13 FAIL)_ | Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Increment `TEST_ATTEMPT`; re-run Step 13. > `MAX_TEST_ATTEMPT` → Failure Path. |
| 16 — Summary | `@bkit-build-summary` | Commit `chore({FID}): summary` → push (`-u origin {BRANCH}`). |
| 17 — Create PR | — | `gh fetch origin dev`; if `supabase/migrations/` changed and HEAD lacks `bkit [force build]` → amend or empty commit with `bkit [force build]` → push. PR body is the plan blob URL. `gh pr create --base dev` (base pinned). Retry `gh pr create` once on failure. Post-create assertion: `gh pr view --json baseRefName` = dev else Failure Path — guards against repos whose default base is `main`. |
| 18 — Close Workflow | — | Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim. |

**Failure Path includes handover** — when triggered by exhausted retry counts, invokes `@bkit-debug-abort-handover` and posts `Workflow Handover` comment.

### `/bkit-debug` — 10 steps

**Goal:** diagnose and remediate failing test or CI run; push fix back to branch.

**Mode detection (Step 1):** `gh pr list --head $(git branch --show-current) --base dev`: a PR exists → `PUSH_MODE` = PR, else `PUSH_MODE` = LOCAL; `DEBUG_ATTEMPT` = prior `debugAttempt` from status.jsonl + 1 (this invocation number); then set `DEBUG_MODE` (NORMAL | SOAK) from objective signals only: defaults to NORMAL; `DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` OR `[soak]` in the session prompt → SOAK. On resume, `DEBUG_MODE` = SOAK if any `debug-failure-soak` step is recorded for the current `DEBUG_ATTEMPT` (a prior mid-run switch is sticky). The non-localisable-cause path to SOAK is NOT judged here — it is the Step-5 diagnose agent's evidence-based `Mode: SOAK`, applied mid-run (NORMAL → SOAK).

**The ladder + cutover:** two modes — `NORMAL` (diagnose + remediate) and `SOAK` (one accumulating-context instrument-or-fix loop). No separate observe mode exists: observation logging (`[DEBUG-OBSERVE]`) lives only inside the soak agent's instrument-and-strip loop. `SOAK` is entered three ways: at invocation start (`DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` or `[soak]`); mid-run when the Step-5 diagnose agent sets `Mode: SOAK` (header field, gated on `Verdict` != PASS) because the cause is not localisable; or when the `NORMAL` loop exhausts `MAX_NORMAL_ATTEMPT` (all three strategies STANDARD → PIVOT → FINAL tried and still failing) — a final SOAK escalation before handover. Every SOAK entry resets `SOAK_ATTEMPT` = 0, giving SOAK its own fresh budget (`MAX_SOAK_ATTEMPT`) independent of the `NORMAL_ATTEMPT` the NORMAL loop already spent (worst case: NORMAL up to 3 + SOAK up to 3). `SOAK` is terminal (one-way; never reverts to NORMAL). Soak does NOT require a live boundary — it loops against whatever Run Tests fails on (live or mocked). Diagnose RECOMMENDS; the orchestrator DECIDES (owns the switch).

**The loop:** Step 3 Run Tests (loop head; iteration 1 = reproduce) → on FAIL with budget, Step 4 Fetch Context → the mode's fix step (`NORMAL` → Diagnose 5 + Remediate 6; `SOAK` → Failure Remediate Soak 7) → loop to Step 3. PASS after a fix → Push 8 → Summary 9 → Close 10; PASS with no fix → can't-reproduce → Summary (CONCERNS). NORMAL inner-budget exhaustion (`NORMAL_ATTEMPT` > `MAX_NORMAL_ATTEMPT`) escalates to SOAK with a fresh budget; SOAK inner-budget exhaustion (`SOAK_ATTEMPT` >= `MAX_SOAK_ATTEMPT`) → Failure Path. Close asserts no added `[DEBUG-OBSERVE]` line survives the debug diff (no-leak) before the CI-triggering push.

**Live tier (Step 3):** Run Tests appends any declared `test:integration:live` / `test:e2e:live` / `test:live` the consumer has not opted out of (`[live=off]`); what actually ran is recorded verbatim in `scope` (the exact test command). When no live tier ran (no `test:...:live` task in `scope`), the live gate degrades to CONCERNS with a consumer-neutral `testsLiveSkipped` at close — never a silent pass. No separate capability flag is kept: "did live run?" is read off `scope` after the fact.

**Context fetch (Step 4):** Mode-agnostic, runs per loop iteration on a failing Run Tests. Five independent sub-fetch categories in priority order → per-source artifacts written only when content exists: (a) CI failure — structured triage (failed jobs/steps via `gh run view --json jobs`) + `##[error]`/`::error` annotation subset + full failed-step logs (`--log-failed`, falling back to `--log` when intermittently empty) under a `headSha` header → `debug-context-ci-{DEBUG_ATTEMPT}.md` when a non-success CI run exists for the branch; (b) diff vs last-passing CI on `dev` (`gh run list --branch dev --workflow ci.yml --status success --limit 5` → `git diff <last-pass-sha>..HEAD --stat`) → `debug-context-diff-{DEBUG_ATTEMPT}.md` when a last-passing-CI SHA exists and diff is non-empty; (c) local test suite (`pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue`) → `debug-context-tests-local-{DEBUG_ATTEMPT}.md` capturing combined stdout/stderr regardless of exit code; (d) Playwright `playwright-report` artifact via `gh run download` → `debug-context-tests-e2e-{DEBUG_ATTEMPT}.md` when `gh run view --json jobs` reports an `e2e|playwright`-named job/step with `conclusion=failure` (every text file under `test-results/` inlined verbatim with `===== file: <relpath> =====` separators; binary artifacts — HTML viewer, screenshots, videos, `trace.zip` — listed by relpath at the end but not inlined; depends on consumer-side `bkit-stub:e2e-artifacts` upload step in `ci.yml`, missing upload = empty download = no artifact, non-fatal); (e) runtime-log query → one `debug-context-runtime-<name>-{DEBUG_ATTEMPT}.md` per **every** `<!-- debug-fetch:start [name] --> ... <!-- debug-fetch:end -->` block **after** `<!-- bkit:end -->` in `.agents/config.md` (unnamed legacy block omits `-<name>`; consumer section only — bkit-shipped examples inside the bkit block are skipped; orchestrator uses each fenced block as template, customises by severity `>= ERROR`, freshness ~hours-since-last-commit + 30min buffer clamped `[1h, 24h]`, limit; each block self-gates on its CLI / token, emitting a `[debug-fetch:<name>] skipped — …` stderr breadcrumb when a cred/CLI is absent; the step captures both stdout and stderr and writes stdout when present, else the breadcrumb — so a skipped source records WHY it is empty rather than producing silence (load-bearing for headless cloud agents, where no operator watches stderr and the `2>/dev/null`-discarded breadcrumb was previously lost); tool-agnostic — bkit ships inert `vercel` + `supabase` examples). Any / all / none of these artifacts may exist; missing content = no file. Fail-soft throughout.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Add `Debug` additively (prior phase label persists), state `In Progress`. PR-mode: extract `PR_NUMBER` → `PUSH_MODE`. Read prior `debugAttempt` from status.jsonl → `DEBUG_ATTEMPT` = prior + 1. Set `DEBUG_MODE` (NORMAL | SOAK; objective signals: `DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` + session-prompt `[soak]`). NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Branch fallback differs from feat workflows: if no `feat/{FID}` branch exists locally or on origin → `git worktree add -b fix/{FID} origin/dev`. Branch eligibility check: `BRANCH` must be `dev` OR contain `{FID}` OR contain `{ISSUE_ID}` (case-insensitive) — else Failure Path with `Wrong branch.` Writes `debug-input-{DEBUG_ATTEMPT}.md` (failure description only — no workflow state). Init `NORMAL_ATTEMPT` = 0, `SOAK_ATTEMPT` = 0. Persists `debugMode` / `pushMode`. |
| 3 — Run Tests | — | **LOOP HEAD (both modes).** Increment `NORMAL_ATTEMPT`. Detect `turbo.json`: present → `pnpm turbo lint typecheck test test:integration test:e2e --filter='...[origin/dev]' --continue` (append any declared `test:integration:live` / `test:e2e:live` / `test:live` LAST, opt-out via `[live=off]`); absent → single-package fallback. Iteration 1 = reproduce. Records `verdict` + `failures` + `scope` (the verbatim test command; contains a `test:...:live` task only when a live tier ran). PASS + `NORMAL_ATTEMPT` > 1 → Step 8; PASS (unreproduced) → Step 9; FAIL + NORMAL + `NORMAL_ATTEMPT` <= `MAX_NORMAL_ATTEMPT` → Step 4; FAIL + NORMAL + exhausted → set SOAK, reset `SOAK_ATTEMPT` = 0 → Step 4; FAIL + SOAK + `SOAK_ATTEMPT` < `MAX_SOAK_ATTEMPT` → Step 4; else → Failure Path. |
| 4 — Fetch Context | — | _(on FAIL with budget)_ Mode-agnostic. Five sub-fetches in priority order (CI logs / diff vs last-passing CI / local run output incl `[DEBUG-OBSERVE]` / Playwright e2e / runtime logs) + a related-issues tracker search → per-source `debug-context-*-{DEBUG_ATTEMPT}.md` written only when content exists. Routes: SOAK → Step 7; else → Step 5. |
| 5 — Failure Diagnose | `@bkit-debug-failure-diagnose` _(only if `DEBUG_MODE` = NORMAL)_ | `STRATEGY` STANDARD → PIVOT → FINAL by prior diagnose. Writes `debug-failure-diagnose-{NORMAL_ATTEMPT}.md`; when a live tier failed on a functional assertion, anchors on that real-boundary ground truth (treats infra/credential failures as environment, not feature-broken). Sets `Mode` (NORMAL | SOAK) — `SOAK` when the cause is not localisable (gated on `Verdict` != PASS); in `NORMAL` the orchestrator then fast-tracks to Step 7 (Soak), resetting `SOAK_ATTEMPT` = 0, else → Step 6. |
| 6 — Failure Remediate | `@bkit-debug-failure-remediate` _(only if `DEBUG_MODE` = NORMAL)_ | Writes `debug-failure-remediate-{NORMAL_ATTEMPT}-log.md` + source files. Orchestrator commits `fix({FID}): {description}{VERBOSE_SUFFIX}` (`{description}` from the first `DONE — Step` line, truncated to 72 chars; `VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `PUSH_MODE = LOCAL`); the fix commit is the HEAD the next Run Tests / Push pushes. → loop to Step 3. |
| 7 — Failure Remediate Soak | `@bkit-debug-failure-soak` _(only if `DEBUG_MODE` = SOAK)_ | Increment `SOAK_ATTEMPT`. One accumulating context (reads its prior `debug-failure-soak-*-log.md`) applies the single next instrument-or-fix step against the failing boundary (the real model/DB/stream behind a live tier when one ran, else the failing tier the run surfaced); adds `[DEBUG-OBSERVE]` scaffolding and strips every marker before any declared fix (no-leak); commits `fix({FID}): soak {description}`. → loop to Step 3. Bounded by `SOAK_ATTEMPT` (`MAX_SOAK_ATTEMPT`, reset to 0 on each SOAK entry). |
| 8 — Push Remediation | — | _(PASS after a fix)_ Status file-only (no intermediate commit so Step 6/7's `fix(...)` stays HEAD at push). PR-mode: append `bkit [verbose ci]` to PR title if absent. Push. → Step 9. |
| 9 — Summary | `@bkit-debug-summary` | Commit `chore({FID}): summary{VERBOSE_SUFFIX}` → push. `SUMMARY_VERDICT` = PASS/CONCERNS → Step 10; FAIL → Failure Path. |
| 10 — Close Workflow | — | No-leak assertion: fails the run if any added `[DEBUG-OBSERVE]` line survives the debug diff (`git diff origin/dev..HEAD`, excluding `docs/plans/`) before the CI-triggering push — diff-scoped, NOT a tree-wide `git grep`, so the bkit-managed prompt/command files that quote the literal marker never false-trip (the soak agent's own `git grep '[DEBUG-OBSERVE]'` self-check in `bkit-debug-failure-soak.md` is the first layer). Else Failure Path. PR-mode: strip `bkit [verbose ci]` from PR title. Commit `chore({FID}): close-workflow{VERBOSE_SUFFIX}` → push + (LOCAL, no PR) `chore({FID}): create-pr{VERBOSE_SUFFIX}` (`VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `PUSH_MODE = LOCAL`). Auto-route marker `bkit [auto route]` on the CI-triggering HEAD when `bkit:auto`. Records `testsLiveSkipped` when no live tier ran (no `test:...:live` task in `scope`). Set state `In Review`; phase label `Debug` persists. Worktree persists. The handover path runs via Failure Path. Final return displays `debug-summary.md` verbatim. |

**Failure Path** includes conditional handover via `@bkit-debug-abort-handover` when max-retry exhausted, writing `debug-handover.md`. PR-mode `bkit [verbose ci]` marker is **intentionally preserved** here (NOT stripped) — human investigator picking up the failed PR wants ongoing verbose CI on their pushes; see § `bkit [verbose ci]` Marker Propagation for the cleanup invariant.

### `/bkit-ship` — 13 steps

**Goal:** merge PR, archive plans, clean up worktree.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Acquire lock. Set label `Ship`, `In Progress`. NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Rebase against `origin/dev` with tiered conflict recovery (see § Rebase Conflict Tiering): `merge=union` for append-only docs auto-resolves at git layer; `pnpm-lock.yaml`-only conflicts handled by inline regen-and-continue; everything else touches `.rebase-failed` sentinel for Step 4. Branch eligibility check (same as debug). Resolve `PR_NUMBER` and `PR_BASE` for current branch via `gh pr list --json number,baseRefName` (no open PR → Failure Path; `PR_BASE` != dev → Failure Path — blocks accidental squash-merge into `main`). Reject if PR has any failing CI checks (`gh pr view --json statusCheckRollup`). Init `MERGE_ATTEMPT` = 0. |
| 3 — Regression Guard | — | No CI run found for PR HEAD SHA → `REGRESSION_VERDICT=FAIL` immediately. Otherwise find the most recent prior failed CI run on the branch; for each step that failed in that prior run, assert the same-named step in the run on PR HEAD has `conclusion=success` (not `skipped`/`cancelled`/missing). Catches Vercel-ignore rules and `decide`-step partial-tier demotion masking a never-fired regression gate; fails loudly into Failure Path so a human can re-run via `/bkit-debug` or push a `bkit [force build]` commit. Universal — applies to both router-dispatched and manual `/bkit-ship` invocations. |
| 4 — Conflict Resolve | `@bkit-ship-conflict-resolve` _(only if rebase sentinel set)_ | Writes `ship-conflict-resolve.md`. `RESOLVE_VERDICT` = PASS clears the `.rebase-failed` sentinel and the workflow continues; FAIL leaves sentinel and routes to Failure Path → `@bkit-debug-abort-handover`. |
| 5 — Deferred Sweep | `@bkit-ship-deferred-sweep` | Pre-merge completeness gate. Builds the intended-delivery set from plan `Done when` + `ship-input.md` acceptance + design scope and asserts each against the codebase; an unplanned gap (mid-build `TODO`/`FIXME`, silent test skip) → `SWEEP_VERDICT` = FAIL → touch `.deferred-blocked` → Failure Path (merge never happens). Declared deferrals (out-of-scope across design / plan / `docs/deferrals.jsonl` / summaries) are exempt — never block, resurfaced in `ship-summary.md`'s `Deferred & Out-of-Scope (Resurfaced)` section. `PASS` → Step 6. |
| 6 — Merge PR | — | `gh pr merge {PR_NUMBER} --squash --delete-branch --subject "<title> (#{PR_NUMBER})" --body ""` (empty body — feature commits embed `bkit [skip ci]` which would suppress post-merge CI on `dev`). `state` = MERGED → Step 9. Else if `MERGE_ATTEMPT` <= `MAX_MERGE_ATTEMPT` → Step 7. Else Failure Path. |
| 7 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if not merged)_ | Writes `ship-failure-diagnose-{MERGE_ATTEMPT}.md`. |
| 8 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if not merged)_ | Writes `ship-failure-remediate-{MERGE_ATTEMPT}-log.md`. Increment `MERGE_ATTEMPT`; re-run Step 6. |
| 9 — Switch to Dev | — | `git checkout dev && git fetch origin dev`. If local `dev` is ahead with `[skip ci]` commits only → rebase onto `origin/dev` and push (no CI). Ahead with any non-`[skip ci]` commit → refuse, listing the offending commits and the reconcile recipe; ship never pushes them for you, because a CI-triggering push to `dev` can cancel the in-flight run validating this merge and leave the feature merge unvalidated (the reported incident: run #785 cancelled #784). Not ahead → `git pull --ff-only origin dev`. Steps 10+ run on `dev`. |
| 10 — Update Docs & Summary | `@bkit-ship-update-docs` ‖ `@bkit-ship-summary` (parallel) | No archive step — plans are already at canonical `docs/plans/{YYYYMM}/`. Both subagents in parallel. `update-docs` writes `ship-update-docs.md` + edits cataloged docs (incl. `docs/completed.md`, which references `docs/plans/{YYYYMM}/{FID}-plan.md`). `summary` writes `ship-summary.md` (incl. the resurfaced declared-deferral section lifted from `ship-deferred-sweep.md`). Sibling-blind: `summary` MUST NOT read `update-docs.md`. Commit `docs({FID}): update-docs-summary`. `SUMMARY_VERDICT` or `UPDATE_DOCS_VERDICT` = FAIL → Failure Path. |
| 11 — Prune Skills | — | Uninstall any `.agents/skills/` skills not listed in `.agents/skills.md` via `npx skills remove -y`. Commit `chore({FID}): prune-skills`. |
| 12 — Worktree Cleanup | — | `git worktree remove .worktrees/{FID} --force` → `git worktree prune` → `git branch -D feat/{FID}` → `git push origin --delete feat/{FID}` → `git fetch --prune origin`. Local + remote branch deletion is explicit because `gh pr merge --delete-branch` aborts both sides when the local one fails (worktree holds the ref). Squash-merged tip is unreachable from `dev`, so `-D` is correct. |
| 13 — Close Workflow | — | Assert the squash-merge CI run reached `status` = completed (an unfinished run has a null `conclusion`, which fail-open equality checks read as green), was neither cancelled nor a failure, and that its test tiers passed: the `bkit-tests-check` capstone where adopted — it is the sole authority there, since it already reds the build if any tier the plan expected was skipped, so a tier it let self-skip must not fail this gate — else every `bkit-tests*` lane, fail-safe on `!= "success"`. Exact-match by job name: no job is named `bkit-tests` any more, and a substring match on `test` also catches unrelated jobs (`latest-deploy`). Final commit `docs({FID}): ship DONE bkit [skip ci]` → push `dev`. Add `Merged` label, drop `Failed` if present, state `Done`. Final return displays `ship-summary.md` verbatim. |

**Failure Path** includes conditional handover via `@bkit-debug-abort-handover` writing `ship-handover.md` when max-retry exhausted.

### `/bkit-audit` — 7 steps

**Goal:** read-only multi-lens audit. No code, no execution. Always hard-stops after summary for human review (do NOT invoke `/bkit-plan` or `/bkit-build`). Triggered ad-hoc by a human; NOT part of the design → plan → build → debug → ship auto-cycle.

<!-- prettier-ignore -->
| Step | Subagent(s) | Read | Write | Notes |
| --- | --- | --- | --- | --- |
| 1 — Start Workflow | — | Linear issue | `.lock`, Linear comment | Pre-flight: fetch `origin/dev`. Resolve argv (no-arg / glob / `BAR-NNN`) → set `SCOPE_GLOB`, `ISSUE_ID`. Create-or-reuse master Linear issue. NO phase label. FID-format invariant assertion (standard form OR `-audit-{YYYYMMDD-HHmm}` suffix for re-audits). NO commits on `dev` — `status.jsonl` init + `audit-start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | repo | `.worktrees/{FID}`, `audit-input.md` | Create or resume worktree on `feat/{FID}` (fallback: `HEAD`). Read-only — drops `pnpm install --frozen-lockfile`. |
| 3 — Audits | `@bkit-audit-architecture` ‖ `-hotpath` ‖ `-config` ‖ `-reliability` ‖ `-observability` ‖ `-debt` ‖ `-dead-code` ‖ `-deps` ‖ `-security` ‖ `-tests` ‖ `-docs-drift` (parallel 11) | `audit-input.md` | 11 x `audit-{slug}.md` | Sibling-blind. Each auditor reads `.agents/docs.md` for project context (stack-aware report; stack-agnostic probes). Post-Step-3 assertion gate: for each slug verify file exists, non-empty, verdict header present. `LENS_VERDICT_WORST` = worst-of-11 (`FAIL > CONCERNS > PASS`); `MISSING`/`EMPTY` → `CONCERNS`-equivalent; `NO_VERDICT` → `FAIL`-equivalent → Failure Path. |
| 4 — Synthesise | `@bkit-audit-synthesise` | glob `audit-*.md` | `audit-v1-synthesis.md` | Parse standard markdown finding headings via regex `^## \[(\w+)\]\[(\w+)\] (.+) — (.+)$`; dedup on `(class, normalized_location)` with 5-line bucket; severity max-wins; cross-audit confidence upgrade one tier. `SYNTHESIS_VERDICT` = FAIL → Failure Path. |
| 5 — Organise | `@bkit-audit-organise` | `audit-v1-synthesis.md` | `audit-v2-ranked.md` + Linear sub-issues per workstream | Render severity x class matrix + ranked list + per-class appendix + workstreams. Post-step: orchestrator parses `## Workstreams` section and `save_issue` per `WS-{N}` with `parentId: {ISSUE_ID}` (existing match → `save_comment` sync). `ORGANISE_VERDICT` = FAIL (orphan correlation_id) → Failure Path. |
| 6 — Summary | `@bkit-audit-summary` | highest `audit-v*` + glob `audit-*.md` | `audit-summary.md` | Subagent emits 500-token summary. Orchestrator appends Step 6 section to master Linear comment with `audit-summary.md` content verbatim. Commit `chore({FID}): summary bkit [skip ci]` → push. `SUMMARY_VERDICT` = FAIL → Failure Path. |
| 7 — Close Workflow | — | — | `docs/audits/{FID}-audit.md` (copy of v2) | Copy v2 to `docs/audits/` → `cd $REPO_ROOT` → checkout `dev` → merge `feat/{FID}` → push `dev` → `git worktree remove` → delete local + remote `feat/{FID}` → `git worktree prune`. Set state `In Review`; NO phase label change (audit applies no label). |

**Hard stop in Step 7 caution block:** "Audit requires human review. Do NOT invoke `/bkit-plan` or `/bkit-build`. Findings are advisory; act on them via the spawned Linear sub-issues or open follow-up issues."

**Step 5 contract:** sub-issue body carries the workstream's `## Findings` list + `## Rationale`. Two markdown markers (`**Parent audit:**`, `**Workstream:**`) are load-bearing. Re-audit workflow: append `-audit-{YYYYMMDD-HHmm}` suffix to FID for lineage isolation; lock decoupled via timestamp; existing sub-issues with matching `WS-{N}:` title prefix get a sync comment instead of a body rewrite.

**Step 6 contract:** matches the canonical "ONE Linear comment per workflow run" rule. Master comment grows over Steps 1–7 (one appended section per step); Step 6's appended section contains the `audit-summary.md` content verbatim (exec summary + top-3 CRITICAL + class totals + lens coverage). No additional Linear comments are created — sub-issues spawned at Step 5 are the only Linear writes beyond the master comment.

**No `Audit` phase label.** The workflow does NOT apply a Linear phase label. Audit identity is encoded in (a) issue title prefix `Audit run …` (or reused issue's own title), (b) parent → sub-issue tree shape, (c) on-disk artifact `docs/audits/{FID}-audit.md`. Additive labels (`Failed` on Failure Path, `Debug` if a debug cycle follows) coexist normally.

### `/bkit-worktree-sync` — utility

Human-triggered. Pulls Claude's worktree commits into IDE's current branch. Always interactive — never auto-merges.

**Flow:**

1. **Verify context** — assert `{FID}` arg, current branch, `.worktrees/{FID}` exists.
2. **Save local changes** — uncommitted local work? prompt `[c]ommit` / `[s]tash` / `[x]abort`.
3. **Show diff summary** — `git log --oneline origin/dev..HEAD` from worktree, `git diff --stat`.
4. **Confirm** — prompt `[m]erge` / `[r]ebase` / `[x]abort`. Rebase warns about history rewrite.
5. **Merge or rebase** — `git merge $WORKTREE_PATH/{WORKTREE_BRANCH}` or `git rebase --onto {CURRENT} origin/dev .worktrees/{FID}/{WORKTREE_BRANCH}`. Conflicts → print list and stop.
6. **Done** — print next-step hint to run `/bkit-worktree-prune {FID}`.

### `/bkit-worktree-prune` — utility

Human-triggered. Removes a Claude worktree (and optionally its feature branch). Always interactive.

**Two paths:**

- **`{FID}` provided** → Single Worktree Path: warn if `AHEAD` > 0 commits not in `origin/dev`; confirm removal; `git worktree remove --force` + `git worktree prune`; offer to delete local branch (`-d` safe; `-D` only on explicit force confirm).
- **No arg** → List All Path: enumerate `.worktrees/*` with branch / ahead / behind / last-commit; prompt user to enter `{FID}` or `all` or `x`.

### `/bkit-auto` — phase-routed dispatch

**Goal:** phase-routed cloud dispatcher. Reads `{PHASE}` + `{ARG}` from invocation args and routes to the matching phase skill. **`MODE` = CI** (`ship`/`debug`, `{ARG}` = PR) runs Steps 1–4 (guard + opt-in gate + dispatch); **`MODE` = BRIEF** (`design`/`plan`/`build`, `{ARG}` = issue) runs Step 1 then Step 4 — the human `workflow_dispatch` is the opt-in, and the dispatched skill ingests its own brief + owns its `status.jsonl` / worktree / FID. No worktree, no tracker state change beyond a single comment line.

<!-- prettier-ignore -->
| Step | Notes |
| --- | --- |
| 1 — Start Workflow | Classify `{PHASE}` → `MODE` (CI-status aliases `success`/`pass` → `ship`, `failure`/`fail` → `debug` let the Cursor dashboard paste `/bkit-auto $CI_STATUS $PR_NUMBER` literally; the GHA half passes `ship`/`debug` directly). `MODE` = CI: resolve `{FID}` from `gh pr view {ARG} --json headRefName` (`feat/{FID}` convention), `{ISSUE_ID}` from PR body / branch slug. `MODE` = BRIEF: `{ISSUE_ID}` = `{ARG}`. The dispatched skill owns FID / `status.jsonl` / worktree. Create fresh tracker comment header. **Stateless — no `status.jsonl`, no `dev` commit.** |
| 2 — Stale-Run Guard | **`MODE` = CI only.** Compare CI run `headSha` to PR `headRefOid`. Mismatch → `GUARD_VERDICT` = FAIL (newer commit in flight) → exit 0 with no-op comment line. |
| 3 — Opt-In Gate | **`MODE` = CI only.** Require tracker `Auto` label on issue. Absent → `AUTO_VERDICT` = FAIL → exit 0 with no-op comment line + kill-switch propagation. |
| 4 — Dispatch | Route `{PHASE}` → `/bkit-ship {FID}` / `/bkit-debug {FID}` / `/bkit-design {ISSUE_ID}` / `/bkit-plan {ISSUE_ID}` / `/bkit-build {ISSUE_ID}`. Invoke via `Skill` (Claude) / `Task` (Cursor); dispatched skill owns its session from there. The regression-gate-verification gate that catches Vercel-ignore / `decide`-step demotion lives in `/bkit-ship` Step 3 — Regression Guard (universal — also applies to manual `/bkit-ship` invocations that bypass the workflow). |

**CI-class skip conditions emit one tracker no-op line and exit 0.** Only real failures (missing args, tracker unreachable, malformed state) take the Failure Path. Loop bound: `/bkit-debug` enforces `MAX_DEBUG_ATTEMPT` = 3 internally; the cloud workflow never counts attempts.

## Worktree Model

All phase workflows run inside `.worktrees/{FID}` (gitignored). One worktree per FID. IDE's main checkout is never touched.

**Step 2 — Worktree Setup** is identical across all 5 phases except for branch fallback rule:

```bash
REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
git worktree prune  # clean stale entries
WORKTREE_PATH="$REPO_ROOT/.worktrees/{FID}"

if [ -d "$WORKTREE_PATH" ]; then
  cd "$WORKTREE_PATH"
  git fetch origin dev
  git rebase origin/dev   # keep current
else
  if    git show-ref --verify --quiet "refs/heads/feat/{FID}";              then git worktree add "$WORKTREE_PATH" "feat/{FID}"
  elif  git fetch origin "feat/{FID}" 2>/dev/null \
        && git show-ref --verify --quiet "refs/remotes/origin/feat/{FID}"; then git worktree add "$WORKTREE_PATH" --track -b "feat/{FID}" "origin/feat/{FID}"
  else  git fetch origin dev
        git worktree add "$WORKTREE_PATH" -b "{PREFIX}/{FID}" {BASE}        # fallback
  fi
  cd "$WORKTREE_PATH"
fi

mkdir -p docs/plans/{YYYYMM}/logs/{FID}/
for f in .env .env.local apps/web/.env.preview apps/web/.env.production; do
  [ -f "$REPO_ROOT/$f" ] && cp "$REPO_ROOT/$f" "$WORKTREE_PATH/$f"
done
pnpm install --frozen-lockfile   # symlink-only ~5s; required because pnpm per-package node_modules symlinks are NOT inherited by worktrees
```

**Branch fallback (`{PREFIX}` / `{BASE}`):**

<!-- prettier-ignore -->
| Workflow | `{PREFIX}` | `{BASE}` | Reason |
| --- | --- | --- | --- |
| `/bkit-design`, `/bkit-plan`, `/bkit-build`, `/bkit-ship` | `feat` | `HEAD` (design/plan/build) or `origin/dev` (ship) | Chains off previous workflow's worktree state where applicable. |
| `/bkit-debug` | `fix` | `origin/dev` | Debug runs against an already-merged or in-PR feature; `fix/` prefix marks branch as remediation, not feature; clean dev avoids carrying stale state. |

**Lifecycle:**

<!-- prettier-ignore -->
| Phase | At Close Workflow |
| --- | --- |
| `/bkit-design`, `/bkit-plan` | Sync feature branch to `dev`, push `dev`, `git worktree remove`, delete local + remote `feat/{FID}`, `git worktree prune`. |
| `/bkit-build`, `/bkit-debug` | Worktree persists for follow-up phases. |
| `/bkit-ship` | Step 12 dedicated worktree cleanup: `git worktree remove --force` + `git worktree prune`. |

**`pnpm install --frozen-lockfile`** is symlink-only (~5s, no network). Required because pnpm per-package `node_modules` symlinks are not inherited from main checkout. A root-level symlink is not a substitute — individual packages need their own.

**Manual cross-IDE handoff** — user-triggered only:

1. `/bkit-design` and `/bkit-plan` complete → changes are on `dev` (worktree pruned at close).
2. Human reviews on `dev`. Runs `/bkit-build` → recreates worktree from `dev`.
3. `/bkit-build` pushes implementation → CI runs.
4. On CI failure → human triggers `/bkit-debug` → reuses or creates `fix/{FID}` worktree.

`/bkit-worktree-sync` and `/bkit-worktree-prune` exist for ad-hoc manual sync; not invoked by any phase command.

## Tracker Integration

Pluggable via `bkit install --tracker=<github|linear|none>`. Per-tracker MCP server endpoints, tool names, and call shapes are written inline at each call site as `github`/`linear`/`none` blocks; the installer keeps the chosen tracker's block and drops the others when mirroring to `.claude/commands/` + `.cursor/commands/` (see § Tracker Blocks). `.bkit/trackers.md` holds the marker contract + cross-cutting conventions only.

### Phase labels (mutually exclusive)

Phase labels carry the `bkit:` namespace prefix so they never clash with consumer-defined labels. Mutual exclusion enforced by workflow code: drop prior phase label from `{LABELS}` explicitly before adding new.

<!-- prettier-ignore -->
| Label | Meaning |
| --- | --- |
| `bkit:design` | `/bkit-design` running |
| `bkit:plan` | `/bkit-plan` running |
| `bkit:build` | `/bkit-build` running |
| `bkit:ship` | `/bkit-ship` running |
| `bkit:merged` | `/bkit-ship` completed; PR merged to `dev`; issue left **In Review** (open) — a human reviews post-merge and closes manually (bkit never auto-closes) |

Phase label is preserved through Close Workflow exit — tracker-specific state (e.g. Linear "In Review", GitHub `open`) carries the completion signal, so the label tells reviewers which workflow just finished. Ship is the exception: Close Workflow swaps `bkit:ship` → `bkit:merged`.

### Additive labels (do not drop phase)

<!-- prettier-ignore -->
| Label | Added by | When |
| --- | --- | --- |
| `bkit:auto` | Human (via tracker UI) at issue creation; written by issue-id-extraction snippet's create-issue fallback | Opt-in gate for `/bkit-auto` CI-mode (ship/debug) dispatch. Removed by any workflow that finds `bkit:auto` absent on the linked issue (kill-switch propagation). |
| `bkit:failed` | Failure Path of any workflow | Workflow hit its Failure Path; human triage required. Phase label persists alongside, so reviewers see which workflow failed. Cleared when `/bkit-debug` Step 1 starts (debug entry supersedes the prior failure marker) and when `/bkit-ship` Step 13 adds `bkit:merged` (terminal success). |
| `bkit:debug` | `/bkit-debug` Step 1 | `/bkit-debug` is running on top of a prior phase (typically `bkit:build` or `bkit:ship`). Prior phase label persists alongside, so reviewers see which workflow is being debugged. |

### Tracker-specific state

Issue state semantics (Linear's "In Progress" / "In Review" / "Done"; GitHub's `open` / `closed` + optional Projects v2 board status) are written inline as per-tracker blocks at these call sites:

<!-- prettier-ignore -->
| Snippet | When |
| --- | --- |
| `issue-update-phase` | Step 1 of every phase. Sets phase label, tracker-specific "active" state. |
| `issue-update-review` | Close Workflow of `/bkit-design`, `/bkit-plan`, `/bkit-build`, `/bkit-debug`. Hand-off state (Linear "In Review"; GitHub no-op — phase label carries signal). |
| `issue-update-merged` | `/bkit-ship` Step 13. Terminal close (Linear "Done"; GitHub `state: closed`). |
| `issue-update-failed` | Failure Path. Adds `bkit:failed` additive label. |
| `issue-update-debug` | `/bkit-debug` Step 1. Adds `bkit:debug` additive label. |
| `issue-update-status` | Step 1 (design/plan/build/debug/ship) → "In progress"; phase Close (design/plan/build/debug) → "In review"; `/bkit-ship` Step 13 → "Done". GitHub Projects v2 board (`bkit.githubProject`; skipped if unset/absent). Linear no-op (issue state already carries it). |

### Comment lifecycle

NEW comment per workflow step via tracker MCP. Step 1 posts the first comment; every later step posts its own. NEVER edit, paraphrase, or carry forward prior comment IDs. See § Comment Lifecycle for templates.

### Issue blockers (`/bkit-build` Step 1)

`/bkit-build` Step 1 calls the tracker's `issue-read` snippet and parses tracker-native blocker relations (Linear: `relations.blocked_by` via `get_issue({ includeRelations: true })`; GitHub: issue body text scan for `Blocked by #N` references). Any blocker whose state is not closed/done → Failure Path with `Blocked by {BLOCKER_ID} (state: {BLOCKER_STATE})`. Workstream issues spawned by `/bkit-design` Step 9 record their `Requires` edges via the `set-blocked-by` snippet, so this gate also enforces workstream ordering.

## GitHub Integration

### Branch conventions

- **Base branch:** `dev`. PRs always target `dev`, never `main`.
- **Feature branch:** `feat/{FID}` for design / plan / build / ship.
- **Fix branch:** `fix/{FID}` for debug when no feature branch exists (cleaner separation in Linear / CI).
- **Branch eligibility** (`/bkit-debug` Step 2, `/bkit-ship` Step 2): `{BRANCH}` must be `dev` OR contain `{FID}` OR contain `{ISSUE_ID}` (case-insensitive). Else Failure Path with `Wrong branch.`
- **Never push to `main`** (release branch).

### `gh` interactions used by the pipeline

```bash
gh repo view --json nameWithOwner --jq .nameWithOwner       # OWNER_REPO (Step 1 of every phase)
gh pr view {PR}    --json statusCheckRollup                 # Ship Step 2 — fail-fast on red CI
gh pr list --head $(git branch --show-current) --base dev   # Resolve PR_NUMBER (also PR-mode detection)
gh pr create --base dev --title "feat({FID}): ..." --body "..."   # Build Step 16
gh pr merge {PR} --squash --delete-branch --subject "..." --body ""   # Ship Step 6 — empty body strips feature `bkit [skip ci]`
gh run list --branch {BRANCH} --limit 1 --json databaseId   # Debug Step 2 (PR mode)
gh run view {RUN_ID} --log-failed                           # Debug Step 2 (PR mode) — capture CI_LOGS
```

Never merge locally; always `gh pr merge` per `/bkit-ship`.

### Commit conventions

Conventional Commits — `{type}({FID}): {summary}`.

<!-- prettier-ignore -->
| Type | When |
| --- | --- |
| `docs` | Doc-only changes (handover, ship close-workflow on `dev`); abort summary commits |
| `chore` | All per-step workflow commits (worktree-setup, summary, close-workflow, push-remediation attempt N/MAX, etc.) + pre-worktree carry-over |
| `feat` | Build implementation (PR title only) |
| `wip` | (used by `/bkit-worktree-sync` for local pre-merge captures only) |

### CI / Vercel commit tags

Precedence: `bkit [force build]` on head commit wins.

<!-- prettier-ignore -->
| Tag | Effect |
| --- | --- |
| `bkit [skip ci]` | GitHub Actions skip the workflow / `vercel-build` sets `run_level=none`. |
| `bkit [force build]` | Forces full CI + Vercel build even on docs-only paths. Used by `/bkit-build` Step 16 when `supabase/migrations/` changed without it on HEAD. |

**Docs-only commits:** workflows append `bkit [skip ci]` (CI suppression). The former `bkit [skip build]` build-cancel lever was removed (#291) — a docs-only commit is not app-affected, so a host's affected-detection build-cancel skips the build without it. Hosts that cancel ONLY on `[skip build]` will now build docs-only workflow commits; switch them to affected-detection.

<!-- prettier-ignore -->
| Workflow commit | Tags |
| --- | --- |
| `chore: pre-worktree uncommitted changes` (ship Step 2) | `bkit [skip ci]` |
| `chore({FID}): pre-worktree uncommitted changes` (design / plan / build Step 2) | none — feature-branch intermediate (#291 removed the prior `bkit [skip build]`) |
| `chore({FID}): {step-slug}` for per-step in-worktree commits (e.g. `worktree-setup`, `branch-sync`, `install-skills`, `plan-execute sub-plan N`, `plan-verify sub-plan N attempt M`, `failure-diagnose attempt N`, `build-challenge attempt N`, `build-challenge-reconcile attempt N`, `build-challenge-remediate attempt N`, `build-challenge-tests`, `summary`, `create-pr`, ship `merge-pr attempt N`, ship `prune-skills`, ship `update-docs-summary`) | none — in-worktree, never visible to CI on `dev` |
| `chore({FID}): summary bkit [skip ci]` (design Step 8 summary, plan Step 10 summary) | `bkit [skip ci]` |
| `fix({FID}): {description}` (debug Step 5 failure-remediate) | none — Step 7 pushes this commit directly so `fix(...)` becomes the CI-triggering HEAD (dodges `^chore:`-prefix Vercel-ignore rules and partial-tier `decide`-step demotion). `{description}` derived from first `DONE — Step` line in `debug-failure-remediate-{NORMAL_ATTEMPT}-log.md`. Debug Step 7 adds NO intermediate `chore(...)` commit before push. |
| `docs({FID}): ship DONE` (ship Step 13 close-workflow on `dev`) | `bkit [skip ci]` |
| `docs({FID}): {phase} aborted` (Failure Path handover) | `bkit [skip ci]` |
| `chore({FID}): close-workflow` (build Step 18 — opted-in: `bkit [auto route]` suffix when issue carried `bkit:auto` at close time) | none on base commit; opted-in adds `bkit [auto route]` (loud, not a suppressor) — final HEAD on push, fires `pull_request` synchronize + CI auto-route gate |
| `chore({FID}): close-workflow` (debug Step 12 PR-mode — opted-in) | none / `bkit [auto route]` (PR-mode, conditional) — same as build |
| `chore({FID}): create-pr` (debug Step 12 local-mode — opted-in) | none / `bkit [auto route]` (local-mode, conditional) — CI-triggering HEAD in local-mode |

**CI trigger mechanic (build / debug / ship aligned):** every workflow's last push to a CI-validated ref must leave a HEAD without `bkit [skip ci]`, else GitHub's `pull_request` (build/debug) or `push` (ship) synchronize is suppressed and `statusCheckRollup` stays empty — Ship Step 2's fail-fast gate would then admit a vacuously green PR. Trigger lives in the close-workflow step (the natural final-push location for build & debug); ship triggers via the squash merge subject. The CI-Dispatch Gate below is the enforcement mechanism — see § CI-Dispatch Gate.

### CI-Dispatch Gate (shared, single source)

An outcome-verification gate enforces the CI-trigger contract at the orchestrator layer. After the final loud push, it confirms a `bkit-decide` run was dispatched for the exact pushed HEAD; if none appears within a bounded poll it self-heals once with a clean `re-trigger` commit, then terminates with a named verdict. The pre-push HEAD-subject string clause (retained below) is the fast-fail component; the post-push poll is the outcome-verification component. The gate fires **post-final-push only** — zero additional mid-build CI triggers; D2 invariant (KN-30 / §141) is preserved.

It is **invoked by orchestrators** (NOT a git hook — the invariant is contextual; bkit intentionally pushes `[skip ci]` HEADs intermediately):

- **Build Gate 18 (HEAD clause + CI-Dispatch poll):** fires on the close-workflow final push. HEAD-subject pre-push fast-fail + post-push poll for `bkit-decide` dispatch.
- **Build Step 17 + Debug Step 10 create-pr (PR-title clause):** fires on PR creation — HEAD is the `[skip ci]` create-pr commit by D2 design, so the HEAD clause does NOT run here; only PR title is checked. No CI-Dispatch poll (create-pr is not the CI-triggering push in build; in debug LOCAL-mode it IS — see below).
- **Debug Gate 10, PR-mode (HEAD clause + CI-Dispatch poll):** fires on the close-workflow push (sub-step 3) — this is the CI-triggering push in PR-mode. Poll appended inside the close-workflow shell block.
- **Debug Gate 10, LOCAL-mode (HEAD clause + CI-Dispatch poll):** fires on the create-pr push (sub-step 9) — this is the CI-triggering push in LOCAL-mode. Poll appended inside the create-pr shell block. AUTO_ROUTE sourcing: reuse the in-block `AUTO_ROUTE_SUFFIX` shell var materialised from `BKIT_AUTO_ROUTE_FILE` before the `rm`; `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` (do NOT reorder the `rm` or re-read the removed file).
- **Ship:** OUT of scope. Ship keeps its pre-existing `SQUASH_SHA`-poll gate at Step 13 (`gh run list --branch dev --commit "$SQUASH_SHA"`). Adding a CI-Dispatch Gate at ship would mask the "essential tests skipped" signal that ship is the designed backstop for.
- **Ship Gate 5 + squash `--body ""` (PR-title clause):** fires at merge — squash subject becomes `dev` HEAD.

**Gate outcomes (4-state terminal verdict):**

- `dispatched` — a `bkit-decide` run found on the pushed HEAD within the poll budget. Step proceeds normally.
- `self-healed` — poll exhausted budget, HEAD was clean; gate pushed one clean empty `re-trigger` commit (carrying the same `AUTO_ROUTE_SUFFIX`) and re-polled; a run appeared. Step proceeds normally.
- `no-ci` — poll exhausted budget, HEAD was clean, re-trigger ALSO dispatched nothing — consumer repo has no CI workflow for this event. Logged pass; NOT Failure Path.
- `unresolved` — one of the sub-reasons below; routes to **Failure Path** after the verdict is recorded.

**Sub-reason codes (always map to `unresolved`):**

- `timeout-dirty` — poll exhausted budget AND pushed HEAD carries a CI suppressor; refuse to re-trigger a dirty HEAD.
- `retrigger-suppressed` — re-trigger commit's HEAD itself carries a suppressor; cannot discriminate `no-ci` vs. suppression. Maps to `unresolved`, NOT `no-ci`.
- `autoroute-mismatch` — `RETRIGGER_SUFFIX` != `AUTO_ROUTE_SUFFIX` (assert-equal backstop before re-trigger push).
- `gh-error` — every poll iteration errored (gh unavailable/unauthed).

**Named symbols (both gate sites — must be identical):**

- `POLL_BUDGET_S=60`, `POLL_INTERVAL_S=10` (derived `ATTEMPTS=6`).
- Log prefix `[bkit-ci-gate]` on every poll/verdict line.
- Self-heal cap = 1 (one `re-trigger` commit maximum).
- `bkit-decide` probe: case-insensitive fuzzy match `test("decide"; "i")` on the `statusCheckRollup` check-run shape — NOT an exact literal name match (consumer-renamed `bkit-decide` would otherwise produce permanent self-heal → `no-ci`/`unresolved`). Build/debug use the PR `statusCheckRollup` check-run shape; ship's existing `gh run list` probe uses the workflow-run shape and cannot share the jq filter.

**`ciDispatch` NDJSON field (additive on `step-done` records — backward-compatible with the FOLD reducer):**

```json
{
  "outcome": "dispatched|self-healed|no-ci|unresolved",
  "head": "<sha>",
  "attempts": 3,
  "retrigger": false,
  "reason": "timeout-dirty|retrigger-suppressed|autoroute-mismatch|gh-error"
}
```

`reason` is omitted when outcome is `dispatched`/`self-healed`/`no-ci`. The FOLD reducer does `del(.type,.workflow)` then merges remainder — extra keys pass through untouched (additive, backward-compatible).

**`ciDispatch` step-done record is LOCAL-only (intentional non-push):** the `jq ... >> "$STATUS"` write that appends the `ciDispatch`-bearing `step-done` record is written to the local `status.jsonl` ledger only and is deliberately NOT committed or pushed afterward. Pushing any commit after the confirmed-loud close-workflow HEAD changes the PR HEAD: a `[skip ci]` verdict commit empties the `statusCheckRollup` (re-introduces KN-11); a clean commit fires a second CI run. Do NOT "fix" this by adding a post-gate commit+push.

**Per-site AUTO_ROUTE sourcing:**

- **Build (Step 18):** `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` — re-use the in-block `AUTO_ROUTE_SUFFIX` already derived from `LABELS`. Assert-equal is trivially satisfied; the assert line stays for cross-site symmetry.
- **Debug LOCAL-mode (Step 10 sub-step 9):** gate reuses the in-block `AUTO_ROUTE_SUFFIX` shell var materialised from `BKIT_AUTO_ROUTE_FILE` (read + `rm` happens before the create-pr commit/push; `AUTO_ROUTE_SUFFIX` stays in scope for the rest of the block and for the gate appended after the push). `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` — do NOT reorder the `rm` or re-read the removed file.
- **Debug PR-mode (Step 10 sub-step 3):** `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` — re-use the in-block `AUTO_ROUTE_SUFFIX` derived from `LABELS` at sub-step 3 entry.

**Re-trigger commit carries the same `AUTO_ROUTE_SUFFIX`:** `chore({FID}): re-trigger${RETRIGGER_SUFFIX}` — so an opted-in issue's re-trigger carries `bkit [auto route]` automatically. The `bkit [auto route]` Marker Propagation rule (§ below) applies unchanged to re-trigger commits.

**Contract (DENY-LIST — never an allow-list):**

```bash
# HEAD-subject clause: run at the final CI-triggering push. Scan the FULL message
# (%B, body included), not just %s — GitHub reads the whole commit message for skip
# tokens, so a suppressor in the body kills CI even with a clean subject line.
HEAD_MSG=$(git log -1 --pretty=%B)
if echo "$HEAD_MSG" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
  echo "HEAD-subject assertion FAILED: HEAD commit message contains a CI-suppressing token." >&2
  echo "Fix: ensure the final commit before push is the loud close-workflow commit (no skip token in subject OR body)." >&2
  echo "Escape hatch: add 'bkit [force build]' to force a full build + CI." >&2
  exit 1
fi

# PR-title clause: run at create-pr and ship squash
PR_TITLE=$(gh pr view {PR_NUMBER} --json title --jq .title)
if echo "$PR_TITLE" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
  echo "PR-title assertion FAILED: PR title '$PR_TITLE' contains a CI-suppressing token." >&2
  echo "Fix: remove the suppressing tag from the PR title." >&2
  exit 1
fi
```

- **Deny-list tokens (HEAD message subject + body, AND PR title):** `[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]`, `[actions skip]` — the GitHub-native CI suppressors. Both clauses enforce the same set. The stack-specific `[skip build]` is **not** checked (#291): it is a host build-cancel convention, not a platform-native CI suppressor, so it has no place in bkit's stack-agnostic gate contract.
- **Legitimate loud tokens that pass automatically (deny-list, so no allow-list needed):** `bkit [auto route]`, `bkit [verbose ci]`, `bkit [force build]`. None contain a suppressor substring.
- **Hard-fail loud:** name the offending commit subject or PR title + the fix. Route to Failure Path. No silent auto-fix.
- **Escape hatch:** `bkit [force build]` on HEAD forces a full CI + host build and is not itself a suppressor.

Rationale: the invariant is **contextual** — bkit intentionally pushes `[skip ci]` HEADs intermediately (D2: `worktree-setup`/`create-pr` commits) and to `dev` (status bookkeeping). A blanket pre-push hook would wrongly block those legitimate pushes. Only the orchestrator knows which push is the final loud one.

<!-- prettier-ignore -->
| Workflow | Step | Mechanic | Why this form |
| --- | --- | --- | --- |
| `/bkit-build` | 18 (close-workflow) | Final commit `chore({FID}): close-workflow`, no skip tags + `git push` + CI-Dispatch poll | Drops `bkit [skip ci]` from the existing status commit; final commit before push fires PR `pull_request` synchronize; gate confirms dispatch |
| `/bkit-debug` | 10 (close-workflow) PR-mode | Final commit `chore({FID}): close-workflow`, no skip tags + `git push` + CI-Dispatch poll | PR-mode: close-workflow push IS the CI-triggering push; gate appended in sub-step 3 |
| `/bkit-debug` | 10 (close-workflow) LOCAL-mode | Separate create-pr push in sub-step 9 + CI-Dispatch poll | LOCAL-mode: create-pr push IS the CI-triggering push; gate appended in sub-step 9 |
| `/bkit-ship` | 4 (merge-pr) | `gh pr merge --squash --body ""` — squash subject becomes dev HEAD, body empty | `gh pr merge` is the only API; empty body strips PR-body `bkit [skip ci]` from the squash subject. Followed by pre-existing `gh run list --branch dev --commit "$SQUASH_SHA"` gate (not a CI-Dispatch Gate) |
| `/bkit-ship` | 10 / 11 / 13 (post-merge dev pushes) | Step 10 `docs({FID}): update-docs-summary`, Step 11 `chore({FID}): prune-skills`, Step 13 `docs({FID}): ship DONE bkit [skip ci]` | Post-merge docs-only; PR already merged, dev's CI fired by Step 6, no re-trigger needed. Per-step commits batched locally; single push to `dev` at Step 13 close-workflow. |

All intermediate workflow commits (start-workflow, summary, create-pr, etc.) retain `bkit [skip ci]` — only the trailing `close-workflow` commit is unmarked, and it is the LAST commit before the final `git push`. This also fixes the prior latent bug where build Step 18 / debug Step 12 commits were never explicitly pushed.

## Permissions (`.claude/settings.json`)

Without `acceptEdits` / wildcard allow surface, every `Bash`, `Edit`, `Write`, MCP, or skill call would prompt mid-workflow and break end-to-end runs.

<!-- prettier-ignore -->
| Bucket | Patterns | Purpose |
| --- | --- | --- |
| `allow` | `Bash(*)`, `Edit(*)`, `Write(*)`, `Skill(*)`, `mcp__linear__*`, `mcp__claude_ai_Linear__*`, `WebFetch(domain:github.com | api.github.com | linear.app | docs.anthropic.com | docs.claude.com)` | Blanket-allow shell, file ops, skills, Linear MCP, scoped web fetch. `deny` and `ask` lists evaluated first. |
| `ask` | `sudo:*`, `curl:*`, `wget:*`, `brew install:*`, `pnpm publish:*`, `npm publish:*`, `git push --force(:* / -f)`, `git reset --hard:*`, `git clean -fd(x):*`, `git filter-branch:*`, `gh repo delete:*`, `gh pr close:*`, `gh release delete:*`, `vercel rm/remove:*`, `supabase db reset / projects delete:*` | Per-call human confirmation for destructive ops. |
| `deny` | `Bash(rm -rf /\* | ~/\* | $HOME/_)`, `Bash(chmod -R 777 /:_)`, `Read(./.env | ./.env.\* | ./apps/_/.env_ | ./packages/_/.env_ | ./**/secrets/** | ./\*_/_.pem | ./\*_/_.p12 | ./\*\*/id_rsa)` | Hard-block catastrophic deletes and secret reads. |

`.mcp.json` declares `mcpServers.linear.url = https://mcp.linear.app/mcp` and `mcpServers.github.url = https://api.githubcopilot.com/mcp/`. SessionStart hook `bash .claude/hooks/preflight.sh` runs at every session start.

**Anti-pattern:** never use `--dangerously-skip-permissions` on host. Use it only inside sandboxed CI containers.

## Workflow Primitives — quick reference

Inline definitions for tokens used in workflow files. Keep this section in sync with actual workflow bodies.

### FID generation

1. Prefer Linear id lowercased: `xxx-123` ← `XXX-123`.
2. Else kebab from title: strip stopwords (the/a/and/of/to/in/for), <=3 tokens, ASCII lower → `word1-word2-word3`.
3. One FID for all artifacts once set.

### Branch eligibility

`{BRANCH}` passes if it equals `dev` OR contains `{FID}` (case-insensitive) OR contains `{ISSUE_ID}` (case-insensitive). Else Failure Path with `Wrong branch.` Used in `/bkit-debug` Step 2 and `/bkit-ship` Step 2.

### Label flip

```text
# Phase label (mutually exclusive — drop old before adding new):
Add `X` phase to {LABELS}, drop old → update issue via `issue-update-phase` tracker snippet

# Additive label (phase label persists alongside):
Add `X` to {LABELS} (additive — phase label persists) → update issue via `issue-update-failed` tracker snippet
```

Phase labels (`bkit:design`/`bkit:plan`/`bkit:build`/`bkit:ship`/`bkit:merged`) are mutually exclusive — drop old before adding new. Additive labels (`Failed`, `Debug`) skip the drop and live alongside the phase label. `Failed` is additionally cleared by `/bkit-debug` Step 1 (debug entry) and `/bkit-ship` Step 13 (`bkit:merged`) so a successfully-recovered or shipped issue does not carry a stale Failure Path marker.

### Sub-plan loop discovery

```bash
SUB_COUNT=$(ls docs/plans/{YYYYMM}/{FID}-plan-*.md 2>/dev/null | wc -l)
[ "$SUB_COUNT" -eq 0 ] && SUB_COUNT=1 && SINGLE_PLAN=true
# Per N: reset VERIFY_ATTEMPT=1 at start of each iteration
```

### Turbo command (verbatim)

```bash
pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue
```

No quote / filter / glob edits. Pre-PR is lint+typecheck+unit only; debug normal-mode adds `test:integration test:e2e`. Build does NOT run the live tier (out of build's scope by design — the @live boundary is validated post-merge by the push-only `bkit-tests-live` CI canary). When the consumer declares them (and has not opted out via `[live=off]` — a debug-scoped session flag, read per invocation from `debug-input-{DEBUG_ATTEMPT}.md`), debug appends `test:integration:live test:e2e:live test:live` LAST — never folded into a bare `pnpm test` (cost invariant); no live tier → debug's live gate degrades to CONCERNS with a recorded `testsLiveSkipped`.

### Tracker issue-create return guard

When a tracker call creates a new issue, it MUST return a non-empty `id`. Empty/null → Failure Path with `Tracker issue create returned no id`.

### Pre-worktree carry-over commit (Steps 2 of design / plan / build / ship)

```bash
if [ -n "$(git status --porcelain | grep -v '^??')" ]; then
  git status --short
  git add docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl
  git diff --cached --quiet -- docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl \
    || git commit -m "chore({FID}): pre-worktree uncommitted changes" -- docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl
fi
```

Carries the workflow's own log + friction rows into the new worktree branch. `/bkit-ship` appends ` bkit [skip ci]` to the commit subject; `/bkit-debug` Step 2 omits the primitive entirely — it intentionally branches off `origin/dev` for hotfix isolation.

Allow-list, never a deny-list (#61): a deny-list on the main checkout is `git add -A` by another name. The pathspec repeats on all three commands for the same reason — `git add` alone does not bound the commit, because a bare `git commit` commits the whole index, so a deletion the user had staged before the run gets swept into the workflow's commit (the reported destructive backout that required `git revert`). Passing the pathspec to `git commit` bypasses the index for everything else, leaving the user's staged work intact; the `git diff --cached` guard carries the same pathspec so a dirty index elsewhere cannot make the commit fire on nothing. `/bkit-ship` Step 6 runs a second instance of this shape against `$REPO_ROOT` before the squash-merge, and additionally allow-lists `.bkit/stats.jsonl` (close-step telemetry is written to `$REPO_ROOT`, outside the worktree).

## File path conventions

<!-- prettier-ignore -->
| Type | Path |
| --- | --- |
| Worktree | `.worktrees/{FID}/` (gitignored) |
| Design draft | `docs/plans/{YYYYMM}/{FID}-design.md` |
| Plan draft | `docs/plans/{YYYYMM}/{FID}-plan.md` (+ `{FID}-plan-N.md` if SPLIT) |
| Plan active | `docs/plans/{YYYYMM}/{FID}-plan*.md` (moved here in `/bkit-build` Step 2) |
| Plan completed | `docs/plans/{YYYYMM}/{FID}-plan*.md` (moved here in `/bkit-ship` Step 9) |
| Workflow logs | `docs/plans/{YYYYMM}/logs/{FID}/*.md` |
| Workflow state | `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (on `feat/{FID}` for `design`/`plan`/`build`/`debug` + `ship` Steps 1-8, reaching `dev` via squash-merge; `cloud` writes none — stateless dispatcher; see § status.jsonl) |
| Concurrency lock | `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` (absolute, main repo working tree) |
| Per-phase input | `docs/plans/{YYYYMM}/logs/{FID}/{phase}-input.md` (or `debug-input-{DEBUG_ATTEMPT}.md`) |
| Per-attempt logs | `docs/plans/{YYYYMM}/logs/{FID}/{phase}-{step}-{N}-*.md` (verify, remediate, diagnose loops) |
| Handover docs | `docs/plans/{YYYYMM}/logs/{FID}/{phase}-handover.md` (or `debug-handover-{DEBUG_ATTEMPT}.md`) |

## Loop context accumulation

Verify→remediate and diagnose→fix loops carry context via **per-attempt log files**, not by mutating the plan. Plan docs remain pure deliverables.

<!-- prettier-ignore -->
| Verifier / checker | Remediator | Max attempts | Escalation |
| --- | --- | --- | --- |
| `@bkit-build-plan-verify` | `@bkit-build-plan-gaps-remediate` | `MAX_VERIFY_ATTEMPT` = 3 | Failure Path |
| `@bkit-build-challenge-1` + `@bkit-build-challenge-2` (parallel pair) → `@bkit-build-challenge-reconcile` | `@bkit-build-challenge-remediate` | `CHALLENGE_REMEDIATE_ATTEMPT` < 1 (init 0, increments to 1 in Step 11; one remediation max; `FAIL` triggers re-Challenge for verification, `CONCERNS` falls through without re-Challenge) | Failure Path on `FAIL` after remediate (covers both unrecoverable remediation and architectural-class findings) |
| Build test loop (`pnpm turbo`) | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `MAX_TEST_ATTEMPT` = 3 | Failure Path |
| Debug test loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` (NORMAL); `@bkit-debug-failure-soak` (SOAK) | `MAX_NORMAL_ATTEMPT` = 3 (NORMAL loop); `SOAK_ATTEMPT` bounded by `MAX_SOAK_ATTEMPT` = 3 (reset on each SOAK entry) | Failure Path with `@bkit-debug-abort-handover` |
| Ship merge loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `MAX_MERGE_ATTEMPT` = 3 | Failure Path with `@bkit-debug-abort-handover` |

**Filename convention:** `docs/plans/{YYYYMM}/logs/{FID}/{phase}-{step}-N-{ATTEMPT}.md` (e.g. `build-verify-plan-1-2.md` = sub-plan 1, verify attempt 2). Verifiers MUST read prior verify+remediate logs before deciding `PASS`/`FAIL`. Remediators MUST glob their own prior logs and not repeat strategies.

## Structured Docs Writer Map

Pipeline writes to the structured ledgers at `docs/` root. Each has strict sole-writer policy.

<!-- prettier-ignore -->
| Doc | Dedup id | Sole writer(s) | Source step |
| --- | --- | --- | --- |
| `docs/knowledge.jsonl` | `key` | `@bkit-build-plan-gaps-remediate`, `@bkit-build-challenge-remediate`, `@bkit-debug-failure-remediate` | After verified fix |
| `docs/decisions.jsonl` | `key` | `@bkit-debug-failure-remediate` (forced arch) | At decision time — the design phase reads ADRs but no longer authors them |
| `docs/completed.md` | — | `@bkit-ship-update-docs` only | `/bkit-ship` Step 10 |
| `docs/deferrals.jsonl` | `key` | `@bkit-design-generate` (out-of-scope features), `@bkit-plan-generate` (out-of-scope ideas), `@bkit-plan-update` (scope expansions from `/bkit-plan` Step 7), `@bkit-debug-abort-handover` (handover context) | `/bkit-design` Step 4, `/bkit-plan` Steps 3 & 7, Failure Path handover |

All other agents document blockers and out-of-scope items in their own log file (Plan Execution / Challenge Remediation / etc — see each subagent's H1 for the canonical output name) — workflow reads those at step boundaries and decides what (if anything) to mirror to the issue tracker.

Append-only. Row format: `.bkit/jsonl.md`. See `.agents/docs.md` for doc index and read-by-phase matrix.

## Telemetry Ledgers

bkit emits JSONL telemetry to six append-only ledgers. Row format (envelope + per-kind fields, dedup tuples, write idiom): `.bkit/jsonl.md`.

<!-- prettier-ignore -->
| File | Kind(s) | Scope |
| --- | --- | --- |
| `.bkit/stats.jsonl` | `compliance`, `outcome`, `counter` | Per-run/per-workflow stats, compliance grades, counters |
| `.bkit/friction.jsonl` | `friction` | Friction entries from workflow runs |
| `docs/deferrals.jsonl` | `deferral` | Deferred work items and scope-expansions |
| `docs/failures.jsonl` | `failure` | Discovered bugs and failures |
| `docs/knowledge.jsonl` | `knowledge` | Gotchas, post-mortems, and fix rules |
| `docs/decisions.jsonl` | `decision` | Architecture and technology decisions |

Orchestrator behavior:

- **Never-drop:** NEVER silently drop deferred work → append a `kind:"deferral"` row to `docs/deferrals.jsonl`.
- **Found-bug:** NEVER silently drop a discovered bug → append a `kind:"failure"` row to `docs/failures.jsonl` immediately.
- **Friction/stats:** workflows write `friction` rows to `.bkit/friction.jsonl` and `counter`/`compliance`/`outcome` rows to `.bkit/stats.jsonl` at close/summary steps.
- **Best-effort:** every append exits 0 (`jq … >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"`) — telemetry NEVER gates a workflow.
- **Summary read:** close steps emit a `[bkit-telemetry]` summary line (rows / size / malformed / per-`bkitVersion` counts); `> 5000` rows → grep-able `[bkit-telemetry] WARNING: MAX_ROWS_BEFORE_ROLLUP (5000) exceeded`.

## Authoring Checklist for New / Refined Workflows

When writing or editing `.bkit/workflows/bkit-*.md` (canonical source — `bkit install` regenerates `.claude/commands/` and `.cursor/commands/`):

- [ ] YAML frontmatter with `description`.
- [ ] Header with `Output:` and `Tracker:` lines.
- [ ] Caution block with all Execution Protocol invariants (§ Common Workflow Anatomy → Execution Protocol).
- [ ] **Failure Path** before Step 1; conditional handover branch when phase has retry loops.
- [ ] **Step 1 — Start Workflow:** status init + lock acquire + tracker init + comment create + label set + state `In Progress`.
- [ ] **Step 2 — Worktree Setup:** worktree create/resume + env file copy + `pnpm install --frozen-lockfile` + save phase input + status step + comment append.
- [ ] Every step ends with `### 🔒 Gate N` and a checklist.
- [ ] Every step appends one fenced section to the workflow comment via the `comment-post-step` tracker snippet (one new comment per step — no COMMENT_ID threading).
- [ ] Subagent invocations use `@name` + `Context:` / `Read:` / `Update:` / `Create:` block (Update/Create as applicable); assert non-empty Update/Create artifacts.
- [ ] Verdict-bearing steps extract `{*_VERDICT}` and route per § Verdict vocabulary.
- [ ] Loops cap at `MAX_*_ATTEMPT` constants; exhaustion → Failure Path; per-attempt logs use `-{N}` filename suffix.
- [ ] Timeout guard captures `STEP_START` before each subagent / `pnpm turbo`; exceeded → Failure Path.
- [ ] Final step (Close Workflow) marks `status:done`, releases `.lock`, sets state `In Review` (ship: state `Done`, swaps label `Ship` → `Merged`); non-ship phases update state only, phase label unchanged.
- [ ] Docs-only commits include `bkit [skip ci]` (§ CI / Vercel commit tags).
- [ ] Branch eligibility check on phases that don't create their own branch (`/bkit-debug`, `/bkit-ship`).
- [ ] Token efficient — tables > prose, `→` not `then`, no sub-bullets when a table works.
- [ ] If new agent is introduced, add it to `.bkit/prompts.md` with frontmatter rationale and `maxTurns` calibration.
- [ ] If new destructive shell command is introduced, route it through `ask` or `deny` in `.claude/settings.json`.
