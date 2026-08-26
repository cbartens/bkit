Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 1/3 (`docs/plans/202607/380-roadmap-analysis-refresh-plan-1.md`), Foundation (WS-1) + Mechanical tier (WS-2), Tasks 1–7 + Gate 1. Attempt 3 (final). Verified against the on-disk plan text at `HEAD` = `14173eb5`, sub-plan-1-scoped changes only.

## Sub-Plans Verified

None (Single scope — 1 sub-plan of 3).

## Integration Gaps

None (Single scope — cross-sub-plan integration is verified holistically in sub-plan 3).

## Previously Attempted

Attempt 1 — `build-plan-verify-1-1.md` (FAIL, 9 gaps); remediation `build-plan-gaps-remediate-1-1-log.md` closed 4.
Attempt 2 — `build-plan-verify-1-2.md` (FAIL, 9 gaps: 2 blocking, 4 concerns, 3 minor); PIVOT remediation `build-plan-gaps-remediate-1-2-log.md` claims both blockers plus the two removable `completed.md` references closed. **Both blocker claims independently re-verified this session and confirmed closed** (evidence below); the remaining gaps are carried forward unchanged as CONCERNS.

## Notes

**Evidence executed this session (log claims not trusted):**

- `npx vitest run` over 8 sub-plan-1 suites (`bkit-ship-invariants`, `bkit-ship-verdict.integration`, `bkit-roadmap-staging.integration`, `bkit-roadmap-fold`, `bkit-telemetry`, `bkit-telemetry-migrate.integration`, `bkit-roadmap-devwrite.integration`, `bkit-manifest`) → **8 files / 335 tests pass**.
- `npx bats tests/roadmap-fold.bats tests/telemetry-failopen.bats` → green (incl. the two #380 fail-open cases 18/19).
- `pnpm typecheck` clean. `pnpm bkit check` → **19 drift writes, same count as attempt 2** — no new drift introduced by the remediation round.

**Blocker 1 (ex-GAP-1, ship verdict reader under `$BOOK_ROOT`) — CLOSED.** `.bkit/workflows/bkit-ship.md:962` now reads `jq … "$BOOK_ROOT/docs/roadmap.jsonl"`. Two independent proofs, not just the string: (a) `bkit-ship-invariants.test.ts:279-293` extracts the `SHIPPED_HIT=$(` line and asserts both `/\$BOOK_ROOT\/docs\/roadmap\.jsonl/` and the absence of a bare-relative occurrence; (b) `bkit-ship-verdict.integration.test.ts:39-52` now `cd`s into a SEPARATE temp dir and exports `BOOK_ROOT` at the fixture dir, so the harness is mutation-equivalent — a bare-relative reader could not find the fixture and all five cases (PASS on `SHIPPED`, FAIL on absent, FAIL on `BUILT`-only, PASS on `BUILT`-then-`SHIPPED`, FAIL on absent file) would red. All five pass.

**Blocker 2 (ex-GAP-2, `BOOK_PATHS` set-equality) — CLOSED.** `bkit-ship-invariants.test.ts:183-212` extracts the literal `^\s*BOOK_PATHS="([^"]+)"\s*$` assignment from `bkit-ship.md` (asserted found — non-vacuous), normalises `$YYYYMM`→`{YYYYMM}`, tokenises, and asserts `Set` equality against `BOOK_PATHS_ALLOW_LIST` (host-skill mirrors excluded on both sides, correctly — they are appended conditionally after the literal assignment), plus `expect(assignedTokens).not.toContain("docs/completed.md")`. A `completed.md` token in the assignment would break set-equality AND the explicit negative. The frozen list (`:78-97`) carries `docs/roadmap.jsonl` + `docs/roadmap.md`, no `completed.md`; the `-A` (`:104-109`) and bare-`docs/` (`:111-117`) bans are intact and green; `bkit-ship.md:188` `BOOK_PATHS` matches.

**Two removable `completed.md` references — CLOSED.** `.bkit/workflows/bkit-ship.md:179` is now `# docs/roadmap.jsonl (#380 — canonical feature ledger)`; `.bkit/prompts/bkit-ship-update-docs.md` no longer appears in the repo-wide `completed.md` grep at all.

**Re-confirmed in place (Tasks 1–7):**

- **Task 1** — `"feature"` in `TelemetryKind` (`:202`), `VALID_KINDS` (`:213`), discriminated union (`:515`), `validate` with closed `FEATURE_STATUSES` (`:283`, `:630-633`), `identity` key-default (`:715`); `.gitattributes:9-10` + `.bkit/templates/.gitattributes:9-10` carry both union lines, no `completed.md`; `DEFAULT_ROADMAP_BUILD_CYCLES`/`STALENESS_DAYS` + resolver in `bkit-manifest.ts:503-539`.
- **Task 2** — fifth pair (`parseCompletedMd:419`, `buildFeatureRow:814`, `featureRowCount:57`, `completedMdDeleted:69`) + `seedInFlightFeatures:914` bootstrap seed wired at `:1065`; migrate integration suite green.
- **Task 3** — `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh` + installed copy byte-identical (same size/mtime, `bkit-roadmap-fold.test.ts` hashes in-process via `node:crypto`); bats projection/idempotency/marker-invariant/self-heal rows green.
- **Task 4** — `.agents/docs.md:39` (`docs/roadmap.jsonl`, five `●`) + `:56` (`docs/roadmap.md`, Project Documents) + template `:39`; both `.gitattributes` copies carry `docs/roadmap.md merge=union`.
- **Task 5** — `docs/completed.md` and `.bkit/templates/docs/completed.md` are GONE from disk; `grep -c completed .bkit/version` = 0; `.bkit/README.md` / `.bkit/workflows.md` / `.bkit/prompts.md` carry no `completed.md` reference (remaining "completed" hits are unrelated English). **Ticked** — see GAP-1 below for the one clause judged unsatisfiable as literally written.
- **Task 6** — all FOUR STRAY allowlists carry `^docs/roadmap\.(md|jsonl)$`: `bkit-design.md:799` (dev) + `:863` (PR), `bkit-plan.md:860` (dev) + `:924` (PR); ledger append precedes `bkit_roadmap_fold` in both runtime shapes; tracker enrichment is a real `mcp__github__list_issues` orchestrator step (`bkit-design.md:769`, `bkit-plan.md:830`) writing `[]` on error.
- **Task 7** — `bkit-build.md:1291-1322` / `bkit-debug.md:1135-1166` append on `feat/{FID}` then mirror the SAME line to `dev` under `.bkit/.dev.lock` with `exit 0` on lock-busy; `bkit-roadmap-devwrite.integration.test.ts` drives a real bare-origin + clone temp repo (observed in the run output).

**Left `[ ]` deliberately:** the Verification "Local gate suite" row (`pnpm bkit check` not green — host-mirror drift, deferred by design), 🔒 Gate 1, the Pre-Flight Core/Conditional rows, Security & Privacy rows, and the three 👤 Human Confirmation boxes.

**Verdict rationale:** no blocking defect remains in any `Done when` clause. The residual items are (a) deferred-by-design host-mirror regen owned by sub-plan 3, (b) plan-text clauses that are unsatisfiable as literally written and internally contradictory with this plan's own Task 2, and (c) human-owned confirmation boxes — all CONCERNS per the sub-plan's own scoping, not failures.

## Identified Gaps Log

6 gaps (0 blocking, 3 concerns, 3 minor) — all carried, none newly introduced.

1. **GAP-1 — CONCERN (carried, plan-text) — Task 5's repo-wide grep clause is unsatisfiable as written.** `grep -rln "completed\.md" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=plans .` returns 18 files, not "ONLY `docs/decisions.jsonl` + the six host mirrors". The two genuinely removable shipped-surface hits are now gone. Every remaining non-mirror hit is REQUIRED by this plan's own Task 2 or is append-only history: `.bkit/src/bkit-telemetry-migrate.ts` (+ its integration test), `bkit-cli.ts` (verb help must name the pair), `bkit-preflight.ts` (+ test — the advisory must detect the file), `bkit-telemetry.ts`, `bkit-telemetry-gitattributes.integration.test.ts`, `bkit-ship-invariants.test.ts` (the new negative assertion), `docs/deferrals.jsonl` + `docs/decisions.jsonl`, and the tracked `dist/{bkit-cli,bkit-preflight,bkit-telemetry-migrate}.js` build output. Task 5 ticked on the substantive clauses; the clause should be narrowed (shipped workflow/prompt/doc surface only) in a plan revision or at sub-plan 3's holistic pass.
2. **GAP-2 — CONCERN (carried, deferred by design) — host-mirror staleness; `pnpm bkit check` not green (19 drift writes, unchanged count).** `.claude`/`.cursor`/`.opencode` copies of `bkit-ship` + `bkit-ship-update-docs` still carry the pre-migration `completed.md` verdict reader and `BOOK_PATHS`, so a ship driven through a host mirror derives `UPDATE_DOCS_VERDICT` from a deleted path. Explicitly scoped to sub-plan 3 (WS-6) batched `bkit install`; this sub-plan's Pre-Flight forbids per-edit regen. **MUST-DO for sub-plan 3.**
3. **GAP-3 — CONCERN (carried) — Gate 1 + Pre-Flight + Security & Privacy + the three 👤 Human Confirmation boxes remain `[ ]`.** The three review-section confirmations are human-owned and cannot be ticked by an agent; the master plan carries no `[x]` to inherit. The agent-verifiable Pre-Flight Core/Conditional and Security rows were never ticked by the executor either. Gate 1 cannot close without the owner's confirmation.
4. **GAP-4 — MINOR (carried) — `bkit-roadmap-devwrite.integration.test.ts`'s `DEV_LOCK_MIRROR` is a hand-copied constant.** The header claims it drives the ACTUAL shipped code path, but the snippet is transcribed rather than sliced out of `bkit-build.md:1291-1322` / `bkit-debug.md:1135-1166`, so it can drift silently. `bkit-ship-verdict.integration.test.ts` demonstrates the correct extract-then-execute pattern (and now also proves `$BOOK_ROOT` resolution). Real-git boundary is otherwise sound.
5. **GAP-5 — MINOR (carried) — Task 2's "a seeded parity mismatch aborts with the `.md` intact" has no test for the `completed.md` pair.** The gate is implemented; the only forced-mismatch test covers `knowledge.md`/`decisions.md`, and its own comment documents that the mismatch is unreachable by construction for a parser-derived count. Plan-text/test-seam gap, not a code defect.
6. **GAP-6 — MINOR (carried) — test-strength gaps.** Task 6's "appends its status row BEFORE regenerating" is asserted as presence, not order (the implementation IS correctly ordered in all four workflows — re-read this session); Task 7's "no `git add -- docs/` and no `-A` anywhere in `bkit-ship.md`" is covered by `bkit-ship-invariants.test.ts`'s pre-existing negative assertions (green) rather than by the row-11 test that names the clause. Also unchanged: the committed dogfood `docs/roadmap.md` still renders the pre-remediation 4-column schema with no `### Ship` section (self-correcting on the next close, since the board is a pure regenerate holding no state).
