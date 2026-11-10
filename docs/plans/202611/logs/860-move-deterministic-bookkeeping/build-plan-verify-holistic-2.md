Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 10, 11, 12, 4, 5, 6, 7, 8, 9
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Holistic`

## Groups Verified

4 of 4 plan groups verified (groups 1, 2, 3 and 4; Tasks 1-12).

## Integration Gaps

2 integration gaps, both `Fixable: true`. Both come from the round-1 remediation commit `d29a6877a`, not from the original tasks.

1. **Harvest copy of the step-clock list (Task 11 with Tasks 7 and 8):** `MARK_ROWS` in `run-facts.ts` now skips the four group 4 row types, but the harvest script keeps its own copy (`scripts/harvest/bkit-harvest.mjs:1479-1487`) and a parity test asserts the two are equal. That test fails, and `test-file-script.integration.test.ts` fails twice because of it. The one-line-per-type fix is the same four entries in the harvest copy.
2. **Correction-row location in docs (Task 8 with Tasks 1 and 9):** a runless audit or utility invocation keeps its correction rows in `<outbox>/invocation-context/<id>.corrections.jsonl`, but `docs/architecture.md:222`, `.bkit/core/.bkit/jsonl.md:393` and `docs/observability.md:38` still say correction rows live in a run's status log. Nothing tells a reader the runless budget is per invocation.

Round-1 gaps re-checked against the code, both closed:

- **Runless correction route:** `ledgers append --correction-of` now accepts a standalone `--invocation` (`correctionBookKey` / `correctionBook`, `.bkit/core/engine/commands/workflow/ledgers.ts:1494-1524`). A compiled-CLI probe in a scratch repo (`dist/cli.js`) ran `status invocation --standalone=utility --name=update-knowledge`, then an append carrying a minted `ts`: exit 8 with `{"effects":"none","correctable":true,"scope":"ledgers-append:knowledge:append:utility:run0:utility:update-knowledge","substep":"append"}`, and no ledger written. The corrected candidate `--operation=op-b --correction-of=op-a` appended one row and printed `correction: {used: 1, limit: 2, verified: true}`. The `correction-rejected`, `correction-candidate` and `correction-succeeded` rows landed in `<id>.corrections.jsonl`; no `status.jsonl`, run or FID was created. The new `ledgers.test.ts` cases cover the two-retry limit and the refusal of a third.
- **Storage judgement:** the plan's Data Schema Changes row says standalone correction events "persist in its authoritative invocation record". The receipt `<id>.json` is written once with exclusive create (`writeInvocation`, `.bkit/core/engine/commands/lib.ts:624-631`), so it cannot take appended events. A companion append-only file named by the same id, in the same git-common outbox directory, is part of that invocation's outbox record, survives resume and invents no run. It meets the wording; only the docs lag (gap 2).
- **Step clock:** `MARK_ROWS` (`run-facts.ts:338-350`) holds all four row types, the compiled `dist/commands/workflow/run-facts.js` matches, and the new `run-facts.test.ts` cases pass.

Contracts from round 1 that still work together: workflow callers use only verbs and flags the compiled CLI declares; the `structured-result-file` clause matches the `steps.ts` parser; status folding keys step progress on `step-done` rows only.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (`CONCERNS`, 2 integration gaps: runless correction route; `MARK_ROWS` missing the group 4 row types). `build-plan-gaps-remediate-holistic-1-log.md` reports both fixed in `d29a6877a`.
- Last per-group reports: `build-plan-verify-1-8.md` (Tasks 1, 2, 3, 10, 11; its one gap became Task 12), `build-plan-verify-2-1.md` (Task 12), `build-plan-verify-3-5.md` (Tasks 4, 5, 6) and `build-plan-verify-4-5.md` (Tasks 7, 8, 9), the last three `PASS`.

## Notes

Partial diff coverage: `tmp/bkit-diff-860-move-deterministic-bookkeeping.md` shows only the 20 largest files, so changed files were read directly from the worktree.

- **Tasks:** all 12 tasks meet their DONE WHEN. Only `d29a6877a` changed engine source or `dist/` since round 1, and it touches only the correction route in `ledgers.ts` and `MARK_ROWS`, so the round-1 and per-group judgments hold elsewhere. Task 2 (unticked in the plan for the re-recorded red) holds: its three named tests exist (`telemetry.test.ts:2980`, `ledgers.test.ts:1842`, `journal.integration.test.ts:422`) and passed in the gate run, and `telemetry.test.ts` has no `as unknown as`. The two gaps are cross-group integration defects outside every task's DONE WHEN text, so no task is left off the `Tasks` line.
- **Changed-files gate:** the first `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 81 (tests lock held by another repo's run); the re-run with `--lock-wait-s=3600` ran `bkit:gate:changed` and exited 1. Format, types and lint passed. Failures, 8 in the named vitest lane (`Tests 8 failed | 9273 passed | 2 skipped`), plus the same harvest failure in the related and node lanes:
  - 2 × `test-file-script.integration.test.ts` and 1 × `scripts/harvest/bkit-harvest.test.mjs` "MARK_ROWS is the engine's": gap 1 above.
  - 5 × `.bkit/core/engine/render/trackers.test.ts` "none render baselines" and 1 × `.bkit/core/engine/audits/repo/rules-sync.test.ts`: generated render snapshots and the `.agents/rules.md` mirror, regenerated later by `pnpm bkit:generate`. Accepted by the caller, not gaps.
  - The round-1 `upgrade.integration.test.ts` timeout did not recur.
- **Accepted by the caller, not gaps:** the friction-row refusal behaviour change; the `--issue-operation` interpretation; generated mirrors and snapshots (`.agents`, `.claude`, `.codex`, `.cursor`, `.opencode`, render snapshots); load-dependent test timeouts; Task 2 and Task 12 naming the same `telemetry.test.ts` test, with Task 2's red re-recorded as passed-accepted.
- **Unproven tests for the owner at Step 15 (no gap):** Task 12 `telemetry.test.ts` "accepts verified unavailable model without confusing configured and observed models"; the corrected Task 5 `steps.test.ts` "derives supported header fields and rejects stale bodies without false PASS"; the Task 9 timeout-budget correction to `instructions.test.ts` "renders one recovery precedence contract for all hosts and tracker adapters".
- **No test-first audit report** was supplied this round.
- **Decision records:** `build-decision-1-1.md` to `1-3` created Tasks 10, 11 and 12; `build-decision-1-4.md` records no decision. None accepts either gap.
- **Advisories outside every DONE WHEN:**
  - A runless correction budget is per invocation: issuing a new standalone invocation gives a fresh two-retry budget, because the events file is keyed by invocation id. That matches the plan's per-record wording; a workflow run's budget is per run, step, group and attempt instead.
  - `correctionBook` creates an empty `<id>.corrections.jsonl` on every standalone append with an invocation, even with no correction (`fs.appendFileSync(file, "")`, `ledgers.ts:1521`). Harmless, but it is a write on the pre-validation path.
  - `bkit counters correction` is workflow-only (`--file`, `--workflow`); runless callers spend through `ledgers append --correction-of` only. `.bkit/core/.bkit/cli.md:51` does not say so.
- **Not judged:** `pnpm build` and `bkit check`, because this agent does not build.

## Identified Gaps Log

2 gaps.

- INTEGRATION: the holistic round-1 fix (Task 8 bounded correction extended to Task 1 runless invocations, `d29a6877a`) stores a standalone invocation's `correction-rejected` / `correction-candidate` / `correction-succeeded` rows in `<outbox>/invocation-context/<id>.corrections.jsonl` (`.bkit/core/engine/commands/workflow/ledgers.ts:1510-1524`), but the Task 9 docs still say these rows live only in a run's status log: `docs/architecture.md:222` ("`ci-handoff` and correction rows live in the run's status log"), `.bkit/core/.bkit/jsonl.md:393` ("These are rows in a run's `status.jsonl`") and `docs/observability.md:38` ("Status rows `correction-rejected` ..."). Nothing documents the per-invocation corrections file, or that a runless correction budget is per invocation. Fix: name the standalone location in those three passages (source files only; mirrors regenerate) — Fixable: true
- INTEGRATION: the holistic round-1 fix to Task 11's step clock (`d29a6877a` added `ci-handoff`, `correction-rejected`, `correction-candidate`, `correction-succeeded` from Tasks 7 and 8 to `MARK_ROWS` in `.bkit/core/engine/commands/workflow/run-facts.ts:338-350`) did not update the harvest script's copy at `scripts/harvest/bkit-harvest.mjs:1479-1487`, which still ends at `invocation`. The parity test `scripts/harvest/bkit-harvest.test.mjs` "MARK_ROWS is the engine's" now fails (reproduced alone with `node --test scripts/harvest/bkit-harvest.test.mjs`: 1 fail), and through it `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` fails twice ("node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed", "node — with no report path the test file is left as it was") in `bkit tests changed --base=origin/dev`. Fix: add the same four row types to the harvest `MARK_ROWS` — Fixable: true
