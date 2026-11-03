Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-review CONCERNS
- 4 deferral(s) written this run

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/plan-v1-draft.md`, `docs/plans/202610/logs/699-engine-run-completeness/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/related-deferrals.md`, `docs/plans/202610/logs/699-engine-run-completeness/related-failures.md`, `docs/plans/202610/logs/699-engine-run-completeness/related-issues.md` |
| plan-review | CONCERNS | 3 | 1 | `docs/plans/202610/logs/699-engine-run-completeness/plan-review-1.md`, `docs/plans/202610/logs/699-engine-run-completeness/plan-review-2.md`, `docs/plans/202610/logs/699-engine-run-completeness/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202610/logs/699-engine-run-completeness/plan-v2-reviewed.md`, `docs/plans/202610/logs/699-engine-run-completeness/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative

As the bkit maintainer I want a workflow run to tell me, in its own artifacts, whether every step and every bkit command it required actually ran — and to record engine friction automatically instead of losing it. When I start or resume a run whose previous run was incomplete, I want to be warned before I build on it.

### Success Criteria

1. One bkit verb (`bkit completeness check --workflow= --file=`) reports, for any design / plan / build / debug / ship run, the steps the workflow markdown requires versus those recorded, and the `"{BKIT}"` commands the markdown names versus those journaled — the expected set derived from the markdown at runtime, never a hand table.
2. A closed run carries its completeness verdict as a `completeness` row in its own `status.jsonl` (a run that closes more than once carries one per close, and the read path takes the last); starting or resuming a run prints a warning when the previous run for that FID was **holey** — holey meaning an _evidence hole_ (a step recorded `DONE` without its required journaled calls) or a _step hole_ (a required step absent from a closed run), never merely an unexercised conditional arm. The warning only ever warns; it never interrupts a workflow once started and never asks to continue.
3. An unexpected non-zero exit of a bkit command while a run is active appends one `friction` row with `category: "tool-failure"` to the **active run's own book root**, deduped by key, carrying a non-empty `by.step` on every path; the documented routing exits never produce one.
4. The journal and the check never change a command's exit code, never block, and never fail a workflow — a failed journal write is swallowed and logged, never raised.
5. The expected command/step set is derived from the workflow markdown at runtime (no hand-maintained table), and the advisory→blocking promotion criteria are recorded against decision `384-tier3-promotion`.

### Process Sketch

- **WHEN** `bkit workflows start` opens or resumes a run **→ THEN** it prints one warning line on stderr when the previous run for that FID was holey, and proceeds exactly as today — no prompt, no interruption; stdout stays the single output object the prose parses.
- **WHEN** a bkit command runs while a run is active **→ THEN** one `engine-call` row (noun, verb, flag names) is appended to that run's `status.jsonl` at dispatch entry, and nothing else changes.
- **WHEN** a bkit command exits non-zero for a reason other than a declared routing code **→ THEN** one deduped `friction` row with `category: "tool-failure"` is appended to the active run's own book root, and the original exit code still reaches the caller unchanged.
- **WHEN** `bkit workflows close` closes a run **→ THEN** a `completeness` row comparing recorded steps and journaled calls against the workflow markdown is appended before the `workflow-done` row; a second close appends a second row.
- **WHEN** the check finds a step recorded `DONE` without its required calls **→ THEN** the verdict names the step and the missing calls, and nothing fails.
- **WHEN** `bkit completeness check` runs against any historical run **→ THEN** it reports every hole it finds for that run, with no baseline or watermark, and always exits 0.
- **IF** the journal write, the check or its row append throws **→ THEN** one `[bkit-telemetry]` / `[bkit-status-holes]` stderr line is logged, the workflow degrades to "no row" / "no warning", and no exit code changes.

### Concrete Example

**Setup:** the bkit maintainer, in worktree `.worktrees/699-engine-run-completeness`, whose design and plan runs already closed for FID `699-engine-run-completeness`; the plan run's close wrote a `completeness` row with verdict `HOLEY` naming one evidence hole (`plan-fetch-context` recorded `DONE` with no journaled `context ledger-scan`).

**Steps:**

1. Maintainer runs `bkit workflows start --workflow=build --fid=699-engine-run-completeness --month=202610 --detect` → the engine appends `workflow-started`, then reads the previous run's last `completeness` row, prints one stderr line naming the plan run, its run number, its close time and the reading command, and emits its usual single stdout object (`resumed`, `run`, `lastDoneStep`). The run is not interrupted.
2. A build step's fenced block calls `bkit tests run --gate=… --step=build-plan-verify` → `runCommand` journals one `engine-call` row (`noun: "tests"`, `verb: "run"`, `flags: ["gate", "step"]`) and then runs the verb.
3. The same block calls a gate command that exits 3 — a code the verb declares → no `friction` row is written; the workflow's own `Route:` handles the exit as before.
4. A later step's command dies on an undeclared code 64 → the seam appends one `friction` row (`category: "tool-failure"`, `by.step` from that command's own `--step=`, `key: "<noun>-<verb>/<step>"`) to the run's own book root, then returns 64 unchanged, and the step's `**Failure Path**` runs exactly as before.
5. Maintainer runs `bkit workflows close --workflow=build --fid=… --month=202610 --record-step …` → the checker runs in-process over the run's rows and `.bkit/core/workflows/bkit-build.md`, appends the `completeness` row before `workflow-done`, and the close commit carries it into the run's own artifacts.
6. Maintainer runs `bkit completeness check --workflow=build --file=docs/plans/202610/logs/…/status.jsonl` → exit 0, with a report naming the evidence hole (step + missing calls), the friction row's `key`, and the `unexercised` conditional arms.

**Outcome:** the run's own artifacts carry the verdict; the previous run's hole was known before the maintainer built on it; the failed command left an `engine-command` telemetry row instead of vanishing; and no exit code, gate or workflow outcome changed.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Several runs active at once (each in its own worktree): a journaled call attributes to the right run or is not journaled at all — never misattributed (Q12). | The seam resolves the run from the command's own `--file`, else `--fid` + `--month`, else the single `IN_PROGRESS` run under the cwd's git toplevel; more than one candidate and no `--file` / `--fid` → it journals nothing and logs one skip line on stderr. |
| A command run outside the run's worktree (`cd {REPO_ROOT} && bkit branches land`) attributes via its own `--fid` / `--month`, else is skipped. | Resolved through `statusLocation`, which yields the run's own book root; a resolve from the main checkout finds no active run and writes nothing. |
| Conditional, fallback and retry calls in the prose (`"{BKIT}"` inside a `Route:` / `Failure Path` arm) count as required and are reported as _unexercised_ when not taken; only a step recorded `DONE` missing its calls is an _evidence hole_, and the report lists every hole on every run (no watermark or baseline). | The verdict lists them under `unexercised`; `holey` keys on `evidenceHoles` + `stepHoles` only, and the start warning fires on that alone. |
| A run that fails or is abandoned mid-run: completeness must not flag the un-run tail as holes, and a resumed run's earlier rows still count. | A failed run gets no step holes past its last observed step; its earlier `step-done` and `engine-call` rows still count, and `workflows start` computes its verdict on the fly when no `completeness` row exists. |
| A run that closes more than once (the corpus shows three `build-close-workflow` rows on one run) writes one `completeness` row per close, and a call journaled after the run's terminator has no "step in progress" to belong to — the verdict names such calls rather than charging them to a step. | One row per close; the read path takes the last and recomputes when rows follow it; post-terminator calls land in `unattributable`. |
| A run with zero `engine-call` rows (pre-journal, or a broken journal): steps-only verdict labelled `preJournal: true` — never "every command missing"; when the closing engine is itself journaling, the verdict additionally carries `journalSuspect: true` and one stderr line, so a dead journal is not mistaken for a historical run. | `preJournal: true` suppresses evidence holes entirely (steps-only); `journalSuspect: true` is set only on the close path, never by an on-the-fly start computation. |
| Secret or free-text values in a command line (`--token=`, `--error=`) are never journaled — flag names only (Q11). | The `engine-call` row's `flags` array holds flag names only; the friction row's `description` holds the noun, verb, step and exit code, never a command line. |
| The journal write itself failing (read-only tree, full disk) is swallowed; the command still succeeds and one `[bkit-telemetry]` stderr line is emitted, and the heartbeat (`journalSuspect` on a close by a journaling engine that recorded zero `engine-call` rows) keeps the detector from crying wolf when it is itself hurt. | Nested try/finally around every telemetry write; one stderr line per swallow; the forced-throw test asserts exit-code passthrough. |
| The `completeness` verb is itself a bkit command run while a run is active: it journals itself and self-excludes from its own expectations **and** from its own `unexpected` list. | Its own `engine-call` row is filtered out of both lists before classification. |
| `completeness` and `engine-call` rows landing in `status.jsonl` must not shift step-timing (`MARK_ROWS` — measured: total step minutes 1208.1 → 0.7 without the fix, byte-identical with it); the harvest's `afterEnd` / `scan.rows` windows do move when journal rows land after a run's terminator, and that shift is accepted and documented. | Both `MARK_ROWS` copies gain the two types; the harvest parity test pins them equal; the shift is recorded in `.bkit/jsonl.md` § the `run` row. |
| _Plan-added (validation)._ An unknown value passed to `--workflow`, or a missing / non-existent `--file`. | The command exits 2 (`USAGE`) with a tagged message; the seam still journals its own `engine-call` row for that invocation, and no `friction` row is written (exit 2 is a shared routing code). |
| _Plan-added (validation)._ The same repeatable flag given more than once on a journaled command. | The `flags` array lists the flag name once — names are collected into a set, never appended per occurrence. |
| _Plan-added (error)._ A `status.jsonl` that does not exist, or a workflow markdown that cannot be read. | The check exits 0 and reports no verdict (fail-open); `workflows close` writes `workflow-done` with no `completeness` row; `workflows start` prints no warning; each logs one stderr line. |
| _Plan-added (boundary)._ No run is active in the cwd (the normal case in a consumer repo outside a workflow). | The seam journals nothing, writes no friction row and logs nothing — the no-op path costs one resolve attempt. |
| _Plan-added (boundary)._ Friction where the run's `parentSha` is not resolvable at exit. | The row is written without the `run` object; `by.step` still carries the `--step=` value or the `<noun>-<verb>` sentinel, so `validate` admits it. |
| _Plan-added (boundary)._ A `step-done` row whose `step` is not in the derived contract (a renamed step, a hand-written row). | It is reported under the verdict's `unexpected` steps; the check never throws on it. |

## Open Questions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

Every open question the design carried (its Q1–Q17) is settled: Q1–Q12 by the 13 recorded `docs/decisions.jsonl` rows keyed `699-*`, Q15 by decision `699-completeness-check-no-watermark`, Q17 by the adopted Acceptance Scenario. No question is reopened here.

- **Open Question:** which surface the CI advisory step invokes — the module's own exit-0 CLI, or the new `bkit completeness check` verb (the design names both and leaves the choice to the plan).
  - **Options:** A — keep the module's own CLI (`tsx .bkit/core/engine/checks/status-holes.ts docs/plans/*/logs/*/status.jsonl`) as the CI surface, generalised so each file's workflow is inferred from its own rows, and keep `package.json` `bkit:audit:status` unchanged; the `completeness` verb stays the ad-hoc reader. · B — repoint `bkit:audit:status` at `bkit completeness check --file=…` per file, so the verb is the only surface; the sweep then needs a shell loop, and the module's `main()` loses its only caller. · C — both: the CLI for the corpus sweep and the verb for one file, kept in step by a shared assertion.
  - **Recommended:** A — the advisory step runs on every static-lane build of a clean tree, so it must not depend on `dist/` being built (the CLI is `tsx`); the verb is the maintainer's ad-hoc reader and its `--workflow`-optional path is still exercised by TASK 10's tests. One surface per job, no duplicated entry point.
  - **Default if unanswered:** A.
- **Assumption:** journal rows in `status.jsonl` inflate the file without breaking any consumer, because `fold` skips unknown types and `readStatusRows` accepts any `type`; the two `MARK_ROWS` copies are the only readers that must change. → if wrong, a missed reader silently corrupts step timing (the design measured total step minutes 1208.1 → 0.7 with `MARK_ROWS` unchanged), so Group 1 lands before any writer emits the rows, and the "an unknown row type is inert in every reader" assertion is a plan-added test rather than an enumerated reader list.
- **Assumption:** the seam can resolve the active run from the cwd alone at an acceptable cost (the design measured 4.23 ms per call — 0.40 ms scan + 3.83 ms git spawn — with 188 of 357 call sites needing the scan). → if wrong (a consumer's tree is deep or git is slow), the seam adds that cost to every command in every consumer repo; the resolve is resolve-or-skip and injectable, so it can be narrowed to `--file` / `--fid` plus the cwd's own month bucket without touching the row contract.
- **Assumption:** `friction` rows pass the existing writer check unchanged — `KIND_WRITERS.friction.orchestrators` already lists `{design, plan, build, debug, ship, auto}` and `by.step` is supplied non-empty on every path. → if wrong, `appendLedgerRows` throws, the seam swallows it and the feature records nothing; the Integration row (TASK 4) asserts the row on disk in the run's own root, which is where the design's spike disproved the two silent-refusal paths.
- **Assumption:** the column-0 conditionality rule is complete — a future conditional step is written with a column-0 `**Run only if**` / `**Skip if**` line, or a `(Path X only)` heading marker. → if wrong, a conditional step written without a marker is reported as a step hole, i.e. a false positive that erodes the warning; mitigated by making the rule an authoring rule in `.bkit/core/.bkit/authoring.md` § Workflows Only (mirrored to `.bkit/authoring.md`) with a per-workflow fixture (TASK 7). Evidence holes, the primary class, do not depend on it.
- **Assumption:** the seam's default state at the end of Group 2 is **on**, with `BKIT_ENGINE_JOURNAL=off` as the escape. → if wrong (the seam must ship default-off for one release), the flip is a one-line change in `journalEnabled` plus its unit test, and no other task moves.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #699
```

Or, to address the reasons first: `/bkit-plan #699`
