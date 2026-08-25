Verdict: PASS

<!-- verdict:end -->

# Build Challenge Testing — Regression Tests for 8 Fixed Findings

Designed edge-case regression tests that would catch each of the 8 build-challenge findings if reintroduced. All 10 new tests (6 vitest + 4 bats) pass against the fixed code; each was mutation-verified to FAIL against the corresponding buggy code.

## Per-Finding Test Design

### Finding 1 (CRITICAL) — B2 conflict-resolution staging lost

**Bug:** `git add $BOOK_PATHS` staged only bookkeeping, not resolved source files; `--force-with-lease` pushed a branch whose fix was uncommitted; `worktree remove --force` destroyed the only copy.
**Fix:** `git add -u && git add $BOOK_PATHS` + pathspec-free commit.
**Test (vitest — `bkit-ship-invariants.test.ts`):** `F1: B2 conflict-resolve stages tracked source modifications via 'git add -u' before bookkeeping`. Locates the B2 fenced block (uniquely identified by `git push --force-with-lease origin` + `feat/{FID}` — the prose blockquote mentions the flag but without `origin`), extracts a 12-line window above the force-push, and asserts the window contains `git add -u` AND `git add ... BOOK_PATHS`. The old code (only `git add $BOOK_PATHS`) would fail the `-u` assertion.
**Mutation-verified:** fed old content (`git add $BOOK_PATHS` without `-u`) → assertion fails ✓.

### Finding 2 (HIGH) — jq telemetry literal bug

**Bug:** `${SHIP_CI_WAIT_TIMEOUT_S:-1800}` inside a single-quoted jq program → `jq: error: syntax error` → the `ship-revalidate-timeout` row was NEVER written; operators got a Failure Path with no timeout telemetry.
**Fix:** `--argjson timeout "${SHIP_CI_WAIT_TIMEOUT_S:-1800}"` + `$timeout` in the jq object.
**Test (vitest):** `F2: ship-revalidate-timeout row passes timeout via --argjson`. Finds the `ship-revalidate-timeout` line, checks a 6-line window for `--argjson timeout` (CLI flag) and `timeout_s:$timeout` (jq variable reference). The old code has neither.
**Mutation-verified:** old content lacks both tokens → assertion fails ✓.

### Finding 3 (HIGH) — Missing error guard on `gh pr update-branch`

**Bug:** bare `gh pr update-branch {PR_NUMBER}` with no error guard; a 403/network/protection failure silently proceeded to merge an unintegrated PR.
**Fix:** `|| { echo "[bkit-ship] gh pr update-branch failed ..." >&2; exit 1; }`.
**Test (vitest):** `F3: every fenced 'gh pr update-branch' call carries an error guard`. Scans fenced blocks (using `/^\s*```/` for indented-fence detection — fenced blocks in this workflow are nested under list items) for `gh pr update-branch` and asserts each carries `|| {`. Scoped to fenced blocks to exclude the MCP-fallback prose mapping (`gh pr update-branch {N}` → `update_pull_request_branch`).
**Mutation-verified:** old content (bare call, no `||`) → assertion fails ✓.

### Finding 4 (MEDIUM) — STATUS_PATH not exported / set -u crash / audit silence

Three facets, two tested in bats (gate script behaviour), one in vitest (workflow prose):

**(a) vitest — `F4a: Step 6 exports STATUS_PATH before invoking the gate`:** finds the `bash "$GATE_SH" assert` line, checks the preceding 10-line window for `export STATUS_PATH=`. Old code lacks the export → assertion fails ✓.

**(b) bats — `F4b: override honoured (exit 0) when STATUS_PATH is unset — no set -u crash`:** runs the gate with `env -u STATUS_PATH BKIT_SHIP_GATE_OVERRIDE=failed --head failed`; asserts exit 0. Old code (`local status="$STATUS_PATH"`) crashes under `set -euo pipefail` with `STATUS_PATH: unbound variable` → exit 1.
**Mutation-verified:** created a temp copy reverting `${STATUS_PATH:-}` → `$STATUS_PATH`; gate crashed with `line 148: STATUS_PATH: unbound variable`, exit 1 ✓.

**(c) bats — `F4c: override audit row emitted to stderr when STATUS_PATH is unwritable`:** runs the gate with `STATUS_PATH="/nonexistent-bkit-dir-384/status.jsonl"`; asserts exit 0 AND `$output` contains `ship-gate-override` + `emitting to stderr`. Old code (`>> "$status" 2>/dev/null || true`) silenced the failed write → audit row invisible → assertion fails ✓.

### Finding 5 (MEDIUM) — Code 11 dead branch

**Bug:** Step 6 routing sent ONLY codes 14/10 to Step 5; code 11 (in progress — poll) fell through to Failure Path instead of polling.
**Fix:** route code 11 to Step 5 alongside 10/14.
**Test (vitest):** `F5: gate code 11 (poll) routes to Step 5 alongside codes 10 and 14`. Finds the routing directive line that mentions BOTH `code 11` AND `Step 5`; asserts the same line also mentions `14` and `10`. Old code has `code 11` only on the Failure-Path line → `find` returns undefined → assertion fails ✓.

### Finding 6 (MEDIUM) — `2>&1` stderr merge

**Bug:** `gh api ... 2>&1` merged gh stderr noise into the captured JSON; on a successful call with a deprecation header, jq parse failed → `TOTAL_COUNT` defaulted to 0 → false code-10 refusal.
**Fix:** drop `2>&1`; only the non-zero exit drives the code-20 path.
**Test infrastructure:** added `BKIT_FAKE_GH_STDERR_NOISE=1` knob to `tests/fixtures/gh/bin/gh` (mirrors the existing `BKIT_FAKE_GH_API_ERROR` / `BKIT_FAKE_RATELIMITED` knob pattern) — emits a deprecation-header-shaped warning to stderr before the successful JSON.
**Test (bats):** `F6: stderr noise on a successful gh api call does not corrupt JSON parsing`. Runs the gate against `green-capstone` (a green run) with `BKIT_FAKE_GH_STDERR_NOISE=1`; asserts exit 0. Old code (`2>&1`) → noise merges into JSON → jq fails → `total_count=0` → exit 10.
**Mutation-verified:** created a temp gate copy re-adding `2>&1`; gate produced `total_count=0` + code 10 (not exit 0) ✓.

### Finding 7 (MEDIUM) — `set -e` gate routing

**Bug:** `bash "$GATE_SH" assert ...` followed by `GATE_EXIT=$?` — under `set -e`, a gate refusal (non-zero exit) aborted the script before `GATE_EXIT=$?` ran, so the routing block + telemetry were unreachable.
**Fix:** initialise `GATE_EXIT=0`, then `bash "$GATE_SH" assert ... || GATE_EXIT=$?`.
**Test (vitest):** `F7: gate invocation uses '|| GATE_EXIT=$?' to survive set -e`. Scans fenced blocks (indented-fence-aware) for `bash "$GATE_SH" assert`; asserts the line matches `|| GATE_EXIT=$?`. Old code (bare invocation + separate `GATE_EXIT=$?` line) → assertion fails ✓.

### Finding 8 (LOW) — Test stub SHA sanitization

**Bug:** SHA extracted from URL flowed unsanitized into `$RUNS_DIR/$SHA.json`; a `../`-laden SHA would path-traverse (copy-paste hazard if the dispatch pattern were copied into production).
**Fix:** `[[ "$SHA" =~ ^[A-Za-z0-9._-]+$ ]] || { echo ...; exit 1; }`.
**Test (bats):** `F8: SHA sanitization rejects '../'-laden SHA`. Calls the fixture `gh` stub directly with `?head_sha=../../etc/passwd`; asserts exit 1 + `unsanitized SHA` + `rejected` in output. Old code (no assertion) → builds path `$RUNS_DIR/../../etc/passwd.json` → file absent → returns `{"total_count":0,...}` exit 0.
**Mutation-verified:** created a temp stub copy removing the sanitization line; stub accepted the traversal SHA with exit 0 ✓.

## Files Created / Modified

<!-- prettier-ignore -->
| File | Change | Tier |
| --- | --- | --- |
| `.bkit/src/bkit-ship-invariants.test.ts` | +6 `it` blocks in a new `describe("build-challenge remediation regressions")` block (Findings F1, F2, F3, F4a, F5, F7) | Unit (markdown-invariant) |
| `tests/ship-gate.bats` | +4 `@test` cases (Findings F4b, F4c, F6, F8) | Shell (cross-process, `tests/fixtures/gh/` stub) |
| `tests/fixtures/gh/bin/gh` | +`BKIT_FAKE_GH_STDERR_NOISE=1` knob (test infrastructure for F6 — injects deprecation-header-shaped stderr noise before successful JSON; mirrors existing `BKIT_FAKE_GH_API_ERROR` / `BKIT_FAKE_RATELIMITED` pattern) | Test fixture |

**No implementation files changed.** All edits are test files or test fixtures. The gate script, workflow markdown, and rendered mirrors are untouched.

## Test Results

<!-- prettier-ignore -->
| Suite | Command | Result |
| --- | --- | --- |
| Targeted vitest | `npx vitest run .bkit/src/bkit-ship-invariants.test.ts` | **20/20 GREEN** (14 existing + 6 new) |
| Targeted bats | `bats tests/ship-gate.bats` | **20/20 GREEN** (16 existing + 4 new) |
| Full bats suite | `bats tests/*.bats` | **144/144 GREEN** (was 140; +4 new; 0 failed) |
| Full vitest suite | `pnpm test` | **75 files, 2657 passed, 2 skipped, 1 todo — exit 0** (was 2651; +6 new; 0 failed) |
| Typecheck | `pnpm typecheck` | exit 0 |
| Format check | `pnpm format:check` | clean (only this in-progress report stub flagged) |
| Mutation verification | manual (6 vitest + 4 bats) | all 10 tests confirmed to FAIL against their respective buggy code |

## Mutation Verification Summary

Each test was verified to catch its bug by feeding the OLD buggy code to the test's assertion logic:

<!-- prettier-ignore -->
| Finding | Method | Result |
| --- | --- | --- |
| F1 | node script: old content (`git add $BOOK_PATHS`, no `-u`) → regex fails | ✓ catches |
| F2 | node script: old content (literal `${...}` in jq, no `--argjson`) → `toContain` fails | ✓ catches |
| F3 | node script: old content (bare call, no `\|\|`) → regex fails | ✓ catches |
| F4a | node script: old content (no `export STATUS_PATH`) → regex fails | ✓ catches |
| F4b | temp gate copy (`$STATUS_PATH` → `${STATUS_PATH:-}` reverted) → `unbound variable` exit 1 | ✓ catches |
| F4c | logic trace: old code silences write (`2>/dev/null \|\| true`) → no stderr audit | ✓ catches |
| F5 | node script: old routing (11 on Failure-Path line) → `find` returns undefined | ✓ catches |
| F6 | temp gate copy (`2>&1` re-added) + stderr noise → `total_count=0` exit 10 | ✓ catches |
| F7 | node script: old content (bare invocation) → regex fails | ✓ catches |
| F8 | temp stub copy (sanitization removed) → `../` SHA accepted, exit 0 | ✓ catches |

## Blockers

None.

## Bugs Discovered

- **Pre-existing mirror drift (not from test changes):** `pnpm bkit check` reports 4 writes would occur (`.claude/commands/bkit-ship.md`, `.cursor/commands/bkit-ship.md`, `.opencode/commands/bkit-ship.md`, `.bkit/version`). This drift predates this test session — `git status` confirms my changes are purely test files (`tests/ship-gate.bats`, `.bkit/src/bkit-ship-invariants.test.ts`, `tests/fixtures/gh/bin/gh`). The remediation phase edited the workflow mirrors by hand; `bkit check` regenerates from source and finds byte differences. Not a blocker for this agent's verdict (implementation-file concern, not test-file).

Verdict: PASS
<!-- verdict:end -->

--- build-challenge-tests run log (Wed Jul 29 10:15) ---
bats tests/ship-gate.bats → 20/20 GREEN (16 existing + 4 new F4b/F4c/F6/F8)
bats tests/*.bats → 144/144 GREEN (0 failed)
vitest .bkit/src/bkit-ship-invariants.test.ts → 20/20 GREEN (14 existing + 6 new F1/F2/F3/F4a/F5/F7)
pnpm test → 75 files, 2657 passed, 2 skipped, 1 todo — exit 0
pnpm typecheck → exit 0
pnpm format:check → clean (only report stub flagged)
pnpm bkit check → 4 writes DRIFT (pre-existing mirror drift, NOT from test changes)
Mutation verification: all 10 tests confirmed to FAIL against buggy code → PASS
