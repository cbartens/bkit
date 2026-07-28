Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Build Challenge 1

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

Scope: Ship workflow restructure (384-ship-bookkeeping) — `.bkit/workflows/bkit-ship.md` Path A/B rewrite with merge gate (`bkit-ship-gate.sh`).

## Findings Log

Prioritized by severity. One CRITICAL (Finding 2) drives Verdict = FAIL.

### Finding 1 — HIGH · mechanical · `.bkit/workflows/bkit-ship.md:533-535`

**Broken timeout telemetry — jq syntax error in `ship-revalidate-timeout` row writer.**

The jq program is single-quoted, so `${SHIP_CI_WAIT_TIMEOUT_S:-1800}` is passed literally to jq, which rejects it:

```bash
jq -nc --arg t "$(date -u +%FT%TZ)" --argjson attempt "$ATTEMPT" \
  '{type:"ship-revalidate-timeout", workflow:"ship", at:$t, attempt:$attempt, timeout_s:${SHIP_CI_WAIT_TIMEOUT_S:-1800}}' \
  >> "$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
```

Verified: `jq: error: syntax error, unexpected '{'` (exit 3). The row is **never written** — the exact diagnostic that explains "CI did not complete after N polls" is silently dropped on the timeout path. The next line `exit 1` still fires (fail-closed), but the operator gets a Failure Path with no telemetry.

**Exploit scenario:** any Path-B re-validation whose CI doesn't conclude within `SHIP_CI_WAIT_TIMEOUT_S` (1800s). This is the common cloud-CI case (queued runners, slow suites).

**Fix:** pass the value through `--argjson`:

```bash
jq -nc --arg t "$(date -u +%FT%TZ)" --argjson attempt "$ATTEMPT" --argjson timeout "${SHIP_CI_WAIT_TIMEOUT_S:-1800}" \
  '{type:"ship-revalidate-timeout", workflow:"ship", at:$t, attempt:$attempt, timeout_s:$timeout}' \
  >> "$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
```

### Finding 2 — CRITICAL · mechanical · `.bkit/workflows/bkit-ship.md:462-467`

**B2 conflict resolution is silently lost — `git add $BOOK_PATHS` stages bookkeeping, not the resolved source files.**

Step 4.2.4 (B2 textual-conflict resolution) commits with the frozen bookkeeping allow-list:

```bash
git add $BOOK_PATHS
git commit -m "chore({FID}): conflict-resolve bkit [skip ci]" -- $BOOK_PATHS
git push --force-with-lease origin "feat/{FID}"
```

`BOOK_PATHS` (defined `:187`) is the **8-path bookkeeping allow-list** (`docs/plans/.../logs/{FID}/`, `docs/completed.md`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `.bkit/friction.jsonl`, `.agents/skills`, `skills-lock.json`) — NONE are source files. But the conflict-resolve subagent "Update: Conflicted source files" (`:458`), and subagents do NOT commit (convention `:32`). So the orchestrator's `git add $BOOK_PATHS` stages zero source changes: the commit is empty (or bookkeeping-only), `--force-with-lease` pushes a branch whose conflict fix is uncommitted, and Step 12's `worktree remove --force` destroys the worktree with the only copy of the resolution.

**Exploit scenario:** every Path-B2 run (the design's "common case" per Comment 1 — "Path B is the common case (doc-line collisions)"). The merge then either fails (still CONFLICTING) or, if `--match-head-commit` matches the pre-resolution head, merges unmerged-conflict content.

**Fix:** stage the resolved source files, not bookkeeping. Either let the conflict-resolve commit stage all resolved tracked changes (`git add -u` for modified tracked files, or `git add <paths-touched-by-subagent>` recorded in the artifact), and keep `$BOOK_PATHS` only for the bookkeeping tail. The `[skip ci]` + unconditional Step-5 dispatch interaction is intentional; only the staging set is wrong.

### Finding 3 — HIGH · mechanical · `.bkit/workflows/bkit-ship.md:449-453`

**`gh pr update-branch` failure is silently ignored — Path-B1 proceeds to merge an unintegrated PR.**

Step 4.1 (B1 mergeable) runs `gh pr update-branch {PR_NUMBER}` with no error guard, then unconditionally routes to Step 5. `update-branch` can fail (403 actions:write, network, branch protection, concurrent head move). On failure the PR head does NOT move; Step 5's head-movement check (`CURRENT_HEAD != ENTRY_HEAD`, `:516`) is then false → Step 5 skips re-validation → Step 6 gate validates the OLD (pre-integration) head and Step 6.5 merges a PR that is still behind `origin/dev` with no re-validation. This violates the design's hard rule ("Re-validation is mandatory in B").

**Exploit scenario:** any B1 where `gh pr update-branch` 403s (the workflow itself flags `actions:write` preflight as best-effort at `:219`). The merge lands content that was never validated against the moved dev.

**Fix:** capture the exit code and route to Failure Path on non-zero (mirroring Step 5's `gh workflow run ... || { ...; exit 1; }`): `gh pr update-branch {PR_NUMBER} || { echo "[bkit-ship] update-branch failed" >&2; exit 1; }`.

### Finding 4 — MEDIUM · mechanical · `.bkit/scripts/bkit-ship-gate.sh:140-159` (vs `.bkit/workflows/bkit-ship.md:631`)

**Override audit row is unwriteable in production — workflow never exports `STATUS_PATH`, test masks it.**

`maybe_override()` reads `$STATUS_PATH` (`:146`); if empty it falls back to the literal default `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`:148`) — a path whose `{YYYYMM}`/`{FID}` braces are NEVER expanded (the script's own comment `:143-145` admits the brace groups are avoided precisely because bash would mis-parse them). The bats override test (`ship-gate.bats:174-176`) explicitly `export STATUS_PATH="$STATUS_DIR/status.jsonl"`, so the test passes. But the workflow's only gate invocation (`:631`) does NOT export `STATUS_PATH`, so in production the audit `>> "$status" 2>/dev/null || true` writes to a literal-brace junk path (or silently no-ops). The override escape hatch works (exit 0) but its "made visible" audit trail is dead.

**Fix:** either have the workflow export `STATUS_PATH="$BOOK_ROOT/docs/plans/$YYYYMM/logs/{FID}/status.jsonl"` (with the already-expanded `$YYYYMM`) before invoking the gate, or have the gate accept `--status <path>`.

### Finding 5 — MEDIUM · architectural · `.bkit/workflows/bkit-ship.md:640-641`

**Gate code 11 ("in progress — poll") is a dead branch — Step 6 routes it to Failure Path with no polling.**

The gate contract (`bkit-ship-gate.sh:28`) defines code 11 as "refuse (poll)" — the one condition whose remedy is to wait, not fail. But Step 6.4 routing (`:640-641`) sends ONLY codes 14/10 to Step 5 (re-validate) and "any other refusal → Failure Path". So code 11 → Failure Path immediately. Step 5's poll loop only runs on detected head movement (`:516`), never on a gate-emitted 11. In Path A (head unchanged) ship can reach Step 6 while build's CI is still in-progress → gate 11 → Failure Path instead of polling.

**Fix:** route code 11 to Step 5's poll loop (or an inline poll) the same way codes 10/14 route there; or document that 11 is fatal and drop the "(poll)" contract from the gate header.

### Finding 6 — MEDIUM · mechanical · `.bkit/scripts/bkit-ship-gate.sh:175,283-293`

**`2>&1` merges gh stderr into the captured JSON — a successful `gh api` that emits any stderr noise corrupts jq parsing and yields a false code-10.**

`if ! RUNS_JSON=$(gh api "..." 2>&1); then` (`:175`) and the jobs query (`:283`) merge stderr into stdout. On a _successful_ gh call that still writes a warning/deprecation/notice line to stderr (real gh does this under `GH_DEBUG`, deprecation headers, or transport notices), `RUNS_JSON` becomes `<stderr-noise><json>` → `jq` parse fails → `TOTAL_COUNT` defaults to `0` (`:195`) → false `refuse 10` ("no run"). The jobs query has the same shape: a noisy success → `CAPSTONE_JOB` empty → false `refuse 13` ("capstone ABSENT"). Both mis-classify a healthy run as a structural refusal.

**Fix:** capture stderr separately (`RUNS_JSON=$(gh api "..." 2>/tmp/gh-err)` or drop `2>&1` and let stderr surface naturally); only the non-zero exit should drive the code-20 path.

### Finding 7 — MEDIUM · mechanical · `.bkit/workflows/bkit-ship.md:631-632`

**Gate-refusal routing depends on the agent shell NOT having `set -e` — `GATE_EXIT=$?` is unreachable when the gate exits non-zero under `set -e`.**

```bash
bash "$GATE_SH" assert --head "$GATE_HEAD" --repo "{OWNER_REPO}"
GATE_EXIT=$?
```

Under `set -e` (a common agent-shell default), a gate refusal (exit 10/11/12/13/14/15/16/20) aborts the script on the `bash "$GATE_SH"` line, so `GATE_EXIT=$?` and the entire routing block (`:634-641`) never execute — the refusal becomes a hard, unhandled abort with no `ship-gate-refusal` status row and no Step-5/Failure-Path routing. Contrast `:610` (`ANCESTOR=$(... && echo true || echo false)`) which is `set -e`-safe by construction.

**Fix:** `bash "$GATE_SH" assert ... || GATE_EXIT=$?` (and initialise `GATE_EXIT=0` before), or wrap in `set +e ... set -e`.
