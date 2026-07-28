# Workflows

> [!CAUTION]
> **Purpose:** Agent-pipeline reference — workflow conventions, execution patterns, IDE integration, subagent catalog.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Subagents are leaves, NEVER invoke other subagents.
> - Subagents NEVER touch the tracker. Tracker MCP tools (GitHub Issues, Linear, etc.) are orchestrator/workflow-layer exclusive.
> - When you change a workflow file (`.bkit/workflows/bkit-*.md`), mirror change here.

## File Layout

Canonical source: `.bkit/workflows/`. `bkit install` regenerates `.claude/commands/` (byte-identical) and `.cursor/commands/` (T1/T2/T3 transformed). Never edit generated copies.

```
.bkit/workflows/
├── bkit-design.md         # Workflow 1/6 — 10 steps; hard stop after summary
├── bkit-plan.md           # Workflow 2/6 — 12 steps; hard stop after summary
├── bkit-build.md          # Workflow 3/6 — 17 steps; CI takes over after PR
├── bkit-debug.md          # Workflow 4/6 — 10 steps; normal / soak modes
├── bkit-ship.md           # Workflow 5/6 — 13 steps; merge → archive → In Review (human closes)
├── bkit-audit.md          # Workflow 6/6 — 7 steps; planned (not yet shipped)
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
| `/bkit-audit` | yes | yes | planned — `docs/audits/{FID}-audit.md` + one Linear sub-issue per workstream |
| `/bkit-auto` | args `{PHASE} {ARG}` (`{ARG}` = PR for ship/debug, issue for design/plan/build) | n/a (dispatches into the matching `/bkit-{phase}`) | Phase-routed; same session continues into the dispatched skill |
| `/bkit-worktree-sync` | arg `{FID}` | n/a (interactive) | Merged or rebased commits in current branch |
| `/bkit-worktree-prune` | optional arg `{FID}` | n/a (interactive) | Deleted worktree (and optionally branch) |

## Workflow Authoring Rules

`.bkit/workflows/*.md` = AI-only execution surfaces; every byte is paid on every run.

- **Instructions only:** NO rationale, NO parentheticals explaining "why", NO "we don't do X because Y", NO inline behaviour justification.
- **Removal = delete:** Drop instruction → delete it; NEVER replace with removal explanation.
- **No internal labels, no coined guard names:** NEVER cite bkit-internal identifiers (`DE-25`, `EC-1`, `KN-11`, `#261`) or coined guard names (`EC-1 pre-flight` → `open-PR pre-flight`) in workflow files — unexplained tokens for consumers. Drop label; step lead-in states what it does. Label belongs here.
- **Bash decides, prose routes:** fenced block determines outcome → prose branches on **exit code** (`**If** exit non-zero → **Failure Path**.`) — NEVER domain restatement (`**If** an open PR exists → …`). Internal constraints: imperative lead-in (`— NEVER onto a branch with an open PR:`), not `**If**`.
- **Self-contained:** Each workflow file MUST stand alone — NO cross-refs to `.bkit/workflows.md` or meta docs. Need rule → inline; else omit.
- **Sibling-blind subagent Context:** `Context:` stays generic; agent prompts own lens via Process. Canonical: "You are a subagent in the {Phase} phase running in parallel with N other agents"; reconcilers: "Inputs carry distinct lenses — merge across them, max-wins on CRITICAL findings".
- **Rationale lives here:** Decisions, trade-offs, history, meta-commentary → this file only — NEVER per-workflow files.
- **Reuse wording and formatting:** ALWAYS `grep .bkit/workflows/` first; copy closest phrasing + formatting verbatim (backticks, indentation, breaks, punctuation, spacing). Match shape for repeated sections (subagent invocations, gate checklists, `bash` blocks, comment fences).
- **Cross-workflow alignment:** Shared lines → change in ALL workflows using them.
- **Procedural conditionals:** Flow-gating → bold `**If** {condition} → {action}.` (`**Else** → {action}.` for branches). Test: reordering reads "If {X}, {Y}" → it IS one. Excludes: inline qualifiers (`if any`, `if defined`), dispatch tables (`PASS = …`, `STANDARD → …`), iteration (`For each …`), bash in backticks, output-template placeholders.
- **Labeled decision blocks:** 2+ branches → labeled heading-row + `-` bullets (one per branch) — NEVER inline one line, NEVER across numbered sub-steps. Labels: `Route:` (next Step / Failure Path); `Decide \`VAR\`:` (variable value). Single-branch (`**If** {X} → **Failure Path**`) stays inline.
- **ASCII operators:** `!=`, `>=`, `<=`, `=>`, `x` for times/dimensions only — NEVER Unicode math glyphs. `→` in conditionals/dispatch tables = sole intentional non-ASCII glyph (uniform flow notation; clearer than overloaded `->`). Do NOT convert `→`.
- **Variable references:** Prose: names/labels/placeholders in backticks. Bare `VAR` = reference; `{VAR}` = interpolation (paths, JSON, commit msgs, Context). Operators outside (`VERIFY_ATTEMPT` = 0). Literal enum plain (**If** `VERDICT` = PASS); unions one backticked unit (`PASS|CONCERNS|FAIL`). Fenced output blocks: plain. NEVER `${VAR}` outside bash fences.
- **Gate items:** `- [ ]` leads with prose label; vars ONLY in trailing backticked parenthetical — `- [ ] Test attempt incremented (\`TEST_ATTEMPT\` + 1)`, NEVER `- [ ] \`TEST_ATTEMPT\` incremented`. Extraction + validity = ONE item: `- [ ] Verdict extracted and valid (\`SUMMARY_VERDICT\` in \`PASS|CONCERNS|FAIL\`)`.

## Tracker Blocks

`.bkit/workflows/bkit-*.md` carry wired tracker variants inline (`github`, `linear`) — full per-tracker behaviour (MCP shapes, labels, states) visible at call site. No substitution from `.bkit/trackers.md`; resolver selects/strips inline blocks. Markers:

**Per-tracker pair.** Every tracker call site: consecutive `github` → `linear` pair (no authored `none` — no-tracker rendering = single generic message):

```text
<!-- bkit:tracker github start -->
mcp__github__… call
<!-- bkit:tracker github end -->
<!-- bkit:tracker linear start -->
mcp__linear__… call
<!-- bkit:tracker linear end -->
```

At `bkit install`: read `bkit.issueTracker` from consumer manifest → keep matching block, drop other when mirroring to `.claude/commands/bkit-*.md` and `.cursor/commands/bkit-*.md`. Under `none` → whole pair collapses to **`_No tracker connected, skip step._`**. List-number prefix (`3. `) preserved on kept block / stub. Sites needing no-tracker function (`issue-id-extraction`, `fid-format`, `pr-body-marker`, `pr-body-metadata`) add trailing `<!-- bkit:tracker false start/end -->` after pair — used under `none` instead of generic message.

**Conditional blocks (`bkit:tracker true` / `bkit:tracker false`).** Boolean tracker-presence gates for tracker-agnostic content: `true` kept when wired, **removed entirely under `none`** (shared comment `{BODY}` fences, identical github/linear); `false` kept ONLY under `none`. Removed block consumes leading newline — no blank gap.

`github`/`linear` pair only when call **genuinely differs**. Byte-identical bodies → single `true` block — duplicating identical content as pair is redundant. Enforced by `bkit-trackers.test.ts` ("no identical github/linear pair"). `none` difference: pair → `_No tracker connected, skip step._` stub; `true` block removed outright — use `true` only where content can vanish under `none` (inline notes, gate items), NOT where numbered step needs stub to keep number.

```text
<!-- bkit:tracker true start -->
… shared content (kept when wired; removed under none) …
<!-- bkit:tracker true end -->
```

**Hoist shared content out of blocks — only at `false`-block sites.** Identical cross-variant text → numbered step line; per-tracker part inside blocks (`issue-id-extraction`: extraction patterns + create call only; `fid-format`: assert regex only). Every byte inside pair authored 2–3× and drifts.

Limit = `none` rendering. Bare pair collapses to `_No tracker connected, skip step._` — hoisted prose above survives introducing a step that says "skip" (`{QUERY}` with no search, "NEW comment" with no comment). Hoist only where trailing `false` block supplies real `none` body (`issue-id-extraction`, `fid-format`, `pr-body-marker`, `pr-body-metadata`); at pair-only sites keep shared text inside both blocks so whole step vanishes. Design/debug issue-scan `{QUERY}` prefix + `— NEW comment, no edit.` suffix stay duplicated. **Exception — plan fetch-context (`/bkit-plan` Step 4):** `{QUERY}` hoisted to plain step — tracker-independent local greps (`related-deferrals.md` / `related-failures.md`) in same step consume it and MUST run under `none`; hoisted definition not orphaned — do NOT re-duplicate into tracker pair.

Re-runnable: source carries wired variants; tracker switch (`--tracker=linear` after `--tracker=github`) → fresh mirrors. Resolver reports lone `github`/`linear` block or unbalanced `true`/`false` pair as orphan — silent regressions unacceptable. New call site → add `github`/`linear` pair inline (no `trackers.md` edit; `none` block only if step must do something without tracker). `.bkit/trackers.md` = reference-only (marker contract + cross-cutting conventions); not substitution source.

**Rationale rehomed from the workflow files** (stripped there per § Workflow Authoring Rules; kept here):

- **`git push --force-with-lease` on personal branch:** Step 2 `git rebase origin/dev` rewrites SHAs → plain push non-fast-forward. Mirrors `rules.md` § Force push. Never on `dev` / `main`.
- **`BKIT_VER` reads `pinnedVersion`, not `version`:** `[ -z … ] &&` fallback, not piped one — pipeline status = LAST command's; `| tr … || echo` fallback never fires on failed grep.
- **`deferrals` / `failures` on `outcome` row = CUMULATIVE distinct `key` count, not lines:** same-`key` append (§ Updating a Row in `.bkit/jsonl.md`) → `wc -l` double-counts closed deferrals. Readers derive cycle from delta vs prior outcome row — `newFailuresThisRun` in `bkit-analysis.ts`.
- **CI-Dispatch kernel constants:** `POLL_BUDGET_S` / `POLL_INTERVAL_S` → default 60/10. The poll loop is `bkit_wait_ci` (`.bkit/scripts/bkit-runtime.sh`), shared by build's close-workflow and both debug close-workflow sites (PR-mode + LOCAL-mode) — echoes `found` / `none` / `err` via `CI_WAIT_RESULT`; every `sleep` inside it is `timeout`-wrapped so a blocked primitive fails loud (`CI_WAIT_BLOCKED=true`) instead of hanging. Self-heal cap 1; re-trigger suffix must match close-workflow suffix. `ciDispatch` verdict always on step-done record (additive field). No `CAN_SLEEP` / `RUNTIME_SLEEPS` capability row — sleeping is measured, not predicted. When `bkit_wait_ci` reports blocked sleep the calling workflow exits 3 and the orchestrator resolves the same poll in an agent turn-loop, then re-enters the kernel with `BKIT_CI_OUTCOME` / `BKIT_CI_ATTEMPTS` / `BKIT_CI_ALL_ERRORED` set.
- **Open-PR pre-flight (EC-1 in #261):** blind `gh pr create` on branch with open PR → error → retry → Failure Path. Build detects first. Idempotent-resume (reuse existing PR) not built.
- **Build close-workflow push does not trigger CI** — no PR yet; `gh pr create` on pushed HEAD = single CI trigger.
- **Design / plan close on HARD STOP** — human review required before next phase.
- **No archive step in ship:** artifacts at canonical `docs/plans/{YYYYMM}/` from design start — nothing to move at close.
- **Debug three attempt counters = mode-matched pairs** — DE-25, DE-36.
- **Runtime capability table:** `.bkit/scripts/bkit-runtime.sh` classifies the runtime (`LOCAL` / `GITHUB_ACTION` / `CLOUD_CLAUDE` / `CLOUD_CURSOR` / `UNKNOWN`) and emits `RUNTIME_WORKTREES` / `RUNTIME_DEVPUSHES` / `RUNTIME_GITHUBCLI`. `CLOUD_CURSOR` is detected via a `.bkit/.runtime-cursor` marker written by `.cursor/hooks/preflight.sh` when `is_background_agent` is true (Cursor exposes that only on stdin JSON to the hook, not as an env var). `RUNTIME_DEVPUSHES` is a conservative DEFAULT, never probed — a `git push --dry-run` sends no ref-update, so a protected branch's pre-receive hook never fires and a false-positive would strand a cloud session on a `dev` checkout. `RUNTIME_GITHUBCLI` is the one live probe (`gh auth status`). An explicit falsy primitive (`CI=false`, `GITHUB_ACTIONS=false`) means ABSENCE, not ambiguity — treating it as ambiguous would cost a laptop its worktree model; only a non-truthy, non-falsy value goes `UNKNOWN`.
- **Local happy path is byte-identical across the three runtimes:** every runtime branch is additive. `RUNTIME_DEVPUSHES=true` (laptop, GH-Actions runner) runs the local block verbatim — local `merge --squash -X ours`, `docs({FID}): {phase} DONE bkit [skip ci]`, direct `dev` push, worktree teardown. Only `RUNTIME_DEVPUSHES != true` (claude.ai cloud, `unknown`) takes the PR-merge branch. Never replace a working local call site to serve a cloud runtime; branch around it.
- **`[skip ci]` scope:** deliberate `bkit [skip ci]` on docs-only commit SUBJECTS is the CI-minutes convention and stays. The defect it is confused with is a squash merge whose DEFAULT body concatenates the head branch's commit subjects and inherits a token — hence `bkit_close_guard_scan_body` scans the BODY only, and every close passes an explicit `--body ""`.
- **Design/plan close never waits for CI:** it creates no PR on the local path, and on the PR path the merge subject carries `bkit [skip ci]` so no run is dispatched. A PR-create-then-wait-then-merge shape (build/debug + ship) is for code, not docs-only closes.
- **`--delete-branch` is not used by the design/plan PR close:** `gh` also deletes the LOCAL branch, which fails when that branch is checked out in a worktree (`git branch -D` refuses) and returns non-zero AFTER a successful merge; in adopt mode it checks out the base first, stranding a cloud session on `dev`. Head-branch cleanup relies on the repo's auto-delete-head-branches setting.
- **Adopt mode does no `git worktree add`:** a claude.ai cloud session's proxy restricts `git push` to the CURRENT working branch, so minting `feat/{FID}` would produce a branch it cannot push. `RUNTIME_WORKTREES=false` therefore works in place on whatever branch the session is already on, with `WORKTREE_PATH=$REPO_ROOT`, and refuses outright if that branch is `dev`.
- **Ship Step 9 does NOT use `bkit_close_guard_checkout`:** that helper installs an `EXIT` trap restoring the pre-checkout branch, which would undo staying on `dev` for Steps 10-13 (they operate at `REPO_ROOT` assuming `dev` stays checked out) and would clobber the DEVLOCK-removal trap — bash `trap ... EXIT` replaces, it does not chain. The double-guard condition is asserted inline instead.
- **Close-transport audit rows:** `runtime-resolved` (capability table), `transport-fallback` (one gh->MCP transition), `close-transport` (which shape landed which SHA, plus the body-scan result) — all additive, none folded by `BKIT_STATUS_FOLD`.
- **`FID` slug assertions (`bkit-auto` Step 9 / Step 10):** regexes are allowlists (canonical `^[0-9]+-[a-z0-9-]+$` for GitHub issue-prefixed slugs, `^[a-z]+-[0-9]+-[a-z0-9-]+$` for Linear-prefixed slugs, safe `^[a-z0-9][a-z0-9-]*$` for the no-tracker + branch-derive fallback). They reject path traversal and shell metacharacters in the untrusted PR-body marker before `{FID}` reaches any filesystem path or downstream dispatch. The branch-derive fallback (`Step 10`) is only reached when Step 9's marker was missing or malformed; `ISSUE_ID` stays whatever Step 9 resolved — Gate 1's "Issue ID non-empty, if tracker wired" catches an unresolved tracker-wired case.
- **Header `Placeholders:` line is generic on purpose:** workflow headers list only universally-required examples (`{FID}`, `{YYYYMM}`, plus plan's `{PARENT_FID}` / `{PARENT_YYYYMM}`); the rest of the placeholder inventory is asserted at the step that mints / derives each value. Per-placeholder detail: `{OWNER}` and `{REPO}` derived from `{OWNER_REPO}` at Step 1; `{WORKTREE_PATH}` = absolute path set at worktree setup — mint mode (`RUNTIME_WORKTREES=true`): `.worktrees/{FID}`, adopt mode (`RUNTIME_WORKTREES=false`): `$REPO_ROOT` — required for subagent `Context` cwd; `{YYYYMM}` = canonical month bucket for the FID, design sets it ONCE at first start (`date +%Y%m`), downstream workflows discover via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/`, debug defaults to current UTC month `date -u +%Y%m` when none exists, plan derives `{PARENT_YYYYMM}` similarly from `{PARENT_FID}`. Tracker-wired placeholders (`{ISSUE_ID}` / `{STATE}` / `{LABELS}`) asserted inline in each per-tracker `**Tracker:**` row — empty under `none`.

**Per-tracker operational notes** (rationale kept here, not in the workflow files per § Workflow Authoring Rules):

- **Related-issues scan** (issue-scan): numbered step at design ideate-entry, plan fetch-context, debug fetch-context; `github`/`linear` pair → under `none` collapses to `_No tracker connected, skip step._` (number preserved). Best-effort: broad keyword search (title+body, all states, recency) — fetch 15, drop own issue, keep 10 — one comment fetch per hit; `Search unavailable.` on error; never gates, never auto-expands scope (advisory dedup / conflicting-design / prior-incident). All states: closed issues carry strongest dedup signals. Per hit: `## #{number} — {title} ({state})` + body + comments verbatim; design → `related-issues.md` (generate reads `(if present)`, condenses to `## Related Issues` one-liners or `None`). Plan: `{QUERY}` in plain sub-step → `related-issues.md` (tracker-gated) + `related-deferrals.md` / `related-failures.md` (awk >=2 distinct query terms, or sole term when one — runs under `none`); read by `bkit-plan-review-1/2/3`. Debug → `debug-context-related-${DEBUG_ATTEMPT}.md` (`debug-context-*` glob; excluded from `FETCH_VERDICT`). Plan runs fresh scan (standalone plan coverage).
- **Projects v2 board sync** (`issue-update-status`): best-effort, never gates; retry once after 5s on failure. `update_project_item` needs numeric `item_id`, not node id from `add_project_item` → intervening `projects_list` resolve. Status `value` = single-select option id (e.g. `47fc9ee4`), not name. Linear: no-op (state carries status).
- **Blocked-by edges:** GitHub: `<!-- bkit:blocked-by -->` in issue body. Linear: native `blockedBy` (append-only; unchanged edges = no-op).
- **Workstream milestone assignment (design Step 9):** `MILESTONE`-labelled parent groups workstreams under native milestone, NOT sub-issues. Parent must carry target (GitHub milestone / Linear project + project milestone) — MCP cannot create → unset = Step 9 Failure Path. Each workstream assigned to same target: GitHub `issue_write` `milestone` (from parent `issue_read`); Linear `save_issue` `projectId` + `projectMilestoneId`. Existing detection: GitHub `search_issues` `milestone:"{title}" in:title WS-` (index lag, best-effort); Linear `list_issues` by `projectId` + `projectMilestoneId`; match `^WS-N:` title. `Requires` → block-by edges unchanged.
- **issue-update-review** (phase-close): **update state only — never change label on close.** GitHub: no-op (phase label until ship `issue-update-merged`). Linear: `save_issue({ id, state: "In Review" })` — no `labels` (partial update would drop `bkit:auto`/`bkit:debug`).
- **issue-update-merged** (ship terminal): bkit **never auto-closes / never sets Done**. Ship drops phase labels, adds `bkit:merged`, **In Review** — Linear `state: "In Review"`, GitHub **open** (board → review, not done). Human reviews merged change and closes manually. Merge != acceptance.

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

**Why:** agent runnable standalone (`@bkit-build-challenge .worktrees/xxx-123` without live tracker issue). Inputs via filesystem paths from orchestrator. Outputs on disk: `docs/plans/{YYYYMM}/logs/{FID}/`, plan/design doc, source, or `docs/{knowledge,decisions,completed,pending}.md`. Workflow reads agent outputs → decides tracker mirror.

## Common Workflow Anatomy

Every phase command (`design`, `plan`, `build`, `debug`, `ship`) shares skeleton:

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

**Step convention:** every step ends `### 🔒 Gate N — {Step Name}` checklist (verify before proceed) + NEW tracker comment with one fenced section (§ Comment Lifecycle).

**Managed-version marker:** renderer injects `<!-- bkit:managed vX.Y.Z — do NOT edit; run \`bkit upgrade\` to refresh -->`(blank line below) after frontmatter (claude) or top (cursor/opencode strips frontmatter). Stamped at`bkit install`/`upgrade`by`stampManagedVersion`— NEVER add version to source workflow.`bkit check`flags`bkit-rendered-prompts-stale`when marker drifts — hard blocker on`main`/`dev` (or PR into them); advisory on feature branches (inherited drift).

**Pre-worktree git scope:** Step 1 + Step 2 pre-worktree guard on originating branch (often `dev`). Allow-list `git add docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl .bkit/stats.jsonl` only (FID-scoped — NEVER whole `docs/plans/` tree). Guard commit: `git diff --cached --quiet ||`. NEVER `git add -A` until `cd "$WORKTREE_PATH"` — sweeps unrelated user edits into workflow commit → rides feat → dev on merge. Post-worktree (Step 3+) `git add -A` fine; cwd = sandbox. `git worktree add` does not inherit dirty state.

**Worktree isolation (no Step 1 dev sync gate):** ALL phases Step 1: ZERO commits on `dev`; does NOT assert local `dev` synced with `origin/dev`. Step 1 only `git fetch origin dev`; work in `.worktrees/{FID}` on `feat/{FID}` (or `fix/{FID}` debug), rebased `origin/dev` in Step 2. Local `dev` ahead-of-origin irrelevant at start — Close reconciles at merge (`git pull --ff-only origin dev` before squash-merge design/plan; ship Step 9 re-check when switching post-merge). Rationale: blocking on unpushed local `dev` forces manual intervention before isolated work; those commits do not affect worktree until Close merges back.

**Branch placement:** `design`/`plan`/`build`/`debug` write + commit `status.jsonl` on `feat/{FID}` — NO mid-lifecycle `dev` push; state reaches `dev` once via Close squash-merge (design/plan) or ship PR squash (build/debug). `ship` Steps 1-8 on `feat/{FID}`, Steps 9-13 on `dev`. `cloud` = stateless dispatcher — NO `status.jsonl` (tracker comment only). See § `status.jsonl` — workflow state SoT.

### Execution Protocol — canonical invariants

Lifted verbatim into every workflow caution block. Change one wording → change all five workflow files.

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
| **Dev lock** | Repo-global `$REPO_ROOT/.bkit/.dev.lock` (gitignored), held ONLY across a **dev critical section** — any block that checks out, stages, commits, or pushes `dev` in the **main checkout**. Scope is cross-FID: the per-FID `.lock` guards two runs of the SAME feature, but concurrent runs of DIFFERENT features share `dev`, the main working tree, `.git/config` and `.bkit/stats.jsonl`, and corrupt each other with no per-FID contention. Sites: `design` and `plan` close-workflow squash; `ship` Step 6 (pre-merge dirty-dev), Step 9 (switch-to-dev), Step 13 (close), Failure Path. `build` / `debug` have none — they close via PR and never touch `dev`. Acquire is atomic (`set -C` = `O_EXCL`; a plain `>` truncate-creates and cannot arbitrate). Release via `trap 'rm -f "$DEVLOCK"' EXIT` so every `exit 1` inside the section releases. Holder line is `{ISO} {workflow} {FID}` — reported verbatim on contention. Worktree-phase work stays fully parallel; only the dev sections serialise. |

| **Pre-merge CI** | Ship re-resolves CI against the PR head it is about to merge, not the read taken at Step 2: `gh pr update-branch` moves the head immediately before `gh pr merge`, so the earlier read describes a SHA that is no longer being merged. A failed query is NOT a pass — a `statusCheckRollup` 403 (PAT scope) once voided the gate silently and a red PR reached `dev`. Anything short of `completed` and `success` refuses the merge. |
| **Artifact tree** | A subagent's artifact is asserted **under the working directory its dispatch supplied** — `{WORKTREE_PATH}` for worktree-phase agents, the main checkout for ship's deferred-sweep / update-docs / summary agents. The subagent's reported path is not evidence: the `cd` and `pwd` line in the dispatch Context is prose, and agents have written to the main checkout despite it. design / plan additionally assert no `{FID}` artifact is left untracked in the main checkout before the close squash — an untracked file at the same path makes `git merge --squash` fail with `untracked working tree files would be overwritten`. |
| **Main-checkout staging** | Every `git add` **and** `git commit` that targets the main checkout carries an explicit pathspec. `add` alone is not enough: a pathspec-less `git commit` commits the **whole index**, sweeping work a user staged themselves. Worktree-phase `git add -A` is unrestricted — that tree holds only this feature's work. |

### `status.jsonl` — workflow state SoT

`docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` = canonical workflow-state SoT: **append-only NDJSON** (one JSON event/line; prior lines NEVER mutated). Workflows only; agents MUST NOT read/write. Enables resume without re-reading plan. Current state = **fold** (see Fold); canonical reducer `.bkit/src/bkit-status.ts` (`fold` / `parseStatus`, `bkit-status.test.ts`); each workflow inlines jq filter mirroring it.

**Why event log + `merge=union`:** prior single `status.json` (mutated array) committed on **both** `dev` and `feat/{FID}` → divergent same-path content → unmergeable PR → GitHub never built `refs/pull/N/merge` → `pull_request` CI never ran. Append-only NDJSON + `docs/plans/**/status.jsonl merge=union` (`.gitattributes`, `.bkit/templates/.gitattributes` — path-scoped, NOT blanket `*.jsonl`) concatenates both branches server-side — per-FID log cannot block merge. Union may interleave/duplicate → reader de-dupes `(workflow, step, parentSha, at)`, orders by `at`, reduces.

**Branch placement (§3):**

<!-- prettier-ignore -->
| Workflow | Location | Mechanism |
| --- | --- | --- |
| `build`, `debug` | `feat/{FID}` worktree (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`) | Written + committed on `feat/{FID}` via the per-step commits. NO mid-lifecycle `dev` push (Close or Failure Path). State reaches `dev` once, at ship's PR squash-merge. |
| `design`, `plan` | `feat/{FID}` worktree (`$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`) | Written + committed on the throwaway `feat/{FID}` via the per-step commits — exactly like `build`/`debug`. NO mid-lifecycle `dev` push; status + generated docs reach `dev` together via the **Close-Workflow squash-merge** (`docs({FID}): {phase} DONE`). Failure Path appends `workflow-failed` to the retained worktree copy (no `dev` push); the tracker comment carries the failure signal. |
| `ship` | Steps 1-8 on `feat/{FID}` (worktree); Steps 9-13 on `dev` (`$REPO_ROOT/...`) post-merge | Steps 1-8 commit on `feat/{FID}` (reach `dev` via the Step-6 squash-merge); Steps 9-13 append to dev's copy. Ship is terminal, so its `dev` commit + push (Close / Failure Path) is the legitimate state landing. |
| `cloud` | — (none) | Stateless phase dispatcher — writes NO `status.jsonl` and makes no `dev` commit; the run is recorded only by its tracker comment. The dispatched skill owns its own state/FID/worktree. |

Rationale: per-run state on `feat/{FID}` removes dev↔feat divergence at source; NDJSON+union merge-safe regardless. `design`/`plan` on throwaway `feat/{FID}` like `build`/`debug` — status + docs reach `dev` via single Close squash-merge; only doc-link URLs in tracker comments hard-coded to `dev`. `cloud` = pure dispatcher — no worktree, no state, no `status.jsonl` (tracker comment only). Design/plan close `dev` commit = docs/telemetry-only, carries `bkit [skip ci]`, no CI dispatched. (`audit` not built; per design follows design/plan feat pattern.)

**Event types (one per line):**

<!-- prettier-ignore -->
| Event | Shape | Meaning |
| --- | --- | --- |
| `workflow-started` | `{type, workflow, at}` | Opens a new run of a phase workflow. |
| `step-done` | `{type, workflow, step, status, at, parentSha, artifacts, verdict?, attempt?, subPlan?, failures?, strategy?}` | One completed step (the bulk). |
| `workflow-meta` | `{type, workflow, at, …fields}` | Workflow-level metadata merged onto the run (e.g. `debugAttempt`). |
| `workflow-done` | `{type, workflow, at}` | Terminal — sets the run's `status` to `DONE`. |
| `workflow-failed` | `{type, workflow, at}` | Terminal — sets the run's `status` to `FAILED`. |
| `runtime-resolved` | `{type, workflow, at, runtime, runtimeWorktrees, runtimeDevPushes, runtimeGithubCli, runtimeGithubCliExit, runtimeGithubCliErr}` | Step-2 (Worktree Setup) record of `bkit_runtime_detect`'s capability table for this run — the first step `{FID}`/`WORKTREE_PATH` are resolved. Not folded by `BKIT_STATUS_FOLD` (unrecognised `type` — ignored, no-op) — later steps re-read `RUNTIME_GITHUBCLI` from THIS row instead of re-probing `gh` (the shim's shell state does not survive a Bash-tool-call boundary, so this row is the durable cross-block record). Emitted by `.bkit/scripts/bkit-runtime.sh`'s `bkit_runtime_row`, called in the SAME block as `bkit_runtime_detect`. |
| `transport-fallback` | `{type, from, to, reason, assertedBy, at}` | One gh->MCP transition (bounded max 1/run). `from` = the gh command that was unavailable/unauthed; `to` = the mapped MCP tool used instead; `assertedBy` = how the fallback's success was independently re-read. Not folded. Emitted by `bkit_transport_fallback_row`; read back by `bkit_close_guard_cross_check` at Close Workflow — a mapped-tool close with `runtime-resolved.runtimeGithubCli=false` and NO row here is a Failure Path. |
| `close-transport` | `{type, shape, sha, scanResult, at}` | Close Workflow's own audit-trail entry. `shape` = which close shape ran — `local` (design/plan local squash-merge + `dev` push), `pr` (design/plan PR squash-merge when `RUNTIME_DEVPUSHES` != true), `push` (build/debug direct push to the feature branch); `sha` = the commit landed on `dev`; `scanResult` = `bkit_close_guard_scan_body`'s post-close outcome on the LANDED commit BODY (subject excluded), transport-agnostic. Not folded. Emitted by `bkit_close_transport_row`. |

`workflow` ∈ `design`/`plan`/`build`/`debug`/`ship`/`audit`; `step` is a kebab slug (`build-run-tests`, `plan-verify`); `parentSha` = `git rev-parse HEAD` at step START (before any commit the step produces, forensic only); `verdict` ∈ `PASS`/`CONCERNS`/`FAIL`; `strategy` ∈ `STANDARD`/`PIVOT`/`FINAL`; `artifacts` are `docs/plans/{YYYYMM}/logs/{FID}/...` paths (or PR URL). Cross-field: when `failures` present, `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0` (`validateInvariants` in `bkit-status.ts`).

**Fold** (NDJSON → run array). De-dupe by identity (`step-done`: `(workflow, step, parentSha, at)`; workflow-level: `(type, workflow, at)`), keep first, order by `at`, reduce: `workflow-started` pushes run; `step-done` appends bare step to latest run; `workflow-meta` merges; `workflow-done`/`workflow-failed` set `status`. Canonical = `bkit-status.ts`; workflows source `.bkit/scripts/bkit-status-fold.sh` (`BKIT_STATUS_FOLD`).

**Append / read patterns** (`$STATUS` per branch-placement table — `$(git rev-parse --show-toplevel)/...` on feat, `$REPO_ROOT/...` on dev):

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

**Resume rule:** `jq -s "$FOLD"' fold | …'`. `design`/`plan`/`build`/`debug`/`ship`: prefer `feat/{FID}` worktree copy when exists (`SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"`), else dev. (`cloud` writes none.) `IN_PROGRESS` → resume after last `DONE` step (re-run if gate artifacts missing). `DONE`/`FAILED` → new run. Legacy `status.json` (no `.jsonl`) → read as folded array (`parseStatus`).

### Attempt counters — derived from status.jsonl, never carried (#58)

`*_ATTEMPT` (`VERIFY`/`TEST`/`CHALLENGE_REMEDIATE`/`NORMAL`/`SOAK`/`MERGE`/`DEBUG`) **derived** from `status.jsonl` in the fenced block that uses them — never carried across Bash calls, never prose-assigned (`Init counters:` / `Increment X + 1` PROHIBITED). Re-derive every block (shell state does not persist). Gate: `.bkit/src/bkit-counter-prose-audit.test.ts`. `MAX_*` from `.bkit/scripts/bkit-counter-bus-config.sh` by name only.

Fold: `.bkit/scripts/bkit-status-fold.sh` (`BKIT_STATUS_FOLD`), sourced via `bkit-counter-bus.sh`.

<!-- prettier-ignore -->
| Pos | Helper | When | Notes |
| --- | --- | --- | --- |
| 1 start | `counter_next` | before own row | `count+1` (artifact + row) |
| 2 after-write | `counter_current` | after own row appended | `count`; refuses 0 (exit 2) |
| 3 other-step | `counter_count` | prior / not-yet-run step | 0 legal (challenge-remediate first pass; SOAK budget) |
| commit subject | — | already derived in-block | no separate derive |

`attempt` on `step-done` = telemetry-only (routing counts rows). `workflow-meta.soakEntryAt` → fresh SOAK budget on entry. Fold de-dupe `(workflow, step, parentSha, at)` — drop per-attempt commit → retries collapse (`debug-run-tests` keeps no in-block commit; `parentSha` advances via later steps — `docs/deferrals.jsonl` → `58-debug-run-tests-parentsha-advances-only-transitively`).

Scope: `counter_*` = **active-run**; `DEBUG_ATTEMPT` + `PRIOR_STRATEGY` = **all-runs** (invocation index / strategy ladder).

### Routing state — durable mode / verdict / strategy (#58 follow-up)

Cross-block routing vars re-read from `status.jsonl` via `.bkit/scripts/bkit-status-route.sh` (source after `bkit-status-fold.sh`):

| Helper                                             | Scope        | Notes                                      |
| -------------------------------------------------- | ------------ | ------------------------------------------ |
| `route_get_debug_mode` / `route_append_debug_mode` | active-run   | `NORMAL`/`SOAK`; meta wins over step field |
| `route_get_push_mode` / `route_append_push_mode`   | active-run   | `PR`/`LOCAL`                               |
| `route_last_verdict` / `route_last_failures`       | active-run   | last DONE step; `--sub-plan N` optional    |
| `route_last_strategy`                              | **all-runs** | PRIOR_STRATEGY shape                       |
| `ladder_next`                                      | —            | `''→STANDARD→PIVOT→FINAL→FINAL`            |

Same-block artifact extraction still authors verdicts; status is the cross-block/resume source. Fail-closed (exit 2).

### Concurrency lock

`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` = plain text `{ISO_TIMESTAMP} {workflow}`. **Absolute** path (main repo via `git rev-parse --path-format=absolute --git-common-dir`) — acquire/release same inode from main repo or worktree. Step 1 after `mkdir -p`; released Close Workflow + Failure Path; both assert absent before exit.

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

**Staleness rule:** read owning workflow's status.jsonl via fold (`design`/`plan`/`build`/`debug`/`ship` prefer `feat/{FID}` worktree, else dev). (`cloud` holds no lock, writes no status.) `DONE`/`FAILED` → clean silently; `IN_PROGRESS` + last step <30min idle → concurrent run, Failure Path; `IN_PROGRESS` + >=30min → orphaned, clean and proceed. Lock with no matching run in folded log → stale, clean.

### Comment Lifecycle

Every workflow step posts NEW tracker comment via inline `comment-post-step` block (per-tracker `github`/`linear`/`none`, resolved at install; § Tracker Blocks). NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Each step independent — no comment-ID carry-forward, no body concatenation.

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

Tracker write calls (issue update, comment post) = observability, NOT gates. NEVER block, hang, or fail workflow on tracker write failure. Tracker reads (issue read, list comments) remain authoritative.

**Wrapper semantics — every tracker write:**

1. Attempt call.
2. `rate_limited` / transient → wait 5s, retry once.
3. Second failure → `TRACKER_DEFERRED` = true, append `TRACKER_DEFERRED=true reason={error}` to next commit message, proceed.

**Gate phrasing:** `Issue update attempted (label set X)` / `Issue comment attempted (Step N section)` — NOT `Issue state X set` or `Issue comment created` (imply success).

### Versioned Outputs

Every transformation step writes ONE versioned file in `docs/plans/{YYYYMM}/logs/{FID}/`. Steps NEVER write canonical `docs/plans/{YYYYMM}/{FID}-*.md` directly — populated only by close-workflow copy of highest version. `{YYYYMM}` = month bucket at first workflow start (`date +%Y%m`); downstream discovers via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/`.

**Naming:** `logs/{FID}/{workflow}-v{N}-{action}.md` — incrementing `N`, `action` = producer. Directory conveys FID; do NOT prefix filename.

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

**Close-workflow copy (plan + design only):** highest `v{N}` matching `logs/{FID}/{workflow}-v*.md` → copy verbatim to `{YYYYMM}/{FID}-{workflow}.md`. SPLIT: parent + each numbered sibling.

### Verdict Validation

Verdict-bearing subagents MUST emit verdict header as first non-blank line, BEFORE other content. Orchestrator validates; re-issues on invalid.

**Subagent contract:**

1. Verdict line FIRST: `Verdict: PASS | CONCERNS | FAIL` (one of three; NEVER `PENDING`, NEVER blank).
2. Then `<!-- verdict:end -->`.
3. Then rest (record, body, etc.).

Mid-stream termination after verdict line → usable verdict + truncated body (detectable separately); verdict signal not lost.

**Orchestrator contract:**

1. After return, read until `<!-- verdict:end -->`.
2. Extract `Verdict:` → `{VERDICT}`.
3. Assert `{VERDICT} ∈ {PASS, CONCERNS, FAIL}`.
4. **If invalid** (missing, empty, `PENDING`, other):
   - Re-issue same subagent: "Your prior output `{file}` is missing/invalid verdict. Re-emit ONLY the verdict header (`Verdict: PASS|CONCERNS|FAIL` + `<!-- verdict:end -->`) at the top of that file. Do NOT redo the work; the body is already in place."
   - `VERDICT_RETRY` = 1.
5. **If retry fails** (`VERDICT_RETRY` > 1) → **Failure Path**.
6. Orchestrator NEVER synthesizes verdict — masks truncation/budget signals.

**Per-step gate item (verdict-bearing steps):**

```
[ ] Verdict valid ({VERDICT} ∈ {PASS, CONCERNS, FAIL})
```

### Gates

Every step ends `### 🔒 Gate N — {Step Name}` + checklist.

**Format:** `[ ] What (settings)` — verb-led clause, parenthetical for specifics. Do NOT lead with value, path, or variable list.

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

All subagents via `@agent-name` + Agent tool. Per-step convention:

```
Context: You are a subagent in the {Phase} phase {modifier — e.g. "running in parallel with other agents"}
Read:    {paths the agent reads, read-only}
Update:  {existing paths the agent modifies in-place}        ← omit if no in-place edits
Create:  {paths the agent writes fresh, with annotations e.g. (MAX 500 token summary)}
```

Then assert each Update/Create artifact exists, non-empty. Empty → **Failure Path**.

**Per-agent description, scope, effort tier, tool surface, `maxTurns` → `.bkit/prompts.md`** (indexes `.bkit/prompts/*.md`; single source for agent metadata). This file = how workflow layer composes them.

**Cross-platform tool surface:** subagent `tools:` allowlist enforced Claude (native) + Cursor (passthrough, 2.4+). Removing `Edit`/`Bash` = provably non-mutating both hosts. `bkit install` T3 passes `tools:` verbatim; never emits `readonly:` (Cursor honours `tools:` directly).

**Parallel fan-outs** (effort / model diversity, sibling-blind):

<!-- prettier-ignore -->
| Siblings | Used in step | Sibling-blind contract |
| --- | --- | --- |
| `@bkit-design-brainstorm-ideate-1` / `-2` / `-3` | `/bkit-design` Step 3 | Each agent's prompt forbids reading any sibling output. Triplet — pragmatic / optimal-tradeoff / risk-premortem lenses. |
| `@bkit-design-review-1` / `-2` | `/bkit-design` Step 5 | Same; pair. |
| `@bkit-plan-review-1` / `-2` / `-3` | `/bkit-plan` Step 5 | Same; triplet — tightness / dependency-correctness / regression-risk lenses. |
| `@bkit-plan-scope-check-1` / `-2` | `/bkit-plan` Step 7 | Same; pair. |
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

Every command has `## 🤖 Failure Path` before Step 1. Any step / tool / gate failure triggers it.

**Standard failure (always):**

1. Mark `status.jsonl` last entry `status: "FAILED"`; remove `.lock` at `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` (absolute); **assert absent** (else exit non-zero `Lock removal failed`). `plan`/`design`: failed-status commit additionally pushes `dev` (best-effort `2>/dev/null || true`).
2. Add `Failed` to `{LABELS}` (additive — phase persists) → `issue-update-failed` snippet.
3. Append `### Workflow Failure` block: step number, error, last 20 stderr lines.

**Conditional handover** — ONLY on max-retry exhaustion (`MAX_VERIFY_ATTEMPT` / `MAX_TEST_ATTEMPT` / `MAX_NORMAL_ATTEMPT` / `MAX_SOAK_ATTEMPT` / `MAX_MERGE_ATTEMPT`) **and** worktree exists (handover agent `cd`s `.worktrees/{FID}`; `/bkit-debug` decides `DEBUG_MODE` Step 1 before worktree — Failure Path guards `.worktrees/{FID}` before mode-triggered handover; pre-worktree failure with mode set → straight STOP):

4. `@bkit-debug-abort-handover` with prior logs as Read; Write `docs/plans/{YYYYMM}/logs/{FID}/{phase}-handover.md`.
5. `git add -A` → commit `docs({FID}): {phase} aborted bkit [skip ci]` → push, guarded on open PR (EC-2 in #261): probe `gh pr list --head "$(git branch --show-current)" --base dev --json number --jq '.[0].number'`. Open PR → **do NOT push** `[skip ci]` abort; preserve remote HEAD; log `[bkit-ci-gate] abort-guard: open PR on branch — preserving last validated remote HEAD (no push)`. No PR → push. **Probe failed → inverted safe default: treat as PR exists, do NOT push** (pushing `[skip ci]` abort onto live PR empties rollup; not-pushing on no-PR branch harmless) — log probe failure with `[bkit-ci-gate]`.
6. Append `### Workflow Handover` with handover blob link + verbatim body.

7. **STOP** — no downstream steps.

`/bkit-design` = only command without conditional handover (no max-retry loop).

### Rebase Conflict Tiering

`/bkit-ship`, `/bkit-build`, `/bkit-debug` Step 2 all rebase the feature worktree against `origin/dev`. Three-tier recovery:

<!-- prettier-ignore -->
| Tier | Conflict shape | Recovery | Mechanism |
| --- | --- | --- | --- |
| 1 | Append-only ledgers (`docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/completed.md`, `.bkit/stats.jsonl`) + per-FID `status.jsonl` (`docs/plans/**/status.jsonl`) | `merge=union` — git auto-concatenates both sides | `.gitattributes` (template at `.bkit/templates/.gitattributes`, installed to consumer roots by `bkit install`); conflict never reaches the workflow |
| 2 | `pnpm-lock.yaml` only | Inline `git checkout --theirs pnpm-lock.yaml` + `pnpm install --lockfile-only` + `git add` + `git rebase --continue` | Bash block in Step 2 of all three workflows |
| 3 | Code, configs, anything else | Touch sentinel `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` → Failure Path → conditional handover | Sentinel-file pattern; `/bkit-ship` Failure Path additionally invokes `@bkit-ship-conflict-resolve` before `@bkit-debug-abort-handover` |

**Why Tier 1 `merge=union` not workflow step:** trade-off = interleaved/duplicated rows when both append — reader identity-tuple dedup (`(kind, repo, key)`), not regression. `.gitattributes` = standard git mechanism; pre-empts conflict for all callers. Excludes `.bkit/friction.jsonl` (same-`key` updates break strict-append union-safety).

**Why Tier 2 inline bash not subagent:** mechanical, deterministic git plumbing, no judgement. Subagent/new Step = status.jsonl / gate / comment overhead for 4-line shell idiom.

**Why Tier 3 `@bkit-ship-conflict-resolve` only in `/bkit-ship`:** ship rebases against active integration target — conflicts common. `/bkit-build`/`/bkit-debug` on isolated feature branch — rarer conflicts, deeper problems → sentinel → handover only. Resolver verdict (`pnpm install` + `typecheck` + `test` + `build` PASS) necessary not sufficient — tests pass while intent dropped → refuse semantic overlaps, handover on ambiguity. `bkit-debug` NOT repurposed for git plumbing — diagnose/remediate scoped to test/runtime failures.

**Failure Path routing:** rebase sentinel → conditional handover via `@bkit-debug-abort-handover` (same as max-retry) → handover doc, `Failed` label, `In Review` — not silent stop.

### `bkit [auto route]` Marker Propagation

`bkit [auto route]` = CI commit-message marker enabling free-tier `bkit-cloud.yml` auto-route gate. On **close-workflow commit** (and debug **re-trigger commit**); re-carried onto later bkit-driven commits that can become CI-triggering feat-branch HEAD — ship **dev-sync merge** (`chore({FID}): sync dev`), **conflict-resolve** — ONLY when issue carried `bkit:auto`. Re-carry required: gate reads single commit `head_commit.message`; unmarked commit on top buries marker; ship dev-sync = bkit analogue of ad-hoc `merge origin/dev` that unblocked CI. NOT CI-suppressing (HEAD-Subject Assertion = deny-list, passes automatically).

**Placement (mode-dependent):**

- `/bkit-build` Step 17: `bkit:auto` re-read BEFORE close-workflow commit. Present → subject `chore({FID}): close-workflow bkit [auto route]`. Close-workflow = feat-branch HEAD firing CI → gate checks `head_commit.message`.
- `/bkit-debug` Step 12 PR-mode: same — marker on close-workflow. Create-pr (sub-step 9) does NOT run (`TRIGGER_PR=0`).
- `/bkit-debug` Step 12 local-mode: `bkit:auto` re-read before create-pr (sub-step 9). Marker on create-pr = CI-triggering HEAD local-mode.
- `/bkit-ship` Step 4 (conflict-resolve) + Step 6 (dev-sync): re-derive `AUTO_ROUTE_SUFFIX` from Step-1 `LABELS` (`echo "${LABELS:-}" | grep -q 'bkit:auto'`, fail-closed empty) → append to commit/merge subject — opted-in branch keeps marker when either commit becomes CI-triggering HEAD. Ship uses Step-1 `LABELS` (not fresh MCP); cloud gate in-job `bkit:auto` re-check = live kill switch.

**Why re-read must precede commit (R2-1/R2-2):** kill-switch re-read at build Step 17 / debug Step 12 sub-step 11 runs AFTER commit+push — cannot source marker on existing commit. Fresh `bkit:auto` read BEFORE commit construction = authoritative "at close time" signal.

**Coexistence with `bkit [verbose ci]`:** debug local-mode both on same subject: `chore({FID}): close-workflow bkit [verbose ci] bkit [auto route]`. HEAD-Subject Assertion: both legitimate. Gate reads `bkit [auto route]` via `contains(head_commit.message, 'bkit [auto route]')` — `bkit [verbose ci]` does not interfere.

**Cleanup:** self-clearing per push — only close-workflow, debug re-trigger, ship dev-sync/conflict-resolve carry it. No PR-title edit (unlike `bkit [verbose ci]` debug PR-mode); auto-route fires on commit message.

### `bkit [verbose ci]` Marker Propagation

`bkit [verbose ci]` = CI commit-message / PR-title marker (`docs/deployments.md` § Commit-message force tags) escalating log detail one run. `/bkit-debug` auto-applies every CI-triggering push (retry evidence); `/bkit-build` and `/bkit-ship` never apply. Template ci.yml § `bkit:start verbose-ci-env` for env block; `docs/testing.md` § "CI verbosity" for knob list.

**Why debug always-verbose, build never:**

- **Debug = failure-recovery.** Verbose every push → attempt N+1 diagnose reads rich logs from attempt N verify — eliminates one-cycle latency of "verbose only on retry".
- **Build = happy-path / ship-eligible.** Verify-retry local; only final summary/create-pr/close-workflow push CI — verbose would carry downstream onto ship. Escalation to verbose when build Failure Path triggers `/bkit-debug`.
- **Ship = green-path.** Verbose on green runs = cost (storage + time), zero diagnostic payoff.

**Mode-dependent propagation (`/bkit-debug`):**

GitHub Actions: `push.head_commit.message` vs `pull_request.title`. Template ci.yml `on:` `branches: [main, dev]` → feature pushes fire `pull_request.synchronize`, not `push`. `PUSH_MODE` (Step 1 sub-step 6 from `gh pr list --head <branch>`) drives marker surface:

<!-- prettier-ignore -->
| `PUSH_MODE` | When | CI event fired by debug push | Marker surface | Mechanism |
| --- | --- | --- | --- | --- |
| `LOCAL` | Debug invoked on a `dev` / `main` failure (no PR involved) | `push` event reads `head_commit.message` | **Commit message** | `bkit [verbose ci]` appended conditionally via `VERBOSE_SUFFIX=""; [ "$PUSH_MODE" = "LOCAL" ] && VERBOSE_SUFFIX=" bkit [verbose ci]"` immediately before the relevant commits in `bkit-debug.md` (Step 6 `fix`, Step 7 `soak`, Step 9 `summary`, Step 10 `close-workflow`, Step 10 `create-pr`). PR-mode runs skip the suffix (`pull_request` events ignore commit messages). Self-clearing per push — non-debug pushes return to default. |
| `PR` | Debug invoked on a feature branch with an open PR (the dominant case) | `pull_request.synchronize` reads `pull_request.title` | **PR title** | Step 10 (Push Remediation) runs `gh pr edit --title` to idempotently append `bkit [verbose ci]` to the PR title (skip if already present) immediately before the push. Step 12 (Close Workflow) strips it via `sed` + `gh pr edit` on a successful close. Failure Path / handover **do NOT strip** — the post-handover human investigator wants continued verbose CI. |

Both paths idempotent — re-run skips when present; orphan markers cleaned by next debug Step 12 strip on successful close.

**Cleanup invariant:** PR-title marker stripped on successful `/bkit-debug` close (Step 12, `PUSH_MODE = PR`). Failure Path / handover preserve intentionally — post-handover investigator wants continued verbose CI. Cleanup via: (a) next `/bkit-debug` close success, (b) manual strip, (c) PR merge — squash subject inherits `bkit [verbose ci]` → one post-merge dev CI verbose (harmless, recovery evidence).

**Manual override:** append `bkit [verbose ci]` to any commit message or PR title — env block honours both. Debug auto-propagation removes manual need for dominant retry-evidence case.

## Per-Phase Workflows

Each subsection documents command behaviour — steps, subagents, artifacts, verdict routing, close. Agent capability/effort → `.bkit/prompts.md`.

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

**Step 9 contract:** workstream-issue body carries everything `/bkit-plan` needs — no tracker labels, no `WS_ID`, no parent-shape detection. Markers `**Parent design:**`, `**Workstream:**` load-bearing — parsed by `/bkit-plan` Step 1 (`PARENT_FID`) and `bkit-plan-generate` Contract. `**Parent design:**` = markdown link with bare path display text for plan parser. `Requires:` → block-by edges → `/bkit-build` Step 1 `issue-blockers-check` enforces ordering. Workstreams grouped by parent native milestone/project — NOT sub-issues (MCP cannot create milestone). Re-runs non-destructive: bodies/titles never rewritten (sync comments only); orphans get `## Workstream Delete` comment. Single-workstream designs still spawn one issue; design and plan never share FID.

### `/bkit-plan` — 12 steps

**Goal:** plan at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical bucket; `{YYYYMM}` = creation month). No code, no execution. Always hard-stops after summary for human review.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Set label `Plan`, `In Progress`. Parse `**Parent design:**` from `DESCRIPTION` → set `PARENT_FID` (sub-issue case); **else** leave empty (standalone plan run on issue input alone). NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Worktree on `feat/{FID}`; `plan-input.md` = session prompt + tracker issue description + comments. **If** `PARENT_FID` set → also concatenates `{PARENT_FID}-design.md` (missing file → Failure Path). Standalone plans skip the design append. |
| 3 — Generate Plan | `@bkit-plan-generate` | Reads `docs/plans/template.md` (canonical plan template). Writes `plan-generate.md` log + `docs/plans/{YYYYMM}/{FID}-plan.md`. |
| 4 — Fetch Context | — | Related-issues tracker search (keyed on the generated plan's surfaces) + local `docs/{deferrals,failures}.jsonl` greps → `related-issues.md` (tracker-gated), `related-deferrals.md`, `related-failures.md` (each `None` when empty). Advisory context for review; never gates, never auto-expands scope. |
| 5 — Review Plan | `@bkit-plan-review-1` ‖ `-2` ‖ `-3` (parallel triplet) | Reads plan + the three `related-*.md` context files. Tightness / dependency-correctness / regression-risk lenses. All three write critique logs. Missing or vague `**Done when:**` on any task → CRITICAL. |
| 6 — Apply Review | `@bkit-plan-update` | In-place edits to `{FID}-plan.md`; writes `plan-apply-review.md` log. Preserves every task's `**Done when:**` line (may tighten, never remove/weaken). |
| 7 — Check Scope | `@bkit-plan-scope-check-1` ‖ `@bkit-plan-scope-check-2` (parallel) | Scope completeness audit. `**Done when:**` is the literal criteria slot; missing on any task → FAIL. |
| 8 — Apply Scope | `@bkit-plan-update` | In-place edits; scope expansions → APPEND `docs/deferrals.jsonl`. |
| 9 — Check Complexity | `@bkit-plan-complexity-check` | `COMPLEXITY_VERDICT` ∈ {single, split}. |
| 10 — Split Plan | `@bkit-plan-complexity-split` _(only if `split`)_ | Writes `{FID}-plan-N.md` sub-plans + `plan-split.md` log; self-verifies losslessness (`SPLIT_VERDICT` ∈ {PASS, FAIL}; `FAIL` → Failure Path). |
| 11 — Summary | `@bkit-plan-summary` | Commit `chore({FID}): summary bkit [skip ci]` → push. |
| 12 — Close Workflow | — | Sync to `dev`, prune worktree, delete branches (same as `/bkit-design` Step 10). Set state `In Review`; phase label `Plan` persists. Final return displays `plan-summary.md` verbatim. |

**Hard stop in Step 12 caution block:** "Plan requires human review. Do NOT invoke `/bkit-build`."

### `/bkit-build` — 17 steps

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
| 17 — Close Workflow & Create PR | — | `bkit:auto` re-read BEFORE close-workflow commit; open-PR probe; if `supabase/migrations/` changed and HEAD lacks `bkit [force build]` → amend or empty commit with `bkit [force build]` → push. PR body is the plan blob URL. `gh pr create --base dev` (base pinned). Retry `gh pr create` once on failure. Post-create assertion: `gh pr view --json baseRefName` = dev else Failure Path — guards against repos whose default base is `main`. Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim. |

**Failure Path includes handover** — when triggered by exhausted retry counts, invokes `@bkit-debug-abort-handover` and posts `Workflow Handover` comment.

### `/bkit-debug` — 10 steps

**Goal:** diagnose and remediate failing test or CI run; push fix back to branch.

**Mode detection (Step 1):** `gh pr list --head $(git branch --show-current) --base dev`: PR exists → `PUSH_MODE` = PR, else LOCAL; `DEBUG_ATTEMPT` = prior `debugAttempt` from status.jsonl + 1; then `DEBUG_MODE` (NORMAL | SOAK) from objective signals: default NORMAL; `DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` OR `[soak]` in session prompt → SOAK. On resume, `DEBUG_MODE` = SOAK if any `debug-failure-soak` step for current `DEBUG_ATTEMPT` (mid-run switch sticky). Non-localisable-cause → SOAK judged Step-5 diagnose `Mode: SOAK`, not here.

**Ladder + cutover:** `NORMAL` (diagnose + remediate) and `SOAK` (accumulating-context instrument-or-fix). No observe mode — `[DEBUG-OBSERVE]` only in soak agent loop. SOAK entry: invocation start (`DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` or `[soak]`); mid-run Step-5 `Mode: SOAK` (`Verdict` != PASS); `NORMAL` exhausts `MAX_NORMAL_ATTEMPT` (STANDARD → PIVOT → FINAL) — final SOAK escalation before handover. Every SOAK entry resets `SOAK_ATTEMPT` = 0 (fresh `MAX_SOAK_ATTEMPT` budget, independent of spent `NORMAL_ATTEMPT`; worst case NORMAL 3 + SOAK 3). SOAK terminal (one-way). Soak loops whatever Run Tests fails on (live or mocked). Diagnose RECOMMENDS; orchestrator DECIDES.

**Loop:** Step 3 Run Tests (head; iter 1 = reproduce) → FAIL with budget → Step 4 Fetch Context → fix step (`NORMAL` → Diagnose 5 + Remediate 6; `SOAK` → Soak 7) → loop Step 3. PASS after fix → Push 8 → Summary 9 → Close 10; PASS no fix → can't-reproduce → Summary (CONCERNS). NORMAL exhaust → SOAK fresh budget; SOAK exhaust → Failure Path. Close asserts no `[DEBUG-OBSERVE]` survives debug diff (no-leak) before CI push.

**Live tier (Step 3):** appends declared `test:integration:live` / `test:e2e:live` / `test:live` unless `[live=off]`; recorded verbatim in `scope`. No live tier → CONCERNS + `testsLiveSkipped` at close — never silent pass. "Did live run?" = read `scope` after fact.

**Context fetch (Step 4):** mode-agnostic, per loop iteration on FAIL. Five sub-fetches priority order → artifacts only when content: (a) CI failure — `gh run view --json jobs` triage + `##[error]`/`::error` + failed-step logs → `debug-context-ci-{DEBUG_ATTEMPT}.md`; (b) diff vs last-passing CI on `dev` → `debug-context-diff-{DEBUG_ATTEMPT}.md`; (c) local suite → `debug-context-tests-local-{DEBUG_ATTEMPT}.md`; (d) Playwright via `gh run download` → `debug-context-tests-e2e-{DEBUG_ATTEMPT}.md` when e2e/playwright job failed (text inlined, binary listed); (e) runtime logs — one `debug-context-runtime-<name>-{DEBUG_ATTEMPT}.md` per `<!-- debug-fetch:start [name] -->` after `<!-- bkit:end -->` in `.agents/config.md` (consumer blocks only; self-gates on CLI/token; stderr breadcrumb when skipped — load-bearing for headless cloud). Any/all/none may exist; fail-soft throughout.

<!-- prettier-ignore -->
| Step | Subagent(s) | Notes |
| --- | --- | --- |
| 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Add `Debug` additively (prior phase label persists), state `In Progress`. PR-mode: extract `PR_NUMBER` → `PUSH_MODE`. Read prior `debugAttempt` from status.jsonl → `DEBUG_ATTEMPT` = prior + 1. Set `DEBUG_MODE` (NORMAL | SOAK; objective signals: `DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` + session-prompt `[soak]`). NO commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | Branch fallback differs from feat workflows: if no `feat/{FID}` branch exists locally or on origin → `git worktree add -b fix/{FID} origin/dev`. Branch eligibility check: `BRANCH` must be `dev` OR contain `{FID}` OR contain `{ISSUE_ID}` (case-insensitive) — else Failure Path with `Wrong branch.` Writes `debug-input-{DEBUG_ATTEMPT}.md` (failure description only — no workflow state). Init `NORMAL_ATTEMPT` = 0, `SOAK_ATTEMPT` = 0. Persists `debugMode` / `pushMode`. |
| 3 — Run Tests | — | **LOOP HEAD (both modes).** Increment `NORMAL_ATTEMPT`. Detect `turbo.json`: present → `pnpm turbo lint typecheck test test:integration test:e2e --filter='...[origin/dev]' --continue` (append any declared `test:integration:live` / `test:e2e:live` / `test:live` LAST, opt-out via `[live=off]`); absent → single-package fallback. Iteration 1 = reproduce. Records `verdict` + `failures` + `scope` (the verbatim test command; contains a `test:...:live` task only when a live tier ran); commits `chore({FID}): run-tests attempt {NORMAL_ATTEMPT}` (status durable before route). PASS + `NORMAL_ATTEMPT` > 1 → Step 8; PASS (unreproduced) → Step 9; FAIL + NORMAL + `NORMAL_ATTEMPT` <= `MAX_NORMAL_ATTEMPT` → Step 4; FAIL + NORMAL + exhausted → set SOAK, reset `SOAK_ATTEMPT` = 0 → Step 4; FAIL + SOAK + `SOAK_ATTEMPT` < `MAX_SOAK_ATTEMPT` → Step 4; else → Failure Path. |
| 4 — Fetch Context | — | _(on FAIL with budget)_ Mode-agnostic. Five sub-fetches in priority order (CI logs / diff vs last-passing CI / local run output incl `[DEBUG-OBSERVE]` / Playwright e2e / runtime logs) + a related-issues tracker search → per-source `debug-context-*-{DEBUG_ATTEMPT}.md` written only when content exists. Routes: SOAK → Step 7; else → Step 5. |
| 5 — Failure Diagnose | `@bkit-debug-failure-diagnose` _(only if `DEBUG_MODE` = NORMAL)_ | `STRATEGY` STANDARD → PIVOT → FINAL by prior diagnose. Writes `debug-failure-diagnose-{NORMAL_ATTEMPT}.md`; when a live tier failed on a functional assertion, anchors on that real-boundary ground truth (treats infra/credential failures as environment, not feature-broken). Sets `Mode` (NORMAL | SOAK) — `SOAK` when the cause is not localisable (gated on `Verdict` != PASS); in `NORMAL` the orchestrator then fast-tracks to Step 7 (Soak), resetting `SOAK_ATTEMPT` = 0, else → Step 6. |
| 6 — Failure Remediate | `@bkit-debug-failure-remediate` _(only if `DEBUG_MODE` = NORMAL)_ | Writes `debug-failure-remediate-{NORMAL_ATTEMPT}-log.md` + source files. Orchestrator commits `fix({FID}): {description}{VERBOSE_SUFFIX}` (`{description}` from the first `DONE — Step` line, truncated to 72 chars; `VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `PUSH_MODE = LOCAL`); the fix commit is the HEAD the next Run Tests / Push pushes. → loop to Step 3. |
| 7 — Failure Remediate Soak | `@bkit-debug-failure-soak` _(only if `DEBUG_MODE` = SOAK)_ | Increment `SOAK_ATTEMPT`. One accumulating context (reads its prior `debug-failure-soak-*-log.md`) applies the single next instrument-or-fix step against the failing boundary (the real model/DB/stream behind a live tier when one ran, else the failing tier the run surfaced); adds `[DEBUG-OBSERVE]` scaffolding and strips every marker before any declared fix (no-leak); commits `fix({FID}): soak {description}`. → loop to Step 3. Bounded by `SOAK_ATTEMPT` (`MAX_SOAK_ATTEMPT`, reset to 0 on each SOAK entry). |
| 8 — Push Remediation | — | _(PASS after a fix)_ Status file-only (no intermediate commit so Step 6/7's `fix(...)` stays HEAD at push). PR-mode: append `bkit [verbose ci]` to PR title if absent. Push. → Step 9. |
| 9 — Summary | `@bkit-debug-summary` | Commit `chore({FID}): summary{VERBOSE_SUFFIX}` → push. `SUMMARY_VERDICT` = PASS/CONCERNS → Step 10; FAIL → Failure Path. |
| 10 — Close Workflow | — | No-leak assertion: fails the run if any added `[DEBUG-OBSERVE]` line survives the debug diff (`git diff origin/dev..HEAD`, excluding `docs/plans/`) before the CI-triggering push — diff-scoped, NOT a tree-wide `git grep`, so the bkit-managed prompt/command files that quote the literal marker never false-trip (the soak agent's own `git grep '[DEBUG-OBSERVE]'` self-check in `bkit-debug-failure-soak.md` is the first layer). Else Failure Path. PR-mode: strip `bkit [verbose ci]` from PR title. Commit `chore({FID}): close-workflow{VERBOSE_SUFFIX}` → push + (LOCAL, no PR) `chore({FID}): create-pr{VERBOSE_SUFFIX}` (`VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `PUSH_MODE = LOCAL`). Auto-route marker `bkit [auto route]` on the CI-triggering HEAD when `bkit:auto`. Records `testsLiveSkipped` when no live tier ran (no `test:...:live` task in `scope`). Set state `In Review`; phase label `Debug` persists. Worktree persists. The handover path runs via Failure Path. Final return displays `debug-summary.md` verbatim. |

**Failure Path** includes conditional handover via `@bkit-debug-abort-handover` when max-retry exhausted → `debug-handover.md`. PR-mode `bkit [verbose ci]` **preserved** (NOT stripped) — investigator wants ongoing verbose CI; § `bkit [verbose ci]` Marker Propagation cleanup invariant.

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
| 9 — Switch to Dev | — | `git checkout dev && git fetch origin dev`. If local `dev` is ahead with `[skip ci]` commits only → rebase onto `origin/dev` and push (no CI). Ahead with any non-`[skip ci]` commit → refuse, listing the offending commits and the reconcile recipe; ship never pushes them for you, because a CI-triggering push to `dev` can cancel the in-flight run validating this merge and leave the feature merge unvalidated (the reported incident: run #785 cancelled #784). Not ahead → `git pull --ff-only origin dev`. Steps 10+ run on `dev`. Its post-merge test-validation gate selects the squash run's jobs by the `startswith("bkit-tests")` namespace prefix, so the planner (`bkit-tests-scope`) is now inside that set — benign, since it collapses to the capstone alone whenever `bkit-tests-check` is present, and scope is always-on. Ship carries NO CI-Dispatch gate (it polls the squash SHA's run directly), so the build/debug probe rename does not reach it. |
| 10 — Update Docs & Summary | `@bkit-ship-update-docs` ‖ `@bkit-ship-summary` (parallel) | No archive step — plans are already at canonical `docs/plans/{YYYYMM}/`. Both subagents in parallel. `update-docs` writes `ship-update-docs.md` + edits cataloged docs (incl. `docs/completed.md`, which references `docs/plans/{YYYYMM}/{FID}-plan.md`). `summary` writes `ship-summary.md` (incl. the resurfaced declared-deferral section lifted from `ship-deferred-sweep.md`). Sibling-blind: `summary` MUST NOT read `update-docs.md`. Commit `docs({FID}): update-docs-summary`. `SUMMARY_VERDICT` or `UPDATE_DOCS_VERDICT` = FAIL → Failure Path. |
| 11 — Prune Skills | — | Uninstall any `.agents/skills/` skills not listed in `.agents/skills.md` via `npx skills remove -y`. Commit `chore({FID}): prune-skills`. |
| 12 — Worktree Cleanup | — | `git worktree remove .worktrees/{FID} --force` → `git worktree prune` → `git branch -D feat/{FID}` → `git push origin --delete feat/{FID}` → `git fetch --prune origin`. Local + remote branch deletion is explicit because `gh pr merge --delete-branch` aborts both sides when the local one fails (worktree holds the ref). Squash-merged tip is unreachable from `dev`, so `-D` is correct. |
| 13 — Close Workflow | — | Assert the squash-merge CI run reached `status` = completed (an unfinished run has a null `conclusion`, which fail-open equality checks read as green), was neither cancelled nor a failure, and that its test tiers passed: the `bkit-tests-check` capstone where adopted — it is the sole authority there, since it already reds the build if any tier the plan expected was skipped, so a tier it let self-skip must not fail this gate — else every `bkit-tests*` lane, fail-safe on `!= "success"`. Exact-match by job name: no job is named `bkit-tests` any more, and a substring match on `test` also catches unrelated jobs (`latest-deploy`). Final commit `docs({FID}): ship DONE bkit [skip ci]` → push `dev`. Add `Merged` label, drop `Failed` if present, state `Done`. Final return displays `ship-summary.md` verbatim. **HARD STOP**. |

**Failure Path** includes conditional handover via `@bkit-debug-abort-handover` writing `ship-handover.md` when max-retry exhausted.

### `/bkit-audit` — 7 steps _(planned — `bkit-audit.md` not yet in `.bkit/workflows/`)_

**Goal:** read-only multi-lens audit. No code, no execution. Always hard-stops after summary for human review (do NOT invoke `/bkit-plan` or `/bkit-build`). Triggered ad-hoc by a human; NOT part of the design → plan → build → debug → ship auto-cycle.

> **Planned prompt names** below (`@bkit-audit-*`) are stubs for the future audit workflow. They are **not** the shipped `@bkit-utility-audit-*` agents (ad-hoc utility audits). Do not rename one onto the other when implementing `bkit-audit.md`.

<!-- prettier-ignore -->
| Step | Subagent(s) | Read | Write | Notes |
| --- | --- | --- | --- | --- |
| 1 — Start Workflow | — | Linear issue | `.lock`, Linear comment | Pre-flight: fetch `origin/dev`. Resolve argv (no-arg / glob / `TEAM-NNN`) → set `SCOPE_GLOB`, `ISSUE_ID`. Create-or-reuse master Linear issue. NO phase label. FID-format invariant assertion (standard form OR `-audit-{YYYYMMDD-HHmm}` suffix for re-audits). NO commits on `dev` — `status.jsonl` init + `audit-start-workflow` step entry deferred to Step 2 inside the worktree. |
| 2 — Worktree Setup | — | repo | `.worktrees/{FID}`, `audit-input.md` | Create or resume worktree on `feat/{FID}` (fallback: `HEAD`). Read-only — drops `pnpm install --frozen-lockfile`. |
| 3 — Audits | `@bkit-audit-architecture` ‖ `-hotpath` ‖ `-config` ‖ `-reliability` ‖ `-observability` ‖ `-debt` ‖ `-dead-code` ‖ `-deps` ‖ `-security` ‖ `-tests` ‖ `-docs-drift` (parallel 11) | `audit-input.md` | 11 x `audit-{slug}.md` | Sibling-blind. Each auditor reads `.agents/docs.md` for project context (stack-aware report; stack-agnostic probes). Post-Step-3 assertion gate: for each slug verify file exists, non-empty, verdict header present. `LENS_VERDICT_WORST` = worst-of-11 (`FAIL > CONCERNS > PASS`); `MISSING`/`EMPTY` → `CONCERNS`-equivalent; `NO_VERDICT` → `FAIL`-equivalent → Failure Path. |
| 4 — Synthesise | `@bkit-audit-synthesise` | glob `audit-*.md` | `audit-v1-synthesis.md` | Parse standard markdown finding headings via regex `^## \[(\w+)\]\[(\w+)\] (.+) — (.+)$`; dedup on `(class, normalized_location)` with 5-line bucket; severity max-wins; cross-audit confidence upgrade one tier. `SYNTHESIS_VERDICT` = FAIL → Failure Path. |
| 5 — Organise | `@bkit-audit-organise` | `audit-v1-synthesis.md` | `audit-v2-ranked.md` + Linear sub-issues per workstream | Render severity x class matrix + ranked list + per-class appendix + workstreams. Post-step: orchestrator parses `## Workstreams` section and `save_issue` per `WS-{N}` with `parentId: {ISSUE_ID}` (existing match → `save_comment` sync). `ORGANISE_VERDICT` = FAIL (orphan correlation_id) → Failure Path. |
| 6 — Summary | `@bkit-audit-summary` | highest `audit-v*` + glob `audit-*.md` | `audit-summary.md` | Subagent emits 500-token summary. Orchestrator appends Step 6 section to master Linear comment with `audit-summary.md` content verbatim. Commit `chore({FID}): summary bkit [skip ci]` → push. `SUMMARY_VERDICT` = FAIL → Failure Path. |
| 7 — Close Workflow | — | — | `docs/audits/{FID}-audit.md` (copy of v2) | Copy v2 to `docs/audits/` → `cd $REPO_ROOT` → checkout `dev` → merge `feat/{FID}` → push `dev` → `git worktree remove` → delete local + remote `feat/{FID}` → `git worktree prune`. Set state `In Review`; NO phase label change (audit applies no label). |

**Hard stop in Step 7 caution block:** "Audit requires human review. Do NOT invoke `/bkit-plan` or `/bkit-build`. Findings are advisory; act on them via the spawned Linear sub-issues or open follow-up issues."

**Step 5 contract:** sub-issue body = workstream `## Findings` + `## Rationale`. Markers `**Parent audit:**`, `**Workstream:**` load-bearing. Re-audit: append `-audit-{YYYYMMDD-HHmm}` to FID; lock decoupled via timestamp; existing sub-issues matching `WS-{N}:` title → sync comment not body rewrite.

**Step 6 contract:** matches "ONE Linear comment per workflow run". Master comment grows Steps 1–7 (one section/step); Step 6 section = `audit-summary.md` verbatim. Sub-issues Step 5 = only Linear writes beyond master comment.

**No `Audit` phase label.** Identity via (a) title prefix `Audit run …`, (b) parent → sub-issue tree, (c) `docs/audits/{FID}-audit.md`. Additive labels (`Failed`, `Debug`) coexist.

### `/bkit-worktree-sync` — utility

Human-triggered. Pulls Claude worktree commits into IDE current branch. Always interactive — never auto-merges.

**Flow:**

1. **Verify context** — assert `{FID}` arg, current branch, `.worktrees/{FID}` exists.
2. **Save local changes** — uncommitted local work? prompt `[c]ommit` / `[s]tash` / `[x]abort`.
3. **Show diff summary** — `git log --oneline origin/dev..HEAD` from worktree, `git diff --stat`.
4. **Confirm** — prompt `[m]erge` / `[r]ebase` / `[x]abort`. Rebase warns about history rewrite.
5. **Merge or rebase** — `git merge $WORKTREE_PATH/{WORKTREE_BRANCH}` or `git rebase --onto {CURRENT} origin/dev .worktrees/{FID}/{WORKTREE_BRANCH}`. Conflicts → print list and stop.
6. **Done** — print next-step hint to run `/bkit-worktree-prune {FID}`.

### `/bkit-worktree-prune` — utility

Human-triggered. Removes Claude worktree (optionally feature branch). Always interactive.

**Two paths:**

- **`{FID}` provided** → Single Worktree Path: warn if `AHEAD` > 0 commits not in `origin/dev`; confirm removal; `git worktree remove --force` + `git worktree prune`; offer to delete local branch (`-d` safe; `-D` only on explicit force confirm).
- **No arg** → List All Path: enumerate `.worktrees/*` with branch / ahead / behind / last-commit; prompt user to enter `{FID}` or `all` or `x`.

### `/bkit-auto` — phase-routed dispatch

**Goal:** phase-routed cloud dispatcher. `{PHASE}` + `{ARG}` from args → matching phase skill. **`MODE` = CI** (`ship`/`debug`, `{ARG}` = PR): Steps 1–4 (guard + opt-in + dispatch); **`MODE` = BRIEF** (`design`/`plan`/`build`, `{ARG}` = issue): Step 1 → Step 4 — human `workflow_dispatch` = opt-in; dispatched skill owns brief + `status.jsonl` / worktree / FID. No worktree, no tracker state beyond single comment line.

<!-- prettier-ignore -->
| Step | Notes |
| --- | --- |
| 1 — Start Workflow | Classify `{PHASE}` → `MODE` (CI-status aliases `success`/`pass` → `ship`, `failure`/`fail` → `debug` let the Cursor dashboard paste `/bkit-auto $CI_STATUS $PR_NUMBER` literally; the GHA half passes `ship`/`debug` directly). `MODE` = CI: resolve `{FID}` from `gh pr view {ARG} --json headRefName` (`feat/{FID}` convention), `{ISSUE_ID}` from PR body / branch slug. `MODE` = BRIEF: `{ISSUE_ID}` = `{ARG}`. The dispatched skill owns FID / `status.jsonl` / worktree. Create fresh tracker comment header. **Stateless — no `status.jsonl`, no `dev` commit.** |
| 2 — Stale-Run Guard | **`MODE` = CI only.** Compare CI run `headSha` to PR `headRefOid`. Mismatch → `GUARD_VERDICT` = FAIL (newer commit in flight) → exit 0 with no-op comment line. |
| 3 — Opt-In Gate | **`MODE` = CI only.** Require tracker `Auto` label on issue. Absent → `AUTO_VERDICT` = FAIL → exit 0 with no-op comment line + kill-switch propagation. |
| 4 — Dispatch | Route `{PHASE}` → `/bkit-ship {FID}` / `/bkit-debug {FID}` / `/bkit-design {ISSUE_ID}` / `/bkit-plan {ISSUE_ID}` / `/bkit-build {ISSUE_ID}`. Invoke via `Skill` (Claude) / `Task` (Cursor); dispatched skill owns its session from there. The regression-gate-verification gate that catches Vercel-ignore / `decide`-step demotion lives in `/bkit-ship` Step 3 — Regression Guard (universal — also applies to manual `/bkit-ship` invocations that bypass the workflow). |

**CI-class skip conditions:** one tracker no-op line, exit 0. Only real failures (missing args, tracker unreachable, malformed state) → Failure Path. Loop bound: `/bkit-debug` enforces `MAX_DEBUG_ATTEMPT` = 3 internally; cloud never counts attempts.

## Worktree Model

All phase workflows run in `.worktrees/{FID}` (gitignored). One worktree per FID. IDE main checkout never touched.

**Step 2 — Worktree Setup** identical across 5 phases except branch fallback:

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

**`pnpm install --frozen-lockfile`** symlink-only (~5s, no network). Required — pnpm per-package `node_modules` symlinks not inherited from main checkout. Root symlink insufficient — packages need own.

**Manual cross-IDE handoff** (user-triggered):

1. `/bkit-design` + `/bkit-plan` complete → changes on `dev` (worktree pruned).
2. Human reviews `dev` → `/bkit-build` recreates worktree from `dev`.
3. `/bkit-build` pushes → CI runs.
4. CI failure → `/bkit-debug` reuses or creates `fix/{FID}` worktree.

`/bkit-worktree-sync` + `/bkit-worktree-prune` = ad-hoc manual sync; not invoked by phase commands.

## Tracker Integration

Pluggable via `bkit install --tracker=<github|linear|none>`. Per-tracker MCP endpoints, tool names, call shapes inline at each site as `github`/`linear`/`none` blocks; installer keeps chosen, drops others when mirroring `.claude/commands/` + `.cursor/commands/` (§ Tracker Blocks). `.bkit/trackers.md` = marker contract + cross-cutting conventions only.

### Phase labels (mutually exclusive)

Phase labels carry `bkit:` namespace — no consumer clash. Mutual exclusion in workflow code: drop prior phase label from `{LABELS}` before adding new.

<!-- prettier-ignore -->
| Label | Meaning |
| --- | --- |
| `bkit:design` | `/bkit-design` running |
| `bkit:plan` | `/bkit-plan` running |
| `bkit:build` | `/bkit-build` running |
| `bkit:ship` | `/bkit-ship` running |
| `bkit:merged` | `/bkit-ship` completed; PR merged to `dev`; issue left **In Review** (open) — a human reviews post-merge and closes manually (bkit never auto-closes) |

Phase label preserved through Close — tracker state (Linear "In Review", GitHub `open`) carries completion signal; label tells reviewers which workflow finished. Ship exception: Close swaps `bkit:ship` → `bkit:merged`.

### Additive labels (do not drop phase)

<!-- prettier-ignore -->
| Label | Added by | When |
| --- | --- | --- |
| `bkit:auto` | Human (via tracker UI) at issue creation; written by issue-id-extraction snippet's create-issue fallback | Opt-in gate for `/bkit-auto` CI-mode (ship/debug) dispatch. Removed by any workflow that finds `bkit:auto` absent on the linked issue (kill-switch propagation). |
| `bkit:failed` | Failure Path of any workflow | Workflow hit its Failure Path; human triage required. Phase label persists alongside, so reviewers see which workflow failed. Cleared when `/bkit-debug` Step 1 starts (debug entry supersedes the prior failure marker) and when `/bkit-ship` Step 13 adds `bkit:merged` (terminal success). |
| `bkit:debug` | `/bkit-debug` Step 1 | `/bkit-debug` is running on top of a prior phase (typically `bkit:build` or `bkit:ship`). Prior phase label persists alongside, so reviewers see which workflow is being debugged. |

### Tracker-specific state

Issue state semantics (Linear "In Progress" / "In Review" / "Done"; GitHub `open`/`closed` + Projects v2) inline as per-tracker blocks:

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

NEW comment per workflow step via tracker MCP. Step 1 = first comment; later steps = own. NEVER edit, paraphrase, or carry forward comment IDs. § Comment Lifecycle for templates.

### Issue blockers (`/bkit-build` Step 1)

`/bkit-build` Step 1: tracker `issue-read` → parse blocker relations (Linear: `relations.blocked_by` via `get_issue({ includeRelations: true })`; GitHub: body scan `Blocked by #N`). Blocker not closed/done → Failure Path `Blocked by {BLOCKER_ID} (state: {BLOCKER_STATE})`. Design Step 9 `Requires` edges via `set-blocked-by` → enforces workstream ordering.

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

**Docs-only commits:** workflows append `bkit [skip ci]` (CI suppression). Former `bkit [skip build]` removed (#291) — docs-only not app-affected; host affected-detection cancels build without it. Hosts cancelling ONLY on `[skip build]` will build docs-only workflow commits — switch to affected-detection.

<!-- prettier-ignore -->
| Workflow commit | Tags |
| --- | --- |
| `chore: pre-worktree uncommitted changes` (ship Step 2) | `bkit [skip ci]` |
| `chore({FID}): pre-worktree uncommitted changes` (design / plan / build Step 2) | none — feature-branch intermediate (#291 removed the prior `bkit [skip build]`) |
| `chore({FID}): {step-slug}` for per-step in-worktree commits (e.g. `worktree-setup`, `branch-sync`, `install-skills`, `plan-execute sub-plan N`, `plan-verify sub-plan N attempt M`, `failure-diagnose attempt N`, `build-challenge attempt N`, `build-challenge-reconcile attempt N`, `build-challenge-remediate attempt N`, `build-challenge-tests`, `summary`, `create-pr`, ship `merge-pr attempt N`, ship `prune-skills`, ship `update-docs-summary`) | none — in-worktree, never visible to CI on `dev` |
| `chore({FID}): summary bkit [skip ci]` (design Step 8 summary, plan Step 11 summary) | `bkit [skip ci]` |
| `fix({FID}): {description}` (debug Step 5 failure-remediate) | none — Step 7 pushes this commit directly so `fix(...)` becomes the CI-triggering HEAD (dodges `^chore:`-prefix Vercel-ignore rules and partial-tier `decide`-step demotion). `{description}` derived from first `DONE — Step` line in `debug-failure-remediate-{NORMAL_ATTEMPT}-log.md`. Debug Step 7 adds NO intermediate `chore(...)` commit before push. |
| `docs({FID}): ship DONE` (ship Step 13 close-workflow on `dev`) | `bkit [skip ci]` |
| `docs({FID}): {phase} aborted` (Failure Path handover) | `bkit [skip ci]` |
| `chore({FID}): close-workflow` (build Step 17 — opted-in: `bkit [auto route]` suffix when issue carried `bkit:auto` at close time) | none on base commit; opted-in adds `bkit [auto route]` (loud, not a suppressor) — final HEAD on push, fires `pull_request` synchronize + CI auto-route gate |
| `chore({FID}): close-workflow` (debug Step 12 PR-mode — opted-in) | none / `bkit [auto route]` (PR-mode, conditional) — same as build |
| `chore({FID}): create-pr` (debug Step 12 local-mode — opted-in) | none / `bkit [auto route]` (local-mode, conditional) — CI-triggering HEAD in local-mode |
| `chore({FID}): conflict-resolve` (ship Step 4) / `chore({FID}): sync dev` (ship Step 6 dev-sync merge) — opted-in | none / `bkit [auto route]` (conditional on `bkit:auto`, from Step-1 `LABELS`) — re-carries the marker onto the feat-branch HEAD so a bkit-driven conflict / dev-sync merge does not bury it (the ad-hoc `merge origin/dev` that buried it in a consumer is the human analogue) |

**CI trigger mechanic (build / debug / ship aligned):** last push to CI-validated ref must leave HEAD without `bkit [skip ci]` — else `pull_request` (build/debug) or `push` (ship) suppressed, `statusCheckRollup` empty → Ship Step 2 fail-fast admits vacuously green PR. Trigger in close-workflow (build/debug); ship via squash merge subject. CI-Dispatch Gate below enforces — § CI-Dispatch Gate.

### CI-Dispatch Gate (shared, single source)

Outcome-verification gate: after final loud push, confirms bkit CI check dispatched for exact pushed HEAD; bounded poll → self-heal once with clean `re-trigger` commit → named verdict. Pre-push HEAD-subject = fast-fail; post-push poll = outcome verification. Fires **post-final-push only** — zero mid-build CI triggers; D2 invariant (KN-30 / §141) preserved.

**Invoked by orchestrators** (NOT git hook — invariant contextual; bkit intentionally pushes `[skip ci]` HEADs intermediately):

- **Build Gate 17:** close-workflow final push. HEAD-subject pre-push + post-push poll.
- **Build Step 17 + Debug Step 10 create-pr:** PR creation — HEAD = `[skip ci]` create-pr by D2; HEAD clause does NOT run; PR title only. No poll (build: create-pr not CI trigger; debug LOCAL: create-pr IS — see below).
- **Debug Gate 10 PR-mode:** close-workflow push = CI trigger (sub-step 3). Poll in close-workflow block.
- **Debug Gate 10 LOCAL-mode:** create-pr push (sub-step 9) = CI trigger. Poll in create-pr block. `AUTO_ROUTE_SUFFIX` from in-block var before `rm`; `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` (do NOT reorder `rm` or re-read removed file).
- **Ship:** OUT of scope. Existing `SQUASH_SHA`-poll Step 13 (`gh run list --branch dev --commit "$SQUASH_SHA"`). CI-Dispatch at ship would mask "essential tests skipped" signal ship backstops.
- **Ship Gate 5 + squash `--body ""`:** merge — squash subject = dev HEAD.

**Gate outcomes (4-state terminal verdict):**

- `dispatched` — bkit CI check on pushed HEAD within poll budget. Proceed.
- `self-healed` — poll exhausted, HEAD clean; one empty `re-trigger` commit (`AUTO_ROUTE_SUFFIX`) + re-poll; run appeared. Proceed.
- `no-ci` — poll exhausted, HEAD clean, re-trigger also dispatched nothing — no consumer CI workflow. Logged pass; NOT Failure Path.
- `unresolved` — sub-reason below → **Failure Path** after verdict recorded.

**Sub-reason codes (→ `unresolved`):**

- `timeout-dirty` — poll exhausted AND HEAD carries CI suppressor; refuse re-trigger dirty HEAD.
- `retrigger-suppressed` — re-trigger HEAD carries suppressor; cannot discriminate `no-ci` vs suppression → `unresolved`, NOT `no-ci`.
- `autoroute-mismatch` — `RETRIGGER_SUFFIX` != `AUTO_ROUTE_SUFFIX` (assert-equal before re-trigger).
- `gh-error` — every poll iteration errored.

**Named symbols (both gate sites — identical):**

- `POLL_BUDGET_S=60`, `POLL_INTERVAL_S=10` (`ATTEMPTS=6`).
- Log prefix `[bkit-ci-gate]`.
- Self-heal cap = 1.
- Dispatch probe: case-insensitive `test("bkit-tests|decide"; "i")` on `statusCheckRollup` — **`bkit-tests` namespace**, not single lane. ANY `bkit-tests-*` answers "did CI dispatch"; `decide` for pre-rename consumers. Do NOT narrow to one lane (`test("decide")` failed when planner renamed `bkit-decide` → `bkit-tests-scope`). Do NOT widen to "any check" — Vercel/Renovate/cloud would false `dispatched`. Build/debug: PR `statusCheckRollup`; ship: `gh run list` workflow-run shape — cannot share jq filter.

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

`reason` omitted when `dispatched`/`self-healed`/`no-ci`. FOLD reducer `del(.type,.workflow)` then merges — extra keys pass through (additive, backward-compatible).

**`ciDispatch` step-done LOCAL-only (intentional non-push):** `jq ... >> "$STATUS"` appends locally only — NOT committed/pushed afterward. Post-gate commit changes PR HEAD: `[skip ci]` verdict empties rollup (KN-11); clean commit fires second CI run. Do NOT "fix" with post-gate commit+push.

**Per-site AUTO_ROUTE sourcing:**

- **Build Step 17:** `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` from in-block `LABELS` derivation. Assert-equal trivially satisfied; line stays for symmetry.
- **Debug LOCAL Step 10 sub-step 9:** in-block `AUTO_ROUTE_SUFFIX` from `BKIT_AUTO_ROUTE_FILE` (read+`rm` before create-pr; var stays in scope for gate after push). Do NOT reorder `rm` or re-read file.
- **Debug PR Step 10 sub-step 3:** `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` from `LABELS` at sub-step 3 entry.

**Re-trigger commit:** `chore({FID}): re-trigger${RETRIGGER_SUFFIX}` — opted-in issues carry `bkit [auto route]`. § `bkit [auto route]` Marker Propagation applies.

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

- **Deny-list tokens (HEAD message + PR title):** `[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]`, `[actions skip]` — GitHub-native CI suppressors. `[skip build]` **not** checked (#291): host build-cancel convention, not platform-native — no place in stack-agnostic gate.
- **Legitimate loud tokens (deny-list, auto-pass):** `bkit [auto route]`, `bkit [verbose ci]`, `bkit [force build]`.
- **Hard-fail loud:** name offending subject/title + fix → Failure Path. No silent auto-fix.
- **Escape hatch:** `bkit [force build]` on HEAD forces full CI + host build; not a suppressor.

Rationale: invariant **contextual** — bkit pushes `[skip ci]` intermediately (D2: `worktree-setup`/`create-pr`) and to `dev` (status bookkeeping). Blanket pre-push hook would block legitimate pushes. Only orchestrator knows which push is final loud one.

<!-- prettier-ignore -->
| Workflow | Step | Mechanic | Why this form |
| --- | --- | --- | --- |
| `/bkit-build` | 18 (close-workflow) | Final commit `chore({FID}): close-workflow`, no skip tags + `git push` + CI-Dispatch poll | Drops `bkit [skip ci]` from the existing status commit; final commit before push fires PR `pull_request` synchronize; gate confirms dispatch |
| `/bkit-debug` | 10 (close-workflow) PR-mode | Final commit `chore({FID}): close-workflow`, no skip tags + `git push` + CI-Dispatch poll | PR-mode: close-workflow push IS the CI-triggering push; gate appended in sub-step 3 |
| `/bkit-debug` | 10 (close-workflow) LOCAL-mode | Separate create-pr push in sub-step 9 + CI-Dispatch poll | LOCAL-mode: create-pr push IS the CI-triggering push; gate appended in sub-step 9 |
| `/bkit-ship` | 4 (merge-pr) | `gh pr merge --squash --body ""` — squash subject becomes dev HEAD, body empty | `gh pr merge` is the only API; empty body strips PR-body `bkit [skip ci]` from the squash subject. Followed by pre-existing `gh run list --branch dev --commit "$SQUASH_SHA"` gate (not a CI-Dispatch Gate) |
| `/bkit-ship` | 10 / 11 / 13 (post-merge dev pushes) | Step 10 `docs({FID}): update-docs-summary`, Step 11 `chore({FID}): prune-skills`, Step 13 `docs({FID}): ship DONE bkit [skip ci]` | Post-merge docs-only; PR already merged, dev's CI fired by Step 6, no re-trigger needed. Per-step commits batched locally; single push to `dev` at Step 13 close-workflow. |

All intermediate workflow commits retain `bkit [skip ci]` — only trailing `close-workflow` unmarked, LAST before final `git push`. Fixes prior latent bug where build Step 17 / debug Step 12 commits were never explicitly pushed.

## Permissions (`.claude/settings.json`)

Without `acceptEdits` / wildcard allow surface, every `Bash`, `Edit`, `Write`, MCP, or skill call prompts mid-workflow — breaks end-to-end runs.

<!-- prettier-ignore -->
| Bucket | Patterns | Purpose |
| --- | --- | --- |
| `allow` | `Bash(*)`, `Edit(*)`, `Write(*)`, `Skill(*)`, `mcp__linear__*`, `mcp__claude_ai_Linear__*`, `WebFetch(domain:github.com | api.github.com | linear.app | docs.anthropic.com | docs.claude.com)` | Blanket-allow shell, file ops, skills, Linear MCP, scoped web fetch. `deny` and `ask` lists evaluated first. |
| `ask` | `sudo:*`, `curl:*`, `wget:*`, `brew install:*`, `pnpm publish:*`, `npm publish:*`, `git push --force(:* / -f)`, `git reset --hard:*`, `git clean -fd(x):*`, `git filter-branch:*`, `gh repo delete:*`, `gh pr close:*`, `gh release delete:*`, `vercel rm/remove:*`, `supabase db reset / projects delete:*` | Per-call human confirmation for destructive ops. |
| `deny` | `Bash(rm -rf /\* | ~/\* | $HOME/_)`, `Bash(chmod -R 777 /:_)`, `Read(./.env | ./.env.\* | ./apps/_/.env_ | ./packages/_/.env_ | ./**/secrets/** | ./\*_/_.pem | ./\*_/_.p12 | ./\*\*/id_rsa)` | Hard-block catastrophic deletes and secret reads. |

`.mcp.json` declares `mcpServers.linear.url = https://mcp.linear.app/mcp` and `mcpServers.github.url = https://api.githubcopilot.com/mcp/`. SessionStart hook `bash .claude/hooks/preflight.sh` runs at every session start.

**Anti-pattern:** never `--dangerously-skip-permissions` on host. Sandbox CI containers only.

## Workflow Primitives — quick reference

Inline definitions for workflow-file tokens. Keep synced with workflow bodies.

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

No quote / filter / glob edits. Pre-PR = lint+typecheck+unit; debug normal-mode adds `test:integration test:e2e`. Build does NOT run live tier (post-merge `bkit-tests-live` canary). Debug appends `test:integration:live test:e2e:live test:live` LAST when declared (unless `[live=off]` — debug session flag from `debug-input-{DEBUG_ATTEMPT}.md`) — never in bare `pnpm test`. No live tier → CONCERNS + `testsLiveSkipped`.

### Tracker issue-create return guard

When tracker call creates issue, MUST return non-empty `id`. Empty/null → Failure Path `Tracker issue create returned no id`.

### Pre-worktree carry-over commit (Steps 2 of design / plan / build / ship)

```bash
if [ -n "$(git status --porcelain | grep -v '^??')" ]; then
  git status --short
  git add docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl .bkit/stats.jsonl
  git diff --cached --quiet -- docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl .bkit/stats.jsonl \
    || git commit -m "chore({FID}): pre-worktree uncommitted changes" -- docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl .bkit/stats.jsonl
fi
```

Carries workflow log + friction rows into new worktree branch. `/bkit-ship` appends ` bkit [skip ci]`; `/bkit-debug` Step 2 omits primitive — branches `origin/dev` for hotfix isolation.

Allow-list, never deny-list (#61): deny-list on main checkout = `git add -A` by another name. Pathspec on all three commands — bare `git commit` commits whole index, sweeping user-staged work (reported destructive backout → `git revert`). Pathspec on `git commit` bypasses index for everything else; `git diff --cached` guard same pathspec. Close on main (`design`/`plan`/`ship`) and `/bkit-ship` Step 6 pre-merge use the same pathspec: `docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl .bkit/stats.jsonl`.

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

Verify→remediate and diagnose→fix loops carry context via **per-attempt log files**, not plan mutation. Plan docs = pure deliverables.

<!-- prettier-ignore -->
| Verifier / checker | Remediator | Max attempts | Escalation |
| --- | --- | --- | --- |
| `@bkit-build-plan-verify` | `@bkit-build-plan-gaps-remediate` | `MAX_VERIFY_ATTEMPT` = 3 | Failure Path |
| `@bkit-build-challenge-1` + `@bkit-build-challenge-2` (parallel pair) → `@bkit-build-challenge-reconcile` | `@bkit-build-challenge-remediate` | `CHALLENGE_REMEDIATE_ATTEMPT` < 1 (init 0, increments to 1 in Step 11; one remediation max; `FAIL` triggers re-Challenge for verification, `CONCERNS` falls through without re-Challenge) | Failure Path on `FAIL` after remediate (covers both unrecoverable remediation and architectural-class findings) |
| Build test loop (`pnpm turbo`) | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `MAX_TEST_ATTEMPT` = 3 | Failure Path |
| Debug test loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` (NORMAL); `@bkit-debug-failure-soak` (SOAK) | `MAX_NORMAL_ATTEMPT` = 3 (NORMAL loop); `SOAK_ATTEMPT` bounded by `MAX_SOAK_ATTEMPT` = 3 (reset on each SOAK entry) | Failure Path with `@bkit-debug-abort-handover` |
| Ship merge loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `MAX_MERGE_ATTEMPT` = 3 | Failure Path with `@bkit-debug-abort-handover` |

**Filename convention:** `docs/plans/{YYYYMM}/logs/{FID}/{phase}-{step}-N-{ATTEMPT}.md` (e.g. `build-verify-plan-1-2.md` = sub-plan 1, verify attempt 2). Verifiers MUST read prior verify+remediate logs before `PASS`/`FAIL`. Remediators MUST glob own prior logs; no repeat strategies.

## Structured Docs Writer Map

Pipeline writes structured ledgers at `docs/` root. Each has strict sole-writer policy.

<!-- prettier-ignore -->
| Doc | Dedup id | Sole writer(s) | Source step |
| --- | --- | --- | --- |
| `docs/knowledge.jsonl` | `key` | `@bkit-build-plan-gaps-remediate`, `@bkit-build-challenge-remediate`, `@bkit-debug-failure-remediate` | After verified fix |
| `docs/decisions.jsonl` | `key` | `@bkit-debug-failure-remediate` (forced arch) | At decision time — the design phase reads ADRs but no longer authors them |
| `docs/completed.md` | — | `@bkit-ship-update-docs` only | `/bkit-ship` Step 10 |
| `docs/deferrals.jsonl` | `key` | `@bkit-design-generate` (out-of-scope features), `@bkit-plan-generate` (out-of-scope ideas), `@bkit-plan-update` (scope expansions from `/bkit-plan` Step 8), `@bkit-debug-abort-handover` (handover context) | `/bkit-design` Step 4, `/bkit-plan` Steps 3 & 8, Failure Path handover |

All other agents document blockers/out-of-scope in own log file (Plan Execution / Challenge Remediation / etc — each subagent H1 for canonical output name) — workflow reads at step boundaries, decides tracker mirror.

Append-only. Row format: `.bkit/jsonl.md`. Doc index + read-by-phase matrix: `.agents/docs.md`.

## Telemetry Ledgers

bkit emits JSONL telemetry to six append-only ledgers. Row format (envelope, per-kind fields, dedup tuples, write idiom): `.bkit/jsonl.md`.

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

- **Never-drop:** NEVER silently drop deferred work → append `kind:"deferral"` to `docs/deferrals.jsonl`.
- **Found-bug:** NEVER silently drop discovered bug → append `kind:"failure"` to `docs/failures.jsonl` immediately.
- **Path idiom (all JSONL ledgers):** resolve once per bash block:
  - `REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")` — main checkout (locks, `.bkit/version`, remotes).
  - `WT=$(git rev-parse --show-toplevel)` — current write tree (worktree while on `feat/{FID}`; main after `cd "$REPO_ROOT"` / switch-to-dev). When the block only uses `git -C "$REPO_ROOT"`, set `WT="$REPO_ROOT"` (same tree).
  - `STATUS="$WT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"`
  - `STATS="$WT/.bkit/stats.jsonl"` · `FRICTION="$WT/.bkit/friction.jsonl"`
  - `docs/{deferrals,failures,knowledge,decisions}.jsonl` → `"$WT/docs/…"`. NEVER mix `$REPO_ROOT` and `show-toplevel` for the same ledger in one block.
- **Friction/stats:** append to `$FRICTION` / `$STATS` at close; stage into the close commit that pushes (never leave dirty after push).
- **Close commit pathspec (design/plan/ship on main):** `docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl .bkit/stats.jsonl` on add+commit (allow-list). Build/debug (worktree sandbox): `git add -A` after writes — includes the same relative paths under `$WT`.
- **Best-effort:** every append exits 0 (`jq … >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"`) — telemetry NEVER gates workflow.
- **Tracker comment:** summary-only (`pnpm bkit telemetry summary --phase={phase}`) — NEVER re-append via `bkit-workflow-telemetry.sh` after push.
- **Summary read:** close writes run row, grades compliance, posts per-workflow telemetry report (this run vs `med·5` — median of prior 5 same-workflow runs) in tracker comment; `> 5000` rows in `stats.jsonl` → `[bkit-telemetry] WARNING: MAX_ROWS_BEFORE_ROLLUP (5000) exceeded`.
- **STRAY allow-list (design/plan squash):** `^docs/plans/|^docs/(deferrals|decisions|failures)\.jsonl$|^\.bkit/(friction|stats)\.jsonl$`.
- **Pre-worktree allow-list:** `docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl .bkit/stats.jsonl` (same ledger pair as close pathspec).

## Authoring Checklist for New / Refined Workflows

When writing/editing `.bkit/workflows/bkit-*.md` (canonical — `bkit install` regenerates `.claude/commands/` + `.cursor/commands/`):

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
- [ ] Counters **derived** per fenced block from `status.jsonl` (§ Attempt counters); no prose `Init`/`Increment`; `MAX_*` from config by name; loops → Failure Path; logs `-{N}`.
- [ ] Timeout guard captures `STEP_START` before each subagent / `pnpm turbo`; exceeded → Failure Path.
- [ ] Final step (Close Workflow) marks `status:done`, releases `.lock`, sets state `In Review` (ship: state `Done`, swaps label `Ship` → `Merged`); non-ship phases update state only, phase label unchanged.
- [ ] Docs-only commits include `bkit [skip ci]` (§ CI / Vercel commit tags).
- [ ] Branch eligibility check on phases that don't create their own branch (`/bkit-debug`, `/bkit-ship`).
- [ ] Token efficient — tables > prose, `→` not `then`, no sub-bullets when a table works.
- [ ] If new agent is introduced, add it to `.bkit/prompts.md` with frontmatter rationale and `maxTurns` calibration.
- [ ] If new destructive shell command is introduced, route it through `ask` or `deny` in `.claude/settings.json`.
