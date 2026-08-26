Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 3/3 (`docs/plans/202607/380-roadmap-analysis-refresh-plan-3.md`), attempt 2. Re-verified Tasks 13–15, Gates 2/3/4, the Mandatory Testing & Documentation tasks, the Verification Plan and Manual Verification Steps 1–4, plus independent scrutiny of attempt 1's two gaps and their remediation. Sub-plans 1 and 2 were verified separately and were not re-verified here.

## Sub-Plans Verified

None (Single scope).

## Integration Gaps

None (Single scope).

## Previously Attempted

Attempt 1 (`build-plan-verify-3-1.md`) — CONCERNS, 2 gaps (GAP-1 missing matrix row 18 test; GAP-2 unexecuted Manual Verification Steps 1–4 + a non-reproducing `bkit telemetry migrate`). Remediated in `build-plan-gaps-remediate-3-1-log.md` (commit `6f681d33`). **Both gaps are independently confirmed closed by this pass.**

## Notes

**Gate suite re-run independently (real numbers, this session):**

- `pnpm test` — PASS at the DEFAULT timeout, first try: 83 files, **2780 passed / 2 skipped / 1 todo (2783)**, exit 0, 10.71s. No timeout flake, so no `--testTimeout=90000` re-run was needed; the number matches the remediation log's claim exactly.
- `npx --yes bats tests/*.bats` — PASS, **189/189 ok**, including the six #380 fail-open cases (184–189).
- `pnpm typecheck` — PASS (`tsc --noEmit`, 0 errors).
- `pnpm lint:prose` — PASS: 0 errors, 1 warning (`docs/testing.md:318`, pre-existing, outside the #380 diff).
- `pnpm slop:delta` — PASS: "added 8, resolved 8, worsened 0; net findings 0, net score 0.00 — no net-new or worsened findings".
- `pnpm check:dist` — PASS (rebuild + `git diff --exit-code dist/` clean; the remediation's `dist/bkit-telemetry-migrate.js` is committed).
- `pnpm test:coverage:unit` — PASS; branches **70.67%** vs the `--coverage.thresholds.branches=70` floor.
- `node dist/bkit-install.js check` — PASS: `[bkit-check] 0 write(s) would occur.`; `git config core.bare` = `false`.
- `pnpm format:check` — the only flagged file was **this verification artifact itself** (formatted with prettier before finishing); the tracked tree is clean.

**GAP-2 fix scrutinised hardest — CONFIRMED a real defect, correctly fixed, genuinely regression-guarded.**

- Behavioural delta is exactly one input class. Old: `knAlreadyDone = !knMdExists && knJsonlNonEmpty` (same for `de*`). Truth-table diff vs new `knAlreadyDone = !knMdExists`: md present → identical (both `false`, both parse+migrate); md absent + jsonl non-empty → identical (both skip); **md absent + jsonl empty/absent → old aborted the ENTIRE run, new skips that pair only.** No other path changes, so the destructive `fs.writeFileSync(knJsonlPath, …)` overwrite is still reachable only when `knowledge.md` actually exists — the fix cannot clobber a populated `knowledge.jsonl`.
- The two deleted `return abort("knowledge.md not found …")` branches are provably unreachable under the new condition (`!knAlreadyDone === knMdExists`), so their removal is correct, not gate-weakening. All five pairs (`kn`/`de`/`pending`/`friction`/`completed`) now use the identical `!mdExists` rule (lines 1058–1068), and the all-done early return (1075–1104) still runs the § S bootstrap seed.
- **Proved the regression test is load-bearing:** I temporarily reverted the source to the pre-fix condition (both `*JsonlNonEmpty` gates + both abort branches restored) and re-ran `bkit-telemetry-migrate.integration.test.ts` → **1 failed / 58 passed**, failing precisely on the new test at `result.ok` (`expected false to be true`). Restored the file from git immediately (`git status` clean afterwards). With the fix in place: 59/59.
- **Reproduced the product path end-to-end in a real scratch consumer** (`/tmp/verify32-consumer`, fresh `git init`, only `docs/completed.md` seeded, driven by the built `dist/`): `bkit install --claude --cursor --tooling` exits 0 and does NOT create `docs/roadmap.md` or `docs/roadmap.jsonl`; `bkit telemetry migrate` prints `knowledge.md absent — skipping` / `decisions.md absent — skipping` (no abort), parses 2 completed entries, passes the parity gate, appends 2 `kind:"feature"` / `status:"SHIPPED"` rows with NO `severity`, deletes `docs/completed.md`, runs the seed; a re-run prints `already complete (idempotent no-op)`; `bkit check` then exits 0 with `0 write(s) would occur` and the `completed-md-unmigrated` advisory gone. **Attempt 1's "no output, exit 0" was an invocation artifact** — `dist/bkit-cli.js` is a parser module with no `main`; the real bin is `dist/bkit-install.js` (`package.json` `bin.bkit`).

**GAP-1 — CONFIRMED closed.** `.bkit/src/bkit-install.integration.test.ts` Scenario 5b exists and really executes (ran it isolated: 1 passed, 76 skipped by the `-t` filter — not a silent `return`). It spawns a real `tsx bkit-install.ts install --claude --cursor --tooling` against a scratch consumer, asserts exit 0 and `docs/roadmap.md` absent, then a real `bkit check` exit 0 whose output contains no `roadmap.md` and still no file. Matrix row 18 is now covered.

**`.bkit/version` canonicalHashes — CONFIRMED correct.** All three new entries verified by recomputing sha256 over the rendered scripts: `bkit-roadmap-fold.sh` `53f9fd01…`, `bkit-roadmap-reconcile.sh` `21bbf6d4…`, `bkit-roadmap-cadence.sh` `3d18e076…` — all match, and each rendered script is byte-identical to its `.bkit/templates/.bkit/scripts/` source. Sweeping every `.bkit/scripts/*` entry: 13 match, 0 missing files, 0 scripts on disk absent from the map, 1 mismatch (`bkit-runtime.sh`) that is **pre-existing on `origin/dev`** (dev's stored hash `142e3e67…` vs dev's file hash `15d608fb…`) and untouched by #380 — out of scope, recorded as an observation.

**Manual Verification re-executed independently (not taken on trust):**

- **Step 1 — reproduced** (scratch consumer above) for: install never creates `docs/roadmap.md`; the `completed-md-unmigrated` advisory fires naming `bkit telemetry migrate` and states "empty, not wrong"; `bkit upgrade` does NOT auto-run the migrator (`docs/completed.md` still present, no `docs/roadmap.jsonl`); migrate ports + deletes + seeds; re-run idempotent; `bkit check` exits 0. **One sub-assertion did not reproduce — see the gap below.** Separately confirmed the empty-board behaviour with the real `bkit_roadmap_fold` over an absent ledger (`/tmp/verify32-fold`): every phase renders `_(none)_`, `[bkit-roadmap] docs/roadmap.jsonl absent or empty` fires, the hand-written preamble and the `## Backlog / Ideas` region survive byte-identical, and the marker-repair path appends rather than clobbers. Note the `run 'bkit telemetry migrate' to bootstrap-seed it` hint is correctly conditional on `docs/plans/**` being non-empty (`bkit-roadmap-fold.sh:153`), so its absence in a plans-free scratch repo is by design, not a defect.
- **Step 3 — reproduced** against the real `bkit_roadmap_cadence_eval` with numeric-`ts` fixtures: 10 DISTINCT `BUILT` FIDs after the last `ROADMAP_CADENCE_FIRE` → `FIRE 10`; 10 repeat `BUILT` rows for ONE FID → `SKIP 1` (dedup by `key` holds); 9 distinct → `SKIP 9` (threshold is a true `>=` boundary). Drift check reproduced in a real git repo (`/tmp/verify32-drift`): silent for `feat/111-alpha` (has a ledger row), emits `[bkit-roadmap] drift: live feat/222-orphan has NO docs/roadmap.jsonl row — a close that never wrote` for the orphan, exits 0, and leaves `docs/roadmap.md` byte-identical (shasum before == after).
- **Steps 2 and 4 — partially re-verified.** I re-confirmed the static wiring (`BOOK_PATHS` at `bkit-ship.md:188` carries both `docs/roadmap.jsonl` and `docs/roadmap.md`; `UPDATE_DOCS_VERDICT` at `:1106-1109` greens only on `status=="SHIPPED"`, explicitly not on a `BUILT` row) and the runtime halves are covered by the passing `bkit-roadmap-devwrite`/`-staging`/`-sync`/`-reconcile` and `bkit-ship-verdict` integration suites. I did NOT re-run the full throwaway-clone close/ship round-trip within budget; for those two steps the remediation log's evidence stands un-refuted but un-reproduced by me.

**Task/Gate re-verification (spot-checked, all intact):** `.bkit/workflows/bkit-roadmap.md` plus all six host mirrors present (`.claude/commands`, `.cursor/commands`, `.opencode/commands` × `bkit-roadmap.md`; `.claude/agents`, `.cursor/agents`, `.opencode/agents` × `bkit-roadmap-refresh.md`). `docs/deferrals.jsonl` carries `OPEN,CLOSED` pairs for BOTH `380-dev-located-roadmap-status-write-for-build-debug-closes` and `380-persisted-frontier-snapshot-event-log-for-260`. `docs/observability.md:41` registers `[bkit-roadmap]` in the one-prefix-per-subsystem list with the prefix section at `:81+`. `.bkit/jsonl.md` carries `kind: "feature"`, the ladder, the `ABANDONED` idiom and both `counterName`s. All four ledgers parse clean (roadmap 50 / decisions 50 / knowledge 75 / deferrals 68 rows, 0 malformed). Task 15's `completed.md` sweep returns the same 15 legitimate paths as attempt 1 (migrator/CLI/preflight sources + their `dist/` builds + negative-assertion tests + append-only ledger history + `docs/testing.md`); all three host-mirror trees return 0 hits.

**Residual observations (not counted as failures):**

- Scenario 5b asserts install exit 0 but — unlike the Scenario 5 it mirrors — does not assert that install actually produced consumer outputs (`.claude/agents`, `.bkit/version`). A silently no-op install would still satisfy its negative assertion. Cheap hardening, not a defect today (I confirmed the real install does produce outputs).
- `.bkit/version` `canonicalHashes[".bkit/scripts/bkit-runtime.sh"]` does not match the file's sha256 — pre-existing on `origin/dev`, unrelated to #380.
- Verification Plan "Full local gate suite" still names `pnpm lint`, which is not a script in `package.json` (carried over from attempt 1; the real scripts are `lint:prose` / `lint:slop` / `lint:workflows`, all run above).
- Human-owned `👤 ✅ Human Confirmation` boxes, the Pre-Flight core/conditional checklist and the Security & Privacy boxes remain `[ ]` — consistent with sub-plans 1 and 2, and not defects.
- No plan checkbox needed flipping this pass: every task/gate/verification box the remediation ticked is independently corroborated above (with the single caveat recorded as the gap below), so the plan file is unchanged by this attempt.

## Identified Gaps Log

1 gap.

GAP-A (non-blocking, plan-text vs implementation) — **Manual Verification Step 1 asserts that `bkit upgrade` "DOES surface the advisory naming `bkit telemetry migrate`"; it does not.** Reproduced twice in the scratch consumer: `bkit upgrade` emits only its four `[bkit-upgrade]` lines, and after deleting `.bkit/advisories.md` a fresh `bkit upgrade` does NOT regenerate it or mention the advisory. Root cause is structural, not #380-specific: `runPreflight` is imported only by `.bkit/src/bkit-install.ts` (used by the `install` and `check` paths at `:2111` / `:2761`); `.bkit/src/bkit-upgrade.ts` contains no preflight/advisory reference at all, so NO advisory has ever surfaced on the upgrade path. The remediation log's claim that "the `completed-md-unmigrated` advisory fires" after `bkit upgrade` therefore reflects an install/check run, not the upgrade run. The consumer-facing rollout story is still intact — the plan's own Documentation Updates row and Edge Cases table both say "**install** advisory", `bkit check` (a pre-push/CI gate) surfaces it, and the fold hint covers repos with in-flight plans — so this is an internal contradiction inside the plan's Step 1 prose rather than a broken deliverable. Remediation options, cheapest first: (a) correct Step 1's wording to "install/check advisory", matching the plan's two other statements and the shipped behaviour; or (b) if upgrade-path surfacing is genuinely wanted, wire `runPreflight` (advisories only, never blockers) into `bkit-upgrade.ts` — a shared-CLI change beyond this sub-plan's scope and not implied by any other plan text. Step 1's remaining assertions all reproduce, so the box is left `[x]` and this is recorded as a CONCERN.
