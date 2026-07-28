# Ship E2E Validation Report — #384 ship-bookkeeping

**Feature:** #384 ship merge-gate + bookkeeping rework
**Date:** 2026-07-29
**Validator:** bkit-build-plan-execute (AI agent, zai/glm-5.1)
**Scope:** Sub-plan 3 Task 11 (WS-12) — the feature's terminal evidence

---

## Validation context

This report validates the #384 ship rework against the 5 Success Criteria from the design (`plan-v3-checked.md` line 42). The validation combines:

1. **Mechanical evidence** (bats fixtures, vitest invariants, status.jsonl corpus) — executed in this session.
2. **Live E2E** (consumer-repo ships) — **deferred**: no consumer-repo live ship was performed in this session. The plan designates this as a manual terminal workstream; the AI agent executing the build cannot perform live ships against consumer repos. The mechanical evidence below is the strongest validation possible without consumer-repo access.

The honest limit: no green pipeline proves a run honoured the contract (Risk 13). The bats fixtures exercise the gate script byte-for-byte (via the `tests/fixtures/gh/` stub harness), not a re-implementation. The prose invariants are mechanically asserted. What remains is the first real ship.

---

## Success Criteria validation

### SC1 — The merge call refuses a head other than the validated one

| Evidence                                                                              | Result                                                                                           |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `tests/ship-gate.bats` cases 1–3 (happy-path exit 0, no-run exit 10, failure exit 12) | PASS — gate asserts capstone job present + success + head_sha match                              |
| `tests/ship-gate.bats` cases 13–14 (override honoured vs ignored)                     | PASS — `BKIT_SHIP_GATE_OVERRIDE=<refused-sha>` turns refusal into exit 0; mismatched SHA ignored |
| `bkit-ship-invariants.test.ts` assertion: `--match-head-commit` present in merge call | PASS — 14/14 GREEN                                                                               |
| `docs/plans/202607/logs/341-three-runtimes/status.jsonl` (real Path A ship)           | PASS — `ship-merge-pr` recorded with `verdict:"PASS"`, `attempt:1`, `failures:0`                 |
| Live `gh pr merge --squash --match-head-commit` against a consumer PR                 | **DEFERRED** — requires consumer-repo access                                                     |

**Verdict: PASS (mechanical); live merge call deferred to first consumer ship.**

### SC2 — No non-integration push to origin/feat/{FID}

| Evidence                                                                                            | Result                                            |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `bkit-ship-invariants.test.ts` assertion: no `git commit`/`git push` to feat/{FID} outside B2 block | PASS — 14/14 GREEN                                |
| `bkit-ship-invariants.test.ts` assertion: no `git add -A` anywhere                                  | PASS                                              |
| 341 status.jsonl: no `ship-conflict-resolve` step (Path A → no push to feat)                        | PASS                                              |
| Live B2 conflict-resolve push in a consumer repo                                                    | **DEFERRED** — requires a conflicting consumer PR |

**Verdict: PASS (mechanical); live B2 push deferred to first consumer B2 ship.**

### SC3 — Every ship run leaves exactly one status.jsonl with a terminal row

| Evidence                                                                              | Result                                                                                                                                                                        |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/plans/202607/logs/341-three-runtimes/status.jsonl` — real completed Path A ship | PASS — 11 ship step rows, terminal `ship-close-workflow` present                                                                                                              |
| Detector against 341: PATH_A, 0 missing, 0 unexpected                                 | PASS                                                                                                                                                                          |
| `docs/plans/202606/logs/261-ci-trigger-gate/status.jsonl` — pre-#384 shape            | **HOLEY** (expected) — 6 steps, classified MERGED_ON_ENTRY, missing start/worktree/regression. This is the pre-#384 corpus the detector is calibrated against (25–65% holey). |
| `tests/ship-failure-path.bats` — workflow-failed terminal row under BOOK_ROOT         | PASS — status resolves via BOOK_ROOT, terminal row written                                                                                                                    |
| `tests/ship-worktree-ownership.bats` — outbox survives crash                          | PASS — ownership marker outside worktree                                                                                                                                      |

**Verdict: PASS for #384-shape runs; pre-#384 corpus holey as expected.**

### SC4 — A deferred-sweep FAIL produces a handover artifact

| Evidence                                                                                                                     | Result                                                          |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `tests/ship-failure-path.bats` case 5: deferred-sweep FAIL writes `.deferred-blocked` sentinel via `touch` under `BOOK_ROOT` | PASS                                                            |
| `tests/ship-failure-path.bats` case 6: `.deferred-blocked` NOT removed in the status/commit block (reader preserved)         | PASS                                                            |
| Live deferred-sweep FAIL triggering `@bkit-debug-abort-handover` in a consumer repo                                          | **DEFERRED** — requires consumer-repo build with unplanned TODO |

**Verdict: PASS (mechanical); live handover route deferred to first consumer deferred-sweep FAIL.**

### SC5 — Staging confined to BOOK_PATHS (8-path allow-list)

| Evidence                                                                                      | Result                                                             |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `bkit-ship-invariants.test.ts`: `BOOK_PATHS_ALLOW_LIST` 8-path list frozen + asserted present | PASS — 14/14 GREEN                                                 |
| `bkit-ship-invariants.test.ts`: no `git add -A`, no blanket `git add docs/`                   | PASS                                                               |
| `bkit-ship.md` uses `$BOOK_PATHS` in every `git add`/`git commit --` call                     | PASS                                                               |
| Live staging in a consumer ship                                                               | **DEFERRED** — requires consumer-repo ship with dirty working tree |

**Verdict: PASS (mechanical); live staging deferred to first consumer ship with dirty tree.**

---

## Path A validation — 341-three-runtimes (real completed ship)

The 341 run is a real completed Path A ship in the bkit repo. Detector output:

```
[bkit-status-hole-detector] ADVISORY — fail-open (exit 0 regardless)
  path: PATH_A
  observed: 11 step(s)
  missing: none
  unexpected: none
```

| SC  | Path A (341) verdict                                     |
| --- | -------------------------------------------------------- |
| SC1 | PASS — `ship-merge-pr` with `verdict:"PASS"`             |
| SC2 | PASS — no `ship-conflict-resolve` (Path A, no feat push) |
| SC3 | PASS — 11 steps, terminal `ship-close-workflow`          |
| SC4 | N/A — no deferred-sweep FAIL in this run                 |
| SC5 | PASS — `BOOK_PATHS` invariant GREEN                      |

---

## Path B2 validation — bats fixtures (mechanical)

No real Path B2 ship exists in the bkit corpus. Path B2 is mechanically validated by:

- `tests/ship-gate.bats` — gate asserts at new head after conflict-resolve push (16 cases)
- `bkit-ship-invariants.test.ts` — `git push --force-with-lease` to feat/{FID} confined to B2 block only
- `tests/ship-failure-path.bats` — `.deferred-blocked` sentinel + `BOOK_ROOT` resolution

| SC  | Path B2 (bats) verdict                                         |
| --- | -------------------------------------------------------------- |
| SC1 | PASS (mechanical) — gate asserts capstone at re-validated head |
| SC2 | PASS (mechanical) — push to feat/{FID} confined to B2 block    |
| SC3 | PASS (mechanical) — BOOK_ROOT status writes asserted           |
| SC4 | PASS (mechanical) — sentinel writer asserted                   |
| SC5 | PASS (mechanical) — BOOK_PATHS staging asserted                |

**Live B2 E2E deferred to first consumer B2 ship (conflicting PR).**

---

## `gh api rate_limit` sample

```
$ gh api rate_limit --jq '.resources.actions'
{"limit":5000,"remaining":4995,"reset":1785282089,"used":5}
```

**Context:** bkit's own GitHub Actions rate limit (5,000/hour for the Actions endpoint). The ship gate's poll loop calls `gh api /repos/.../actions/runs` + `/actions/runs/{id}/jobs --paginate`. At 5 requests per poll cycle (list runs + paginate jobs), the 5,000/hour budget supports ~1,000 poll cycles/hour — far exceeding the elapsed cap (`SHIP_CI_WAIT_TIMEOUT_S=1800` → max ~180 polls at 10s intervals). Risk 4 (rate-limit exhaustion under poll loop) is not a concern at this usage volume. A consumer with a busier Actions surface or a shared token may hit the limit faster; the gate's exit-20 (rate-limit detection) path is tested (`ship-gate.bats` case 12).

---

## Tier-3 watermark calibration

The status-hole detector was run against the full bkit ship corpus (3 runs with ship-step rows):

| Run                 | Path            | Observed | Missing                                 | Unexpected |
| ------------------- | --------------- | -------- | --------------------------------------- | ---------- |
| 341-three-runtimes  | PATH_A          | 11       | none                                    | none       |
| 261-ci-trigger-gate | MERGED_ON_ENTRY | 6        | start, worktree-setup, regression-guard | none       |
| 234-telemetry-jsonl | IN_PROGRESS     | 0        | none                                    | none       |

**Watermark calibration:** the 341 run (post-#384 shape) is clean — 0 holes. The 261 run (pre-#384 shape) is holey — 3 missing steps. This confirms the design's 25–65% holey estimate for the pre-#384 corpus. The detector's pinned watermark should be set to the 341 run's clean baseline: any post-#384 ship run should produce 0 holes for its classified path. A post-#384 run with holes is a real regression signal.

**Promotion gate** (decision `384-tier3-promotion`): the detector runs advisory (fail-open, exit 0) for one release. If one release of signal shows no muting (no consumer disables it), it is promoted to a blocking gate. The 341 run's clean baseline is the promotion target.

---

## Mode-3 deferral

**Gap:** Both validated paths (341 Path A; bats Path B2) are local-mode (`RUNTIME_DEVPUSHES=true`). Mode-3 (cloud, `RUNTIME_DEVPUSHES=false`) `BOOK_ROOT` live-verification is NOT exercised here.

**Mechanical coverage:** The prose contract for mode-3 (`BOOK_ROOT` resolves to `$WT_TOP` when `RUNTIME_DEVPUSHES=false`) is mechanically asserted by `bkit-ship-invariants.test.ts` (the `BOOK_ROOT` conditional presence check — Tier-2 invariant, 14/14 GREEN) and by `tests/ship-failure-path.bats` case 2 (BOOK_ROOT resolution RUNTIME_DEVPUSHES conditional present).

**Live E2E deferred:** mode-3 live `BOOK_ROOT` verification is deferred to deferral row `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (depends on OPEN deferral `341-live-run-verification-mode-1-and-mode-3`). This gap is recorded in `docs/deferrals.jsonl`.

---

## `--explain` vs `gh pr checks` disagreement

No disagreement was observed. The `--explain` flag was not run against a live PR in this session (no active PR with a capstone run was available in the bkit repo at validation time). The gate's logic is mechanically validated by `tests/ship-gate.bats` (16 cases covering every exit code). No `docs/failures.jsonl` row was appended.

**Deferred:** run `bkit-ship-gate.sh --explain --head <sha> --repo <o/r>` against one live PR in each of bkit + consumer repos on the first real ship, diff against `gh pr checks --required`, record disagreements as `docs/failures.jsonl` rows.

---

## Rollout readiness

The gate script + managed config + rewritten prose must release together in one `bkit upgrade` so no consumer sees prose calling a gate it does not have. `bkit check` catches a partially-applied upgrade (the manifest's `byte-equal-text` format for `bkit-ship-gate.sh` + the prose-invariant test's source↔mirror agreement assertion). This was verified by `node dist/bkit-install.js check` (exit 0, no drift) in the Seam 2 prelude.

---

## Summary

| Criterion                                | Mechanical | Live E2E       |
| ---------------------------------------- | ---------- | -------------- |
| SC1 — merge refuses unvalidated head     | PASS       | DEFERRED       |
| SC2 — no non-integration feat push       | PASS       | DEFERRED       |
| SC3 — one status.jsonl with terminal row | PASS       | PASS (341 run) |
| SC4 — deferred-sweep FAIL → handover     | PASS       | DEFERRED       |
| SC5 — staging in BOOK_PATHS              | PASS       | DEFERRED       |

All 5 Success Criteria pass mechanically. Live consumer-repo E2E is deferred to the first real ship (Path A) and first conflicting PR (Path B2). The mode-3 cloud-runtime gap is deferred to `341-live-run-verification-mode-1-and-mode-3`.
