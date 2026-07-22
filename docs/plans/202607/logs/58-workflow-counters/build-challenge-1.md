Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

Probed SHIPPED scripts (`.bkit/scripts/bkit-status-fold.sh`, `.bkit/scripts/bkit-counter-bus.sh`, `bkit-counter-bus-config.sh`) with real `status.jsonl` fixtures under jq 1.7.1. No CRITICAL defect: fail-closed contract holds under every corruption/edge input; derivation arithmetic correct at boundaries. Two LOW robustness observations + accepted-design confirmations follow.

## Findings Log

### F1 — LOW — mechanical — `.bkit/scripts/bkit-counter-bus.sh:126`

EMPTY `--sub-plan` silently degrades to "no sub-plan filter" (counts ALL sub-plans), not fail-closed.

Repro:

```
counter_count s2.jsonl build build-plan-verify --sub-plan ""   # -> 3 (all subPlans), exit 0
counter_count s2.jsonl build build-plan-verify --sub-plan 1    # -> 2
counter_count s2.jsonl build build-plan-verify --sub-plan bad  # -> exit 2 (fail-closed, correct)
```

Cause: `--argjson sp "${_cc_subplan:-null}"` — `:-null` fires for both OMITTED `--sub-plan` and PASSED-but-empty, conflating "no filter requested" with "filter requested on empty value". Non-numeric correctly rejected (jq argjson parse fails → exit 2); only empty string slips through as null.

Impact: every VERIFY_ATTEMPT site passes `--sub-plan "$SUB_PLAN"` (`bkit-build.md:536,554,584,646`). `SUB_PLAN` is model-substituted `{SUB_PLAN}` placeholder, not shell-derived. Model substitutes empty → VERIFY_ATTEMPT derived across ALL sub-plans' verify rows (over-count) instead of fail-closed → premature Failure Path. Fail-safe-ish (over-count → early stop, not silent overrun); only on model-side empty substitution → LOW. `SUB_PLAN` provenance outside "number's provenance moves" change, but empty-degradation is shipped-script property this feature relies on. Suggested fix: reject empty `_cc_subplan` explicitly, or document if empty-means-omitted (mistyped empty `SUB_PLAN` otherwise undetectable).

### F2 — LOW / informational — architectural — resume interleave, `bkit-build.md:336-339`

"Flagged, not proven" run-boundary interleave: PROVEN. Build run IN_PROGRESS with spent budget → COMPLETED debug run → resumed → RESETS every active-run build counter to fresh budget.

Repro (fixture `il.jsonl`: build IN_PROGRESS w/ 3 `build-run-tests` rows → debug workflow-started/step/workflow-done):

```
# before resume guard runs:
counter_next il.jsonl build build-run-tests   -> 4
# resume guard: LATEST=(.[-1]//{}) = debug/DONE, != build IN_PROGRESS
#   -> appends a NEW build workflow-started
counter_next il.jsonl build build-run-tests   -> 1   (RESET)
# fold now: [build/IN_PROGRESS/3steps, debug/DONE/1, build/IN_PROGRESS/0] ; last build = empty
```

Assessment — NOT new defect: (a) `.[-1]`-last-run-overall resume guard PRE-EXISTS this feature (diff: only `FOLD` → `BKIT_STATUS_FOLD` rename); (b) counter reset consistent with run model resume guard imposes — fresh build run → fresh (0) budget correct; counters track pre-existing restart decision; (c) plan flagged it; active-run-scoping-resets-budget is deliberate DE-25 design; (d) triggering sequence (debug completes while build IN_PROGRESS on same FID) operationally unusual, warned ("No concurrent bkit workflows on one clone"). Recorded for reconcile; LOW/informational — reset at most budget-over-permissive, never hard failure; code this feature did not author.

## Probed and found SOLID (coverage)

- **First-attempt boundary (0 rows → next=1):** `counter_count`=0/exit0, `counter_next`=1, `counter_current` refuses (exit 2). Correct at every position.
- **sub-plan isolation:** subPlan 1/2 coexisting derive 2/1 independently; step-name filter exact (`.step==$s`, not prefix) — no cross-step/subplan bleed.
- **Fail-closed on corrupt input:** malformed NDJSON → exit 2; truncated final line (crash mid-append) → exit 2; missing/unreadable file → exit 2; empty file → 0/exit 0. No `2>/dev/null` swallow leaves bad value usable.
- **Fail-closed value/max validation:** empty, non-integer (`abc`), negative (`-1`), trailing-space (`"2 "`) → exit 2 + stderr diagnostic, no stdout. Leading-zero `007` accepted (digits-only); `test -gt` treats as DECIMAL (010>8 = GT), not octal — jq `length` never emits leading zeros → unreachable from derivation.
- **Zero threshold:** `check_max X 0 0` → exit 0; `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` → `THRESHOLD=0` reproduces `< 1` gate byte-for-byte via `decide_next`. Legitimate 0 not rejected.
- **decide_next exit-code routing:** `2/3`→cont/exit0, `4/3`→excd/exit1, empty/nonint →exit2 (no stdout). Branch selection correct.
- **Dedup collision (same wall-second + same parentSha):** collapses to 1 (accepted per plan T5.4 / SOAK-collapse); differing second OR parentSha → counts both. One in-corpus non-advancing-parentSha site: `debug-run-tests` (one row per iteration) — no in-run collapse. Accepted design.
- **SOAK `--since soakEntryAt`:** counts only rows after workflow-meta marker; absent marker degrades to all-run count via `run[$since] // ""` (`.at > ""` always true) — documented fallback.
- **DEBUG_ATTEMPT cross-run vs siblings active-run:** `last.debugAttempt` carries across two completed invocations (=2); sibling active-run `debug-run-tests` resets to 0 in second invocation. Asymmetry holds.
- **Single-point-of-failure fold source:** all 49 `. .../bkit-status-fold.sh` lines in build/debug/ship carry `|| { echo ...; exit 2; }`; every `counter_*` assignment carries `|| exit 2`; `counter_count` re-checks `[ -z "$BKIT_STATUS_FOLD" ]` — empty-but-sourced fold still fails closed. No fail-open source site.
- **Shipped/manifest wiring:** `bkit-status-fold.sh` (new) + updated `bkit-counter-bus.sh` hash in `.bkit/version`; `bkit-counter-bus-config.sh` (source + template mirror) exists, sourced at every `decide_next`/`check_max` site (build:580,833,1047) — no missing-MAX regression.

Left tree clean bar this artifact; all fixtures in session scratchpad.
