# Workflows

> [!CAUTION]
> **Purpose:** Agent-pipeline reference — workflow conventions, execution patterns, IDE integration, subagent catalog.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Subagents are leaves — never invoke other subagents.
> - Subagents NEVER touch the tracker. Tracker MCP tools (GitHub Issues, Linear, etc.) are orchestrator/workflow-layer exclusive.
> - When you change a workflow file (`.agents/workflows/bkit-*.md`), mirror change here.

## File Layout

Canonical source lives in `.agents/workflows/`. `bkit install` regenerates `.claude/commands/` (byte-identical) and `.cursor/commands/` (T1/T2/T3 transformed). Never edit the generated copies.

```
.agents/workflows/
├── bkit-design.md         # Workflow 1/6 — 10 steps; hard stop after summary
├── bkit-plan.md           # Workflow 2/6 — 11 steps; hard stop after summary
├── bkit-build.md          # Workflow 3/6 — 18 steps; CI takes over after PR
├── bkit-debug.md          # Workflow 4/6 — 12 steps; observe + normal-debug modes
├── bkit-ship.md           # Workflow 5/6 — 11 steps; merge → archive → In Review (human closes)
├── bkit-audit.md          # Workflow 6/6 — 7 steps; hard stop after summary
├── bkit-cloud.md          # Utility — phase-routed cloud dispatch (ship/debug by CI; design/plan/build by dispatch)
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
| `/bkit-cloud` | args `{PHASE} {ARG}` (`{ARG}` = PR for ship/debug, issue for design/plan/build) | n/a (dispatches into the matching `/bkit-{phase}`) | Phase-routed; same session continues into the dispatched skill |
| `/bkit-worktree-sync` | arg `{FID}` | n/a (interactive) | Merged or rebased commits in current branch |
| `/bkit-worktree-prune` | optional arg `{FID}` | n/a (interactive) | Deleted worktree (and optionally branch) |

## Workflow Authoring Rules

`.agents/workflows/*.md` are AI-only execution surfaces. Every byte is paid on every run.

- **Instructions only:** NO rationale, NO parentheticals explaining "why", NO "we don't do X because Y" notes, NO inline comments justifying behaviour.
- **Removal = delete:** When dropping an instruction, delete it. NEVER replace it with an explanation of the removal.
- **Self-contained:** Each workflow file MUST stand alone. NO cross-references to `.agents/workflows.md` or other meta docs. If the orchestrator needs the rule, inline it; if it doesn't, leave it out.
- **Sibling-blind subagent Context:** `Context:` strings stay generic — agent prompts handle their own lens via Process. Canonical phrasings: "You are a subagent in the {Phase} phase running in parallel with N other agents"; for reconcilers, "Inputs carry distinct lenses — merge across them, max-wins on CRITICAL findings".
- **Rationale lives here:** Decisions, trade-offs, history, meta-commentary belong in this file (`.agents/workflows.md`) — NEVER in the per-workflow files.
- **Reuse wording and formatting:** ALWAYS `grep .agents/workflows/` before writing. Copy closest existing phrasing AND formatting verbatim (backticks, indentation, line breaks, punctuation, spacing, etc). Match existing shape exactly for any sections that appear more than once (subagent invocations, gate checklists, `bash` blocks, comment fences, etc).
- **Cross-workflow alignment:** ALWAYS change shared lines in ALL workflows using them.
- **Procedural conditionals:** Any flow-gating conditional uses bold `**If** {condition} → {action}.` (with `**Else** → {action}.` for branches), regardless of syntactic shape. Test: if reordering reads as "If {X}, {Y}" naturally, it IS one. Excludes inline qualifiers (`if any`, `if defined`), dispatch tables (`PASS = …`, `STANDARD → …`), iteration (`For each …`), bash inside backticks, and output-template placeholders.
- **ASCII operators:** Use ASCII comparison/logic operators only — `!=`, `>=`, `<=`, `=>` — and `x` for "times"/dimensions. NEVER Unicode math glyphs (not-equal, greater-or-equal, less-or-equal, implies, multiplication). The flow-arrow `→` in procedural conditionals / dispatch tables is the **sole intentional non-ASCII glyph** — deliberately kept (it is the uniform, documented flow notation used in every conditional, not a stray operator; it reads clearer than `->`, which is also overloaded as member-access). Do NOT convert `→`.
- **Variable references:** In prose, variable names / field labels / placeholder identifiers go in backticks. Two forms with distinct meaning: bare `VAR` = reference (conditionals, schema); `{VAR}` = interpolation site (orchestrator substitutes value — paths, JSON, commit msgs, Context payloads). Operators stay outside (`VERIFY_ATTEMPT` = 0). Singular literal enum values stay plain when compared (**If** `VERDICT` = PASS); enum unions are one backticked unit (`PASS|CONCERNS|FAIL`). Inside fenced output-format blocks: keep plain. NEVER use `${VAR}` outside bash code fences.

## Tracker Blocks (#39, inline model)

`.agents/workflows/bkit-*.md` source files carry the wired tracker variants inline — `github` and `linear` — so the full per-tracker behaviour (MCP call shapes, label semantics, state transitions) is visible at the call site in one place. No substitution from `.agents/trackers.md`; the resolver only selects/strips inline blocks. Markers:

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

Re-runnable: source workflows carry the wired variants; switching trackers (`--tracker=linear` after `--tracker=github`) operates on the same source, producing fresh mirrors. The resolver reports a lone `github`/`linear` block or an unbalanced `true`/`false` pair as an orphan — silent regressions unacceptable. New tracker call site → add the `github`/`linear` pair inline (no `trackers.md` edit; add a `none` block only if the step must do something specific without a tracker). `.agents/trackers.md` is reference-only (marker contract + cross-cutting per-tracker conventions), no longer a substitution source.

**Per-tracker operational notes** (rationale kept here, not in the workflow files per § Workflow Authoring Rules):

- **Projects v2 board sync** (`issue-update-status`): best-effort — never gates; on failure the workflow retries once after 5s then continues. The `update_project_item` call needs the numeric `item_id`, NOT the node id returned by `add_project_item` — hence the intervening `projects_list` resolve step. The status `value` is the single-select **option id** (e.g. `47fc9ee4`), not the option name. Linear has no separate board (issue state carries the status) → its `issue-update-status` is a no-op.
- **Blocked-by edges:** GitHub Issues have no native `blockedBy` field → encoded via a `<!-- bkit:blocked-by -->` marker block in the issue body. Linear has a native `blockedBy` (append-only; re-runs with unchanged edges are no-ops).
- **Sub-issue create:** GitHub has no `parentId` on issue create → two calls (`issue_write` create, then `sub_issue_write` attach). Linear attaches via `parentId` in the create call (one call).
- **issue-update-review** (phase-close hand-off): GitHub no-op — the phase label set in `issue-update-phase` carries the completion signal until ship's terminal `issue-update-merged`.
- **issue-update-merged** (ship terminal): bkit **never auto-closes / never sets Done**. Ship drops the phase labels, adds `bkit:merged`, and moves the issue to **In Review** — Linear `state: "In Review"`, GitHub left **open** (the board, if wired, goes to the review option, not done). A human reviews the merged change and closes the issue manually. Rationale: a merge is not an acceptance — a person should confirm the shipped result before the issue is considered done, so closing stays a deliberate human act.

## Two-Layer Separation Rules

> **Agents NEVER call tracker MCP tools.** Tracker MCP tools (`mcp__github__issue_*`, `mcp__linear__*_issue`, `*_comment`, `list_issues`, etc.) are exclusive to the workflow layer. Agent that calls a tracker is a protocol violation.

<!-- prettier-ignore -->
| Capability | Workflow (`.agents/workflows/`) | Agent (`.agents/prompts/`) |
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
5. Step 1 — Start Workflow         (pre-flight divergence guard, lock acquire, tracker init, first-step comment post — status init deferred to Step 2; ZERO commits on `dev`)
6. Step 2 — Worktree Setup         (create/resume .worktrees/{FID}, copy env, pnpm install, save input, status init + `start-workflow` + `worktree-setup` step entries committed on `feat/{FID}`)
7. Phase-specific steps            (subagent invocations, gates, per-step new comment post)
8. Summary step                    (subagent → commit → push → verdict)
9. Close Workflow                  (status done, lock release, state → hand-off via `issue-update-review`; ship terminal `bkit:merged` + In Review via `issue-update-merged` (issue left OPEN — human reviews + closes); non-ship phases preserve phase label)
```

**Step convention:** every step ends with `### 🔒 Gate N — {Step Name}` checklist (must verify before proceeding), and posts a NEW tracker comment with one fenced section (see § Comment Lifecycle).

**Pre-worktree git scope:** Step 1 and Step 2's pre-worktree guard run on the originating branch (often `dev`). Allow-list `git add docs/plans/ .agents/friction.md` only; guard the commit with `git diff --cached --quiet ||`. NEVER `git add -A` until after `cd "$WORKTREE_PATH"` — it sweeps the user's unrelated in-flight edits into the workflow commit, which then rides feat → dev on merge. Post-worktree (Step 3+) `git add -A` is fine; cwd is the sandbox. `git worktree add` does not inherit dirty state, so leaving other edits on dev's working dir is correct.

**Pre-worktree divergence guard (BAR-184):** ALL phase workflows (`design`, `plan`, `build`, `debug`, `ship`) Step 1 makes ZERO commits on `dev` and asserts `git rev-list --count origin/dev..dev` = 0 as a pre-flight. Step 1's `start-workflow` event is deferred to Step 2 inside `.worktrees/{FID}`. `bkit-ship` Step 8 (Switch to Dev) additionally re-asserts the guard and uses `git pull --ff-only`, routing to Failure Path on divergence. Rationale: workflow commits on local `dev` pre-worktree never reach `origin/dev` directly — they accumulate locally until the feature PR squash-merges, at which point local `dev` diverges from the squash commit and a subsequent ship's `git pull` hits conflicts. (#209's NDJSON `status.jsonl` + `docs/plans/**/status.jsonl merge=union` removes the status-file class of those conflicts; the guard still holds for other shared files.)

**Branch placement (#209 — supersedes BAR-187's universal-dev model):** `build`/`debug` write + commit `status.jsonl` on `feat/{FID}` (the worktree) with NO mid-lifecycle `dev` push; `ship` writes Steps 1-7 on `feat/{FID}` and Steps 8-12 on `dev`; `design`/`plan`/`cloud`/`audit` are dev-located and push once per run (Close/Dispatch or Failure Path). See § `status.jsonl` — workflow state SoT for the full table, event model, and fold.

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
| **Status** | `status.jsonl` (append-only NDJSON event log) is the state file; placement per § `status.jsonl` (build/debug/ship→`feat/{FID}`, design/plan/cloud→`dev`). Fold the log to derive the run array; `parentSha` captured at step START. |
| **Resume** | On start, fold status.jsonl and pick up after last `done` step in active `in_progress` workflow. |
| **Labels** | Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:ship`, `bkit:merged` mutually exclusive — drop old phase before adding new. `bkit:failed` (Failure Path), `bkit:debug` (Debug Workflow), `bkit:auto` (cloud CI-class trigger gate) are additive — added without dropping phase (see § Tracker Integration). |
| **Comments** | NEW comment per workflow step via tracker MCP. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content (see § Comment Lifecycle). |
| **Failures** | Any step, tool, command failure, or gate that cannot pass → **Failure Path**. |
| **Timeouts** | Any workflow or subagent run > 3600 seconds → **Failure Path**. |
| **Locks** | Acquire `.lock` in Step 1 right after `mkdir -p` of logs dir. Lock path is **absolute** (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock`, anchored to main repo working tree via `git rev-parse --path-format=absolute --git-common-dir`) so acquire/release resolve to the same inode regardless of cwd. Existing lock → Step 1 cross-checks its owning workflow's folded status.jsonl: `DONE`/`FAILED` → clean silently; `IN_PROGRESS` + last step <30min → Failure Path with `Workflow already running for {FID}`; `IN_PROGRESS` + last step >=30min → stale, clean. Released in Close Workflow and Failure Path; **both must assert the lock file is absent before exiting** (else Failure Path with `Lock removal failed`). |

### `status.jsonl` — workflow state SoT (#209)

`docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` is the canonical workflow-state source of truth: an **append-only NDJSON event log** (one JSON event per line; prior lines NEVER mutated). Written by workflows only; agents MUST NOT read or write it. Enables resume of an interrupted run without re-reading the plan. Current state is derived by **folding** the log (see Fold below); the canonical reducer is `.agents/scripts/bkit-status.ts` (`fold` / `parseStatus`, unit-tested in `bkit-status.test.ts`), and each workflow inlines a jq filter that mirrors it.

**Why an event log + `merge=union` (#209):** the prior single `status.json` (a mutated JSON array) for one FID was committed on **both** `dev` (design/plan/build dev commits) and `feat/{FID}` (per-step worktree commits) → divergent content on the same path → the feature PR became unmergeable → GitHub never built `refs/pull/N/merge` → `pull_request` CI never ran (a `dev`-push status commit could also become the PR-branch tip and suppress CI). Append-only NDJSON + `docs/plans/**/status.jsonl merge=union` (`.gitattributes`, template at `.agents/templates/.gitattributes` — path-scoped, NOT a blanket `*.jsonl`) lets git concatenate both branches' appended lines **server-side** — the per-FID log can never block a merge. Union may interleave or duplicate lines, so the reader de-dupes by `(workflow, step, parentSha, at)` and orders by `at` before reducing.

**Branch placement (#209 — §3):**

<!-- prettier-ignore -->
| Workflow | Location | Mechanism |
| --- | --- | --- |
| `build`, `debug` | `feat/{FID}` worktree (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`) | Written + committed on `feat/{FID}` via the per-step commits. NO mid-lifecycle `dev` push (Close or Failure Path). State reaches `dev` once, at ship's PR squash-merge. |
| `ship` | Steps 1-7 on `feat/{FID}` (worktree); Steps 8-12 on `dev` (`$REPO_ROOT/...`) post-merge | Steps 1-7 commit on `feat/{FID}` (reach `dev` via the Step-5 squash-merge); Steps 8-12 append to dev's copy. Ship is terminal, so its `dev` commit + push (Close / Failure Path) is the legitimate state landing. |
| `design`, `plan`, `cloud`, `audit` | `dev`'s working copy (`$REPO_ROOT/...`) | No persistent feat branch — dev-located cheap archive. `dev` commit + push exactly ONCE per run: at Close/Dispatch (success) OR Failure Path. |

Rationale: relocating `build`/`debug`/`ship`-pre-merge state onto `feat/{FID}` removes the dev↔feat divergence at its source; the NDJSON+union change makes it merge-safe regardless. `design`/`plan` stay dev-located because they have no persistent branch (their doc squash-merges to `dev` at close); one dev push at termination with `bkit [skip ci]` (except plan/design close-workflow on success, which is the substantive feature commit and runs CI).

**Event types (one per line):**

<!-- prettier-ignore -->
| Event | Shape | Meaning |
| --- | --- | --- |
| `workflow-started` | `{type, workflow, at}` | Opens a new run of a phase workflow. |
| `step-done` | `{type, workflow, step, status, at, parentSha, artifacts, verdict?, attempt?, subPlan?, failures?, strategy?}` | One completed step (the bulk). |
| `workflow-meta` | `{type, workflow, at, …fields}` | Workflow-level metadata merged onto the run (e.g. `debugAttempt`). |
| `workflow-done` | `{type, workflow, at}` | Terminal — sets the run's `status` to `DONE`. |
| `workflow-failed` | `{type, workflow, at}` | Terminal — sets the run's `status` to `FAILED`. |

`workflow` ∈ `design`/`plan`/`build`/`debug`/`ship`/`audit`/`cloud`; `step` is a kebab slug (`build-run-tests`, `plan-verify`); `parentSha` = `git rev-parse HEAD` at step START (before any commit the step produces, forensic only); `verdict` ∈ `PASS`/`CONCERNS`/`FAIL`; `strategy` ∈ `STANDARD`/`PIVOT`/`FINAL`; `artifacts` are `docs/plans/{YYYYMM}/logs/{FID}/...` paths (or PR URL). Cross-field: when `failures` present, `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0` (`validateInvariants` in `bkit-status.ts`).

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

**Resume rule:** read the run array via `jq -s "$FOLD"' fold | …'`. For `build`/`debug`/`ship` prefer the `feat/{FID}` worktree copy when it exists (`SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"`), else the dev copy; `design`/`plan`/`cloud` read `$REPO_ROOT` directly. `status=IN_PROGRESS` → resume after last `DONE` step (re-run if its gate artifacts missing on disk). `status=DONE`/`FAILED` → start a new run. A legacy `status.json` (no `.jsonl` yet) is read as an already-folded array (see `parseStatus`).

### Concurrency lock

`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` is plain text file holding `{ISO_TIMESTAMP} {workflow}`. Path is **absolute** (anchored to main repo via `git rev-parse --path-format=absolute --git-common-dir`) so acquire and release resolve to the same inode whether cwd is the main repo or a worktree (BAR-183). Acquired in Step 1 right after `mkdir -p`; released in Step N (Close Workflow) and in Failure Path; both must assert the lock file is absent before exiting.

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

**Staleness rule (#209):** read the owning workflow's status.jsonl via the fold (`build`/`debug`/`ship` prefer the `feat/{FID}` worktree copy, else dev; `design`/`plan`/`cloud` read `$REPO_ROOT`). `DONE` / `FAILED` status → clean silently; `IN_PROGRESS` with last step <30min idle → genuine concurrent run, Failure Path; `IN_PROGRESS` with last step >=30min idle → orphaned, clean and proceed. Lock with no matching workflow run in the folded log is treated as stale and cleaned.

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
| **Versioned draft** | `{workflow}-v{N}-{action}.md` containing verdict header + record + the (modified) doc body. Single file; NO separate summary. | `plan-generate`, `plan-apply-review`, `plan-apply-scope`, `plan-complexity-split`, `design-generate`, `design-apply-review`, `build-plan-verify`, `build-challenge`, `build-challenge-tests`, `debug-observe-analyse`, `debug-failure-diagnose` |
| **Opinion-only log** | `{step-name}.md` with verdict + findings; never produces a versioned draft. | `plan-review-1/2/3`, `plan-scope-check-1/2`, `plan-complexity-check`, `design-brainstorm-ideate-1/2/3`, `design-review-1/2` |
| **Summary-only** | `{workflow}-summary.md` (or `{workflow}-handover.md`); produced once at end of workflow. | `plan-summary`, `design-summary`, `build-summary`, `debug-summary`, `ship-summary`, `debug-abort-handover` |
| **Code-mutation** | NO versioned draft; step's summary log records `git diff --stat` instead of restating intent. | `build-plan-execute`, `build-plan-gaps-remediate`, `build-challenge-remediate`, `debug-observe-instrument`, `debug-observe-revert`, `debug-failure-remediate`, `ship-update-docs` |

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
| `design-workstream-issues` | (Linear sub-issues + `blockedBy` edges) | side-effect only — no file deliverable |
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

**Per-agent description, scope, effort tier, tool surface, and `maxTurns` calibration → see `.agents/prompts.md`.** That file indexes every `.agents/prompts/*.md` agent and is single source of truth for agent metadata; this file only describes how workflow layer composes them.

**Cross-platform tool surface:** subagent frontmatter `tools:` allowlist is enforced on both Claude (native) and Cursor (passthrough — Cursor 2.4+). Removing `Edit`/`Bash` makes an agent provably non-mutating on both hosts. `bkit install` T3 transform passes `tools:` through verbatim; never emits `readonly:` (Cursor honours `tools:` allowlist directly).

**Parallel fan-outs** (effort / model diversity, sibling-blind):

<!-- prettier-ignore -->
| Siblings | Used in step | Sibling-blind contract |
| --- | --- | --- |
| `@bkit-design-brainstorm-ideate-1` / `-2` / `-3` | `/bkit-design` Step 3 | Each agent's prompt forbids reading any sibling output. Triplet — pragmatic / optimal-tradeoff / risk-premortem lenses. |
| `@bkit-design-review-1` / `-2` | `/bkit-design` Step 5 | Same; pair. |
| `@bkit-plan-review-1` / `-2` / `-3` | `/bkit-plan` Step 4 | Same; triplet — tightness / dependency-correctness / regression-risk lenses. |
| `@bkit-plan-scope-check-1` / `-2` | `/bkit-plan` Step 6 | Same; pair. |
| `@bkit-ship-update-docs` / `@bkit-ship-summary` | `/bkit-ship` Step 9 | `bkit-ship-summary` MUST NOT read `update-docs.md`. |

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
| 2-way agents (`@bkit-build-plan-execute`, `@bkit-debug-abort-handover`, `@bkit-design-generate`, `@bkit-design-brainstorm-ideate-1/2/3`, `@bkit-debug-observe-instrument`, `@bkit-debug-observe-revert`, `@bkit-plan-complexity-check`, `@bkit-plan-complexity-split`, `@bkit-ship-update-docs`, `@bkit-ship-conflict-resolve`) | `PASS` / `FAIL` | `PASS` → continue; `FAIL` → Failure Path. Atomic action — no middle state (cannot proceed → fail; no partial-progress CONCERNS). For `@bkit-ship-conflict-resolve`: `PASS` clears `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` sentinel and Step 4 continues; `FAIL` leaves sentinel and routes to `@bkit-debug-abort-handover`. |

### Retry / timeout / iteration constants

<!-- prettier-ignore -->
| Constant | Value | Where |
| --- | --- | --- |
| `MAX_VERIFY_ATTEMPT` | 3 | `/bkit-build` per-sub-plan verify→remediate-gaps loop |
| `MAX_TEST_ATTEMPT` | 3 | `/bkit-build` and `/bkit-debug` test→diagnose→remediate loops |
| `MAX_DEBUG_ATTEMPT` | 3 | `/bkit-debug` debug counter (read from status.jsonl `workflow == "debug"` entry) |
| `MAX_MERGE_ATTEMPT` | 3 | `/bkit-ship` PR merge retries |
| Step timeout | 3600s | Any workflow or subagent run exceeding this → Failure Path |
| Lock idle threshold | 1800s | Concurrent-run cut-off: lock with `status.jsonl` last-step age <30min and `IN_PROGRESS` → Failure Path; >=30min or `DONE`/`FAILED` → stale, clean (BAR-183) |

Reference these constants by name in retry checks — never use literal `3`.

### Failure Path

Every command has `## 🤖 Failure Path` section before Step 1. Triggered by any step / tool / gate failure.

**Standard failure (always run):**

1. Mark `status.jsonl` last entry `status: "FAILED"`; remove `.lock` at `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` (absolute path); **assert lock file is absent** (else exit non-zero with `Lock removal failed`). For `plan`/`design`, the failed-status commit additionally pushes to `dev` (best-effort — `2>/dev/null || true`).
2. Add `Failed` to `{LABELS}` (additive — phase label persists) → update issue via `issue-update-failed` tracker snippet.
3. Append `### Workflow Failure` block to workflow comment with step number, error, and last 20 lines of stderr.

**Conditional handover** — runs ONLY if failure was triggered by max-retry exhaustion (`MAX_VERIFY_ATTEMPT` / `MAX_TEST_ATTEMPT` / `MAX_DEBUG_ATTEMPT` / `MAX_MERGE_ATTEMPT` exceeded):

4. Invoke `@bkit-debug-abort-handover` with all relevant prior logs as Read context; Write `docs/plans/{YYYYMM}/logs/{FID}/{phase}-handover.md`.
5. `git add -A` → commit `docs({FID}): {phase} aborted bkit [skip build] bkit [skip ci]` → push.
6. Append `### Workflow Handover` block to workflow comment with handover blob link and verbatim body.

7. **STOP** — no further downstream steps.

`/bkit-design` is only command without conditional handover (no max-retry loop).

### Rebase Conflict Tiering

`/bkit-ship`, `/bkit-build`, `/bkit-debug` Step 2 all rebase the feature worktree against `origin/dev`. Three-tier recovery:

<!-- prettier-ignore -->
| Tier | Conflict shape | Recovery | Mechanism |
| --- | --- | --- | --- |
| 1 | Append-only doc ledgers (`docs/{pending,knowledge,decisions,completed}.md`) + per-FID `status.jsonl` (`docs/plans/**/status.jsonl`) | `merge=union` — git auto-concatenates both sides | `.gitattributes` (template at `.bkit/templates/.gitattributes`, installed to consumer roots by `bkit install`); conflict never reaches the workflow |
| 2 | `pnpm-lock.yaml` only | Inline `git checkout --theirs pnpm-lock.yaml` + `pnpm install --lockfile-only` + `git add` + `git rebase --continue` | Bash block in Step 2 of all three workflows |
| 3 | Code, configs, anything else | Touch sentinel `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` → Failure Path → conditional handover | Sentinel-file pattern; `/bkit-ship` Failure Path additionally invokes `@bkit-ship-conflict-resolve` before `@bkit-debug-abort-handover` |

**Why Tier 1 is `merge=union` and not a workflow step:** the trade-off is silent duplicate `KN-N` / `DE-N` IDs if both branches allocate the same number — same renumbering hazard already deferred separately, not a regression. `.gitattributes` is the standard git mechanism; pre-empts the conflict at the git layer for all callers without workflow surface area. Excludes `.agents/friction.md` (post-write edits to `Recovery` / `Status` fields break the strict-append contract that union-safety requires).

**Why Tier 2 is inline bash and not a subagent:** mechanical recovery, deterministic git plumbing, no judgement call. A subagent or new Step would add status.jsonl / gate / Linear-comment overhead for what is a 4-line shell idiom.

**Why Tier 3 invokes `@bkit-ship-conflict-resolve` only in `/bkit-ship`:** ship is the only workflow that rebases against an active integration target where conflicts are common. `/bkit-build` and `/bkit-debug` operate on the feature branch in isolation; conflicts there are rarer and usually point to a deeper problem worth a human glance — they keep sentinel → handover only. The resolver's verdict signal (`pnpm install` + `typecheck` + `test` + `build` all PASS) is necessary but not sufficient for a merge — tests can pass while one side's intent is silently dropped — so the resolver refuses semantic overlaps and falls through to handover on any ambiguity. `bkit-debug` itself is **not** repurposed for git plumbing because its diagnose/remediate subagents are scoped to test/runtime failures with the same insufficient verdict signal.

**Failure Path routing:** rebase sentinel triggers conditional handover via `@bkit-debug-abort-handover` (same path as max-retry exhaustion), so Tier 3 unrecovered conflicts always end with a written handover doc, `Failed` label, and `In Review` state — not a silent stop.

### `bkit [auto route]` Marker Propagation

`bkit [auto route]` is a CI commit-message marker that enables the free-tier `bkit-cloud.yml` CI auto-route gate. It is placed on the **close-workflow commit** (and the debug **re-trigger commit**) — ONLY when the issue carried `bkit:auto` at close time. It is NOT a CI-suppressing token (the HEAD-Subject Assertion treats it as legitimate — deny-list, so it passes automatically).

**Placement logic (mode-dependent):**

- `/bkit-build` Step 18: a `bkit:auto` presence re-read happens BEFORE the close-workflow commit. If `bkit:auto` present → commit subject = `chore({FID}): close-workflow bkit [auto route]`. This close-workflow commit IS the feat-branch HEAD that fires CI → free-tier gate checks `head_commit.message` for `bkit [auto route]`.
- `/bkit-debug` Step 12 (PR-mode): same pattern — `bkit:auto` re-read before the close-workflow commit (`:806`). Marker on close-workflow commit. The create-pr commit (`:844`) does NOT run in PR-mode (`TRIGGER_PR=0`).
- `/bkit-debug` Step 12 (local-mode): `bkit:auto` re-read before the create-pr commit (`:844`). Marker on create-pr commit (the CI-triggering HEAD in local-mode, not close-workflow).

**Why the re-read must precede the commit (R2-1/R2-2 ordering fix):** the existing kill-switch re-read at build `:963-970` / debug `:863-870` runs AFTER the commit + push — it cannot source the marker on a commit that already exists. A fresh `bkit:auto` read BEFORE the commit construction is the authoritative "at close time" signal.

**Coexistence with `bkit [verbose ci]`:** in debug local-mode, both markers may appear on the same commit subject: `chore({FID}): close-workflow bkit [verbose ci] bkit [auto route]`. The HEAD-Subject Assertion treats both as legitimate (neither is a suppressor). The two-tier CI gate reads `bkit [auto route]` via `contains(head_commit.message, 'bkit [auto route]')` — the `bkit [verbose ci]` suffix does not interfere.

**Cleanup:** the marker is self-clearing per push — only close-workflow + debug re-trigger commits carry it; all other workflow commits never have it. No PR-title edit needed (unlike `bkit [verbose ci]` in debug PR-mode); the CI auto-route fires on the commit message, not the PR title.

### `bkit [verbose ci]` Marker Propagation

`bkit [verbose ci]` is a CI commit-message / PR-title marker (registered in `docs/deployments.md` § Commit-message force tags) that escalates log detail for one run. `/bkit-debug` auto-applies it on every CI-triggering push so retry attempts have rich evidence to read; `/bkit-build` and `/bkit-ship` never apply it. Read template ci.yml § `bkit:start verbose-ci-env` for the env block that consumes the marker, and `docs/testing.md` § "CI verbosity" for the full knob list.

**Why debug is always-verbose, build is never-verbose:**

- **Debug is failure-recovery by definition.** Once `/bkit-debug` activates, we're already in "something is broken" mode and want maximum signal. Verbose on every push means attempt N+1's diagnose reads rich logs produced by attempt N's verify run, eliminating the one-cycle latency a "verbose only on retry" rule would introduce.
- **Build pushes are happy-path / ship-eligible.** Build's verify-retry loop runs locally (no pushes between attempts); only the final summary / create-pr / close-workflow pushes touch CI, and those commits can be merged. Tagging them with verbose would carry the marker downstream onto ship paths. The escalation handoff to verbose CI happens automatically when build's Failure Path triggers `/bkit-debug` for a still-broken state.
- **Ship is the green-path workflow.** Verbose on green runs is pure cost (artifact storage + run time) with zero diagnostic payoff.

**Mode-dependent propagation in `/bkit-debug`:**

GitHub Actions surfaces commit messages and PR titles to workflows via two distinct event payloads — `push.head_commit.message` vs `pull_request.title`. The template ci.yml's `on:` filter `branches: [main, dev]` means **push events ONLY fire for direct pushes to dev / main**; feature-branch pushes fire `pull_request.synchronize` instead. `DEBUG_MODE` (decided in Step 1 sub-step 6 from `gh pr list --head <branch>`) drives which surface carries the marker:

<!-- prettier-ignore -->
| `DEBUG_MODE` | When | CI event fired by debug push | Marker surface | Mechanism |
| --- | --- | --- | --- | --- |
| `local` | Debug invoked on a `dev` / `main` failure (no PR involved) | `push` event reads `head_commit.message` | **Commit message** | `bkit [verbose ci]` appended conditionally via `VERBOSE_SUFFIX=""; [ "$DEBUG_MODE" = "local" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"` immediately before each of the 5 commits in `bkit-debug.md` (Step 5 `fix`, Step 8 `summary`, Step 9 `observe-instrument`, Step 12 `close-workflow`, Step 12 `create-pr`). PR-mode runs skip the suffix (`pull_request` events ignore commit messages). Self-clearing per push — non-debug pushes return to default. |
| `pr` | Debug invoked on a feature branch with an open PR (the dominant case) | `pull_request.synchronize` reads `pull_request.title` | **PR title** | Step 7 sub-step 2a (`OBSERVE_MODE = off` path) and Step 9 sub-step 4a (`OBSERVE_MODE = instrument` path) each run `gh pr edit --title` to idempotently append `bkit [verbose ci]` to the PR title (skip if already present) immediately before their respective push. Set is co-located with the push that needs it. Step 12 sub-step 1a strips it via `sed` + `gh pr edit` **only when `OBSERVE_MODE = off`** (successful remediation close). `OBSERVE_MODE = instrument` close preserves the marker — the analyse cycle, observe-revert, and post-handover human pushes all want continued verbose. Failure Path / analyse handover similarly **do NOT strip**. |

Both paths idempotent — re-running debug doesn't double-append the marker (Step 7 sub-step 2a / Step 9 sub-step 4a skip when already present); orphan markers (workflow killed mid-run) are cleaned by the next debug invocation's Step 12 sub-step 1a strip on successful close.

**Cleanup invariant — `OBSERVE_MODE = off` only:** PR title `bkit [verbose ci]` marker is stripped on successful `/bkit-debug` close when `OBSERVE_MODE = off` (Step 12 sub-step 1a). `OBSERVE_MODE = instrument` close + analyse handover via Failure Path + general Failure Path all preserve the marker intentionally — the next consumer (analyse cycle, observe-revert push, post-handover human investigator) wants continued verbose CI without having to re-add it manually. Cleanup of the preserved marker then happens via one of: (a) the next `/bkit-debug` run on the same PR closing in `OBSERVE_MODE = off` successfully, (b) the human stripping it manually, or (c) PR merge — the squash commit subject inherits `bkit [verbose ci]` so one post-merge dev CI run is verbose (harmless, occasionally useful as recovery-state evidence).

**Manual override:** users can append `bkit [verbose ci]` to any commit message or PR title directly — the env block honours both surfaces unconditionally. Debug's auto-propagation just removes the need to do it manually for the dominant retry-evidence-escalation case.

## Per-Phase Workflows

Each subsection below documents what command actually does — step list, subagents invoked, artifacts written, verdict routing, close behavior. For agent capability and effort details, cross-reference `.agents/prompts.md`.

### `/bkit-design` — 10 steps

**Goal:** design doc only. No plan, no code. Always hard-stops after summary for human review (do NOT invoke `/bkit-plan`).

<!-- prettier-ignore -->
| Step | Subagent(s) | Read | Write | Notes |
| --- | --- | --- | --- | --- |
| 1 — Start Workflow | — | tracker issue | `.lock`, tracker comment | Pre-flight: assert `git rev-list --count origin/dev..dev` = 0 (Failure Path if non-zero — see § Pre-worktree divergence guard). Resolve / create `{ISSUE_ID}`, set label `bkit:design`, state `In Progress`. NO commits on `dev` — `status.jsonl` init + `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | repo | `.worktrees/{FID}`, env files, `design-input.md` | Create or resume worktree on `feat/{FID}` (fallback: `HEAD`). `pnpm install --frozen-lockfile`. |
| 3 — Brainstorm & Ideate | `@bkit-design-brainstorm-ideate-1` ‖ `-2` ‖ `-3` (parallel triplet) | `design-input.md` | `design-brainstorm-ideate-1.md`, `-2.md`, `-3.md` | Pragmatic / optimal-tradeoff / risk-premortem lenses; effort-tier diversity (`high`/`medium`/`high`); sibling-blind. `BRAINSTORM_VERDICT` = worst of three. |
| 4 — Generate Design | `@bkit-design-generate` | both brainstorms | `design-v1-draft.md` (versioned draft) | First write of deliverable design doc. |
| 5 — Design Review | `@bkit-design-review-1` ‖ `@bkit-design-review-2` (parallel) | `design-v1-draft.md`, `design-input.md` | `design-review-1.md`, `design-review-2.md` (opinion-only logs) | Effort-tier diversity (high vs medium); sibling-blind. `REVIEW_VERDICT` = worst of two. `FAIL` → Failure Path. |
| 6 — Apply Review | `@bkit-design-update` | `design-v1-draft.md`, both reviews | `design-v2-reviewed.md` (versioned draft) | CRITICAL items always applied; OPTIONAL applied on consensus; OUT-OF-SCOPE deferred. |
| 7 — Design Organise | `@bkit-design-organise` | `design-v2-reviewed.md` | `design-v3-organised.md` (versioned draft) | Decompose design into dependency-annotated workstreams (`WS-N`). `ORGANISE_VERDICT` = `FAIL` (cycles) → Failure Path. |
| 8 — Summary | `@bkit-design-summary` | highest design-v* + glob design-* | `design-summary.md` | Commit `chore({FID}): summary bkit [skip build] bkit [skip ci]` → push. `SUMMARY_VERDICT` = FAIL → Failure Path. |
| 9 — Design Workstream Issues | — | `design-v3-organised.md` | tracker sub-issues + block-by edges, `status.jsonl` | Per `WS-N` block in `## Design Workstreams`: list existing sub-issues → existing match → sync comment (body untouched); else create sub-issue with `**Parent issue:**` + `**Parent design:**` + `**Workstream:**` + `**Requires:**` markers and inline `### Scope` / `### Rationale`. Single unified `WORKSTREAM_ISSUE_ID` map covers create + update branches. Second pass: add block-by edge per `Requires`. Idempotent; orphans get a `## Workstream Delete` comment, body untouched. |
| 10 — Close Workflow | — | — | `{YYYYMM}/{FID}-design.md` (copy of v3) | Friction sweep + copy v3 to canonical bucket → `cd $REPO_ROOT` → checkout `dev` → merge `feat/{FID}` → push `dev` → `git worktree remove` → delete local + remote `feat/{FID}` → `git worktree prune`. Set state `In Review`; phase label `Design` persists. |

**Hard stop in Step 10 caution block:** "Design requires human review. Do NOT invoke `/bkit-plan`."

**Step 9 contract:** sub-issue body carries everything `/bkit-plan` needs — no tracker-specific labels, no `WS_ID` parameter, no parent-shape detection. The two markdown markers (`**Parent design:**`, `**Workstream:**`) are load-bearing and parsed by `/bkit-plan` Step 1 (`PARENT_FID`) and `bkit-plan-generate` Contract (workstream scope). The `**Parent design:**` value is wrapped as a markdown link (`[docs/plans/{YYYYMM}/{FID}-design.md](URL)`) — display text is the canonical bare path so plan's parser can extract the slug. `Requires:` translates 1:1 to tracker block-by edges so `/bkit-build` Step 1's `issue-blockers-check` tracker snippet enforces ordering — no new build-side gate needed. Re-runs are non-destructive: existing sub-issue bodies/titles are never rewritten (only sync comments appended); orphaned sub-issues stay open with a `## Workstream Delete` notification comment. Even single-workstream designs spawn one sub-issue; design and plan never share an FID.

### `/bkit-plan` — 11 steps

**Goal:** plan at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical bucket; `{YYYYMM}` = creation month). No code, no execution. Always hard-stops after summary for human review.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: assert `git rev-list --count origin/dev..dev` = 0 (Failure Path if non-zero — see § Pre-worktree divergence guard). Set label `Plan`, `In Progress`. Parse `**Parent design:**` from `DESCRIPTION` → set `PARENT_FID` (sub-issue case); **else** leave empty (standalone plan run on issue input alone). NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Worktree on `feat/{FID}`; `plan-input.md` = session prompt + tracker issue description + comments. **If** `PARENT_FID` set → also concatenates `{PARENT_FID}-design.md` (missing file → Failure Path). Standalone plans skip the design append. |
| 3 — Generate Plan | `@bkit-plan-generate` | Reads `docs/plans/template.md` (canonical plan template). Writes `plan-generate.md` log + `docs/plans/{YYYYMM}/{FID}-plan.md`. |
| 4 — Review Plan | `@bkit-plan-review-1` ‖ `-2` ‖ `-3` (parallel triplet) | Tightness / dependency-correctness / regression-risk lenses. All three write critique logs. Missing or vague `**Done when:**` on any task → CRITICAL. |
| 5 — Apply Review | `@bkit-plan-update` | In-place edits to `{FID}-plan.md`; writes `plan-apply-review.md` log. Preserves every task's `**Done when:**` line (may tighten, never remove/weaken). |
| 6 — Check Scope | `@bkit-plan-scope-check-1` ‖ `@bkit-plan-scope-check-2` (parallel) | Scope completeness audit. `**Done when:**` is the literal criteria slot; missing on any task → FAIL. |
| 7 — Apply Scope | `@bkit-plan-update` | In-place edits; scope expansions → APPEND `docs/pending.md`. |
| 8 — Check Complexity | `@bkit-plan-complexity-check` | `COMPLEXITY_VERDICT` ∈ {single, split}. |
| 9 — Split Plan | `@bkit-plan-complexity-split` _(only if `split`)_ | Writes `{FID}-plan-N.md` sub-plans + `plan-split.md` log; self-verifies losslessness (`SPLIT_VERDICT` ∈ {PASS, FAIL}; `FAIL` → Failure Path). |
| 10 — Summary | `@bkit-plan-summary` | Commit `chore({FID}): summary bkit [skip build] bkit [skip ci]` → push. |
| 11 — Close Workflow | — | Sync to `dev`, prune worktree, delete branches (same as `/bkit-design` Step 10). Set state `In Review`; phase label `Plan` persists. |

**Hard stop in Step 11 caution block:** "Plan requires human review. Do NOT invoke `/bkit-build`."

### `/bkit-build` — 18 steps

**Goal:** implementation + PR creation. CI takes over after PR exists. Workflow stops on PR creation; no human gate within build itself.

**Sub-plan loop (Steps 5–7):** if `docs/plans/{YYYYMM}/{FID}-plan-N.md` exists, loop `N = 1..SUB_COUNT`, resetting `VERIFY_ATTEMPT` = 1 per N. Else `SINGLE_PLAN` = true and execute once on `{FID}-plan.md`.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: assert `git rev-list --count origin/dev..dev` = 0 (Failure Path if non-zero — see § Pre-worktree divergence guard). Set label `Build`, `In Progress`. Check `relations.blocked_by` — any blocker not in `{Done, Cancelled}` → Failure Path with `Blocked by {BLOCKER_ID}`. Plan must exist at `docs/plans/{YYYYMM}/{FID}-plan.md` — else Failure Path with `Build requires plan.` NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Init `SUB_COUNT` (count `docs/plans/{YYYYMM}/{FID}-plan-*.md`), `VERIFY_ATTEMPT` = 1, `TEST_ATTEMPT` = 1. `build-input.md` includes the canonical plan. No path moves — plan stays at canonical bucket from design close. |
| 3 — Branch Sync | — | `git fetch origin`; if `git log HEAD..origin/dev --oneline -- docs/` non-empty → merge `origin/dev` (prefer `dev` for `docs/` conflicts). |
| 4 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip build] bkit [skip ci]`. |
| 5 — Execute Plan | `@bkit-build-plan-execute` | Per sub-plan N: `build-plan-execute-N-log.md`. Single-attempt; writes stub-first then incremental `DONE` / `BLOCKED` log entries via `Bash echo >>`; writes source. Does NOT modify the sub-plan markdown — checkbox ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). On timeout (`EXECUTE_VERDICT = PENDING`), no in-Step retry — the verify→remediate loop (Step 6 → Step 7, bounded by `MAX_VERIFY_ATTEMPT` = 3) absorbs the recovery via `bkit-build-plan-gaps-remediate`. `EXECUTE_VERDICT`: `PASS` → Step 6. Other → Failure Path. |
| 6 — Verify Plan | `@bkit-build-plan-verify` | Per sub-plan N, attempt-numbered: `build-plan-verify-N-{VERIFY_ATTEMPT}.md`. Reads glob of execute attempts' `DONE —` lines + each task's `**Done when:**` line to cross-reference against `git diff`; ticks plan `[ ]`→`[x]` ONLY when task's `**Done when:**` criterion is satisfied in the codebase (NEVER on `DONE —` claim alone). Missing `**Done when:**` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. `PASS` → next N or Step 8. `CONCERNS` / `FAIL` → Step 7. Reads prior verify and remediate logs to know what was already verified. |
| 7 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` _(only if Step 6 CONCERNS or FAIL)_ | Attempt-numbered: `build-plan-gaps-remediate-N-{VERIFY_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Increment `VERIFY_ATTEMPT`; re-run Step 6. > `MAX_VERIFY_ATTEMPT` → Failure Path. |
| 8 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) _(only if `SUB_COUNT` >= 2)_ | Cross-sub-plan integration check; writes `build-plan-verify-holistic.md`. `HOLISTIC_VERDICT` `FAIL` → Failure Path. |
| 9 — Challenge Build (parallel) | `@bkit-build-challenge-1`, `@bkit-build-challenge-2` (parallel) | Launch parallel pair. Each reviewer gets same diff; `CHALLENGE_REMEDIATE_ATTEMPT` init 0 on first entry (persists across re-runs). Large-diff guard applied. Outputs: `build-challenge-1.md`, `build-challenge-2.md`. Both must be non-empty → Failure Path on partial (reconciler does not run on partial input). → Step 10. |
| 10 — Reconcile Challenge | `@bkit-build-challenge-reconcile` | Merge `build-challenge-1.md` + `build-challenge-2.md` into unified `build-challenge.md`. Dedup same `file:line` or root-cause cluster; severity max-wins. Verdict max-wins (`FAIL > CONCERNS > PASS`). Extraction of `CHALLENGE_VERDICT`/`CHALLENGE_FAILURES` happens here. `PASS` → Step 13. `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11. `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Step 13. `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11. `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Failure Path. |
| 11 — Remediate Challenge | `@bkit-build-challenge-remediate` _(only if Step 10 CONCERNS or FAIL at `CHALLENGE_REMEDIATE_ATTEMPT` < 1)_ | Reads `class` field on findings (data-driven). Any `architectural` → classify-gate emits `FAIL` (no fixes; architectural BLOCKED entries logged) → Failure Path. Else apply mechanical fixes. Increments `CHALLENGE_REMEDIATE_ATTEMPT` at step entry. Stub-first artifact + flat append-only log (`DONE —` per finding fixed; `BLOCKED —` per blocked finding; appended via `Bash echo >>`). Verdict `PASS` / `CONCERNS` / `FAIL`. → Step 12. |
| 12 — Generate Tests | `@bkit-build-challenge-tests` _(only if Step 10 CONCERNS or FAIL at `CHALLENGE_REMEDIATE_ATTEMPT` < 1)_ | Add edge-case tests from verify + challenge findings. If `CHALLENGE_VERDICT` = FAIL → re-runs Step 9 (safety net; counter persists, NOT reset); else falls through to Step 13. |
| 13 — Run Tests | — | Detect `turbo.json`: present → `pnpm turbo lint typecheck test --filter='...[origin/dev]'`; absent → single-package fallback iterates `pnpm $script` for any present in `package.json#scripts` (typecheck, test, format:check, lint:slop, lint:prose) under `set -e` (bkit is a single-package repo — plain `pnpm turbo` exits with `Command "turbo" not found` when `turbo.json` is absent). Pre-PR: lint/typecheck/unit only — NO integration / E2E. `TEST_VERDICT` = PASS → Step 16. `FAIL` → Step 14 if `TEST_ATTEMPT` <= `MAX_TEST_ATTEMPT`. |
| 14 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if Step 13 FAIL)_ | Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. |
| 15 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if Step 13 FAIL)_ | Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Increment `TEST_ATTEMPT`; re-run Step 13. > `MAX_TEST_ATTEMPT` → Failure Path. |
| 16 — Summary | `@bkit-build-summary` | Commit `chore({FID}): summary` → push (`-u origin {BRANCH}`). |
| 17 — Create PR | — | `gh fetch origin dev`; if `supabase/migrations/` changed and HEAD lacks `bkit [force build]` → amend or empty commit with `bkit [force build]` → push. PR body is the plan blob URL. `gh pr create --base dev` (base pinned). Retry `gh pr create` once on failure. Post-create assertion: `gh pr view --json baseRefName` = dev else Failure Path — guards against repos whose default base is `main`. |
| 18 — Close Workflow | — | Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. |

**Failure Path includes handover** — when triggered by exhausted retry counts, invokes `@bkit-debug-abort-handover` and posts `Workflow Handover` comment.

### `/bkit-debug` — 12 steps

**Goal:** diagnose and remediate failing test or CI run; push fix back to branch.

**Mode detection (Step 1):** `gh pr list --head $(git branch --show-current) --base dev` — if a PR exists → **PR debug mode**. Else → **Local debug mode**. `DEBUG_ATTEMPT` + `PRIOR_OBSERVE_MODE` read from status.jsonl's most recent `workflow == "debug"` entry. Set `OBSERVE_MODE`: `PRIOR_OBSERVE_MODE = instrument` → `analyse` (Steps 10–11 + Failure Path handover). `DEBUG_ATTEMPT` > `MAX_DEBUG_ATTEMPT` → `instrument` (Step 9 single-shot). Else → `off` (normal Steps 4–8).

**Context fetch (Step 3):** Mode-agnostic. Five independent sub-fetches in priority order → per-source artifacts written only when content exists: (a) `gh run view "$RUN_ID" --log-failed` → `debug-context-ci-{DEBUG_ATTEMPT}.md` when a non-success CI run exists for the branch; (b) diff vs last-passing CI on `dev` (`gh run list --branch dev --workflow ci.yml --status success --limit 5` → `git diff <last-pass-sha>..HEAD --stat`) → `debug-context-diff-{DEBUG_ATTEMPT}.md` when a last-passing-CI SHA exists and diff is non-empty; (c) local test suite (`pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue`) → `debug-context-tests-local-{DEBUG_ATTEMPT}.md` capturing combined stdout/stderr regardless of exit code; (d) Playwright `playwright-report` artifact via `gh run download` → `debug-context-tests-e2e-{DEBUG_ATTEMPT}.md` when `gh run view --json jobs` reports an `e2e|playwright`-named job/step with `conclusion=failure` (every text file under `test-results/` inlined verbatim with `===== file: <relpath> =====` separators; binary artifacts — HTML viewer, screenshots, videos, `trace.zip` — listed by relpath at the end but not inlined; depends on consumer-side `bkit-stub:e2e-artifacts` upload step in `ci.yml`, missing upload = empty download = no artifact, non-fatal); (e) runtime-log query → `debug-context-runtime-{DEBUG_ATTEMPT}.md` when the **first** `<!-- debug-fetch:start --> ... <!-- debug-fetch:end -->` pair **after** `<!-- bkit:end -->` exists in `docs/observability.md` (consumer section only — bkit-shipped example inside the bkit block is skipped; orchestrator uses the fenced block as template, customises by severity `>= ERROR`, freshness ~hours-since-last-commit + 30min buffer clamped `[1h, 24h]`, limit 50, tool-agnostic). Any / all / none of the five artifacts may exist; missing content = no file. Fail-soft throughout.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: assert `git rev-list --count origin/dev..dev` = 0 (Failure Path if non-zero — see § Pre-worktree divergence guard). Add `Debug` additively (prior phase label persists), state `In Progress`. PR-mode: extract `PR_NUMBER`. Read `DEBUG_ATTEMPT` + `PRIOR_OBSERVE_MODE` from status.jsonl. Set `OBSERVE_MODE`. NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Branch fallback differs from feat workflows: if no `feat/{FID}` branch exists locally or on origin → `git worktree add -b fix/{FID} origin/dev`. Branch eligibility check: `BRANCH` must be `dev` OR contain `{FID}` OR contain `{ISSUE_ID}` (case-insensitive) — else Failure Path with `Wrong branch.` Writes `debug-input-{DEBUG_ATTEMPT}.md` (session-prompt envelope only — no logs). Init `TEST_ATTEMPT` = 0. |
| 3 — Fetch Context | — | Mode-agnostic. Five sub-fetches in priority order: CI sub-fetch (`gh run view --log-failed`) when a non-success CI run exists → `debug-context-ci-{DEBUG_ATTEMPT}.md`. Diff sub-fetch (`gh run list --branch dev --workflow ci.yml --status success --limit 5` → `git diff <last-pass-sha>..HEAD --stat`) → `debug-context-diff-{DEBUG_ATTEMPT}.md` when a last-passing-CI SHA exists. Local test sub-fetch (`pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue`) → `debug-context-tests-local-{DEBUG_ATTEMPT}.md` capturing combined stdout/stderr. Playwright sub-fetch (`gh run download -n playwright-report`) when an `e2e | playwright` job/step concluded `failure` → text files under `test-results/` inlined verbatim into `debug-context-tests-e2e-{DEBUG_ATTEMPT}.md`; binary artifacts (HTML viewer, screenshots, videos, `trace.zip`) listed at end. Depends on consumer-side `bkit-stub:e2e-artifacts` upload in ci.yml; missing upload = empty fetch = no file. Runtime sub-fetch triggered by `<!-- debug-fetch:start --> ... <!-- debug-fetch:end -->` markers in `docs/observability.md` → orchestrator customises template per failure context (severity / freshness / limit) → `debug-context-runtime-{DEBUG_ATTEMPT}.md`. Per-source artifacts written only when content available; empty = no file. Fail-soft throughout. |
| 4 — Failure Diagnose | `@bkit-debug-failure-diagnose` _(only if `OBSERVE_MODE` = off)_ | Writes `debug-failure-diagnose-{TEST_ATTEMPT}.md`. Reads prior diagnose+remediate logs + `debug-context-*.md` to avoid repeating strategies and quote concrete log evidence. |
| 5 — Failure Remediate | `@bkit-debug-failure-remediate` _(only if `OBSERVE_MODE` = off)_ | Writes `debug-failure-remediate-{TEST_ATTEMPT}-log.md` + source files. Orchestrator commits as `fix({FID}): {description}{VERBOSE_SUFFIX}` where `{description}` is derived from the first `DONE — Step` line in the remediate log (truncated to 72 chars; fallback `failure-remediate attempt {TEST_ATTEMPT}`) and `VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `DEBUG_MODE = local`. The commit becomes Step 7's push HEAD so CI / Vercel evaluate against `fix(...)` rather than a trailing `chore(...)` follow-up. Local-mode CI reads the marker via `head_commit.message`; PR mode is covered by Step 7 sub-step 2a's PR-title set. |
| 6 — Run Tests | — | _(only if `OBSERVE_MODE` = off)_ Detect `turbo.json`: present → `pnpm turbo lint typecheck test test:integration test:e2e --filter='...[origin/dev]' --continue`. Absent → single-package fallback iterates `pnpm $script` for present scripts in `package.json#scripts` under `set -e`. `PASS` → Step 7. `FAIL` → increment `TEST_ATTEMPT`, loop back to Step 4. > `MAX_TEST_ATTEMPT` → Failure Path. |
| 7 — Push Remediation | — | _(only if `OBSERVE_MODE` = off and Step 6 PASS)_ Increment `DEBUG_ATTEMPT`. Update status.json file-only (no intermediate commit so Step 5's `fix(...)` stays HEAD at push). Persist new `debugAttempt` onto status.json workflow entry. Sub-step 2a: PR-mode only — append `bkit [verbose ci]` to PR title if not present (Gate 7 checks "PR title `bkit [verbose ci]` set attempted"; see § `bkit [verbose ci]` Marker Propagation). Push. |
| 8 — Summary | `@bkit-debug-summary` _(only if `OBSERVE_MODE` = off and Step 6 PASS)_ | Commit `chore({FID}): summary{VERBOSE_SUFFIX}` (`VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `DEBUG_MODE = local`) → push. |
| 9 — Observe Instrument | `@bkit-debug-observe-instrument` _(only if `OBSERVE_MODE` = instrument)_ | Single-shot observation pass before terminal handover. Adds `[DEBUG-OBSERVE]` markers; lint/typecheck/test gate. Commit `chore({FID}): observe-instrument attempt {DEBUG_ATTEMPT}{VERBOSE_SUFFIX}` (`VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `DEBUG_MODE = local`). Sub-step 4a: PR-mode only — append `bkit [verbose ci]` to PR title if not present (see § `bkit [verbose ci]` Marker Propagation). Push. Routes to Step 12. |
| 10 — Observe Analyse | `@bkit-debug-observe-analyse` _(only if `OBSERVE_MODE` = analyse)_ | Reads `debug-context-*.md` + instrumentation report; writes `debug-observe-analyse-{DEBUG_ATTEMPT}.md`. |
| 11 — Observe Revert | `@bkit-debug-observe-revert` _(only if `OBSERVE_MODE` = analyse)_ | Strips `[DEBUG-OBSERVE]` lines; lint/typecheck/test gate; routes to Failure Path (handover via `bkit-debug-abort-handover`). |
| 12 — Close Workflow | — | Sub-step 1a: PR-mode **and** `OBSERVE_MODE = off` only — strip `bkit [verbose ci]` from PR title (mirror of Step 7 sub-step 2a's set). `OBSERVE_MODE = instrument` close intentionally preserves the marker — analyse cycle + post-handover human pushes want continued verbose. Then commit `chore({FID}): close-workflow{VERBOSE_SUFFIX}` → push + (PR creation path) `chore({FID}): create-pr{VERBOSE_SUFFIX}` (`VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `DEBUG_MODE = local`). Set state `In Review`; `{LABELS}` unchanged (prior phase label + `Debug` persist). Comment includes CI run link if applicable. Worktree persists. Skipped if `OBSERVE_MODE` = analyse. |

**Failure Path** includes conditional handover via `@bkit-debug-abort-handover` when max-retry exhausted, writing `debug-handover.md`. PR-mode `bkit [verbose ci]` marker is **intentionally preserved** here (NOT stripped) — human investigator picking up the failed PR wants ongoing verbose CI on their pushes; see § `bkit [verbose ci]` Marker Propagation for the cleanup invariant.

### `/bkit-ship` — 12 steps

**Goal:** merge PR, archive plans, clean up worktree.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: assert `git rev-list --count origin/dev..dev` = 0 (Failure Path if non-zero — see § Pre-worktree divergence guard). Acquire lock. Set label `Ship`, `In Progress`. NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Rebase against `origin/dev` with tiered conflict recovery (see § Rebase Conflict Tiering): `merge=union` for append-only docs auto-resolves at git layer; `pnpm-lock.yaml`-only conflicts handled by inline regen-and-continue; everything else touches `.rebase-failed` sentinel for Step 4. Branch eligibility check (same as debug). Resolve `PR_NUMBER` and `PR_BASE` for current branch via `gh pr list --json number,baseRefName` (no open PR → Failure Path; `PR_BASE` != dev → Failure Path — blocks accidental squash-merge into `main`). Reject if PR has any failing CI checks (`gh pr view --json statusCheckRollup`). Init `MERGE_ATTEMPT` = 0. |
| 3 — Regression Guard | — | No CI run found for PR HEAD SHA → `REGRESSION_VERDICT=FAIL` immediately. Otherwise find the most recent prior failed CI run on the branch; for each step that failed in that prior run, assert the same-named step in the run on PR HEAD has `conclusion=success` (not `skipped`/`cancelled`/missing). Catches Vercel-ignore rules and `decide`-step partial-tier demotion masking a never-fired regression gate; fails loudly into Failure Path so a human can re-run via `/bkit-debug` or push a `bkit [force build]` commit. Universal — applies to both router-dispatched and manual `/bkit-ship` invocations. |
| 4 — Conflict Resolve | `@bkit-ship-conflict-resolve` _(only if rebase sentinel set)_ | Writes `ship-conflict-resolve.md`. `RESOLVE_VERDICT` = PASS clears the `.rebase-failed` sentinel and the workflow continues; FAIL leaves sentinel and routes to Failure Path → `@bkit-debug-abort-handover`. |
| 5 — Merge PR | — | `gh pr merge {PR_NUMBER} --squash --delete-branch --subject "<title> (#{PR_NUMBER})" --body ""` (empty body — feature commits embed `bkit [skip ci]` which would suppress post-merge CI on `dev`). `state` = MERGED → Step 8. Else if `MERGE_ATTEMPT` <= `MAX_MERGE_ATTEMPT` → Step 6. Else Failure Path. |
| 6 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if not merged)_ | Writes `ship-failure-diagnose-{MERGE_ATTEMPT}.md`. |
| 7 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if not merged)_ | Writes `ship-failure-remediate-{MERGE_ATTEMPT}-log.md`. Increment `MERGE_ATTEMPT`; re-run Step 5. |
| 8 — Switch to Dev | — | `git checkout dev && git fetch origin dev`. Re-assert divergence guard (`origin/dev..dev` = 0); `git pull --ff-only origin dev`. Steps 9+ run on `dev`. |
| 9 — Update Docs & Summary | `@bkit-ship-update-docs` ‖ `@bkit-ship-summary` (parallel) | No archive step — plans are already at canonical `docs/plans/{YYYYMM}/`. Both subagents in parallel. `update-docs` writes `ship-update-docs.md` + edits cataloged docs (incl. `docs/completed.md`, which references `docs/plans/{YYYYMM}/{FID}-plan.md`). `summary` writes `ship-summary.md`. Sibling-blind: `summary` MUST NOT read `update-docs.md`. Commit `docs({FID}): update-docs-summary`. `SUMMARY_VERDICT` or `UPDATE_DOCS_VERDICT` = FAIL → Failure Path. |
| 10 — Prune Skills | — | Uninstall any `.agents/skills/` skills not listed in `.agents/skills.md` via `npx skills remove -y`. Commit `chore({FID}): prune-skills`. |
| 11 — Worktree Cleanup | — | `git worktree remove .worktrees/{FID} --force` → `git worktree prune` → `git branch -D feat/{FID}` → `git push origin --delete feat/{FID}` → `git fetch --prune origin`. Local + remote branch deletion is explicit because `gh pr merge --delete-branch` aborts both sides when the local one fails (worktree holds the ref). Squash-merged tip is unreachable from `dev`, so `-D` is correct. |
| 12 — Close Workflow | — | Assert squash-merge CI run completed `bkit-tests` (not cancelled / skipped). Final commit `docs({FID}): ship DONE bkit [skip ci]` → push `dev`. Add `Merged` label, drop `Failed` if present, state `Done`. |

**Failure Path** includes conditional handover via `@bkit-debug-abort-handover` writing `ship-handover.md` when max-retry exhausted.

### `/bkit-audit` — 7 steps

**Goal:** read-only multi-lens audit. No code, no execution. Always hard-stops after summary for human review (do NOT invoke `/bkit-plan` or `/bkit-build`). Triggered ad-hoc by a human; NOT part of the design → plan → build → debug → ship auto-cycle.

<!-- prettier-ignore -->
| Step | Subagent(s) | Read | Write | Notes |
| --- | --- | --- | --- | --- |
| 1 — Start Workflow | — | Linear issue | `.lock`, Linear comment | Pre-flight: assert `git rev-list --count origin/dev..dev` = 0 (Failure Path if non-zero — see § Pre-worktree divergence guard). Resolve argv (no-arg / glob / `BAR-NNN`) → set `SCOPE_GLOB`, `ISSUE_ID`. Create-or-reuse master Linear issue. NO phase label. FID-format invariant assertion (standard form OR `-audit-{YYYYMMDD-HHmm}` suffix for re-audits). NO commits on `dev` — `status.jsonl` init + `audit-start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | repo | `.worktrees/{FID}`, `audit-input.md` | Create or resume worktree on `feat/{FID}` (fallback: `HEAD`). Read-only — drops `pnpm install --frozen-lockfile`. |
| 3 — Audits | `@bkit-audit-architecture` ‖ `-hotpath` ‖ `-config` ‖ `-reliability` ‖ `-observability` ‖ `-debt` ‖ `-dead-code` ‖ `-deps` ‖ `-security` ‖ `-tests` ‖ `-docs-drift` (parallel 11) | `audit-input.md` | 11 x `audit-{slug}.md` | Sibling-blind. Each auditor reads `.agents/docs.md` for project context (stack-aware report; stack-agnostic probes). Post-Step-3 assertion gate: for each slug verify file exists, non-empty, verdict header present. `LENS_VERDICT_WORST` = worst-of-11 (`FAIL > CONCERNS > PASS`); `MISSING`/`EMPTY` → `CONCERNS`-equivalent; `NO_VERDICT` → `FAIL`-equivalent → Failure Path. |
| 4 — Synthesise | `@bkit-audit-synthesise` | glob `audit-*.md` | `audit-v1-synthesis.md` | Parse standard markdown finding headings via regex `^## \[(\w+)\]\[(\w+)\] (.+) — (.+)$`; dedup on `(class, normalized_location)` with 5-line bucket; severity max-wins; cross-audit confidence upgrade one tier. `SYNTHESIS_VERDICT` = FAIL → Failure Path. |
| 5 — Organise | `@bkit-audit-organise` | `audit-v1-synthesis.md` | `audit-v2-ranked.md` + Linear sub-issues per workstream | Render severity x class matrix + ranked list + per-class appendix + workstreams. Post-step: orchestrator parses `## Workstreams` section and `save_issue` per `WS-{N}` with `parentId: {ISSUE_ID}` (existing match → `save_comment` sync). `ORGANISE_VERDICT` = FAIL (orphan correlation_id) → Failure Path. |
| 6 — Summary | `@bkit-audit-summary` | highest `audit-v*` + glob `audit-*.md` | `audit-summary.md` | Subagent emits 500-token summary. Orchestrator appends Step 6 section to master Linear comment with `audit-summary.md` content verbatim. Commit `chore({FID}): summary bkit [skip build] bkit [skip ci]` → push. `SUMMARY_VERDICT` = FAIL → Failure Path. |
| 7 — Close Workflow | — | — | `docs/audits/{FID}-audit.md` (copy of v2) | Friction sweep + copy v2 to `docs/audits/` → `cd $REPO_ROOT` → checkout `dev` → merge `feat/{FID}` → push `dev` → `git worktree remove` → delete local + remote `feat/{FID}` → `git worktree prune`. Set state `In Review`; NO phase label change (audit applies no label). |

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

### `/bkit-cloud` — phase-routed dispatch

**Goal:** phase-routed cloud dispatcher. Reads `{PHASE}` + `{ARG}` from invocation args and routes to the matching phase skill. **CI-class** (`ship`/`debug`, `{ARG}` = PR) runs Steps 1–4 (guard + opt-in gate + dispatch); **brief-class** (`design`/`plan`/`build`, `{ARG}` = issue) runs Step 1 then Step 4 — the human `workflow_dispatch` is the opt-in, and the dispatched skill ingests its own brief + owns its `status.jsonl` / worktree / FID. No worktree, no tracker state change beyond a single comment line.

<!-- prettier-ignore -->
| Step | Notes |
| --- | --- |
| 1 — Start Workflow | Classify `{PHASE}` → `CLASS`. CI-class: resolve `{FID}` from `gh pr view {ARG} --json headRefName` (`feat/{FID}` convention), `{ISSUE_ID}` from PR body / branch slug, init `status.jsonl` (`cloud`). Brief-class: `{ISSUE_ID}` = `{ARG}`; no FID / no `status.jsonl` (the skill owns them). Create fresh tracker comment header. |
| 2 — Stale-Run Guard | **CI-class only.** Compare CI run `headSha` to PR `headRefOid`. Mismatch → `GUARD_VERDICT` = FAIL (newer commit in flight) → exit 0 with no-op comment line. |
| 3 — Opt-In Gate | **CI-class only.** Require tracker `Auto` label on issue. Absent → `AUTO_VERDICT` = FAIL → exit 0 with no-op comment line + kill-switch propagation. |
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
| `/bkit-ship` | Step 11 dedicated worktree cleanup: `git worktree remove --force` + `git worktree prune`. |

**`pnpm install --frozen-lockfile`** is symlink-only (~5s, no network). Required because pnpm per-package `node_modules` symlinks are not inherited from main checkout. A root-level symlink is not a substitute — individual packages need their own.

**Manual cross-IDE handoff** — user-triggered only:

1. `/bkit-design` and `/bkit-plan` complete → changes are on `dev` (worktree pruned at close).
2. Human reviews on `dev`. Runs `/bkit-build` → recreates worktree from `dev`.
3. `/bkit-build` pushes implementation → CI runs.
4. On CI failure → human triggers `/bkit-debug` → reuses or creates `fix/{FID}` worktree.

`/bkit-worktree-sync` and `/bkit-worktree-prune` exist for ad-hoc manual sync; not invoked by any phase command.

## Tracker Integration

Pluggable via `bkit install --tracker=<github|linear|none>`. Per-tracker MCP server endpoints, tool names, and call shapes are written inline at each call site as `github`/`linear`/`none` blocks; the installer keeps the chosen tracker's block and drops the others when mirroring to `.claude/commands/` + `.cursor/commands/` (see § Tracker Blocks). `.agents/trackers.md` holds the marker contract + cross-cutting conventions only.

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
| `bkit:auto` | Human (via tracker UI) at issue creation; written by issue-id-extraction snippet's create-issue fallback | Opt-in gate for `/bkit-cloud` CI-class (ship/debug) dispatch. Removed by any workflow that finds `bkit:auto` absent on the linked issue (kill-switch propagation). |
| `bkit:failed` | Failure Path of any workflow | Workflow hit its Failure Path; human triage required. Phase label persists alongside, so reviewers see which workflow failed. Cleared when `/bkit-debug` Step 1 starts (debug entry supersedes the prior failure marker) and when `/bkit-ship` Step 12 adds `bkit:merged` (terminal success). |
| `bkit:debug` | `/bkit-debug` Step 1 | `/bkit-debug` is running on top of a prior phase (typically `bkit:build` or `bkit:ship`). Prior phase label persists alongside, so reviewers see which workflow is being debugged. |

### Tracker-specific state

Issue state semantics (Linear's "In Progress" / "In Review" / "Done"; GitHub's `open` / `closed` + optional Projects v2 board status) are written inline as per-tracker blocks at these call sites:

<!-- prettier-ignore -->
| Snippet | When |
| --- | --- |
| `issue-update-phase` | Step 1 of every phase. Sets phase label, tracker-specific "active" state. |
| `issue-update-review` | Close Workflow of `/bkit-design`, `/bkit-plan`, `/bkit-build`, `/bkit-debug`. Hand-off state (Linear "In Review"; GitHub no-op — phase label carries signal). |
| `issue-update-merged` | `/bkit-ship` Step 12. Terminal close (Linear "Done"; GitHub `state: closed`). |
| `issue-update-failed` | Failure Path. Adds `bkit:failed` additive label. |
| `issue-update-debug` | `/bkit-debug` Step 1. Adds `bkit:debug` additive label. |
| `issue-update-status` | Step 1 (design/plan/build/debug/ship) → "In progress"; phase Close (design/plan/build/debug) → "In review"; `/bkit-ship` Step 12 → "Done". GitHub Projects v2 board (`bkit.githubProject`; skipped if unset/absent). Linear no-op (issue state already carries it). |

### Comment lifecycle

NEW comment per workflow step via tracker MCP. Step 1 posts the first comment; every later step posts its own. NEVER edit, paraphrase, or carry forward prior comment IDs. See § Comment Lifecycle for templates.

### Issue blockers (`/bkit-build` Step 1)

`/bkit-build` Step 1 calls the tracker's `issue-read` snippet and parses tracker-native blocker relations (Linear: `relations.blocked_by` via `get_issue({ includeRelations: true })`; GitHub: issue body text scan for `Blocked by #N` references). Any blocker whose state is not closed/done → Failure Path with `Blocked by {BLOCKER_ID} (state: {BLOCKER_STATE})`. Workstream sub-issues spawned by `/bkit-design` Step 9 record their `Requires` edges via the `set-blocked-by` snippet, so this gate also enforces workstream ordering.

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
gh pr merge {PR} --squash --delete-branch --subject "..." --body ""   # Ship Step 5 — empty body strips feature `bkit [skip ci]`
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
| `bkit [skip build]` | Vercel ignore script cancels preview build; CI cap remains at partial tier. |
| `bkit [force build]` | Forces full CI + Vercel build even on docs-only paths. Used by `/bkit-build` Step 16 when `supabase/migrations/` changed without it on HEAD. |

**Docs-only commits:** workflows append BOTH `bkit [skip build]` and `bkit [skip ci]` — they are independent levers and both must be present for cleanest skip.

<!-- prettier-ignore -->
| Workflow commit | Tags |
| --- | --- |
| `chore: pre-worktree uncommitted changes` (Step 2 of every phase) | `bkit [skip build] bkit [skip ci]` |
| `chore: pre-worktree uncommitted changes` (Step 2 of every phase) | `bkit [skip build]` |
| `chore({FID}): {step-slug}` for per-step in-worktree commits (e.g. `worktree-setup`, `branch-sync`, `install-skills`, `plan-execute sub-plan N`, `plan-verify sub-plan N attempt M`, `failure-diagnose attempt N`, `build-challenge attempt N`, `build-challenge-reconcile attempt N`, `build-challenge-remediate attempt N`, `build-challenge-tests`, `summary`, `create-pr`, ship `merge-pr attempt N`, ship `prune-skills`, ship `update-docs-summary`) | none — in-worktree, never visible to CI on `dev` |
| `chore({FID}): summary bkit [skip build] bkit [skip ci]` (design Step 8 summary, plan Step 10 summary) | `bkit [skip build] bkit [skip ci]` |
| `fix({FID}): {description}` (debug Step 5 failure-remediate) | none — Step 7 pushes this commit directly so `fix(...)` becomes the CI-triggering HEAD (dodges `^chore:`-prefix Vercel-ignore rules and partial-tier `decide`-step demotion). `{description}` derived from first `DONE — Step` line in `debug-failure-remediate-{TEST_ATTEMPT}-log.md`. Debug Step 7 adds NO intermediate `chore(...)` commit before push. |
| `docs({FID}): ship DONE` (ship Step 12 close-workflow on `dev`) | `bkit [skip ci]` |
| `docs({FID}): {phase} aborted` (Failure Path handover) | `bkit [skip build] bkit [skip ci]` |
| `chore({FID}): close-workflow` (build Step 18 — opted-in: `bkit [auto route]` suffix when issue carried `bkit:auto` at close time) | none on base commit; opted-in adds `bkit [auto route]` (loud, not a suppressor) — final HEAD on push, fires `pull_request` synchronize + CI auto-route gate |
| `chore({FID}): close-workflow` (debug Step 12 PR-mode — opted-in) | none / `bkit [auto route]` (PR-mode, conditional) — same as build |
| `chore({FID}): create-pr` (debug Step 12 local-mode — opted-in) | none / `bkit [auto route]` (local-mode, conditional) — CI-triggering HEAD in local-mode |

**CI trigger mechanic (build / debug / ship aligned):** every workflow's last push to a CI-validated ref must leave a HEAD without `bkit [skip ci]`, else GitHub's `pull_request` (build/debug) or `push` (ship) synchronize is suppressed and `statusCheckRollup` stays empty — Ship Step 2's fail-fast gate would then admit a vacuously green PR. Trigger lives in the close-workflow step (the natural final-push location for build & debug); ship triggers via the squash merge subject. The shared HEAD-subject assertion below is the enforcement mechanism — see § HEAD-Subject Assertion.

### HEAD-Subject Assertion (shared, single source — #184)

A single deterministic assertion enforces the CI-trigger contract at the orchestrator layer. It is **invoked by orchestrators** (NOT a git hook — the invariant is contextual; bkit intentionally pushes `[skip ci]` HEADs intermediately):

- **Build Gate 18 (HEAD clause):** fires on the close-workflow final push (HEAD must be clean and may carry `bkit [auto route]`).
- **Build Step 17 + Debug Step 12 create-pr (PR-title clause):** fires on PR creation — HEAD is the `[skip ci]` create-pr commit by D2 design, so the HEAD clause does NOT run here; only PR title is checked.
- **Debug Gate 12 (HEAD clause):** fires on the close-workflow commit / create-pr commit per mode (see § `bkit [auto route]` Marker Propagation).
- **Ship Gate 5 + squash `--body ""` (PR-title clause):** fires at merge — squash subject becomes `dev` HEAD.

**Contract (DENY-LIST — never an allow-list):**

```bash
# HEAD-subject clause: run at the final CI-triggering push. Scan the FULL message
# (%B, body included), not just %s — GitHub reads the whole commit message for skip
# tokens, so a suppressor in the body kills CI even with a clean subject line.
HEAD_MSG=$(git log -1 --pretty=%B)
if echo "$HEAD_MSG" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
  echo "HEAD-subject assertion FAILED: HEAD commit message contains a CI-suppressing token." >&2
  echo "Fix: ensure the final commit before push is the loud close-workflow commit (no skip token in subject OR body)." >&2
  echo "Escape hatch: add 'bkit [force build]' to override Vercel-only skip tags." >&2
  exit 1
fi

# PR-title clause: run at create-pr and ship squash
PR_TITLE=$(gh pr view {PR_NUMBER} --json title --jq .title)
if echo "$PR_TITLE" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]|\[skip build\]'; then
  echo "PR-title assertion FAILED: PR title '$PR_TITLE' contains a CI-suppressing token." >&2
  echo "Fix: remove the suppressing tag from the PR title. Use 'bkit [force build]' if a Vercel-only skip is needed." >&2
  exit 1
fi
```

- **Deny-list tokens — HEAD message (subject + body):** `[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]`, `[actions skip]`.
- **Deny-list tokens — PR title additionally:** `[skip build]` (squash subject becomes `dev` HEAD; `[skip build]` there skips post-merge deploy).
- **Legitimate loud tokens that pass automatically (deny-list, so no allow-list needed):** `bkit [auto route]`, `bkit [verbose ci]`, `bkit [force build]`. None contain a suppressor substring.
- **Hard-fail loud:** name the offending commit subject or PR title + the fix. Route to Failure Path. No silent auto-fix.
- **Escape hatch:** `bkit [force build]` on HEAD overrides Vercel-only `[skip build]` and is not itself a suppressor.

Rationale: the invariant is **contextual** — bkit intentionally pushes `[skip ci]` HEADs intermediately (D2: `worktree-setup`/`create-pr` commits) and to `dev` (status bookkeeping). A blanket pre-push hook would wrongly block those legitimate pushes. Only the orchestrator knows which push is the final loud one.

<!-- prettier-ignore -->
| Workflow | Step | Mechanic | Why this form |
| --- | --- | --- | --- |
| `/bkit-build` | 18 (close-workflow) | Final commit `chore({FID}): close-workflow`, no skip tags + `git push` | Drops `bkit [skip ci]` from the existing status commit; final commit before push fires PR `pull_request` synchronize |
| `/bkit-debug` | 12 (close-workflow) | Final commit `chore({FID}): close-workflow`, no skip tags + `git push` | Same form as build — single commit doubles as status update + CI trigger |
| `/bkit-ship` | 4 (merge-pr) | `gh pr merge --squash --body ""` — squash subject becomes dev HEAD, body empty | `gh pr merge` is the only API; empty body strips PR-body `bkit [skip ci]` from the squash subject. Followed by CI-trigger verification gate (`gh run list` captures `RUN_ID`) |
| `/bkit-ship` | 9 / 10 / 12 (post-merge dev pushes) | Step 9 `docs({FID}): update-docs-summary`, Step 10 `chore({FID}): prune-skills`, Step 12 `docs({FID}): ship DONE bkit [skip ci]` | Post-merge docs-only; PR already merged, dev's CI fired by Step 5, no re-trigger needed. Per-step commits batched locally; single push to `dev` at Step 12 close-workflow. |

All intermediate workflow commits (start-workflow, summary, create-pr, etc.) retain `bkit [skip build] bkit [skip ci]` — only the trailing `close-workflow` commit is unmarked, and it is the LAST commit before the final `git push`. This also fixes the prior latent bug where build Step 18 / debug Step 12 commits were never explicitly pushed.

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

Phase labels (`bkit:design`/`bkit:plan`/`bkit:build`/`bkit:ship`/`bkit:merged`) are mutually exclusive — drop old before adding new. Additive labels (`Failed`, `Debug`) skip the drop and live alongside the phase label. `Failed` is additionally cleared by `/bkit-debug` Step 1 (debug entry) and `/bkit-ship` Step 12 (`bkit:merged`) so a successfully-recovered or shipped issue does not carry a stale Failure Path marker.

### Sub-plan loop discovery

```bash
SUB_COUNT=$(ls docs/plans/{YYYYMM}/{FID}-plan-*.md 2>/dev/null | wc -l)
[ "$SUB_COUNT" -eq 0 ] && SUB_COUNT=1 && SINGLE_PLAN=true
# Per N: reset VERIFY_ATTEMPT=1 at start of each iteration
```

### Turbo command (verbatim)

```bash
pnpm turbo lint typecheck test --filter='...[origin/dev]'
```

No quote / filter / glob edits. Pre-PR is lint+typecheck+unit only; debug normal-mode adds `test:integration test:e2e`.

### Tracker issue-create return guard

When a tracker call creates a new issue, it MUST return a non-empty `id`. Empty/null → Failure Path with `Tracker issue create returned no id`.

### Pre-worktree carry-over commit (Steps 2 of design / plan / build / ship)

```bash
if [ -n "$(git status --porcelain | grep -v '^??')" ]; then
  git status --short
  git add -- ':\!.DS_Store' ':\!*.log' ':\!*.swp' ':\!node_modules'
  git commit -m "chore: pre-worktree uncommitted changes bkit [skip build] bkit [skip ci]"
fi
```

Commits any uncommitted local changes before creating worktree so new branch inherits them. `/bkit-debug` Step 2 omits this — it intentionally branches off `origin/dev` for hotfix isolation.

## File path conventions

<!-- prettier-ignore -->
| Type | Path |
| --- | --- |
| Worktree | `.worktrees/{FID}/` (gitignored) |
| Design draft | `docs/plans/{YYYYMM}/{FID}-design.md` |
| Plan draft | `docs/plans/{YYYYMM}/{FID}-plan.md` (+ `{FID}-plan-N.md` if SPLIT) |
| Plan active | `docs/plans/{YYYYMM}/{FID}-plan*.md` (moved here in `/bkit-build` Step 2) |
| Plan completed | `docs/plans/{YYYYMM}/{FID}-plan*.md` (moved here in `/bkit-ship` Step 8) |
| Workflow logs | `docs/plans/{YYYYMM}/logs/{FID}/*.md` |
| Workflow state | `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (on `dev` for all five workflows — BAR-187; see § status.jsonl) |
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
| Debug test loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `MAX_TEST_ATTEMPT` = 3 per debug attempt; `MAX_DEBUG_ATTEMPT` = 3 outer | Failure Path with `@bkit-debug-abort-handover` |
| Ship merge loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `MAX_MERGE_ATTEMPT` = 3 | Failure Path with `@bkit-debug-abort-handover` |

**Filename convention:** `docs/plans/{YYYYMM}/logs/{FID}/{phase}-{step}-N-{ATTEMPT}.md` (e.g. `build-verify-plan-1-2.md` = sub-plan 1, verify attempt 2). Verifiers MUST read prior verify+remediate logs before deciding `PASS`/`FAIL`. Remediators MUST glob their own prior logs and not repeat strategies.

## Structured Docs Writer Map

Pipeline writes to five structured docs at `docs/` root. Each has strict sole-writer policy.

<!-- prettier-ignore -->
| Doc | ID prefix | Sole writer(s) | Source step |
| --- | --- | --- | --- |
| `docs/knowledge.md` | `KN-` | `@bkit-build-plan-gaps-remediate`, `@bkit-build-challenge-remediate`, `@bkit-debug-failure-remediate` | After verified fix |
| `docs/decisions.md` | `DE-` | `@bkit-design-generate`, `@bkit-debug-failure-remediate` (forced arch) | At decision time |
| `docs/completed.md` | — | `@bkit-ship-update-docs` only | `/bkit-ship` Step 9 |
| `docs/pending.md` | — | `@bkit-design-generate` (out-of-scope features), `@bkit-plan-generate` (out-of-scope ideas), `@bkit-plan-update` (scope expansions from `/bkit-plan` Step 7), `@bkit-debug-abort-handover` (handover context) | `/bkit-design` Step 4, `/bkit-plan` Steps 3 & 7, Failure Path handover |

All other agents document blockers and out-of-scope items in their own log file (Plan Execution / Challenge Remediation / etc — see each subagent's H1 for the canonical output name) — workflow reads those at step boundaries and decides what (if anything) to mirror to the issue tracker.

Append-only. Cross-doc grep by ID: `grep -rE 'KN-\d+|DE-\d+' docs/`. See `.agents/docs.md` for doc index and read-by-phase matrix.

## Authoring Checklist for New / Refined Workflows

When writing or editing `.agents/workflows/bkit-*.md` (canonical source — `bkit install` regenerates `.claude/commands/` and `.cursor/commands/`):

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
- [ ] Final step (Close Workflow) marks `status:done`, releases `.lock`, sets state `In Review` (ship: state `Done`, swaps label `Ship` → `Merged`); non-ship phases preserve phase label.
- [ ] Docs-only commits include both `bkit [skip build]` and `bkit [skip ci]` (§ CI / Vercel commit tags).
- [ ] Branch eligibility check on phases that don't create their own branch (`/bkit-debug`, `/bkit-ship`).
- [ ] Token efficient — tables > prose, `→` not `then`, no sub-bullets when a table works.
- [ ] If new agent is introduced, add it to `.agents/prompts.md` with frontmatter rationale and `maxTurns` calibration.
- [ ] If new destructive shell command is introduced, route it through `ask` or `deny` in `.claude/settings.json`.
