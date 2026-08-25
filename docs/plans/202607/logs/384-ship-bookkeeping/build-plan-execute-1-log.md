Verdict: PASS
<!-- verdict:end -->

# Build Plan — Sub-Plan 1 — Foundations & Tier-1 Gate

**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **Sub-plan:** 1 of 3
**Plan:** `docs/plans/202607/384-ship-bookkeeping-plan-1.md` · **Worktree:** `.worktrees/384-ship-bookkeeping`

## Execution Log

DONE — Task 0: #341 serialisation gate verified, decision row 384-341-serialisation (outcome 341-first-landed) appended to docs/decisions.jsonl (d64ef5be is the diff base; no concurrent rewrite; bkit_runtime_row ship + RUNTIME_DEVPUSHES present)
DONE — Task 1: config surface landed — bkit.capstoneJob + bkit.ciWorkflow added to package.json (defaults bkit-tests-check / ci.yml, survive stripManagedKeys); bkit-ship-timeouts.sh + template byte-identical; bkit-protect-main.sh reads bkit.capstoneJob via jq (both copies); .bkit/src/bkit-config-keys.test.ts 12/12 GREEN; bkit-package-json.test.ts 15/15 still GREEN
DONE — Task 2: gh stub harness landed — tests/fixtures/gh/bin/gh (extends bkit-runtime.bats PATH-shim idiom with fixture-file dispatch); 8 run fixtures (green-capstone, failed, in-progress, no-capstone, superseded-green-target, cancelled, skipped-lane, cache-skip-green, conflicting-no-run) + 6 jobs fixtures + 2 ratelimit fixtures; smoke.bats 7/7 GREEN; .husky/pre-push + template wired with pnpm test:bats after pnpm bkit check
DONE — Task 3: Tier-2 invariant test landed RED — .bkit/src/bkit-ship-invariants.test.ts (11/14 assertions FAIL against current bkit-ship.md: git add -A ban, BOOK_ROOT/BOOK_PATHS presence, BOOK_PATHS 8-path allow-list, every git add resolves via BOOK_PATHS, BOOK_ROOT RUNTIME_DEVPUSHES-conditional, every status.jsonl write via BOOK_ROOT, gh pr merge --match-head-commit, dev-lock windows, .deferred-blocked writer under BOOK_ROOT); 3 GREEN are already-satisfied regression guards; canonical 14 ship-* step-key set + frozen 8-path BOOK_PATHS allow-list published as exported frozen arrays
DONE — Task 4: bkit-ship-gate.sh + tests/ship-gate.bats landed — Tier-1 carrier GREEN; .bkit/scripts/bkit-ship-gate.sh + template byte-identical; contract: assert --head <sha> [--capstone] [--workflow] [--repo] [--explain]; workflow-scoped head-keyed run selection; 9 distinct exit codes (0/10/11/12/13/14/15/16/20) + BKIT_SHIP_GATE_OVERRIDE honoured only on refused head + status.jsonl audit row; cache_skip vs vacuous-skipped distinguished via step cache marker; tests/ship-gate.bats 16/16 GREEN (10 design-named cases + override pair + config + usage); --explain deterministic per fixture; full bats suite 128/128 GREEN (no regression)

---

## What Was Implemented

### Task 0 — #341 Serialisation Carve-Out (GO/NO-GO gate)

Verified all Done-when conditions:

- `git log --oneline d64ef5be..HEAD -- .bkit/workflows/bkit-ship.md` is empty — no intervening rewrite of the diff base.
- `grep -c 'bkit_runtime_row ship' .bkit/workflows/bkit-ship.md` = 1 (the post-#341 runtime-resolved row at `:320`).
- `grep -c 'RUNTIME_DEVPUSHES' .bkit/workflows/bkit-ship.md` = 10.
- `grep -c 'bkit_close_guard_checkout' .bkit/scripts/bkit-runtime.sh` = 5 (kernel exists for the other phases; ship is the documented exception that asserts the double-guard inline).
- No concurrent PR/branch rewrites `bkit-ship.md`: `feat/58-workflow-counters` and `worktree-374-test-lane-coverage` carry 0 `bkit-ship.md`-touching commits past `origin/dev`.

Appended `docs/decisions.jsonl` row `384-341-serialisation` (`outcome: "341-first-landed"`) recording the serialisation decision; comment corrections (CONFLICTING-PR general GitHub behaviour; `cancel-in-progress` second frozen-head justification; Path B2 common case) folded into the row's description.

### Task 1 — Configuration Surface

- `package.json` — added `bkit.capstoneJob: "bkit-tests-check"` and `bkit.ciWorkflow: "ci.yml"` under the existing `bkit.*` object. `stripManagedKeys` (`.bkit/src/bkit-package-json.ts`) only consults `scripts` + `devDependencies`, so the new keys survive uninstall — verified by `bkit-config-keys.test.ts` and the still-green `bkit-package-json.test.ts` (15/15).
- `.bkit/scripts/bkit-ship-timeouts.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh` (byte-identical) — new managed config script following the `bkit-counter-bus-config.sh` precedent. Exports `SHIP_CI_WAIT_TIMEOUT_S=1800`, `SHIP_POLL_INTERVAL_S=30`, `SHIP_DEV_LOCK_STALE_S=900`, `SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S=600`, `MAX_MERGE_ATTEMPT=3` (units in identifiers; `bkit:start`/`bkit:end` managed block).
- `.bkit/scripts/bkit-protect-main.sh` + `.bkit/templates/.bkit/scripts/bkit-protect-main.sh` (byte-identical) — replaced the hard-coded `REQUIRED_JOB="bkit-tests-check"` literal with `REQUIRED_JOB=$(jq -r '.bkit.capstoneJob // "bkit-tests-check"' package.json ...)`; falls back to the default when `package.json` is absent or `jq` is missing.
- `.bkit/src/bkit-config-keys.test.ts` (NEW) — 12 cases: `bkit.capstoneJob` / `bkit.ciWorkflow` defaults + overrides via the same `jq` read; `stripManagedKeys` leaves both intact; `bkit-protect-main.sh` (both copies) has no `REQUIRED_JOB="bkit-tests-check"` literal and reads `bkit.capstoneJob` via `jq`.

### Task 2 — gh Stub Harness + Fixture Corpus (cost hinge)

- `tests/fixtures/gh/bin/gh` (NEW, executable) — PATH-shimmed `gh` extending the `bkit-runtime.bats:44-58` `FAKE_BIN`/`chmod +x` idiom with the genuinely-new piece: **fixture-file dispatch**. URL pattern → JSON file:
  - `*/actions/workflows/*/runs?head_sha=<SHA>` → `tests/fixtures/gh/runs/<SHA>.json` (absent fixture → synthetic `total_count:0` so code 10 is distinguishable from code 20).
  - `*/actions/runs/<ID>/jobs` → `tests/fixtures/gh/jobs/<ID>.json`.
  - `rate_limit` → `tests/fixtures/gh/ratelimit/<BKIT_FAKE_RATELIMIT_STATE>.json`.
  - `BKIT_FAKE_GH_API_ERROR=1` → every api call (including `rate_limit`) exits 1 with HTTP-500 stderr (code-20 path).
  - `BKIT_FAKE_RATELIMITED=1` → run-list/jobs queries exit 1 with HTTP-403 rate-limit stderr BUT `rate_limit` still answers, so the gate can sample it to shape the code-20 message (design contract).
- `tests/fixtures/gh/runs/` (8 fixtures): `green-capstone`, `failed`, `in-progress`, `no-capstone`, `superseded-green-target` (run object's `head_sha` mismatches the queried SHA → code 14), `cancelled`, `skipped-lane`, `cache-skip-green`, plus `conflicting-no-run` (PR #720 `total_count 0` CONFLICTING shape — captured verbatim from the design's described field shape).
- `tests/fixtures/gh/jobs/` (6 fixtures): `1001` (green capstone), `1002` (failed capstone), `1004` (capstone absent), `1005` (stale-green capstone), `1007` (skipped lane, no cache marker), `1008` (cache-skip green with `Cache hit — restore` step marker).
- `tests/fixtures/gh/ratelimit/` (2 fixtures): `ok`, `exhausted`.
- `tests/fixtures/gh/smoke.bats` (NEW) — 7 cases proving the stub dispatches deterministically.
- `.husky/pre-push` + `.bkit/templates/.husky/pre-push` — wired `pnpm test:bats` after the existing `pnpm bkit check` line (root: bare invocation since bats is expected on the bkit meta-repo; template: guard-skips when `bats` is absent, since consumer repos may not have it).

The cost hinge settled in well under the half-day budget (Risk-12 recalibrated): the PATH-shim wrapper reused the existing `bkit-runtime.bats` idiom, and only the dispatch layer was new. GO.

### Task 3 — Tier-2 Invariant Test (RED)

`.bkit/src/bkit-ship-invariants.test.ts` (NEW) — reuses `stripFencedBlocks` from `bkit-counter-prose-audit.test.ts:50-52` (copied local so the file is self-contained per the design's self-contained-sub-plan rule). Publishes two exported frozen arrays:

- `CANONICAL_SHIP_STEP_KEYS` — the 14 canonical `ship-*` step keys (verbatim from the design's § Canonical `ship-*` step keys).
- `BOOK_PATHS_ALLOW_LIST` — the frozen 8-path staging allow-list (verbatim from the design's § `BOOK_ROOT` / `BOOK_PATHS`).

**11 of 14 assertions FAIL** against current `bkit-ship.md` (proves the test would catch a half-applied rewrite — SP2 Task 7 turns it GREEN):

1. `git add -A` ban (8 violations at `:122`, `:357`, `:432`, `:485`, `:531`, `:655`, `:727`, `:789`).
2. `BOOK_ROOT` defined.
3. `BOOK_PATHS` defined.
4. `BOOK_PATHS` resolves to the frozen 8-path allow-list (positive presence).
5. Every `git add` resolves via `$BOOK_PATHS`.
6. `BOOK_ROOT` carries `CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES`-conditional resolution (mode-3 path).
7. Every `status.jsonl` write resolves via `$BOOK_ROOT` (Finding 4 dissolves).
8. Every `gh pr merge` carries `--match-head-commit` (Step 6's `:634` has none).
9. Two dev-lock windows documented (`trap ... .dev.lock ... EXIT`).
10. `.deferred-blocked` writer referenced (Finding 2: only `rm -f` + read exist today).
11. `.deferred-blocked` writer resolves via `$BOOK_ROOT`.

3 assertions PASS (already-satisfied regression guards, not false negatives):

- No blanket `git add -- docs/` (current prose uses the worse `git add -A`, caught by assertion 1).
- No `git commit`/`git push` to literal `feat/{FID}` outside B2 (current prose uses `{BRANCH}` placeholder).
- Canonical 14 `ship-*` step-key set present (all 14 already emitted as `step:"ship-X"` rows).

### Task 4 — `bkit-ship-gate.sh` + `tests/ship-gate.bats` (Tier-1 carrier)

`.bkit/scripts/bkit-ship-gate.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` (byte-identical, NEW) — implements the full design contract:

- `assert --head <sha> [--capstone <job>] [--workflow <file>] [--repo <o/r>] [--explain]`.
- Config resolution: reads `bkit.capstoneJob` + `bkit.ciWorkflow` from `package.json` via `jq` (Task 1's config surface) when flags are omitted; falls back to defaults.
- Run selection: workflow-scoped head-keyed query (`/actions/workflows/{ciWorkflow}/runs?head_sha=<sha>`), then `jq` selects the most-recent `completed` run at THAT exact head (defence-in-depth against the API returning a stale run).
- Capstone resolution: `/actions/runs/{id}/jobs --paginate`, find by name; absent → code 13.
- One exit code per condition (never collapsed): 0 / 10 / 11 / 12 / 13 / 14 / 15 / 16 / 20.
- Stale-green detection (code 14): if the API returns runs but none match the queried `head_sha`, the most-recent run (at any head) is reported as superseded with both SHAs + run URL.
- cache_skip vs vacuous-skipped distinction (code 0 vs 16): a lane concluded `skipped` is vacuous UNLESS its `steps` array carries a marker matching `cache|restore` (cache-skip provenance — keyed to the exact commit SHA, sound).
- `BKIT_SHIP_GATE_OVERRIDE=<sha>` honoured ONLY when it equals the refused head SHA; on override, appends a `ship-gate-override` `status.jsonl` audit row (best-effort) and exits 0.
- Every diagnostic on stderr behind `[bkit-ship-gate]`; every refusal prints required head + head actually tested (when superseded) + run URL.
- `--explain` prints cache-skip provenance + the success note on stdout.
- Samples `gh api rate_limit` on API error to shape the code-20 message (rate-limit-exhausted vs generic API blip).

`tests/ship-gate.bats` (NEW) — 16 cases (the 10 design-named cases + 6 supporting cases):

<!-- prettier-ignore -->
| # | Case | Exit |
| --- | --- | --- |
| 1 | `accepts-green-capstone-at-head` | 0 |
| 2 | `accepts-green-capstone-at-head --explain` (success note) | 0 |
| 3 | `rejects-failed-run` | 12 |
| 4 | `rejects-no-run-at-head` | 10 |
| 5 | `rejects-none-completed` | 11 |
| 6 | `rejects-stale-green-at-superseded-head` | 14 |
| 7 | `rejects-run-missing-capstone` | 13 |
| 8 | `rejects-cancelled-run-at-head` | 15 |
| 9 | `rejects-run-with-skipped-lanes` | 16 |
| 10 | `accepts-cache-skipped-green` (cache marker present) | 0 |
| 11 | `distinguishes-api-error-from-no-run` (20 vs 10) | 20/10 |
| 12 | `distinguishes-rate-limit-exhausted-from-generic-api-error` | 20 |
| 13 | override honoured on refused head + audit row | 0 |
| 14 | override ignored when SHA ≠ refused head | 12 |
| 15 | config resolution from `package.json` | 0 |
| 16 | usage: missing `--head` exits 2 | 2 |

All 16 GREEN. Full bats suite 128/128 GREEN (no regression).

---

## Files Created / Modified

### Created (9)

- `.bkit/scripts/bkit-ship-gate.sh`
- `.bkit/scripts/bkit-ship-timeouts.sh`
- `.bkit/src/bkit-config-keys.test.ts`
- `.bkit/src/bkit-ship-invariants.test.ts`
- `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh`
- `.bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh`
- `tests/fixtures/gh/` (bin/gh, smoke.bats, 8 run fixtures, 6 jobs fixtures, 2 ratelimit fixtures)
- `tests/ship-gate.bats`
- `docs/plans/202607/logs/384-ship-bookkeeping/build-plan-execute-1-log.md` (this file)

### Modified (7)

- `package.json` — added `bkit.capstoneJob`, `bkit.ciWorkflow`.
- `.bkit/scripts/bkit-protect-main.sh` + `.bkit/templates/.bkit/scripts/bkit-protect-main.sh` — `jq` read of `bkit.capstoneJob`.
- `.husky/pre-push` + `.bkit/templates/.husky/pre-push` — wired `pnpm test:bats`.
- `docs/decisions.jsonl` — appended `384-341-serialisation` row.
- `docs/plans/202607/384-ship-bookkeeping-plan-1.md` — checked `[x]` all tasks + SP1 Gate + Verification Plan.

---

## Test Results

<!-- prettier-ignore -->
| Suite | Result |
| --- | --- |
| `bats tests/ship-gate.bats` | 16/16 GREEN |
| `bats tests/fixtures/gh/smoke.bats` | 7/7 GREEN |
| `pnpm test:bats` (full suite) | 128/128 GREEN (no regression) |
| `pnpm test bkit-config-keys` | 12/12 GREEN |
| `pnpm test bkit-package-json` | 15/15 GREEN (existing — no regression) |
| `pnpm test bkit-ship-invariants` | **11/14 RED** (expected — Tier-2 invariant is the plan's central quality mechanism; SP2 T7 turns it GREEN) |
| `pnpm test` (overall) | 2605 pass, 11 fail (all in `bkit-ship-invariants.test.ts`), 2 skipped, 1 todo — RED solely on the deliberately-RED invariant per the plan's Verification Plan |
| `pnpm typecheck` | GREEN |
| `pnpm format:check` | GREEN (after prettier auto-fix on the two new test files) |
| `pnpm lint:prose` | 0 errors, 1 pre-existing warning in `docs/testing.md` (unrelated) |
| `pnpm slop:delta` | 0 net-new / worsened findings |
| `pnpm bkit check` | exit 0 (20 advisories, all pre-existing) |
| `pnpm check:dist` | GREEN (no dist drift — source changes don't affect compiled install engine) |

---

## Deviations

1. **`tests/ship-gate.bats` carries 16 cases, not 10.** The plan's Task 4 lists "10 named cases". All 10 design-named cases are present (1–10 in the table above). The 6 additional cases (11–16) cover: the rate-limit-shape distinction (the design contract says "Sample `gh api rate_limit` for code-20 message" — warranted a dedicated case beyond the 20-vs-10 distinction), the override pair (the design contract specifies `BKIT_SHIP_GATE_OVERRIDE` semantics but the 10 named cases don't exercise them), config resolution from `package.json`, and the usage error. Additive, not a scope change; all 10 design-named cases pass.
2. **`.husky/pre-push` root vs template intentionally differ.** The root invokes `pnpm test:bats` bare (bats is expected on the bkit meta-repo — it's a documented devDependency-path tool via Homebrew); the template guards with `command -v bats` because consumer repos may not have bats installed. The manifest entry for `.husky/pre-push` is `seedOrPrint: true` (Tier-3 seed-or-print), so this divergence is the intended pattern (it pre-existed my change for the same reason). `bkit check` exits 0.
3. **Gate implementation note: bash mis-parses brace-laden defaults inside `${VAR:-default}`.** The original `local status="${STATUS_PATH:-docs/plans/{YYYYMM}/logs/{FID}/status.jsonl}"` produced a mangled path (`$STATUS_PATH/logs/{FID}/status.jsonl}`). Refactored to an explicit `if [ -z "$status" ]` conditional. Comment in-source explains the bash quirk for future maintainers.

---

## SP1 Gate Verification (all 7 boxes checked)

- [x] **No bolt-on / no gate-weakening** — `bkit-ship-gate.sh` justified against the existing 9 helper scripts (8 `.sh` + 1 `.mjs`); `bkit-ship-timeouts.sh` follows `bkit-counter-bus-config.sh`; `tests/fixtures/gh/` extends `bkit-runtime.bats:44-58` PATH-shim idiom; no `as any` / `@ts-ignore` / `.skip` / empty `catch` introduced.
- [x] **Tier-1 carrier proven before any prose touched** — `tests/ship-gate.bats` 16/16 GREEN; `--explain` deterministic per fixture (all 9 SHA-tagged fixtures map to expected exit codes).
- [x] **Tier-2 invariant RED** — `bkit-ship-invariants.test.ts` 11/14 RED against current `bkit-ship.md`.
- [x] **Byte-identity (manual `diff`)** — `bkit-ship-gate.sh`, `bkit-ship-timeouts.sh`, `bkit-protect-main.sh` root ↔ template pairs empty.
- [x] **Config home correct** — `bkit.capstoneJob` / `bkit.ciWorkflow` in `package.json` (survive `stripManagedKeys`); `bkit-protect-main.sh` reads `bkit.capstoneJob` not the literal.
- [x] **Pre-push wired** — `.husky/pre-push` contains `pnpm test:bats`.
- [x] **SP1 Verified** — Tasks 0–4 all `[x]`.

---

## Hand-off to Sub-plan 2 (Seam 1)

- Tested `bkit-ship-gate.sh` + `tests/ship-gate.bats` (16 cases GREEN) — SP2 Task 5/6/7 depend on it.
- `BOOK_ROOT`/`BOOK_PATHS` contract published in `.bkit/src/bkit-ship-invariants.test.ts` (RED, 11/14) + exported frozen arrays `CANONICAL_SHIP_STEP_KEYS` (14) and `BOOK_PATHS_ALLOW_LIST` (8) — SP2 Task 5 reads them; Task 7 turns the invariant GREEN.
- `bkit.capstoneJob` / `bkit.ciWorkflow` config keys + `bkit-ship-timeouts.sh` — SP2 Task 7 sources the timeouts.

SP2's first action re-verifies these landed before proceeding.

**Final verdict: PASS** — all 5 tasks (0–4) complete; Tier-1 carrier GREEN (16/16 bats); Tier-2 invariant RED (11/14, expected); byte-identity holds; config + pre-push wired; no regressions (full bats 128/128, typecheck/format/slop/bkit-check green, `pnpm test` RED solely on the deliberately-RED invariant per plan).
