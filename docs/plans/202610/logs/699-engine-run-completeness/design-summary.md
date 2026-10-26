Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Design Summary

## Verdict

CONCERNS

- design-review CONCERNS
- design-spike FAIL, answered by design-apply-review
- design-organise CONCERNS

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| design-start-workflow | - | - | 1 | - |
| design-worktree-setup | - | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/design-input-1.md` |
| design-grill | - | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/design-grill-1.md`, `docs/plans/202610/logs/699-engine-run-completeness/design-input-1.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/design-brainstorm-ideate-1.md`, `docs/plans/202610/logs/699-engine-run-completeness/design-brainstorm-ideate-2.md`, `docs/plans/202610/logs/699-engine-run-completeness/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/design-review-1.md`, `docs/plans/202610/logs/699-engine-run-completeness/design-review-2.md` |
| design-spike | FAIL | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/design-spike.md` |
| design-apply-review | PASS | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/design-v2-reviewed.md` |
| design-organise | CONCERNS | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/design-v3-organised.md` |

## Suggested Workstreams

### WS-1: Contract deriver (workflow markdown → expected set)

Requires: []

### WS-2: Completeness checker (rows + contract → verdict)

Requires: [WS-1]

### WS-3: Journal seam (engine-call + friction at dispatch)

Requires: [WS-4]

### WS-4: Row-type reader coverage

Requires: []

### WS-5: `completeness` command surface

Requires: [WS-2]

### WS-6: Close and start integration

Requires: [WS-2, WS-4, WS-5]

### WS-7: CI advisory wiring + observability and testing docs

Requires: [WS-1, WS-2, WS-3, WS-5]

### WS-8: Generated artifacts and ledger bookkeeping

Requires: [WS-1, WS-2, WS-3, WS-4, WS-5, WS-6, WS-7]

File these as one issue each? Body per .bkit/trackers.md § Issue shapes; file in Requires order.

## Open Questions

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

## Risks and Action Items

None

## Recommended Next Step

```text
File the Suggested Workstreams issues, then /bkit-plan <first root workstream's new issue>
```

Or, to address the reasons first: `/bkit-design #699`
