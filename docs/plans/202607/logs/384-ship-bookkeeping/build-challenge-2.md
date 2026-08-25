Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge — Round 2 (Security Lens)

Lens: Security — auth, secrets, input validation, data exposure, OWASP, RLS / tenancy.

## Scope

Re-probe of the NOW-REMEDIATED diff for `384-ship-bookkeeping` (8 round-1 findings fixed). Verify fix security posture AND hunt for new attack surface introduced by the remediation itself. Diff scope: `origin/dev..HEAD`.

## Round-1 fix verification (security posture)

All 8 round-1 findings re-audited at HEAD. Posture:

<!-- prettier-ignore -->
| # | R1 Finding | R1 Severity | Fix at HEAD | Security posture |
| --- | --- | --- | --- | --- |
| 1 | B2 staging silently lost | CRITICAL | `git add -u && git add $BOOK_PATHS` + pathspec-free commit (`bkit-ship.md:470-471`) | **SAFE.** `-u` stages tracked modifications (the conflict resolutions); bookkeeping allow-list layered via the second `add`. `.env*` is gitignored (`docs/security.md:56`) so secrets cannot ride `-u`. Path specs are literal — no injection. |
| 2 | jq telemetry literal bug | HIGH | `--argjson timeout "${SHIP_CI_WAIT_TIMEOUT_S:-1800}"` + `$timeout` in object (`bkit-ship.md:539-540`) | **SAFE.** Value no longer interpolated into single-quoted jq program. |
| 3 | Missing `update-branch` guard | HIGH | `\|\| { echo …; exit 1; }` (`bkit-ship.md:451`) | **SAFE.** Failure now routes to Failure Path; no unintegrated merge. `{PR_NUMBER}` is integer-sourced from `gh pr list --jq '.[0].number'` (Step 2) — no injection into the echo. |
| 4 | STATUS_PATH not exported / set -u / audit silence | MEDIUM | Workflow exports STATUS_PATH (`:641`); gate uses `${STATUS_PATH:-}`; stderr fallback (`gate:148-160`) | **PARTIAL — see Finding 1 below.** Facets (a) export + (b) set -u safe are correct; facet (c) "NEVER invisible" claim is unmet for the `/dev/null` case R1 explicitly flagged. |
| 5 | Code 11 dead branch | MEDIUM | Step 6.4 routes code 11 → Step 5 (`bkit-ship.md:653`) | **PARTIAL — see Finding 2 below.** Code 11 no longer hard-fails, but Step 5's poll loop is head-movement-conditional — Path A gets a no-poll loop. No merge bypass. |
| 6 | `2>&1` corrupts jq | MEDIUM | Both `gh api` captures dropped `2>&1` (`gate:182, 290`); 4 remaining `2>&1` are `command -v` guards (correct) | **SAFE.** Verified at HEAD. |
| 7 | `set -e` unreachable routing | MEDIUM | `GATE_EXIT=0` + `bash "$GATE_SH" … \|\| GATE_EXIT=$?` (`bkit-ship.md:644-645`) | **SAFE.** Refusal captured before abort; routing + telemetry row execute. |
| 8 | SHA sanitization in test stub | LOW | `[[ "$SHA" =~ ^[A-Za-z0-9._-]+$ ]]` before path construction (`tests/fixtures/gh/bin/gh:112`) | **SUFFICIENT.** Blocks `/` (path traversal), whitespace, glob metachars, ANSI/control chars. Test-only stub. |

### Answers to the 5 round-2 questions

1. **STATUS_PATH export — secret exposure?** No. The exported value is `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — a docs log path with no secret material. `$BOOK_ROOT` is `$REPO_ROOT` or `$WT_TOP` (filesystem paths only). `{FID}` is regex-asserted (`bkit-ship.md:248`). `status.jsonl` carries only `jq -nc --arg`-shaped step rows (no PII/secrets — cleared in round 1). The export propagates only to subprocesses (gate + jq), none of which log env. No new exposure.
2. **`git add -u` safety?** Safe for the security lens. `-u` stages modifications to TRACKED files only (untracked files excluded). `.env*`, `.DS_Store`, `*.log`, `node_modules/` are gitignored (`docs/security.md:56`, `bkit-ship.md:31`) → not stageable. Path specs are literal (no injection / traversal). The round-1 data-loss hole (silent discard of conflict resolutions) is closed. Minor residual: the orchestrator does not run `git status --short` between subagent return and `git add -u` to scope-verify the diff — but this is a process/correctness concern, not a security concern (no secret can leak via a tracked-file mod because tracked files don't include secrets).
3. **SHA sanitization sufficient?** Yes. Regex `^[A-Za-z0-9._-]+$` requires ≥1 char, blocks `/` (path traversal), `\`, whitespace, glob metachars (`*`, `?`, `[`), and ANSI/control chars. The subsequent `"$F"` is quoted. Even `..` (two dots without `/`) becomes the literal filename `..json` inside `RUNS_DIR`, not a traversal. Test-only stub; copy-paste hazard mitigated.
4. **New attack surface from error guards / routing?** Two residual items (see Findings 1 + 2 below): the override-audit sinkhole (R1-incomplete) and the Path-A code-11 no-poll loop. Neither bypasses the merge gate, force-push, or secret boundary. The new error guards (`update-branch \|\| exit 1`, `GATE_EXIT=0 … \|\| GATE_EXIT=$?`, jq `--argjson timeout`) are mechanically sound — all interpolated values are integer-sourced or `jq -nc --arg`-escaped.
5. **Merge gate / override escape / force-push still secure?** Yes, at the structural level. Merge uses `--match-head-commit "$GATE_HEAD"` (TOCTOU-safe, `bkit-ship.md:658`). Override honours ONLY when `OVERRIDE_SHA == HEAD_SHA` (`gate:141`) — exact-pin, no arbitrary-head bypass. Force-push remains scoped to `feat/{FID}` (`bkit-ship.md:472`), FID regex-asserted (`:248`); no path reaches `--force-with-lease` against `dev`/`main`. The only residual is the audit-trail sinkhole (Finding 1), which weakens the override's "trust the caller + audit row" contract but does not bypass the gate.

## Findings Log

### Finding 1 — MEDIUM · mechanical · actionable · `.bkit/scripts/bkit-ship-gate.sh:153-160` (and template twin)

**`STATUS_PATH=/dev/null` (or any writable sinkhole) still silently defeats the override audit row — round-1 Finding 4 facet 3 NOT fully remediated.**

The round-1 fix replaced `>> "$status" 2>/dev/null \|\| true` with a conditional stderr fallback:

```bash
if [ -n "$status" ] && printf '%s\n' "$row" >> "$status" 2>/dev/null; then
  : # audit row landed in the canonical status.jsonl
else
  err "override audit row (STATUS_PATH unset/unwritable: …), emitting to stderr:"
  printf '%s\n' "$row" >&2
fi
```

The fallback fires only when the write FAILS. Empirically verified: `STATUS_PATH=/dev/null` makes the `printf >> /dev/null` succeed (exit 0), so the `if` branch fires, the row is discarded, and the stderr fallback NEVER emits. The remediate-log's claim that "the override is NEVER invisible" is unmet for the exact scenario round-1 flagged ("operator or compromised workflow sets `STATUS_PATH=/dev/null`").

The unset / permission-denied cases ARE correctly handled (stderr fallback fires — verified). Only writable-but-discarded sinkhole paths slip through.

**Exploit scenario:** an operator (or a workflow compromised via prose edit — `bkit-ship.md:641` is prose-resolvable) sets `BKIT_SHIP_GATE_OVERRIDE=<refused-head>` AND `STATUS_PATH=/dev/null` (or `/tmp/audit.log` they control and can shred). The gate exits 0 → Step 6 merges → the `type:"ship-gate-override"` audit row "lands" at the sinkhole → the documented rollback grep (`grep "ship-gate-override" status.jsonl`, `docs/deployments.md` § Ship gate step 3) misses it. The escape hatch's contract is "trust the caller + audit row"; this breaks the audit half for the sinkhole case.

**Suggested fix (mechanical, surgical):** emit the audit row to stderr UNCONDITIONALLY alongside the file write (the file write is best-effort; stderr is the immutable audit trail):

```bash
# ALWAYS emit to stderr (immutable audit trail)...
err "override honoured for head $HEAD_SHA — audit row:"
printf '%s\n' "$row" >&2
# ...THEN best-effort append to STATUS_PATH (canonical log).
if [ -n "$status" ]; then
  printf '%s\n' "$row" >> "$status" 2>/dev/null || err "STATUS_PATH '$status' unwritable — stderr copy above is the audit of record"
fi
```

This makes the override NEVER invisible regardless of where `STATUS_PATH` points — closing the round-1 threat model without depending on the write failing.

### Finding 2 — LOW · mechanical · informational · `.bkit/workflows/bkit-ship.md:519-546, 653`

**Round-1 Finding 5 fix is partial in Path A — code 11 routes to Step 5, but Step 5's poll loop is head-movement-conditional, creating a no-poll loop until workflow timeout.**

Step 6.4 routing (`:653`) now sends code 11 → Step 5 (re-validate). But Step 5's CI poll loop (`:522`) fires only when `CURRENT_HEAD != ENTRY_HEAD`. In Path A (dev is ancestor — head unchanged), `CURRENT_HEAD == ENTRY_HEAD`, so the poll block is skipped; Step 5 runs the deferred sweep (`:548`) and routes back to Step 6 → gate emits code 11 again → Step 5 → … a no-op loop with no actual CI polling.

**Exploit scenario (benign):** any Path-A ship where build's CI is still in-progress when ship reaches Step 6 (e.g., ship started immediately after a fast build's green capstone was superseded by a re-run, or build's CI is slow). The loop runs until workflow/agent timeout, consuming `gh pr view` / `gh run list` calls. **NOT a security bypass** — Step 7 merge is never reached (gate still emits code 11, which doesn't merge), no force-push occurs, no secret exposure. The residual concern is API rate-limit exhaustion (benign self-DoS), which could degrade subsequent `gh` calls in the same workflow.

**Suggested fix (mechanical):** route code 11 to an inline poll at Step 6 (mirroring Step 5's `DEADLINE`/`ATTEMPT` loop but unconditionally — not gated on head movement), OR document the precondition that code 11's "(poll)" contract only triggers actual polling in Path B (head moved) and add a Step 6 inline poll for the Path-A case.
