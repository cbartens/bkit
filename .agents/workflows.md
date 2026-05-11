# Workflows

> [!CAUTION]
> **Purpose:** Agent-pipeline reference — workflow conventions, execution patterns, IDE integration, subagent catalog.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Subagents are leaves — never invoke other subagents.
> - Subagents NEVER touch Linear. Linear MCP tools are orchestrator/workflow-layer exclusive.
> - When you change a workflow file (`.agents/workflows/bkit-*.md`), mirror change here.

## File Layout

Canonical source lives in `.agents/workflows/`. `bkit install` regenerates `.claude/commands/` (byte-identical) and `.cursor/commands/` (T1/T2/T3 transformed). Never edit the generated copies.

```
.agents/workflows/
├── bkit-design.md         # Workflow 1/5 — 10 steps; hard stop after summary
├── bkit-plan.md           # Workflow 2/5 — 11 steps; hard stop after summary
├── bkit-build.md          # Workflow 3/5 — 18 steps; CI takes over after PR
├── bkit-debug.md          # Workflow 4/5 — 8 steps; PR-debug or normal-debug mode
├── bkit-ship.md           # Workflow 5/5 — 11 steps; merge → archive → close
├── bkit-worktree-sync.md  # Utility — human-triggered; merge worktree branch into IDE branch
└── bkit-worktree-prune.md # Utility — human-triggered; remove worktree(s) and optionally branch
```

<!-- prettier-ignore -->
| Command | FID-driven | Hard stop | Output |
| --- | --- | --- | --- |
| `/bkit-design` | yes | yes | `docs/plans/drafts/{FID}-design.md` |
| `/bkit-plan` | yes | yes | `docs/plans/drafts/{FID}-plan.md` (+ `{FID}-plan-N.md` if SPLIT) |
| `/bkit-build` | yes | no — CI continues | PR to `dev` with plan-link URL |
| `/bkit-debug` | yes | no | Remediated commit pushed to feature branch |
| `/bkit-ship` | yes | yes | Squash-merged PR; plans moved to `docs/plans/completed/{YYYYMM}/`; worktree gone |
| `/bkit-worktree-sync` | arg `{FID}` | n/a (interactive) | Merged or rebased commits in current branch |
| `/bkit-worktree-prune` | optional arg `{FID}` | n/a (interactive) | Deleted worktree (and optionally branch) |

## Workflow Authoring Rules

`.agents/workflows/*.md` are AI-only execution surfaces. Every byte is paid on every run.

- **Instructions only:** NO rationale, NO parentheticals explaining "why", NO "we don't do X because Y" notes, NO inline comments justifying behaviour.
- **Removal = delete:** When dropping an instruction, delete it. NEVER replace it with an explanation of the removal.
- **Self-contained:** Each workflow file MUST stand alone. NO cross-references to `.agents/workflows.md` or other meta docs. If the orchestrator needs the rule, inline it; if it doesn't, leave it out.
- **Rationale lives here:** Decisions, trade-offs, history, meta-commentary belong in this file (`.agents/workflows.md`) — NEVER in the per-workflow files.
- **Reuse wording and formatting:** ALWAYS `grep .agents/workflows/` before writing. Copy closest existing phrasing AND formatting verbatim (backticks, indentation, line breaks, punctuation, spacing, etc). Match existing shape exactly for any sections that appear more than once (subagent invocations, gate checklists, `bash` blocks, comment fences, etc).
- **Cross-workflow alignment:** ALWAYS change shared lines in ALL workflows using them.
- **Procedural conditionals:** Any flow-gating conditional uses bold `**If** {condition} → {action}.` (with `**Else** → {action}.` for branches), regardless of syntactic shape. Test: if reordering reads as "If {X}, {Y}" naturally, it IS one. Excludes inline qualifiers (`if any`, `if defined`), dispatch tables (`PASS = …`, `STANDARD → …`), iteration (`For each …`), bash inside backticks, and output-template placeholders.
- **Variable references:** In prose, variable names / field labels / placeholder identifiers go in backticks. Two forms with distinct meaning: bare `` `VAR` `` = reference (conditionals, schema); `` `{VAR}` `` = interpolation site (orchestrator substitutes value — paths, JSON, commit msgs, Context payloads). Operators stay outside (`` `VERIFY_ATTEMPT` = 0 ``). Singular literal enum values stay plain when compared (`` **If** `VERDICT` = PASS ``); enum unions are one backticked unit (`` `PASS|CONCERNS|FAIL` ``). Inside fenced output-format blocks: keep plain. NEVER use `${VAR}` outside bash code fences.

## Two-Layer Separation Rules

> **Agents NEVER call Linear MCP tools.** Linear (`save_issue`, `save_comment`, `list_comments`, `get_issue`, `create_issue`, etc.) is exclusive to workflow layer. Agent that calls Linear is a protocol violation.

<!-- prettier-ignore -->
| Capability | Workflow (`.agents/workflows/`) | Agent (`.agents/prompts/`) |
| --- | --- | --- |
| Invoke Linear MCP | ✅ | ❌ |
| Read/write `docs/` | ✅ | ✅ |
| Read/write source | via subagent delegation | ✅ (gated by tool surface) |
| Run `git` | ✅ (`add`, `commit`, `push`, worktree ops) | read-only checks (`status`, `branch`, `log`) only |
| Invoke subagents | ✅ via `@agent-name` (Agent tool) | ❌ leaves only |
| Write `status.json` / hold `.lock` | ✅ | ❌ |

**Why:** agent must be runnable standalone (`@bkit-build-challenge .worktrees/xxx-123` works without live Linear issue). All inputs arrive via filesystem paths from orchestrator. All outputs land on disk under `docs/plans/logs/{FID}/`, plan/design doc, source files, or structured docs at `docs/{knowledge,decisions,completed,pending}.md`. Workflow reads agent outputs and decides what (if anything) to mirror to Linear.

## Common Workflow Anatomy

Every phase command (`design`, `plan`, `build`, `debug`, `ship`) follows the same skeleton:

```
1. YAML frontmatter (description)
2. Header (output, Linear MCP tool reference)
3. Execution Protocol caution block (canonical invariants — see below)
4. Failure Path
5. Step 1 — Start Workflow         (pre-flight divergence guard, lock acquire, Linear init, comment create — status init deferred to Step 2; ZERO commits on `dev`)
6. Step 2 — Worktree Setup         (create/resume .worktrees/{FID}, copy env, pnpm install, save input, status init + `start-workflow` + `worktree-setup` step entries committed on `feat/{FID}`)
7. Phase-specific steps            (subagent invocations, gates, save_comment append)
8. Summary step                    (subagent → commit → push → verdict)
9. Close Workflow                  (status done, lock release, state → In Review/Done; ship swaps label to `Merged`; non-ship phases preserve phase label)
```

**Step convention:** every step ends with `### 🔒 Gate N — {Step Name}` checklist (must verify before proceeding), and writes to same Linear comment by appending one fenced section.

**Pre-worktree git scope:** Step 1 and Step 2's pre-worktree guard run on the originating branch (often `dev`). Allow-list `git add docs/plans/ .agents/friction.md` only; guard the commit with `git diff --cached --quiet ||`. NEVER `git add -A` until after `cd "$WORKTREE_PATH"` — it sweeps the user's unrelated in-flight edits into the workflow commit, which then rides feat → dev on merge. Post-worktree (Step 3+) `git add -A` is fine; cwd is the sandbox. `git worktree add` does not inherit dirty state, so leaving other edits on dev's working dir is correct.

**Pre-worktree divergence guard (BAR-184):** ALL phase workflows (`design`, `plan`, `build`, `debug`, `ship`) Step 1 makes ZERO commits on `dev` and asserts `git rev-list --count origin/dev..dev` = 0 as a pre-flight. Step 1's `start-workflow` status.json entry is deferred to Step 2 inside `.worktrees/{FID}`, where `start-workflow` and `worktree-setup` step entries are recorded as four commits on `feat/{FID}`. `bkit-ship` Step 7 (Switch to Dev) additionally re-asserts the guard and uses `git pull --ff-only`, routing to Failure Path on divergence. Rationale: workflow commits on local `dev` pre-worktree never reach `origin/dev` directly — they accumulate locally until the feature PR squash-merges, at which point local `dev` diverges from the squash commit and any subsequent ship's `git pull` hits status.json rebase conflicts. Six ship-cycle friction recurrences surfaced the symptom; the divergence accumulates silently in plan/design/build/debug runs and surfaces at the next ship pre-flight.

### Execution Protocol — canonical invariants

Lifted verbatim into every workflow's caution block. If you change one wording, change all five workflow files.

<!-- prettier-ignore -->
| Invariant | Rule |
| --- | --- |
| **Order** | Execute sequentially unless step explicitly says "in parallel". |
| **Placeholders** | Assert `{FID}`, `{ISSUE_ID}`, `{STATE}`, `{LABELS}`, `{PR_NUMBER}`, `{OWNER_REPO}`, `{BRANCH}` non-empty before any tool call → else **Failure Path**. |
| **Tools** | Verify every return; do NOT assume success. |
| **Subagents** | Invoke via `@name` with Agent tool. Orchestrator provides Read paths and context; subagent executes and writes directly. **PROHIBITED:** inlining subagent steps or producing artifact yourself — same filenames/conclusions ≠ compliance. |
| **Artifacts** | `Write:` artifact IS the deliverable; always emit; assert non-empty; empty → **Failure Path**. |
| **Gates** | Verify all checkboxes before next step. Skipped gate = invalid work. |
| **No improv** | No ad-hoc task lists, no skipping, no alternative approaches, no scope beyond the file. |
| **Git** | Pre `add`/`commit`: log `git status --short`; NEVER stage `.DS_Store`, `*.log`, editor swaps, `node_modules/`; NEVER use `--no-verify`. Pre `push`: assert `{BRANCH}` non-empty. |
| **Worktree** | Step 2 `cd`s into `.worktrees/{FID}`; cwd persists across subsequent Bash calls. If any later step finds `pwd` outside worktree → **Failure Path**. |
| **Status** | `docs/plans/logs/{FID}/status.json` is central state file; ONE entry per step (see § status.json). |
| **Resume** | On start, read `status.json` and pick up after last `done` step in active `in_progress` workflow. |
| **Labels** | Phase labels (`Design`, `Plan`, `Build`, `Debug`, `Ship`, `Merged`) are mutually exclusive — drop old phase before adding new. `Failed` is additive — added on Failure Path without dropping phase (see § Linear Integration). |
| **Comments** | ONE Linear comment per workflow run; Step 1 creates, all later steps append (see § Linear Comment Lifecycle). |
| **Failures** | Any step, tool, command failure, or gate that cannot pass → **Failure Path**. |
| **Timeouts** | Any workflow or subagent run > 3600 seconds → **Failure Path**. |
| **Locks** | Acquire `.lock` in Step 1 right after `mkdir -p` of logs dir. Existing lock under 2h old → Failure Path with `Workflow already running for {FID}`. Older lock → considered stale, removed and re-acquired. Released in Close Workflow and Failure Path. |

### `status.json` — workflow state SoT

`docs/plans/logs/{FID}/status.json` is canonical workflow-state source of truth. Written by workflows only; agents MUST NOT read or write it. Enables resume of interrupted run without re-reading the plan.

**Shape (JSON array — one element per workflow run):**

```json
[
  {
    "workflow": "build",
    "startedAt": "2026-04-27T14:02:11Z",
    "status": "in_progress",
    "steps": [
      { "step": "start-workflow", "status": "done", "at": "2026-04-27T14:02:11Z", "artifacts": [] },
      {
        "step": "worktree-setup",
        "status": "done",
        "at": "2026-04-27T14:02:34Z",
        "artifacts": ["docs/plans/logs/xxx-123/build-input.md"]
      },
      {
        "step": "verify-plan",
        "status": "done",
        "verdict": "PASS",
        "at": "2026-04-27T14:08:02Z",
        "artifacts": ["docs/plans/logs/xxx-123/build-verify-plan-N-1.md"]
      }
    ]
  }
]
```

**Field semantics:**

<!-- prettier-ignore -->
| Field | Values |
| --- | --- |
| `workflow` | `design`, `plan`, `build`, `debug`, `ship` |
| `status` | `in_progress`, `done`, `failed` |
| `steps[].step` | kebab-case slug of step name (e.g. `start-workflow`, `plan-verify`, `update-docs-summary`) |
| `steps[].status` | `done` (only `done` is appended; in-progress is implicit by absence of next step) |
| `steps[].verdict` | optional — `PASS` / `CONCERNS` / `FAIL` for verdict-bearing steps |
| `steps[].artifacts` | absolute `docs/plans/logs/{FID}/...` paths (or PR URL for create-pr) |

**Init / append patterns** (every command uses these verbatim):

```bash
# init or append a workflow entry (idempotent guard against double-start)
STATUS="docs/plans/logs/{FID}/status.json"; mkdir -p "$(dirname "$STATUS")"
[ -f "$STATUS" ] || echo '[]' > "$STATUS"
if [ "$(jq -r '.[-1].workflow // ""' "$STATUS")" != "build" ] \
   || [ "$(jq -r '.[-1].status // ""' "$STATUS")" != "in_progress" ]; then
  t=$(mktemp); jq '. + [{workflow:"build", startedAt:(now|todate), status:"in_progress", steps:[]}]' "$STATUS" > "$t" && mv "$t" "$STATUS"
fi

# append a step
t=$(mktemp); jq '.[-1].steps += [{step:"verify-plan", status:"done", verdict:$v, at:(now|todate), artifacts:["..."]}]' --arg v "$VERIFY_VERDICT" "$STATUS" > "$t" && mv "$t" "$STATUS"

# mark workflow done (close-workflow)
t=$(mktemp); jq '.[-1] |= (. + {status:"done"})' "$STATUS" > "$t" && mv "$t" "$STATUS"

# mark workflow failed (Failure Path)
t=$(mktemp); jq '.[-1] |= (. + {status:"failed"})' "$STATUS" > "$t" && mv "$t" "$STATUS"
```

**Resume rule:** read last array element. `status=in_progress` → resume after last `done` step (re-run if its gate artifacts missing on disk). `status=done` or `status=failed` → start new workflow entry.

### Concurrency lock

`docs/plans/logs/{FID}/.lock` is plain text file holding `{ISO_TIMESTAMP} {workflow}`. Acquired in Step 1 right after `mkdir -p`; released in Step N (Close Workflow) and in Failure Path.

```bash
LOCK="docs/plans/logs/{FID}/.lock"
if [ -f "$LOCK" ]; then
  LOCK_AGE=$(( $(date +%s) - $(stat -f %m "$LOCK" 2>/dev/null || stat -c %Y "$LOCK") ))
  [ $LOCK_AGE -lt 7200 ] && { echo "Lock held for {FID} (age ${LOCK_AGE}s): $(cat $LOCK). Stale? rm $LOCK" >&2; exit 1; }
  rm -f "$LOCK"
fi
printf '%s build\n' "$(date -u +%FT%TZ)" > "$LOCK"
```

Stale threshold: **7200s (2h)**. Locks older than that are presumed orphaned (crashed run) and silently replaced.

### Linear Comment Lifecycle

ONE Linear comment per workflow run. Step 1 creates it; every later step appends.

**Step 1 (create) — `save_comment({ issueId, body })`:**

```comment
## {Phase} Workflow
### Step 1 — Start Workflow
[{OWNER_REPO}/tree/{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
```

Capture response: `id` → `{COMMENT_ID}`, `body` → `{COMMENT_BODY}`.

**Steps 2..N (append) — `save_comment({ id: {COMMENT_ID}, body: {COMMENT_BODY} + "\n" + new fenced section })`:**

After each call, capture returned `body` as new `{COMMENT_BODY}` so next step appends on top of latest server-side state.

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
[{phase}-summary.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/{phase}-summary.md)
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
[{phase}-handover.md](https://github.com/{OWNER_REPO}/blob/{BRANCH}/docs/plans/logs/{FID}/{phase}-handover.md)
{handover.md content verbatim}
```

### Linear Writes Are Best-Effort

`save_comment` / `save_issue` are observability, NOT gates. NEVER block, hang, or fail a workflow on Linear write failure. Reads (`get_issue`, `list_comments`) remain authoritative.

**Wrapper semantics — every `save_*` call:**

1. Attempt the call.
2. On `rate_limited` / transient error → wait 5s, retry once.
3. On second failure → set `LINEAR_DEFERRED` = true, append the literal token `LINEAR_DEFERRED=true reason={error}` to the next workflow commit message, proceed to next step.

**Gate phrasing:** Linear-dependent gate items read as `Issue update attempted (state X, label Y)` and `Issue comment attempted (Step N section)`. Do NOT phrase as `Issue state X set` or `Issue comment created` — those imply the write succeeded.

### Versioned Outputs

Every transformation step writes ONE new versioned file in `docs/plans/logs/{FID}/`. Steps NEVER write to `docs/plans/drafts/` directly — `drafts/` is populated only by close-workflow as a copy of the highest-version file.

**Naming:** `logs/{FID}/{workflow}-v{N}-{action}.md` — incrementing `N`, `action` describes what produced this version. Directory conveys FID; do NOT prefix the filename.

**Step output classification** (each step picks exactly one):

<!-- prettier-ignore -->
| Type | Output shape | Example agents |
| --- | --- | --- |
| **Versioned draft** | `{workflow}-v{N}-{action}.md` containing verdict header + record + the (modified) doc body. Single file; NO separate summary. | `plan-generate`, `plan-apply-review`, `plan-apply-scope`, `plan-complexity-split`, `design-generate`, `design-apply-review`, `build-plan-verify`, `build-challenge`, `build-challenge-tests`, `debug-observe-analyse`, `debug-failure-diagnose` |
| **Opinion-only log** | `{step-name}.md` with verdict + findings; never produces a versioned draft. | `plan-review-1/2`, `plan-scope-check-1/2`, `plan-complexity-check`, `design-brainstorm-ideate-1/2`, `design-review-1/2` |
| **Summary-only** | `{workflow}-summary.md` (or `{workflow}-handover.md`); produced once at end of workflow. | `plan-summary`, `design-summary`, `build-summary`, `debug-summary`, `ship-summary`, `debug-abort-handover` |
| **Code-mutation** | NO versioned draft; step's summary log records `git diff --stat` instead of restating intent. | `build-plan-execute`, `build-plan-gaps-remediate`, `build-challenge-remediate`, `debug-observe-instrument`, `debug-observe-revert`, `debug-failure-remediate`, `ship-update-docs` |

**Versioned chain — design** (`drafts/{FID}-design.md` is the canonical artifact; populated only at close):

<!-- prettier-ignore -->
| Step | Output (in `logs/{FID}/`) | Type |
| --- | --- | --- |
| `design-brainstorm-1` | `design-brainstorm-ideate-1.md` | opinion-only log |
| `design-brainstorm-2` | `design-brainstorm-ideate-2.md` | opinion-only log |
| `design-generate` | `design-v1-draft.md` | versioned draft |
| `design-review-1`, `design-review-2` | `design-review-1.md`, `design-review-2.md` | opinion-only log |
| `design-apply-review` | `design-v2-reviewed.md` | versioned draft |
| `design-organise` | `design-v3-organised.md` | versioned draft |
| `summary` | `design-summary.md` | summary-only |
| `design-workstream-issues` | (Linear sub-issues + `blockedBy` edges) | side-effect only — no file deliverable |
| `close-workflow` (copy) | `drafts/{FID}-design.md` | canonical (copy of v3) |

**Versioned chain — plan** (`drafts/{FID}-plan.md` is the canonical artifact; populated only at close):

<!-- prettier-ignore -->
| Step | Path | Output (in `logs/{FID}/`) | Type |
| --- | --- | --- | --- |
| `plan-generate` | both | `plan-v1-draft.md` | versioned draft |
| `plan-review-1`, `plan-review-2` | both | `plan-review-1.md`, `plan-review-2.md` | opinion-only log |
| `plan-apply-review` | both | `plan-v2-reviewed.md` | versioned draft |
| `plan-scope-check-1`, `-2` | both | `plan-scope-check-1.md`, `-2.md` | opinion-only log |
| `plan-apply-scope` | both | `plan-v3-checked.md` | versioned draft |
| `plan-complexity-check` | both | `plan-complexity-check.md` | opinion-only log |
| `plan-complexity-split` | NO-SPLIT | `plan-v4-split.md` | versioned draft (single) |
| `close-workflow` (copy) | NO-SPLIT | `drafts/{FID}-plan.md` | canonical (copy of v4) |
| `plan-complexity-split` | SPLIT | `plan-v4-split.md` (parent) + `plan-v4-1.md`, `-2.md`, `-N.md` | versioned drafts (parent + N children) |
| `close-workflow` (copy) | SPLIT | `drafts/{FID}-plan.md` (parent) + `drafts/{FID}-plan-1.md`, `-2.md`, `-N.md` | canonical (copies) |

**Build / debug / ship:** doc-producing steps adopt the same `{workflow}-v{N}-{action}.md` naming inside `logs/{FID}/`. NO `drafts/` copy at close — those phases don't have drafts artifacts.

**Close-workflow copy semantics (plan + design only):** find highest `v{N}` matching `logs/{FID}/{workflow}-v*.md`; copy file verbatim to `drafts/{FID}-{workflow}.md`. SPLIT case: copy parent + each numbered sibling.

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
- `[ ] Artifact written (docs/plans/logs/{FID}/{file}.md, non-empty)` — artifact existence
- `[ ] {VARIABLE} extracted` — verdict / value capture
- `[ ] Verdict valid ({VERDICT} ∈ {PASS, CONCERNS, FAIL})` — verdict-bearing-step validation
- `[ ] Workflow status updated ({phase} {STATE}, step {step-name} recorded with commitSha[, verdict, attempt, …])` — status.json mutation
- `[ ] Issue update attempted (state X, label Y)` — Linear `save_issue`
- `[ ] Issue comment attempted (Step {N} section)` — Linear `save_comment`

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

**Parallel pairs** (effort-1 / effort-2 diversity, sibling-blind):

<!-- prettier-ignore -->
| Pair | Used in step | Sibling-blind contract |
| --- | --- | --- |
| `@bkit-design-brainstorm-ideate-1` / `-2` | `/bkit-design` Step 3 | Each agent's prompt forbids reading the other's output. |
| `@bkit-design-review-1` / `-2` | `/bkit-design` Step 5 | Same. |
| `@bkit-plan-review-1` / `-2` | `/bkit-plan` Step 4 | Same. |
| `@bkit-plan-scope-check-1` / `-2` | `/bkit-plan` Step 6 | Same. |
| `@bkit-ship-update-docs` / `@bkit-ship-summary` | `/bkit-ship` Step 7 | `bkit-ship-summary` MUST NOT read `ship-update-docs.md`. |

### Verdict vocabulary

3-way `PASS | CONCERNS | FAIL` for verdict-bearing agents that have a meaningful "addressable" middle state. 2-way `PASS | FAIL` for atomic-action agents (binary outcome — succeeded or didn't):

<!-- prettier-ignore -->
| Agent | Verdict values | Routing |
| --- | --- | --- |
| `@bkit-build-plan-verify` | `PASS` / `CONCERNS` / `FAIL` | `PASS` → next sub-plan or Step 8; `CONCERNS`/`FAIL` → `@bkit-build-plan-gaps-remediate` loop (max `MAX_VERIFY_ATTEMPT` = 3 → Failure Path). |
| `@bkit-build-challenge-reconcile` | `PASS` / `CONCERNS` / `FAIL` | `PASS` → Step 13; `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11 → Step 12 → Step 13; `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Step 13; `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11 → Step 12 → re-Step 9; `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Failure Path. Findings carry `class: mechanical|architectural`; `@bkit-build-challenge-remediate` classify-gate FAILs (no fixes) when any architectural finding is present, else fixes mechanical findings. One re-Challenge bite — bounded by `CHALLENGE_REMEDIATE_ATTEMPT` < 1. |
| `@bkit-design-review-1` / `-2` | `PASS` / `CONCERNS` / `FAIL` | `REVIEW_VERDICT` = worst-of-two. `PASS`/`CONCERNS` → Step 6 apply-review; `FAIL` → Failure Path (design fundamentally not viable, human reframe required). |
| `@bkit-design-update` | `PASS` / `CONCERNS` / `FAIL` | All paths continue to Step 7 design-organise; CRITICAL items applied, OPTIONAL applied on consensus, OUT-OF-SCOPE deferred. |
| `@bkit-design-organise` | `PASS` / `CONCERNS` / `FAIL` | `PASS`/`CONCERNS` → Step 8 summary; `FAIL` → Failure Path (cycles detected, human review required). |
| `@*-summary` (`design`, `plan`, `build`, `debug`, `ship`) | `PASS` / `CONCERNS` / `FAIL` | `PASS` or `CONCERNS` → close workflow / next step; `FAIL` → Failure Path. |
| 2-way agents (`@bkit-build-plan-execute`, `@bkit-debug-abort-handover`, `@bkit-design-generate`, `@bkit-design-brainstorm-ideate-1/2`, `@bkit-debug-observe-instrument`, `@bkit-debug-observe-revert`, `@bkit-plan-complexity-check`, `@bkit-plan-complexity-split`, `@bkit-ship-update-docs`, `@bkit-ship-conflict-resolve`) | `PASS` / `FAIL` | `PASS` → continue; `FAIL` → Failure Path. Atomic action — no middle state (cannot proceed → fail; no partial-progress CONCERNS). For `@bkit-ship-conflict-resolve`: `PASS` clears `docs/plans/logs/{FID}/.rebase-failed` sentinel and Step 2 continues; `FAIL` leaves sentinel and routes to `@bkit-debug-abort-handover`. |

### Retry / timeout / iteration constants

<!-- prettier-ignore -->
| Constant | Value | Where |
| --- | --- | --- |
| `MAX_VERIFY_ATTEMPT` | 3 | `/bkit-build` per-sub-plan verify→remediate-gaps loop |
| `MAX_TEST_ATTEMPT` | 3 | `/bkit-build` and `/bkit-debug` test→diagnose→remediate loops |
| `MAX_DEBUG_ATTEMPT` | 3 | `/bkit-debug` debug counter (read from status.json `workflow == "debug"` entry) |
| `MAX_MERGE_ATTEMPT` | 3 | `/bkit-ship` PR merge retries |
| Step timeout | 3600s | Any workflow or subagent run exceeding this → Failure Path |
| Lock staleness | 7200s | `.lock` files older than 2h are silently replaced |

Reference these constants by name in retry checks — never use literal `3`.

### Failure Path

Every command has `## 🤖 Failure Path` section before Step 1. Triggered by any step / tool / gate failure.

**Standard failure (always run):**

1. Mark `status.json` last entry `status: "failed"`; remove `.lock`.
2. Add `Failed` to `{LABELS}` (additive — phase label persists) → `save_issue({ id, state: "In Review", labels })`.
3. Append `### Workflow Failure` block to workflow comment with step number, error, and last 20 lines of stderr.

**Conditional handover** — runs ONLY if failure was triggered by max-retry exhaustion (`MAX_VERIFY_ATTEMPT` / `MAX_TEST_ATTEMPT` / `MAX_DEBUG_ATTEMPT` / `MAX_MERGE_ATTEMPT` exceeded):

4. Invoke `@bkit-debug-abort-handover` with all relevant prior logs as Read context; Write `docs/plans/logs/{FID}/{phase}-handover.md`.
5. `git add -A` → commit `docs({FID}): {phase} aborted [skip build] [skip ci]` → push.
6. Append `### Workflow Handover` block to workflow comment with handover blob link and verbatim body.

7. **STOP** — no further downstream steps.

`/bkit-design` is only command without conditional handover (no max-retry loop).

### Rebase Conflict Tiering

`/bkit-ship`, `/bkit-build`, `/bkit-debug` Step 2 all rebase the feature worktree against `origin/dev`. Three-tier recovery:

<!-- prettier-ignore -->
| Tier | Conflict shape | Recovery | Mechanism |
| --- | --- | --- | --- |
| 1 | Append-only doc ledgers (`docs/{pending,knowledge,decisions,completed}.md`) | `merge=union` — git auto-concatenates both sides | `.gitattributes` (template at `.agents/templates/gitattributes`, installed to consumer roots by `bkit install`); conflict never reaches the workflow |
| 2 | `pnpm-lock.yaml` only | Inline `git checkout --theirs pnpm-lock.yaml` + `pnpm install --lockfile-only` + `git add` + `git rebase --continue` | Bash block in Step 2 of all three workflows |
| 3 | Code, configs, anything else | Touch sentinel `docs/plans/logs/{FID}/.rebase-failed` → Failure Path → conditional handover | Sentinel-file pattern; `/bkit-ship` Failure Path additionally invokes `@bkit-ship-conflict-resolve` before `@bkit-debug-abort-handover` |

**Why Tier 1 is `merge=union` and not a workflow step:** the trade-off is silent duplicate `KN-N` / `DE-N` IDs if both branches allocate the same number — same renumbering hazard already deferred separately, not a regression. `.gitattributes` is the standard git mechanism; pre-empts the conflict at the git layer for all callers without workflow surface area. Excludes `.agents/friction.md` (post-write edits to `Recovery` / `Status` fields break the strict-append contract that union-safety requires).

**Why Tier 2 is inline bash and not a subagent:** mechanical recovery, deterministic git plumbing, no judgement call. A subagent or new Step would add status.json / gate / Linear-comment overhead for what is a 4-line shell idiom.

**Why Tier 3 invokes `@bkit-ship-conflict-resolve` only in `/bkit-ship`:** ship is the only workflow that rebases against an active integration target where conflicts are common. `/bkit-build` and `/bkit-debug` operate on the feature branch in isolation; conflicts there are rarer and usually point to a deeper problem worth a human glance — they keep sentinel → handover only. The resolver's verdict signal (`pnpm install` + `typecheck` + `test` + `build` all PASS) is necessary but not sufficient for a merge — tests can pass while one side's intent is silently dropped — so the resolver refuses semantic overlaps and falls through to handover on any ambiguity. `bkit-debug` itself is **not** repurposed for git plumbing because its diagnose/remediate subagents are scoped to test/runtime failures with the same insufficient verdict signal.

**Failure Path routing:** rebase sentinel triggers conditional handover via `@bkit-debug-abort-handover` (same path as max-retry exhaustion), so Tier 3 unrecovered conflicts always end with a written handover doc, `Failed` label, and `In Review` state — not a silent stop.

## Per-Phase Workflows

Each subsection below documents what command actually does — step list, subagents invoked, artifacts written, verdict routing, close behavior. For agent capability and effort details, cross-reference `.agents/prompts.md`.

### `/bkit-design` — 10 steps

**Goal:** design doc only. No plan, no code. Always hard-stops after summary for human review (do NOT invoke `/bkit-plan`).

<!-- prettier-ignore -->
| Step | Subagent(s) | Read | Write | Notes |
| --- | --- | --- | --- | --- |
| 1 — Start Workflow | — | Linear issue | `.lock`, Linear comment | Pre-flight: assert `git rev-list --count origin/dev..dev` = 0 (Failure Path if non-zero — see § Pre-worktree divergence guard). Resolve / create `{ISSUE_ID}`, set label `Design`, state `In Progress`. NO commits on `dev` — `status.json` init + `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | repo | `.worktrees/{FID}`, env files, `design-input.md` | Create or resume worktree on `feat/{FID}` (fallback: `HEAD`). `pnpm install --frozen-lockfile`. |
| 3 — Brainstorm & Ideate | `@bkit-design-brainstorm-ideate-1` ‖ `@bkit-design-brainstorm-ideate-2` (parallel) | `design-input.md` | `design-brainstorm-ideate-1.md`, `design-brainstorm-ideate-2.md` | Effort-tier diversity (high vs medium); sibling-blind. `BRAINSTORM_VERDICT` = worst of the two. |
| 4 — Generate Design | `@bkit-design-generate` | both brainstorms | `design-v1-draft.md` (versioned draft) | First write of deliverable design doc. |
| 5 — Design Review | `@bkit-design-review-1` ‖ `@bkit-design-review-2` (parallel) | `design-v1-draft.md`, `design-input.md` | `design-review-1.md`, `design-review-2.md` (opinion-only logs) | Effort-tier diversity (high vs medium); sibling-blind. `REVIEW_VERDICT` = worst of two. `FAIL` → Failure Path. |
| 6 — Apply Review | `@bkit-design-update` | `design-v1-draft.md`, both reviews | `design-v2-reviewed.md` (versioned draft) | CRITICAL items always applied; OPTIONAL applied on consensus; OUT-OF-SCOPE deferred. |
| 7 — Design Organise | `@bkit-design-organise` | `design-v2-reviewed.md` | `design-v3-organised.md` (versioned draft) | Decompose design into dependency-annotated workstreams (`WS-N`). `ORGANISE_VERDICT` = `FAIL` (cycles) → Failure Path. |
| 8 — Summary | `@bkit-design-summary` | highest design-v* + glob design-* | `design-summary.md` | Commit `docs({FID}): design complete [skip build] [skip ci]` → push. `SUMMARY_VERDICT` = FAIL → Failure Path. |
| 9 — Design Workstream Issues | — | `design-v3-organised.md` | Linear sub-issues + `blockedBy` edges, `status.json` | Per `WS-N` block in `## Design Workstreams`: `list_issues({ parentId })` → existing match → `save_comment` sync (body untouched); else `save_issue({ parentId, title: "WS-N: …", description: … })` with `**Parent issue:**` + `**Parent design:**` + `**Workstream:**` + `**Requires:**` markers and inline `### Scope` / `### Rationale`. Single unified `WORKSTREAM_ISSUE_ID` map covers create + update branches. Second pass: `save_issue({ blockedBy })` per `Requires`. Idempotent; orphans get a `## Workstream Delete` comment, body untouched. |
| 10 — Close Workflow | — | — | `drafts/{FID}-design.md` (copy of v3) | Friction sweep + copy v3 to drafts → `cd $REPO_ROOT` → checkout `dev` → merge `feat/{FID}` → push `dev` → `git worktree remove` → delete local + remote `feat/{FID}` → `git worktree prune`. Set state `In Review`; phase label `Design` persists. |

**Hard stop in Step 10 caution block:** "Design requires human review. Do NOT invoke `/bkit-plan`."

**Step 9 contract:** sub-issue body carries everything `/bkit-plan` needs — no Linear labels, no `WS_ID` parameter, no parent-shape detection. The two markdown markers (`**Parent design:**`, `**Workstream:**`) are load-bearing and parsed by `/bkit-plan` Step 1 (`PARENT_FID`) and `bkit-plan-generate` Contract (workstream scope). The `**Parent design:**` value is wrapped as a markdown link (`[docs/plans/drafts/{FID}-design.md](URL)`) — display text is the canonical bare path so plan's parser can extract the slug. `Requires:` translates 1:1 to Linear `blockedBy` edges so `/bkit-build` Step 1.6's existing `relations.blocked_by` gate enforces ordering — no new build-side gate needed. Re-runs are non-destructive: existing sub-issue bodies/titles are never rewritten (only sync comments appended); orphaned sub-issues stay open with a `## Workstream Delete` notification comment. Even single-workstream designs spawn one sub-issue; design and plan never share an FID.

### `/bkit-plan` — 11 steps

**Goal:** plan in `docs/plans/drafts/`. No code, no execution. Always hard-stops after summary for human review.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: assert `git rev-list --count origin/dev..dev` = 0 (Failure Path if non-zero — see § Pre-worktree divergence guard). Set label `Plan`, `In Progress`. Parse `**Parent design:**` from `DESCRIPTION` → set `PARENT_FID` (sub-issue case); **else** leave empty (standalone plan run on issue input alone). NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Worktree on `feat/{FID}`; `plan-input.md` = session prompt + Linear description + comments. **If** `PARENT_FID` set → also concatenates `{PARENT_FID}-design.md` (missing file → Failure Path). Standalone plans skip the design append. |
| 3 — Generate Plan | `@bkit-plan-generate` | Reads `docs/plans/template.md` (canonical plan template). Writes `plan-generate.md` log + `docs/plans/drafts/{FID}-plan.md`. |
| 4 — Review Plan | `@bkit-plan-review-1` ‖ `@bkit-plan-review-2` (parallel) | Effort diversity; both write critique logs. |
| 5 — Apply Review | `@bkit-plan-update` | In-place edits to `{FID}-plan.md`; writes `plan-apply-review.md` log. |
| 6 — Check Scope | `@bkit-plan-scope-check-1` ‖ `@bkit-plan-scope-check-2` (parallel) | Scope completeness audit. |
| 7 — Apply Scope | `@bkit-plan-update` | In-place edits; scope expansions → APPEND `docs/pending.md`. |
| 8 — Check Complexity | `@bkit-plan-complexity-check` | `COMPLEXITY_VERDICT` ∈ {single, split}. |
| 9 — Split Plan | `@bkit-plan-complexity-split` _(only if `split`)_ | Writes `{FID}-plan-N.md` sub-plans + `plan-split.md` log; self-verifies losslessness (`SPLIT_VERDICT` ∈ {PASS, FAIL}; `FAIL` → Failure Path). |
| 10 — Summary | `@bkit-plan-summary` | Commit `docs({FID}): plan complete [skip build] [skip ci]` → push. |
| 11 — Close Workflow | — | Sync to `dev`, prune worktree, delete branches (same as `/bkit-design` Step 7). Set state `In Review`; phase label `Plan` persists. |

**Hard stop in Step 11 caution block:** "Plan requires human review. Do NOT invoke `/bkit-build`."

### `/bkit-build` — 18 steps

**Goal:** implementation + PR creation. CI takes over after PR exists. Workflow stops on PR creation; no human gate within build itself.

**Sub-plan loop (Steps 5–7):** if `docs/plans/active/{FID}-plan-N.md` exists, loop `N = 1..SUB_COUNT`, resetting `VERIFY_ATTEMPT` = 1 per N. Else `SINGLE_PLAN` = true and execute once on `{FID}-plan.md`.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: assert `git rev-list --count origin/dev..dev` = 0 (Failure Path if non-zero — see § Pre-worktree divergence guard). Set label `Build`, `In Progress`. Check `relations.blocked_by` — any blocker not in `{Done, Cancelled}` → Failure Path with `Blocked by {BLOCKER_ID}`. Plan must exist (drafts/ or active/) — else Failure Path with `Build requires plan.` NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | `mv docs/plans/drafts/{FID}-*.md docs/plans/active/`. Init `SUB_COUNT`, `VERIFY_ATTEMPT` = 1, `TEST_ATTEMPT` = 1. `build-input.md` includes the active plan. |
| 3 — Branch Sync | — | `git fetch origin`; if `git log HEAD..origin/dev --oneline -- docs/` non-empty → merge `origin/dev` (prefer `dev` for `docs/` conflicts). |
| 4 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills [skip build] [skip ci]`. |
| 5 — Execute Plan | `@bkit-build-plan-execute` | Per sub-plan N: `build-plan-execute-N-log.md`. Single-attempt; writes stub-first then incremental `DONE` / `BLOCKED` log entries via `Bash echo >>`; writes source. Does NOT modify the sub-plan markdown — checkbox ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). On timeout (`EXECUTE_VERDICT = PENDING`), no in-Step retry — the verify→remediate loop (Step 6 → Step 7, bounded by `MAX_VERIFY_ATTEMPT` = 3) absorbs the recovery via `bkit-build-plan-gaps-remediate`. `EXECUTE_VERDICT`: `PASS` → Step 6. Other → Failure Path. |
| 6 — Verify Plan | `@bkit-build-plan-verify` | Per sub-plan N, attempt-numbered: `build-plan-verify-N-{VERIFY_ATTEMPT}.md`. Reads glob of execute attempts' `DONE —` lines to cross-reference against `git diff`; ticks plan `[ ]`→`[x]` only when codebase artifact verified (NEVER on `DONE —` claim alone). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. `PASS` → next N or Step 8. `CONCERNS` / `FAIL` → Step 7. Reads prior verify and remediate logs to know what was already verified. |
| 7 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` _(only if Step 6 CONCERNS or FAIL)_ | Attempt-numbered: `build-plan-gaps-remediate-N-{VERIFY_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Increment `VERIFY_ATTEMPT`; re-run Step 6. > `MAX_VERIFY_ATTEMPT` → Failure Path. |
| 8 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) _(only if `SUB_COUNT` >= 2)_ | Cross-sub-plan integration check; writes `build-plan-verify-holistic.md`. `HOLISTIC_VERDICT` `FAIL` → Failure Path. |
| 9 — Challenge Build (parallel) | `@bkit-build-challenge-1`, `@bkit-build-challenge-2` (parallel) | Launch parallel pair. Each reviewer gets same diff; `CHALLENGE_REMEDIATE_ATTEMPT` init 0 on first entry (persists across re-runs). Large-diff guard applied. Outputs: `build-challenge-1.md`, `build-challenge-2.md`. Both must be non-empty → Failure Path on partial (reconciler does not run on partial input). → Step 10. |
| 10 — Reconcile Challenge | `@bkit-build-challenge-reconcile` | Merge `build-challenge-1.md` + `build-challenge-2.md` into unified `build-challenge.md`. Dedup same `file:line` or root-cause cluster; severity max-wins. Verdict max-wins (`FAIL > CONCERNS > PASS`). Extraction of `CHALLENGE_VERDICT`/`CHALLENGE_FAILURES` happens here. `PASS` → Step 13. `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11. `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Step 13. `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 11. `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Failure Path. |
| 11 — Remediate Challenge | `@bkit-build-challenge-remediate` _(only if Step 10 CONCERNS or FAIL at `CHALLENGE_REMEDIATE_ATTEMPT` < 1)_ | Reads `class` field on findings (data-driven). Any `architectural` → classify-gate emits `FAIL` (no fixes; architectural BLOCKED entries logged) → Failure Path. Else apply mechanical fixes. Increments `CHALLENGE_REMEDIATE_ATTEMPT` at step entry. Stub-first artifact + flat append-only log (`DONE —` per finding fixed; `BLOCKED —` per blocked finding; appended via `Bash echo >>`). Verdict `PASS` / `CONCERNS` / `FAIL`. → Step 12. |
| 12 — Generate Tests | `@bkit-build-challenge-tests` _(only if Step 10 CONCERNS or FAIL at `CHALLENGE_REMEDIATE_ATTEMPT` < 1)_ | Add edge-case tests from verify + challenge findings. If `CHALLENGE_VERDICT` = FAIL → re-runs Step 9 (safety net; counter persists, NOT reset); else falls through to Step 13. |
| 13 — Run Tests | — | Detect `turbo.json`: present → `pnpm turbo lint typecheck test --filter='...[origin/dev]'`; absent → single-package fallback iterates `pnpm $script` for any present in `package.json#scripts` (typecheck, test, format:check, lint:slop, lint:prose) under `set -e` (bkit is a single-package repo — plain `pnpm turbo` exits with `Command "turbo" not found` when `turbo.json` is absent). Pre-PR: lint/typecheck/unit only — NO integration / E2E. `TEST_VERDICT` = PASS → Step 16. `FAIL` → Step 14 if `TEST_ATTEMPT` <= `MAX_TEST_ATTEMPT`. |
| 14 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if Step 13 FAIL)_ | Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. |
| 15 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if Step 13 FAIL)_ | Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Increment `TEST_ATTEMPT`; re-run Step 13. > `MAX_TEST_ATTEMPT` → Failure Path. |
| 16 — Summary | `@bkit-build-summary` | Commit `docs({FID}): build complete [skip build] [skip ci]` → push (`-u origin {BRANCH}`). |
| 17 — Create PR | — | `gh fetch origin dev`; if `supabase/migrations/` changed and HEAD lacks `[force build]` → amend or empty commit with `[force build]` → push. PR body is the plan blob URL. Retry `gh pr create` once on failure. |
| 18 — Close Workflow | — | Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. |

**Failure Path includes handover** — when triggered by exhausted retry counts, invokes `@bkit-debug-abort-handover` and posts `Workflow Handover` comment.

### `/bkit-debug` — 8 steps

**Goal:** diagnose and remediate failing test or CI run; push fix back to branch.

**Mode detection (Step 1):** `gh pr list --head $(git branch --show-current) --base dev` — if a PR exists → **PR debug mode** (reads `debugAttempt` + `observe` from status.json's most recent `workflow == "debug"` entry; pulls failed CI logs via `gh run view --log-failed`). Else → **Normal debug mode** (no CI log fetch; runs full test suite locally).

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: assert `git rev-list --count origin/dev..dev` = 0 (Failure Path if non-zero — see § Pre-worktree divergence guard). Set label `Debug`, `In Progress`. PR-mode: extract `PR_NUMBER`. Read `DEBUG_ATTEMPT` + `PRIOR_OBSERVE_MODE` from status.json's most recent `workflow == "debug"` entry. Set `OBSERVE_MODE`: `PRIOR_OBSERVE_MODE = instrument` → `analyse` (Step 9–10 + Failure Path handover). `DEBUG_ATTEMPT` > `MAX_DEBUG_ATTEMPT` → `instrument` (Step 8 single-shot). Else → `off` (normal Steps 3–7). NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Branch fallback differs from feat workflows: if no `feat/{FID}` branch exists locally or on origin → `git worktree add -b fix/{FID} origin/dev`. Branch eligibility check: `BRANCH` must be `dev` OR contain `{FID}` OR contain `{ISSUE_ID}` (case-insensitive) — else Failure Path with `Wrong branch.` PR mode: also captures `CI_LOGS` from `gh run view --log-failed`. Writes `debug-input-{DEBUG_ATTEMPT}.md` (includes `CI_LOGS` or `N/A`). Init `TEST_ATTEMPT` = 1. |
| 3 — Diagnose Failure | `@bkit-debug-failure-diagnose` | Writes `debug-failure-diagnose-{TEST_ATTEMPT}.md`. Reads prior diagnose+remediate logs to avoid repeating strategies. |
| 4 — Remediate Failure | `@bkit-debug-failure-remediate` | Writes `debug-failure-remediate-{TEST_ATTEMPT}-log.md` + source files. |
| 5 — Run Tests | — | Detect `turbo.json`: present → `pnpm turbo lint typecheck test --filter='...[origin/dev]'` (PR-debug mode) or with `test:integration test:e2e` appended (normal mode). Absent → single-package fallback iterates `pnpm $script` for present scripts in `package.json#scripts` under `set -e` (typecheck/test/format:check/lint:slop/lint:prose; normal mode adds test:integration/test:e2e if present). Same shape as Build Step 12. `PASS` → Step 6. `FAIL` → increment `TEST_ATTEMPT`, loop back to Step 3. > `MAX_TEST_ATTEMPT` → Failure Path. |
| 6 — Push Remediation | — | Increment `DEBUG_ATTEMPT`. Commit `fix({FID}): debug attempt {DEBUG_ATTEMPT}/${`MAX_DEBUG_ATTEMPT`}`. Persist new `debugAttempt` onto status.json workflow entry. Push. |
| 7 — Summary | `@bkit-debug-summary` | Commit `docs({FID}): debug summary [skip build] [skip ci]` → push. |
| 8 — Close Workflow | — | Set state `In Review`; phase label `Debug` persists. Comment includes CI run link if applicable. Worktree persists. |

**Failure Path** includes conditional handover via `@bkit-debug-abort-handover` when max-retry exhausted, writing `debug-handover-{DEBUG_ATTEMPT}.md`.

### `/bkit-ship` — 11 steps

**Goal:** merge PR, archive plans, clean up worktree.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: assert `git rev-list --count origin/dev..dev` = 0 (Failure Path if non-zero — see § Pre-worktree divergence guard). Acquire lock. Set label `Ship`, `In Progress`. NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Rebase against `origin/dev` with tiered conflict recovery (see § Rebase Conflict Tiering): `merge=union` for append-only docs auto-resolves at git layer; `pnpm-lock.yaml`-only conflicts handled by inline regen-and-continue; everything else touches `.rebase-failed` sentinel for Step 3. Branch eligibility check (same as debug). Resolve `PR_NUMBER` for current branch (no open PR → Failure Path). Reject if PR has any failing CI checks (`gh pr view --json statusCheckRollup`). Init `MERGE_ATTEMPT` = 0. |
| 3 — Conflict Resolve | `@bkit-ship-conflict-resolve` _(only if rebase sentinel set)_ | Writes `ship-conflict-resolve.md`. `RESOLVE_VERDICT` = PASS clears the `.rebase-failed` sentinel and the workflow continues; FAIL leaves sentinel and routes to Failure Path → `@bkit-debug-abort-handover`. |
| 4 — Merge PR | — | `gh pr merge {PR_NUMBER} --squash --delete-branch --subject "<title> (#{PR_NUMBER})" --body ""` (empty body — feature commits embed `[skip ci]` which would suppress post-merge CI on `dev`). `state` = MERGED → Step 7. Else if `MERGE_ATTEMPT` <= `MAX_MERGE_ATTEMPT` → Step 5. Else Failure Path. |
| 5 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if not merged)_ | Writes `ship-failure-diagnose-{MERGE_ATTEMPT}.md`. |
| 6 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if not merged)_ | Writes `ship-failure-remediate-{MERGE_ATTEMPT}-log.md`. Increment `MERGE_ATTEMPT`; re-run Step 4. |
| 7 — Switch to Dev | — | `git checkout dev && git fetch origin dev`. Re-assert divergence guard (`origin/dev..dev` = 0); `git pull --ff-only origin dev`. Steps 8+ run on `dev`. |
| 8 — Update Docs & Summary | `@bkit-ship-update-docs` ‖ `@bkit-ship-summary` (parallel) | `update-docs` writes `ship-update-docs.md` + edits cataloged docs. `summary` writes `ship-summary.md`. Sibling-blind: `summary` MUST NOT read `update-docs.md`. `SUMMARY_VERDICT` = FAIL → Failure Path. |
| 9 — Archive | — | Verify squash SHA on `origin/dev`. `mv docs/plans/active/{FID}-*.md docs/plans/completed/{YYYYMM}/`. Update `docs/completed.md`. Prune feature-specific skills not in `.agents/skills.md`. Commit `docs({FID}): archive cleanup [skip build] [skip ci]` → push to `dev`. |
| 10 — Worktree Cleanup | — | `git worktree remove .worktrees/{FID} --force` → `git worktree prune` → `git branch -D feat/{FID}` → `git push origin --delete feat/{FID}` → `git fetch --prune origin`. Local + remote branch deletion is explicit because `gh pr merge --delete-branch` aborts both sides when the local one fails (worktree holds the ref). Squash-merged tip is unreachable from `dev`, so `-D` is correct. |
| 11 — Close Workflow | — | Add `Merged` label, state `Done`. |

**Failure Path** includes conditional handover via `@bkit-debug-abort-handover` writing `ship-handover.md` when max-retry exhausted.

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

## Worktree Model

All phase workflows run inside `.worktrees/{FID}` (gitignored). One worktree per FID. IDE's main checkout is never touched.

**Step 2 — Worktree Setup** is identical across all 5 phases except for branch fallback rule:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
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

mkdir -p docs/plans/logs/{FID}/
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
| `/bkit-ship` | Step 9 dedicated worktree cleanup: `git worktree remove --force` + `git worktree prune`. |

**`pnpm install --frozen-lockfile`** is symlink-only (~5s, no network). Required because pnpm per-package `node_modules` symlinks are not inherited from main checkout. A root-level symlink is not a substitute — individual packages need their own.

**Manual cross-IDE handoff** — user-triggered only:

1. `/bkit-design` and `/bkit-plan` complete → changes are on `dev` (worktree pruned at close).
2. Human reviews on `dev`. Runs `/bkit-build` → recreates worktree from `dev`.
3. `/bkit-build` pushes implementation → CI runs.
4. On CI failure → human triggers `/bkit-debug` → reuses or creates `fix/{FID}` worktree.

`/bkit-worktree-sync` and `/bkit-worktree-prune` exist for ad-hoc manual sync; not invoked by any phase command.

## Linear Integration

MCP server: `https://mcp.linear.app/mcp` (OAuth — wired in `.claude/settings.json` as `mcpServers.linear`).

Tool names (only these are used):

<!-- prettier-ignore -->
| Tool | Purpose |
| --- | --- |
| `get_issue` | `{ id: "XXX-123", includeRelations: true }` → `state`, `labels`, `description`, `relations` (`includeRelations: true` required when `relations` field is consumed — `/bkit-build` Step 1.6) |
| `list_comments` | `{ issueId, orderBy: "createdAt desc", limit: 250 }` |
| `list_issues` | `{ parentId: "XXX-123", limit: 250 }` (used by `/bkit-design` Step 9 to enumerate workstream sub-issues) |
| `save_issue` | `{ id, state, labels, blockedBy, parentId }` (or `{ title, description, team, assignee, state, labels, parentId }` to create). `blockedBy` is append-only — re-runs are no-ops for unchanged edges. |
| `save_comment` | `{ issueId, body }` to create, `{ id, body }` to edit |

### Phase labels (mutually exclusive)

In the Linear workspace these live under the `workflow` parent label group — Linear enforces mutual exclusion server-side, so `save_issue` with a new phase label auto-removes the prior one. Workflow code still drops the old phase from `{LABELS}` explicitly (idempotent; matches Linear's behaviour).

<!-- prettier-ignore -->
| Label | Meaning |
| --- | --- |
| `Design` | `/bkit-design` running |
| `Plan` | `/bkit-plan` running |
| `Build` | `/bkit-build` running |
| `Debug` | `/bkit-debug` running |
| `Ship` | `/bkit-ship` running |
| `Merged` | `/bkit-ship` completed; PR merged to `dev`; terminal |

Phase label is preserved through Close Workflow exit — state column (`In Review` for non-ship, `Done` for ship) carries the completion signal, so the label tells reviewers which workflow just finished. Ship is the exception: Close Workflow swaps `Ship` → `Merged` and state → `Done`.

### Additive labels (do not drop phase)

<!-- prettier-ignore -->
| Label | Added by | When |
| --- | --- | --- |
| `Failed` | Failure Path of any workflow | Workflow hit its Failure Path; human triage required. Phase label persists alongside, so reviewers see which workflow failed. Lives outside the Linear `workflow` group — no server-side phase eviction. |

### Statuses

<!-- prettier-ignore -->
| Status | When |
| --- | --- |
| `In Progress` | Set by Step 1 of every phase. |
| `In Review` | Set by Close Workflow of `/bkit-design`, `/bkit-plan`, `/bkit-build`, `/bkit-debug`. Also set by Failure Path. |
| `Done` | Set by `/bkit-ship` Step 10. |

### Comment lifecycle

ONE comment per workflow run; Step 1 creates it, every later step appends. See § Linear Comment Lifecycle for templates and code path.

### Issue blockers (`/bkit-build` Step 1)

`/bkit-build` Step 1.6 calls `get_issue({ id, includeRelations: true })` and extracts `relations.blocked_by`. Any blocker whose state is not `Done` **and** not `Cancelled` → Failure Path with `Blocked by {BLOCKER_ID} (state: {BLOCKER_STATE})` (the offending blocker's id, not the current issue's). Workstream sub-issues spawned by `/bkit-design` Step 9 set `blockedBy` per their `Requires` line, so this gate also enforces workstream ordering — no separate workstream-aware gate exists.

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
gh pr merge {PR} --squash --delete-branch --subject "..." --body ""   # Ship Step 3 — empty body strips feature `[skip ci]`
gh run list --branch {BRANCH} --limit 1 --json databaseId   # Debug Step 2 (PR mode)
gh run view {RUN_ID} --log-failed                           # Debug Step 2 (PR mode) — capture CI_LOGS
```

Never merge locally; always `gh pr merge` per `/bkit-ship`.

### Commit conventions

Conventional Commits — `{type}({FID}): {summary}`.

<!-- prettier-ignore -->
| Type | When |
| --- | --- |
| `docs` | Design / plan / docs / archive cleanup / abort summary |
| `chore` | Pre-worktree carry-over, skill installs |
| `feat` | Build implementation (PR title) |
| `fix` | Debug remediation (`fix({FID}): debug attempt N/MAX`) |
| `wip` | (used by `/bkit-worktree-sync` for local pre-merge captures only) |

### CI / Vercel commit tags

Precedence: `[force build]` on head commit wins.

<!-- prettier-ignore -->
| Tag | Effect |
| --- | --- |
| `[skip ci]` | GitHub Actions skip the workflow / `vercel-build` sets `run_level=none`. |
| `[skip build]` | Vercel ignore script cancels preview build; CI cap remains at partial tier. |
| `[force build]` | Forces full CI + Vercel build even on docs-only paths. Used by `/bkit-build` Step 16 when `supabase/migrations/` changed without it on HEAD. |

**Docs-only commits:** workflows append BOTH `[skip build]` and `[skip ci]` — they are independent levers and both must be present for cleanest skip.

<!-- prettier-ignore -->
| Workflow commit | Tags |
| --- | --- |
| `chore: pre-worktree uncommitted changes` (Step 2 of every phase) | `[skip build] [skip ci]` |
| `chore({FID}): install skills` (build Step 4) | `[skip build] [skip ci]` |
| `docs({FID}): design complete` (design Step 6) | `[skip build] [skip ci]` |
| `docs({FID}): plan complete` (plan Step 11) | `[skip build] [skip ci]` |
| `docs({FID}): build complete` (build Step 15) | `[skip build] [skip ci]` |
| `docs({FID}): debug summary` (debug Step 7) | `[skip build] [skip ci]` |
| `docs({FID}): archive cleanup` (ship Step 8) | `[skip build] [skip ci]` |
| `docs({FID}): {phase} aborted` (Failure Path handover) | `[skip build] [skip ci]` |
| `fix({FID}): debug attempt N/MAX` (debug Step 6) | none — must trigger CI |
| `chore({FID}): close-workflow status trigger CI` (build Step 17, debug Step 11) | none — final HEAD on push, fires `pull_request` synchronize |

**CI trigger mechanic (build / debug / ship aligned):** every workflow's last push to a CI-validated ref must leave a HEAD without `[skip ci]`, else GitHub's `pull_request` (build/debug) or `push` (ship) synchronize is suppressed and `statusCheckRollup` stays empty — Ship Step 2's fail-fast gate would then admit a vacuously green PR. Trigger lives in the close-workflow step (the natural final-push location for build & debug); ship triggers via the squash merge subject.

<!-- prettier-ignore -->
| Workflow | Step | Mechanic | Why this form |
| --- | --- | --- | --- |
| `/bkit-build` | 17 (close-workflow) | Final commit renamed `chore({FID}): close-workflow status trigger CI`, no skip tags + `git push` | Drops `[skip ci]` from the existing status commit; final commit before push fires PR `pull_request` synchronize |
| `/bkit-debug` | 11 (close-workflow) | Final commit renamed `chore({FID}): close-workflow status trigger CI`, no skip tags + `git push` | Same form as build — single commit doubles as status update + CI trigger |
| `/bkit-ship` | 3 (merge-pr) | `gh pr merge --body ""` — squash subject becomes dev HEAD, body empty | `gh pr merge` is the only API; empty body strips PR-body `[skip ci]` from the squash subject. Followed by CI-trigger verification gate (`gh run list` captures `RUN_ID`) |
| `/bkit-ship` | 8 (archive) | Keeps `[skip build] [skip ci]` on archive push to `dev` | Post-merge docs-only; PR is already merged, dev's CI was already fired by Step 3, no re-trigger needed |

All intermediate workflow commits (start-workflow, summary, create-pr, etc.) retain `[skip build] [skip ci]` — only the trailing `close-workflow status trigger CI` commit is unmarked, and it is the LAST commit before the final `git push`. This also fixes the prior latent bug where build Step 17 / debug Step 11 commits were never explicitly pushed.

## Permissions (`.claude/settings.json`)

Without `acceptEdits` / wildcard allow surface, every `Bash`, `Edit`, `Write`, MCP, or skill call would prompt mid-workflow and break end-to-end runs.

<!-- prettier-ignore -->
| Bucket | Patterns | Purpose |
| --- | --- | --- |
| `allow` | `Bash(*)`, `Edit(*)`, `Write(*)`, `Skill(*)`, `mcp__linear__*`, `mcp__claude_ai_Linear__*`, `WebFetch(domain:github.com | api.github.com | linear.app | docs.anthropic.com | docs.claude.com)` | Blanket-allow shell, file ops, skills, Linear MCP, scoped web fetch. `deny` and `ask` lists evaluated first. |
| `ask` | `sudo:*`, `curl:*`, `wget:*`, `brew install:*`, `pnpm publish:*`, `npm publish:*`, `git push --force(:* / -f)`, `git reset --hard:*`, `git clean -fd(x):*`, `git filter-branch:*`, `gh repo delete:*`, `gh pr close:*`, `gh release delete:*`, `vercel rm/remove:*`, `supabase db reset / projects delete:*` | Per-call human confirmation for destructive ops. |
| `deny` | `Bash(rm -rf /\* | ~/\* | $HOME/_)`, `Bash(chmod -R 777 /:_)`, `Read(./.env | ./.env.\* | ./apps/_/.env_ | ./packages/_/.env_ | ./**/secrets/** | ./\*_/_.pem | ./\*_/_.p12 | ./\*\*/id_rsa)` | Hard-block catastrophic deletes and secret reads. |

`mcpServers.linear.url = https://mcp.linear.app/mcp`. SessionStart hook `bash .claude/hooks/preflight.sh` runs at every session start.

**Anti-pattern:** never use `--dangerously-skip-permissions` on host. Use it only inside sandboxed CI containers.

## Workflow Primitives — quick reference

Inline definitions for tokens used in workflow files. Keep this section in sync with actual workflow bodies.

### FID generation

1. Prefer Linear id lowercased: `xxx-123` ← `XXX-123`.
2. Else kebab from title: strip stopwords (the/a/and/of/to/in/for), ≤3 tokens, ASCII lower → `word1-word2-word3`.
3. One FID for all artifacts once set.

### Branch eligibility

`{BRANCH}` passes if it equals `dev` OR contains `{FID}` (case-insensitive) OR contains `{ISSUE_ID}` (case-insensitive). Else Failure Path with `Wrong branch.` Used in `/bkit-debug` Step 2 and `/bkit-ship` Step 2.

### Label flip

```text
Add `X` phase to {LABELS}, drop old → save_issue({ id: "{ISSUE_ID}", state: "...", labels: [{LABELS}] })
```

Phase labels mutually exclusive — drop old before adding new. Additive labels (e.g. `Failed`) skip the drop.

### Sub-plan loop discovery

```bash
SUB_COUNT=$(ls docs/plans/active/{FID}-plan-*.md 2>/dev/null | wc -l)
[ "$SUB_COUNT" -eq 0 ] && SUB_COUNT=1 && SINGLE_PLAN=true
# Per N: reset VERIFY_ATTEMPT=1 at start of each iteration
```

### Turbo command (verbatim)

```bash
pnpm turbo lint typecheck test --filter='...[origin/dev]'
```

No quote / filter / glob edits. Pre-PR is lint+typecheck+unit only; debug normal-mode adds `test:integration test:e2e`.

### `save_issue` create-mode return guard

Create-mode `save_issue(...)` MUST return non-empty `id`. Empty/null → Failure Path with `save_issue returned no id`.

### Pre-worktree carry-over commit (Steps 2 of design / plan / build / ship)

```bash
if [ -n "$(git status --porcelain | grep -v '^??')" ]; then
  git status --short
  git add -- ':\!.DS_Store' ':\!*.log' ':\!*.swp' ':\!node_modules'
  git commit -m "chore: pre-worktree uncommitted changes [skip build] [skip ci]"
fi
```

Commits any uncommitted local changes before creating worktree so new branch inherits them. `/bkit-debug` Step 2 omits this — it intentionally branches off `origin/dev` for hotfix isolation.

## File path conventions

<!-- prettier-ignore -->
| Type | Path |
| --- | --- |
| Worktree | `.worktrees/{FID}/` (gitignored) |
| Design draft | `docs/plans/drafts/{FID}-design.md` |
| Plan draft | `docs/plans/drafts/{FID}-plan.md` (+ `{FID}-plan-N.md` if SPLIT) |
| Plan active | `docs/plans/active/{FID}-plan*.md` (moved here in `/bkit-build` Step 2) |
| Plan completed | `docs/plans/completed/{YYYYMM}/{FID}-plan*.md` (moved here in `/bkit-ship` Step 8) |
| Workflow logs | `docs/plans/logs/{FID}/*.md` |
| Workflow state | `docs/plans/logs/{FID}/status.json` |
| Concurrency lock | `docs/plans/logs/{FID}/.lock` |
| Per-phase input | `docs/plans/logs/{FID}/{phase}-input.md` (or `debug-input-{DEBUG_ATTEMPT}.md`) |
| Per-attempt logs | `docs/plans/logs/{FID}/{phase}-{step}-{N}-*.md` (verify, remediate, diagnose loops) |
| Handover docs | `docs/plans/logs/{FID}/{phase}-handover.md` (or `debug-handover-{DEBUG_ATTEMPT}.md`) |

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

**Filename convention:** `docs/plans/logs/{FID}/{phase}-{step}-N-{ATTEMPT}.md` (e.g. `build-verify-plan-1-2.md` = sub-plan 1, verify attempt 2). Verifiers MUST read prior verify+remediate logs before deciding `PASS`/`FAIL`. Remediators MUST glob their own prior logs and not repeat strategies.

## Structured Docs Writer Map

Pipeline writes to five structured docs at `docs/` root. Each has strict sole-writer policy.

<!-- prettier-ignore -->
| Doc | ID prefix | Sole writer(s) | Source step |
| --- | --- | --- | --- |
| `docs/knowledge.md` | `KN-` | `@bkit-build-plan-gaps-remediate`, `@bkit-build-challenge-remediate`, `@bkit-debug-failure-remediate` | After verified fix |
| `docs/decisions.md` | `DE-` | `@bkit-design-generate`, `@bkit-debug-failure-remediate` (forced arch) | At decision time |
| `docs/completed.md` | — | `@bkit-ship-update-docs` only | `/bkit-ship` Step 7 |
| `docs/pending.md` | — | `@bkit-design-generate` (out-of-scope features), `@bkit-plan-generate` (out-of-scope ideas), `@bkit-plan-update` (scope expansions from `/bkit-plan` Step 7), `@bkit-debug-abort-handover` (handover context) | `/bkit-design` Step 4, `/bkit-plan` Steps 3 & 7, Failure Path handover |

All other agents document blockers and out-of-scope items in their own log file (Plan Execution / Challenge Remediation / etc — see each subagent's H1 for the canonical output name) — workflow reads those at step boundaries and decides what (if anything) to mirror to Linear.

Append-only. Cross-doc grep by ID: `grep -rE 'KN-\d+|DE-\d+' docs/`. See `.agents/docs.md` for doc index and read-by-phase matrix.

## Authoring Checklist for New / Refined Workflows

When writing or editing `.agents/workflows/bkit-*.md` (canonical source — `bkit install` regenerates `.claude/commands/` and `.cursor/commands/`):

- [ ] YAML frontmatter with `description`.
- [ ] Header with `Output:` and `Linear:` lines.
- [ ] Caution block with all Execution Protocol invariants (§ Common Workflow Anatomy → Execution Protocol).
- [ ] **Failure Path** before Step 1; conditional handover branch when phase has retry loops.
- [ ] **Step 1 — Start Workflow:** status init + lock acquire + Linear init + comment create + label set + state `In Progress`.
- [ ] **Step 2 — Worktree Setup:** worktree create/resume + env file copy + `pnpm install --frozen-lockfile` + save phase input + status step + comment append.
- [ ] Every step ends with `### 🔒 Gate N` and a checklist.
- [ ] Every step appends one fenced section to workflow comment via `save_comment({ id: {COMMENT_ID}, body })`.
- [ ] Subagent invocations use `@name` + `Context:` / `Read:` / `Update:` / `Create:` block (Update/Create as applicable); assert non-empty Update/Create artifacts.
- [ ] Verdict-bearing steps extract `{*_VERDICT}` and route per § Verdict vocabulary.
- [ ] Loops cap at `MAX_*_ATTEMPT` constants; exhaustion → Failure Path; per-attempt logs use `-{N}` filename suffix.
- [ ] Timeout guard captures `STEP_START` before each subagent / `pnpm turbo`; exceeded → Failure Path.
- [ ] Final step (Close Workflow) marks `status:done`, releases `.lock`, sets state `In Review` (ship: state `Done`, swaps label `Ship` → `Merged`); non-ship phases preserve phase label.
- [ ] Docs-only commits include both `[skip build]` and `[skip ci]` (§ CI / Vercel commit tags).
- [ ] Branch eligibility check on phases that don't create their own branch (`/bkit-debug`, `/bkit-ship`).
- [ ] Token efficient — tables > prose, `→` not `then`, no sub-bullets when a table works.
- [ ] If new agent is introduced, add it to `.agents/prompts.md` with frontmatter rationale and `maxTurns` calibration.
- [ ] If new destructive shell command is introduced, route it through `ask` or `deny` in `.claude/settings.json`.
- [ ] No agent calls Linear MCP — sweep with `grep -rln 'save_issue\|save_comment\|list_comments\|get_issue\|create_issue' .agents/prompts/` returns empty.
