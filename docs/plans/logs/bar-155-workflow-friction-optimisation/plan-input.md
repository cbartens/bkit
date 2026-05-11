# Plan Input — BAR-155

## Session Prompt

bkit-plan BAR-155

## Linear Issue: BAR-155 — bkit workflow friction optimisation

### Description

## Goal

Document recurring failure modes observed across bkit subagent invocations and the `bkit-ship` rebase step during the **2026-05-06 → 2026-05-08** window, and the prompt/structure changes most likely to remove them. Surfaced from friction log entries collected into `.agents/friction.md` from `cbartens/bkit`, `gether-life/app-gether-life`, and `fcte-com-au/visitfrasercoast-com` (collection commit 2026-05-08).

This is a **follow-up to** BAR-137 — BAR-137's verdict-artifact-stub-first fix shipped for `bkit-build-plan-execute`, but the same shape recurs on other subagents (`bkit-plan-generate`, `bkit-build-challenge`) and at higher load points (31-task sub-plans, 32KB plan inputs, 50-commit feat branches).

## ⚠️ Authoring rules — READ FIRST

This is a bkit-repo-internal change. Before touching any file, read `.agents/rules.md` § **bkit Repo Authoring** in full and adhere to it strictly. Summary (full text wins on conflict):

- **Canonical sources only** — ONLY edit `.agents/*`. NEVER edit `.claude/*`, `.cursor/*`.
- **Install to mirror** — After editing `.agents/*` run `bkit install` to regenerate `.claude/` and `.cursor/` mirrors. Batch at end of session, not after every edit.
- **Template sync** — Edits inside `.agents/rules.md` `bkit:start/end` block must be mirrored to `.agents/templates/.agents/rules.md` and vice versa.
- **Workflow edits** — Any `.agents/workflows/*.md` edits → ALWAYS follow `.agents/workflows.md` § Workflow Authoring Rules.
- **Prompt/agent edits** — Any `.agents/agents/*.md` or `.agents/prompts/*.md` edits → ALWAYS follow `.agents/prompts.md` § Prompt Authoring Rules.
- **Keep documentation updated** — When editing `.agents/workflows/*.md` → update `.agents/workflows.md`. When editing `.agents/agents/*.md` or `.agents/prompts/*.md` → update the relevant index. Index drift = regression.

## Observed failures

### plan-execute budget exhaustion at higher load (post-BAR-137)

| FID                                      | Repo                 | Sub-plan size                 | Wall time            | Final state                                                    |
| ---------------------------------------- | -------------------- | ----------------------------- | -------------------- | -------------------------------------------------------------- |
| `bar-141-preflight-checklist`            | bkit                 | (single plan)                 | ~20 min (1188887 ms) | log file: `Verdict: PENDING` only, 6 lines                     |
| `bar-102-digital-agent-mvp` (sub-plan 1) | visitfrasercoast-com | 31 tasks (bootstrap monorepo) | 3× cutoffs           | cut at Task 1.14, 1.19, 1.21; required 3 manual re-invocations |

### plan-generate stream-timeout on multi-issue input

`bkit-plan-generate` ran ~8 min / 43 tool uses on a 32KB `plan-input.md` covering BAR-131 / BAR-139 / BAR-142 and hit `API Error: Stream idle timeout - partial response received`. **No output file was produced.**

### challenge subagent budget exhaustion on large diffs

`bkit-build-challenge` ran 59 tool calls / 108K tokens / 226s on the BAR-93 re-run (`gether-life/app-gether-life`) and returned with `build-challenge.md` ending at `Verdict: PENDING`. Single-reviewer security challenge has same-model blind spots; pattern inconsistent with `bkit-design-review-1/-2` and `bkit-plan-review-1/-2` parallel pairs.

### ship-rebase pain on long-running branches

`git rebase origin/dev` on a 50-commit feature branch (`bar-131-related-bars-suite`) produced 5 sequential conflict commits across `docs/knowledge.md` (twice — KN-9/KN-10 → KN-12/KN-13 renumber needed), `docs/deployments.md`, `.agents/rules.md`, `.husky/pre-push`. Root cause: branch drift accumulated across many parallel commits to `dev` between rebases. Today there is no signal during build that the branch is drifting, and rebase failures at ship-time exit with bare `exit 1` rather than routing through Failure Path (so the existing `bkit-debug-abort-handover` agent never produces a handover artifact for rebase aborts).

## Suggested fixes

### Fix 1 — Stub-first verdict pattern propagation (two flavours)

**1a. Structured (already exists, no change).**

Verbatim phrasing in place at `.agents/agents/bkit-build-plan-execute.md:44, 60`, `bkit-build-plan-gaps-remediate.md:43, 66`, `bkit-build-challenge-remediate.md:43, 62`:

> "Update **Create** output after each task — append `DONE` / `BLOCKED` log entry at EOF via Bash `echo {log entry} >> {output}` as work progresses."

**1b. Freeform (new — for review/audit agents currently using** `Edit` only).

Add to `bkit-build-challenge-1`, `bkit-build-challenge-2` (new — see Fix 4), `bkit-build-plan-verify`, `bkit-build-challenge-tests`, and any other freeform review/audit agent. Match the existing `echo >>` mechanism exactly:

> "Update **Create** output after each finding — append finding entry at EOF via Bash `echo {finding} >> {output}` as work progresses (heredoc form for multi-line findings). Update `Verdict:` line via `Edit` immediately upon recording any BLOCK-severity finding — do not defer to a final pass."

Three components: skeleton up front, incremental flush via `echo >>`, eager verdict update via `Edit`.

Audit + spot-fix coverage: `bkit-build-plan-verify`, `bkit-build-challenge-1/-2`, `bkit-build-challenge-tests`, summary agents, `bkit-utility-audit-*`.

### Fix 2 — Hard task-count cap in `bkit-plan` workflow

Add deterministic task-count gate alongside the existing token cap. **No LLM judgment** — the parent `bkit-plan` workflow greps `^### Task ` (or equivalent task marker) and short-circuits to **Failure Path**.

| Gate                                                             | Action                                                    |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| Token estimate >100K (existing, in `bkit-plan-complexity-check`) | Mandatory split                                           |
| Task count >15                                                   | Mandatory split (Failure Path with split-required reason) |

**Rationale for 15 (not 20):** every observed clean single-shot pass ≤18 tasks; every cutoff or cross-session "rescue" ≥20 tasks. BAR-132 bootstrap (20 tasks → 28-31 with sub-tasks) → 3× cutoffs at T1.14, T1.19, T1.21. BAR-119 sub-plan-1 (29 tasks) "passed" only via cross-session continuation. `.agents/friction.md:88-89` already recommends ≤15 at plan-generate time. **20 is the failure boundary; 15 is the safe boundary.**

### Fix 3 — Refuse multi-issue plan-inputs via Failure Path

`bkit-plan` Step 1 (after reading `plan-input.md`) counts `BAR-N` references. If count >1 → invoke standard `## 🤖 Failure Path` block with reason `"Multi-issue plan-input not supported. Split into one plan-input per Linear issue."`.

Mirrors the existing pattern from `bkit-design.md` Step 3:

> "Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**."

No marker, no opt-in flag, no interactive prompt. Hard refuse via the standard Failure Path block (already defined at the top of every workflow file). Single-issue plans are the norm; multi-issue is unsupported.

### Fix 4 — Parallel `bkit-build-challenge` pair + reconcile (always-on)

Replace single-reviewer challenge with the **same convention used by** `bkit-design-brainstorm-ideate-1/-2`, `bkit-design-review-1/-2`, `bkit-plan-review-1/-2`, `bkit-plan-scope-check-1/-2`.

**4a. Agent files (split existing** `bkit-build-challenge.md`):

| File                        | Frontmatter                                  | Body                                                                                     |
| --------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `bkit-build-challenge-1.md` | `model: claude-opus-4-7`, `effort: high`     | Identical to current `bkit-build-challenge.md` body + Fix 1b freeform stub-first wording |
| `bkit-build-challenge-2.md` | `model: claude-sonnet-4-6`, `effort: medium` | Identical body                                                                           |

Matches the established `-1` = Opus/high, `-2` = Sonnet/medium pattern verbatim. Bodies are identical except for frontmatter (mirrors `bkit-design-review-1/-2`).

**4b. Workflow invocation (in** `bkit-build.md`):

Use the verbatim template from `bkit-design.md` Step 5 (Design Review):

```markdown
## 🧠 Step {N} — Build Challenge

1. Launch both subagents in parallel using `Agent` tool:
   - **Subagent:** Invoke `@bkit-build-challenge-1`
     Context: You are a subagent in the Build phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: {diff/build artifacts as defined in current bkit-build challenge step}
     Create: `docs/plans/logs/{FID}/build-challenge-1.md`
   - **Subagent:** Invoke `@bkit-build-challenge-2`
     Context: You are a subagent in the Build phase running in parallel with another agent. Switch into working directory `cd "$(git rev-parse --show-toplevel)/.worktrees/{FID}"` → verify with `pwd` → use for all subsequent file operations.
     Read: {same as -1}
     Create: `docs/plans/logs/{FID}/build-challenge-2.md`
2. Wait for all subagents to complete. Assert subagent Update/Create files exist and are non-empty. **If** any file empty → **Failure Path**.
```

**4c. Reconcile agent — new** `bkit-build-challenge-reconcile.md`:

Mirrors `bkit-design-update.md` / `bkit-plan-update.md` shape (merges multiple inputs into one canonical artifact).

- Inputs (read via explicit workflow `Read:` directive): `docs/plans/logs/{FID}/build-challenge-1.md`, `docs/plans/logs/{FID}/build-challenge-2.md`
- Output: `docs/plans/logs/{FID}/build-challenge.md` — drop-in compatible with existing `bkit-build-challenge-remediate` flow (no remediate-side change)
- **Severity tie-break:** max-wins (BLOCK > WARN > PASS). If R1=PASS and R2=BLOCK → unified=BLOCK. Reconciler may downgrade only with explicit `## Justification` block citing both reviewers' evidence.
- **Dedup heuristic:** same `file:line` reference OR same root-cause keyword cluster → merge into one finding, cite both reviewers; otherwise keep separate, attribute each.
- Frontmatter: follow the convention used by `bkit-design-update.md` (single agent, no -1/-2 split needed).

**4d. Workflow step for reconcile:**

```markdown
## 🧠 Step {N+1} — Reconcile Build Challenge

1. Invoke `@bkit-build-challenge-reconcile`
   Read: `docs/plans/logs/{FID}/build-challenge-1.md`, `docs/plans/logs/{FID}/build-challenge-2.md`
   Create: `docs/plans/logs/{FID}/build-challenge.md`
2. Assert output file exists and is non-empty. **If** empty → **Failure Path**.
```

### Fix 5 — Route ship-rebase abort through Failure Path

Today `bkit-ship.md` Step 2 uses:

```bash
git rebase origin/dev || { echo "Rebase conflict — resolve manually"; exit 1; }
```

— the bare `exit 1` bypasses the workflow's `## 🤖 Failure Path` block, so the existing `bkit-debug-abort-handover` agent (already wired into ship's Failure Path Step 5) never fires for rebase aborts. No handover artifact gets written.

**Fix:** replace the bare `exit 1` with the standard Failure Path routing pattern used elsewhere in the workflow. Existing handover machinery does the rest — produces `ship-handover.md` with the standard structured sections (Short Version, Attempt History, Verified Resolutions, Persistent Errors, Recommended Next Steps, Reference Docs).

One-line change. No new agent, no new artifact format, no shell-mechanism risk. Existing bkit infrastructure already covers what was previously over-engineered as a custom `ship-rebase-conflict-{N}.md`.

### Fix 6 — Long-branch advisory in `bkit-build` (always-on)

Always emit a one-line status at the start of `bkit-build` Step 1 (workflow entry):

```bash
behind=$(git rev-list --count HEAD..origin/dev)
age=$(git show -s --format=%ar $(git merge-base HEAD origin/dev))
echo "[bkit-build] feature branch is ${behind} commits behind dev / ${age} since divergence"
```

Output example:

```
[bkit-build] feature branch is 23 commits behind dev / 4 days since divergence
```

**Always-on, no thresholds.** Threshold-gated advisories get ignored when they don't trigger ("only 19 commits, must be fine"). Always-on means the number is always visible and the human/agent forms a habit of acting on it.

**Why this matters:**

1. Today there is no signal during build that the branch is drifting from `dev`. The first signal is rebase pain at ship-time, by which point conflicts have accumulated.
2. With the advisory always visible at build entry, the builder can choose rebase-now (cheap, small conflicts) vs rebase-at-ship (expensive, accumulated conflicts).
3. Concrete BAR-131 counterfactual: the last build session before ship started with the branch ~23 commits behind dev. With this advisory, a mid-build rebase (likely 2 small conflicts) replaces a ship-time 50-commit rebase (5 large conflicts).
4. Trivial cost — two git calls, one log line. No mechanism risk, no edge cases. Confirmed no equivalent reporting exists today.

**Net effect:** addresses the upstream cause of most ship-rebase pain. Combined with Fix 5 (route abort through handover), Fix 6 substantially reduces the BAR-131-shape incident class without any auto-resolution heuristics.

## DoD

- [ ] **Fix 1a** — already in place at `bkit-build-plan-execute.md:44, 60`, `bkit-build-plan-gaps-remediate.md:43, 66`, `bkit-build-challenge-remediate.md:43, 62`. **No change.**
- [ ] **Fix 1b** — freeform stub-first added to `bkit-build-challenge-1` + `-2` (Fix 4), `bkit-build-plan-verify`, `bkit-build-challenge-tests`. Wording matches the established `echo >>` pattern verbatim (heredoc for multi-line findings); `Verdict:` line update via `Edit` eager-flips on BLOCK. Audit pass over `bkit-utility-audit-*` and summary agents — spot-fix any gap.
- [ ] **Fix 2** — `bkit-plan` workflow gains hard task-count gate (>15 → Failure Path with split-required reason). Existing 100K-token gate retained as primary in `bkit-plan-complexity-check`.
- [ ] **Fix 3** — `bkit-plan` Step 1 counts `BAR-N` references in `plan-input.md`; if >1 → Failure Path. No marker, no opt-in.
- [ ] **Fix 4a** — existing `.agents/agents/bkit-build-challenge.md` split into `bkit-build-challenge-1.md` (Opus, effort: high) + `bkit-build-challenge-2.md` (Sonnet, effort: medium). Bodies identical except frontmatter, matching `bkit-design-review-1/-2` exactly.
- [ ] **Fix 4b** — `bkit-build.md` workflow's challenge step rewritten to launch both subagents in parallel using verbatim template from `bkit-design.md` Step 5. Outputs: `build-challenge-1.md`, `build-challenge-2.md`. Failure Path on empty file.
- [ ] **Fix 4c** — new `.agents/agents/bkit-build-challenge-reconcile.md` agent created, mirroring `bkit-design-update.md` shape. Inputs: both challenge files. Output: unified `build-challenge.md` (drop-in compatible with existing remediate flow).
- [ ] **Fix 4d** — `bkit-build.md` workflow gains reconcile step after parallel challenge step.
- [ ] **Fix 5** — `bkit-ship.md` Step 2 replaces bare `exit 1` on rebase failure with standard Failure Path routing (existing `bkit-debug-abort-handover` then produces `ship-handover.md` automatically). One-line change. No new agent, no new artifact format.
- [ ] **Fix 6** — `bkit-build.md` Step 1 always emits long-branch status (`N commits behind dev / M ago since divergence`), no thresholds. Two git calls, one echo.
- [ ] Index docs updated per § Authoring rules: `.agents/workflows.md` reflects `.agents/workflows/*` edits; `.agents/prompts.md` (and `.agents/agents.md` if present) reflects `.agents/agents/*` and `.agents/prompts/*` edits. Template sync verified for any `.agents/rules.md` `bkit:start/end` edits.
- [ ] `bkit install` run once at end of implementation session (not after every edit) to regenerate `.claude/` and `.cursor/` mirrors.
- [ ] Friction entries in `.agents/friction.md` (5 retained entries dated 2026-05-06 → 2026-05-08) marked `FIXED-IN: BAR-155` once changes ship.

## Out of scope

- **Diff-size or sensitivity gating** for parallel challenge — explicitly always-on.
- `task-range` parameter for `bkit-build-plan-execute` — deferred fallback. Only revisit if Fix 2 proves insufficient on genuinely-atomic large phases.
- **Focused-brief mode for** `bkit-build-challenge` — explicitly dropped. A targeted brief tells the adversarial reviewer which doors are already locked; diversity (Fix 4), not narrowing, is the right answer.
- **Retrofit of** `bkit-design-review-1/-2` and `bkit-plan-review-1/-2` with explicit model/thinking diversity — already verified to use Opus/high vs Sonnet/medium. **No retrofit needed.**
- **Subagent retry/backoff harness redesign** — prompt/structure changes only (same scoping as BAR-137).
- **Adapter changes for non-pnpm package managers.**
- **KN/DE auto-renumber on rebase conflicts** — explicitly dropped. Sed regex / cross-platform fragility (e.g. `KN-3` matching `KN-30`, prose cross-references, multi-file atomicity). Frequency too low to justify the implementation risk; Fix 6 reduces frequency further by encouraging mid-build rebases.
- **Template-vs-canonical preference rule on rebase conflicts** — explicitly dropped. Narrow scope (bkit-repo-only — `.agents/templates/*` doesn't exist in consumer repos). Timestamp heuristic can pick the wrong winner (recent cosmetic commit beats older substantive change). Manual resolution remains acceptable for this frequency.
- **Custom** `ship-rebase-conflict-{N}.md` artifact — explicitly dropped in favour of Fix 5 (route through existing Failure Path → existing `bkit-debug-abort-handover` produces `ship-handover.md`). No new artifact format needed.
- **Opt-in mechanism for multi-issue plan-input** — explicitly refused via Failure Path; no flag, no marker.

## Convention references (verbatim sources for implementation)

- **Parallel-invocation workflow template** — `.agents/workflows/bkit-design.md` Step 3 (brainstorm), Step 5 (design review); `bkit-plan.md` Step 4 (plan review). Verbatim "Launch both subagents in parallel using `Agent` tool" wording with Read/Create directives, parallel-context preamble, and Failure Path assertion.
- **Parallel-pair frontmatter convention** — `.agents/agents/bkit-design-review-1.md` (`model: claude-opus-4-7`, `effort: high`); `bkit-design-review-2.md` (`model: claude-sonnet-4-6`, `effort: medium`). Same pattern in brainstorm-ideate-1/-2, plan-review-1/-2, plan-scope-check-1/-2. Bodies identical except frontmatter.
- **Reconcile-agent shape** — `.agents/agents/bkit-design-update.md` (consumes `design-v1-draft.md` + `design-review-1.md` + `design-review-2.md` → `design-v2-reviewed.md`). Single agent, no -1/-2 split.
- **Filename suffix convention** — `-1.md` / `-2.md` for parallel outputs (NOT `-r1`/`-r2`, `-a`/`-b`).
- **Failure Path block** — top of every workflow file (see `bkit-design.md` `## 🤖 Failure Path` block: status.json update, lock removal, commit, Linear label/state update, comment append, STOP). Already wired into `bkit-ship.md` Failure Path Step 5 via `bkit-debug-abort-handover` → `ship-handover.md`.
- **Abort-handover agent** — `.agents/agents/bkit-debug-abort-handover.md`. Produces `{phase}-handover.md` with Short Version / Attempt History / Verified Resolutions / Persistent Errors / Recommended Next Steps / Reference Docs sections. Self-contained — reads `status.json`, glob `{phase}-input-*.md`, glob `{phase}-failure-*.md`, `git diff origin/dev..HEAD`. Already invoked from `bkit-debug.md`, `bkit-ship.md`, `bkit-build.md` Failure Paths.
- **Existing** `echo >>` pattern (Fix 1b verbatim source) — `.agents/agents/bkit-build-plan-execute.md:44, 60`; `bkit-build-plan-gaps-remediate.md:43, 66`; `bkit-build-challenge-remediate.md:43, 62`.
- **Existing token-only complexity rule** — `.agents/prompts/bkit-plan-complexity-check.md:38-39`.
- **No existing branch-status reporting** — searched `bkit-ship.md`, `bkit-build.md` for `git rev-list` / `commits behind` / `branch status`. None found. Fix 6 is a clean addition.
- **Authoring rules** — `.agents/rules.md` § bkit Repo Authoring (READ FIRST).

## References

- BAR-137 (parent — stub-first fix for `bkit-build-plan-execute`) — closed 2026-05-05.
- BAR-141 build-workflow run — plan-execute PENDING after ~20min on `bkit`.
- BAR-131 ship-workflow run — 50-commit rebase, 5 conflict commits, KN-9/KN-10 → KN-12/KN-13 renumber on `bkit`. CI run `#25538826802` green post-resolution.
- BAR-131 / BAR-139 / BAR-142 plan-generate run — 32KB multi-issue input, stream timeout on `bkit`.
- BAR-93 re-run — challenge subagent budget exhaustion on `gether-life/app-gether-life`.
- BAR-132 — plan-execute 31-task sub-plan (3× cutoffs) on `fcte-com-au/visitfrasercoast-com`.
- Friction log: `.agents/friction.md` (5 retained entries, 2026-05-06 → 2026-05-08; collection from app-gether-life and visitfrasercoast-com landed 2026-05-08). Note lines 88-89 — original `≤15 tasks` recommendation.

### Comments

(None at start of plan workflow.)
