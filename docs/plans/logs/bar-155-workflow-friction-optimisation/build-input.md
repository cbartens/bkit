# Build Input — bar-155-workflow-friction-optimisation

## Session Prompt

/bkit-build bar-155

## Linear Issue: BAR-155 — bkit Workflow Friction Optimisation

### Description

Goal: Document recurring failure modes observed across bkit subagent invocations and the `bkit-ship` rebase step during the 2026-05-06 → 2026-05-08 window, and implement prompt/structure changes to remove them.

### Fixes to implement

- **Fix 1b** — Freeform stub-first added to `bkit-build-challenge-1` + `-2`, `bkit-build-plan-verify`, `bkit-build-challenge-tests`. Wording matches `echo >>` pattern (heredoc for multi-line); `Verdict:` eager-flip on BLOCK. Audit pass over `bkit-utility-audit-*` and summary agents.
- **Fix 2** — `bkit-plan` workflow gains hard task-count gate (>15 → Failure Path). Existing 100K-token gate retained.
- **Fix 3** — `bkit-plan` Step 1 counts BAR-N references; >1 → Failure Path. No marker, no opt-in.
- **Fix 4a** — Split `bkit-build-challenge.md` into `bkit-build-challenge-1.md` (Opus, effort: high) + `bkit-build-challenge-2.md` (Sonnet, effort: medium).
- **Fix 4b** — `bkit-build.md` challenge step launches both in parallel (verbatim design.md template).
- **Fix 4c** — New `bkit-build-challenge-reconcile.md` agent. Inputs: challenge-1.md + challenge-2.md. Output: unified `build-challenge.md`.
- **Fix 4d** — `bkit-build.md` gains reconcile step after parallel challenge.
- **Fix 5** — `bkit-ship.md` Step 2 rebase `exit 1` → standard Failure Path routing (no new agent/artifact).
- **Fix 6** — `bkit-build.md` Step 1 always emits long-branch advisory (N commits behind dev / age).

### Index doc updates required

- `.agents/workflows.md` — reflect bkit-build.md and bkit-ship.md edits
- `.agents/prompts.md` — reflect new agents (bkit-build-challenge-1, -2, -reconcile) and prompt changes
- Template sync for any `bkit:start/end` block edits

### bkit install

Run ONCE at end-of-session (not after every edit).

### Friction entries

`.agents/friction.md` (5 retained entries, 2026-05-06 → 2026-05-08) — mark `FIXED-IN: BAR-155` once changes ship.

## Plan

See: `docs/plans/active/bar-155-workflow-friction-optimisation-plan.md`
