Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 2 (`docs/plans/202607/58-workflow-counters-plan-2.md`), KN-26 atomic core. Attempt 2 of `MAX_VERIFY_ATTEMPT`=3.

## Sub-Plans Verified

None (Single scope).

## Integration Gaps

None (Single scope).

## Previously Attempted

`build-plan-verify-2-1.md` — FAIL/3. All three gaps **CLOSED** (below). FAIL here = **new** defect in 6 reconciliation sites — not attempt 1 restatement.

## Notes

**Attempt 1 gaps fixed. Remediation widened rule + bound derive + found 6 real sites — but all 6 derive wrong number (off by one).**

### Attempt 1 gaps — CLOSED (re-probed)

Python injection into `bkit-build.md:57-67`; restore + `shasum` `7a4c84ea0d349b260e7bb7d76fe052abe97c785c`.

<!-- prettier-ignore -->
| Shape injected | Attempt 1 | Attempt 2 (widened) |
| --- | --- | --- |
| `echo "$TEST_ATTEMPT"` | REDS | **REDS** |
| `echo $TEST_ATTEMPT` | **escaped** | **REDS** |
| `echo "${TEST_ATTEMPT}"` | **escaped** | **REDS** |
| `jq -nc --argjson a "${TEST_ATTEMPT}"` | **escaped** | **REDS** |
| `jq -nc --argjson a $TEST_ATTEMPT` | **escaped** | **REDS** |
| `--argjson a "$TEST_ATTEMPT"` in deriving block | **escaped** | **REDS** (Gap 2) |

- **Gap 1:** `findIncompleteBlocks` (`:617`) = `\$\{?NAME\}?\b`.
- **Gap 2:** `blockDerivesCounter` (`:589`) binds assignment target. `TEST_ATTEMPT` in VERIFY block reds; `VERIFY_ATTEMPT` in same block stays GREEN.
- **Gap 3:** Real dev-baseline re-run. `origin/dev` `bkit-debug.md`: zero derive calls; 6 `${DEBUG_ATTEMPT}` blocks at `:379`, `:485-489`, `:501`, `:508`, `:514-521`, `:554` — genuinely unconverted.

### `\b` blind spot probes

<!-- prettier-ignore -->
| Probe | Result |
| --- | --- |
| `echo "${TEST_ATTEMPT:-0}"` | REDS |
| `echo "${TEST_ATTEMPT}x"` | REDS |
| `echo "$MAX_TEST_ATTEMPT"` | GREEN (exemption) |
| `echo '{TEST_ATTEMPT}'` | GREEN (exemption) |
| `echo '$TEST_ATTEMPT'` (literal) | REDS — **false positive, not graded** |

### BLOCKING: 6 new sites derive N+1; marker recorded N

Claims (b)(d) hold; **(c) fails** — arithmetic wrong, not active-run scoping. All 10 folds cross-run; zero `counter_count`/`counter_current` on `debugAttempt`. Item 8 honoured.

`:366` writes `workflow-meta debugAttempt` **N** (Step 2, `:282`). Post-marker fold returns **N**, not N-1:

- **Pre-marker — `PRIOR+1` correct:** `:184`, `:212`, `:356` (all `< 366`).
- **Post-marker — `PRIOR+1` WRONG:** `:421`, `:553`, `:576`, `:596`, `:608`, `:649` — **the 6 new sites**.
- **`:678` knows:** direct no-`+1` form + comment "marker already recorded … no +1 needed".

Fixture (marker `debugAttempt:1`): fold = **1**; `:678` → **1**; 6 sites → **2**.

**Silent consequences:**

1. **`:649` writes `*-2.md`; `:678` globs `*-1.md`** — same for `:553`/`:576`/`:596`/`:608` → `ARTIFACTS` empty → `FETCH_VERDICT=FAIL`.
2. **`:421` greps `debug-input-2.md`; `:356` wrote `debug-input-1.md`** — `2>/dev/null` hides miss → `[live=off]` ignored.

Plan line 291: _"Getting it wrong is silent: valid JSON, wrong number, green T5.3."_ Pre-conversion: wrong provenance, right value; now: right provenance, wrong value — **behaviour regression**.

### Nothing else regressed

- KN-26 pair, Trap 10b/10c, item 8 intact. 4 inert primitives. Mirrors untouched. Bats **68/68**. 3 T5.1 REDs expected (sub-plan 3 WS-4) — not counted.

### Checkbox honesty

- **T5.3 `[x]`** — rule widened, bound, fires; corpus green.
- **T3.0 `[x]`** — real dev re-run; 18/19 → 24/25 in `unconverted-sites.txt`; STOP clause satisfied.
- **T3.4 → `[ ]`** — derives in-block but wrong invocation index.
- **Gate 2b → `[ ]`** — complete but not correct.

### Remediation

At `:421`, `:553`, `:576`, `:596`, `:608`, `:649`: replace `PRIOR+1` with `:678` post-marker form + guard. Keep cross-run scoping (item 8). Consider bats pin for post-marker N.

## Identified Gaps Log

1. **[BLOCKING] 6 post-marker `DEBUG_ATTEMPT` sites derive N+1 after `:366` marker recorded N.** Sites: `bkit-debug.md:421`, `:553`, `:576`, `:596`, `:608`, `:649` — `PRIOR_DEBUG_ATTEMPT=$(fold); DEBUG_ATTEMPT=$((PRIOR+1))`. Marker at `:366` (Step 2 `:282`). Fixture: fold=1; 6 sites=2; `:678`=1. Consequences: artifact glob mismatch → `FETCH_VERDICT=FAIL`; `:421` live=off ignored. Invisible to T5.3/T5.4. Fix: adopt `:678` form at all 6. Pre-marker `:184`, `:212`, `:356` unchanged. T3.4 + Gate 2b unticked.

_Non-blocking:_ widened detector reds literal `'$TEST_ATTEMPT'` (false positive); no corpus instance; do NOT narrow regex.
