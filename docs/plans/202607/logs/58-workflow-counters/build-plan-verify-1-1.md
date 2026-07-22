Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — `docs/plans/202607/58-workflow-counters-plan-1.md` (WS-1 T1.1–T1.3 + WS-2 T2.0–T2.10 + T5.2, 15 tasks, ending at 🔒 Gate 2a), attempt 1.

Diff: execute commit `1a288c20` — **1154 insertions / 17 files** (~1150/17). Wider `origin/dev..HEAD` (2086 / 45 files) includes unrelated files (`docs/security.md`, `docs/setup.md`, `.bkit/templates/docs/*`, …) — merge-base `6f56ac20`, dev advanced; tree-diff noise. Scaffolding commits checked: `9f18eeb7` (branch-sync) touches only `status.jsonl`; `7975f9c3`/`9ab0f09f` worktree-setup/install-skills. No sub-plan-1 file outside `1a288c20`.

## Sub-Plans Verified

`None` — Single scope. Siblings 2/3 out of scope; consulted only to confirm their work not shipped.

## Integration Gaps

`None` — Single scope. Forward-coupling risks G2/G3 recorded (handoff obligations, not integration defects).

## Previously Attempted

`None` — first attempt (`build-plan-verify-1-1.md`; no predecessor).

## Notes

**Checkbox corrections: none.** Every `[x]` backed by independent re-run. G1 = fixture-arithmetic mismatch; substantive criterion met — un-ticking would misrepresent.

**Seven scrutiny points — all clean (evidence):**

1. **T1.1 figures reproduced.** `sh -c '. ./.bkit/templates/.bkit/scripts/bkit-status-fold.sh; printf "%s" "$BKIT_STATUS_FOLD"' | wc -c` → **1078**; `| md5` → **`ed1c4a236d35499f39033206d5b75480`**. All 15 inline blobs from `9ab0f09f` byte-identical (1078 bytes, md5 `ed1c4a23…`; build 4 / debug 4 / ship 3 / plan 2 / design 2). Issue's 1079/`d04a2499…` reconcile to **no** measured slice. Test: `MEASURED_BYTES = 1078` / `MEASURED_MD5 = "ed1c4a23…"` at `.bkit/src/bkit-status-fold.test.ts:37-38`, real script `:64-71`; reference from `git show dev:` `:81-101` (non-circular). `npx vitest run .bkit/src/bkit-status-fold.test.ts` → **6/6 pass**.

2. **KN-26 intact.** `decide_next` (`.bkit/templates/.bkit/scripts/bkit-counter-bus.sh:237`) and `check_max` (`:220`) bare `[ "$_val" -gt "$_max" ]` — no integer guard. `case … in '' | *[!0-9]*)` at `:175-176` is inside new `counter_count` only. **6** `2>/dev/null` at decide/check sites (`bkit-build.md:566`, `:967`; `bkit-debug.md:197`, `:427`, `:443`; `bkit-ship.md:648`). Zero `counter_next`/`counter_current`/`counter_count` in `.bkit/workflows/*.md`. Four inert primitives: `counter_init:83`, `counter_inc:93`, `counter_get:105`, `counter_reset:115`. **18** unconverted `--argjson` sites (`grep -rnE '\-\-argjson [a-z]+ "\$[A-Z_]*ATTEMPT"' .bkit/workflows/ | wc -l`).

3. **7 REDs for documented reason.** `npx --yes bats tests/*.bats` → **68 tests, 7 RED** (Gate 2a). All 7 (`counter-failclosed.bats` 48–53, 56): `` `[ "$status" -eq 2 ]' failed `` — never `command not found`. Reproduced fail-open: `git show dev:.bkit/scripts/bkit-counter-bus.sh` → `decide_next TEST_ATTEMPT "" 3 step-14 failure-path` → **`stdout='step-14'`, `exit=0`** (matches `red-vs-dev.txt`). T2.9's 4 cases **green** (valid integers 0/1; fail-open = empty/non-integer only).

4. **T2.6 vacuous by construction.** `DERIVE_CALL_PATTERN` at `.bkit/src/bkit-counter-prose-audit.test.ts:300` → `findCountedSteps` `:303-309` → `auditCountedSteps` `:340-372`; not hardcoded empty. Red-proofs `:399-423` (real `bkit-debug.md` in memory), `:425-436` (fake step). Exemption `debug-run-tests` KN-26 citation `:292-298`, asserted `:393-397`. → G2.

5. **T5.2 dynamic enumeration proven.** `Array.from(configContent.matchAll(/^(MAX_\w+)=\d/gm))` (`:205`, `:158`). **7** constants; `:224` asserts `MAX_CHALLENGE_REMEDIATE_ATTEMPT`. Appended `MAX_TOTALLY_DEAD_CONSTANT=9` → **40 tests/2 fail** (`× MAX_TOTALLY_DEAD_CONSTANT is referenced >=1 time inside a fenced block`). Single expected RED: `MAX_CHALLENGE_REMEDIATE_ATTEMPT` (`:230-243`).

6. **ci-dispatch fix genuine.** `extractFoldJq` (`:240-250`) repointed to `BKIT_STATUS_FOLD`; `expect(foldJq).not.toBeNull()` (`:253`) preserved; real bash+jq pipeline asserts values. `npx vitest run` → **39/39 pass**. → G4 (CWD-relative path).

7. **Template vs mirror clean.** Execute commit touches **no** `.bkit/scripts/`, `.claude/`, `.cursor/`, `.opencode/`, `.bkit/version`. Mirror `.bkit/scripts/bkit-counter-bus.sh`: **0** new helpers; `.bkit/scripts/bkit-status-fold.sh` **does not exist** (T8.3 not run). Source only in `.bkit/templates/.bkit/scripts/`.

**Corroborating checks (match plan claims):**

- T1.2: `grep -rc "FOLD='def lastIdx" .bkit/workflows/` → **0**; `grep -rl 'BKIT_STATUS_FOLD'` → **5**; `grep -c 'missing bkit-status-fold.sh'` → **15** (build 4 / debug 4 / ship 3 / plan 2 / design 2); 4 `PRIOR_STRATEGY` sites with `all runs` comment.
- T1.3 red-proofs: temp edit → restore (`git checkout` clean).
- T2.0: bats resolve `${VAR:-$REPO_ROOT/.bkit/templates/…}`; zero `.bkit/scripts/` refs in tests.
- T2.1: `type counter_*` ok under sh/bash/dash/zsh; `/nonexistent` → exit 2; zero rows → count 0 exit 0; `counter_current` → exit 2.
- T2.2: cross-process `bash -c`; post-write `counter_current` == pre-write `counter_next`.
- T2.3: run-B derives `1` not `4`; PRIOR_STRATEGY all-runs asserted.
- T2.10: interleave fixture; deferral `docs/deferrals.jsonl:34` key `58-status-jsonl-run-boundary-keys-on-last-run-overall`.
- Verification Plan: `pnpm typecheck`/`format:check` clean; `pnpm slop:delta` net 0; `pnpm test` → **2233 passed | 1 failed (T5.2 RED) | 2 skipped | 1 todo**.
- **NO-PUSH:** `git ls-remote --heads origin feat/58-workflow-counters` empty.

**Verdict (CONCERNS, not FAIL).** Gaps real; none block sub-plan 2 entry. Gate 2a holds. **Only G1 in `Failures`** — sole Done-when literal unmet. G2–G6 advisory.

## Identified Gaps Log

1. **G1 — T2.4 literal Done-when diverges (property proven).** Plan `:469-470`: 2 rows / `--sub-plan 1` → 3. `tests/counter-derive.bats:101-115`: **3** subPlan-1 rows, `--sub-plan 1` → **4**. `--sub-plan 2` → 1 holds. Checkbox `[x]` — isolation proven.
2. **G2 — T2.6 no non-vacuity guard (latent).** T5.2 self-guards (`:223`); T2.6 corpus test (`:379-391`) does not. `DERIVE_CALL_PATTERN` requires unquoted step arg — alternate shapes → silent vacuity. Mitigated by Gate 2b obligation plan `:527`. Checkbox `[x]`; red-proof `:399-423` fires.
3. **G3 — T2.7 mutates tracked tree.** `tests/counter-failclosed.bats:113-122` regenerates `red-vs-dev.txt` each run; `git checkout` restore. Plan `:526` T3.9 "must **not** regenerate" unenforceable while suite runs.
4. **G4 — `extractFoldJq` CWD-relative.** `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts:241-243` vs `__dirname` REPO_ROOT siblings. Passes at vitest cwd (39/39).
5. **G5 — two soft-skips conditionally vacuous.** `bkit-status-fold.test.ts:85-90`, `counter-failclosed.bats:103-105`; shallow clone drops cross-check; 1078/md5 pins value.
6. **G6 — position-3 sites by description not line ref.** T2.1/T2.9 want `bkit-build.md:781-787`; bus `:52-54` names "Step 10". `bkit-debug.md:443` has line ref. Cosmetic.
