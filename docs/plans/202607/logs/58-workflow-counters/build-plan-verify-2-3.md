Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 2 (`docs/plans/202607/58-workflow-counters-plan-2.md`), KN-26 atomic core. Attempt 3 of `MAX_VERIFY_ATTEMPT`=3.

## Sub-Plans Verified

None (Single scope).

## Integration Gaps

None (Single scope).

## Previously Attempted

`build-plan-verify-2-1.md` (FAIL/3), `build-plan-verify-2-2.md` (FAIL/1). Attempt 1 gaps closed at attempt 2 — not re-litigated. **Attempt 2 BLOCKING off-by-one at 6 post-marker sites — CLOSED** (re-ran attempt-2 fixture against real fold). PIVOT remediation verified independently.

## Notes

### 1. Off-by-one fixed — attempt-2 fixture re-proved

Post-marker fixture (N=1, marker `debugAttempt:1`) vs real `.bkit/templates/.bkit/scripts/bkit-status-fold.sh`:

```
raw fold (post-marker) = 1
NEW 6-site form yields = 1     (was 2 at attempt 2)
:705 canonical yields  = 1
AGREE: YES
```

Marker now `:375`. **3** `+1` sites remain — `:190`, `:220`, `:366` — all pre-marker (`190 < 220 < 366 < 375`). **7** post-marker fold sites (`:433`, `:568`, `:594`, `:617`, `:632`, `:676`, `:705`) — no `+1`. Counts partition: 10 folds, 3 `+1`.

`:366` derive + `:375` marker in **same block** (Step 2 `:352`–`:379`) — `+1` correct (derive computes value marker records).

### 2. Live consequences resolved — behaviour verified

Scratch derive → write → glob:

- **Consequence 1:** 5 writers emit `*-1.md`; `:705` glob matched all five → `ARTIFACTS` non-empty → `FETCH_VERDICT` PASS.
- **Consequence 2:** Step 2 wrote `debug-input-1.md`; Step 3 `:436` grep hit → `[live=off]` honoured.

**Item 8:** second-invocation fixture: pre/post derive both **2**; SOAK escalation intact. 10 verbatim cross-run folds; zero `counter_count`/`counter_current` on `debugAttempt`.

### 3. Regression rule — real, narrower than framing (recorded, not graded)

Rule locates marker by **content** (`/--argjson da "\$DEBUG_ATTEMPT"[\s\S]*?debugAttempt:\$da/`), not hardcoded offset — robust to block moves.

Six acid probes; restore + `shasum` (`23c7339e…` on `bkit-debug.md`):

<!-- prettier-ignore -->
| Probe (post-marker site) | Result |
| --- | --- |
| A. `DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))` | **REDS** |
| B. `DEBUG_ATTEMPT=$((N_PRIOR + 1))` | GREEN — missed |
| C. `+1` inside jq | GREEN — missed |
| D. post-increment | GREEN — missed |
| E. **New** post-marker block, buggy novel shape | **REDS** (count pin) |
| F. **New** post-marker block, correct | **REDS** (count pin) |

`plusOneRe` = one literal shape; B/C/D escape on **existing** blocks. Backstop: `foldBlocks.length === 10` catches add/remove (E). F = deliberate tripwire.

Not graded: (a) no plan Done-when requires this test; (b) T5.4 accepts pinning over proving; (c) catches exact regression + structural change. Title claims "found exactly once" but asserts `markerIndex > -1` only — not live (one marker in corpus).

### 4. Nothing regressed

- KN-26 pair, Trap 10b/10c intact. 4 inert primitives. Mirrors untouched. Bats **68/68**. T5.3 green (7 passed), zero `DEBUG_ATTEMPT` violations.

### 5. 3 T5.1 REDs expected (not graded)

`no bare *_ATTEMPT token in non-fenced prose` on build/debug/ship — cleared by sub-plan 3 WS-4. Out of scope.

### 6. Checkbox honesty — `[x]` supported

- **T3.4:** every `DEBUG_ATTEMPT` block derives in-block; fold count **10**; arithmetic correct at all 10 sites.
- **Gate 2b:** T3.0–T3.7 `[x]`; T5.3 green; `grep -rn 'Increment .*_ATTEMPT'` empty; `2>/dev/null` = 0. Complete **and** correct.

No checkbox corrections.

### Probe hygiene

All probes restored; `shasum` `bkit-debug.md` `23c7339e…`, test file `2f2a19b1…`. `git status --short` — only this artifact.

## Identified Gaps Log

None blocking.

_Non-blocking (sub-plan 3 / follow-up):_

1. **Off-by-one rule shape-fitted.** `plusOneRe` matches only `DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))`. B/C/D pass on rewritten shapes. Mitigated by `foldBlocks.length === 10` pin (E). Marker by content — robust to moves. Harden: generalise to any `+ 1` on fold-derived value; keep count pin.
2. **Sanity test title overclaims** ("found exactly once" vs existence only).
3. **Carried:** T5.3 reds literal `'$TEST_ATTEMPT'` — false positive; do NOT narrow.
4. **T3.4 Done-when wording:** wants "`invocation` and `NOT active-run`"; shipped says "CROSS-run invocation index" — intent satisfied (`:213`, `:768` name asymmetry).
