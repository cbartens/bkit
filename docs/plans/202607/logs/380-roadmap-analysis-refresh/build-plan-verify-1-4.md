Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 1/3 (`docs/plans/202607/380-roadmap-analysis-refresh-plan-1.md`), Foundation (WS-1) + Mechanical tier (WS-2), Tasks 1–7. Attempt 4 (final). Verified against the on-disk plan text and source at `HEAD` = `afbc9685`, sub-plan-1-scoped changes only.

## Sub-Plans Verified

None (Single scope — 1 sub-plan of 3).

## Integration Gaps

None (Single scope — cross-sub-plan integration is verified holistically in sub-plan 3).

## Previously Attempted

Attempt 1 — `build-plan-verify-1-1.md` (FAIL, 9 gaps); remediation closed 4.
Attempt 2 — `build-plan-verify-1-2.md` (FAIL, 9 gaps: 2 blocking); PIVOT remediation closed both blockers.
Attempt 3 — `build-plan-verify-1-3.md` (**CONCERNS, 0 failures** — no blocking defect); FINAL remediation `build-plan-gaps-remediate-1-3-log.md` closed GAP-4 and the presence-not-order half of GAP-6, and documented GAP-5 as not-a-defect.

## Notes

**Diff verified this session:** `git diff 95ae3f10..HEAD` touches exactly 4 files — the two test files named in the round scope (`bkit-roadmap-devwrite.integration.test.ts`, `bkit-roadmap-staging.integration.test.ts`) plus the remediation log and `status.jsonl`. No source, workflow, template or script changed, so no new drift surface was introduced.

**Change 1 — `bkit-roadmap-devwrite.integration.test.ts` verbatim extraction (ex-GAP-4) — INDEPENDENTLY CONFIRMED.** The hand-copied `DEV_LOCK_MIRROR` constant is gone; `extractDevLockMirror()` reads `.bkit/workflows/bkit-build.md` at run time and slices between `DEVLOCK="$REPO_ROOT/.bkit/.dev.lock"` and `git -C "$REPO_ROOT" checkout "$CUR_BRANCH" 2>/dev/null || true`. Re-executed the extraction logic standalone: it yields the exact 20-line block at `bkit-build.md:1302-1321`, first/last lines byte-matching the shipped source. All three substitution anchors (`DEADLINE=$(( $(date +%s) + 60 ))`, `sleep 5`, `{FID}`) are present in the extracted text, so each `.replace()` is non-vacuous and its `expect(...).not.toBe(...)` guard is a live drift detector rather than dead weight. Both `indexOf` results are `toBeGreaterThan(-1)`-guarded, so a renamed/removed anchor reds the test instead of extracting nothing. The added repo-local `git config user.email/user.name` in `beforeEach` is a correct and necessary consequence of dropping the hand-copied `-c user.email=... -c user.name=...` inline flags — the shipped block relies on ambient identity.

**Change 2 — `bkit-roadmap-staging.integration.test.ts` byte-offset ordering (ex-GAP-6, order half) — INDEPENDENTLY CONFIRMED, non-vacuous.** The new test asserts `foldIndices[i] > appendIndices[i]` per site, over both `bkit-design.md` and `bkit-plan.md`. Ground truth read from source: each file has exactly 2 ledger-append sites and 2 `bkit_roadmap_fold "…" "$TRACKER_ROWS"` sites (design `:832`/`:833` dev path + `:858`/`:859` PR path; plan `:893`/`:894` + `:919`/`:920`), matching the test's `toBe(2)` cardinality assertions — so the loop cannot pass vacuously, and a swapped append/fold pair at any of the 4 sites would red it. Implementation order is correct in all 4 sites.

**Suite re-confirmed green this session (every command executed, no log claim trusted):**

- `npx vitest run` over the two changed files → 2 files / 19 tests pass.
- `pnpm test` (full repo) → **79 files / 2745 passed, 2 skipped, 1 todo**.
- `npx --yes bats tests/roadmap-fold.bats tests/telemetry-failopen.bats` → **19/19 ok**, including the two #380 fail-open cases (18/19).
- `pnpm typecheck` clean.
- `pnpm format:check` — the only warning is this verification artifact itself (formatted after writing); no source/test file flagged.
- `pnpm bkit check` → **19 drift writes, unchanged count**; `git status` clean apart from this artifact.

**Tasks 1–7 `Done when` re-verified from source this session (not carried from prior logs):**

- **Task 1** — `"feature"` in `TelemetryKind` (`bkit-telemetry.ts:202`), `VALID_KINDS` (`:213`), discriminated union (`:515`), `validate` (`:542`, `:630`), `identity` key-default (`:715`); `.gitattributes:9-10` and `.bkit/templates/.gitattributes:9-10` both carry `docs/roadmap.jsonl merge=union` + `docs/roadmap.md merge=union` and no `completed.md`; `DEFAULT_ROADMAP_BUILD_CYCLES = 10` / `DEFAULT_ROADMAP_STALENESS_DAYS = 90` + resolver at `bkit-manifest.ts:509-539`.
- **Task 2** — fifth pair present (`parseCompletedMd:419`, `buildFeatureRow:814`, `featureRowCount:57`, `completedMdDeleted:69`) with `seedInFlightFeatures:914` wired at `:1065`; CLI help (`bkit-cli.ts:758-777`) names the fifth pair, the `status:"SHIPPED"` rows, the bootstrap seed and "NEVER called from bkit upgrade"; the preflight advisory `completed-md-unmigrated` (`bkit-preflight.ts:143-158`) fires only while the `.md` exists; the DE-39 dispatch-graph guard is intact in the integration test.
- **Task 3** — `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh` and the installed `.bkit/scripts/` copy are `cmp`-identical (10702 bytes); all 10 `roadmap-fold.bats` rows green (projection, idempotency, `ABANDONED` hidden, fail-open, bootstrap, marker-pair invariant, dedupe/rebuild, `## Shipped` cap-10, self-heal without swallowing).
- **Task 4** — `.agents/docs.md:39` carries `docs/roadmap.jsonl` with five `●` phase columns, and the Project Documents table carries `docs/roadmap.md`; no `completed.md` row remains; both `.gitattributes` copies carry the `docs/roadmap.md merge=union` line; the fold banner (`bkit-roadmap-fold.sh:191`) names the `ABANDONED` removal idiom and the outside-the-markers guarantee.
- **Task 5** — `bkit-ship.md:962` reads `jq … "$BOOK_ROOT/docs/roadmap.jsonl"` selecting `.status=="SHIPPED"` (presence alone cannot pass); `BOOK_PATHS` at `:188` carries `docs/roadmap.jsonl docs/roadmap.md` and no `completed.md`; `docs/completed.md` and `.bkit/templates/docs/completed.md` are absent from disk; `grep -c completed .bkit/version` = 0.
- **Task 6** — all FOUR STRAY allowlists carry `^docs/roadmap\.(md|jsonl)$`: `bkit-design.md:799` (dev) + `:863` (PR), `bkit-plan.md:860` (dev) + `:924` (PR); the new order test proves append-before-fold at each of the 4 sites.
- **Task 7** — `bkit-build.md:1295-1324` / `bkit-debug.md:1146-1165` append the phase row on `feat/{FID}` (swept by `git add -A` at `:1324`) then mirror the SAME line to `dev` under `.bkit/.dev.lock` with `exit 0` on lock-busy; the two blocks are `diff`-identical apart from the `build`/`debug` literals; the devwrite test drives the extracted block over a real bare-origin + clone temp repo and both cases (row lands on `dev` + worktree returns to `feat/*`; held lock exits 0) pass.

**Verdict rationale:** every `Done when` clause of Tasks 1–7 holds against the codebase, both FINAL remediation changes were verified independently of the remediation log (extraction re-executed, cardinality of the ordering assertion checked against source), and the full suite plus bats are green. Per this attempt's rubric the remaining residuals — host-mirror drift / the 19 `bkit check` writes, Task 5's repo-wide `completed.md` grep clause, Gate 1 and the human-confirmation checkboxes, and the GAP-5 parity-mismatch test seam — are explicitly not defects and are recorded below as observations only. **PASS, 0 failures.**

## Identified Gaps Log

None (0 blocking gaps).

**Observations (non-defects, recorded for sub-plan 3's holistic pass — none affects this verdict):**

1. **Host-mirror staleness — deferred by the plan itself.** `pnpm bkit check` reports 19 drift writes (count unchanged across attempts 2/3/4); `.claude`/`.cursor`/`.opencode` copies of `bkit-ship` + `bkit-ship-update-docs` still carry the pre-migration `completed.md` verdict reader and `BOOK_PATHS`. Batched `bkit install` is explicitly scoped to sub-plan 3 (WS-6) and this sub-plan's Pre-Flight forbids per-edit regen. **MUST-DO for sub-plan 3** — a ship driven through a host mirror would otherwise derive `UPDATE_DOCS_VERDICT` from a deleted path. The Verification "Local gate suite" checkbox is therefore correctly left `[ ]`.
2. **Task 5's repo-wide `completed.md` grep clause is unsatisfiable as literally written.** The grep returns 18 files, not "ONLY `docs/decisions.jsonl` + the six host mirrors" — because this plan's own Task 2 requires the migrator, its integration test, the CLI verb help, the preflight advisory (+ its test) and `bkit-ship-invariants.test.ts`'s new negative assertion to name the retired file, plus append-only ledger history and tracked `dist/*.js` build output. The two genuinely removable shipped-surface hits (`bkit-ship.md:179` comment, `bkit-ship-update-docs.md`) were closed in attempt 3. The clause should be narrowed to the shipped workflow/prompt/doc surface in a plan revision.
3. **Gate 1, Pre-Flight, Security & Privacy and the three 👤 Human Confirmation boxes remain `[ ]`** — human-owned; the master plan carries no `[x]` to inherit.
4. **GAP-5 residual (test seam, documented not-a-defect).** Task 2's "a seeded parity mismatch aborts with the `.md` intact" has no forced-mismatch test for the `completed.md` pair specifically. The gate IS implemented; the mismatch is unreachable by construction for a parser-derived count (the `.md` and its `.bak` are parsed from the same synchronous read), identical in shape to the pre-existing knowledge/decisions case whose own inline comment records the same conclusion. Fixing it would require either `node:fs` monkey-patching inside a real-filesystem boundary test or a structural refactor of a green implementation.
5. **Devwrite extraction covers `bkit-build.md` only.** `bkit-debug.md`'s dev-lock block is proven present by `bkit-roadmap-staging.integration.test.ts` and verified `diff`-identical to build's apart from the `build`/`debug` literals, so the behavioural coverage is representative; extracting both would be a nice-to-have.
6. **Task 7's "no `git add -- docs/` and no `-A` anywhere in `bkit-ship.md`" is proven by `bkit-ship-invariants.test.ts`'s pre-existing negative assertions (green) rather than by the row-11 test that names the clause.** Coverage exists; only its location differs from the plan text.
7. **The committed dogfood `docs/roadmap.md` still renders a pre-remediation board shape.** Self-correcting — the board is a pure regenerate from the ledger and holds no state.
