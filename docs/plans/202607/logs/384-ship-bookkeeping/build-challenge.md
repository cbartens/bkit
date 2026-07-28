Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Build Challenge

## Scope

Ship workflow restructure (384-ship-bookkeeping) — `.bkit/workflows/bkit-ship.md` Path A/B rewrite with merge gate (`bkit-ship-gate.sh`). Diff scope: `origin/dev..HEAD`, 84 files, +8291/-1273.

## Reconciliation Summary

Two parallel challenge reports reconciled into one canonical artifact:

- **build-challenge-1.md** — Bugs/edge-case lens — Verdict: FAIL, 1 CRITICAL + 2 HIGH + 4 MEDIUM.
- **build-challenge-2.md** — Security lens — Verdict: CONCERNS, 0 failures, 1 MEDIUM + 1 LOW.

Deduplication: 1 overlap merged (C1-F4 ↔ C2-F1 — same `bkit-ship-gate.sh` STATUS_PATH/override audit defect, agreement 2/2). No severity divergences to reconcile (max-wins trivial). 1 CRITICAL present → canonical Verdict = FAIL.

## Findings

Prioritized by descending severity. Each finding is marked **actionable** (has a surgical fix) or **not-actionable** (informational / accepted residual risk). All findings below are actionable.

### Finding 1 — CRITICAL · mechanical · actionable · `.bkit/workflows/bkit-ship.md:462-467`

**B2 conflict resolution is silently lost — `git add $BOOK_PATHS` stages bookkeeping, not the resolved source files.**

Step 4.2.4 (B2 textual-conflict resolution) commits with the frozen bookkeeping allow-list:

```bash
git add $BOOK_PATHS
git commit -m "chore({FID}): conflict-resolve bkit [skip ci]" -- $BOOK_PATHS
git push --force-with-lease origin "feat/{FID}"
```

`BOOK_PATHS` (defined `:187`) is the **8-path bookkeeping allow-list** (`docs/plans/.../logs/{FID}/`, `docs/completed.md`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `.bkit/friction.jsonl`, `.agents/skills`, `skills-lock.json`) — NONE are source files. But the conflict-resolve subagent "Update: Conflicted source files" (`:458`), and subagents do NOT commit (convention `:32`). So the orchestrator's `git add $BOOK_PATHS` stages zero source changes: the commit is empty (or bookkeeping-only), `--force-with-lease` pushes a branch whose conflict fix is uncommitted, and Step 12's `worktree remove --force` destroys the worktree with the only copy of the resolution.

**Exploit scenario:** every Path-B2 run (the design's "common case" — "Path B is the common case (doc-line collisions)"). The merge then either fails (still CONFLICTING) or, if `--match-head-commit` matches the pre-resolution head, merges unmerged-conflict content.

**Suggested fix:** stage the resolved source files, not bookkeeping. Either let the conflict-resolve commit stage all resolved tracked changes (`git add -u` for modified tracked files, or `git add <paths-touched-by-subagent>` recorded in the artifact), and keep `$BOOK_PATHS` only for the bookkeeping tail. The `[skip ci]` + unconditional Step-5 dispatch interaction is intentional; only the staging set is wrong.

**Agreement:** 1/2 (challenge-1 only — security lens did not flag this surface). Single-input finding is normal, not outvoted.

### Finding 2 — HIGH · mechanical · actionable · `.bkit/workflows/bkit-ship.md:533-535`

**Broken timeout telemetry — jq syntax error in `ship-revalidate-timeout` row writer.**

The jq program is single-quoted, so `${SHIP_CI_WAIT_TIMEOUT_S:-1800}` is passed literally to jq, which rejects it:

```bash
jq -nc --arg t "$(date -u +%FT%TZ)" --argjson attempt "$ATTEMPT" \
  '{type:"ship-revalidate-timeout", workflow:"ship", at:$t, attempt:$attempt, timeout_s:${SHIP_CI_WAIT_TIMEOUT_S:-1800}}' \
  >> "$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
```

Verified: `jq: error: syntax error, unexpected '{'` (exit 3). The row is **never written** — the exact diagnostic that explains "CI did not complete after N polls" is silently dropped on the timeout path. The next line `exit 1` still fires (fail-closed), but the operator gets a Failure Path with no telemetry.

**Exploit scenario:** any Path-B re-validation whose CI doesn't conclude within `SHIP_CI_WAIT_TIMEOUT_S` (1800s). This is the common cloud-CI case (queued runners, slow suites).

**Suggested fix:** pass the value through `--argjson`:

```bash
jq -nc --arg t "$(date -u +%FT%TZ)" --argjson attempt "$ATTEMPT" --argjson timeout "${SHIP_CI_WAIT_TIMEOUT_S:-1800}" \
  '{type:"ship-revalidate-timeout", workflow:"ship", at:$t, attempt:$attempt, timeout_s:$timeout}' \
  >> "$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
```

**Agreement:** 1/2 (challenge-1 only).

### Finding 3 — HIGH · mechanical · actionable · `.bkit/workflows/bkit-ship.md:449-453`

**`gh pr update-branch` failure is silently ignored — Path-B1 proceeds to merge an unintegrated PR.**

Step 4.1 (B1 mergeable) runs `gh pr update-branch {PR_NUMBER}` with no error guard, then unconditionally routes to Step 5. `update-branch` can fail (403 actions:write, network, branch protection, concurrent head move). On failure the PR head does NOT move; Step 5's head-movement check (`CURRENT_HEAD != ENTRY_HEAD`, `:516`) is then false → Step 5 skips re-validation → Step 6 gate validates the OLD (pre-integration) head and Step 6.5 merges a PR that is still behind `origin/dev` with no re-validation. This violates the design's hard rule ("Re-validation is mandatory in B").

**Exploit scenario:** any B1 where `gh pr update-branch` 403s (the workflow itself flags `actions:write` preflight as best-effort at `:219`). The merge lands content that was never validated against the moved dev.

**Suggested fix:** capture the exit code and route to Failure Path on non-zero (mirroring Step 5's `gh workflow run ... || { ...; exit 1; }`): `gh pr update-branch {PR_NUMBER} || { echo "[bkit-ship] update-branch failed" >&2; exit 1; }`.

**Agreement:** 1/2 (challenge-1 only).

### Finding 4 — MEDIUM · mechanical · actionable · `.bkit/scripts/bkit-ship-gate.sh:140-159` (workflow invocation `.bkit/workflows/bkit-ship.md:631`)

**`BKIT_SHIP_GATE_OVERRIDE` audit row unwritable in production — STATUS_PATH never exported by workflow; write silenced; `set -u` crashes the escape hatch.** _(merged: C1-F4 + C2-F1, agreement 2/2)_

Three facets of one defect (override audit-trail integrity weakened):

1. **STATUS_PATH not exported by workflow:** `maybe_override()` reads `$STATUS_PATH` (`:146`); if empty it falls back to the literal default `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`:148`) — a path whose `{YYYYMM}`/`{FID}` braces are NEVER expanded (the script's own comment `:143-145` admits the brace groups are avoided precisely because bash would mis-parse them). The bats override test (`ship-gate.bats:174-176`) explicitly `export STATUS_PATH="$STATUS_DIR/status.jsonl"`, so the test passes. But the workflow's only gate invocation (`bkit-ship.md:631`) does NOT export `STATUS_PATH`, so in production the audit `>> "$status" 2>/dev/null || true` writes to a literal-brace junk path (or silently no-ops). The override escape hatch works (exit 0) but its "made visible" audit trail is dead.

2. **`set -u` crash:** under `set -euo pipefail`, `local status="$STATUS_PATH"` (line 146) crashes with `STATUS_PATH: unbound variable` and exits 1 (NOT 0) when STATUS_PATH is unset — verified empirically. This is fail-safe (no merge bypass) but **breaks the documented escape hatch in production** (workflow never exports STATUS_PATH). The override is only usable from tests, never from the workflow.

3. **Silence-on-unwritable:** the audit-row write `>> "$status" 2>/dev/null || true` (line 153) is silenced. If STATUS_PATH is set but unwritable (e.g. operator or compromised workflow sets `STATUS_PATH=/dev/null` or a permission-denied path), the override grants `exit 0` with **NO audit row**, defeating the documented rollback audit (`docs/deployments.md` § Ship gate + bookkeeping step 3 — "Audit any `BKIT_SHIP_GATE_OVERRIDE` rows... treat every row as a PR whose capstone was NOT green at the merged head").

**Exploit scenario:** an operator (or a workflow compromised via prose edit) sets `BKIT_SHIP_GATE_OVERRIDE=<refused-head>` plus `STATUS_PATH` to an unwritable path → the gate returns exit 0 → Step 6 merges → the `type:"ship-gate-override"` audit row never lands → the documented rollback grep (`grep "ship-gate-override" status.jsonl`) misses it. The escape hatch is "trust the caller + audit row"; the silence breaks the audit half. In the more benign production case (STATUS_PATH simply unset), the override crashes (exit 1) and the workflow cannot use the documented hatch at all.

**Suggested fix (consolidates both reviewers):** (a) `local status="${STATUS_PATH:-}"` to remove the `set -u` crash; (b) in `bkit-ship.md` Step 6 sub-step 4, export `STATUS_PATH="$BOOK_ROOT/docs/plans/$YYYYMM/logs/{FID}/status.jsonl"` (with the already-expanded `$YYYYMM`) before invoking the gate, or have the gate accept `--status <path>`; (c) drop `2>/dev/null || true` on the audit write — write to a fallback (stderr or a sibling `.ship-gate-override.log`) when `$status` is unset/unwritable so the override is NEVER invisible.

**Agreement:** 2/2 (challenge-1 F4 + challenge-2 F1 — same file:line cluster, same root cause, merged).

### Finding 5 — MEDIUM · architectural · actionable · `.bkit/workflows/bkit-ship.md:640-641`

**Gate code 11 ("in progress — poll") is a dead branch — Step 6 routes it to Failure Path with no polling.**

The gate contract (`bkit-ship-gate.sh:28`) defines code 11 as "refuse (poll)" — the one condition whose remedy is to wait, not fail. But Step 6.4 routing (`:640-641`) sends ONLY codes 14/10 to Step 5 (re-validate) and "any other refusal → Failure Path". So code 11 → Failure Path immediately. Step 5's poll loop only runs on detected head movement (`:516`), never on a gate-emitted 11. In Path A (head unchanged) ship can reach Step 6 while build's CI is still in-progress → gate 11 → Failure Path instead of polling.

**Exploit scenario:** any Path-A ship where build's CI is still running when ship reaches the gate. False-negative Failure Path; operator retries manually.

**Suggested fix:** route code 11 to Step 5's poll loop (or an inline poll) the same way codes 10/14 route there; or document that 11 is fatal and drop the "(poll)" contract from the gate header.

**Agreement:** 1/2 (challenge-1 only).

### Finding 6 — MEDIUM · mechanical · actionable · `.bkit/scripts/bkit-ship-gate.sh:175,283-293`

**`2>&1` merges gh stderr into the captured JSON — a successful `gh api` that emits any stderr noise corrupts jq parsing and yields a false code-10.**

`if ! RUNS_JSON=$(gh api "..." 2>&1); then` (`:175`) and the jobs query (`:283`) merge stderr into stdout. On a _successful_ gh call that still writes a warning/deprecation/notice line to stderr (real gh does this under `GH_DEBUG`, deprecation headers, or transport notices), `RUNS_JSON` becomes `<stderr-noise><json>` → `jq` parse fails → `TOTAL_COUNT` defaults to `0` (`:195`) → false `refuse 10` ("no run"). The jobs query has the same shape: a noisy success → `CAPSTONE_JOB` empty → false `refuse 13` ("capstone ABSENT"). Both mis-classify a healthy run as a structural refusal.

**Exploit scenario:** any production run where `gh api` emits stderr noise on a successful call (deprecation header, transport notice, GH_DEBUG-enabled operator shell). Healthy run refused → spurious re-validate loop or Failure Path.

**Suggested fix:** capture stderr separately (`RUNS_JSON=$(gh api "..." 2>/tmp/gh-err)` or drop `2>&1` and let stderr surface naturally); only the non-zero exit should drive the code-20 path.

**Agreement:** 1/2 (challenge-1 only).

### Finding 7 — MEDIUM · mechanical · actionable · `.bkit/workflows/bkit-ship.md:631-632`

**Gate-refusal routing depends on the agent shell NOT having `set -e` — `GATE_EXIT=$?` is unreachable when the gate exits non-zero under `set -e`.**

```bash
bash "$GATE_SH" assert --head "$GATE_HEAD" --repo "{OWNER_REPO}"
GATE_EXIT=$?
```

Under `set -e` (a common agent-shell default), a gate refusal (exit 10/11/12/13/14/15/16/20) aborts the script on the `bash "$GATE_SH"` line, so `GATE_EXIT=$?` and the entire routing block (`:634-641`) never execute — the refusal becomes a hard, unhandled abort with no `ship-gate-refusal` status row and no Step-5/Failure-Path routing. Contrast `:610` (`ANCESTOR=$(... && echo true || echo false)`) which is `set -e`-safe by construction.

**Exploit scenario:** any ship run executed in a `set -e` shell where the gate refuses. Refusal becomes an unhandled abort — no telemetry, no Failure Path, no audit row.

**Suggested fix:** `bash "$GATE_SH" assert ... || GATE_EXIT=$?` (and initialise `GATE_EXIT=0` before), or wrap in `set +e ... set -e`.

**Agreement:** 1/2 (challenge-1 only).

### Finding 8 — LOW · mechanical · actionable (informational) · `tests/fixtures/gh/bin/gh:90-94`

**Test gh stub URL extraction without sanitization — SHA flows unsanitized into path construction (copy-paste hazard).**

The SHA extracted from the URL (`SHA="${URL##*\?head_sha=}"; SHA="${SHA%%&*}"`) flows unsanitized into `F="$RUNS_DIR/$SHA.json"`. A SHA containing `../` would path-traverse out of `RUNS_DIR`.

**Exploit scenario:** none in production — the stub is test-only (never shipped; the install manifest in `.bkit/version` lists only `.bkit/scripts/`, `.claude/`, `.cursor/`, `.opencode/` paths; `tests/` is repo-local to bkit). SHAs are controlled fixture names. Flagged as a copy-paste hazard: if the dispatch pattern is copied into production code, the path-traversal surface activates.

**Suggested fix:** assert `[[ "$SHA" =~ ^[A-Za-z0-9._-]+$ ]]` before path construction.

**Agreement:** 1/2 (challenge-2 only).

## Not-Actionable / Accepted Residual Risk

The following surfaces were reviewed and explicitly cleared (no finding):

- **Force-push in Path B2** — scoped to literal `feat/{FID}`; `{FID}` asserted `^[0-9]+-[a-z0-9-]+$`; Tier-2 invariant GREEN (`bkit-ship-invariants.test.ts:115-144`); no path reaches `--force-with-lease` against `dev`/`main`. (Cleared by both lenses; C2 vector 5.)
- **Merge gate CI assertion** — structurally sound (workflow-scoped run query, exact-head validation, capstone-by-name, vacuous-green detection, `[skip ci]` title assertion, `--match-head-commit` TOCTOU-safe). Residual risk (custom `workflow_dispatch` inputs) explicitly accepted in `docs/deployments.md`. (Cleared by C2 vector 4.)
- **status.jsonl writes** — all `jq -nc --arg`-shaped; no PII/secrets; FID allowlisted blocks traversal. (Cleared by C2 vector 3.)
- **gh stub harness** — not shipped; no token read; PATH-shim only in bats `setup()`. (Cleared by C2 vector 2.)
- **`.deferred-blocked` sentinel** — low-impact routing only; neither route bypasses merge gate. (Cleared by C2 vector 6.)
- **Template/mirror rendering** — static literals; placeholders JSON-escaped by MCP transport. (Cleared by C2 vector 7.)

## Verdict Rationale

1 CRITICAL finding (Finding 1 — B2 conflict resolution silently lost) drives canonical Verdict = FAIL. The defect is in the design's self-described "common case" path (Path B), and `--force-with-lease` pushes a branch whose fix is uncommitted, then `worktree remove --force` destroys the only copy. The merge either fails (still CONFLICTING) or, worse, merges unmerged-conflict content. This is a data-integrity hole, not a telemetry nicety.

The security lens (C2) found no CRITICAL findings and cleared all seven focus vectors; its MEDIUM overlap with C1's MEDIUM (Finding 4) is merged here. The two HIGH findings (jq telemetry bug, update-branch error guard) and remaining MEDIUMs are all actionable mechanical fixes.

Worst-of-two-inputs verdict = FAIL (C1's FAIL dominates C2's CONCERNS).
