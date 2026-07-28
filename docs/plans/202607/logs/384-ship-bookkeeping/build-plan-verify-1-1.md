Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Plan Verification — Sub-Plan 1 — Foundations & Tier-1 Gate

**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **Sub-plan:** 1 of 3
**Plan:** `docs/plans/202607/384-ship-bookkeeping-plan-1.md`
**Mode:** Single
**Attempt:** 1 (first verification)
**Worktree:** `.worktrees/384-ship-bookkeeping`

## Scope

Single — one sub-plan (Sub-plan 1 of 3).

## Sub-Plans Verified

None (single sub-plan verification).

## Integration Gaps

None (single sub-plan verification; integration is reviewed at Holistic scope).

## Previously Attempted

None (first verification attempt — no prior `build-plan-verify-1-*.md` or `build-plan-gaps-remediate-1-*-log.md` files exist).

## Notes

All five tasks (0–4) verified against their Done-when criteria. Every SP1 Gate checkbox holds. No PENDING placeholders, no anti-patterns (`as any` / `@ts-ignore` / `.skip` / empty `catch`), no blanket `git add -A`. The Tier-1 carrier is GREEN (16/16 bats), the Tier-2 invariant is RED 11/14 (expected — SP2 T7 turns it GREEN), byte-identity holds for all three script pairs, config keys survive `stripManagedKeys`, pre-push is wired (root + template), and the full `pnpm test` runs 2605 pass / 11 fail (all 11 inside the deliberately-RED invariant) / 2 skipped / 1 todo — no regression outside the planned RED. Three documented deviations in the execute log are additive or justified (not blocking).

## Identified Gaps Log

None — no blocking gaps found.

---

## Per-Task Verification

### Task 0 — #341 Serialisation Carve-Out — PASS

Done-when criteria, each verified:

| Criterion                                                                                           | Result                                                                                                                             |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `git log --oneline d64ef5be..HEAD -- .bkit/workflows/bkit-ship.md` empty or only this FID's commits | PASS — empty (verified via `git log` and `git diff --stat`; `bkit-ship.md` is untouched between origin/dev and HEAD)               |
| `docs/decisions.jsonl` row `384-341-serialisation` exists with `outcome: "341-first-landed"`        | PASS — row 43 carries `"key":"384-341-serialisation"`, `"outcome":"341-first-landed"`, full description + rationale + alternatives |
| `grep -c 'bkit_runtime_row ship' .bkit/workflows/bkit-ship.md` ≥ 1                                  | PASS — count = 1 (post-#341 runtime-resolved row at `:320`)                                                                        |
| `grep -c 'RUNTIME_DEVPUSHES' .bkit/workflows/bkit-ship.md` ≥ 1                                      | PASS — count = 10                                                                                                                  |
| `grep -c 'bkit_close_guard_checkout' .bkit/scripts/bkit-runtime.sh` ≥ 1                             | PASS — count = 5 (kernel landed for the other phases)                                                                              |

### Task 1 — Configuration Surface — PASS

| Criterion                                                                                                           | Result                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bkit.capstoneJob` + `bkit.ciWorkflow` in `package.json` (`bkit.*` object)                                          | PASS — `package.json:95-96` declares `"capstoneJob": "bkit-tests-check"`, `"ciWorkflow": "ci.yml"`                                                                                                                      |
| `bkit-protect-main.sh` reads `bkit.capstoneJob` via `jq` (no `REQUIRED_JOB="bkit-tests-check"` literal assignment)  | PASS — `bkit-protect-main.sh:46-50` resolves `REQUIRED_JOB=$(jq -r '.bkit.capstoneJob // "bkit-tests-check"' package.json ...)` with `CAPSTONE_JOB_DEFAULT="bkit-tests-check"` only as the jq-failure fallback constant |
| `stripManagedKeys` leaves both keys intact (verified by `bkit-config-keys.test.ts` AND `bkit-package-json.test.ts`) | PASS — `.bkit/src/bkit-package-json.ts:81-119` only consults `scripts` + `devDependencies`; both vitest suites GREEN                                                                                                    |
| `diff .bkit/scripts/bkit-ship-timeouts.sh .bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh` empty                | PASS — empty diff, both 1570 bytes                                                                                                                                                                                      |
| `diff .bkit/scripts/bkit-protect-main.sh .bkit/templates/.bkit/scripts/bkit-protect-main.sh` empty                  | PASS — empty diff, both 5217 bytes                                                                                                                                                                                      |
| `bkit-ship-timeouts.sh` carries the 5 timeouts with unit-suffixed identifiers                                       | PASS — `SHIP_CI_WAIT_TIMEOUT_S=1800`, `SHIP_POLL_INTERVAL_S=30`, `SHIP_DEV_LOCK_STALE_S=900`, `SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S=600`, `MAX_MERGE_ATTEMPT=3` (between `bkit:start`/`bkit:end` managed markers)           |
| `pnpm test bkit-config-keys` passes                                                                                 | PASS — 12/12 GREEN                                                                                                                                                                                                      |
| `pnpm test bkit-package-json` still passes                                                                          | PASS — 15/15 GREEN                                                                                                                                                                                                      |

### Task 2 — gh Stub Harness + Fixture Corpus (cost hinge) — PASS

| Criterion                                                                                           | Result                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/fixtures/gh/bin/gh` exists, executable, extends PATH-shim idiom + adds fixture-file dispatch | PASS — 125-line bash script, `rwxr-xr-x`, header explicitly references `bkit-runtime.bats:44-58`, dispatches URL → fixture file                                                                                                                                                                                                                        |
| 7 design-mandated run fixtures + 1 API-error fixture (or equiv)                                     | PASS — 9 runs fixtures committed (one more than the strict design list; the two extras — `cancelled` + `skipped-lane` — are required by exit codes 15/16): `green-capstone`, `no-capstone`, `failed`, `in-progress`, `superseded-green-target`, `conflicting-no-run` (`total_count 0`, PR #720 shape), `cache-skip-green`, `cancelled`, `skipped-lane` |
| Jobs fixtures                                                                                       | PASS — 6 fixtures: `1001` (green capstone), `1002` (failed), `1004` (capstone absent), `1005` (stale green), `1007` (skipped lane, no cache marker), `1008` (cache-skip green with `Cache hit — restore` step marker)                                                                                                                                  |
| Ratelimit fixtures                                                                                  | PASS — 2 fixtures: `ok`, `exhausted`                                                                                                                                                                                                                                                                                                                   |
| `pnpm test:bats tests/fixtures/gh/smoke.bats` passes                                                | PASS — 7/7 GREEN                                                                                                                                                                                                                                                                                                                                       |
| `.husky/pre-push` wires `pnpm test:bats` after `pnpm bkit check`                                    | PASS — root `.husky/pre-push:66` `pnpm test:bats < /dev/null`; template `.bkit/templates/.husky/pre-push:73-77` adds the `command -v bats` guard (Tier-3 seed-or-print pattern)                                                                                                                                                                        |
| Cost-hinge settled within half-day budget (Risk-12 recalibrated)                                    | PASS — execute log records GO; no deferral row `384-gh-stub-cost-hinge` in `docs/deferrals.jsonl`                                                                                                                                                                                                                                                      |

### Task 3 — Tier-2 Invariant Test (RED) — PASS

| Criterion                                                                                                                                                                                                                                                                         | Result                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.bkit/src/bkit-ship-invariants.test.ts` exists and FAILS on current `bkit-ship.md`                                                                                                                                                                                               | PASS — 320-line file; vitest output `11 failed                                                                                                                                             | 3 passed (14)` — RED as expected |
| Reuses `stripFencedBlocks` from `bkit-counter-prose-audit.test.ts:50-52`                                                                                                                                                                                                          | PASS — verbatim copy at line 35, self-contained per the design's sub-plan rule                                                                                                             |
| Canonical 14 `ship-*` step-key set published in the test as a frozen list                                                                                                                                                                                                         | PASS — `CANONICAL_SHIP_STEP_KEYS` (14 keys, `as const`) exported at lines 53-68                                                                                                            |
| Frozen 8-path `BOOK_PATHS` allow-list published in the test as a frozen list                                                                                                                                                                                                      | PASS — `BOOK_PATHS_ALLOW_LIST` (8 paths, `as const`) exported at lines 78-88                                                                                                               |
| Cases cover: `git add -A` ban; blanket `git add -- docs/`; `BOOK_ROOT` resolution via `RUNTIME_DEVPUSHES`/`CAN_PUSH_DEV`; status.jsonl via `BOOK_ROOT`; canonical step-key set; `gh pr merge --match-head-commit`; dev-lock windows; `.deferred-blocked` writer under `BOOK_ROOT` | PASS — all 9 negative/positive case groups present in the file                                                                                                                             |
| Expected RED profile (11 of 14 failing against current prose)                                                                                                                                                                                                                     | PASS — exact match: 11 fail, 3 pass (the 3 are already-satisfied regression guards: no blanket `git add -- docs/`, no `feat/{FID}` push outside B2, canonical 14-step set already emitted) |

### Task 4 — `bkit-ship-gate.sh` + `tests/ship-gate.bats` (Tier-1 carrier) — PASS

| Criterion                                                                                                           | Result                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bkit-ship-gate.sh` + template byte-identical                                                                       | PASS — empty diff, both 14154 bytes                                                                                                                                                                 |
| Contract: `assert --head <sha> [--capstone <job>] [--workflow <file>] [--repo <o/r>] [--explain]`                   | PASS — argument parser at lines 64-92 enforces this exact surface                                                                                                                                   |
| Workflow-scoped run query, select most recent `completed` at that exact head                                        | PASS — `gh api "/repos/$REPO/actions/workflows/$WORKFLOW/runs?head_sha=$HEAD_SHA"` at line 175; jq filter at lines 206-213 selects by exact `head_sha` (defence-in-depth against stale API returns) |
| Runs exist but none completed → exit 11                                                                             | PASS — branch at lines 251-254                                                                                                                                                                      |
| Capstone resolution from `/actions/runs/{id}/jobs --paginate`, absent → exit 13                                     | PASS — line 283; capstone-name match via jq at lines 295-299                                                                                                                                        |
| All 9 exit codes (0/10/11/12/13/14/15/16/20) implemented                                                            | PASS — verified by direct invocation: each SHA fixture → expected code (see Test Results below)                                                                                                     |
| `skipped` lane (code 16) distinguished from `cache_skip` sentinel green (code 0)                                    | PASS — jq filter at lines 321-340 marks skipped lanes vacuous UNLESS `steps` carries a `cache                                                                                                       | restore`marker;`--explain` notes cache_skip provenance |
| `BKIT_SHIP_GATE_OVERRIDE=<sha>` honoured only when equals refused head + appends status.jsonl audit row             | PASS — `maybe_override()` at lines 140-160 enforces exact equality; writes `{"type":"ship-gate-override",...}` via jq (best-effort)                                                                 |
| Every diagnostic on stderr behind `[bkit-ship-gate]`; refusals print required head + head actually tested + run URL | PASS — `err()` always writes stderr with `PREFIX="[bkit-ship-gate]"`; `print_refusal_context()` at lines 127-136                                                                                    |
| Samples `gh api rate_limit` for code-20 message shaping                                                             | PASS — lines 178-191 (run-list failure) and 285-291 (jobs failure) sample rate_limit then shape the code-20 message ("rate limit exhausted" vs "API error")                                         |
| `pnpm test:bats tests/ship-gate.bats` passes all 10 design-named cases                                              | PASS — 16/16 GREEN (10 design-named cases + 6 supporting cases for rate-limit-shape distinction, override pair, config resolution, usage; additive, not a scope change)                             |
| `--explain` deterministic per fixture                                                                               | PASS — direct invocation confirms all 9 SHA-tagged fixtures map to expected exit codes deterministically                                                                                            |
| `diff .bkit/scripts/bkit-ship-gate.sh .bkit/templates/.bkit/scripts/bkit-ship-gate.sh` empty                        | PASS — empty diff                                                                                                                                                                                   |

## Test Results

| Suite                                                                   | Result                                          | Expected                                                    | Match |
| ----------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- | ----- |
| `bats tests/ship-gate.bats`                                             | 16/16 GREEN                                     | All GREEN                                                   | PASS  |
| `bats tests/fixtures/gh/smoke.bats`                                     | 7/7 GREEN                                       | All GREEN                                                   | PASS  |
| `bats tests/*.bats` (full direct-child suite)                           | 128/128 GREEN                                   | No regression                                               | PASS  |
| `bats tests/*.bats tests/fixtures/gh/smoke.bats` (combined)             | 135/135 GREEN                                   | No regression                                               | PASS  |
| `pnpm vitest run .bkit/src/bkit-config-keys.test.ts`                    | 12/12 GREEN                                     | All GREEN                                                   | PASS  |
| `pnpm vitest run .bkit/src/bkit-package-json.test.ts`                   | 15/15 GREEN                                     | All GREEN (existing — no regression)                        | PASS  |
| `pnpm vitest run .bkit/src/bkit-ship-invariants.test.ts`                | 11 fail / 3 pass (14)                           | RED 11/14 (expected)                                        | PASS  |
| `pnpm test` (full vitest)                                               | 2605 pass / 11 fail / 2 skipped / 1 todo (2619) | RED solely on the deliberately-RED invariant; no regression | PASS  |
| Gate `--explain` direct invocation across 9 fixtures + 1 API-error mode | 0/10/11/12/13/14/15/16/20 deterministic         | Per-fixture exit-code contract                              | PASS  |

## Byte-Identity Check

| Pair                                                                                          | diff result | Sizes         |
| --------------------------------------------------------------------------------------------- | ----------- | ------------- |
| `.bkit/scripts/bkit-ship-gate.sh` ↔ `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh`         | empty       | 14154 ↔ 14154 |
| `.bkit/scripts/bkit-ship-timeouts.sh` ↔ `.bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh` | empty       | 1570 ↔ 1570   |
| `.bkit/scripts/bkit-protect-main.sh` ↔ `.bkit/templates/.bkit/scripts/bkit-protect-main.sh`   | empty       | 5217 ↔ 5217   |

All three byte-identical pairs hold. Task 6 (SP2) is the sole owner of the automated `bkit-dogfood-noop.integration.test.ts` extension; SP1 satisfies byte-identity via manual `diff` per the plan.

## Path-Scoped Staging Check

- `git diff --cached --name-only` is empty — no blanket-staged work pending.
- The sub-plan-1 commit `121b632f chore(384-ship-bookkeeping): plan-execute sub-plan 1` carries only the 35 files expected for Tasks 0–4 (verified via `git show --stat`).
- No `git add -A` or blanket `git add -- docs/` pattern appears in any new shell script (`bkit-ship-gate.sh`, `bkit-ship-timeouts.sh`, `bkit-protect-main.sh`) or test file — verified via grep.
- `bkit-ship.md` is untouched between `origin/dev` and HEAD (the rewrite is SP2 T7's job) — verified via `git diff --stat origin/dev..HEAD -- .bkit/workflows/bkit-ship.md` (empty).

## SP1 Gate (all 7 boxes re-verified)

| Gate                                           | Result                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No bolt-on / no gate-weakening                 | PASS — `bkit-ship-gate.sh` justified against existing 9 helper scripts; `bkit-ship-timeouts.sh` follows `bkit-counter-bus-config.sh`; `tests/fixtures/gh/` extends `bkit-runtime.bats:44-58` PATH-shim idiom; no `as any`/`as unknown as`/`@ts-ignore`/`.skip`/empty `catch` in the new test files |
| Tier-1 carrier proven before any prose touched | PASS — `bats tests/ship-gate.bats` 16/16 GREEN; `--explain` deterministic per fixture                                                                                                                                                                                                              |
| Tier-2 invariant RED                           | PASS — `bkit-ship-invariants.test.ts` 11/14 RED against current `bkit-ship.md`                                                                                                                                                                                                                     |
| Byte-identity (manual `diff`, pre-Task-6)      | PASS — all 3 root ↔ template pairs empty                                                                                                                                                                                                                                                           |
| Config home correct                            | PASS — `bkit.capstoneJob` / `bkit.ciWorkflow` in `package.json` (survive `stripManagedKeys`); `bkit-protect-main.sh` reads `bkit.capstoneJob` not the literal                                                                                                                                      |
| Pre-push wired                                 | PASS — `.husky/pre-push:66` + `.bkit/templates/.husky/pre-push:73-77` both contain `pnpm test:bats`                                                                                                                                                                                                |
| SP1 Verified — Tasks 0–4 all `[x]`             | PASS — all 5 task checkboxes + the 4 Verification Plan checkboxes are `[x]` in `384-ship-bookkeeping-plan-1.md`                                                                                                                                                                                    |

## Documented Deviations (non-blocking, carried over from execute log)

1. **`tests/ship-gate.bats` carries 16 cases, not 10.** All 10 design-named cases are present (cases 1–10). The 6 additional cases (rate-limit-shape distinction, override pair, config resolution, usage) cover contracts the design specifies but the 10 named cases don't exercise. Additive, not a scope change.
2. **`.husky/pre-push` root vs template intentionally differ.** Root invokes `pnpm test:bats` bare (bats is expected on the bkit meta-repo); template guards with `command -v bats` because consumer repos may not have bats. The manifest entry is `seedOrPrint: true` (Tier-3 seed-or-print); `bkit check` exits 0.
3. **Gate implementation note: bash mis-parses brace-laden defaults inside `${VAR:-default}`.** Refactored from `local status="${STATUS_PATH:-docs/plans/{YYYYMM}/logs/{FID}/status.jsonl}"` to an explicit `if [ -z "$status" ]` conditional. Comment in-source at `bkit-ship-gate.sh:143-145` explains the bash quirk.

## Conclusion

All five tasks (0, 1, 2, 3, 4) fully delivered against their Done-when criteria. The Tier-1 carrier is GREEN (16/16 bats + deterministic exit codes), the Tier-2 invariant is RED 11/14 (expected), byte-identity holds for all three script pairs, the config surface + pre-push wiring is correct, and `pnpm test` is RED solely on the deliberately-RED invariant (no regression). Path-scoped staging is clean (no blanket `git add -A`). Three documented deviations are additive or justified and were declared in the execute log — not blocking gaps.

**Verdict: PASS**
**Failures: 0**
