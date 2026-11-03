# Design: Engine run completeness check + auto friction on engine errors

## Related Issues

None from the prior-incident scan (`related-issues.md` = `None`). The issue body cites three non-duplicate closed references, reused here as prior art, not as open incidents:

- #331 — WS-G2: silent-corruption gates at ship and milestone end (closed)
- #676 — Orchestrator work the engine could do as bkit commands (closed)
- #680 — ledgers append: engine writes ledger rows with a minted ts (closed)

## Acceptance Scenario

Adopted from the input's `Draft Acceptance Scenario` (Q17 accepted), with two sharpenings recorded as `Decisions` rows: the meaning of "holey" (criterion 2) is pinned to evidence holes + step holes, not every unexercised conditional call; and a pre-journal run (zero `engine-call` rows) gets a steps-only verdict rather than being flagged holey. No `Test Matrix` here — added at plan time.

### Narrative

As the bkit maintainer I want a workflow run to tell me, in its own artifacts, whether every step and every bkit command it required actually ran — and to record engine friction automatically instead of losing it. When I start or resume a run whose previous run was incomplete, I want to be warned before I build on it.

### Success Criteria

1. One bkit verb (`bkit completeness check --workflow= --file=`) reports, for any design / plan / build / debug / ship run, the steps the workflow markdown requires versus those recorded, and the `"{BKIT}"` commands the markdown names versus those journaled — the expected set derived from the markdown at runtime, never a hand table.
2. A closed run carries its completeness verdict as a `completeness` row in its own `status.jsonl`; starting or resuming a run prints a warning when the previous run for that FID was **holey** — holey meaning an _evidence hole_ (a step recorded `DONE` without its required journaled calls) or a _step hole_ (a required step absent from a closed run), never merely an unexercised conditional arm. The warning only ever warns; it never interrupts a workflow once started and never asks to continue.
3. An unexpected non-zero exit of a bkit command while a run is active appends one `friction` row with `category: "tool-failure"`, deduped by key; the documented routing exits never produce one.
4. The journal and the check never change a command's exit code, never block, and never fail a workflow — a failed journal write is swallowed and logged, never raised.
5. The expected command/step set is derived from the workflow markdown at runtime (no hand-maintained table), and the advisory→blocking promotion criteria are recorded against decision `384-tier3-promotion`.

### Key Edge Cases

- Several runs active at once (each in its own worktree): a journaled call attributes to the right run or is not journaled at all — never misattributed (Q12).
- A command run outside the run's worktree (`cd {REPO_ROOT} && bkit branches land`) attributes via its own `--fid` / `--month`, else is skipped.
- Conditional, fallback and retry calls in the prose (`"{BKIT}"` inside a `Route:` / `Failure Path` arm) count as required and are reported as _unexercised_ when not taken; only a step recorded `DONE` missing its calls is an _evidence hole_, and the report lists every hole on every run (no watermark or baseline).
- A run that fails or is abandoned mid-run: completeness must not flag the un-run tail as holes, and a resumed run's earlier rows still count.
- A run with zero `engine-call` rows (pre-journal, or a broken journal): steps-only verdict labelled `preJournal: true` — never "every command missing".
- Secret or free-text values in a command line (`--token=`, `--error=`) are never journaled — flag names only (Q11).
- The journal write itself failing (read-only tree, full disk) is swallowed; the command still succeeds, and a heartbeat invariant (a run under a journaling engine with zero `engine-call` rows = journal broken, not run holey) keeps the detector from crying wolf when it is itself hurt.
- The `completeness` verb is itself a bkit command run while a run is active: it journals itself and self-excludes from its own expectations.
- `completeness` and `engine-call` rows landing in `status.jsonl` must not shift step-timing or the harvest run-attribution windows (`MARK_ROWS`).

### Process Sketch

- WHEN a bkit command runs while a run is active → THEN one `engine-call` row (noun, verb, flag names) is appended to that run's `status.jsonl` at dispatch entry, and nothing else changes.
- WHEN a bkit command exits non-zero for a reason other than a declared routing code → THEN one `friction` row with `category: "tool-failure"` is appended, deduped by key (raising `recurrenceCount` on a recurrence).
- WHEN a workflow closes a run → THEN the completeness verb compares recorded steps and journaled calls against the workflow markdown and appends a `completeness` row before the `workflow-done` row.
- WHEN a workflow starts or resumes a run → THEN it prints a warning if the previous run for that FID was holey, and continues either way.
- WHEN the check finds a step recorded `DONE` without its required calls → THEN the verdict names the step and the missing calls, and nothing fails.
- WHEN the check runs → THEN it reports every hole it finds for that run, with no baseline or watermark.

## Reuse & Prior Art

Searched: `.bkit/core/engine/checks/`, `.bkit/core/engine/commands/` (+ `workflow/`, `registry.ts`), `.bkit/core/engine/audits/workflows/`, `.bkit/core/engine/ledgers/`, `.bkit/core/engine/cli.ts`, `.bkit/workflows.md`, `.bkit/jsonl.md`, `docs/testing.md`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`.

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| md-derived expected set + advisory report | `.bkit/core/engine/checks/status-holes.ts` (`deriveExpectedStepSetFromSource`, `classifyRun`, `detectHoles`, `formatAdvisoryReport`, exit-0 contract) | EXTEND | Generalise in place to all five workflows — the constraint forbids a second detector; the ship path sets are replaced, not duplicated. |
| md section + `"{BKIT}"` call parser | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` (`stepSections`, `callWords`, `unknownCalls`) | EXTEND | Promote the helpers out of the test into the check module; the test imports them back, so one parse serves both. |
| Step universe (numbers, titles, `--step=` keys) | `.bkit/core/engine/commands/workflow/step-table.ts` (`WORKFLOW_STEPS`) | EXTEND | Already held to the md headings and `--step=` calls by `workflow-shape.test.ts`; drift-gated, so not a second source of truth. |
| `status.jsonl` read / write | `commands/workflow/status.ts` (`readStatusEvents`, `readRuns`, `FILE_FLAG`, `WORKFLOW_FLAG`), `ledgers/status.ts` (`appendLine`, `fold`, `statusTimestamp`) | EXTEND | The journal row and the verdict row ride the existing readers / writers. |
| Dedup-by-key idiom | `ledgers/status.ts` (`actionKey`, `actionHash`, `alreadyDone`, `recordAction`, `ENGINE_ACTION`) | EXTEND | The friction row's dedup + `recurrenceCount` reuse this idiom rather than a new key scheme. |
| Friction ledger write | `commands/workflow/ledgers.ts` `appendLedgerRows`; `ledgers/telemetry.ts` `KIND_WRITERS.friction.orchestrators = {design, plan, build, debug, ship}` | EXTEND | The engine writes `by.workflow` = the active run's workflow, which the existing validator already admits — no `KIND_WRITERS` change (see `Decisions`). |
| Command dispatch seam | `commands/lib.ts` `runCommand` (+ `EXIT`, `SHARED_EXIT_CODES`, per-verb `exitCodes`) | EXTEND | Every one of the 22 distinct `"{BKIT}"` calls in the workflow prose is a registered `bkit <noun> <verb>`; none is a classic verb, so one hook here covers all of them (verified, not assumed). |
| Command registration + conventions | `commands/registry.ts` + `commands/conventions.test.ts` | EXTEND | Register the `completeness` noun; conventions hold the spec to flags / output / exit-code rules. |
| Run attribution with no new state | `lib.ts` `statusLocation`; `locks.ts` (`resolveMonth`, `monthBuckets`, `workflowLockPath`, `readRunsLenient`) | EXTEND | Resolve `--file` / `--fid`+`--month` / the single `IN_PROGRESS` run; never misattribute (Q12). |
| Current-step resolution for the friction key | `step-table.ts` `resumePoint` | EXTEND | Names the run's current step from its own rows; feeds the friction dedup key without an env contract. |
| `status.jsonl` row-type table | `.bkit/workflows.md` § `status.jsonl` — Row type table | EXTEND | Add the two new row types to the documented table. |
| Step-timing + harvest run windows | `commands/workflow/run-facts.ts` `MARK_ROWS` (`session`, `owner-pause`, `owner-answer`) | EXTEND | Add `engine-call` + `completeness` so `stepsBlock` timing and the harvest `afterEnd` / `lastActivity` / `byRun` windows are unaffected. |
| Advisory CI wiring | `.github/workflows/bkit-ci.yml` "Check Status Holes" (`pnpm bkit:audit:status \|\| true`); `docs/testing.md` § Tier-3 fail-open advisory channel | EXTEND | Point the advisory step at the generalised check; keep fail-open and the promotion gate. |
| `completeness` command noun + verb | `None` — searched registered commands (`registry.ts`), classic verbs (`cli.ts` `CLASSIC_VERBS`), the `status-holes.ts` CLI (a ship-only script, not a verb) | NEW | No existing command reports step / command completeness for any phase; `status-holes.ts` is ship-only and not reachable as a verb. |
| `engine-call` + `completeness` row types | `None` — searched the `status.jsonl` row-type table and every `type` literal in `ledgers/status.ts` | NEW | No existing row type carries a command journal or a completeness verdict; both are additive (the fold skips unknown types). |

No capability in the design is served by a second, parallel implementation: the `NEW` rows are a command surface and two additive row types, both required by settled answers Q6 / Q8 / Q13.

## Architecture

One mechanism, four parts, each pure and independently testable; every part reuses an existing artifact (see `Reuse & Prior Art`).

1. **Contract deriver** (generalises `checks/status-holes.ts`, new module `checks/completeness.ts` or the evolved `status-holes.ts`). Input: a workflow's markdown text + the workflow name. Output: a contract `{ steps: [{ number, title, stepKey?, requiredCalls: [{noun, verb, flags[]}] }], universe }`.
   - Step sections come from the `## … Step N — Title` headings (the `stepSections` idiom, promoted out of `workflow-shape.test.ts`).
   - Per-step required calls come from every `"{BKIT}"` literal inside the step's section (the `callWords` idiom), reduced to `{noun, verb, flag names}` — Q10, no new prose marker.
   - The step universe is cross-checked against `WORKFLOW_STEPS[workflow]` (numbers, titles, `--step=` keys); drift is reported, not fatal.
   - **Conditioning is derived, not hand-modelled.** Evidence holes need no path model at all. Step holes use one generic rule (below); a step's conditionality is read from the md structure (`Failure Path` / `Route:` / "Path X only" sections) plus the `resumeAt` / `resumeOnVerdict` markers already on `WORKFLOW_STEPS`. This dissolves deferral `442-status-hole-detector-beyond-ship`'s "each phase needs its own routing-branch model" premise.

2. **Journal seam** (one hook inside `commands/lib.ts` `runCommand` — the single dispatch point every `bkit <noun> <verb>` passes through, verified to cover every `"{BKIT}"` call).
   - On dispatch entry (after the verb resolves, before `spec.run`): resolve the active run (Q12 — the command's own `--file`, else `--fid` + `--month`, else the single `IN_PROGRESS` run discoverable from the cwd's git toplevel, else skip) and append one `engine-call` row (Q11) with `appendLine`. Sync, swallowed on any error, one stderr line per swallow.
   - On exit: capture the code from `spec.run` / `CommandError.code`; on a non-zero code that is not a _declared routing exit_ (see `Decisions`) and a run is active, append one deduped `friction` row (`category: "tool-failure"`) via `appendLedgerRows(root, "friction", rows)` with `by.workflow` = the active run's workflow. A non-`CommandError` throw takes the same friction path, then rethrows (today it escapes `runCommand` to `main().catch` and would never be recorded).
   - The seam is behind one resolve-or-skip interface and is injectable (via `runCommand`'s existing `io` / `options`), so it is unit-testable in isolation and a different store could be swapped in later.
   - **Fail-safe contract:** nested try/finally around every telemetry write; the seam never alters an exit code, never blocks, never throws; a test forces a journal throw and asserts exit-code passthrough.

3. **Checker** (pure): `check(rows, contract) → CompletenessVerdict`. Classifies the run (generalising `classifyRun`), then reports:
   - **evidence holes** — a step recorded `DONE` whose required calls are not in the journal;
   - **step holes** — a step missing from a closed run, at or before the last observed step, and not a conditional arm;
   - **unexercised** — required calls of steps not reached, or conditional arms not taken (reported, non-alarming);
   - **unexpected** — journaled calls or recorded steps not in the contract;
   - **preJournal** — true when the run has zero `engine-call` rows, so the verdict is steps-only and labelled.
     The verdict's `holey` flag keys on evidence holes + step holes only.

4. **`completeness` command** (`bkit completeness check --workflow= --file=`, Q13) — a thin `CommandSpec` in `commands/workflow/completeness.ts`, registered in `registry.ts`; reads `status.jsonl` + the workflow md, emits the verdict, always exits 0 (advisory / fail-open, `docs/testing.md` § Tier-3).

**Integration points.**

- `workflows close` calls the checker in-process and appends the `completeness` row to the run's `status.jsonl` **before** the `workflow-done` row, so it is part of the run (not an after-end row) and rides the close commit into the run's own artifacts (Q6).
- `workflows start` (and resume) reads the previous run's verdict — from its stored `completeness` row when present, else computed on the fly — and prints one warning line when holey (Q14); never interrupts, never prompts (Q17).
- `run-facts.ts` `MARK_ROWS` gains `engine-call` and `completeness`; `.bkit/workflows.md` § `status.jsonl` gains both row types.
- The CI advisory step is repointed at the generalised check; the promotion gate (`384-tier3-promotion`) is unchanged.

**Boundaries.** The deriver touches only markdown text; the checker touches only rows + contract; the seam touches only the run's `status.jsonl` and `.bkit/friction.jsonl`; the command is a reader. Nothing in the mechanism reads or writes a workflow's step state beyond what `status.jsonl` already holds.

## Data Model

All new rows are additive to `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (append-only NDJSON, `merge=union`); `fold` already skips types it does not know, so both are safe on old readers.

**`engine-call` row (Q8, Q11)** — one per bkit invocation while a run is active, appended at dispatch entry:

```json
{
  "type": "engine-call",
  "workflow": "build",
  "at": "2026-10-26T13:00:00Z",
  "noun": "steps",
  "verb": "done",
  "flags": ["workflow", "step", "commit"]
}
```

- `flags` holds flag **names only**, never values — no secret or free text is journaled (Q11).
- The row carries no `step` field (Q11 verbatim). Attribution of a call to a step is positional (calls between two `step-done` rows belong to the step in progress) at check time; the friction dedup key resolves its step separately (see `Decisions`).
- Identity for `merge=union` de-dup: `(type, workflow, noun, verb, at)` — a resumed/replayed call differs by `at`.

**`completeness` row (Q6)** — one per closed run, appended by `workflows close` before `workflow-done`:

```json
{
  "type": "completeness",
  "workflow": "build",
  "at": "2026-10-26T15:00:00Z",
  "run": 2,
  "verdict": "HOLEY",
  "preJournal": false,
  "observed": { "steps": 12, "calls": 34 },
  "evidenceHoles": [
    {
      "step": "build-plan-verify",
      "missing": [{ "noun": "tests", "verb": "run", "flags": ["gate"] }]
    }
  ],
  "stepHoles": ["build-summary"],
  "unexercised": [
    { "step": "build-failure-diagnose", "call": { "noun": "workflows", "verb": "fail" } }
  ],
  "unexpected": [{ "noun": "status", "verb": "row" }],
  "sourceSha": "<sha256 of the workflow md at close>"
}
```

- `verdict` is `CLEAN` | `HOLEY`; `holey` (the warning trigger) keys on `evidenceHoles` + `stepHoles` only.
- The row carries **per-hole evidence** (step + the missing calls), never a bare boolean — the 3am diagnosability requirement.
- `sourceSha` makes prose-vs-verdict drift diffable: a re-run of the check against a different md disagrees visibly rather than mystically.
- `preJournal: true` marks a run with zero `engine-call` rows: steps-only verdict, never "every command missing".

**`friction` row (Q2, Q5, Q16)** — existing kind and ledger, written by the engine seam through `appendLedgerRows`:

```json
{
  "kind": "friction",
  "by": { "workflow": "build", "step": "build-plan-verify" },
  "key": "tests-run/build-plan-verify",
  "category": "tool-failure",
  "severity": "MEDIUM",
  "description": "bkit tests run exited 1 (undeclared for this verb) during build-plan-verify"
}
```

- `category: "tool-failure"` (existing friction category, `.bkit/jsonl.md` § Categories).
- `key` = `<noun>-<verb>/<step>` when the step is knowable, else `<noun>-<verb>`; recurrence = same-`key` append, raising `recurrenceCount` (the existing dedup idiom).
- `by.workflow` = the active run's workflow, which `KIND_WRITERS.friction.orchestrators` already admits.

**No schema migration.** No existing row gains or loses a field; no ledger gains a kind. The `status.jsonl` row-type table (`.bkit/workflows.md`) and `MARK_ROWS` (`run-facts.ts`) are updated in the same change as the rows first appear.

## Components / Flows

**Modules (all under `.bkit/core/engine/`).**

<!-- prettier-ignore -->
| Unit | Kind | Responsibility |
| --- | --- | --- |
| `checks/status-holes.ts` → `checks/completeness.ts` | Evolved module | `deriveContract(workflowMd, workflow)` (step sections + required calls + `WORKFLOW_STEPS` cross-check) and `check(rows, contract) → verdict`. Keeps the advisory exit-0 CLI for the CI step. |
| `audits/workflows/workflow-shape.test.ts` | Test (edit) | Imports `stepSections` / `callWords` from the check module instead of holding a copy. |
| `commands/lib.ts` `runCommand` | Seam (edit) | Brackets the dispatch: journal on entry, friction on unexpected non-zero exit / throw, resolve-or-skip attribution, total swallow. |
| `commands/workflow/completeness.ts` | New command | `bkit completeness check --workflow= --file=` — a thin `CommandSpec` over the checker; exit 0 always. |
| `commands/registry.ts` | Edit | Register `completenessCommand`. |
| `commands/workflow/workflows.ts` | Edit | `closeWorkflow` calls the checker and appends the `completeness` row before `workflow-done`; `workflows start` prints the previous-run warning. |
| `commands/workflow/run-facts.ts` | Edit | Add `engine-call` + `completeness` to `MARK_ROWS`. |
| `.bkit/workflows.md` § `status.jsonl` | Doc edit | Row-type table gains both rows. |
| `.github/workflows/bkit-ci.yml` | Edit | Advisory step repointed at the generalised check. |

**Flow — a step runs (happy path).**

1. A workflow's fenced block calls `"{BKIT}" steps done …` → `runCommand` resolves the active run, appends an `engine-call` row, runs the verb, returns 0.
2. `steps done` writes its `step-done` row and commits; the `engine-call` rows for that block ride the same commit.
3. Nothing in the run's behaviour changes.

**Flow — an engine command fails unexpectedly.**

1. `runCommand` runs the verb; it returns a non-zero code not declared for that verb (or throws a non-`CommandError`).
2. The seam appends one deduped `friction` row (`category: "tool-failure"`), then returns / rethrows the original code unchanged.
3. The workflow's own Failure Path (if any) proceeds exactly as before; the friction row is the only addition.

**Flow — close.**

1. `workflows close` runs; its own call was journaled on entry.
2. It appends the run's `…-close-workflow` step row, then calls `check(rows, contract)` in-process, then appends the `completeness` row, then `workflow-done`.
3. The close commit carries the `completeness` row into the run's own artifacts.

**Flow — start / resume.**

1. `workflows start` resolves the previous run for the FID (the run before the one being started / resumed).
2. It reads that run's stored `completeness` row, or computes the verdict on the fly when none exists (a failed / abandoned run).
3. It prints one warning line when holey, then proceeds exactly as today — no prompt, no interruption.

**Read surfaces.** `bkit completeness check --workflow= --file=` is the ad-hoc reader (any historical run); `bkit status` / `bkit runs` see the `completeness` row once it rides the run's commit; the CI advisory step sweeps the corpus.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Approach A (evolve `status-holes.ts` in place, one dispatch seam, one checker, rows in the run's `status.jsonl`) leads | B's separate observability store / sidecar; C's install-time compiled contract / manifest | All three lenses converged on A. It satisfies every settled answer (Q4, Q6, Q8, Q10, Q13) with no new artifact family, no schema, no migration and no install-path machinery; Q3 and the "no new parallel detector" constraint both point at one mechanism. |
| The journal seam sits in `commands/lib.ts` `runCommand`, not `cli.ts main()` | A `main()` wrapper (ideate-1); a per-command wrapper | Verified, not assumed: all 22 distinct `"{BKIT}"` calls in the workflow prose are registered `bkit <noun> <verb>` commands (no classic verb is ever called this way), so `runCommand` covers every workflow command — and it is where the noun, verb, flags and the verb's declared `exitCodes` already live. A `main()` wrapper would also have to refactor the classic-verb `process.exit` branches. |
| `engine-call` row written at dispatch **entry**; the friction row on **exit** | Both rows on exit; both on entry | Entry records the *attempt* (a hard-killed command still leaves evidence); exit records the *outcome*. The two rows carry attempt and outcome respectively, and the entry write is what makes the check independent of the command's exit. |
| Attribution is positional (calls between two `step-done` rows belong to the step in progress); the `engine-call` row carries **no** `step` field (Q11 verbatim) | A self-describing `step` on the row (ideate-1 Approach B) | Keeps Q11's shape verbatim. The `--step=` fallback a self-describing row would rely on does not cover `ledgers append`, `branches land`, `repo …` or `status row`, so it is A plus a field, not A minus a mechanism. Revisit if the corpus shows mis-bucketing. |
| `engine-call` + `completeness` rows in the run's `status.jsonl` (Q6, Q8); no separate store | A per-run sidecar file (ideate-3 Approach B); a repo-level stream (ideate-2 Approach B) | Settled (Q6, Q8). The verdict must ride the run's own commit into its own artifacts, which a sidecar loses unless a pointer row lands; the isolation benefit of a sidecar is instead bought inside A by the `MARK_ROWS` reader fix, one time. |
| The `completeness` row carries per-hole evidence (step + missing calls) and a `sourceSha` | A bare `holey` boolean | A bare boolean is useless to a maintainer classifying a hole at 3am; `sourceSha` makes a prose-vs-verdict disagreement diffable rather than mystical. |
| Holes are split into **evidence holes** (a `DONE` step missing required calls), **step holes** (a required step absent from a closed run), and **unexercised** (conditional arms not taken); the warning fires on evidence + step holes only | One flat hole list; warning on any hole | Q10 (every `"{BKIT}"` literal is required) + Q15 (report every hole) make a flat list always non-empty for a clean run (ship names 85 literals, build 102, debug 82), so a warning on any hole fires on nearly every run and dies of fatigue within a release. The split honours Q15's full report while keeping the warning signal. **Acceptance Scenario criterion 2 changed** ("holey" pinned to evidence + step holes). Flagged for owner confirmation. |
| A run with zero `engine-call` rows gets a **steps-only** verdict labelled `preJournal: true` | Evaluate every run uniformly | Without the carve-out, the first resume after upgrade flags every historical run holey at once — the exact noise-at-rollout failure `384-tier3-promotion` exists to avoid. |
| The friction **exclusion set is derived** from the verb's declared `exitCodes` spec plus `SHARED_EXIT_CODES`, not the literal `{3, 8, 9, 80, 81}` | Q5's literal list; the literal list ∪ declared codes | **Departs from Q5** — flagged. The literal set is not exhaustive: exits 1 (`NO`), 2 (`USAGE`) and 82 (`NEEDS_HUMAN`) are routine, and exits 4-7 / 10-16 are other verbs' own codes, so the literal set writes a `tool-failure` row on a failed gate, a usage error and a re-ask route — the noise that gets a detector muted. A derived set is self-maintaining as verbs add routing codes. The trade: exits a verb declares but that represent real failures (e.g. `workflows close` exit 1 "close commit failed") are not recorded. See `Risks & Open Questions`. |
| Friction dedup `key` = `<noun>-<verb>/<step>`, where `step` comes from the failing command's own `--step=` flag when present, else degrades to `<noun>-<verb>` | `resumePoint` inference of the run's current step; a `BKIT_STEP` env contract across every workflow block | **Partial departure from Q16** — flagged. Q16 assumes the step is knowable; the engine layer has no intrinsic current-step value, and an env contract would mean editing every fenced block of every workflow (drift-prone prose work). Degrading the key keeps dedup correct where knowable and conservative where not. `resumePoint` is the fallback if the corpus shows the degradation loses too much. See `Risks & Open Questions`. |
| The friction row is written through `appendLedgerRows(root, "friction", rows)` with `by.workflow` = the active run's workflow — **no `KIND_WRITERS` change** | Adding an `engine` writer to `KIND_WRITERS` + the `.bkit/jsonl.md` writers table + `telemetry.test.ts` | `KIND_WRITERS.friction.orchestrators` already lists `{design, plan, build, debug, ship}` and the validator checks `by.workflow` when no subagent is present, so the existing validator admits the row. Ideate-2 / ideate-3 assumed a contract change here; the code does not require one (verified against `ledgers/telemetry.ts`). `.bkit/jsonl.md` still gains a sentence saying the engine writes friction *as* the active workflow. |
| `workflows start` computes the previous run's verdict **on the fly** when no stored `completeness` row exists | Only read stored rows; have `workflows fail` also record a verdict | **Refines Q1** (which names close only). An abandoned / failed run has no close and so no stored row; computing at start is advisory-cheap and covers every run uniformly, and keeps the Failure Path lean (no new failure mode). |
| **"Previous run"** = the run immediately preceding the run being started / resumed in the same `status.jsonl` | The last same-workflow run; the last run carrying a stored `completeness` row | A FID's log holds its design → plan → build → debug → ship runs; "the previous run for that FID" is the one before the current, whatever its workflow, so a holey design warns the plan run. Flagged for confirmation (the input's draft leaves the referent unpinned). |
| No pinned watermark or baseline (Q15) | The pinned-watermark delta of decision `384-tier3-promotion` | Settled (Q15). **Departs from `384-tier3-promotion`** — the design records the departure; the advisory / fail-open posture and the promotion gate are unchanged. See `Risks & Open Questions`. |
| `engine-call` + `completeness` added to `run-facts.ts` `MARK_ROWS` | Leave readers as-is | Both rows carry `workflow`, so `runStatusRows` admits them and `stepsBlock` would chop every step's minutes; the harvest `afterEnd` / `lastActivity` / `byRun` windows would shift on post-close rows. One-time, test-pinnable reader surgery. |
| This mechanism **supersedes deferral `442-status-hole-detector-beyond-ship`** (`own-cycle`) | Leave `442` open and build a per-phase model | `442`'s "each of the other four workflows needs its own routing-branch model" premise is dissolved: evidence holes need no path model, and step holes use one generic rule with conditionality read from the md structure. `442` should be closed with a same-`key` append referencing this design. |
| Promotion criteria recorded against `384-tier3-promotion` | Flip to a blocking gate in this cycle | Settled (constraint + deferral `384-promote-status-hole-detector-from-advisory-to-gate`); the check must never change an exit code, block, or fail a workflow (criterion 4). |
| Acceptance Scenario adopted from the draft with criterion 2's "holey" sharpened and a pre-journal carve-out added | Adopt verbatim | Q17 accepted the draft with the "warning only warns" note, which is kept. The two changes make the warning triggerable without fatigue; each is recorded above. |

## Approaches Considered

Three lenses ran; each proposed A / B / C. All three recommended their A, and the three A's are the same shape — the merge takes the strongest parts of each.

<!-- prettier-ignore -->
| Approach | Lens | Verdict | Why |
| --- | --- | --- | --- |
| A — Generalise `status-holes.ts` in place; journal at the dispatch seam; new `completeness` noun | Pragmatic (ideate-1) | KEPT | Lowest net-new infra; every piece has an existing idiom to copy. |
| A — Single dispatch seam + one generalised contract deriver, three separable pure parts | Optimal-tradeoff (ideate-2) | MERGED | Kept: the seam behind one resolve-or-skip interface and the pure deriver/checker split, so a different store or a compiled contract could land later without rewriting the checker. |
| A — Chokepoint journal in the run's own log, runtime structural derivation | Risk premortem (ideate-3) | MERGED | Kept: the reader surgery (`MARK_ROWS`), the pre-journal carve-out, the friction exclusion derived from declared exit codes, the entry/exit row split, the swallowed-write stderr line, and the hole-class split. |
| B — Self-describing journal rows (a `step` on each row) | Pragmatic (ideate-1) | REJECTED | Departs Q11 and does not cover the step-less calls anyway; recorded as the fallback if positional attribution proves wrong in the corpus. |
| B — A separate engine run-observability stream / sidecar file | Optimal-tradeoff (ideate-2), Risk premortem (ideate-3) | REJECTED | Departs Q6 / Q8; the run's own artifacts stop carrying the verdict unless a pointer row lands, and a hard-killed process leaves a store behind but not the pointer. Its isolation benefit is bought inside A by the `MARK_ROWS` fix. Recorded as the fallback if reader surgery proves invasive. |
| C — Verdict rides the existing rows; no new row type and no standalone verb | Pragmatic (ideate-1) | REJECTED | Departs Q6 and Q13; removes ad-hoc re-checking of a historical run, which is the point of the standalone verb, and changes the write order in the one function every phase shares. |
| C — Compile each workflow into a drift-gated contract / frozen expectations manifest at install time | Optimal-tradeoff (ideate-2), Risk premortem (ideate-3) | REJECTED | Departs Q4's runtime derivation and needs an owner-confirmed amendment to `384-tier3-promotion` (a generated gated manifest is not hand-maintained but is not runtime-derived). Best 3am diagnosability of the three — the natural next step if prose-parsing drift proves unmanageable. |

**Risk-premortem mitigations layered onto the chosen approach** (additive, not separate approaches): reader surgery on every `status.jsonl` type-reader; the exclusion set derived from declared exit codes; unexpected non-`CommandError` throws wrapped in the same seam; the pre-journal carve-out; the check self-excluding the `completeness` verb and journaling its own calls before computing; one stderr line per swallowed write; the nested try/finally that must not mask the original exit code.

## Trade-offs Accepted

**Chosen approach — generalise `status-holes.ts`, one dispatch seam, rows in `status.jsonl`.**

- Gain: one mechanism for all five workflows (Q3); no new artifact, schema, migration or install-path machinery; every part reuses an existing idiom; a new phase is its own markdown and a new row type is a line in a table.
- Sacrifice: the journal bloats `status.jsonl` (build names 102 `"{BKIT}"` calls, so ~100 extra rows per run) in a file whose contract is "workflow state SoT"; the `MARK_ROWS` reader fix is load-bearing and a missed reader is silent telemetry corruption. A sidecar (rejected B) would have isolated this at the cost of a second artifact per run.

**Seam on the shared dispatch path.**

- Gain: one code path covers every current and future `bkit <noun> <verb>`; no per-command wrapper.
- Sacrifice: the seam sits on the hot path of every command in every consumer repo, so a bug that escapes the swallow is a CLI-wide outage, not a workflow-only one. Accepted because the fail-safe contract (nested try/finally, total swallow, exit-code passthrough test) is the whole design's load-bearing guarantee.

**Entry/exit row split.**

- Gain: a hard-killed command still leaves attempt evidence; the check is independent of the command's exit.
- Sacrifice: two writes per failed command; "journaled" means _attempted_, not _succeeded_ — a required command that ran but failed still counts as present unless the verdict adds a success axis (it does not, in this cycle).

**Runtime derivation of expectations.**

- Gain: a step renamed or a `"{BKIT}"` literal moved tracks the prose with no engine edit; no hand table (constraint + `384-tier3-promotion`).
- Sacrifice: prose edits silently redefine expectations, and a stored verdict is only meaningful against the markdown at close time. Accepted with `sourceSha` on the row and the replay procedure (re-run against `git show {parentSha}:{workflowMd}`).

**Hole-class split + pre-journal carve-out.**

- Gain: a warning that fires only on real evidence holes, so it survives past one release.
- Sacrifice: the verdict is more than a boolean and its definition of "holey" must be documented and held stable; a reader who wants "any difference from the prose" reads the `unexercised` list, not the warning.

**Derived friction exclusion set.**

- Gain: no false `tool-failure` rows on routine exits; self-maintaining as verbs add routing codes.
- Sacrifice: exits a verb declares but that are real failures (e.g. `workflows close` exit 1) are not recorded — a deliberate false-negative in exchange for eliminating the false-positives that mute detectors.

**Degrading friction dedup key.**

- Gain: no env contract across five workflows; dedup correct where the step is knowable.
- Sacrifice: calls with no `--step=` (`ledgers append`, `branches land`, `repo …`, `status row`) collapse to noun+verb, so two different-step failures of the same command update one row.

## Risks & Open Questions

**Risks (accepted / mitigated).**

- **Hot-path seam.** A throw, a slow run-resolve or a wrong attribution in `runCommand` touches every command in every consumer repo. Mitigated by resolve-or-skip, total swallow, one stderr line per swallow, and a test that forces a journal throw and asserts exit-code passthrough — but this is the worst blast radius available to the feature.
- **Attribution mis-bucketing.** Positional attribution (calls between two `step-done` rows) can mis-bucket under a `merge=union` interleave, a step whose row was never written, or a group loop. Fallback recorded: a self-describing `step` on the row (rejected Approach B), or the sidecar (rejected B).
- **Prose-vs-verdict drift.** A step renamed or a `"{BKIT}"` literal moved after a close changes what old runs "should have done"; the stored verdict disagrees with a re-run. Mitigated by `sourceSha` and the documented replay (`git show {parentSha}:{workflowMd}`); tripwire = one fixture per workflow per path.
- **Path-conditionality derivation brittleness.** Step-hole correctness rests on reading conditionality from the md structure (`Failure Path` / `Route:` / "Path X only"). This is the residual complexity of `442`; mitigated by making those conventions explicit authoring rules (`.bkit/authoring.md` § Workflows Only) and a per-workflow-per-path fixture corpus. Evidence holes — the primary class — do not depend on it.
- **Reader coverage.** `engine-call` + `completeness` rows enter `runStatusRows`; a reader not fixed is silent telemetry corruption that outlives the feature. Mitigated by the `MARK_ROWS` change + an audit of `stepsBlock`, `ciList`, and the harvest `afterEnd` / `lastActivity` / `byRun` windows.
- **Self-reference and ordering.** The check is itself a bkit command run while a run is active. Defined: close journals its own call on entry before computing; the check self-excludes the `completeness` verb from expectations.
- **"Attempted ≠ succeeded".** A required command that ran and failed still counts as present; the verdict has no success axis this cycle. Deliberate, but worth revisiting once the corpus exists.
- **Deferral `442-status-hole-detector-beyond-ship`** must be closed (same-`key` append, referencing this design) or it re-surfaces as unbuilt work.

**Open questions.**

1. **Friction exclusion set (departs from Q5).** Which non-zero exits produce a `tool-failure` row?
   - Option A — _derived_: exclude `{0, 1, 80, 81, 82}` (shared routing) ∪ the verb's declared `exitCodes`; everything else (exit 2, undeclared codes, signal deaths, throws) writes a row. Self-maintaining; kills false positives; misses exits a verb declares but that are real failures. **Recommended** — noise is the failure mode that mutes detectors.
   - Option B — Q5-literal ∪ declared codes: noisier (exit 2, other verbs' shared codes write rows) but records more.
   - Option C — Q5-literal `{3, 8, 9, 80, 81}` only: loudest; writes rows on routine exits 1, 2, 4-7, 10-16, 82.
   - Default if unanswered: Option A.
2. **Friction dedup-key step resolution (partial departure from Q16).**
   - Option A — _degrade_: step from the command's own `--step=` when present, else noun+verb. No inference, no drift. **Recommended.**
   - Option B — `resumePoint` inference: name the run's current step from its own rows. More keys carry a step; inference can mis-name under group loops and retries.
   - Option C — `BKIT_STEP` env contract exported per workflow block. Most accurate; means editing every fenced block of every workflow (drift-prone prose work).
   - Default if unanswered: Option A.
3. **"Previous run" referent for the start warning.**
   - Option A — the run immediately preceding the one being started / resumed in the same `status.jsonl`, whatever its workflow. Matches "for that FID". **Recommended.**
   - Option B — the last same-workflow run. Narrower; misses a holey design warning the plan run.
   - Option C — the last run carrying a stored `completeness` row. Skips abandoned runs entirely.
   - Default if unanswered: Option A.
4. **Hole-class split and warning trigger (refines Q15's flat report; changes Acceptance Scenario criterion 2).** Confirm the warning fires on evidence + step holes only, with `unexercised` calls reported but never alarming.
   - Option A — _split_ as designed. Warning stays meaningful; full report preserved. **Recommended.**
   - Option B — flat list, warning on any hole. Simplest; fires on nearly every run, dies of fatigue within a release.
   - Option C — split, but the warning also fires when `unexercised` exceeds a threshold. Middle ground; adds a magic number.
   - Default if unanswered: Option A.
5. **Journal volume in `status.jsonl`.** Accept ~100 extra rows per run in the SoT file, or move the journal to a sidecar (rejected Approach B)?
   - Option A — _keep rows in `status.jsonl`_ (Q8) with the `MARK_ROWS` fix. **Recommended** — settled by Q8; the sidecar's isolation is bought once by the reader fix.
   - Option B — sidecar `engine-calls.jsonl` beside `status.jsonl`; needs a new artifact in `.agents/docs.md` / `.bkit/jsonl.md` / harvest. Better isolation; doubles the union-merge surface; departs Q8.
   - Default if unanswered: Option A, and revisit if the reader surgery proves invasive in build.
6. **Pre-journal carve-out.** Confirm a run with zero `engine-call` rows gets a steps-only `preJournal` verdict rather than being flagged holey.
   - Option A — _carve out_ as designed. **Recommended** — avoids flagging every historical run on the first resume after upgrade.
   - Option B — evaluate all runs uniformly. Simpler; floods at rollout.
   - Default if unanswered: Option A.
7. **Departure from `384-tier3-promotion`'s pinned watermark (Q15).** Confirm no watermark / baseline: the check reports every hole on every run.
   - Option A — _no watermark_ (Q15). **Recommended** — settled; the advisory / fail-open posture and the promotion gate are unchanged, and the warning is scoped by question 4.
   - Option B — reinstate the pinned-watermark delta. Matches `384-tier3-promotion` verbatim; needs a watermark artifact and a delta computation.
   - Default if unanswered: Option A (recorded as a departure in `docs/decisions.jsonl`).
8. **Reader-surgery scope.** Add both new row types to `MARK_ROWS` only, or audit every `status.jsonl` reader?
   - Option A — `MARK_ROWS` + a targeted audit of `stepsBlock`, `ciList`, and the harvest `afterEnd` / `lastActivity` / `byRun` windows. **Recommended.**
   - Option B — `MARK_ROWS` only. Smallest change; risks a missed reader.
   - Default if unanswered: Option A.
