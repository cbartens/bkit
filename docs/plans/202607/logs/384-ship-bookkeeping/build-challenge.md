Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge — Round 2 (Reconciled)

Two parallel round-2 challenge reports reconciled into one canonical artifact. Both inputs returned CONCERNS / 0 failures (round 1's CRITICAL + 2 HIGH + 4 MEDIUM + 1 LOW were remediated and verified by both lenses this round).

- **build-challenge-1.md** — Bugs / edge-case lens — Verdict: CONCERNS, 0 failures, 3 new findings (1 MEDIUM + 2 LOW).
- **build-challenge-2.md** — Security lens — Verdict: CONCERNS, 0 failures, 2 new findings (1 MEDIUM + 1 LOW).

## Scope

Re-probe of the NOW-REMEDIATED diff (`origin/dev..HEAD`) for ship workflow restructure `384-ship-bookkeeping`. Both lenses confirm all 8 round-1 fixes are mechanically correct at their remediated surface and covered by 6 Tier-2 + 4 bats regression tests. This round hunts for NEW issues introduced by the fixes or missed in round 1.

## Remediation Verification (8/8 confirmed by both lenses)

All 8 round-1 findings (1 CRITICAL + 2 HIGH + 4 MEDIUM + 1 LOW) are verified mechanically correct and regression-covered:

<!-- prettier-ignore -->
| # | R1 Finding | Fix at HEAD | Verified |
| --- | --- | --- | --- |
| 1 | B2 conflict staging lost | `git add -u && git add $BOOK_PATHS` + pathspec-free commit (`bkit-ship.md:470-471`) | ✅ C1, C2 (C2 notes `.env*` gitignored → no secret leak via `-u`) |
| 2 | jq telemetry literal | `--argjson timeout "${SHIP_CI_WAIT_TIMEOUT_S:-1800}"` + `$timeout` (`:539-540`) | ✅ C1, C2 |
| 3 | `update-branch` no guard | `\|\| { echo …; exit 1; }` (`:451`) | ✅ C1, C2 (`{PR_NUMBER}` integer-sourced, no injection) |
| 4 | STATUS_PATH not exported / set -u / audit silence | `export STATUS_PATH=` (`:641`) + `${STATUS_PATH:-}` (`gate:148`) + stderr fallback (`:153-160`) | ✅ facets (a)+(b); facet (c) partial — see Finding 2 |
| 5 | Code 11 dead branch | Routes 11 → Step 5 alongside 10/14 (`:653`) | ✅ routing directive present — but see Finding 1 (incomplete) |
| 6 | `2>&1` corrupts jq | Dropped from both `gh api` captures (`gate:182, 290`) | ✅ C1, C2 |
| 7 | `set -e` gate routing | `GATE_EXIT=0` + `\|\| GATE_EXIT=$?` (`:644-645`) | ✅ C1, C2 |
| 8 | SHA sanitization in stub | `[[ "$SHA" =~ ^[A-Za-z0-9._-]+$ ]]` (`tests/fixtures/gh/bin/gh:112`) | ✅ C1, C2 (blocks `/`, whitespace, glob, control chars) |

## Reconciliation Summary

- **1 overlap merged:** C1-F1 ↔ C2-F2 (Code 11 / Step 5 no-poll loop — same `bkit-ship.md:653` routing + `:519-545` Step 5 poll block, same root cause). Agreement 2/2.
- **1 severity divergence on the merged finding:** C1 = MEDIUM (bug lens: resource-amplification — unbounded subagent invocations + API calls + status.jsonl bloat on Path-A), C2 = LOW (security lens: "NOT a security bypass"). Max-wins → **MEDIUM**. C2's lower rating is a lens-narrow judgment (it explicitly scopes out the bug-lens resource-exhaustion vector), not a downgrade justification citing both reviewers' evidence — so the higher severity stands.
- **3 unique findings kept separate:** C2-F1 (STATUS_PATH sinkhole, MEDIUM), C1-F2 (`git add -u` staging hygiene, LOW), C1-F3 (stderr fallback comment drift, LOW).
- **No CRITICAL.** Max severity = MEDIUM → canonical Verdict = CONCERNS, Failures = 0.

## Findings

Prioritized by descending severity, then reviewer-agreement. All findings are **actionable** (have a surgical mechanical fix).

### Finding 1 — MEDIUM · mechanical · actionable · `.bkit/workflows/bkit-ship.md:653` (routing) + `:519-545` (Step 5 re-validate gate) _(merged: C1-F1 + C2-F2, agreement 2/2)_

**R1 fix #5 (code 11 → Step 5) is incomplete: Step 5's CI poll loop fires only on head MOVEMENT, so a gate-emitted code 11 (CI in-progress, head unchanged) routes back to Step 6 without polling — a no-poll loop.**

The F5 fix routed code 11 → Step 5 alongside codes 10/14 (`:653`). But Step 5's re-validate poll loop (`:531-537`) is entirely inside `if [ "$CURRENT_HEAD" != "$ENTRY_HEAD" ]` (`:522`). For the exact scenario round-1 Finding 5 identified — **Path A** where build's CI is still in-progress when ship reaches the gate — the head has NOT moved (`CURRENT_HEAD == ENTRY_HEAD`), so Step 5 skips the poll, runs the deferred-sweep subagent unconditionally (`:548+`), and routes back to Step 6 (`:575`). The gate emits code 11 again. Loop.

The routing has **no max-attempts guard**: `MAX_MERGE_ATTEMPT=3` (`bkit-counter-bus-config.sh:22`) is consulted ONLY at `:699` for the `state != MERGED` case, not for the code 11/14/10 → Step 5 routing. The `ship-merge-pr` counter increments each iteration (`:610`) but is never checked against the cap on this path. The F5 regression test (`bkit-ship-invariants.test.ts:412-421`) only asserts the routing DIRECTIVE in prose (`code 11 ... Step 5`); it does not verify polling behaviour, so the test passes despite the incomplete fix.

**Exploit scenario:** any Path-A ship where build's CI hasn't concluded when ship reaches Step 6 (slow suite, queued runner, fast build superseded by a re-run). Each loop iteration invokes the `@bkit-ship-deferred-sweep` subagent (expensive — spawns an agent) + the gate (≥2 `gh api` calls) + writes 2+ status rows. Bounded only by CI completion (or GitHub's 6h job timeout). In a stuck-runner scenario this is a **resource-amplification vector**: hundreds to thousands of subagent invocations + API calls + status.jsonl bloat, and benign self-DoS (API rate-limit exhaustion degrades subsequent `gh` calls in the same workflow). **NOT a merge bypass** — the gate still emits code 11 and never reaches Step 7 merge; no force-push; no secret exposure. The original round-1 behavior (code 11 → immediate Failure Path) was fail-closed; the F5 fix traded a false negative for an unbounded loop that doesn't actually poll.

**Severity reconciliation:** C1 rates MEDIUM (resource-amplification, bug lens). C2 rates LOW (security lens: explicitly scoped to "not a security bypass" and only flags benign self-DoS). Max-wins → **MEDIUM**. C2's lower rating is lens-narrow, not a downgrade with evidence.

**Suggested fix (mechanical, surgical):** Step 5's re-validate block should fire when invoked from a gate refusal (not only on head movement). Either: (a) pass a `REVIEW_REASON=in-progress|head-moved` flag from Step 6.4 routing and have Step 5 poll unconditionally when reason is `in-progress`; or (b) route code 11 to an inline poll at Step 6.4 (mirroring Step 5's `DEADLINE`/`ATTEMPT` loop but unconditionally) with its own `SHIP_CI_WAIT_TIMEOUT_S` deadline; or (c) add a `MAX_GATE_POLL_ATTEMPTS` guard on the code 11 → Step 5 routing so the loop fails-closed after N iterations. Strengthen the F5 regression test to assert actual polling behaviour, not just the prose directive.

**Agreement:** 2/2 (C1-F1 + C2-F2 — same file:line cluster, same root cause, merged; severity divergence resolved max-wins to MEDIUM).

### Finding 2 — MEDIUM · mechanical · actionable · `.bkit/scripts/bkit-ship-gate.sh:153-160` (and template twin) _(C2-F1, agreement 1/2 — R1 Finding 4 facet 3 partial regression)_

**`STATUS_PATH=/dev/null` (or any writable sinkhole) still silently defeats the override audit row — round-1 Finding 4 facet 3 ("NEVER invisible") NOT fully remediated.**

The F4c fix replaced `>> "$status" 2>/dev/null || true` with a conditional stderr fallback:

```bash
if [ -n "$status" ] && printf '%s\n' "$row" >> "$status" 2>/dev/null; then
  : # audit row landed in the canonical status.jsonl
else
  err "override audit row (STATUS_PATH unset/unwritable: …), emitting to stderr:"
  printf '%s\n' "$row" >&2
fi
```

The fallback fires only when the write FAILS. C2 empirically verified: `STATUS_PATH=/dev/null` makes `printf >> /dev/null` succeed (exit 0), so the `if` branch fires, the row is discarded, and the stderr fallback NEVER emits. The unset and permission-denied cases ARE correctly handled (stderr fallback fires — verified). Only writable-but-discarded sinkhole paths slip through — the exact scenario round-1 flagged ("operator or compromised workflow sets `STATUS_PATH=/dev/null`"). The remediate-log's claim that "the override is NEVER invisible" is unmet for this case.

The escape hatch's contract is "trust the caller + audit row"; this breaks the audit half for the sinkhole case.

**Exploit scenario:** an operator (or a workflow compromised via prose edit — `bkit-ship.md:641` is prose-resolvable) sets `BKIT_SHIP_GATE_OVERRIDE=<refused-head>` AND `STATUS_PATH=/dev/null` (or `/tmp/audit.log` they control and can shred). The gate exits 0 → Step 6 merges → the `type:"ship-gate-override"` audit row "lands" at the sinkhole → the documented rollback grep (`grep "ship-gate-override" status.jsonl`, `docs/deployments.md` § Ship gate step 3) misses it. Production case (`export STATUS_PATH=` → writable status.jsonl) is correct; only the sinkhole edge leaks.

**Suggested fix (mechanical, surgical):** emit the audit row to stderr UNCONDITIONALLY alongside the (best-effort) file write — stderr is the immutable audit trail:

```bash
# ALWAYS emit to stderr (immutable audit trail)...
err "override honoured for head $HEAD_SHA — audit row:"
printf '%s\n' "$row" >&2
# ...THEN best-effort append to STATUS_PATH (canonical log).
if [ -n "$status" ]; then
  printf '%s\n' "$row" >> "$status" 2>/dev/null || err "STATUS_PATH '$status' unwritable — stderr copy above is the audit of record"
fi
```

This makes the override NEVER invisible regardless of where `STATUS_PATH` points — closing the round-1 threat model without depending on the write failing. (Also resolves the comment overclaim tracked separately as Finding 4.)

**Agreement:** 1/2 (C2-F1 only — security lens; C1's adjacent F3 covers the comment drift at the same `:153-160` block but a different root cause, kept separate).

### Finding 3 — LOW · mechanical · actionable · `.bkit/workflows/bkit-ship.md:470` _(C1-F2, agreement 1/2)_

**`git add -u` in B2 re-opens round-1 Finding 6's leftover-staging concern and misses NEW files the conflict-resolve subagent may create.**

The F1 fix changed `git add $BOOK_PATHS` to `git add -u && git add $BOOK_PATHS`. `git add -u` stages ALL tracked modifications/deletions in the worktree — not just the conflict-resolve subagent's resolutions. If build/debug left dirty tracked files in the shared worktree (R1 Finding 6's original "stages whatever build or debug left dirty" concern), `git add -u` stages them, the `[skip ci]` conflict-resolve commit carries them, `--force-with-lease` pushes them to `feat/{FID}`, and Step 6 squash-merges them to `dev`. Additionally, `git add -u` does NOT stage NEW (untracked) files the subagent may create (e.g., a new helper module imported by the resolved code) — those are lost and the merge fails to build.

C2 notes `-u` is SAFE for the **security** lens (`.env*` is gitignored → no secret leak; tracked files don't include secrets; path specs literal → no injection). The residual here is a process/correctness/hygiene concern, not a security concern — C2 explicitly scoped it out.

The Tier-2 invariant test `every git add resolves via BOOK_PATHS` (`bkit-ship-invariants.test.ts:174-189`) has a **coverage gap**: it checks the regex per-LINE, not per-COMMAND. The line `git add -u && git add $BOOK_PATHS` passes because the regex `\bgit\s+add\b.*\$?BOOK_PATHS` matches the second command, but the first `git add -u` does NOT resolve via BOOK_PATHS — violating the invariant's spirit ("every git add resolves via this list — never `-A`, never a bare `docs/`"). A future edit that drops the `&& git add $BOOK_PATHS` suffix would still pass the test if `git add -u` shares the line with any BOOK_PATHS reference.

**Exploit scenario:** low likelihood — Step 2 worktree setup starts clean, bookkeeping routes to `$BOOK_ROOT` (not the worktree), and conflict-resolve rarely creates new files. But the risk is not zero: a debug session that modified a tracked fixture without cleanup, or a resolution that extracts a new module, would be silently mis-staged or dropped.

**Suggested fix (mechanical):** either (a) record `paths-touched-by-subagent` in `ship-conflict-resolve.md` and stage exactly those + `$BOOK_PATHS`; or (b) assert the worktree is clean (`git diff --quiet`) before invoking the conflict-resolve subagent so `git add -u` can only stage the subagent's resolutions; or (c) tighten the Tier-2 invariant test to split on `&&`/`;`/`||` and check each `git add` command separately.

**Agreement:** 1/2 (C1-F2 only — bug lens; C2 explicitly cleared `-u` for the security lens with the residual scoped as non-security).

### Finding 4 — LOW · mechanical · actionable (informational) · `.bkit/scripts/bkit-ship-gate.sh:156-160` _(C1-F3, agreement 1/2)_

**Stderr fallback comment overclaims "documented rollback grep still surfaces it" — the documented grep targets `status.jsonl`, not stderr.**

The F4c fix added:

```bash
# NEVER invisible: STATUS_PATH unset/unwritable → emit to stderr so the
# documented rollback grep (deployments.md § Ship gate) still surfaces it.
```

But `docs/deployments.md:210` documents the rollback procedure as:

> **Audit any `BKIT_SHIP_GATE_OVERRIDE` rows** in `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`

The documented grep targets `status.jsonl`, NOT stderr. When STATUS_PATH is unwritable and the row goes to stderr, the documented rollback grep misses it (the row is in agent shell logs, not status.jsonl). The comment's claim is misleading. The behaviour itself is an improvement (override no longer completely invisible — it surfaces on stderr) and the production case is correct (F4a's `export STATUS_PATH=` means the row lands in status.jsonl and the grep works), but the edge-case comment overclaims. This is documentation drift, not a behaviour regression.

**Exploit scenario:** none — behaviour is improved. The comment is doc drift.

**Suggested fix (mechanical):** correct the comment to: "emit to stderr so the override is visible in agent shell logs; the documented `status.jsonl` rollback grep surfaces it ONLY when STATUS_PATH is writable (the production case via Step 6's `export STATUS_PATH=`)." Note: adopting Finding 2's suggested fix (unconditional stderr emit alongside the file write) makes the corrected comment accurate and subsumes this concern.

**Agreement:** 1/2 (C1-F3 only — bug lens; C2's F1 covers the behaviour hole at the same `:153-160` block but a different root cause, kept separate).

## Not-Actionable / Verified Clean

The following surfaces were re-reviewed by both lenses and explicitly cleared (no new finding):

- **All 8 round-1 fixes** — mechanically correct at their remediated surface; regression tests cover each finding; 4 workflow mirrors byte-consistent; gate script installed/template pair byte-identical.
- **`export STATUS_PATH` leak** — only consumer is the gate subprocess; value is a docs log path with no secret material (`$BOOK_ROOT`/`$WT_TOP` are filesystem paths; `{FID}` regex-asserted `:248`); no subsequent step reads STATUS_PATH; export scoped to Step 6's fenced block. No new exposure.
- **`GATE_EXIT` capture under `set -e`** — `|| GATE_EXIT=$?` is the canonical set-e-safe pattern; handles signal exits (>128) and unknown codes (fail-closed to Failure Path).
- **`--argjson code "$GATE_EXIT"`** — GATE_EXIT initialised to 0 before the gate call, never empty; `$?` always numeric.
- **SHA sanitization regex** `^[A-Za-z0-9._-]+$` — accepts real Git SHAs (40-hex), short SHAs, fixture names; rejects `/`, `..` traversal, spaces, glob metachars, ANSI/control chars; no valid fixture rejected.
- **`gh api` captures without `2>&1`** — stdout stays clean JSON; stderr surfaces naturally; rate_limit queries still use `2>/dev/null` (informational only).
- **`git add -u` security posture** — SAFE for security lens: `-u` stages tracked modifications only; `.env*`/`.DS_Store`/`*.log`/`node_modules/` gitignored; path specs literal. (Residual staging hygiene is Finding 3, not a security concern.)
- **`git push --force-with-lease` in B2** — B2 is the ONLY step that pushes `feat/{FID}` (Gate 4 `:504`); lease uses remote-tracking ref as expectation; no race in the single-pusher convention.
- **Merge gate structural security** — `--match-head-commit "$GATE_HEAD"` (TOCTOU-safe `:658`); override honours ONLY when `OVERRIDE_SHA == HEAD_SHA` (`gate:141`, exact-pin, no arbitrary-head bypass); force-push scoped to `feat/{FID}`, FID regex-asserted (`:248`); no path reaches `--force-with-lease` against `dev`/`main`.

## Verdict Rationale

No CRITICAL findings. Both round-2 lenses confirm all 8 round-1 fixes are mechanically correct and regression-covered. Four NEW findings emerged this round, all from incomplete fixes or adjacent surfaces — none bypass the merge gate, force-push boundary, or secret boundary:

- **Finding 1 (MEDIUM, merged 2/2)** — F5 fix routed code 11 to Step 5 but Step 5's poll loop is head-movement-conditional → Path-A no-poll loop with no max-attempts guard. Resource-amplification vector (subagent + API + status.jsonl bloat) on slow/stuck CI. Not a merge bypass; gate still validates before any Step 7 merge.
- **Finding 2 (MEDIUM, C2)** — F4c fix's conditional stderr fallback only fires on write failure; `STATUS_PATH=/dev/null` succeeds the write so the override audit row is silently discarded. R1 F4 facet 3 partial regression for the sinkhole case the threat model flagged. Closes with an unconditional stderr emit.
- **Finding 3 (LOW, C1)** — F1 fix's `git add -u` re-opens leftover-staging hygiene + misses untracked files; Tier-2 invariant has a per-line-not-per-command coverage gap. Low likelihood; not a security concern.
- **Finding 4 (LOW, C1)** — F4c fix's comment overclaims the documented grep catches the stderr copy. Doc drift; subsumed by Finding 2's fix.

Max severity = MEDIUM → canonical Verdict = CONCERNS. No CRITICAL → Failures = 0. Worst-of-two-inputs verdict = CONCERNS (both inputs CONCERNS).
