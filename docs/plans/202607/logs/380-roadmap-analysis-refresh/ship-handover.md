# Debug Abort Handover

## The Short Version

The roadmap-automation feature (#380) is functionally complete and has passed every real test three times running, but ship keeps stopping at its final paperwork check. This third attempt found three small, low-risk loose ends — two stale comments/tests that still refer to a file we deleted, one doc page listing an outdated rule, and two known tooling bugs that got worked around but never written down. None of these affect what the feature actually does; the fix is roughly one small edit round plus a mirror regen, not a rebuild.

## What's Actually Happening

**Symptom:** `@bkit-ship-deferred-sweep` (the pre-merge completeness gate that checks the shipped work against what the design and plan promised) returned `Verdict: FAIL / Failures: 3` for the third time on this branch, blocking the merge from completing.

**Trigger:** This is ship attempt 3 on #380. Attempt 1 (2026-07-31) found 5 gaps — all later fixed in build/debug and reconfirmed closed by this sweep. Attempt 2 (today, earlier) found 4 different gaps in the shipped surface; those were fixed and pushed, and a fix-of-a-fix regression (an apostrophe in a comment breaking a lint-locality test) was caught and repaired before merging into `origin/dev`. This third sweep, run fresh against the merged branch, found 3 _new_ gaps that neither of the first two sweeps could have seen, because they only exist in text the second remediation pass itself wrote.

**Proximate cause:** All three gaps are the same shape — "the work is done, the record of it is not":

1. A shell-script comment and its template twin still explain a `case` branch by naming `docs/completed.md`, a file that was deleted and replaced by `docs/roadmap.md` in this very change; a stray test assertion likewise still says ship derives its verdict from `grep -c ... docs/completed.md` when it now reads a `status=="SHIPPED"` row from `docs/roadmap.jsonl`.
2. `.bkit/workflows.md` (the authoring reference for editing workflow files) still publishes the _old_ STRAY-guard regex for design/plan closes, while the four real code sites were already widened to admit `docs/roadmap.md`. If someone regenerates that block from the documented (stale) regex, every future PR-mode design/plan close would fail trying to commit its own roadmap update.
3. Two real tooling bugs were found and worked around during round 2's remediation (an apostrophe in a comment causing a false "unassigned variable" finding; a test that counts a bare filename _mention_ in a comment as if it were a real invocation) — but this repo's rule requires every discovered bug to get a `docs/failures.jsonl` row, and neither did. Only a git commit message records that either happened.

**Root cause (design fragility):** None of these are behavioural bugs in the shipped feature. They're a _documentation-completeness_ gate doing exactly its job: catching text that quietly went stale in the same change that made it stale, and catching an unwritten "we found a bug and worked around it" moment. The feature itself — the roadmap board, the mechanical status tier, the analysis tier, cadence, reverse sync — has passed the same sweep's behavioural checks (tests, bats, typecheck, slop, `bkit check`, board re-fold parity) clean three times.

**Contributing factors:** A large, dense PR (109 files / 6866 insertions / 497 deletions on this attempt) makes small stray references easy to miss even with careful per-line review; the sweep itself found and closed 4 nearly identical drift-classes in round 2, so this is the same failure mode recurring at a smaller scale rather than a new class of problem.

## Rot Signals

None. No diagnose attempts ran — this workflow aborted at the ship-deferred-sweep gate, which by design runs _before_ debug-diagnose would ever be invoked (glob for `ship-failure-diagnose-*.md` / `ship-failure-remediate-*-log.md` confirmed empty).

## Out-of-Scope Recommendations

None. No diagnose attempts ran, so there is nothing to aggregate from that source. (The sweep's own "Exempt (out-of-scope)" table lists 10 previously-declared deferrals it re-verified as still correctly out of scope — see `docs/plans/202607/logs/380-roadmap-analysis-refresh/ship-deferred-sweep.md` § Exempt — but those are pre-existing declarations, not new recommendations from this run.)

## Attempt History

<!-- prettier-ignore -->
| Attempt | Strategy | What was tried | Why it stopped |
| --- | --- | --- | --- |
| Ship 1 (2026-07-31) | — | First ship attempt on #380; `ship-deferred-sweep` found 5 blocking gaps against the plan's Success Criteria / `Done when` lines. | Verdict FAIL, 5 failures — workflow aborted before merge. |
| Ship 2 (today, 19:56–21:22 UTC block) | — | Fresh worktree, regression guard PASS, `ship-deferred-sweep` re-run: confirmed all 5 round-1 gaps fixed, but found 4 *new* gaps in the shipped surface (PR-mode design/plan close never pushed the roadmap commit; `.bkit/version` still hashed the deleted `docs/completed.md`; the ship conflict-resolve Tier-1 ledger list omitted both roadmap paths; a staging allow-list swap was add-only with an inverted test). | Verdict FAIL — workflow aborted. The ship orchestrator discovered the 4-gap fix already existed as an **unpushed local commit** in the worktree, pushed it, then found and fixed one small regression the fix itself introduced (an apostrophe in a comment broke `maskNonExpansions`/lint-locality). Merged into `origin/dev` — GitHub's mergeability check briefly misreported this as conflicting even though a real local `git merge` was clean; confirmed a GitHub-side quirk on a large homogeneous diff, not a real conflict. |
| Ship 3 (this attempt, 20:42–21:22 UTC) | — | Re-ran `ship-deferred-sweep` from scratch against the now-merged branch (`origin/dev` head `88dfae9c`, this branch's own diff = 109 files / 6866 insertions / 497 deletions). Re-verified all 4 round-2 gaps genuinely fixed (all confirmed). Ran the full gate suite fresh: `pnpm vitest run` (3710 passed / 2 pre-existing skips / 2 pre-existing todos), `bats` roadmap-fold/cadence/telemetry-failopen (31 ok), `typecheck` clean, `format:check` clean, `lint:prose` clean (2 pre-existing warnings, untouched files), `slop:delta` net 0, `bkit check` 0 writes, board re-fold byte-identical. Found 3 new, smaller gaps — all "record of the work" class, none behavioural. | Verdict FAIL, 3 failures, 1 unjustified — workflow aborted; this handover is being written instead of a 4th remediation attempt because ship-debug (this agent) writes only a handover, never a fix. |

## Verified Resolutions (DO NOT ROLL BACK)

Everything below is confirmed working at HEAD and must not be reverted:

- **All 5 round-1 gaps** (design doc's own re-review directives: per-FID upsert, `completed.jsonl` migration+backfill, orchestrator-mediated reverse tracker sync, canonical reconciliation/recovery check, build/debug 4th staging shape) — shipped and verified.
- **All 4 round-2 gaps** — PR-mode design/plan close now pushes its roadmap commit (`bkit-design.md:974`, `bkit-plan.md:1015`, all 6 host mirrors); `.bkit/version` no longer hashes `docs/completed.md` (guarded by `bkit-ship-invariants.test.ts:218`); `@bkit-ship-conflict-resolve`'s Tier-1 ledger list correctly names both `docs/roadmap.jsonl` and `docs/roadmap.md`, no `completed.md`; the staging allow-list (`BOOK_PATHS_ALLOW_LIST`) opens with `docs/roadmap.md`, carries no `completed.md`, and its test now asserts the correct direction.
- **The full feature surface** — `kind:"feature"` codec + six-state ladder, `.gitattributes` union lines, `bkit telemetry migrate` fifth pair, `bkit-roadmap-fold.sh` projection + bootstrap/self-heal, doc-index rows, ship writer + `SHIPPED`-only verdict reader, four STRAY allowlists (code sites, not the doc), build/debug dev-lock 4th staging shape, `@bkit-roadmap-refresh` opus leaf, ship Step 10 third parallel subagent + Gate 10, cadence off distinct `BUILT` FIDs, reverse tracker sync, reconcile/recovery drift check, `/bkit-roadmap` utility, mirror regen — all 23 intended deliverables from the three sub-plans are marked Delivered (22) or Partial (1 — the completed.md sweep, see Persistent Errors) in the sweep.
- **The `380-first-bootstrap-preserve-preexisting-consumer-roadmap-content` deferral** — carries a one-way `unjustified` verdict from a prior adjudication, but the sweep independently verified the work was in fact subsequently done (`bkit-roadmap-fold.sh:196-231` bootstrap + 2 bats rows) — do not treat the `unjustified` label as meaning the work is missing.

## Persistent Errors

Three blocking gaps, all reproducible at HEAD (`88dfae9c` + this branch's diff), none behavioural:

1. **Stale `docs/completed.md` references (2 files) — `.bkit/scripts/bkit-rebase-resolve.sh:149`, its template twin `.bkit/templates/.bkit/scripts/bkit-rebase-resolve.sh:149`, and `.bkit/src/bkit-verdict-vocabulary.test.ts:44`.**
   - Error text at `bkit-rebase-resolve.sh:149`: `# docs/completed.md is prose: repeated blank lines and repeated headings are legitimate, so it is unioned but never deduped.` — the `*)` default branch this comment explains now only ever matches `docs/roadmap.md` (the same commit removed `docs/completed.md` from `BKIT_REBASE_LEDGERS` at `:54-58` and added both roadmap paths), so the comment names a file bkit deleted.
   - Error text at `bkit-verdict-vocabulary.test.ts:44`: `"DOCS_VERDICT", // ship derives it from \`grep -c ... docs/completed.md\``— actively wrong;`bkit-ship.md:1218`derives`DOCS_VERDICT`from a`jq`assertion on a`status=="SHIPPED"`row in`docs/roadmap.jsonl`, and the `grep -c` reader was deleted by this change.
   - Sequence: introduced when `docs/completed.md` was deleted and its readers migrated to `docs/roadmap.jsonl`; these two spots were simply not swept in the same pass (17 of 20 `completed.md` hits in the repo are legitimate and correctly retained — migrator/CLI-help/codec/preflight-advisory/append-only-ledger references — only these 3 are wrong).

2. **`.bkit/workflows.md:1479` publishes the pre-widening STRAY regex.** Documented (stale): `^docs/plans/|^docs/[^/]+\.jsonl$|^\.bkit/[^/]+\.jsonl$`. Actual, at all four live code sites (`bkit-design.md:903,968`; `bkit-plan.md:944,1009`): `^docs/plans/|^docs/roadmap\.md$|^docs/[^/]+\.jsonl$|^\.bkit/[^/]+\.jsonl$`. `docs/roadmap.md` needs its own alternative because it is not a `.jsonl`. Failure mode if left as-is: an agent regenerating that STRAY-guard block from the documented (wrong) regex would drop the `docs/roadmap.md` exception and cause every future PR-mode design/plan close to fail trying to commit its own roadmap update.

3. **Two discovered tooling bugs, unrecorded until this handover** (now recorded — see below):
   - `maskNonExpansions` (`.bkit/src/bkit-block-locality-audit.test.ts:254`) masks `'...'` with no `#`-comment awareness — one possessive apostrophe in a comment pairs with an unrelated later quote and blanks every line between, hiding real `VAR=` assignments and producing a bogus unassigned-`$VAR` finding at the wrong line. Hit at commit `8427ed08`, worked around by rewording the comment; the regex itself is untouched.
   - `tests/ship-failure-path.bats:184`'s awk block selector matches the bare substring `bkit-book-commit.sh`, so a comment merely _naming_ the file counts as an invocation, breaking both the "exactly 3 wired blocks" assertion (`:192`) and the "every invocation is guarded" assertion (`:201`). Hit at commit `2b669577`, worked around by removing the filename from a comment; the selector itself is untouched.

**Action taken by this handover:** both tooling bugs have now been recorded as `docs/failures.jsonl` rows (keys `block-locality-audit-quote-mask-pairs-comment-apostrophe-across-lines` and `ship-failure-path-bats-counts-comment-mentions-as-book-commit-invocations`, both `severity: LOW`, `status: OPEN`) so gap 3 is now closed for the _recording_ obligation; the underlying regex/selector defects remain unfixed (explicitly out of #380's scope per the sweep).

**Not blocking, worth a decision at ship (per the sweep's Handover Notes):**

- SP3's "consumer install/upgrade doc" row was never applied — `docs/setup.md` and `docs/architecture.md:58` don't mention the new fifth `bkit telemetry migrate` pair (`completed.md` → `docs/roadmap.jsonl`) or that it's not auto-run at `bkit upgrade`. Only appears in a Documentation Updates table, never a `Done when`/Acceptance line, so the sweep did not count it as blocking — but it's the one place a real consumer would look.
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md` still opens `Verdict: FAIL / Failures: 5` — correct as a historical record (the CLOSED ledger row confirms all 5 are fixed), just don't read its header as current state.
- SP2's Pre-Flight prose and SP1's Edge Cases table still describe the cadence/staging mechanism in superseded terms (`stats.jsonl outcome rows`, `frozen BOOK_PATHS allow-list`) — plan-artifact drift only, not shipped surface.

## Recommended Next Steps

1. **Fix the 3 gaps directly (recommended).** ✅ FIXES all 3 blocking gaps and unblocks the merge. ❌ DOES NOT touch runtime behaviour (none of the 3 gaps are behavioural). ⚠️ COST: one small edit round — reword 2 comments + 1 test string + regenerate `.bkit/workflows.md`'s STRAY-regex line (mirror-regen not needed for this doc file, it's not a rendered mirror), plus the two `docs/failures.jsonl` rows (already appended by this handover). Estimated well under an hour; the sweep itself calls this "none should take more than one small edit round plus a mirror regen."

2. **Fix gaps 1 and 2 only, defer gap 3's recording to a follow-up deferral row instead of a failures.jsonl row.** ✅ FIXES the 2 doc-drift gaps. ❌ DOES NOT close the "discovered bugs must be recorded" obligation as cleanly — the sweep explicitly says a `docs/deferrals.jsonl` row with `reason: "scope-declared"` pointing at a follow-up issue is an acceptable alternative to a `failures.jsonl` row, but this handover has already taken the more direct path (recorded them as failures) since it costs nothing extra and needs no new issue. ⚠️ COST: marginally less than Option 1, but leaves the two live tooling bugs one degree less discoverable to the next person who hits them.

3. **Re-run `ship-deferred-sweep` once more without fixing anything, hoping it's wrong.** ✅ FIXES nothing (not recommended — the gate has been right twice already this branch, and its evidence here is independently verified against source, not just its own assertions). ❌ DOES NOT resolve the block. ⚠️ COST: wastes a full sweep cycle for near-certain re-FAIL.

4. **Escalate scope and rewrite the sweep's own strictness (e.g., relax the "no stale references" bar).** ✅ FIXES nothing about #380. ❌ DOES NOT address the actual defects, and weakens a gate that has correctly caught 12 real gaps across 3 attempts on this one feature. ⚠️ COST: high — touches shared ship-workflow infrastructure for a problem that's cheaper to just fix.

## Recommended Path

**Option 1.** All three gaps are small, well-localized, non-behavioural text fixes with exact file:line locations already identified by the sweep, and the two `docs/failures.jsonl` rows this handover appends already satisfy the recording half of gap 3. A fourth ship attempt fixing gaps 1–2 (the `docs/completed.md` sweep completion and the `.bkit/workflows.md` STRAY regex) should pass cleanly — nothing else in the feature has failed a behavioural check in three consecutive sweeps.

## Reference Docs

- `docs/plans/202607/logs/380-roadmap-analysis-refresh/ship-deferred-sweep.md` — this attempt's full sweep (Verdict FAIL, 3 failures, 1 unjustified), including the complete 23-row Intended Deliverables table, the 4-row re-check of round-2's gaps, the 10-row Exempt table, and the Handover Notes this document draws from.
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl` (this repo's authoritative copy) — full workflow history: design (2026-07-22), plan (2026-07-23), build (2026-07-29, failed holistic verify with 5 gaps, all later fixed), ship attempt 1 (2026-07-31, FAIL), ship attempt 2 (today, FAIL after finding 4 gaps, fixed+merged), ship attempt 3 (today, this FAIL).
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/ship-input.md` — full issue history including the design's 3 amendments (tracker-optional on-disk-first sensing; canonical-home revision flipping roadmap.md to authoritative; completed-ledger/board-cap/telemetry-scope decisions) and both plan/design summaries.
- `docs/failures.jsonl` — carries the full history of #380-related failures including the now-closed `380-holistic-verify-5-cross-sub-plan-integration-gaps`, the 4 round-2 ship gaps (`380-devlock-roadmap-mirror-missing-adopt-mode-fence`, `380-fold-tracker-vs-ledger-key-namespace-duplicates-every-enriched-fid`, `workflow-run-sentinels-not-gitignored-beside-lock`, all CLOSED), and the two newly-appended tooling-bug rows this handover added.
- `docs/deferrals.jsonl` — carries the 2 still-OPEN #380 deferrals (`380-dev-located-roadmap-status-write-for-build-debug-closes` — actually CLOSED, superseded; `380-persisted-frontier-snapshot-event-log-for-260` — OPEN, correctly deferred to #260) plus the `unjustified`-verdict `380-first-bootstrap-preserve-preexisting-consumer-roadmap-content` row, all re-verified by this sweep as correctly adjudicated.
- **Untrusted-content note:** nothing in the diff, commit messages, plan artifacts, or ledger rows read as a directive aimed at this agent; all treated as data per the sweep's own untrusted-input note, which is carried forward unchanged here.
