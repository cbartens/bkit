Verdict: PASS
Strategy: STANDARD

<!-- verdict:end -->

# Plan Gaps

## Scope

Closing `build-plan-verify-2-1.md`'s FAIL (3 blocking gaps, all in T5.3's completeness rule inside `.bkit/src/bkit-counter-prose-audit.test.ts`). T3.1–T3.9 conversion stood unchanged, not touched.

## Gap 1 — reference-detector blind spot on `${X_ATTEMPT}` / unquoted forms

**Fixed.** `findIncompleteBlocks` reference test (`.bkit/src/bkit-counter-prose-audit.test.ts`) was `new RegExp(`"\\$${name}"`)` — exact double-quoted bare form only. Widened to ``new RegExp(`\\$\\{?${name}\\}?\\b`)`` — matches `$NAME`, `${NAME}`, `"$NAME"`, `"${NAME}"` in any position. `${X_ATTEMPT}` NOT exempt anywhere (incl. filename/comment interpolation) per owner's confirmed criterion. Prior scope-decision comment carving filename exemption (citing Edge Cases row) removed; replaced with comment why carve-out failed and was deleted. Only `MAX_NAME` bare names and non-`$` `{NAME}` placeholders remain exempt — structurally (no `$` adjacent to `name`), not via separate exemption regex.

**Shape coverage (RED-proof evidence, all permanent tests in file, `describe("#58 T5.3...")`):**

<!-- prettier-ignore -->
| Shape | Test | Result |
| --- | --- | --- |
| `echo "$TEST_ATTEMPT"` (quoted bare) | `RED-PROOF (shape): echo "$TEST_ATTEMPT" ...` | PASS (reds a non-deriving block) |
| `echo $TEST_ATTEMPT` (unquoted bare) | `RED-PROOF (shape): echo $TEST_ATTEMPT ...` | PASS |
| `echo "${TEST_ATTEMPT}"` (quoted braced) | `RED-PROOF (shape): echo "${TEST_ATTEMPT}" ...` | PASS |
| `jq -nc --argjson a "${TEST_ATTEMPT}" >> "$STATUS"` (the literal #58 defect, braced) | `RED-PROOF (shape): jq ... "${TEST_ATTEMPT}" ...` | PASS |
| `jq -nc --argjson a $TEST_ATTEMPT >> "$STATUS"` (unquoted argjson) | `RED-PROOF (shape): jq ... $TEST_ATTEMPT ...` | PASS |
| `jq -nc --argjson a "$TEST_ATTEMPT"` inside a block deriving a DIFFERENT counter (VERIFY_ATTEMPT) | `RED-PROOF (shape): a bare $TEST_ATTEMPT read inside a block that derives a DIFFERENT counter ...` | PASS (Gap 2 proof) |
| `MAX_TEST_ATTEMPT` bare / `${MAX_TEST_ATTEMPT}` | `does not flag a MAX_TEST_ATTEMPT reference as a TEST_ATTEMPT violation ...` | PASS (never falsely counted) |

Full `npx vitest run .bkit/src/bkit-counter-prose-audit.test.ts -t "T5.3"` → **10/10 pass** (1 real-corpus + 9 RED-proofs, up from prior 3).

## Gap 2 — `blockDerivesCounter` counter-name-blind

**Fixed.** Was `/\bcounter_(?:next|current|count)\s+"[^"]+"\s+\S+/.test(block)` — true if ANY derive call for ANY counter in block. Rebound to counter's OWN assignment target: ``new RegExp(`\\b${name}\\s*=\\s*\\$\\(\\s*counter_(?:next|current|count)\\b`)``, verified against real corpus universal `NAME=$(counter_next|current|count ...)` shape (`grep -n 'counter_\(next\|current\|count\)'` across all 3 workflow files — every real site uses this form). `DEBUG_ATTEMPT`'s two derive shapes (`PRIOR_DEBUG_ATTEMPT=...; DEBUG_ATTEMPT=$((PRIOR...+1))` two-line, and direct `DEBUG_ATTEMPT=$(...last.debugAttempt...)` one-line) covered by requiring assignment TARGET named `DEBUG_ATTEMPT` alongside fold expression in same block. RED-proof added and passing: `RED-PROOF (shape): a bare $TEST_ATTEMPT read inside a block that derives a DIFFERENT counter (VERIFY_ATTEMPT) still reds`.

## Gap 3 — the rule was fitted, not converged; T3.0 reconciliation

**Reconciled honestly, per T3.0 Done-when.** Re-ran widened rule against `origin/dev` (`a1041973`) fully-unconverted `.bkit/workflows/*.md` (`git show origin/dev:...` into scratch dir, standalone script replicating widened detector — no working-tree checkout). Confirmed `origin/dev` zero `counter_next`/`counter_current`/`counter_count` calls (fully pre-conversion baseline).

**Result: widened rule finds 6 genuinely new sites narrow rule's 18/19 tally never saw** — all `DEBUG_ATTEMPT`, all in `bkit-debug.md`, all reading `${DEBUG_ATTEMPT}` bare in filename/path construction with no in-block derive:

1. Step 3 "Run Tests" verbatim-test-scope — `debug-input-${DEBUG_ATTEMPT}.md` (`[live=off]` check).
2. Step 4.2 "Fetch Context" CI-failure — `debug-context-ci-${DEBUG_ATTEMPT}.md`.
3. Step 4.3 diff — `debug-context-diff-${DEBUG_ATTEMPT}.md`.
4. Step 4.4 local-tests — `debug-context-tests-local-${DEBUG_ATTEMPT}.md`.
5. Step 4.5 e2e — `debug-context-tests-e2e-${DEBUG_ATTEMPT}.md` / `debug-e2e-${DEBUG_ATTEMPT}/`.
6. Step 4.7 runtime-fetch — `debug-context-runtime-*-${DEBUG_ATTEMPT}.md`.

**All 6 converted** this session — each block sources `bkit-status-fold.sh`, re-derives `DEBUG_ATTEMPT` via same cross-run fold expression (COPIED from `:184-185`, not moved, per § Breaking Changes item 8), before filename use. Real fix, not test-narrowing: blocks read model-authored `$DEBUG_ATTEMPT` shell expansion with no in-session setter — #58 defect shape on filename instead of `--argjson` payload.

**Reconciled count: 18 + 6 = 24 sites / 19 + 6 = 25 references** (up from 18/19). Remaining diff between widened dev-capture raw block-level hit count (31: build 10, debug 17, ship 4) and reconciled 24/25 are NOT further new sites — `decide_next`/`check_max` routing blocks that `unconverted-sites.txt`'s "Routing sites re-derive the SAME counters" note already documented; never part of original 18/19 tally; widened rule confirms already converted (0 violations in current tree).

`unconverted-sites.txt` appended (not rewritten — original 18/19 preserved as historical record) with reconciliation section: count, 6 new sites, why routing-block difference is not further gap.

Full reconciliation detail: `docs/plans/202607/logs/58-workflow-counters/unconverted-sites.txt` (appended section at EOF).

## Re-ticked boxes (evidence-gated, per instruction 5)

- **T5.3** (`58-workflow-counters-plan-2.md:247`) — `[x]`. Rule widened, fires on all shapes, real corpus green.
- **T3.0** (`:298`) — `[x]`. Worklist regenerated + honestly reconciled to 24/25; divergence documented per Done-when STOP-and-reconcile clause.
- **Gate 2b** (`:342`) — `[x]`. `grep -rn "Increment .*_ATTEMPT" .bkit/workflows/` → empty. `grep -rn 'decide_next\|check_max' .bkit/workflows/ | grep -c '2>/dev/null'` → 0. T5.3 green over all 5 workflows.
- **Handoff `unconverted-sites.txt` box** (`:361`) — `[x]`.
- **Verification Plan "Completeness rule green (T5.3)"** (`:374`) — `[x]`.
- **Verification Plan "T5.3 demonstrably fires"** (`:375`) — `[x]`.

## Verification run this session

<!-- prettier-ignore -->
| Command | Result |
| --- | --- |
| `pnpm typecheck` | clean |
| `pnpm format:check` | clean (prettier auto-fixed whitespace in test file; content unchanged) |
| `pnpm lint:slop` | 10 findings, all pre-existing — none in session's edited files |
| `pnpm slop:delta` | `added 0, resolved 0, worsened 0; net findings 0, net score 0.00` — OK |
| `pnpm lint:prose` | 1 pre-existing warning at `docs/architecture.md:156` (out of scope) |
| `pnpm test` | **2251 passed**, 3 failed (expected-RED `T5.1: no bare *_ATTEMPT token in non-fenced prose` — out of scope, WS-4 in sub-plan 3), 2 skipped, 1 todo. No other regressions. |
| `npx --yes bats tests/*.bats` | **68/68 green** |
| `git status --short` | only 4 intended files modified + 1 new log; no mirror drift (`.claude/.cursor/.opencode` untouched); `red-vs-dev.txt` untouched |
| — | No `pnpm bkit install` run |

## Remediation Log

DONE — Gap 1: T5.3 reference-detector blind spot on `${X_ATTEMPT}`/unquoted shapes — widened to `\$\{?NAME\}?\b` catching all 4 previously-escaping shapes plus originally-caught form; 9 permanent RED-proofs added and passing (`.bkit/src/bkit-counter-prose-audit.test.ts`)
DONE — Gap 2: `blockDerivesCounter` counter-name-blind — bound to specific counter's own assignment target (`NAME=$(counter_next|current|count ...)`, or DEBUG_ATTEMPT's fold-assignment pair); RED-proof added and passing (`.bkit/src/bkit-counter-prose-audit.test.ts`)
DONE — Gap 3: T3.0 reconciliation against widened rule + origin/dev baseline — found and converted 6 genuinely new DEBUG_ATTEMPT filename-reference sites in `bkit-debug.md` (Run Tests step 2; Fetch Context steps 2,3,4,5,7); reconciled count 18/19 → 24/25, documented in `unconverted-sites.txt`
DONE — Re-tick T5.3, T3.0, Gate 2b, Handoff unconverted-sites.txt box, and two Verification Plan T5.3 boxes in `58-workflow-counters-plan-2.md` — all evidence-gated, verified before ticking
DONE — Full verification battery (typecheck, format:check, lint:slop, slop:delta, lint:prose, pnpm test, bats) — all pass except 3 expected-RED T5.1 tests (explicitly out of scope, WS-4 in sub-plan 3)
