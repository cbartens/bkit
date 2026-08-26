Verdict: FAIL
Failures: 9

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 1/3 (`docs/plans/202607/380-roadmap-analysis-refresh-plan-1.md`), Foundation (WS-1) + Mechanical tier (WS-2), Tasks 1–7 + Gate 1.

## Sub-Plans Verified

None (Single scope — 1 sub-plan of 3).

## Integration Gaps

None (Single scope — cross-sub-plan integration is verified holistically in sub-plan 3).

## Previously Attempted

None — first verify attempt (no `build-plan-verify-1-*` or `build-plan-gaps-remediate-1-*` artifacts on disk).

## Notes

**Ticked `[x]` (Done-when satisfied, verified against the codebase):** Task 1, Task 2, Task 3, Task 4, Task 5, and the Verification item "This sub-plan's tests pass".

**Left `[ ]`:** Task 6, Task 7 (tracker-enrichment clause of both `Done when` unimplemented — GAP-1/GAP-2), the "Local gate suite" Verification item (GAP-7), Pre-Flight/Gate 1 and the three 👤 Human Confirmation boxes (GAP-9).

**Evidence executed in this session (not trusted from the execute log):**

- `npx vitest run` over the nine sub-plan-1 test files → 9 files / 468 tests pass.
- `npx bats tests/roadmap-fold.bats tests/telemetry-failopen.bats` → 19/19 pass (matrix rows 1–6, 19, 23, 25 + the two new row-22 fail-open cases).
- `pnpm bkit check` → 19 drift writes, all confined to host-render mirrors (`.claude/`, `.cursor/`, `.opencode/`) + the `.bkit/version` pin. `.agents/docs.md` is NOT in the drift set (Task 4 Done-when satisfied).
- `docs/completed.md` and `.bkit/templates/docs/completed.md` are gone; `grep completed .bkit/version` is empty; `pnpm-lock.yaml` + `package.json` unchanged.
- `UPDATE_DOCS_VERDICT` migration verified by a real-boundary test that extracts the shipped `SHIPPED_HIT=` snippet verbatim from `.bkit/workflows/bkit-ship.md` and runs it against fixture ledgers — including the BUILT-only → FAIL green-with-omission guard (matrix row 10). This is the strongest test in the batch and the pattern the others should follow.
- Dev-lock mirror (matrix row 21) verified over a real temp git repo (bare origin + clone): BUILT row lands on `dev`, worktree returns to `feat/*`, held lock exits 0.

**Already-recorded, not counted as a new gap:** deferral `380-bootstrap-seed-key-namespace-mismatch-vs-migrated-completed-md-keys` (`docs/deferrals.jsonl`) — visible in the dogfood board (`docs/roadmap.md` lists already-shipped legacy plans such as `bar-111-bkit-npm-package` under `### Plan`). Accepted one-time noise per the deferral.

## Identified Gaps Log

9 gaps.

1. **GAP-1 — BLOCKING — Tracker enrichment (matrix row 20) is not implemented.** Tasks 6 and 7 `Done when` require that "each close, when wired, invokes the orchestrator `list_issues` read (never `gh`/`search_issues`) piped to the fold, guarded no-op under `none`, fail-open". What shipped in `.bkit/workflows/bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md` is a passive `#` comment INSIDE a bash fence ("...best-effort `list_issues` ... **may** enrich the board...") — no numbered orchestrator instruction, no MCP call, and no sink: `bkit_roadmap_fold()` in `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh` takes only `REPO_ROOT` and reads `docs/roadmap.jsonl` exclusively, so tracker rows have nowhere to go. Task 3's own spec bullet ("tracker rows merged only when the #202 inline-marker mode is `github`/`linear`") is likewise unbuilt. This is the "additionally enriched" half of Success Criterion #1. Tasks 6 + 7 left `[ ]`.
2. **GAP-2 — BLOCKING — The row-20 test encodes the gap as the expectation.** `.bkit/src/bkit-roadmap-staging.integration.test.ts` `describe("row 20: ...")` asserts only `content).toContain("tracker enrichment")`, `toContain("list_issues")` and `toContain("gh`/`search_issues")` — i.e. that a descriptive comment string is present. It passes green while zero enrichment behaviour exists. Per the repo's own doctrine (validate shipped config/behaviour with the real mechanism, never string-presence), this test must assert an invocable orchestrator step + a fold input path, not prose.
3. **GAP-3 — CONCERN — Naming deviates from the human-confirmed Naming Review.** The plan's `⚠️ Breaking Changes & Naming Review` names the exported symbol `BKIT_ROADMAP_FOLD` ("sourced fold helper exporting `BKIT_ROADMAP_FOLD`", repeated in Task 3). The script exports `BKIT_ROADMAP_PROJECT` (the jq program) and the function `bkit_roadmap_fold`; `bkit-roadmap-fold.test.ts` asserts `/^BKIT_ROADMAP_PROJECT=/m`. Either rename to the confirmed name or amend the Naming Review — a human-confirmed shipped-surface name should not drift silently at build time.
4. **GAP-4 — CONCERN — Board sections/columns do not match the declared contract.** `Data Schema Changes` specifies sections "Backlog -> Design -> Plan -> Build -> Debug -> **Ship** -> Shipped" with per-section rows `FID | Title | Milestone | Blocked-by | Last-transition ts` (Addendum 2 § K explicitly makes `## Ship` (in flight) and `## Shipped` separate sections). The fold renders `### Design / Plan / Build / Debug / Shipped` with columns `FID | Title | Category | Last-transition (ts)` — no `Ship` section, no `Milestone`/`Blocked-by` columns. The `Ship` omission may be defensible (no ladder status maps to in-flight ship) but it is undocumented; the column set change is unexplained.
5. **GAP-5 — CONCERN — Task 5's grep `Done when` is literally unmet; the mirrors now point at a deleted file.** `grep -rn "completed\.md" --exclude-dir=docs/plans .` still hits `.claude/commands/bkit-ship.md:150,158,825`, `.cursor/commands/bkit-ship.md:147,155,822`, `.opencode/commands/bkit-ship.md:153,161,828` and the three `bkit-ship-update-docs.md` mirrors — these carry the OLD `COMPLETED_HIT=$(grep -c ... docs/completed.md)` verdict reader and `BOOK_PATHS` entry against a file that no longer exists. The SSOT (`.bkit/workflows/`, `.bkit/prompts/`) is clean and this sub-plan forbids per-edit `bkit install`, so the fix is the sub-plan 3 (WS-6) batched mirror regen — but until it runs, a ship executed through a host mirror derives `UPDATE_DOCS_VERDICT` from a missing path. Flagged as a MUST for sub-plan 3, not re-work here.
6. **GAP-6 — CONCERN — Task 2 `Done when` clause "a seeded parity mismatch aborts with the `.md` intact" has no test.** The completed.md pair implements the gate correctly (`.bkit/src/bkit-telemetry-migrate.ts` ~L1424-1467: `.bak` -> `.migrating` -> `parseCompletedMd(bak).length !== featureRows.length` -> `abort(... ZERO .md deleted)`), but no new integration test exercises it. The mismatch is unreachable by construction (both counts come from the same parser over the same bytes) — the pre-existing `describe("migrate — abort safety: forced parity mismatch")` documents exactly this dead end for the other four pairs. Treat as a plan defect (untestable assertion) to be resolved by amending the clause or adding a seam, not as silent acceptance.
7. **GAP-7 — CONCERN — Verification item "Local gate suite ... `pnpm bkit check` green" is unmet.** `pnpm bkit check` exits 1 with "19 write(s) would occur — DRIFT DETECTED". All 19 are the deferred host mirrors + version pin (see GAP-5), so this is expected interim state, but the checklist item as written cannot be ticked in sub-plan 1; left `[ ]`.
8. **GAP-8 — MINOR — `bkit-roadmap-devwrite.integration.test.ts` re-implements the shell it claims to extract.** Its header says the idiom is "extracted as a standalone reusable shell function so the test drives the ACTUAL code path, not a re-implementation of it", but `DEV_LOCK_MIRROR` is a hand-copied constant ("extracted verbatim in shape") that can drift from `bkit-build.md` / `bkit-debug.md` without failing. `bkit-ship-verdict.integration.test.ts` demonstrates the correct pattern (read the workflow file, slice the snippet, execute it). Real-git boundary is otherwise good.
9. **GAP-9 — MINOR — Gate 1 and the three 👤 Human Confirmation boxes were never checked.** This sub-plan owns "🔒 Gate 1: Prerequisites Check"; all Core/Conditional Pre-Flight boxes and the Acceptance Scenario / Breaking Changes / Open Questions confirmations remain `[ ]`, and the master plan (`380-roadmap-analysis-refresh-plan.md`) carries no checkbox to inherit them from. Verifier cannot tick human-confirmation boxes; the executor should have resolved Gate 1's non-human items.

MINOR (not counted) — the fold emits unaligned markdown tables while the committed `docs/roadmap.md` is prettier-aligned, so every regenerate produces a format-only diff that the pre-commit hook re-normalises. Harmless, but worth a note if `format:check` ever runs before the hook.
