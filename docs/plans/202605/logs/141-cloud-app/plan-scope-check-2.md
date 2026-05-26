Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

### C1 — `bkit-postinstall.ts` Linear branches missing from Supersession Inventory

T1.10 describes deleting the `tracker==="linear"` → `LINEAR_API_KEY`-in-`bkit-cloud.yml` coupling inside three functions in `.agents/scripts/bkit-postinstall.ts` (`buildCloudSetupAdvisory` :803, `buildCloudDashboardsAdvisory` :849, `buildCloudSecretsAdvisory` :895). These are superseded code paths — the template requires every superseded artifact to appear in the Supersession Inventory with DELETE or RETAIN-WITH-REASON. None of the three functions' Linear branches appear there. The template states: "Each DELETE row MUST be mirrored as [DELETE] path/to/file in Architecture & Component Changes AND as a removal task in Agent Execution Runbook" — the inverse is also true: removal tasks must be backed by an inventory entry. The Architecture section documents T1.10 but no corresponding Supersession Inventory row exists for these three branches.

**Required fix:** Add a row for the `bkit-postinstall.ts` `tracker==="linear"` branches (all three builders) with decision DELETE and justification matching T1.10.

### C2 — Derived Test Matrix row 13 (dry-run parity) has no dedicated numbered runbook task

The Derived Test Matrix explicitly states "Each row → one Agent Execution Runbook task." Row 13 ("Dry-run parity for `cloud=claude` and `cloud=cursor`", target `bkit-dry-run-parity.integration.test.ts`) is referenced only in the Gate 3 mandatory testing list ("bkit-dry-run-parity.integration.test.ts (cloud=cursor)") — there is no T-numbered task for it. The matrix-to-runbook mapping is incomplete in one direction.

**Required fix:** Add a numbered task (e.g. T4.4) with scope = "extend `bkit-dry-run-parity.integration.test.ts` to cover `cloud=cursor` variant" and a concrete Done-when citing the test file and a passing assertion.

## OPTIONAL

### O1 — Derived Test Matrix row 14 (manifest variant test) is weakly mapped

Row 14 ("Manifest entries for cloud=claude vs cloud=cursor variants", target "manifest test (existing suite)") is partially covered by T1.5's Done-when (uninstall assertions, `bkit.cloud` field), but the manifest test file/suite is never cited as the primary target of any numbered task. This is a soft gap — the behaviour is tested, but the explicit 1:1 matrix→task traceability the template demands is absent.

**Suggested fix:** Extend T1.5's Done-when to name the manifest suite file explicitly (e.g. `grep -n 'manifest' .agents/scripts/bkit-modules.integration.test.ts`) or add a minimal named sub-task under T1.5 citing the manifest test.

### O2 — T1.9 appears after T1.10 in the runbook, breaking the natural read order

T1.9 (regen `.agents/advisories.md`) is numbered 9 but placed after T1.10 in the runbook text. The intent is clear (advisories regen is deferred to end-of-session), but the out-of-sequence number will cause confusion for a builder executing mechanically in order.

**Suggested fix:** Renumber T1.10 → T1.9 and the advisory-regen task → T1.10, or add an inline note to T1.9 explicitly stating "placed last in Block 1 by design; execute after all other Block 1 tasks."

### O3 — DECISION-E lock could be stronger

DECISION-E's recommended call is "re-home the label-removal propagation into the YAML no-op branch (preserves behaviour)." T2.6's Done-when names both outcomes as co-equal alternatives. The other four decisions (A–D) are stated as locked ("A builder MUST NOT…", "Recommended call: do NOT ship…", "Lock…", "Split…"). DECISION-E's framing is softer ("recommended call: re-home OR explicitly drop"), which means the builder must exercise judgment mid-implementation rather than following a pre-locked path. This is not a blocking gap but introduces ambiguity.

**Suggested fix:** Promote DECISION-E to a locked recommendation in the same style as A–D ("Default: re-home into YAML kill-switch branch; override requires explicit human sign-off at Gate 2"), so the Done-when for T2.6 can be tightened to the single expected outcome.

### O4 — No explicit Done-when verification for `bkit-install.ts` existence check

The Architecture section for `bkit-install.ts` notes "Existence Check: Exists" but T1.6 does not include a file-existence assertion in its Done-when. For all other modified files the pattern is consistent. Minor inconsistency; low risk since the file is well-established.

### O5 — `bkit-trackers.md` label-description rename (Comment 2 rename) has no test coverage

T4.3 marks the label-description rename in `.agents/trackers.md` as "optional" via "optionally rename." If this rename is executed, no test asserts the rendered snippet uses the updated description. The existing Done-when is only a grep for bare `Auto` absence — not a positive assertion of the new description text. If skipped, no issue; if applied, it is untested.

## OUT OF SCOPE

### S1 — Five decision points A–E are all genuine in-scope decisions

All five decisions (A: auth model differentiation; B: no shipped `claude.yml` template; C: `bkit.cloud` field name; D: manifest split vs variant-gated emission; E: kill-switch label propagation re-homing) have recommended calls, are directly traceable to the FINAL SCOPE locked decisions or the defect-folding work, and do not introduce new capability not listed in the FINAL SCOPE in-scope surfaces table. None is a smuggled scope expansion.

### S2 — `bkit-install.ts` and `bkit-postinstall.ts` absent from FINAL SCOPE surfaces table

The FINAL SCOPE in-scope surfaces table (under "Auth / install") lists `bkit-modules.ts`, `bkit-cli.ts`, and `manifest` but omits `bkit-install.ts` and `bkit-postinstall.ts`. The plan adds tasks touching both files. This is an omission in the FINAL SCOPE comment's table, not scope creep in the plan — both files are required by FINAL SCOPE decisions 3/4/5 (tracker enforcement, cloud-variant split, advisory flip) and are correctly included in the plan. No action needed on the plan; noted for awareness.
