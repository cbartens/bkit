Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Plan Verification — Sub-Plan 3 (Docs, Tier-3 Detector & E2E)

**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **Sub-plan:** 3 of 3 · **Attempt:** 1
**Working tree:** `.worktrees/384-ship-bookkeeping` (verified `pwd`)

## Scope

`Single` (one sub-plan: Tasks 9, 10, 11).

## Sub-Plans Verified

1 (sub-plan 3 of 3; Tasks 9, 10, 11).

## Integration Gaps

None (Single scope — integration is not in scope).

## Previously Attempted

None (first attempt; no `build-plan-verify-3-*.md` or `build-plan-gaps-remediate-3-*-log.md` exist).

## Notes

Sub-plan 3's three tasks are mostly well-executed: the Tier-3 detector (Task 10) is correct, tested (35/35 GREEN), advisory/fail-open, derives from source; the E2E report (Task 11) is comprehensive with all deferrals recorded; the ledgers (Task 9) are correctly populated with no duplicate deferral keys. **However, Task 9 introduced a `bkit check` drift regression** by editing bkit-managed core docs (`docs/deployments.md`) in the rendered root WITHOUT updating the source template (`.bkit/templates/docs/deployments.md`) that ships to consumers via `bkit upgrade`. On origin/dev `bkit check` = 0 writes (GREEN); on HEAD = 2 writes (DRIFT). The SP3 Gate checkbox claiming `pnpm bkit check all green` is false. This defeats Task 9's core purpose: the consumer CI contract (`run_level=full`, `BKIT_SHIP_GATE_OVERRIDE` rollback audit) will be silently lost on the next `bkit upgrade`. Same root-vs-template gap exists for `docs/observability.md` and `docs/testing.md` (templates lack the ship-gate content), though `bkit check` only flags deployments.md in its core pass.

## Identified Gaps Log

### Gap 1 (FAIL — blocking): `bkit check` DRIFT on `docs/deployments.md` — template not updated

- **Evidence:** `pnpm bkit check` on HEAD reports `2 write(s) would occur` (exit 1) — `core: docs/deployments.md` + `write version pin: .bkit/version`. On origin/dev (checked out origin/dev's deployments.md, ran check) = `0 write(s)` (exit 0, GREEN). The drift was introduced by this branch.
- **Root cause:** Task 9 added the "Ship gate + bookkeeping" consumer CI contract (25 lines: `run_level=full`, `BKIT_SHIP_GATE_OVERRIDE` rollback audit, Path A/B description, residual-risk note) to root `docs/deployments.md` (lines 190–214, INSIDE the `<!-- bkit:end -->`-bounded managed region) but did NOT add the same content to the source template at `.bkit/templates/docs/deployments.md`. `diff docs/deployments.md .bkit/templates/docs/deployments.md` confirms the section is root-only; the template still ends at the pre-#384 content.
- **Consequence:** `bkit upgrade` would overwrite root `docs/deployments.md` from the template, LOSING the Task 9 consumer contract. Consumers receiving the next `bkit upgrade` would NOT get the `run_level=full` / `BKIT_SHIP_GATE_OVERRIDE` contract — directly contradicting the plan's core requirement: _"Release gate script + managed config + rewritten prose together in one `bkit upgrade` so no consumer sees prose calling a gate it does not have."_
- **SP3 Gate checkbox false:** `[x] Full gate suite ... pnpm bkit check all green` is FALSE — check is RED.
- **Same gap (templates stale):** `docs/observability.md` template (`.bkit/templates/docs/observability.md`) has 0 occurrences of `bkit-ship-gate` (root has the prefix + exit-code table); `docs/testing.md` template has 0 occurrences of `bkit-ship-gate`/`status-hole-detector` (root has the full #384 coverage section). `bkit check` does not flag these in its core pass (different handling), but the consumer-shipped templates are stale.
- **Remediation (gap-remediate):** Sync the Task 9 content into all three templates: add the "Ship gate + bookkeeping" section to `.bkit/templates/docs/deployments.md` (with `{{DEFAULT_BRANCH}}` token substitution where needed), add `[bkit-ship-gate]` prefix + exit-code table to `.bkit/templates/docs/observability.md`, add the #384 coverage section to `.bkit/templates/docs/testing.md`. Then re-run `pnpm bkit check` → expect 0 writes (the `.bkit/version` pin write should also resolve once dist is rebuilt).

### Gap 2 (CONCERN — pre-existing, unrelated): `bkit-upgrade.integration.test.ts` #281 AC timeout

- **Evidence:** `pnpm test` → 1 failed: `bkit-upgrade.integration.test.ts > #281 AC — bkit check exits 0 with multiple providers installed > bkit check exits 0 after installing two providers (nvidia + ollama-local)` — `Test timed out in 5000ms`. Re-run in isolation: same timeout.
- **Scope:** This test is NOT in sub-plan 3's diff (`git diff origin/dev..HEAD -- .bkit/src/bkit-upgrade.integration.test.ts` = empty). It is a pre-existing integration test that spawns real subprocesses (`bkit check` installing two providers); the 5000ms timeout is an environmental/machine-load flake, NOT a regression from Tasks 9/10/11.
- **Remediation:** Out of scope for sub-plan 3. Noting as a concern.

### Gap 3 (CONCERN — minor): E2E report stale claim about `bkit check`

- **Evidence:** `ship-e2e-validation.md` line 170 states: _"This was verified by `node dist/bkit-install.js check` (exit 0, no drift) in the Seam 2 prelude."_ This was true at the Seam 2 prelude (sub-plan 2 completion) but is now FALSE due to Gap 1 — `bkit check` now exits 1 with drift.
- **Remediation:** Update the claim after Gap 1 is remediated (template synced → check returns to GREEN).

### Gap 4 (CONCERN — cosmetic): Execute log gotcha count

- **Evidence:** `build-plan-execute-3-log.md` claims "knowledge.jsonl 3 gotchas" but only 2 were added by build-plan-execute-3 (`384-status-hole-detector-derives-expected-set-from-source-md`, `384-bats-tmpdir-collision-when-running-multiple-bats-files-in-one-invocation`); the 3rd (`rendered-mirror-diff-nonempty-by-construction-tracker-resolution`) was added by sub-plan 2's gaps-remediate cycle. Not a functional gap — the Done-when for Task 9 does not specify a count.

---

## Per-Task Verification

### Task 9 — Documentation + Contract Publication — `PASS (content present) / FAIL (template not synced)`

<!-- prettier-ignore -->
| Done-when criterion | Status | Evidence |
| --- | --- | --- |
| `docs/observability.md` contains literal `[bkit-ship-gate]` | ✅ PASS (root) | Lines 41, 81–108: prefix registered in prefix list + dedicated section with exit-code table + every terminal route's stderr line. ⚠️ Template `.bkit/templates/docs/observability.md` NOT updated (0 occurrences). |
| `docs/deployments.md` contains literal `run_level=full` consumer contract | ✅ PASS (root) | Lines 192–214: Path A/B, capstone contract, `paths-ignore`/docs-short-circuit/`[skip ci]` opt-out, residual-risk naming. ⚠️ Template NOT updated → `bkit check` DRIFT (Gap 1). |
| `docs/deployments.md` contains `BKIT_SHIP_GATE_OVERRIDE` rollback audit | ✅ PASS (root) | Lines 209–214: pin previous `@cbartens/bkit`; hold `bkit upgrade` for ship surfaces; audit `ship-gate-override` rows. |
| `docs/decisions.jsonl` row `384-ci-capstone-chain` exists | ✅ PASS | Line 44: full reasoning chain (ci.yml:19-21/111/130/602 → single assertion strictly stronger than Step 3); discarded alternatives named (merge queue, required status checks, Step-1 probe). |
| `docs/decisions.jsonl` row `384-tier3-promotion` exists | ✅ PASS | Line 45: "one release of fail-open signal without muting"; cross-linked to deferral `384-promote-status-hole-detector-from-advisory-to-gate`. |
| `docs/deferrals.jsonl` seven out-of-scope rows present | ✅ PASS | 5 pre-existing + 2 new (`384-merge-queue-unavailable-private-non-enterprise`, `384-required-status-checks-on-dev-via-bkit-protect-main`) = 7 out-of-scope. Mode-3 deferral (`384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`) separate (Task 11). |
| Each of the 5 pre-existing #384 keys `grep -c` ≤ 1 | ✅ PASS | All 5 keys verified count=1 (no duplicates). |
| `docs/knowledge.jsonl` gotchas surfaced | ✅ PASS | 2 new gotchas from execute-3 + content valid. |
| `docs/testing.md` ship coverage section | ✅ PASS (root) | § "Ship merge-gate + bookkeeping test coverage (#384)": tiered carrier, stub-harness pattern, Tier-3 fail-open advisory channel. ⚠️ Template NOT updated. |

### Task 10 — Tier-3 Status-Hole Detector (Advisory, fail-open) — `PASS`

<!-- prettier-ignore -->
| Done-when criterion | Status | Evidence |
| --- | --- | --- |
| `pnpm test bkit-status-hole-detector` passes | ✅ PASS | `pnpm vitest run .bkit/src/bkit-status-hole-detector.test.ts` → 35/35 passed (97ms). |
| Detector CLI exits 0 with advisory output on a known-holey fixture | ✅ PASS | Ran `npx tsx ... /tmp/holey-status.jsonl` → printed advisory report (PATH_A, 3 missing, 1 unexpected); `EXIT_CODE=0`. No `process.exit(nonZero)` anywhere; main() returns unconditionally. |
| Path-conditional sets asserted | ✅ PASS | `computeMandatoryForPath` handles PATH_A (skips conflict-resolve + retry), PATH_B (skips retry), MERGED_ON_ENTRY (skips middle + retry), ABORTED (empty), IN_PROGRESS (empty). 5 classifyRun cases + 4 mandatory-set cases in test. |
| Invented names (`ship-resume-human-override`) surface as delta | ✅ PASS | Test line 361 + 478; CLI run above surfaced it as `unexpected (invented names): ship-resume-human-override`. |
| Expected set derived from `bkit-ship.md` (headings + literals), NEVER a parallel table | ✅ PASS | `deriveExpectedStepSetFromSource()` parses `## … Step N` headings + `step:"ship-…"` literals at runtime. Cross-checks against `SHIP_STEP_ORDER` (frozen canonical) via `checkSourceCanonicalDrift`. |
| Promotion criteria referenced from `docs/decisions.jsonl` `384-tier3-promotion` | ✅ PASS | Detector source header (lines 7, 12) + `docs/testing.md` line 353 reference decision `384-tier3-promotion`. |
| No `as any` / `@ts-ignore` / `.skip` / empty `catch` | ✅ PASS | No anti-patterns. Two `catch (_e) { void _e; }` blocks (JSON parse skip line 316; realpath skip line 430) are intentional advisory fail-open paths with comments — not gate-weakening. |

### Task 11 — E2E Validation + Rollout — `PASS (report); live E2E deferred (documented)`

<!-- prettier-ignore -->
| Done-when criterion | Status | Evidence |
| --- | --- | --- |
| `ship-e2e-validation.md` non-empty | ✅ PASS | 184 lines, comprehensive. |
| Path A + Path B2 attempts recorded with PASS/FAIL against all 5 SC | ✅ PASS | SC1–SC5 each tabled with mechanical PASS + live DEFERRED. Path A = 341 real ship (SC1/2/3/5 PASS, SC4 N/A). Path B2 = bats mechanical (all PASS). |
| Rate-limit sample present | ✅ PASS | `gh api rate_limit`: 5000/h, 5 used; poll-loop budget analysis (Risk 4). |
| Tier-3 watermark calibration note present | ✅ PASS | 341 = clean baseline (0 holes); 261 = holey (3 missing); promotion target = 341. |
| Mode-3 deferral cross-ref recorded | ✅ PASS | § "Mode-3 deferral": deferred to `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (depends on `341-live-run-verification-mode-1-and-mode-3`); recorded in `docs/deferrals.jsonl`. |
| `--explain` vs `gh pr checks` | ⚠️ DEFERRED | No live PR with capstone available; deferred to first real ship; no `docs/failures.jsonl` row (no disagreement observed). Documented. |
| No silent drops (deferrals recorded) | ✅ PASS | All deferred work (live Path A/B2 E2E, mode-3, --explain diff) is explicitly recorded with deferral keys, not silently omitted. |

---

## Test Results

<!-- prettier-ignore -->
| Gate | Result | Notes |
| --- | --- | --- |
| `pnpm vitest run .bkit/src/bkit-status-hole-detector.test.ts` | ✅ 35/35 GREEN | Task 10 targeted test. |
| `pnpm typecheck` | ✅ GREEN | `tsc --noEmit` clean. |
| `pnpm test` | ⚠️ 1 FAILED / 2650 passed | `bkit-upgrade.integration.test.ts` #281 AC timeout (Gap 2 — pre-existing, unrelated, environmental). Excluding that flake: all green. |
| `pnpm format:check` | ✅ GREEN | Prettier clean. |
| `pnpm lint:prose` | ✅ 0 errors (1 warning) | 1 write-good warning in `docs/testing.md:318` ("There is") — non-blocking. |
| `pnpm slop:delta` | ✅ GREEN | 0 net-new, 0 worsened. |
| `pnpm test:bats` | ✅ GREEN (per execute log + predecessor verification) | ship-gate.bats (16), ship-failure-path.bats, ship-worktree-ownership.bats. |
| `pnpm bkit check` | ❌ RED — 2 writes DRIFT | Gap 1: `docs/deployments.md` template not synced + `.bkit/version` pin. Was GREEN (0 writes) on origin/dev. |

## Anti-Pattern Scan

- `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` in detector: **NONE.** Two advisory fail-open `catch (_e) { void _e; }` blocks are intentional and commented.
- Hand-maintained expected-step table in detector: **NONE.** Set derived from source at runtime; `SHIP_STEP_ORDER` is a cross-check constant, not the source of truth.

## Checklist Cross-Reference (SP3 Gate)

- `[x] No bolt-on / no gate-weakening` — ✅ verified (detector derives from source; fail-open).
- `[x] Contracts published` — ⚠️ root docs have content, but templates (consumer-shipped) are stale (Gap 1).
- `[x] Deferrals non-duplicated` — ✅ verified (7 out-of-scope rows, 5 keys grep -c=1).
- `[x] Detector advisory` — ✅ verified (35 tests GREEN; CLI exit 0 on holey fixture).
- `[x] E2E evidence` — ✅ verified (report non-empty; SC1–5 tabled; deferrals recorded).
- `[x] SP3 - Verified: Tasks 9–11 all [x]` — ⚠️ Tasks are [x] but `bkit check` gate is RED (Gap 1).
- `[x] Full gate suite ... pnpm bkit check all green` — ❌ **FALSE** — `bkit check` is RED.

Verdict: FAIL
Failures: 1
<!-- verdict:end -->
