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
