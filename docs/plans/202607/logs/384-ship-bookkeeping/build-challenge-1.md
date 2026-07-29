Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge — Round 2 (post-remediation)

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

Re-probe of the NOW-REMEDIATED diff (`origin/dev..HEAD`, 89 files, +9089/-1273) after round 1 found 8 issues (1 CRITICAL + 2 HIGH + 4 MEDIUM + 1 LOW). All 8 findings were remediated in `build-challenge-remediate-log.md` (Verdict: PASS). This round verifies the 8 fixes are correct and complete, and looks for NEW issues introduced by the fixes or missed in round 1.

Partial-diff coverage: none — full diff reviewed with focus on the 6 remediated surfaces (`bkit-ship.md` + 3 mirrors, `bkit-ship-gate.sh` + template, `tests/fixtures/gh/bin/gh`) and the surrounding merge-gate / conflict-resolution / error-path vectors.

## Remediation Verification (8/8 fixes confirmed correct)

| #   | Finding                                                 | Fix                                                                                                                              | Verified                                                                                                                                  |
| --- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | B2 conflict staging lost                                | `git add -u && git add $BOOK_PATHS` + pathspec-free commit                                                                       | ✅ `.bkit/workflows/bkit-ship.md:470-472` + 3 mirrors identical; Tier-2 F1 regression test (`bkit-ship-invariants.test.ts:336-354`) GREEN |
| 2   | jq telemetry literal                                    | `--argjson timeout "${SHIP_CI_WAIT_TIMEOUT_S:-1800}"` + `$timeout` in object                                                     | ✅ `:539-541` + 3 mirrors; F2 regression test GREEN                                                                                       |
| 3   | `gh pr update-branch` no guard                          | `\|\| { echo …; exit 1; }`                                                                                                       | ✅ `:451` + 3 mirrors; F3 regression test GREEN                                                                                           |
| 4   | STATUS_PATH not exported / set -u crash / audit silence | (a) `export STATUS_PATH=…` `:641`; (b) `local status="${STATUS_PATH:-}"` `bkit-ship-gate.sh:148`; (c) stderr fallback `:156-160` | ✅ F4a regression test (invariants:399-407) + F4b/F4c bats (`ship-gate.bats:219-236`) GREEN                                               |
| 5   | Code 11 dead branch                                     | Routes 11 → Step 5 alongside 10/14                                                                                               | ✅ `:653` + 3 mirrors; F5 regression test GREEN — **but see Finding 1 (incomplete)**                                                      |
| 6   | `2>&1` stderr merge                                     | Dropped from both `gh api` captures                                                                                              | ✅ `bkit-ship-gate.sh:182,290` + template byte-identical; F6 bats GREEN                                                                   |
| 7   | `set -e` gate routing                                   | `GATE_EXIT=0` + `\|\| GATE_EXIT=$?`                                                                                              | ✅ `:644-645` + 3 mirrors; F7 regression test GREEN                                                                                       |
| 8   | Test stub SHA unsanitized                               | `[[ "$SHA" =~ ^[A-Za-z0-9._-]+$ ]]`                                                                                              | ✅ `tests/fixtures/gh/bin/gh:112`; F8 bats GREEN                                                                                          |

All 8 fixes are mechanically correct at their remediated surface. The gate script's two copies (installed + template) are byte-identical. All 4 workflow mirrors carry the same shell/routing content at the edited offsets. The Tier-2 invariant file gained 6 new regression assertions (one per markdown-resident finding) and the bats suite gained 4 (one per gate/stub-resident finding).

## Findings Log

### Finding 1 — MEDIUM · mechanical · `.bkit/workflows/bkit-ship.md:653` (routing) + `:519-545` (Step 5 re-validate gate)

**Code 11 routing is incomplete — Step 5's poll loop only fires on head MOVEMENT, so a gate-emitted 11 (CI in-progress, head unchanged) loops back to Step 6 without polling.**

The F5 fix routed code 11 → Step 5 alongside codes 10/14 (`:653`). But Step 5's re-validate poll loop (`:531-537`) is entirely inside `if [ "$CURRENT_HEAD" != "$ENTRY_HEAD" ]` (`:522`). For the exact scenario Finding 5 identified — Path A where build's CI is still in-progress when ship reaches the gate — the head has NOT moved, so Step 5 skips the poll, runs the deferred-sweep subagent unconditionally (`:548+`), and routes back to Step 6 (`:575`). The gate emits code 11 again. Loop.

The routing has **no max-attempts guard**: `MAX_MERGE_ATTEMPT=3` (`bkit-counter-bus-config.sh:22`) is consulted ONLY at `:699` for the `state != MERGED` case, not for the code 11/14/10 → Step 5 routing. The `ship-merge-pr` counter increments each iteration (`:610`) but is never checked against the cap on this path.

**Exploit scenario:** any Path-A ship where build's CI hasn't concluded when ship reaches Step 6 (slow suite, queued runner). Each loop iteration invokes the `@bkit-ship-deferred-sweep` subagent (expensive — spawns an agent) + the gate (≥2 `gh api` calls) + writes 2+ status rows. Bounded only by CI completion (or GitHub's 6h job timeout). In a stuck-runner scenario this is a resource-amplification vector: hundreds to thousands of subagent invocations + API calls + status.jsonl bloat. The original behavior (code 11 → immediate Failure Path) was fail-closed; the fix traded a false negative for an unbounded loop that doesn't actually poll.

**Suggested fix:** Step 5's re-validate block should fire when invoked from a gate refusal (not only on head movement). Either: (a) pass a `REVALIDATE_REASON=in-progress|head-moved` flag from Step 6.4 routing and have Step 5 poll when reason is `in-progress` regardless of head movement; or (b) route code 11 to an inline poll at Step 6.4 (before delegating to Step 5) with its own `SHIP_CI_WAIT_TIMEOUT_S` deadline; or (c) add a `MAX_GATE_POLL_ATTEMPTS` guard on the code 11 → Step 5 routing so the loop fails-closed after N iterations. The F5 regression test (`bkit-ship-invariants.test.ts:412-421`) only asserts the routing DIRECTIVE in prose (`code 11 ... Step 5`); it does not verify polling behaviour, so the test passes despite the incomplete fix.

### Finding 2 — LOW · mechanical · `.bkit/workflows/bkit-ship.md:470`

**`git add -u` in B2 re-opens Finding 6's leftover-staging concern and misses NEW files the conflict-resolve subagent may create.**

The F1 fix changed `git add $BOOK_PATHS` to `git add -u && git add $BOOK_PATHS`. `git add -u` stages ALL tracked modifications/deletions in the worktree — not just the conflict-resolve subagent's resolutions. If build/debug left dirty tracked files in the shared worktree (Finding 6's original "stages whatever build or debug left dirty" concern), `git add -u` stages them, the `[skip ci]` conflict-resolve commit carries them, `--force-with-lease` pushes them to `feat/{FID}`, and Step 6 squash-merges them to `dev`. Additionally, `git add -u` does NOT stage NEW (untracked) files the subagent may create (e.g., a new helper module imported by the resolved code) — those are lost and the merge fails to build.

The Tier-2 invariant test `every git add resolves via BOOK_PATHS` (`bkit-ship-invariants.test.ts:174-189`) has a **coverage gap**: it checks the regex per-LINE, not per-COMMAND. The line `git add -u && git add $BOOK_PATHS` passes because the regex `\bgit\s+add\b.*\$?BOOK_PATHS` matches the second command, but the first `git add -u` does NOT resolve via BOOK_PATHS — violating the invariant's spirit ("every git add resolves via this list — never `-A`, never a bare `docs/`"). A future edit that drops the `&& git add $BOOK_PATHS` suffix would still pass the test if `git add -u` shares the line with any BOOK_PATHS reference.

**Exploit scenario:** low likelihood — Step 2 worktree setup starts clean, bookkeeping routes to `$BOOK_ROOT` (not the worktree), and conflict-resolve rarely creates new files. But the risk is not zero: a debug session that modified a tracked fixture without cleanup, or a resolution that extracts a new module, would be silently mis-staged or dropped.

**Suggested fix:** either (a) record `paths-touched-by-subagent` in `ship-conflict-resolve.md` and stage exactly those + `$BOOK_PATHS` (the alternative Finding 1's suggested fix offered); or (b) assert the worktree is clean (`git diff --quiet`) before invoking the conflict-resolve subagent so `git add -u` can only stage the subagent's resolutions; or (c) tighten the Tier-2 invariant test to split on `&&`/`;`/`||` and check each `git add` command separately.

### Finding 3 — LOW · mechanical · `.bkit/scripts/bkit-ship-gate.sh:156-160`

**Stderr fallback comment overclaims "documented rollback grep still surfaces it".**

The F4c fix added a stderr fallback when STATUS_PATH is unset/unwritable:

```bash
# NEVER invisible: STATUS_PATH unset/unwritable → emit to stderr so the
# documented rollback grep (deployments.md § Ship gate) still surfaces it.
err "override audit row (STATUS_PATH unset/unwritable: ...), emitting to stderr:"
printf '%s\n' "$row" >&2
```

But `docs/deployments.md:210` documents the rollback procedure as:

> **Audit any `BKIT_SHIP_GATE_OVERRIDE` rows** in `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`

The documented grep targets `status.jsonl`, NOT stderr. When STATUS_PATH is unwritable and the row goes to stderr, the documented rollback grep misses it (the row is in agent shell logs, not status.jsonl). The comment's claim is misleading. The behaviour itself is an improvement (override no longer completely invisible — it surfaces on stderr) and the production case is correct (F4a's `export STATUS_PATH=` means the row lands in status.jsonl and the grep works), but the edge-case comment overclaims.

**Exploit scenario:** none — behaviour is improved. The comment is documentation drift.

**Suggested fix:** correct the comment to: "emit to stderr so the override is visible in agent shell logs; the documented `status.jsonl` rollback grep surfaces it ONLY when STATUS_PATH is writable (the production case via Step 6's `export STATUS_PATH=`)." Or stronger: write the fallback row to a sibling `.ship-gate-override.log` under `$BOOK_ROOT` so a `grep -r ship-gate-override $BOOK_ROOT` catches both.

## Not-Actionable / Verified Clean

The following surfaces were re-reviewed and explicitly cleared (no new finding):

- **All 8 round-1 fixes** — mechanically correct at their remediated surface; regression tests (6 Tier-2 + 4 bats) cover each finding; 4 workflow mirrors byte-consistent; gate script installed/template pair byte-identical.
- **`export STATUS_PATH` leak** — only consumer is the gate subprocess; no subsequent step reads STATUS_PATH; export is scoped to Step 6's fenced block.
- **`GATE_EXIT` capture under `set -e`** — `|| GATE_EXIT=$?` is the canonical set -e-safe pattern; handles signal exits (>128) and unknown codes (fail-closed to Failure Path).
- **`--argjson code "$GATE_EXIT"`** — GATE_EXIT is initialised to 0 before the gate call, never empty; `$?` is always numeric.
- **SHA sanitization regex** `^[A-Za-z0-9._-]+$` — accepts real Git SHAs (40-hex), short SHAs, and fixture names (`green-capstone`, `failed`); rejects `../`, spaces, empty; no valid fixture rejected.
- **`gh api` captures without `2>&1`** — stdout stays clean JSON; stderr surfaces naturally; rate_limit queries still use `2>/dev/null` (informational only, not parsing-critical).
- **`git push --force-with-lease` in B2** — B2 is the ONLY step that pushes `feat/{FID}` (Gate 4 `:504`); lease uses remote-tracking ref as expectation; no race in the single-pusher convention.

## Verdict Rationale

No CRITICAL findings. The 8 round-1 fixes are all mechanically correct and covered by regression tests. The most significant NEW issue is Finding 1 (MEDIUM): the F5 fix routed code 11 to Step 5 but Step 5's poll loop is gated on head MOVEMENT, so for the head-unchanged + CI-in-progress case (the exact scenario Finding 5 identified) the fix creates an unbounded subagent-amplification loop instead of polling. This is an incomplete fix, not a correctness bug — the merge gate still validates CI before merging, so no unvalidated content reaches `dev`. The two LOW findings are a staging-hygiene edge case re-opened by the F1 fix and a misleading comment in the F4c stderr fallback.

Max severity = MEDIUM → Verdict = CONCERNS. No CRITICAL → Failures = 0.
