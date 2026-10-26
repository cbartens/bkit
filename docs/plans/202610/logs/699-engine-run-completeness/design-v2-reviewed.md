Verdict: PASS
<!-- verdict:end -->

# Design: Engine run completeness check + auto friction on engine errors

## Related Issues

None from the prior-incident scan (`related-issues.md` = `None`). The issue body cites three non-duplicate closed references, reused here as prior art, not as open incidents:

- #331 — WS-G2: silent-corruption gates at ship and milestone end (closed)
- #676 — Orchestrator work the engine could do as bkit commands (closed)
- #680 — ledgers append: engine writes ledger rows with a minted ts (closed)

## Acceptance Scenario

Adopted from the input's `Draft Acceptance Scenario` (Q17 accepted), with sharpenings recorded as `Decisions` rows: the meaning of "holey" (criterion 2) is pinned to evidence holes + step holes, not every unexercised conditional call; a pre-journal run (zero `engine-call` rows) gets a steps-only verdict rather than being flagged holey; and a step counts as conditional only under the column-0 marker rule the spike settled (C10). No `Test Matrix` here — added at plan time.

### Narrative

As the bkit maintainer I want a workflow run to tell me, in its own artifacts, whether every step and every bkit command it required actually ran — and to record engine friction automatically instead of losing it. When I start or resume a run whose previous run was incomplete, I want to be warned before I build on it.

### Success Criteria

1. One bkit verb (`bkit completeness check --workflow= --file=`) reports, for any design / plan / build / debug / ship run, the steps the workflow markdown requires versus those recorded, and the `"{BKIT}"` commands the markdown names versus those journaled — the expected set derived from the markdown at runtime, never a hand table.
2. A closed run carries its completeness verdict as a `completeness` row in its own `status.jsonl` (a run that closes more than once carries one per close, and the read path takes the last); starting or resuming a run prints a warning when the previous run for that FID was **holey** — holey meaning an _evidence hole_ (a step recorded `DONE` without its required journaled calls) or a _step hole_ (a required step absent from a closed run), never merely an unexercised conditional arm. The warning only ever warns; it never interrupts a workflow once started and never asks to continue.
3. An unexpected non-zero exit of a bkit command while a run is active appends one `friction` row with `category: "tool-failure"` to the **active run's own book root**, deduped by key, carrying a non-empty `by.step` on every path; the documented routing exits never produce one.
4. The journal and the check never change a command's exit code, never block, and never fail a workflow — a failed journal write is swallowed and logged, never raised.
5. The expected command/step set is derived from the workflow markdown at runtime (no hand-maintained table), and the advisory→blocking promotion criteria are recorded against decision `384-tier3-promotion`.

### Key Edge Cases

- Several runs active at once (each in its own worktree): a journaled call attributes to the right run or is not journaled at all — never misattributed (Q12).
- A command run outside the run's worktree (`cd {REPO_ROOT} && bkit branches land`) attributes via its own `--fid` / `--month`, else is skipped.
- Conditional, fallback and retry calls in the prose (`"{BKIT}"` inside a `Route:` / `Failure Path` arm) count as required and are reported as _unexercised_ when not taken; only a step recorded `DONE` missing its calls is an _evidence hole_, and the report lists every hole on every run (no watermark or baseline).
- A run that fails or is abandoned mid-run: completeness must not flag the un-run tail as holes, and a resumed run's earlier rows still count.
- A run that closes more than once (the corpus shows three `build-close-workflow` rows on one run) writes one `completeness` row per close, and a call journaled after the run's terminator has no "step in progress" to belong to — the verdict names such calls rather than charging them to a step.
- A run with zero `engine-call` rows (pre-journal, or a broken journal): steps-only verdict labelled `preJournal: true` — never "every command missing"; when the closing engine is itself journaling, the verdict additionally carries `journalSuspect: true` and one stderr line, so a dead journal is not mistaken for a historical run.
- Secret or free-text values in a command line (`--token=`, `--error=`) are never journaled — flag names only (Q11).
- The journal write itself failing (read-only tree, full disk) is swallowed; the command still succeeds and one `[bkit-telemetry]` stderr line is emitted, and the heartbeat (`journalSuspect` on a close by a journaling engine that recorded zero `engine-call` rows) keeps the detector from crying wolf when it is itself hurt.
- The `completeness` verb is itself a bkit command run while a run is active: it journals itself and self-excludes from its own expectations **and** from its own `unexpected` list.
- `completeness` and `engine-call` rows landing in `status.jsonl` must not shift step-timing (`MARK_ROWS` — measured: total step minutes 1208.1 → 0.7 without the fix, byte-identical with it); the harvest's `afterEnd` / `scan.rows` windows do move when journal rows land after a run's terminator, and that shift is accepted and documented.

### Process Sketch

- WHEN a bkit command runs while a run is active → THEN one `engine-call` row (noun, verb, flag names) is appended to that run's `status.jsonl` at dispatch entry, and nothing else changes.
- WHEN a bkit command exits non-zero for a reason other than a declared routing code → THEN one `friction` row with `category: "tool-failure"` is appended to the active run's own book root, deduped by key (raising `recurrenceCount` on a recurrence).
- WHEN a workflow closes a run → THEN the completeness verb compares recorded steps and journaled calls against the workflow markdown and appends a `completeness` row before the `workflow-done` row; a second close appends a second row.
- WHEN a workflow starts or resumes a run → THEN it prints a warning if the previous run for that FID was holey, and continues either way.
- WHEN the check finds a step recorded `DONE` without its required calls → THEN the verdict names the step and the missing calls, and nothing fails.
- WHEN the check runs → THEN it reports every hole it finds for that run, with no baseline or watermark.
- WHEN the check or its row append throws at close or at start → THEN the call site logs one line and degrades, and the workflow proceeds unchanged.
- WHEN a run closes under a journaling engine having recorded zero `engine-call` rows → THEN the verdict carries `preJournal: true` and `journalSuspect: true`, and one stderr line names the suspect journal.

## Reuse & Prior Art

Searched: `.bkit/core/engine/checks/`, `.bkit/core/engine/commands/` (+ `workflow/`, `registry.ts`, `lib.ts`), `.bkit/core/engine/audits/workflows/`, `.bkit/core/engine/ledgers/` (+ `telemetry.ts`, `status.ts`), `.bkit/core/engine/cli.ts`, `.bkit/workflows.md`, `.bkit/jsonl.md`, `.bkit/authoring.md`, `docs/testing.md`, `docs/observability.md`, `docs/capabilities.md`, `scripts/harvest/`, `.github/workflows/bkit-ci.yml`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`.

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| md-derived expected set + advisory report | `.bkit/core/engine/checks/status-holes.ts` (`deriveExpectedStepSetFromSource`, `checkSourceCanonicalDrift`, `classifyRun`, `computeMandatoryForPath`, `detectHoles`, `formatAdvisoryReport`, exit-0 `main`), unit-tested, CI-wired | EXTEND | Generalise in place to all five workflows — the constraint forbids a second detector; the ship path sets are replaced, not duplicated. Hard-coded to `ship-`: a literal `(?:step:"\|--step=)(ship-[a-z-]+)` regex plus a frozen `SHIP_STEP_ORDER` and three ship-only skip sets, so generalising means parameterising the prefix and swapping the canonical set for the deduped `WORKFLOW_STEPS[workflow]`. `classifyRun` / `computeMandatoryForPath` are ship path-model and stay ship-shaped. |
| md section + `"{BKIT}"` call parser | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` (`stepSections`, `callWords`, `unknownCalls`) | EXTEND | Promote `stepSections` / `callWords` (pure text helpers) out of the test into the check module; the test imports them back, so one parse serves both. `unknownCalls` stays in the test — it imports `COMMANDS` from `commands/registry`, and `checks/` must not gain a `checks → commands/registry` edge that pulls all 24 command modules into the check. |
| Step universe (numbers, titles, `--step=` keys) | `.bkit/core/engine/commands/workflow/step-table.ts` (`WORKFLOW_STEPS`) | EXTEND | Already held to the md headings and `--step=` calls by `workflow-shape.test.ts`; drift-gated, so not a second source of truth. The cross-check compares against the **deduped** table (spike C15: build 15 sections vs 19 entries, ship 14 vs 16 — the table repeats group-loop steps). `resumeAt` / `resumeOnVerdict` encode *resume* semantics, not *skip* semantics, and reach none of the 23 conditional sites. |
| `status.jsonl` read / write | `commands/workflow/status.ts` (`readStatusRows`, `readStatusEvents`, `readRuns`, `FILE_FLAG`, `WORKFLOW_FLAG`), `ledgers/status.ts` (`appendLine`, `fold`, `statusTimestamp`) | EXTEND | The journal row and the verdict row ride the existing readers / writers. `readStatusRows` accepts any `type` and `fold` ignores unknown types (spike C7: a fold over rows carrying both new types returns the run's status unchanged). |
| Dedup-by-key idiom | `ledgers/status.ts` (`actionKey`, `actionHash`, `alreadyDone`, `recordAction`, `ENGINE_ACTION`) is the `engine-action` guard; friction dedup is `ledgers/telemetry.ts` `identity()` (`kind + repo + key`) + same-key append | ADAPT | The `engine-action` idiom does **not** apply to friction (guard vs journal). `recurrenceCount` is declared and computed by nothing (two grep hits: the declaration and a test fixture), so the seam must read the prior same-`key` row and write `recurrenceCount + 1`; `appendLedgerRows` never reads back. |
| Friction ledger write | `commands/workflow/ledgers.ts` `appendLedgerRows`; `ledgers/telemetry.ts` `validate` / `writerProblem` / `mintTs` / `APPEND_LEDGERS` | EXTEND | `appendLedgerRows` mints `ts`, re-runs `validate` then `writerProblem`, and **throws** on either refusal; `validate` requires the append-time envelope (`schema: 3`, `ts`, `kind`, `repo`, `bkit`, `by`) and a non-empty `by.step` (spike C5). It also imports `../lib.js`, so the seam composes the row from the `ledgers/telemetry.ts` primitives instead. `KIND_WRITERS.friction.orchestrators = {design, plan, build, debug, ship}` admits `by.workflow` = the active run's workflow — no `KIND_WRITERS` change (spike C5 confirms the row is admitted). |
| Command dispatch seam | `commands/lib.ts` `runCommand` (the single dispatch for all 24 registered nouns; `spec.exitCodes` in scope) + `EXIT`, `SHARED_EXIT_CODES` | EXTEND | Verified by probe, not assumed (spike C1): 358 `"{BKIT}"` call sites across the six workflow mds use 21 distinct nouns and 79 distinct noun+verb pairs; 0 bypass `runCommand`, 0 unknown. 39 sites use the `status` noun, which **is** in `CLASSIC_VERBS`, but each uses a registered `status` verb, so all still route through `runCommand`. |
| Command registration + conventions | `commands/registry.ts` + `commands/conventions.test.ts` | EXTEND | Register the `completeness` noun; the new command ships `completeness.test.ts` beside it, is reachable from `COMMANDS`, and lists every exit code its source can return. |
| Run attribution with no new state | `lib.ts` `statusLocation` / `statusRelPath`; `locks.ts` (`resolveMonth`, `monthBuckets`, `workflowLockPath`, `readRunsLenient`); `fids.ts` (`logged`, `freeFid`) | ADAPT | No helper answers "the active run from this cwd"; the pattern exists FID-scoped (`fids.ts`), so a cwd-scoped scan must walk months × FIDs and `fold` each log. Measured (spike C3): 4.23 ms/call (0.40 ms scan + 3.83 ms git spawn), 188 of 357 call sites needing it; from the main checkout it finds no active run, so an out-of-worktree call is skipped, never misattributed (Q12). |
| Current-step resolution for the friction key | `step-table.ts` `resumePoint` (used by `status resume`) | ADAPT | Exists and works, but is inference; the design uses the failing command's own `--step=` else the `<noun>-<verb>` sentinel (Q16 departure, flagged). |
| `status.jsonl` row-type table | `.bkit/workflows.md` § `status.jsonl` — Row type table | EXTEND | Add the two new row types to the documented table. |
| Step-timing + harvest run windows | `commands/workflow/run-facts.ts` `MARK_ROWS`, **a second copy in `scripts/harvest/bkit-harvest.mjs`** pinned equal by `bkit-harvest.test.mjs`, plus `splitRuns` (`run.last` on every non-start row) and `runRows` (`lastActivity` derives from it) | EXTEND | Both copies plus the parity test change together, or the harvest test fails. Measured (spike C6): without the fix, total step minutes 1208.1 → 0.7; with it, byte-identical to baseline. The harvest's `afterEnd` moves (2 → 6 on the probe run) when journal rows land after a run's terminator. |
| Advisory CI wiring | `.github/workflows/bkit-ci.yml` "Check Status Holes" (`pnpm bkit:audit:status \|\| true`); `docs/testing.md` § Tier-3 fail-open advisory channel | EXTEND | Point the advisory step at the generalised check; keep fail-open, add a sweep-summary liveness assertion, and generalise the two sentences in `docs/testing.md` that name `bkit-ship.md` and the ship-only test file. |
| Generated + committed artifacts | `docs/capabilities.md` (graphify rollup, CI-gated) and `dist/` (`pnpm bkit:check:dist`, CI-gated) | EXTEND | Two new modules change both; `pnpm graph:rollup` and `pnpm build` run in the same change. |
| `completeness` command noun + verb | `None` — searched registered commands (`registry.ts`), classic verbs (`cli.ts` `CLASSIC_VERBS`), the `status-holes.ts` CLI (a `tsx` script, not a verb) | NEW | No existing command reports step / command completeness for any phase; the logic must be the extended `status-holes` module, never a reimplementation. |
| `engine-call` + `completeness` row types | `None` — nearest is `engine-action` (`{type, action, key, hash, ref, at}`), a dedup guard written only by the acting verb, requiring key + hash + ref | NEW | Different semantics (guard vs journal); no fit. Both new rows are additive: the fold skips unknown types. |

No capability in the design is served by a second, parallel implementation: the `NEW` rows are a command surface and two additive row types, both required by settled answers Q6 / Q8 / Q13. Every row above is verified against source or probe output; the draft's "22 distinct `"{BKIT}"` calls" figure was wrong (22 is the count of registered noun commands) and reads 358 call sites / 21 nouns / 79 noun+verb pairs here (spike C1).

## Architecture

One mechanism, four parts, each pure and independently testable; every part reuses an existing artifact (see `Reuse & Prior Art`).

1. **Contract deriver** (generalises `checks/status-holes.ts`, new module `checks/completeness.ts` or the evolved `status-holes.ts`). Input: a workflow's markdown text + the workflow name. Output: a contract `{ steps: [{ number, title, stepKey?, requiredCalls: [{noun, verb, flags[]}] }], universe }`.
   - Step sections come from the `## … Step N — Title` headings (the `stepSections` idiom, promoted out of `workflow-shape.test.ts`); the regex matches `###` group-loop headings too, so build's `## Group Loop — Steps 6-8` is covered (spike C15).
   - Per-step required calls come from every `"{BKIT}"` literal inside the step's section (the `callWords` idiom), reduced to `{noun, verb, flag names}` — Q10, no new prose marker. `unknownCalls` stays in the test: it imports `COMMANDS`, and `checks/` must not gain a `checks → commands/registry` edge.
   - The step universe is cross-checked against the **deduped** `WORKFLOW_STEPS[workflow]` (numbers, titles, `--step=` keys); the md-derived set equals it for all five workflows (spike C15); drift is reported, not fatal.
   - **Conditioning is derived, not hand-modelled.** Evidence holes need no path model at all. Step holes use one generic rule, settled by the spike's marker census (C10): a step is conditional when a column-0 `**Run only if**` or `**Skip if**` line sits anywhere inside its section, or its heading carries a `(Path X only)` marker. The census covers all 23 step-level sites across the five workflows (21 `**Run only if**`, 2 `**Skip if**`) with zero over-classification, and no such marker sits outside a step section. The markers the draft first named (`Failure Path` / `Route:` sections plus `resumeAt` / `resumeOnVerdict`) reach 1 of 23 sites; the review's restatement ("first body line" only, `**Skip if**` never a step-level signal) reaches 21 of 23. Both are dropped in favour of the column-0 rule, which becomes an explicit authoring rule (`.bkit/authoring.md` § Workflows Only) with a per-workflow fixture. This dissolves deferral `442-status-hole-detector-beyond-ship`'s "each phase needs its own routing-branch model" premise.

2. **Journal seam** (one hook inside `commands/lib.ts` `runCommand` — the single dispatch point every `bkit <noun> <verb>` passes through; probe C1: 358 `"{BKIT}"` call sites across the six workflow mds, 0 bypass).
   - On dispatch entry (after the verb resolves, before `spec.run`): resolve the active run (Q12 — the command's own `--file`, else `--fid` + `--month`, else the single `IN_PROGRESS` run discoverable from the cwd's git toplevel, scoped to that toplevel and capped, else skip) and append one `engine-call` row (Q11) with `appendLine`. Sync, swallowed on any error, one `[bkit-telemetry]` stderr line per swallow. When a run is active but attribution is ambiguous (more than one `IN_PROGRESS` run and no `--file` / `--fid`), one stderr line names the skip, so a later false evidence hole is explicable rather than suspected; a command run with no run active logs nothing.
   - **Write root.** Every engine write goes to the active run's own **book root** — the root `statusLocation` resolves for the run's `status.jsonl`. Not `repoRoot(cwd)`, which resolves to the main checkout even from `.worktrees/{fid}` (spike C4: a different inode from the run's own `.bkit/friction.jsonl`), so rows would leave the run's tree, dirty the main checkout mid-run, and be sweepable by another `ledgers commit`. The prose's own `bkit ledgers append` already defaults to cwd (the worktree); the engine matches it.
   - On exit: capture the code from `spec.run` / `CommandError.code`; on a non-zero code that is not a _declared routing exit_ (see `Decisions`) and a run is active, append one deduped `friction` row (`category: "tool-failure"`) to that same book root, with `by.workflow` = the active run's workflow. A non-`CommandError` throw takes the same friction path, then rethrows (today it escapes `runCommand` to `main().catch` and would never be recorded).
   - **Row composition.** The seam builds the row from the `ledgers/telemetry.ts` primitives (`validate`, `writerProblem`, `mintTs`, `APPEND_LEDGERS`) — none of which import `lib.ts` — and appends it there, rather than importing `appendLedgerRows`, which imports `../lib.js` and would create a cycle in the engine's most-imported module (the repo ships no cycle detection). The append-time envelope (`schema: 3`, `ts`, `repo`, `bkit`) and the mandatory non-empty `by.step` are the seam's to supply (spike C5).
   - The seam is behind one resolve-or-skip interface and is injectable (via `runCommand`'s existing `io` / `options`), so it is unit-testable in isolation and a different store could be swapped in later.
   - **Fail-safe contract:** nested try/finally around every telemetry write; the seam never alters an exit code, never blocks, never throws; a test forces a journal throw and asserts exit-code passthrough. A refused row is swallowed with one `[bkit-telemetry]` line, never raised.

3. **Checker** (pure): `check(rows, contract) → CompletenessVerdict`. Classifies the run (generalising `classifyRun`), then reports:
   - **evidence holes** — a step recorded `DONE` whose required calls are not in the journal;
   - **step holes** — a step missing from a closed run, at or before the last observed step, and not a conditional step (the column-0 marker rule);
   - **unexercised** — required calls of steps not reached, or conditional steps not taken (reported, non-alarming);
   - **unexpected** — journaled calls or recorded steps not in the contract, excluding the `completeness` verb's own journaled call;
   - **unattributable** — journaled calls with no "step in progress" (after the run's terminator, or under a repeated step name), named rather than charged to a step;
   - **preJournal** — true when the run has zero `engine-call` rows, so the verdict is steps-only and labelled;
   - **journalSuspect** — true when `preJournal` holds and the engine computing the verdict is itself journaling (set only on the close path, never on an on-the-fly start computation), so a dead journal is not read as a historical run.
     The verdict's `holey` flag keys on evidence holes + step holes only. For a run with several `completeness` rows the verdict is the last one, and the check recomputes when rows follow the stored verdict.

4. **`completeness` command** (`bkit completeness check --workflow= --file=`, Q13) — a thin `CommandSpec` in `commands/workflow/completeness.ts`, registered in `registry.ts`; reads `status.jsonl` + the workflow md, emits the verdict, always exits 0 (advisory / fail-open, `docs/testing.md` § Tier-3), and logs its report and heartbeat lines under the module's existing `[bkit-status-holes]` prefix. `--workflow` is optional: the corpus sweep passes files without it, so the check infers each run's workflow from its own rows and never silently no-ops under `|| true`.

**Integration points.**

- `workflows close` calls the checker in-process and appends the `completeness` row to the run's `status.jsonl` **before** the `workflow-done` row, so it rides the close commit into the run's own artifacts (Q6). The spike (C13) disproves the stronger reading: a real corpus run writes `workflow-done` before its own `build-create-pr` / `build-close-workflow` rows and closes three times, so "part of the run, not an after-end row" holds only for the first close — a second close appends a second row, and the read path takes the last.
- Both in-process call sites — the close append and the start warning — are wrapped in the `appendStats` fail-open idiom (`workflows.ts` close path: try/catch → one `[bkit-telemetry]`-style stderr line → degrade to "no completeness row" / "no warning"). A deriver / checker bug or an unreadable workflow md must never fail a close or a start (success criterion 4). A test forces the check to throw and asserts the close still writes `workflow-done` and returns its normal exit code.
- `workflows start` (and resume) reads the previous run's verdict — from its **last** stored `completeness` row when present, else computed on the fly, recomputing when rows follow the stored verdict — and prints one warning line on stderr (`ctx.log`, `[bkit-workflows]`) when holey (Q14); never interrupts, never prompts (Q17). The warning names the previous run (workflow, run number, close time) and the reading command, so on-call is not left context-chasing. Its stdout stays the single output object the prose parses.
- `run-facts.ts` `MARK_ROWS` gains `engine-call` and `completeness`, **and so does the harvest script's own copy** (`scripts/harvest/bkit-harvest.mjs`), with the parity test in `bkit-harvest.test.mjs`; `.bkit/workflows.md` § `status.jsonl` gains both row types.
- The CI advisory step is repointed at the generalised check, keeps `|| true`, and gains a liveness assertion (the sweep must print a summary line); the promotion gate (`384-tier3-promotion`) is unchanged.
- `docs/capabilities.md` is regenerated (`pnpm graph:rollup`) and `dist/` rebuilt and committed (`pnpm bkit:check:dist`) in the same change — both CI-gated.

**Boundaries.** The deriver touches only markdown text; the checker touches only rows + contract; the seam touches only the run's `status.jsonl` and `.bkit/friction.jsonl`, both under the active run's own book root; the command is a reader. Nothing in the mechanism reads or writes a workflow's step state beyond what `status.jsonl` already holds.

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
- The corpus's structural preconditions for that rule hold (spike C11: 4 files, 8 runs, 0/4 files with out-of-order `at` in file order), but 2/8 runs repeat step names (`build-task-red` ×31 in one run) and 2/8 write step rows after `workflow-done` / `workflow-failed` (25 rows). A call with no step in progress is reported as **unattributable**, never charged to a step.
- Identity for `merge=union` de-dup: `(type, workflow, noun, verb, at)` — a resumed/replayed call differs by `at`.

**`completeness` row (Q6)** — one per close (a run that closes more than once carries one per close), appended by `workflows close` before `workflow-done`:

```json
{
  "type": "completeness",
  "workflow": "build",
  "at": "2026-10-26T15:00:00Z",
  "run": 2,
  "verdict": "HOLEY",
  "preJournal": false,
  "journalSuspect": false,
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
  "unattributable": [],
  "sourceSha": "<sha256 of the workflow md at close>"
}
```

- `verdict` is `CLEAN` | `HOLEY`; `holey` (the warning trigger) keys on `evidenceHoles` + `stepHoles` only.
- The row carries **per-hole evidence** (step + the missing calls), never a bare boolean — the 3am diagnosability requirement.
- `sourceSha` makes prose-vs-verdict drift diffable: a re-run of the check against a different md disagrees visibly rather than mystically.
- `preJournal: true` marks a run with zero `engine-call` rows: steps-only verdict, never "every command missing".
- `journalSuspect: true` marks the one case that must not hide behind `preJournal`: a close performed by a journaling engine that recorded zero `engine-call` rows, i.e. a broken journal. It is the feature's liveness signal, emitted with one `[bkit-status-holes]` stderr line, and is never set by an on-the-fly start computation (which cannot tell a broken journal from a historical run).
- One row per close, so a run that closes more than once carries several; the read path takes the last and recomputes when rows follow it.

**`friction` row (Q2, Q5, Q16)** — existing kind and ledger, written by the engine seam to the active run's own book root via the `ledgers/telemetry.ts` primitives:

```json
{
  "kind": "friction",
  "schema": 3,
  "ts": 1770000000001,
  "repo": "<repo fingerprint>",
  "bkit": { "version": "6.x.y" },
  "scope": "bkit-repo",
  "by": { "workflow": "build", "step": "build-plan-verify" },
  "key": "tests-run/build-plan-verify",
  "category": "tool-failure",
  "severity": "MEDIUM",
  "run": { "parentSha": "<the run's parent sha>" },
  "description": "bkit tests run exited 1 (undeclared for this verb) during build-plan-verify"
}
```

- `schema` / `ts` / `repo` / `bkit` are the append-time envelope the writer fills; the draft's example, shown without it, is refused by `validate` (`schema must be 3`) — measured, spike C5.
- `scope` is required by `.bkit/jsonl.md` for friction rows although `validate` does not check it (spike C5); the row carries `bkit-repo`.
- `by.step` is **mandatory and must be non-empty**: the failing command's own `--step=` value when present, else the `<noun>-<verb>` sentinel (`tests-run`) — measured admitted (spike C5). An empty or absent value is refused, thrown by the writer and swallowed — exactly how step-less friction (`ledgers append`, `branches land`, `repo …`, `status row`) would otherwise be lost silently.
- `run.parentSha` joins the row to the run, using the `run` object idiom `compliance` / `counter` / `outcome` rows already carry; `validate` and `writerProblem` reject no top-level key beyond the five named flat ones (`bkitVersion`, `workflow`, `step`, `subagent`, `model`), so the field is admitted (verified at HEAD). Omitted when the run's parent sha is not resolvable at exit.
- `category: "tool-failure"` (existing friction category, `.bkit/jsonl.md` § Categories).
- `key` = `<noun>-<verb>/<step>` where `step` is the `--step=` value else the same `<noun>-<verb>` sentinel; recurrence = same-`key` append, with the seam reading the prior row and writing `recurrenceCount + 1` (nothing computes that field today — two grep hits, the declaration and a test fixture).
- `by.workflow` = the active run's workflow, which `KIND_WRITERS.friction.orchestrators` already admits (spike C5 confirms the row passes `validate` + `writerProblem`).

**No schema migration.** No existing row gains or loses a field; no ledger gains a kind, and the friction row keeps the existing payload contract (`scope` is added to the design's example, not to the schema). The `status.jsonl` row-type table (`.bkit/workflows.md`) and both `MARK_ROWS` copies (`run-facts.ts` and the harvest script) are updated in the same change as the rows first appear.

## Components / Flows

**Modules (all under `.bkit/core/engine/`).**

<!-- prettier-ignore -->
| Unit | Kind | Responsibility |
| --- | --- | --- |
| `checks/status-holes.ts` → `checks/completeness.ts` | Evolved module | `deriveContract(workflowMd, workflow)` (step sections + required calls + deduped `WORKFLOW_STEPS` cross-check + the column-0 conditionality rule) and `check(rows, contract) → verdict`. Keeps the advisory exit-0 CLI for the CI step; logs under `[bkit-status-holes]`. |
| `audits/workflows/workflow-shape.test.ts` | Test (edit) | Imports `stepSections` / `callWords` from the check module instead of holding a copy; keeps `unknownCalls`. |
| `commands/lib.ts` `runCommand` | Seam (edit) | Brackets the dispatch: journal on entry, friction on unexpected non-zero exit / throw, resolve-or-skip attribution against the run's book root, telemetry-primitive row composition, total swallow. |
| `commands/workflow/completeness.ts` | New command | `bkit completeness check --workflow= --file=` — a thin `CommandSpec` over the checker; exit 0 always; infers the workflow per run when `--workflow` is absent. |
| `commands/workflow/completeness.test.ts` | New test | Beside the command (`conventions.test.ts` requires it): exit-code list, no direct stdout / exit, and the verdict cases. |
| `commands/registry.ts` | Edit | Register `completenessCommand`. |
| `commands/workflow/workflows.ts` | Edit | `closeWorkflow` calls the checker and appends the `completeness` row before `workflow-done`, inside the `appendStats` fail-open idiom; `workflows start` prints the previous-run warning on stderr and degrades on any check error. |
| `commands/workflow/run-facts.ts` | Edit | Add `engine-call` + `completeness` to `MARK_ROWS`. |
| `scripts/harvest/bkit-harvest.mjs` (+ `bkit-harvest.test.mjs`) | Edit | The harvest's own `MARK_ROWS` copy and the parity test that pins it to the engine's; audit `splitRuns` / `runRows` `lastActivity`. |
| `.bkit/workflows.md` § `status.jsonl` | Doc edit | Row-type table gains both rows. |
| `docs/observability.md` | Doc edit | The seam's `[bkit-telemetry]` swallow lines and the check's `[bkit-status-holes]` report / heartbeat lines, with their grep patterns. |
| `docs/testing.md` § Tier-3 | Doc edit | Generalise the two sentences naming `bkit-ship.md` and the ship-only test file; record the fixture corpus. |
| `.bkit/jsonl.md` | Doc edit | The engine writes friction *as* the active workflow; the friction row's `scope`. |
| `.bkit/authoring.md` § Workflows Only | Doc edit | The conditionality authoring rule (column-0 `**Run only if**` / `**Skip if**`, `(Path X only)` headings). |
| `.github/workflows/bkit-ci.yml` | Edit | Advisory step repointed at the generalised check, keeping `\|\| true`, plus the sweep-summary liveness assertion. |
| `docs/capabilities.md` + `dist/` | Generated (commit) | Regenerated / rebuilt and committed in the same change (`pnpm graph:rollup`, `pnpm build`). |

**Flow — a step runs (happy path).**

1. A workflow's fenced block calls `"{BKIT}" steps done …` → `runCommand` resolves the active run, appends an `engine-call` row, runs the verb, returns 0.
2. `steps done` writes its `step-done` row and commits; the `engine-call` rows for that block ride the same commit.
3. Nothing in the run's behaviour changes.

**Flow — an engine command fails unexpectedly.**

1. `runCommand` runs the verb; it returns a non-zero code not declared for that verb and not shared (see `Decisions`), or throws a non-`CommandError`.
2. The seam builds one deduped `friction` row (`category: "tool-failure"`, non-empty `by.step`, `run.parentSha`) in the run's own book root, then returns / rethrows the original code unchanged.
3. The workflow's own Failure Path (if any) proceeds exactly as before; the friction row is the only addition.

**Flow — close.**

1. `workflows close` runs; its own call was journaled on entry.
2. It appends the run's `…-close-workflow` step row, then calls `check(rows, contract)` in-process inside a try/catch, then appends the `completeness` row, then `workflow-done`.
3. A checker or append failure logs one `[bkit-telemetry]` line and the close proceeds with no completeness row — never a failed close.
4. The close commit carries the `completeness` row into the run's own artifacts. A run closed more than once carries a row per close (spike C13).

**Flow — start / resume.**

1. `workflows start` resolves the previous run for the FID (the run before the one being started / resumed).
2. It reads that run's **last** stored `completeness` row, recomputes when rows follow it, or computes the verdict on the fly when none exists (a failed / abandoned run) — inside a try/catch that degrades to no warning.
3. It prints one warning line on stderr when holey, naming the run and the reading command, then proceeds exactly as today — no prompt, no interruption.

**Read surfaces.** `bkit completeness check --workflow= --file=` is the ad-hoc reader (any historical run); `bkit status` / `bkit runs` see the `completeness` row once it rides the run's commit; the CI advisory step sweeps the corpus and asserts it printed a summary.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Approach A (evolve `status-holes.ts` in place, one dispatch seam, one checker, rows in the run's `status.jsonl`) leads | B's separate observability store / sidecar; C's install-time compiled contract / manifest | All three lenses converged on A. It satisfies every settled answer (Q4, Q6, Q8, Q10, Q13) with no new artifact family, no schema, no migration and no install-path machinery; Q3 and the "no new parallel detector" constraint both point at one mechanism. |
| The journal seam sits in `commands/lib.ts` `runCommand`, not `cli.ts main()` | A `main()` wrapper (ideate-1); a per-command wrapper | Verified by probe, not assumed (spike C1): 358 `"{BKIT}"` call sites across the six workflow mds use 21 distinct nouns / 79 noun+verb pairs, every one a registered `bkit <noun> <verb>`, 0 bypassing `runCommand` — and it is where the noun, verb, flags and the verb's declared `exitCodes` already live. A `main()` wrapper would also have to refactor the classic-verb `process.exit` branches. |
| `engine-call` row written at dispatch **entry**; the friction row on **exit** | Both rows on exit; both on entry | Entry records the *attempt* (a hard-killed command still leaves evidence); exit records the *outcome*. The two rows carry attempt and outcome respectively, and the entry write is what makes the check independent of the command's exit. |
| Attribution is positional (calls between two `step-done` rows belong to the step in progress); the `engine-call` row carries **no** `step` field (Q11 verbatim) | A self-describing `step` on the row (ideate-1 Approach B) | Keeps Q11's shape verbatim. The `--step=` fallback a self-describing row would rely on does not cover `ledgers append`, `branches land`, `repo …` or `status row`, so it is A plus a field, not A minus a mechanism. The corpus's preconditions hold (spike C11: 0/4 files with out-of-order `at`), but 2/8 runs repeat step names and 2/8 write step rows after the terminator, so calls with no step in progress are reported **unattributable** rather than charged. Revisit if the corpus shows mis-bucketing. |
| `engine-call` + `completeness` rows in the run's `status.jsonl` (Q6, Q8); no separate store | A per-run sidecar file (ideate-3 Approach B); a repo-level stream (ideate-2 Approach B) | Settled (Q6, Q8). The verdict must ride the run's own commit into its own artifacts, which a sidecar loses unless a pointer row lands; the isolation benefit of a sidecar is instead bought inside A by the `MARK_ROWS` reader fix, one time. |
| The `completeness` row carries per-hole evidence (step + missing calls) and a `sourceSha` | A bare `holey` boolean | A bare boolean is useless to a maintainer classifying a hole at 3am; `sourceSha` makes a prose-vs-verdict disagreement diffable rather than mystical. |
| Holes are split into **evidence holes** (a `DONE` step missing required calls), **step holes** (a required step absent from a closed run), and **unexercised** (conditional arms not taken); the warning fires on evidence + step holes only | One flat hole list; warning on any hole | Q10 (every `"{BKIT}"` literal is required) + Q15 (report every hole) make a flat list always non-empty for a clean run (ship names 85 literals, build 102, debug 82), so a warning on any hole fires on nearly every run and dies of fatigue within a release. The split honours Q15's full report while keeping the warning signal. **Acceptance Scenario criterion 2 changed** ("holey" pinned to evidence + step holes). Flagged for owner confirmation. |
| A run with zero `engine-call` rows gets a **steps-only** verdict labelled `preJournal: true`, plus `journalSuspect: true` when the closing engine is itself journaling | Evaluate every run uniformly | Without the carve-out, the first resume after upgrade flags every historical run holey at once — the exact noise-at-rollout failure `384-tier3-promotion` exists to avoid. The carve-out alone would hide a broken journal (review-2 FM14), so the close path adds the heartbeat: a close by a journaling engine that recorded zero `engine-call` rows sets `journalSuspect` and logs one `[bkit-status-holes]` line. The false positive is bounded (a run started before the upgrade and closed after it) and never says "holey". |
| The friction **exclusion set is derived** from `SHARED_EXIT_CODES` (`{0, 1, 2, 80, 81, 82}`) ∪ the verb's declared `exitCodes`, not the literal `{3, 8, 9, 80, 81}` | Q5's literal list; the literal list ∪ declared codes; the draft's derived set that excluded only `{0, 1, 80, 81, 82}` | **Departs from Q5** — flagged. The literal set is not exhaustive: exits 1 (`NO`), 2 (`USAGE`) and 82 (`NEEDS_HUMAN`) are routine, and exits 4-7 / 10-16 are other verbs' own codes, so the literal set writes a `tool-failure` row on a failed gate, a usage error and a re-ask route — the noise that gets a detector muted. The draft's derived set kept exit 2, which contradicts that rationale: exit 2 is thrown by `parseFlags` for an unknown / duplicate / missing flag and by `refuseUnsubstituted` for a `{UPPER}` placeholder left in workflow prose — routine authoring mistakes. Verified: `SHARED_EXIT_CODES` is exactly `{0, 1, 2, 80, 81, 82}`. A derived set is self-maintaining as verbs add routing codes. The trade: exits a verb declares but that represent real failures (e.g. `workflows close` exit 1 "close commit failed") are not recorded. See `Risks & Open Questions`. |
| Friction `by.step` = the failing command's own `--step=` when present, else the `<noun>-<verb>` sentinel; dedup `key` = `<noun>-<verb>/<step>` over the same value | `resumePoint` inference of the run's current step; a `BKIT_STEP` env contract across every workflow block; an empty / omitted `by.step` | **Partial departure from Q16** — flagged. Q16 assumes the step is knowable; the engine layer has no intrinsic current-step value, and an env contract would mean editing every fenced block of every workflow (drift-prone prose work). `validate` **requires** a non-empty `by.step`, so an omitted value makes the row refused, thrown and swallowed — silently losing exactly the step-less friction the feature exists to surface (spike C5: `by.step: ""` REFUSED, `by.step: "tests-run"` admitted). `resumePoint` is the fallback if the corpus shows the sentinel loses too much. See `Risks & Open Questions`. |
| The friction row is composed from the `ledgers/telemetry.ts` primitives (`validate`, `writerProblem`, `mintTs`, `APPEND_LEDGERS`) and appended to the **active run's own book root**, with `by.workflow` = the active run's workflow — **no `KIND_WRITERS` change** | Importing `appendLedgerRows` from the seam; writing through `repoRoot(cwd)`; adding an `engine` writer to `KIND_WRITERS` + the `.bkit/jsonl.md` writers table + `telemetry.test.ts` | `appendLedgerRows` imports `../lib.js`, so calling it from `lib.ts` cycles the engine's most-imported module in a repo with no cycle detection. `KIND_WRITERS.friction.orchestrators` already lists `{design, plan, build, debug, ship}` and the validator checks `by.workflow` when no subagent is present, so the existing validator admits the row — no contract change (verified against `ledgers/telemetry.ts`; spike C5 confirms). The root must be the run's own book root, not `repoRoot(cwd)`: from inside `.worktrees/{fid}` `repoRoot` resolves to the **main checkout**, a different file from the run's own `.bkit/friction.jsonl` (spike C4: different inodes), outside the run's commits and exposed to another `ledgers commit`. `.bkit/jsonl.md` still gains a sentence saying the engine writes friction *as* the active workflow. |
| `workflows start` computes the previous run's verdict **on the fly** when no stored `completeness` row exists, and reads the **last** row when one does | Only read stored rows; have `workflows fail` also record a verdict | **Refines Q1** (which names close only). An abandoned / failed run has no close and so no stored row; computing at start is advisory-cheap and covers every run uniformly, and keeps the Failure Path lean (no new failure mode). The spike (C13) shows a real run writes `workflow-done` before its own final step rows and closes three times, so the last row wins and the check recomputes when rows follow the stored verdict. |
| **"Previous run"** = the run immediately preceding the run being started / resumed in the same `status.jsonl` | The last same-workflow run; the last run carrying a stored `completeness` row | A FID's log holds its design → plan → build → debug → ship runs; "the previous run for that FID" is the one before the current, whatever its workflow, so a holey design warns the plan run. Flagged for confirmation (the input's draft leaves the referent unpinned). |
| No pinned watermark or baseline (Q15) | The pinned-watermark delta of decision `384-tier3-promotion` | Settled (Q15). **Departs from `384-tier3-promotion`** — the design records the departure; the advisory / fail-open posture and the promotion gate are unchanged. See `Risks & Open Questions`. |
| `engine-call` + `completeness` added to **both** `MARK_ROWS` copies (`run-facts.ts` and `scripts/harvest/bkit-harvest.mjs`) + the parity test, with `splitRuns` / `lastActivity` audited | Leave readers as-is | Both rows carry `workflow`, so `runStatusRows` admits them and `stepsBlock` would chop every step's minutes; the harvest's own copy is asserted equal to the engine's by `bkit-harvest.test.mjs`, so it must change in the same commit. Measured (spike C6): 1208.1 total step minutes → 0.7 without the fix, byte-identical with it; the harvest's `afterEnd` moves 2 → 6 when journal rows land after a terminator — accepted and documented. |
| This mechanism **supersedes deferral `442-status-hole-detector-beyond-ship`** (`own-cycle`) | Leave `442` open and build a per-phase model | `442`'s "each of the other four workflows needs its own routing-branch model" premise is dissolved: evidence holes need no path model, and step holes use one generic rule with conditionality read from the md's column-0 markers. `442` should be closed with a same-`key` append referencing this design. |
| Promotion criteria recorded against `384-tier3-promotion` | Flip to a blocking gate in this cycle | Settled (constraint + deferral `384-promote-status-hole-detector-from-advisory-to-gate`); the check must never change an exit code, block, or fail a workflow (criterion 4). |
| Acceptance Scenario adopted from the draft with criterion 2's "holey" sharpened and a pre-journal carve-out added | Adopt verbatim | Q17 accepted the draft with the "warning only warns" note, which is kept. The two changes make the warning triggerable without fatigue; each is recorded above. |
| Step-hole conditionality keys on **any column-0 `**Run only if**` / `**Skip if**` inside the step's section, or a `(Path X only)` heading marker** | The draft's named sources (`Failure Path` / `Route:` sections + `resumeAt` / `resumeOnVerdict`); review-1 CRITICAL 1's restatement (first body line only, `**Skip if**` never a step-level signal) | **Both alternatives are disproven by probe output.** The draft's sources reach 1 of 23 conditional sites (spike C8: design Step 7, build Step 8, build Steps 12-15, debug Steps 4-11, ship Steps 11-13 all missed); review-1's restatement misses 2 of 23 (spike C9: design Step 11's markers follow a `<!-- bkit:tracker true start -->` line, and build Step 5's step-level signal *is* `**Skip if**`). The column-0 rule covers 23/23 with 0 over-classification and no marker outside a step section (spike C10: 21 `**Run only if**`, 2 `**Skip if**`). Evidence outranks the review's wording; the finding's *intent* — name the marker, make it an authoring rule, pin it with a per-workflow fixture — is kept. |
| Every engine write targets the **active run's own book root** (`statusLocation`'s root), never `repoRoot(cwd)` | `repoRoot(cwd)` (the draft's natural reading of `appendLedgerRows(root, …)`) | Spike C4: from inside `.worktrees/{fid}`, `repoRoot` resolves to the main checkout — `repoRoot == worktree toplevel: false`, and the two `.bkit/friction.jsonl` files have different inodes. Rows written there never ride the run's commits, dirty the main checkout mid-run and are sweepable by another `ledgers commit`. The prose's own `bkit ledgers append` already defaults to cwd, so the engine matches it. |
| The seam's stderr lines reuse `[bkit-telemetry]` (write failures) and the check's reuse `[bkit-status-holes]` (report + heartbeat) | A new `[bkit-journal]` / `[bkit-completeness]` prefix | `docs/observability.md` says a new prefix comes only with a new module or command noun, else reuse the owning module's prefix; the seam is not a noun, and the check is the same module generalised. Both prefixes are already registered and the brackets are load-bearing for consumer log-drain grep keys, so `docs/observability.md` gains the lines and their grep patterns in the same change. A rename to `[bkit-completeness]` stays a one-line registry edit if the module is renamed. |
| The friction row carries `run.parentSha` as a run join | `by`-only rows (the draft's shape) | `compliance` / `counter` / `outcome` rows already carry a `run` object, and `validate` rejects no top-level key beyond the five named flat ones (`bkitVersion`, `workflow`, `step`, `subagent`, `model`), so the join is admitted (verified at HEAD; spike C5's six row variants all passed or failed on other fields). Without it a `tool-failure` row cannot be correlated back to the run or the CI that produced it. Omitted when the parent sha is not resolvable at exit. |
| The friction row's `by.step` is never empty: `--step=` else the `<noun>-<verb>` sentinel | Leave `by.step` unset on the step-unknown path | Spike C5: `by.step: ""` is REFUSED (`by.step must be a non-empty string`), and `appendLedgerRows` throws on refusal, which the seam swallows — so the design as written writes no friction row on exactly the calls it expects to degrade. The sentinel (`tests-run`) is admitted. |
| Close and start wrap the checker and its row append in the `appendStats` fail-open idiom | Let the check run bare in `closeWorkflow` / `workflows start` | Success criterion 4 ("never fail a workflow") is otherwise an intent with no mechanism on the two in-process call sites: a deriver / checker bug or an unreadable md would fail every phase close and every start in every consumer repo (review-2 FM9 / FM10). Degrade to "no completeness row" / "no warning" with one logged line, and pin it with a test that forces the check to throw. |
| The journal heartbeat: a close by a journaling engine with zero `engine-call` rows sets `journalSuspect: true` and logs one line | Nothing (the draft's asserted-but-unmechanised "heartbeat invariant"); a stats counter | Review-2 FM14: the pre-journal carve-out makes a dead journal look exactly like a historical run, so the feature's primary signal can be dead with nothing to alert on. The close path is the only place that knows the closing engine journals, so it is the only place the signal is honest; an on-the-fly start verdict never sets it. |
| The read path takes the **last** `completeness` row for a run and recomputes when rows follow it | Trust the first row; assume one close per run | Spike C13: a real corpus run writes `workflow-done` before its own `build-create-pr` / `build-close-workflow` rows and records three `build-close-workflow` rows — three closes. "Part of the run, not an after-end row" holds only for the first close; a later row would otherwise be ignored or read as an after-end artefact. |
| `docs/capabilities.md` is regenerated (`pnpm graph:rollup`) and `dist/` rebuilt and committed in the same change | Land the source and let CI catch the gates | Both are CI-gated (`graphify` rollup drift; `pnpm bkit:check:dist` = `rm -rf dist && tsc && git diff --exit-code dist/`); two new modules change both. |
| The draft's "22 distinct `"{BKIT}"` calls" figure is corrected to 358 call sites / 21 distinct nouns / 79 noun+verb pairs / 24 registered nouns, 0 bypasses | Keep the draft's figure | The count was wrong (22 is the registered-noun count) and the verification conclusion is unchanged; the correction keeps the "verified, not assumed" claim honest (spike C1). |

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

**Risk-premortem mitigations layered onto the chosen approach** (additive, not separate approaches): reader surgery on every `status.jsonl` type-reader, in both `MARK_ROWS` copies; the exclusion set derived from `SHARED_EXIT_CODES` ∪ declared exit codes; unexpected non-`CommandError` throws wrapped in the same seam; the pre-journal carve-out plus its `journalSuspect` heartbeat; the check self-excluding the `completeness` verb from its own expectations **and** its `unexpected` list; one `[bkit-telemetry]` stderr line per swallowed write; the nested try/finally that must not mask the original exit code. Five of these are not preferences but corrections the spike forced — C4 (write root), C5 (row shape), C8 / C9 (conditionality), C13 (close ordering) — each recorded in `Decisions`; none changes the approach.

## Trade-offs Accepted

**Chosen approach — generalise `status-holes.ts`, one dispatch seam, rows in `status.jsonl`.**

- Gain: one mechanism for all five workflows (Q3); no new artifact, schema, migration or install-path machinery; every part reuses an existing idiom; a new phase is its own markdown and a new row type is a line in a table.
- Sacrifice: the journal bloats `status.jsonl` (build names 104 `"{BKIT}"` literals, so up to ~100 extra rows per run — the probe's 59-row run grew to 116 rows) in a file whose contract is "workflow state SoT"; the `MARK_ROWS` reader fix is load-bearing in two files and a missed reader is silent telemetry corruption (measured: 1208.1 total step minutes → 0.7 without it); and journal rows landing after a run's terminator move the harvest's `afterEnd` / `scan.rows` (2 → 6 on the probe run), an accepted, documented shift. A sidecar (rejected B) would have isolated all of this at the cost of a second artifact per run.

**Seam on the shared dispatch path.**

- Gain: one code path covers every current and future `bkit <noun> <verb>`; no per-command wrapper.
- Sacrifice: the seam sits on the hot path of every command in every consumer repo, so a bug that escapes the swallow is a CLI-wide outage, not a workflow-only one. Accepted because the fail-safe contract (nested try/finally, total swallow, exit-code passthrough test) is the whole design's load-bearing guarantee.

**Entry/exit row split.**

- Gain: a hard-killed command still leaves attempt evidence; the check is independent of the command's exit.
- Sacrifice: two writes per failed command; "journaled" means _attempted_, not _succeeded_ — a required command that ran but failed still counts as present unless the verdict adds a success axis (it does not, in this cycle).

**Runtime derivation of expectations.**

- Gain: a step renamed or a `"{BKIT}"` literal moved tracks the prose with no engine edit; no hand table (constraint + `384-tier3-promotion`); and the derived set is drift-gated against the deduped `WORKFLOW_STEPS` (spike C15: equal for all five workflows), so a prose edit that moves a step trips the existing shape test as well as `sourceSha`.
- Sacrifice: prose edits silently redefine expectations, and a stored verdict is only meaningful against the markdown at close time. Accepted with `sourceSha` on the row and the replay procedure (re-run against `git show {parentSha}:{workflowMd}`).

**Hole-class split + pre-journal carve-out.**

- Gain: a warning that fires only on real evidence holes, so it survives past one release; and the carve-out keeps the first post-upgrade resume from flooding.
- Sacrifice: the verdict is more than a boolean and its definition of "holey" must be documented and held stable; a reader who wants "any difference from the prose" reads the `unexercised` list, not the warning. The carve-out would also hide a dead journal, so the close path carries the `journalSuspect` heartbeat and one stderr line — a second label to document, in exchange for the feature's primary signal being alertable.

**Derived friction exclusion set.**

- Gain: no false `tool-failure` rows on routine exits — including exit 2 (`USAGE`), which `parseFlags` and `refuseUnsubstituted` throw on routine authoring mistakes — and self-maintaining as verbs add routing codes.
- Sacrifice: exits a verb declares but that are real failures (e.g. `workflows close` exit 1) are not recorded — a deliberate false-negative in exchange for eliminating the false-positives that mute detectors.

**Friction write root pinned to the run's own book root.**

- Gain: friction rides the run's own commits and lands in the same tree as the run's `status.jsonl`, so the harvest reads it with the run; no dirty main checkout mid-run, no sweep by another `ledgers commit`.
- Sacrifice: the seam must resolve the run before it can write, so a call that cannot be attributed writes nothing — the journal and the friction row share one attribution step, and a resolve failure loses both (the pre-journal / `journalSuspect` signal covers the journal half).

**Degrading friction dedup key.**

- Gain: no env contract across five workflows; dedup correct where the step is knowable, and `by.step` always non-empty so the row is never refused.
- Sacrifice: calls with no `--step=` (`ledgers append`, `branches land`, `repo …`, `status row`) collapse to noun+verb, so two different-step failures of the same command update one row; and the sentinel appears in `by.step` where a real step name would be, so a reader must know the sentinel.

## Risks & Open Questions

**Risks (accepted / mitigated).**

- **Hot-path seam.** A throw, a slow run-resolve or a wrong attribution in `runCommand` touches every command in every consumer repo. Measured cost is small (spike C3: 4.23 ms/call — 0.40 ms scan + 3.83 ms git spawn — with 188 of 357 call sites needing the scan); mitigated by resolve-or-skip, total swallow, one `[bkit-telemetry]` line per swallow, and a test that forces a journal throw and asserts exit-code passthrough. It is still the worst blast radius available to the feature, and its fail-safe contract is `Unsettled` (spike C2) — see open question 10.
- **Attribution mis-bucketing.** Positional attribution (calls between two `step-done` rows) can mis-bucket under a `merge=union` interleave, a step whose row was never written, or a group loop. The corpus's structural precondition holds (spike C11: 0/4 files with out-of-order `at` in file order), but 2/8 runs repeat step names (`build-task-red` ×31 in one run) and 2/8 write step rows after the terminator (25 rows), so such calls are reported **unattributable** rather than charged. End-to-end correctness stays `Unsettled` (spike C12) — see open question 9. Fallback recorded: a self-describing `step` on the row (rejected Approach B), or the sidecar (rejected B).
- **Prose-vs-verdict drift.** A step renamed or a `"{BKIT}"` literal moved after a close changes what old runs "should have done"; the stored verdict disagrees with a re-run. Mitigated by `sourceSha`, the drift-gated `WORKFLOW_STEPS` cross-check, and the documented replay (`git show {parentSha}:{workflowMd}`); tripwire = one fixture per workflow per path.
- **Path-conditionality drift.** Step-hole correctness rests on the column-0 marker rule. The rule itself is settled and complete (spike C10: 23/23 sites, 0 over-classification), so the residual risk is authoring drift — a future conditional step written without a column-0 marker, or a marker added outside a step section. Mitigated by the explicit authoring rule (`.bkit/authoring.md` § Workflows Only) and a per-workflow fixture corpus. Evidence holes — the primary class — do not depend on it.
- **Reader coverage.** `engine-call` + `completeness` rows enter `runStatusRows`; a reader not fixed is silent telemetry corruption that outlives the feature (measured: 1208.1 total step minutes → 0.7 with `MARK_ROWS` unchanged). Mitigated by both `MARK_ROWS` copies, the harvest parity test, the `splitRuns` / `lastActivity` audit, and one explicit test asserting an unknown `status.jsonl` row type is inert in every reader rather than an enumerated reader list.
- **Friction visibility (was: silently refused).** Two failure paths would have let success criterion 3 pass its unit tests and record nothing in a real run: a root outside the run's tree (spike C4) and a refused row on the step-less calls (spike C5). Both are now pinned — the run's own book root, and the `by.step` sentinel — and a refused row logs a `[bkit-telemetry]` line instead of vanishing. End-to-end (`ledgers commit` → `pnpm harvest`) stays `Unsettled` (spike C14) — see open question 11.
- **Journal liveness.** A silently broken journal is indistinguishable from a pre-journal run unless the close path says so. Mitigated by the `journalSuspect` heartbeat + one `[bkit-status-holes]` line when a journaling engine closes a run with zero `engine-call` rows; the residual false positive (a run started before the upgrade, closed after) is labelled "suspect", never "holey".
- **Close and start are on the critical path.** The checker runs in-process inside `closeWorkflow` and `workflows start`. Mitigated by the `appendStats` fail-open idiom at both call sites + a test that forces the check to throw and asserts the close still writes `workflow-done` and returns its exit code (success criterion 4).
- **Close ordering and repeated closes.** Spike C13: a real run writes `workflow-done` before its own final step rows and closes three times, so the verdict row is "part of the run" only for the first close, and a later row inflates the harvest's `afterEnd` / `scan.rows`. Mitigated by the last-row read path (open question 12) and by documenting the accepted `afterEnd` shift.
- **Self-reference and ordering.** The check is itself a bkit command run while a run is active. Defined: close journals its own call on entry before computing; the check self-excludes the `completeness` verb from its expectations **and** its `unexpected` list.
- **"Attempted ≠ succeeded".** A required command that ran and failed still counts as present; the verdict has no success axis this cycle. Deliberate, but worth revisiting once the corpus exists.
- **Deferral `442-status-hole-detector-beyond-ship`** must be closed (same-`key` append, referencing this design) or it re-surfaces as unbuilt work.

**Open questions.**

1. **Friction exclusion set (departs from Q5).** Which non-zero exits produce a `tool-failure` row?
   - Option A — _derived_: exclude `SHARED_EXIT_CODES` `{0, 1, 2, 80, 81, 82}` (shared routing; verified against `lib.ts`) ∪ the verb's declared `exitCodes`; everything else (undeclared codes, signal deaths, throws) writes a row. Self-maintaining; kills the routine-exit false positives — including exit 2, which `parseFlags` and `refuseUnsubstituted` throw on routine authoring mistakes; misses exits a verb declares but that are real failures. **Recommended** — noise is the failure mode that mutes detectors, and the draft's set that kept exit 2 contradicted its own rationale.
   - Option B — _derived minus 2_: exclude `{0, 1, 80, 81, 82}` ∪ declared, keeping exit 2 as signal. Records usage errors as friction; re-mutes the detector on every routine flag mistake in workflow prose.
   - Option C — Q5-literal `{3, 8, 9, 80, 81}` only: loudest; writes rows on routine exits 1, 2, 4-7, 10-16, 82.
   - Default if unanswered: Option A.
2. **Friction dedup-key step resolution (partial departure from Q16).**
   - Option A — _degrade_: the command's own `--step=` when present, else the `<noun>-<verb>` sentinel, for both `by.step` and the key. No inference, no drift, and the row is always admissible. **Recommended.**
   - Option B — `resumePoint` inference: name the run's current step from its own rows. More keys carry a real step; inference can mis-name under group loops and retries.
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
5. **Journal volume in `status.jsonl`.** Accept up to ~100 extra rows per run in the SoT file (measured: the probe's 59-row run grew to 116 rows), or move the journal to a sidecar (rejected Approach B)?
   - Option A — _keep rows in `status.jsonl`_ (Q8) with the `MARK_ROWS` fix in both copies. **Recommended** — settled by Q8; the sidecar's isolation is bought once by the reader fix, and the accepted `afterEnd` shift is documented.
   - Option B — sidecar `engine-calls.jsonl` beside `status.jsonl`; needs a new artifact in `.agents/docs.md` / `.bkit/jsonl.md` / harvest. Better isolation; doubles the union-merge surface; departs Q8.
   - Default if unanswered: Option A, and revisit if the reader surgery proves invasive in build.
6. **Pre-journal carve-out and its heartbeat.** Confirm a run with zero `engine-call` rows gets a steps-only `preJournal` verdict rather than being flagged holey, and that the close path adds `journalSuspect` when the closing engine is itself journaling.
   - Option A — _carve out, with the close-path heartbeat_. **Recommended** — avoids flagging every historical run on the first resume after upgrade while keeping an alertable signal on a dead journal.
   - Option B — evaluate all runs uniformly. Simpler; floods at rollout.
   - Option C — carve out and write no `completeness` row at all when the journal is suspect. Keeps the ledger clean; loses the only record of the suspect run.
   - Default if unanswered: Option A.
7. **Departure from `384-tier3-promotion`'s pinned watermark (Q15).** Confirm no watermark / baseline: the check reports every hole on every run.
   - Option A — _no watermark_ (Q15). **Recommended** — settled; the advisory / fail-open posture and the promotion gate are unchanged, and the warning is scoped by question 4.
   - Option B — reinstate the pinned-watermark delta. Matches `384-tier3-promotion` verbatim; needs a watermark artifact and a delta computation.
   - Default if unanswered: Option A (recorded as a departure in `docs/decisions.jsonl`).
8. **Reader-surgery scope.** Add both new row types to both `MARK_ROWS` copies only, or audit every `status.jsonl` reader?
   - Option A — both `MARK_ROWS` copies + the harvest parity test + the `splitRuns` / `lastActivity` audit + one "an unknown row type is inert" test across the readers. **Recommended** — a missed reader is silent corruption, and an enumerated reader list is exactly what the probe showed failing (1208.1 → 0.7 total step minutes with `MARK_ROWS` unchanged).
   - Option B — the two `MARK_ROWS` copies only. Smallest change; risks a missed reader.
   - Default if unanswered: Option A.
9. **Positional attribution for calls with no step in progress (spike C12, `BLOCKED` — unsettled by probe).** What happens to a call journaled after the run's terminator, or in a run that repeats a step name?
   - Option A — _positional + an unattributable bucket_: the verdict names such calls without charging them to a step. **Recommended** — keeps Q11's row shape verbatim and never invents an attribution.
   - Option B — a self-describing `step` on the `engine-call` row. Removes the ambiguity; departs Q11 and still cannot cover the step-less calls.
   - Option C — journal to a per-run sidecar ordered by `at`. Cleanest ordering; departs Q8 and loses the union-merge ride.
   - Default if unanswered: Option A, with the bucket's size watched in the first release.
10. **The seam's fail-safe contract (spike C2, `BLOCKED` — needs the seam in tracked source).** In what order is the mechanism built?
    - Option A — _the seam first_, behind a flag, with the exit-code-passthrough + one-stderr-line test as its first commit. **Recommended** — it is the design's load-bearing guarantee, it is `Unsettled` by probe, and it carries the CLI-wide blast radius.
    - Option B — the checker and the command first, the seam last. Visible value sooner; leaves the CLI-wide risk untested until the end.
    - Option C — put the seam in `main()` instead, where a failure is contained per process. Departs the probe-verified `runCommand` seam and re-opens the classic-verb refactor.
    - Default if unanswered: Option A.
11. **Friction end-to-end (spike C14, `BLOCKED` — needs a live scratch consumer).** How is `write → ledgers commit → pnpm harvest` settled?
    - Option A — _the repo's existing dogfood_ (`pnpm build` → `node dist/cli.js …` on a scratch consumer): force a non-zero exit, then commit and harvest, asserting the row in the run's own `.bkit/friction.jsonl` and in the harvested ledger. **Recommended** — the only path that exercises root + row shape + commit + harvest together, and both spike disproofs sat outside unit-test reach.
    - Option B — unit tests on the seam's row only. Cheaper; would not have caught C4 or C5.
    - Default if unanswered: Option A.
12. **Close ordering and repeated closes (spike C13 — a real run closes three times).** How many `completeness` rows does a run carry?
    - Option A — _one per close_, with the read path taking the last and recomputing when rows follow it. **Recommended** — every close is recorded, and the read path is defined for the corpus's repeated-close shape.
    - Option B — only the first close of a run. One row per run; a later close (the corpus's common shape) records nothing.
    - Option C — write only when the run has no `completeness` row, and never recompute at start. Simplest; leaves a resumed / re-closed run's verdict stale.
    - Default if unanswered: Option A.
