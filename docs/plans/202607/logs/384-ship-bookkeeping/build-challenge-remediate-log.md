Verdict: PASS

<!-- verdict:end -->

# Build Challenge — Remediation Log

Remediating the 8 findings from `build-challenge.md` (Verdict: FAIL). The workflow source `.bkit/workflows/bkit-ship.md` plus THREE rendered mirrors (`.claude/commands/bkit-ship.md`, `.cursor/commands/bkit-ship.md`, `.opencode/commands/bkit-ship.md`) carry identical shell/routing content — every workflow edit was applied to all 4 to keep `pnpm bkit check` drift-clean.

## Remediation Log

DONE — Finding 1 (CRITICAL): B2 conflict-resolution staging silently lost — changed `git add $BOOK_PATHS` + `git commit -- $BOOK_PATHS` to `git add -u && git add $BOOK_PATHS` + a pathspec-free commit. `-u` stages the tracked modifications (the resolved source files the conflict-resolve subagent wrote); the second `git add` stages the bookkeeping allow-list (the ship-conflict-resolve.md artifact). Dropping `-- $BOOK_PATHS` from the commit means both source + bookkeeping land. Satisfies the Tier-2 invariants (`git add -A` ban + "every git add resolves via BOOK_PATHS"). Files: `.bkit/workflows/bkit-ship.md`, `.claude/commands/bkit-ship.md`, `.cursor/commands/bkit-ship.md`, `.opencode/commands/bkit-ship.md`.
DONE — Finding 2 (HIGH): jq telemetry literal bug — moved `${SHIP_CI_WAIT_TIMEOUT_S:-1800}` outside the single-quoted jq program via `--argjson timeout "${SHIP_CI_WAIT_TIMEOUT_S:-1800}"` and `$timeout` in the object. The `ship-revalidate-timeout` row now writes instead of crashing with `jq: error: syntax error`. Files: workflow source + 3 mirrors.
DONE — Finding 3 (HIGH): missing error guard on `gh pr update-branch` — added `|| { echo "[bkit-ship] gh pr update-branch failed ... PR head NOT integrated" >&2; exit 1; }` so a B1 update-branch failure routes to Failure Path instead of silently proceeding to merge an unintegrated PR. Files: workflow source + 3 mirrors.
DONE — Finding 4 (MEDIUM): STATUS_PATH not exported / set -u crash / audit silence — (a) workflow Step 6 now `export STATUS_PATH="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"` before the gate call so the override audit row lands canonically; (b) gate uses `local status="${STATUS_PATH:-}"` (set -u safe — verified the override no longer crashes when STATUS_PATH is unset); (c) dropped `2>/dev/null || true` on the audit write in favour of a stderr fallback so the override is NEVER invisible. Files: workflow source + 3 mirrors; `.bkit/scripts/bkit-ship-gate.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` (byte-identical pair).
DONE — Finding 5 (MEDIUM): gate code 11 (poll) dead branch — Step 6.4 routing now sends code 11 (in progress — poll) to Step 5 alongside codes 10/14, honouring the gate's documented "(poll)" contract instead of falling through to Failure Path; any other refusal (12/13/15/16/20) → Failure Path. Files: workflow source + 3 mirrors.
DONE — Finding 6 (MEDIUM): `2>&1` merging gh stderr into JSON — dropped `2>&1` from both `gh api` captures (workflow-runs query + jobs query) in the gate so stderr noise (deprecation headers, transport notices) can no longer corrupt jq parsing into a false code-10/13 refusal. The non-zero exit alone drives the code-20 path. Files: `.bkit/scripts/bkit-ship-gate.sh` + template (byte-identical pair).
DONE — Finding 7 (MEDIUM): gate-refusal routing unreachable under `set -e` — initialised `GATE_EXIT=0` and changed the gate invocation to `bash "$GATE_SH" assert ... || GATE_EXIT=$?` so a refusal exit code is captured before `set -e` can abort the script, letting the routing block + `ship-gate-refusal` telemetry row execute. Files: workflow source + 3 mirrors.
DONE — Finding 8 (LOW): test stub SHA extraction without sanitization — added `[[ "$SHA" =~ ^[A-Za-z0-9._-]+$ ]]` assertion before `$RUNS_DIR/$SHA.json` path construction so a `../`-laden SHA cannot path-traverse out of RUNS_DIR if the dispatch pattern is ever copied into production. Files: `tests/fixtures/gh/bin/gh`.

## Files Changed

- `.bkit/workflows/bkit-ship.md` (source) — Findings 1, 2, 3, 4, 5, 7
- `.claude/commands/bkit-ship.md` (mirror) — Findings 1, 2, 3, 4, 5, 7
- `.cursor/commands/bkit-ship.md` (mirror) — Findings 1, 2, 3, 4, 5, 7
- `.opencode/commands/bkit-ship.md` (mirror) — Findings 1, 2, 3, 4, 5, 7
- `.bkit/scripts/bkit-ship-gate.sh` (installed) — Findings 4, 6
- `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` (template) — Findings 4, 6
- `tests/fixtures/gh/bin/gh` (test stub) — Finding 8
- `docs/knowledge.jsonl` — appended gotcha row (status.jsonl/BOOK_ROOT Tier-2 invariant trap + 4-mirror sync)

## Verification Notes

- The Tier-2 invariant test (`bkit-ship-invariants.test.ts`) initially caught a self-inflicted violation: a comment line mentioning `status.jsonl` without `BOOK_ROOT`. Reworded the comment to avoid the literal substring. Recorded as knowledge row `kn-384-1-...`.
- Functional spot-check of Finding 4: with `STATUS_PATH` unset and `BKIT_SHIP_GATE_OVERRIDE=<refused-sha>`, the gate now exits 0 (override honoured) and emits the audit row to stderr — previously crashed at exit 1 under `set -u`.
- The two gate-script copies remain byte-identical (`diff` clean).
- All four workflow files share identical shell/routing content for the edited regions (`diff` confirms the edits land at the same offsets modulo mirror-specific tracker-block stripping).

## Test Results

| Suite                       | Command           | Result                                                   |
| --------------------------- | ----------------- | -------------------------------------------------------- |
| Vitest (unit + integration) | `pnpm test`       | 75 files, 2651 passed, 2 skipped, 1 todo — exit 0        |
| Bats (shell + gate)         | `pnpm test:bats`  | 140 passed, 0 failed — exit 0 (incl. 16 ship-gate cases) |
| Drift gate                  | `pnpm bkit check` | 0 writes — exit 0 (no `bkit-rendered-prompts-stale`)     |
| Slop delta                  | `pnpm slop:delta` | 0 added / 0 worsened, net 0.00 — exit 0                  |
| Typecheck                   | `pnpm typecheck`  | exit 0                                                   |

All findings remediated (8/8 DONE, 0 BLOCKED); all local tests pass.

Verdict: PASS
<!-- verdict:end -->
