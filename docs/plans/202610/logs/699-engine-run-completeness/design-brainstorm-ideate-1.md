# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infra, ship fastest.

Scope: #699 — one `completeness` check for design / plan / build / debug / ship; a per-run command journal; a `tool-failure` friction row on an unexpected non-zero engine exit; the verdict in the run's own `status.jsonl`; a warning (never a gate) at `workflows start` / resume. All grill answers treated as settled.

## Reuse inventory (what already exists, so nothing is built twice)

<!-- prettier-ignore -->
| Asset | What it already gives #699 |
| --- | --- |
| `checks/status-holes.ts` | md-derived expected set at runtime (`deriveExpectedStepSetFromSource`), run classification, hole report, advisory CLI + exit-0 contract, `status-holes.test.ts` fixture idiom. Ship only. |
| `audits/workflows/workflow-shape.test.ts` | The `"{BKIT}"` call parser already proven: `stepSections()` (heading → `{number,title,body}`), `callWords()` (shell-split, quotes kept, stops at an operator), `unknownCalls()`. Per-step `"{BKIT}"` extraction is a solved problem — in a test file, not the engine. |
| `commands/workflow/step-table.ts` (`WORKFLOW_STEPS`) | Ordered per-workflow step table (number, title, `--step=` key, `setup`, `resumeAt`) for all five phases, held to the md headings and `--step=` calls by `workflow-shape.test.ts`. Drift-gated, so not a second source of truth. |
| `commands/workflow/status.ts` | `readStatusEvents`, `fold`, `readRuns`, `statusFile`, `FILE_FLAG` / `WORKFLOW_FLAG`; `bkit status row` writes an arbitrary row. |
| `ledgers/status.ts` | `appendLine`, `statusTimestamp`, `fold`; `actionKey` / `actionHash` / `alreadyDone` — the existing dedup-by-key idiom. |
| `commands/workflow/ledgers.ts` | `appendLedgerRows(root, ledger, rows)` — validates kind + author (`KIND_WRITERS`); `friction.orchestrators` = the five workflows, so an engine write with `by.workflow` set passes. |
| `commands/lib.ts` | `runCommand` (single dispatch for every `bkit <noun> <verb>`), `EXIT`, `CommandError`, `repoRoot`, `statusLocation`. |
| `cli.ts` `main()` | The one place every invocation passes through (`runCommand(...)` then the classic verbs). |
| `commands/workflow/locks.ts` | `resolveMonth`, `monthBuckets`, `readRunsLenient` — month/FID resolution for `--file`-less attribution. |
| `commands/registry.ts` + `conventions.test.ts` | Where a new noun is registered and mechanically held to the flag / output / exit-code conventions. |
| `.bkit/workflows.md` § `status.jsonl` | The row-type table (`workflow-started`, `step-done`, …) a new row type must join. |
| `docs/testing.md` § Tier-3 fail-open advisory channel | The advisory contract and the promotion gate (`384-tier3-promotion`). |

Supersedes deferral `442-status-hole-detector-beyond-ship` (`own-cycle`): its "each phase needs its own routing-branch model" premise is dissolved by Q10 + the "only steps recorded DONE carry required calls" rule — conditioning falls out of evidence, not a per-phase path model.

## Approach A — Generalise the existing detector in place; journal at the CLI entry; new `completeness` noun ⭐ Recommended

Evolve `checks/status-holes.ts` into a workflow-parameterised `deriveExpectedFromSource(workflowMd)` + `checkCompleteness(statusJsonl, workflowMd)`: step sections from the md headings (the `stepSections` idiom, promoted from the test into the module), required calls from each section's `"{BKIT}"` literals (the `callWords` idiom). The step universe is cross-checked against `WORKFLOW_STEPS` instead of a new table, and the ship-specific `PATH_A` / `PATH_B` / `MERGED_ON_ENTRY` sets are replaced by one generic rule — a step recorded `DONE` is checked for its required calls; a step's absence is a hole only when the run closed and the step sits at or before the last observed step (status-holes' `ABORTED` rule, generalised). One hook in `cli.ts` `main()` wraps the dispatch: it resolves the run (Q12: own `--file`, else the single `IN_PROGRESS` run under the cwd's git toplevel, else nothing), appends one `engine-call` row (`{type, workflow, at, noun, verb, flags:[names]}`) with `appendLine`, and on an unexpected non-zero exit appends one deduped `friction` row (`category: "tool-failure"`) through `appendLedgerRows`. `bkit completeness check --workflow= --file=` reports and (at `close`) records; `workflows close` calls it to append the `completeness` row; `workflows start` calls it to print the previous run's warning.

- `Complexity`: MEDIUM — one generalised module, one hook, one noun; every piece has an existing idiom to copy.
- Extensibility: HIGH — a new phase is its own md; a new row type is a line in the `status.jsonl` table. Per-step `"{BKIT}"` expectations track the prose with no engine edit.
- Risk: the `main()` hook sits on every invocation — it must never alter an exit code, never throw, and swallow a failed journal write (read-only tree, full disk). Second risk: attribution is positional (calls between the previous and the current `step-done` row belong to that step), so an out-of-order `merge=union` interleave or a step whose row was never written can mis-bucket. Third: the settled excluded-exit set `{3, 8, 9, 80, 81}` is not exhaustive — exits 1 (gate failed / max exceeded), 2 (usage), 4-7 (re-ask routes) and 10-16 (own codes) are routine and would each write a `tool-failure` row; the exclusion list needs to be every documented exit code, not five.
- Maintenance: one module + the workflow markdown; the exclusion list and the `status.jsonl` row-type table are the two places that drift.
- Reuse vs new: mostly reuse — `status-holes.ts` parsing + advisory shape, the `workflow-shape.test.ts` parser idiom, `WORKFLOW_STEPS` as the audited step universe, `status.ts` / `ledgers/status.ts` / `appendLedgerRows`, `registry.ts`. Net-new: the md-section → required-calls derivation, the `main()` hook, the `completeness` verb.

## Approach B — Self-describing journal rows; the check becomes a pure set difference

Same noun, same `close` / `start` wiring, same md-derived expectations as A. The only change is on the write side: the `engine-call` row also carries the `step` (and `workflow`) it was made under, taken from the `--step=` value already present on nearly every `"{BKIT}"` line (`steps finish --workflow=design --step=design-grill` names its own step). The hook reads that value internally and never journals a free-text flag value. The check then needs no ordering inference at all: for each step recorded `DONE`, required calls (md section) minus journaled calls for that step. Attribution survives a `merge=union` interleave, a missing step row, and a call made from a different directory.

- `Complexity`: MEDIUM — more work at write time (a whitelisted value read + one extra field), materially less at check time (no time-window or ordering logic).
- Extensibility: HIGH — same as A, and a new phase needs no attribution rules.
- Risk: **departs from Q11** (`{type, workflow, at, noun, verb, flags:[flag names only]}`), which must be flagged for the human. Calls with no `--step=` (`ledgers append`, `branches land`, `repo …`, `status row`) have no step to record and need a fallback bucket or the ordering rule anyway, so B is A plus a field, not A minus a mechanism. Two `"{BKIT}"` lines in one step with the same noun+verb but different flags still collapse.
- Maintenance: as A, plus one field to document in `.bkit/workflows.md` and `.bkit/jsonl.md`.
- Reuse vs new: A's reuse set, plus the `--step=` already on the call lines — no workflow-markdown churn, which is the reason B is cheap.

## Approach C — Verdict rides the existing rows; no new row type and no standalone verb

Compute the verdict inside `closeWorkflow` and put it on the existing `workflow-done` status row (a `completeness` field), with the same summary on the `outcome` row's new block. `workflows start` reads that stored field from the previous run to warn; the CI advisory step reads the stored field across the corpus; `bkit runs` / `bkit status` is the read surface. No new noun, no new row type, no `completeness` verb.

- `Complexity`: LOW — the smallest diff of the three; no new command, no new row type.
- Extensibility: MEDIUM — the verdict shape is pinned to the close rows; re-checking one arbitrary run file needs a reader anyway, which is most of the verb it removed.
- Risk: **departs from Q6 (new `completeness` row) and Q13 (new `completeness` verb)** — flag both. `closeWorkflow` currently appends `workflow-done` before the telemetry rows, so the verdict must be computed earlier and the write order changes in the one function every phase shares. There is no way to re-run the check ad hoc against a historical run, and `start` can only ever report the previous run, never the current one.
- Maintenance: LOWEST — no new surface, no new row type; the cost lands on `closeWorkflow`'s ordering.
- Reuse vs new: the highest reuse of the three (existing rows, existing readers, existing CI step); net-new is the derivation logic only.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Approach A leads | B, C | A is the settled shape (Q1, Q6, Q13) with the least net-new infra; B pays a Q11 departure for robustness A can add later if attribution proves wrong in the corpus; C's two departures (Q6, Q13) trade away ad-hoc re-checking, which is the point of a standalone verb. |
| Generalise `checks/status-holes.ts`; do not add a second detector | New `checks/completeness.ts` alongside | Constraint: "no new parallel detector where `status-holes.ts` can be generalised". The ship-specific path sets are replaced, not duplicated — conditioning falls out of "only steps recorded `DONE` carry required calls". |
| Step universe cross-checked against `WORKFLOW_STEPS`; per-step required calls derived from the md at runtime | Derive the step universe from md headings only; or hand-maintain a calls table | `WORKFLOW_STEPS` is already held to the md headings and `--step=` calls by `workflow-shape.test.ts`, so it is drift-gated, not a second source of truth — and it supplies numbers and titles the report needs. Required calls must come from the md (Q10) or the constraint breaks. |
| Promote the `stepSections` / `callWords` parser out of `workflow-shape.test.ts` into the check module | Re-implement the parser; keep a copy in the test | Two copies of the same parse is the drift the constraint names; the test can import the promoted helpers. |
| Journal hook in `cli.ts` `main()`, wrapped around the dispatch | Hook inside `runCommand` (`lib.ts`); per-command wrapper | `main()` is the only point every invocation passes through, classic verbs included (Q4: every bkit command a workflow runs is journaled). `runCommand` misses classic verbs; a per-command wrapper is 24 edits for one behaviour. |
| Attribution by row ordering in the run's `status.jsonl` (Approach A) | Self-describing `step` on the row (Approach B) | Keeps Q11's row shape verbatim. The `--step=` fallback B relies on does not cover `ledgers append`, `branches land`, `repo …` or `status row` anyway, so B is A plus a field rather than a replacement. Revisit if the corpus shows mis-bucketing. |
| `friction` write goes through `appendLedgerRows(root, "friction", …)` with `by.workflow` = the active run's workflow | Hand-append a line; add a new `friction` writer to `KIND_WRITERS` | `friction.orchestrators` already lists the five workflows, so the existing validator admits the row with no schema or writer-set change; the hand-append would bypass validation and the `telemetry.test.ts` / `.bkit/jsonl.md` parity gate. |
| Report every hole on every run; no watermark or baseline (Q15) | Pinned-watermark delta (decision `384-tier3-promotion`) | Settled. Recorded as a departure from `384-tier3-promotion` for the design to carry; the advisory / fail-open posture and the promotion gate are unchanged. |
| Flag two settled answers for confirmation: the `{3, 8, 9, 80, 81}` exclusion set is not exhaustive (1, 2, 4-7, 10-16 are also routine non-zero exits), and `442-status-hole-detector-beyond-ship` is superseded by this mechanism | Extend the exclusion set to every documented exit code; or keep the five and accept routine friction rows | A `tool-failure` row per failed gate, usage error and re-ask route is exactly the noise that gets a detector muted — the failure mode `384-tier3-promotion` exists to avoid. Human's call, but the design must state it. |
