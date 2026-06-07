Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

**C1 — Matrix↔runbook mapping is NOT bidirectional: WS5-T2b has no Derived Test Matrix row.**
WS5-T2b (line 610) is a real boundary test — it runs `bkit upgrade` over a fixture consumer and asserts ALL `.md` ledgers stay byte-identical + mtime-unchanged, plus a dispatch-graph assertion that no `upgrade` path reaches the migrate-delete function. This is the mechanical proof closing the KN-8 / `611b438` repo-bricking regression vector (the single highest-risk surface in the whole plan, per the WS-5 WARNING and Rollback row line 510). The Derived Test Matrix (lines 128-154) has NO row for it. The two migration matrix rows (lines 153-154) map only to WS5-T3 (real-corpus + packed-tarball). Per the plan's own contract ("Each row → one Agent Execution Runbook task" + the required 1:1 bidirectional mapping), a verification task this load-bearing must appear in the matrix. FIX: add a matrix row, e.g. `| `bkit upgrade`leaves consumer`.md`byte-identical + mtime-unchanged AND no upgrade path reaches the migrate-delete fn (KN-8 regression guard) | Integration **boundary: filesystem/consumer repo** (Vitest) |`.bkit/src/bkit-telemetry-migrate.integration.test.ts` (or a dedicated upgrade-isolation test) |`.

**C2 — WS5-T2's destructive-abort + idempotency assertions have no Derived Test Matrix row.**
WS5-T2's `Done when` (line 609) mandates three distinct verifiable behaviors beyond the WS5-T3 happy-path port: (a) a forced parity-mismatch fixture ABORTS with zero `.md` deleted, (b) an absent-`.md.bak` fixture ABORTS with zero `.md` deleted, (c) re-running migrate is a no-op (idempotent). None of these appear in the matrix — the migration rows (153-154) only cover successful port + parity + tarball. The abort-under-partial-failure path is the safety-critical branch (it is what makes the destructive delete recoverable per the Breaking Changes WARNING and Rollback line 510); leaving it out of the matrix means the matrix understates the test surface the runbook actually demands. FIX: add a matrix row for the abort/idempotency behavior pinned in `bkit-telemetry-migrate.integration.test.ts`.

**C3 — WS3-T2 per-mode (DEBUG/NORMAL/SOAK) counter coverage is demanded by the runbook but absent from the Derived Test Matrix.**
WS3-T2 `Done when` (line 572) requires bats coverage of the mode-matched DEBUG/NORMAL/SOAK reset/overflow semantics (`bkit-debug.md:47`), explicitly beyond the generic `decide_next`/`check_max` exit codes — a wrong per-mode branch "silently mis-routes all 5 workflows." The matrix has ONE counter-bus row (line 146: "Shell counter bus `counter_init/inc/get/reset/check_max` + `decide_next` exit codes/branch routing") which covers only the generic helpers, NOT the per-mode reset/overflow scenarios the runbook treats as a separate, higher-risk coverage requirement. The reconciliation-driven per-mode coverage is therefore in the runbook but not reflected in the matrix. FIX: either split the matrix row to name the per-mode (DEBUG/NORMAL/SOAK) reset/overflow scenarios, or add a second matrix row, so matrix↔runbook stays 1:1.

## OPTIONAL

**O1 — WS1-T8 `MAX_ROWS_BEFORE_ROLLUP` growth WARNING is observable but unpinned by any test.**
Edge-case table line 119 names the `MAX_ROWS_BEFORE_ROLLUP` grep-able WARNING as a required behavior, and WS1-T8 `Done when` (line 540) makes it grep-observable, but there is no Derived Test Matrix row and no automated assertion that exceeding the threshold actually emits the `[bkit-telemetry]` WARNING line. Given `foldFrom`/archive readers depend on this deferral being safe, consider a small unit/fixture test pinning "rowCount > MAX_ROWS_BEFORE_ROLLUP ⇒ WARNING emitted."

**O2 — Best-effort-append + fail-open idioms (edge rows 112-113) are verified only manually.**
The `|| echo "[bkit-telemetry] append failed"` and `|| echo "[bkit-comply] grader unavailable"` exit-0 guarantees are checked by WS1-T6/WS2-T6 grep `Done when` + Manual Verification Steps 1-2, but no automated test forces an append/grader failure and asserts workflow exit 0. WS2-T6 partially mitigates ("forced grader failure leaves workflow exit 0") but states no harness. Consider a bats/shell test that forces the failure path and asserts exit 0, since fail-open is a locked success criterion (SC #2).

**O3 — WS1-T6 covers all 5 workflows in one task with one grep `Done when`.**
WS1-T6 scopes inline-jq writers across `bkit-{design,plan,build,debug,ship}.md` as a single task. The `Done when` is a grep over all five plus a single parity check. This is acceptable but coarse — a per-workflow checklist (or a render-parity assertion per workflow) would make partial completion detectable rather than relying on one grep passing. Same pattern in WS1-T8/WS1-T9; consider tightening if execution granularity matters.

## OUT OF SCOPE

**S1 — No matrix row asserts the `slop-scan`/`lint:prose` exemption end-to-end for the WS-5 files.** WS5-T1 `Done when` says "slop does not flag them" (grep/run-observable) but the matrix has no slop-exemption row for any of the six data files (WS1-T4 covers only git check-attr). The plan deliberately argues no `.vale.ini` block is needed (line 365); a positive `pnpm lint:slop` assertion over the data files would be a nice belt-and-suspenders but is arguably out of the current test-matrix scope and not required to ship.

**S2 — Per-`bkitVersion`→CHANGELOG release-attributed regression (WS4-T3, line 447) has no dedicated matrix row.** The analysis matrix rows (151-152) cover the #183 regression + per-rule compliance rate but not the CHANGELOG-release-attribution sub-feature. This reads as a recommend/inform-only analysis nicety rather than a load-bearing testable behavior; flagging for awareness, not as a required matrix addition.

---

### Audit confirmations (no finding)

- Template structure: all template-mandated sections present and populated; gether-app-specific rows (DB/RLS/Zod/Playwright) correctly marked N/A with justification. No structural break → not FAIL.
- Every scope item with a build task has a paired verification task (codec→WS1-T2; gitattributes→WS1-T4; manifest→WS1-T3; grader→WS2-T3/T4; cli→WS2-T5; counters→WS3-T2/T4; harvest→WS4-T1/T2; analysis→WS4-T3; migration→WS5-T2/T3).
- Supersession Inventory: all 8 rows carry DELETE decisions; each `.md`-ledger DELETE is mirrored in Architecture (WS-1 `[DELETE]` block, WS-5 migration) AND as a runbook removal task (WS1-T5, WS5-T2/T4); the `utility-harvest-friction` agent DELETE is mirrored in WS4-T5. No missing supersession entry.
- Managed-block discipline: WS1-T4/WS1-T9 explicitly scope edits INSIDE the `bkit:start/end` markered blocks of `.gitattributes` and `rules.md` — this is correct (those blocks are the canonical shipped content, edited in source, not the regenerated mirrors). No task edits a regenerated `.claude/*`/`.cursor/*` mirror. Note: this is the intended pattern for bkit's own canonical files; not the consumer "edit below bkit:end" rule, which does not apply to bkit-repo source.
- No scope creep detected against design addenda A1-A7: every runbook task traces to an Architecture component or a locked addendum; OPEN QUESTIONs are routed to resolution tasks (WS2-T1, rollout/backfill/rollup-value) rather than pre-decided beyond design.
- Every runbook task carries explicit scope + a `Done when:` line + a verification signal; boundary tasks name the boundary + ground-truth (no mocks). No task missing `Done when`.
