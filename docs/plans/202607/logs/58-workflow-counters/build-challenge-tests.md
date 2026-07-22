Verdict: PASS

<!-- verdict:end -->

# Build Challenge Testing

QE edge-case pass over `build-challenge.md` / `build-challenge-remediate-log.md`.
Regression for gaps the remediation's permanent test (3-site `PRIOR_DEBUG_ATTEMPT` sink) misses: corpus-wide siblings, provenance-integrity as dynamic proof (not text-only), two ACCEPTED-LOW findings characterised so they cannot silently worsen.

**Headline result: generalising corpus test GREEN across all 5 workflows.** Corpus-wide search (not just `bkit-debug.md`) for ANY raw `jq -r` field extraction from `status.jsonl` that is not `length` count or `tonumber?`-coerced and feeds `$(( ))` arithmetic anywhere in same file: **zero** instances outside the 3 remediated `PRIOR_DEBUG_ATTEMPT` sites. **No new injection sink.** Affirmative evidence the 3-site fix was complete — checker proven sensitive (acid-tested three ways below, including real corpus with fix reverted).

## Tests added

### `.bkit/src/bkit-counter-prose-audit.test.ts` (+15 tests, file total 86 -> 101, all passing)

**1. Corpus-wide arithmetic-injection-sink generaliser** (`describe("#58
build-challenge-tests: corpus-wide guard — ... no OTHER instance ...")`)

- `findUnguardedJqIntoArithmetic(content)`: every `VAR=$(jq ...)` single-line assignment with raw extraction (not `| length`, not `tonumber?`-coerced); checks whether `VAR` appears in `$(( ... VAR ... ))` in same file.
- **Real-corpus test**: all 5 shipped workflows (`bkit-build.md`, `bkit-debug.md`, `bkit-plan.md`, `bkit-design.md`, `bkit-ship.md`). Boundary: real `.bkit/workflows/*.md` on disk. Asserts 0 findings. **PASS on current tree.**
- **Acid-test (RED-proof) — real corpus, fix reverted**: reverted FIRST `PRIOR_DEBUG_ATTEMPT` in `bkit-debug.md` to bare pre-fix jq (`last.debugAttempt // 0`, no `tonumber?`), re-ran real-corpus test:
  ```
  AssertionError: Found 1 arithmetic-injection sink(s) that are NOT the 3
  already-remediated PRIOR_DEBUG_ATTEMPT sites ...
  .bkit/workflows/bkit-debug.md: PRIOR_DEBUG_ATTEMPT
    assign: PRIOR_DEBUG_ATTEMPT=$(jq -s -r "$BKIT_STATUS_FOLD"' fold | [.[] |
      select(.workflow=="debug")] | last.debugAttempt // 0' "$SRC" ...)
    arith:  $((PRIOR_DEBUG_ATTEMPT + 1))
  ```
  Confirmed RED. Restored from backup (`git status --short .bkit/workflows/bkit-debug.md` clean); suite green (101/101).
- **Synthetic RED-proof** (`it("RED-PROOF: the checker fires on a synthetic
reintroduction ...")`): fabricated `PRIOR_X=$(jq ...) | last.evil // 0` → `$((PRIOR_X + 1))` unguarded; checker flags exactly 1. Non-mutating.
- **Two negative controls**: `| length` into `$(( ))` not flagged; `(tonumber? // 0)`-coerced derive (shipped fix shape) not flagged. Proves no false-positives on legitimate corpus patterns (`counter_count`/`counter_next` internals, `COUNTER_VALUE` emitters, `LOCK_AGE`/`DEADLINE` date-arithmetic — none match assignment shape or are `length`-safe).

**2. Provenance integrity — dynamic proof, not text-only**
(`describe("#58 build-challenge-tests: provenance integrity — ...")`)

- `extractCounterValueDerive(content, workflow)`: extracts REAL `COUNTER_VALUE=$(jq -s --arg wf "<workflow>" '[...workflow-started...] | length' "$STATUS" ...)` derive per workflow (`build`/`debug`/`ship`/`plan`/`design`).
- **Per-file sanity test** (5x): genuine derive shape present for all 5 counter-row emitters.
- **Per-file dynamic acid test** (5x): extracts REAL derive at test-run time (not hand-copied), fixture `status.jsonl` with 4 `workflow-started` rows, runs extracted `jq` under real `bash`, asserts output `"4"` — value counted from log, not hardcoded literal under `shell-bus` label. Boundary: real `bash` + real `jq` + fixture `status.jsonl`. All 5 pass.
- **Acid-test (RED-proof) — real corpus, dishonest revert**: replaced `bkit-ship.md` genuine `COUNTER_VALUE=$(jq ...)` with literal `COUNTER_VALUE=1` (hardcoded value under `shell-bus` label), re-ran ship tests:
  ```
  AssertionError: no genuine COUNTER_VALUE derive found for workflow="ship"
  in .bkit/workflows/bkit-ship.md ... expected null not to be null
  ```
  Sanity + dynamic-derivation tests RED. Restored from backup (`git status --short
.bkit/workflows/bkit-ship.md` clean); suite green (101/101).
- **Synthetic RED-proof** (`it("RED-PROOF: the extractor returns null against
a synthetic dishonest revert ...")`): extractor returns `null` on fabricated `COUNTER_VALUE=1` / `counterSource "shell-bus"` — no real file touched.
- Stricter than pre-existing T7.1 (`not.toMatch(/--argjson counterValue 1\b/)`), which only bans literal `1` and would miss e.g. `COUNTER_VALUE=2` — requires actual `length`-counting derive shape for any value.

### `tests/counter-derive.bats` (+2 tests, suite total 45 -> 47, all passing)

**3. T2.4b — empty `--sub-plan ""` characterisation** (build-challenge.md
Finding 2 / build-challenge-1.md F1, ACCEPTED / non-blocking)

- Boundary: real `bkit-counter-bus.sh` `counter_count` via `. $SCRIPT` in real `bash -c`, fixture `status.jsonl`.
- Pins today's behaviour: `--sub-plan ""` counts ALL subPlans (same as omitting flag), NOT fail-closed exit 2, NOT count-zero. Re-confirms scoped `--sub-plan 1`/`2` and non-numeric `--sub-plan bad` still fails closed (exit 2).
- **Acid-test (RED-proof)**: cannot safely mutate shared `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh` mid-run (omitted-vs-empty conflation is bug shape — changing `--argjson sp` default breaks every no-`--sub-plan` call site). Isolated scratchpad copy with `${_cc_subplan:-null}` → `${_cc_subplan}` (empty string to `--argjson` fails JSON parse — plausible future fail-closed fix), `BKIT_COUNTER_BUS` pointed at it, re-ran `tests/counter-derive.bats`: `not ok 4 T2.4b ...` (RED, plus other shared-path tests — sensitive to behaviour change). Real template never touched (`git status --short
.bkit/templates/.bkit/scripts/bkit-counter-bus.sh` clean; byte-diff vs `/tmp` backup).
- Note: T2.10 (`run-boundary interleave — resuming build after an
interleaved completed debug run (characterisation)`) — SECOND accepted-LOW finding (build-challenge.md Finding 3 / build-challenge-1.md F2, `.[-1] // {}` resume-guard budget reset) — **already existed**, adequate: pins shipped jq condition + consequent `counter_next` reset via real `bash -c`. Verified present and passing; not duplicated.

**4. jq-injection-via-step-name** (build-challenge-2.md "Probed and found
SAFE" item 1 — manual repro in challenge report, NO automated guard before this pass)

- Boundary: real `counter_count` via real `bash -c`, fixture `status.jsonl` with step `evil$(touch $MARKER)`.
- Asserts: (a) exact-name match on malicious step counts as data (`= 1`), (b) real step name (`build-plan-verify`) does NOT false-match (`= 0`), (c) payload never executes (`[ ! -e "$MARKER" ]`).
- **Acid-test (RED-proof)**: scratchpad copy of `bkit-counter-bus.sh` with step binding `--arg s "$_cc_step"` (data) → direct splice into jq filter (`select(.step==("$_cc_step") and ...)`, name unbound) — "step name reaches jq as code" regression. `BKIT_COUNTER_BUS` pointed at it, re-ran suite: `not ok 5 build-challenge-tests: a step named with a shell-metacharacter
payload ...` (`[ "$output" = "1" ]' failed`) — RED. Real template untouched (`git status --short`).

## Already-adequately-covered (not duplicated)

- **The HIGH sink's own permanent regression test** (all 3 `PRIOR_DEBUG_ATTEMPT` sites, static guard-presence + dynamic per-site jq against poisoned/legit fixtures) — in `.bkit/src/bkit-counter-prose-audit.test.ts`, verified + acid-tested in remediation log; not re-added. New corpus-wide siblings test generalises, not duplicates.
- **T5.3 completeness detector's shape-coverage** (9 per-shape RED-proofs) and **DEBUG_ATTEMPT off-by-one pre/post-marker rule** — present, passing, untouched. Not re-narrowed or weakened.
- **Fail-closed guards** (`tests/counter-failclosed.bats`, T2.7/T2.9), **cross-process derivation** (T2.2), **subPlan isolation** (T2.4), **SOAK marker** (T2.8/T2.8b/T2.8c) — pre-existing, all passing (47/47 bats run below), no changes.

## Full local verification (all green)

- `pnpm typecheck` — clean.
- `pnpm test` (vitest) — **58 files, 2297 passed | 2 skipped | 1 todo, 0
  failed.** `.bkit/src/bkit-counter-prose-audit.test.ts`: **101/101** (86 pre-existing + 15 new).
- `pnpm slop:delta` — `added 0, resolved 0, worsened 0; net findings 0, net
score 0.00` — OK, no net-new or worsened findings.
- `npx --yes bats tests/*.bats` — **47/47 passed** (45 pre-existing + 2 new: T2.4b, jq-injection-via-step-name).
- `git status --short` on shared scripts touched during acid tests (`bkit-counter-bus.sh`, `bkit-debug.md`, `bkit-ship.md`) — clean; acid-test mutations byte-restored from `/tmp` backup after RED capture, or scratchpad copies via `BKIT_COUNTER_BUS` override — never on tracked files.

## Files changed by this pass

- `.bkit/src/bkit-counter-prose-audit.test.ts` (+15 tests, 2 new `describe` blocks)
- `tests/counter-derive.bats` (+2 tests: `T2.4b`, jq-injection-via-step-name)

No implementation files changed. No mirrors regenerated (test files only).

## Blockers

None.

## Bugs Discovered

None. Generalising corpus-wide test (highest-value check) GREEN on unmodified tree — no new arithmetic-injection sink beyond the 3 remediated sites.
