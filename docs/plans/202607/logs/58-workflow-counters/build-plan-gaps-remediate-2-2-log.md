Verdict: PASS
Strategy: PIVOT

<!-- verdict:end -->

# Plan Gaps

## Scope

Closing `build-plan-verify-2-2.md`'s single BLOCKING gap: 6 newly-converted `DEBUG_ATTEMPT` sites in `.bkit/workflows/bkit-debug.md` derived `N+1` where `:366` `workflow-meta debugAttempt` marker had already recorded invocation's `N`. Scoping (cross-run, item 8), widened T5.3 detector, and `blockDerivesCounter` confirmed sound by verifier — NOT touched.

## Pivot rationale

Prior (STANDARD) cycle converted 6 sites by copying `:184-185` shape verbatim, per plan ("COPY the `:184-185` fold into every consuming fenced block"). That copy is the bug: `:184-185` is **pre-marker** derive (Step 1, before `:366` Step 2 marker write); `+1` correct only there. Copying into **post-marker** blocks (Step 3, Step 4) carries `+1` into context where fold already reflects current invocation.

Abandoned "copy by position/shape" → per site: **does this block run before or after `:366` marker write?** Pre-marker → keep `+1`. Post-marker → drop `+1`, adopt form from Step 4 status-update block (previously `:678`, now `:705`), incl. `[ "$DEBUG_ATTEMPT" -gt 0 ] || exit 2` guard in place of `PRIOR_DEBUG_ATTEMPT`.

## The 6 sites — before/after

All 6 in `.bkit/workflows/bkit-debug.md`, identical 2-line buggy form (2-line comment preceding, byte-identical):

```
# DEBUG_ATTEMPT is a CROSS-run invocation index — COPIED from :184-185, not
# moved; re-derived here because this block reads it for a filename path.
PRIOR_DEBUG_ATTEMPT=$(jq -s -r "$BKIT_STATUS_FOLD"' fold | [.[] | select(.workflow=="debug")] | last.debugAttempt // 0' "$STATUS" 2>/dev/null || echo 0)
DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))
```

Converted (single `Edit` with `replace_all`, byte-identical at every site) to:

```
# DEBUG_ATTEMPT is a CROSS-run invocation index — COPIED from :184-185, not
# moved; re-derived here because this block reads it for a filename path.
# By this point in the run, the debug-worktree-setup block in Step 2 has
# already recorded this invocation's debugAttempt marker, so no +1 is
# needed here (unlike Step 1's pre-marker derive at :184-185).
DEBUG_ATTEMPT=$(jq -s -r "$BKIT_STATUS_FOLD"' fold | [.[] | select(.workflow=="debug")] | last.debugAttempt // 0' "$STATUS" 2>/dev/null || echo 0)
[ "$DEBUG_ATTEMPT" -gt 0 ] || exit 2
```

<!-- prettier-ignore -->
| # | Step / block | Lines (post-edit; orig in parens) |
| --- | --- | --- |
| 1 | Step 3 "Run verbatim" — `debug-input-${DEBUG_ATTEMPT}.md` `[live=off]` | `:421` → `:433` |
| 2 | Step 4.2 CI-failure — `debug-context-ci-${DEBUG_ATTEMPT}.md` | `:553` → `:568` |
| 3 | Step 4.3 diff — `debug-context-diff-${DEBUG_ATTEMPT}.md` | `:576` → `:594` |
| 4 | Step 4.4 local-tests — `debug-context-tests-local-${DEBUG_ATTEMPT}.md` | `:596` → `:617` |
| 5 | Step 4.5 e2e — `debug-context-tests-e2e-${DEBUG_ATTEMPT}.md` / `debug-e2e-${DEBUG_ATTEMPT}/` | `:608` → `:632` |
| 6 | Step 4.7 runtime-fetch — `debug-context-runtime-<name>-${DEBUG_ATTEMPT}.md` | `:649` → `:676` |

Pre-existing canonical form (originally `:678`, now `:705`, Step 4.9 status-update/artifact-glob) **not** touched — already right; 6 sites now match.

## Pre-marker sites — clarifying comments added, logic unchanged

3 genuinely pre-marker sites (`:184-185` Step 1 bullet 7 extract, `:212-213` Step 1 bullet 8 SOAK-escalation routing, `:356-357` Step 2 bullet 7 worktree-setup) — arithmetic unchanged, all keep `+1` — each now has explicit comment stating pre-marker and why `+1` correct (future reader cannot mistake asymmetry for oversight):

- `:184-185`: "This is a PRE-MARKER derive... +1 is correct (unlike post-marker sites in Steps 3-4...)".
- `:212-213`: existing cross-run-scoping comment extended — "still PRE-MARKER derive (runs before Step 2's :366 marker write), so +1 correct here, same as :184-185."
- `:356-357`: existing comment extended — "PRE-MARKER derive (debugAttempt marker below not written yet), so +1 correct — unlike post-marker sites in Steps 3-4."

## Fixture proof (real fold, not assumption)

Post-marker fixture matching verifier scenario — `status.jsonl` with `workflow-started` → `debug-start-workflow` step-done → `workflow-meta {debugAttempt:1}` → `debug-worktree-setup` step-done (invocation N=1, marker written) — ran REAL `.bkit/templates/.bkit/scripts/bkit-status-fold.sh` fold (scratch dir):

```
raw fold (post-marker) = 1
OLD post-marker form (wrong) = 2
NEW post-marker form (fixed) = 1
```

Fold already returns `1` post-marker; old `+1` → `2` (verifier overshoot); new form → `1`.

## The two live consequences — both resolved

1. **Artifact-glob mismatch (`FETCH_VERDICT=FAIL` every run).** All 5 filename-writing blocks (CI, diff, tests-local, tests-e2e, runtime) + artifact-glob loop Step 4.9 (`:705` onward) now derive `DEBUG_ATTEMPT` identically (no `+1`, same fold, same guard). At N=1 → `*-1.md`/`*-1/`; glob at `:709-711` matches. Verified post-fix (`.bkit/workflows/bkit-debug.md:433,568,594,617,632,676,705` share identical no-`+1` derive line) — writers `*-2.md` vs glob `*-1.md` divergence gone.
2. **`[live=off]` silently ignored.** Step 3 derive at (old) `:421` → no-`+1` at `:433` → reads `debug-input-1.md` — file Step 2's `:356-357` (pre-marker, `+1`, N=1 first invocation) wrote. Grep hits → `[live=off]` honoured. (`2>/dev/null` on `jq` unchanged from canonical `:678`/`:705` shape per task — guards missing `bkit-status-fold.sh` variable/malformed jq, not missing status file; corpus-wide `2>/dev/null` on `decide_next`/`check_max` — Gate 2b metric — remains 0.)

## Permanent regression test added (corpus rule, not fixture)

Corpus rule preferred over bats fixture → `.bkit/src/bkit-counter-prose-audit.test.ts` (new `describe`, "`#58 DEBUG_ATTEMPT off-by-one regression`"):

- Locates `:366` marker-write line by literal `--argjson da "$DEBUG_ATTEMPT" ... debugAttempt:$da` text → file offset.
- Extracts every fenced block with cross-run fold (`last.debugAttempt`) via T5.3 fenced-block regex; classifies by block-start offset vs marker offset.
- Asserts: every **pre-marker** block uses `DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))`; every **post-marker** does NOT.
- Sanity pins real-corpus shape (`10` total fold-deriving blocks: `3` pre-marker, `7` post-marker) — cannot silently pass on zero blocks.

Real-corpus positional check → re-runs against real file every `pnpm test`; would catch post-marker regaining `+1` or pre-marker losing it.

Verified: `npx vitest run .bkit/src/bkit-counter-prose-audit.test.ts -t "off-by-one regression"` → 3/3 pass.

## Verification run this session

<!-- prettier-ignore -->
| Command | Result |
| --- | --- |
| `pnpm typecheck` | clean |
| `pnpm format:check` | clean after formatting this log (prettier flagged only this new log mid-session) |
| `pnpm slop:delta` | `added 0, resolved 0, worsened 0; net findings 0, net score 0.00` — OK |
| `pnpm lint:prose` | 1 pre-existing warning at `docs/architecture.md:156` (not touched, same as attempt 1) |
| `pnpm test` | 2254 passed (up from 2251 — 3 new off-by-one regression tests), 3 failed (same expected-RED `T5.1: no bare *_ATTEMPT token in non-fenced prose` — out of scope, WS-4 in sub-plan 3), 2 skipped, 1 todo. No other regressions. |
| `npx --yes bats tests/*.bats` | 68/68 green |
| `git status --short` | only `.bkit/src/bkit-counter-prose-audit.test.ts`, `.bkit/workflows/bkit-debug.md`, this log modified/added; no mirror drift |
| — | No `pnpm bkit install`. Fixture proof in scratch-dir `status.jsonl` — nothing to restore |

## Re-ticked boxes (evidence-gated)

- **T3.4** (`58-workflow-counters-plan-2.md:310`) — `[x]`. Every `DEBUG_ATTEMPT`-referencing block derives in-block with arithmetically correct form for position relative to `:366` marker; `grep -c 'select(.workflow=="debug")] | last.debugAttempt' .bkit/workflows/bkit-debug.md` = 10 (>= 3); T5.3 zero remaining `DEBUG_ATTEMPT` violations (full T5.3 real-corpus test passing).
- **Gate 2b** (`:342`) — `[x]`. T3.0–T3.7 all `[x]`; T5.3 green over all 5 workflows; `grep -rn 'Increment .*_ATTEMPT' .bkit/workflows/` empty; `grep -rn 'decide_next\|check_max' .bkit/workflows/ | grep -c '2>/dev/null'` = 0.

## Remediation Log

DONE — Gap 1 (build-plan-verify-2-2.md's single BLOCKING gap): off-by-one in 6 post-marker `DEBUG_ATTEMPT` sites (`bkit-debug.md` Step 3 run-verbatim; Step 4 CI/diff/tests-local/tests-e2e/runtime blocks) — replaced copied pre-marker `PRIOR_DEBUG_ATTEMPT=$(fold); DEBUG_ATTEMPT=$((PRIOR+1))` with canonical post-marker no-`+1` form (`DEBUG_ATTEMPT=$(fold); [ "$DEBUG_ATTEMPT" -gt 0 ] || exit 2`) from adjacent Step 4.9 block; clarifying comments on 3 genuine pre-marker sites; proven against real `bkit-status-fold.sh` with post-marker fixture (fold=1, old form=2, new form=1) (`.bkit/workflows/bkit-debug.md`)
DONE — Added permanent real-corpus regression test classifying every `DEBUG_ATTEMPT` fold-derive block by position relative to `:366` marker write and asserting `+1` usage matches (3 pre-marker with `+1`, 7 post-marker without) — class T5.3/T5.4 cannot see (`.bkit/src/bkit-counter-prose-audit.test.ts`)
DONE — Re-ticked T3.4 and Gate 2b in `58-workflow-counters-plan-2.md`, evidence-gated per checks above
DONE — Full verification battery (typecheck, format:check, slop:delta, lint:prose, pnpm test, bats) — all pass except 3 expected-RED T5.1 tests (explicitly out of scope, WS-4 in sub-plan 3)
