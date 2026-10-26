## Session Prompt — this run's, newer than everything below

#699

## Issue description — oldest

### Problem

bkit does not verify, at the end of a workflow run, that every engine command the workflow requires actually ran; it does not check the previous run when a workflow starts; and engine errors/warnings are never recorded to `.bkit/friction.jsonl` or `docs/failures.jsonl`. A holey run, or silent engine friction, is therefore invisible unless a human or CI catches it.

Current state (from an engine read-through, 2026-10-26):

- **End-of-run completeness** exists only as `.bkit/core/engine/checks/status-holes.ts` — **advisory / fail-open** (the CLI always exits 0), **ship-only**, CI-only (`.github/workflows/bkit-ci.yml` → `pnpm bkit:audit:status || true`), and it compares recorded **steps** (not engine commands) against a set derived at runtime from `bkit-ship.md`. No equivalent for design / plan / build / debug.
- **Start of the next workflow** — `bkit workflows start` resumes an `IN_PROGRESS` run (`resumed` / `lastDoneStep`); `bkit status resume` names where to continue; stale/orphaned locks are reclaimed (`finished` | `stale` | `orphaned`). Nothing asserts the previous run was complete.
- **Engine errors/warnings** — a non-zero engine exit → Failure Path → `bkit workflows fail` writes a `workflow-failed` **status** row + `bkit:failed` label + failure comment. `.bkit/friction.jsonl` and `docs/failures.jsonl` are written by the agent via `bkit ledgers append`; engine code only **reads** them (`run-facts.ts` computes `friction` / `failures` `added` counts into `.bkit/stats.jsonl`). Warnings go to `.bkit/advisories.md` only.

### Outcome

- One bkit verb reports **step and command completeness** for any phase's run, deriving expectations from the workflow markdown at runtime (no hand-maintained table).
- `bkit workflows close` (and/or `start` on resume) surfaces the current/previous run's completeness verdict.
- Engine non-zero exits produce a `tool-failure` friction row (or a documented, enforced alternative), so engine friction is visible in telemetry.

### Success criteria

- Completeness report covers design / plan / build / debug / ship (today: ship only) and flags a step recorded `DONE` without its required engine evidence.
- A closed run carries its completeness verdict in the run's own artifacts; a resumed run warns when the previous run was holey.
- An engine exit non-zero appends (or otherwise records) a `friction` row with `category: "tool-failure"`.
- Promotion criteria from advisory → blocking gate recorded (tie to decision `384-tier3-promotion`).
- Unit tests + fixture corpus; no parallel expected-step table.

### Constraints and non-goals

- Advisory / fail-open until proven (one release without muting), per decision `384-tier3-promotion`.
- Keep engine/tool errors as `friction`; reserve `failure` for discovered bugs — do not pollute the bug backlog.
- No new parallel detector where `status-holes.ts` can be generalised.

### Decisions already made

- `status-holes.ts` derives its expected set from `bkit-ship.md` at runtime, never a hand table.
- The detector stays advisory / fail-open; promotion is gated (deferral `384-promote-status-hole-detector-from-advisory-to-gate`).

### Open questions

- Where should the completeness check run — `close`, `start`, both, or a standalone verb — and does it gate anything?
- Should engine-error rows land in `friction` (mechanical) or `failure` (semantic)? Confirm the split.
- One issue (this) or split by phase/mechanism during design?

### References

- `.bkit/core/engine/checks/status-holes.ts` (+ `status-holes.test.ts`) — the current advisory detector
- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` — static "engine calls" shape gate
- `.bkit/core/engine/commands/workflow/workflows.ts` — `start` / `fail` / `close`, resume semantics
- `.bkit/core/engine/commands/workflow/run-facts.ts` — `outcome` telemetry
- `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/ledgers/telemetry.ts` — ledger schema / write idiom
- `.bkit/jsonl.md` — ledger kinds, friction categories, write idiom
- `.github/workflows/bkit-ci.yml` — "Check Status Holes" advisory CI step
- `docs/testing.md` — status-hole detector contract
- Related issues (non-duplicate): [#331 — WS-G2: silent-corruption gates at ship and milestone end](https://github.com/cbartens/bkit/issues/331) (closed), [#676 — Orchestrator work the engine could do as bkit commands](https://github.com/cbartens/bkit/issues/676) (closed), [#680 — ledgers append: engine writes ledger rows with a minted ts](https://github.com/cbartens/bkit/issues/680) (closed)

## Issue comment — posted 2026-10-26T03:18:45.000Z

Work done: filed and corrected this issue from an engine read-through of workflow-run observability.

**Outcome**

- Created the issue, then brought it into line with `.agents/rules.md`: title reduced to <=70 chars, body restructured to the `idea` shape (`.bkit/trackers.md` § Issue shapes), `enhancement` + `next:design` labels, project + Status/Priority/Size set, milestone **Workflow Optimisation**, and issue references rewritten to title + URL form.
- No parent and no blockers: standalone issue, nothing to block on.

**Findings recorded**

- End-of-run command/step completeness is ship-only advisory today (`.bkit/core/engine/checks/status-holes.ts`), CI-only, fail-open.
- No completeness assertion on the previous run at workflow start (resume/reclaim only).
- Engine errors/warnings never auto-write `.bkit/friction.jsonl` or `docs/failures.jsonl`; only a `workflow-failed` status row + `bkit:failed` label.

**Links**: [cbartens/bkit#699 — Engine run completeness check + auto friction/failure on errors](https://github.com/cbartens/bkit/issues/699)
No files changed this turn (tracker-only).

## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 Check placement and gating: one standalone verb is the single implementation; `workflows close` calls it to record the current run's verdict, and `workflows start`/resume calls it to warn when the previous run was holey. It records and warns only — it never fails or interrupts a workflow.
- Q2 friction vs failure for engine errors: `friction` with `category: "tool-failure"`; `failure` stays reserved for discovered product bugs.
- Q3 Scope: one issue — the completeness verb, the all-phase generalisation, the start/close wiring and the engine-error rows are one mechanism.
- Q4 What "command completeness" checks: a full command journal — every bkit command a workflow runs is journaled — and the check compares the journal against the workflow markdown. Fail-safe: it must never impact workflow execution.
- Q5 How engine non-zero exits get recorded: an engine-level top-level handler writes one `friction` row (`category: "tool-failure"`) on an unexpected non-zero exit while a run is active, deduped by key, excluding the documented routing exits (3, 8, 9, 80, 81).
- Q6 Where the closed run's completeness verdict is stored: a new `completeness` row in the run's `status.jsonl`.
- Q7 The on/off switch's key and default: none — the journal is always on (supersedes the earlier "configurable in package.json, default on" answer).
- Q8 Where the per-command journal is stored: `engine-call` rows in the run's `status.jsonl`.
- Q9 What the journal records: only bkit invocations while a workflow run is active.
- Q10 How the check tells a required command from an optional one: every `"{BKIT}"` literal in a step's sections counts as required; no new prose marker.
- Q11 What an `engine-call` row records: `{type, workflow, at, noun, verb, flags:[flag names only]}` — flag names, never values, so no secret or free text is journaled.
- Q12 How the CLI attributes a call to the right run when several runs are active: resolve with no new state — the command's own explicit `--file` (or `--fid` + `--month`) wins; else the single `IN_PROGRESS` run discoverable from the cwd's git toplevel; else the call is not journaled (never misattributed).
- Q13 The new verb's name and shape: a new top-level noun `completeness` with a `check` verb (`bkit completeness check --workflow= --file=`).
- Q14 Where the "previous run was holey" warning surfaces: a printed line in `workflows start` / resume output — a warning, never an interruption and never a "continue?" prompt.
- Q15 The pinned watermark: none — the check reports every hole it finds on every run. Departs from decision `384-tier3-promotion`'s pinned-watermark delta; the design records the departure.
- Q16 The friction row's dedup key: the failing command's noun + verb plus the workflow step, so a recurring failure updates one row and raises `recurrenceCount`.
- Q17 Draft acceptance scenario: accepted, with the note that a holey-previous-run warning only ever warns — it never interrupts a workflow once started and never asks to continue.

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

As the bkit maintainer I want a workflow run to tell me, in its own artifacts, whether every step and every engine command it required actually ran — and to record engine friction automatically instead of losing it. When I start or resume a run whose previous run was incomplete, I want to be warned before I build on it.

#### Success Criteria

1. One bkit verb reports, for any design/plan/build/debug/ship run, the steps the workflow markdown requires versus those recorded, and the `"{BKIT}"` commands the markdown names versus those journaled.
2. A closed run carries its completeness verdict as a `completeness` row in its own `status.jsonl`; starting or resuming a run prints a warning when the previous run for that FID was holey — the warning only ever warns; it never interrupts a workflow once started and never asks to continue.
3. An unexpected non-zero exit of a bkit command while a run is active appends one `friction` row with `category: "tool-failure"`, deduped by key; the documented routing exits never produce one.
4. The journal and the check never change a command's exit code, never block, and never fail a workflow.
5. The expected command/step set is derived from the workflow markdown at runtime (no hand-maintained table), and the advisory→blocking promotion criteria are recorded against decision `384-tier3-promotion`.

#### Key Edge Cases

- Several runs active at once (each in its own worktree): a journaled call attributes to the right run or is not journaled at all — never misattributed.
- A command run outside the run's worktree (`cd {REPO_ROOT} && bkit branches land`) attributes via its own `--fid`/`--month`, else is skipped.
- Conditional, fallback and retry calls in the prose (`"{BKIT}"` inside a `Route:` / `Failure Path` arm) count as required; the report lists every hole on every run (no watermark or baseline).
- A run that fails or is abandoned mid-run: completeness must not flag the un-run tail as holes, and a resumed run's earlier rows still count.
- Secret or free-text values in a command line (`--token=`, `--error=`) are never journaled — flag names only.
- The journal write itself failing (read-only tree, full disk) is swallowed; the command still succeeds.

#### Process Sketch

- WHEN a bkit command runs while a run is active → THEN one `engine-call` row (noun, verb, flag names) is appended to that run's `status.jsonl`, and nothing else changes.
- WHEN a bkit command exits non-zero for a reason other than a documented routing code → THEN one `friction` row with `category: "tool-failure"` is appended, deduped by key.
- WHEN a workflow closes a run → THEN the completeness verb compares recorded steps and journaled calls against the workflow markdown and appends a `completeness` row with the verdict.
- WHEN a workflow starts or resumes a run → THEN it prints a warning if the previous run for that FID was holey, and continues either way.
- WHEN the check finds a step recorded `DONE` without its required calls → THEN the verdict names the step and the missing calls, and nothing fails.
- WHEN the check runs → THEN it reports every hole it finds for that run, with no baseline or watermark.
