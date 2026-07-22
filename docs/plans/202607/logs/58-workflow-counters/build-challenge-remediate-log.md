Verdict: PASS

<!-- verdict:end -->

# Build Challenge Remediation Log

## Fix chosen

jq-boundary coercion (not shell-side `case` guard). Rationale: fix report preferred coercing at shell entry — tightest, most local fix; matches feature doctrine (trustworthy derivation, not downstream patch). Applied **identically** at all three sites — no mixing forms.

Each `PRIOR_DEBUG_ATTEMPT=$(jq -s -r "$BKIT_STATUS_FOLD"' fold | [.[] |
select(.workflow=="debug")] | last.debugAttempt // 0' "$SRC"/"$STATUS"
2>/dev/null || echo 0)` became:

```
... | (last.debugAttempt // 0) | (tonumber? // 0)
```

`tonumber?` on number/numeric-string passes through; on non-numeric string (incl. crafted `x[$(cmd)]`) raises jq error → `?` suppresses to empty stream → outer `// 0` defaults to `0`. `0 + 1 = 1` — correct first-attempt answer for PRE-marker derive, matching fold's `// 0` null-case intent (per report: exactly right, not merely tolerable).

## Sites touched (exactly 3, confirmed)

`.bkit/workflows/bkit-debug.md`:

| Line   | Source    | Feeds                                                 |
| ------ | --------- | ----------------------------------------------------- |
| `:189` | `$SRC`    | `:190` `DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))`   |
| `:219` | `$SRC`    | `:220` `+1`, inside `MAX_DEBUG_ATTEMPT` routing block |
| `:364` | `$STATUS` | `:365` `+1`, Step 2 Worktree Setup                    |

Confirmed: `grep -c 'DEBUG_ATTEMPT=\$((PRIOR_DEBUG_ATTEMPT + 1))'` = 3 before/after; `git diff --stat` on `bkit-debug.md` → "6 changed lines, 3 insertions(+), 3 deletions(-)" — one line per site (jq program string), nothing else.

**Seven** post-marker `DEBUG_ATTEMPT=$(jq ...)` sites (`:432/:567/:593/:616/:631/:675/:704`, each gated `[ "$DEBUG_ATTEMPT" -gt 0 ] || exit 2`) left untouched per report completeness note — `test`/`[ -gt ]` performs no arithmetic re-evaluation; poisoned value errors fail-closed without executing. Verified post-fix by inspection + unmodified bats T2.7/T2.9 (`decide_next`/`check_max` fail-closed) — 45/45 green.

## Repro: before/after, legit-value preservation

Crafted `status.jsonl` row `{"type":"workflow-meta","workflow":"debug","debugAttempt":"x[$(touch /tmp/PWNED...)]"}` (preceded by required `workflow-started` row for `lastIdx("debug")`); ran actual jq derive under GNU bash (5.3.9 aarch64 + system 3.2.57 `/bin/bash`):

| Phase        | Result                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-fix**  | `PRIOR_DEBUG_ATTEMPT` → literal `x[$(touch /tmp/PWNED_CHECK)]`; `$((PRIOR_DEBUG_ATTEMPT + 1))` EXECUTES `touch` — marker file exists. Consistent with orchestrator repro. |
| **Post-fix** | Same row → `PRIOR_DEBUG_ATTEMPT=0`, `DEBUG_ATTEMPT=1`; marker NOT created — both bash versions.                                                                           |
| **Legit**    | `debugAttempt:5` → `PRIOR_DEBUG_ATTEMPT=5`, `DEBUG_ATTEMPT=6` — correct arithmetic untouched.                                                                             |

## Regression test (permanent, in `.bkit/src/bkit-counter-prose-audit.test.ts`)

Added `describe("#58 build-challenge HIGH: PRIOR_DEBUG_ATTEMPT derive is
sanitised before $(( )) (arithmetic-injection sink closed)", ...)`:

1. **Sanity** — exactly 3 `PRIOR_DEBUG_ATTEMPT=$(jq ...)` derive blocks in `bkit-debug.md`.
2. **Static guard** — each of 3 must carry EITHER jq `(tonumber? // 0)` coercion OR shell `case "$PRIOR_DEBUG_ATTEMPT" in '' | *[!0-9]*) PRIOR_DEBUG_ATTEMPT=0` guard immediately ahead of `$(( ))`. RED if future edit strips guard to bare `last.debugAttempt // 0`.
3. **Dynamic acid test** (`it.each` × 3) — extracts REAL jq filter from file at test-run time; executes derive + `$(( ))` under real `bash` against (a) poisoned `status.jsonl` with `debugAttempt` payload that `touch`es per-test tmpdir marker — assert marker NEVER created, output clean integer; (b) legitimate `debugAttempt:5` — assert output exactly `"6"`. Catches syntactically-present but semantically-inert coercion.

Also widened pre-existing `blockDerivesCounter`'s `DEBUG_ATTEMPT` fold-shape regex (`.bkit/src/bkit-counter-prose-audit.test.ts:598`, T5.3 completeness rule) from `\|\s*last\.debugAttempt` to `\|\s*\(?\s*last\.debugAttempt` — new coercion wraps field read in parens (`| (last.debugAttempt // 0) | ...`); T5.3 started false-flagging both `bkit-debug.md` DEBUG_ATTEMPT blocks as "references without in-block derive". Not weakening: same `.workflow=="debug")] | ... last.debugAttempt` fold shape; tolerates wrapping paren only.

### Acid-test of the acid-test

Temporarily reverted fix in `bkit-debug.md` (bare `last.debugAttempt // 0` at all 3 sites, backed up first), re-ran new describe block:

- Static guard: RED — "feeds an unsanitised raw jq -r string value straight into `$((PRIOR_DEBUG_ATTEMPT + 1))`".
- All 3 dynamic acid tests: RED — "exploit marker file was created — the arithmetic-injection sink is NOT closed: expected true to be false".

Restored fix from backup; full suite (86/86 in this file) green again.

## Full local verification (all green)

| Command                       | Result                                                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`              | clean                                                                                                                                                       |
| `pnpm test` (vitest)          | 58 files, 2282 passed \| 2 skipped \| 1 todo, 0 failed; `bkit-counter-prose-audit.test.ts`: 86/86 (81 pre-existing + 5 new: 2 static + 3 dynamic `it.each`) |
| `pnpm slop:delta`             | net findings 0, net score 0.00 (jq coercion adds no shell try/catch; `defensive.error-obscuring` unaffected)                                                |
| `pnpm lint:prose`             | 0 errors, 1 pre-existing unrelated warning (`docs/architecture.md:156`, "There is" sentence-start — not touched)                                            |
| `pnpm format:check`           | required one `prettier --write` on edited test file (whitespace/line-wrap only); clean after                                                                |
| `npx --yes bats tests/*.bats` | 45/45, incl. fail-closed T2.7/T2.9 for untouched post-marker `decide_next`/`check_max` contract                                                             |

## Mirror-regen flag

`.bkit/workflows/bkit-debug.md` is rendered-source; mirrors (`.claude/`, `.cursor/`, `.opencode/`) now STALE relative to this fix. Per house rule ("no per-edit `bkit install` in subagent prompts"), did NOT run `pnpm bkit install`. **Orchestrator: run mirror regen at session end** before branch ship-ready.

## Log

DONE — Finding 1 (HIGH, arithmetic-injection sink in `debugAttempt` derive): applied jq `(tonumber? // 0)` coercion at all 3 `PRIOR_DEBUG_ATTEMPT` derive sites (`:189`, `:219`, `:364`) in `.bkit/workflows/bkit-debug.md`; left 7 post-marker `test -gt` gated sites untouched; added permanent regression test (static + dynamic acid test, `it.each` x3) to `.bkit/src/bkit-counter-prose-audit.test.ts`; widened pre-existing T5.3 `blockDerivesCounter` regex to tolerate new parenthesised fold shape; reran full local verification suite (typecheck/test/slop:delta/lint:prose/format:check/bats) all green (`.bkit/workflows/bkit-debug.md`, `.bkit/src/bkit-counter-prose-audit.test.ts`).
DONE — Finding 2 (LOW, empty `--sub-plan` degrades to no-filter): report disposition ACCEPTED / non-blocking, no remediation required — recorded, not counted in Failures.
DONE — Finding 3 (LOW/informational, resume run-boundary counter reset): report disposition ACCEPTED / non-blocking, no remediation required — recorded, not counted in Failures.
