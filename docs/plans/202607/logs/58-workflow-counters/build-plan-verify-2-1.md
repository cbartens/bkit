Verdict: FAIL
Failures: 3

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 2 (`docs/plans/202607/58-workflow-counters-plan-2.md`), KN-26 atomic core. Attempt 1 of `MAX_VERIFY_ATTEMPT`=3.

## Sub-Plans Verified

None (Single scope).

## Integration Gaps

None (Single scope).

## Previously Attempted

None — first verification for sub-plan 2.

## Notes

**Executor PASS / 21 tasks ticked — evidence does not support T5.3, T3.0, Gate 2b.** Six checkboxes reverted `[ ]`: T5.3, T3.0, Gate 2b, Verification Plan "Completeness rule green (T5.3)" / "T5.3 demonstrably fires", Handoff `unconverted-sites.txt`.

### Central finding: rule fitted, not converged

Executor: T5.3 authored **after** conversion (inverts T3.0 run-first-then-convert). Reported 18/19 "matching plan exactly" — **by construction**, not measurement.

Method: inject bare counter read into real non-deriving block `bkit-build.md:57-67`; `npx vitest run .bkit/src/bkit-counter-prose-audit.test.ts -t "T5.3"`. Six shapes, restore between (`shasum`: `7a4c84ea0d349b260e7bb7d76fe052abe97c785c`).

<!-- prettier-ignore -->
| Shape injected | T5.3 |
| --- | --- |
| `echo "$TEST_ATTEMPT"` | **REDS** |
| `echo $TEST_ATTEMPT` (unquoted) | GREEN — **escapes** |
| `echo "${TEST_ATTEMPT}"` | GREEN — **escapes** |
| `jq -nc --argjson a "${TEST_ATTEMPT}" >> "$STATUS"` | GREEN — **escapes** |
| `jq -nc --argjson a $TEST_ATTEMPT >> "$STATUS"` | GREEN — **escapes** |
| `echo "$TEST_ATTEMPT"` in 4-backtick nested fence (`:1211-1216`) | **REDS** |
| `jq -nc --argjson a "$TEST_ATTEMPT"` in VERIFY-deriving block (`:539`) | GREEN — **escapes** |

Rule matches only `"$NAME"` — shape finished conversion left. Plan T5.3 `:247` requires bare `$X_ATTEMPT` / `${X_ATTEMPT}` in scope. Comment `:517-529` cites filename Edge Case but claims JSON-typed `attempt` coverage — shape D escapes. Narrowing unsound on stated terms.

### What holds (verified)

- **KN-26 pair shipped.** `check_max` + `decide_next` (`.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`): `case "$_val" in '' | *[!0-9]*)` → stderr + `return 2`, nothing stdout; `0` legal. `grep -rn 'decide_next\|check_max' .bkit/workflows/ | grep -c '2>/dev/null'` = **0**.
- **Trap 10b arithmetic.** `bkit-build.md:836`: `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` → `THRESHOLD=0`; first pass count=0 → continue (`step-11`); second pass → Failure Path. `:759`/`:810` write blocks use `counter_count`. `bkit-debug.md:504`: SOAK `counter_count --since soakEntryAt` + `check_max`; 0 → Step 4. No `counter_current` at these sites.
- **Trap 10c.** `bkit-debug.md:437-449`: "**no commit** — KN-26"; **0** `git commit`.
- **Trap 8.** `:184`, `:356` full cross-run fold; `:366` `--argjson da "$DEBUG_ATTEMPT"`; fold count = 4 (>=3 required).
- **Fence-regex fix genuine.** ``(`{3,})[\w]_\n([\s\S]_?)\1`` — 57 blocks in `bkit-build.md`; probe G reds. T5.3 defect = reference-detector, not fence scoping.
- **No regression.** 4 inert primitives; mirrors untouched; `npx --yes bats tests/*.bats` → **68/68 green**; `git status` clean.

### Cosmetic (not graded)

- T3.6 Done-when `grep -c soakEntryAt` = 4; actual = 11 (3 writers + 3 readers + prose). Substance correct.
- Executor line refs drift; content matches.

### Remediation

Gaps 1–2: widen detector to `\$\{?NAME\}?`, bind `blockDerivesCounter` to counter-specific assignment. Gap 3: re-run capture against `origin/dev` before re-ticking T3.0; if count moves → STOP per Done-when. T3.1–T3.9 conversion + guard hardening likely stand.

## Identified Gaps Log

1. **[BLOCKING] T5.3 blind spot on `${X_ATTEMPT}`.** `findIncompleteBlocks` (`.bkit/src/bkit-counter-prose-audit.test.ts:567`): `new RegExp(`"\\$${name}"`)` — `"$NAME"` only. Probed `bkit-build.md:57-67`: unquoted, braced, `--argjson` shapes GREEN. Plan `:247` names `${X_ATTEMPT}` in scope.
2. **[BLOCKING] `blockDerivesCounter` counter-name-blind.** `:549`: any derive satisfies any counter. `--argjson a "$TEST_ATTEMPT"` in VERIFY block (`:539`) stays GREEN. All 18 converted sites contain some derive → blind spot covers corpus.
3. **[BLOCKING] T5.3 green not completeness proof; rule fitted.** T3.0 Done-when (`:299`): RED output = file source (regenerated, not typed). `unconverted-sites.txt:3-8`: rule authored AFTER conversion — RECONSTRUCTION. Gaps 1+2 explain 18/19 convergence by construction. T3.0 + Gate 2b unticked.
