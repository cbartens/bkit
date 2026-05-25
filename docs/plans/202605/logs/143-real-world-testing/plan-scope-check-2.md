Verdict: CONCERNS
Failures: 7

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

### C-1: WS7-7 guard table has 18 sub-items in the Runbook but the design's §D exhaustive table has 15 rows — the three added items need explicit scope

The design's §D guard table enumerates 15 sites. The v2-reviewed Runbook adds three items beyond the design table: (a) `Step 12 INNER tracker issue-update sub-step (line ~856)` gated `off OR soak`; (b) `Step 12 INNER Gate checklist item (line ~894)` widened to `off OR soak`; (c) a new `Handoff: soak crossover (new, Step 4 area)` row. These appear in the v2 plan's WS7-7 checklist but are NOT in the design's §D guard table. Items (a) and (b) are well-motivated but have no acceptance criteria beyond "Done when: guard reads `off OR soak`". There is no Vitest or grep verification step for the inner Step-12 sub-step. An implementer cannot run a grep for `off OR soak` as a verification because the pattern is inside natural prose — the task needs a grep anchor or a test. The plan's own Gate WS-7 references "18 sub-items including the two INNER Step-12 sub-sites" but does not provide a runnable verification for either inner site. **Gap:** Missing grep/command-based verification for the two INNER Step-12 guard sites.

### C-2: Test matrix row for `debug-reproduce` step — no Runbook task maps to verifying the `debug-reproduce` jq write or the `reproKind` classifier

The Derived Test Matrix (plan lines 98-113) has 12 rows; all are installer/manifest/snapshot/release-workflow Vitest tests. None of the 12 rows covers the workflow behaviour introduced by WS-3 and WS-6 (the `debug-reproduce` status.json write, the `reproKind` classifier logic, the `liveStack` resolver, the escape-hatch skip line). Because bkit is a markdown workflow toolkit these are not Vitest-testable, but the plan's own matrix preamble states "Each row → one Agent Execution Runbook task." The verification for these workflow-text changes is confined to manual-read tasks (WS3-2 Gate, WS6-1, Manual Verification Step 3). That is acceptable IF the matrix explicitly acknowledges the gap (e.g. "Workflow text changes verified by manual re-read per Manual Verification Step 3") — the current matrix rows have no such annotation and the template mandates 1:1 bidirectionality. **Gap:** 7+ Runbook workflow-edit tasks (WS3-2, WS3-3, WS5-1, WS5-2, WS6-1, WS6-3, WS7-3) are NOT represented by any matrix row; the matrix is directionally 1:1 with only the installer tests, not with the full Runbook.

### C-3: Supersession Inventory missing entries for the workflow/prompt discovery-seam loops and for new files

The Supersession Inventory table (6 rows) covers `package.json` script renames, `docs/testing.md` managed block, and three `.agents/workflows.md` catalog rows. It does NOT carry entries for:

- The eight `.agents/prompts/*.md` discovery-seam aggregate/loop strings (grep-identified in B2 of Breaking Changes) — these are superseded text and should be `DELETE (rename)` entries.
- The new `.agents/prompts/bkit-debug-soak.md` (it is `[NEW]`, not superseding anything, which is correctly exempt — but its absence from the inventory should be stated, not silently omitted).
- The `bkit-build-summary.md` and `bkit-debug-summary.md` changes (summary prompt additions) — no inventory row.
- The `.agents/workflows.md` NON-catalog lines 523/636/643/649/651 (owned by WS1-8) — not listed in the Supersession Inventory; the inventory only covers the three catalog rows.

The template states `NEVER accept @deprecated + still exported` and requires each DELETE row in `Architecture & Component Changes` to be mirrored in the Supersession Inventory. The eight prompt files' loop strings are deleted-and-replaced text. Missing inventory entries = CRITICAL per the Process.

### C-4: `docs/bkit-comparison.md` (line ~68) appears in the Documentation Updates table but not in Architecture & Component Changes and not in WS-1 tasks

The plan's Documentation Updates table lists `docs/bkit-comparison.md` line ~68 as owned by WS1-8. However, no WS-1 Runbook task (WS1-1 through WS1-8) explicitly calls out `docs/bkit-comparison.md` as a file to modify. WS1-6 lists `.agents/rules.md`, `docs/{technology,setup,deployments,testing,security}.md`, `.agents/README.md`, `.agents/prompts.md` — but NOT `docs/bkit-comparison.md`. The note in the Documentation Updates table says it is "owned by WS1-8 so the Gate WS-1 grep finds no unowned hit" — but WS1-8 deals with `.agents/` discovery-seam loops, not `docs/bkit-comparison.md`. This creates an ownerless edit: the file must change, no task claims it, and Gate WS-1 would therefore pass with a stale reference remaining. **Gap:** Missing explicit task for `docs/bkit-comparison.md` or it must be added to WS1-6's scope.

### C-5: WS1-8 Done-when verification uses `rg -n '\b(typecheck|format:check)\b' .agents/prompts .agents/workflows .agents/workflows.md` but the eight named prompt files include `bkit-utility-compress-markdown.md` which is an "example string" — the verification does not distinguish intent

WS1-8 Done-when includes: "every remaining hit is a probe-alias paired with its renamed name (no bare legacy name without its `check:*` pair)." This requires a human to classify each hit as either a probe-alias or a bare legacy name — the grep output is not self-describing. `bkit-utility-compress-markdown.md` is explicitly noted as an "example string" in B2, meaning its usage is illustrative prose, not a discovery loop. After the rename, the example string should read `check:type`; a probe-alias there makes no semantic sense. The Done-when therefore requires a context-sensitive judgment call per grep hit, which is not the "runnable verification" the plan template mandates. **Gap:** The Done-when for WS1-8 needs a tighter grep that distinguishes the discovery-loop files (where probe-aliases are expected) from the example-string files (where no probe-alias should appear).

### C-6: WS3-4 scope is "document the status.json envelope" — not a code change — but its Done-when is untestable as stated

WS3-4: "Done when: the workflow step text + summary-prompt reads reference all eight new fields and both new step kinds; the OBSERVE_MODE enum text reads `off | instrument | analyse | soak`." This requires a human to manually count field mentions across multiple files, with no grep anchor. The task is a documentation-of-a-schema task with no Vitest coverage (correctly, since it is markdown), but it lacks a minimum grep verification such as `rg 'liveStack|liveVerdict|reproKind|soakDowngradeReason|soakIterations|failureSignatureMoved|liveReason|repro' .agents/workflows/bkit-debug.md .agents/workflows/bkit-build.md | wc -l` (or similar) to confirm the fields are actually present. **Gap:** Done-when criterion is not runnable; needs a grep-based minimum bar.

### C-7: WS5-1 task scope states "narrow `test`->`test:unit`" but the Supersession Inventory does not carry a row for the `test` umbrella narrowing in `bkit-build.md`

The Supersession Inventory tracks the `package.json` script renames and `workflows.md` catalog rows. The narrowing of the build-step `test` umbrella to `test:unit` in `bkit-build.md` Step 13 is a material deletion of the `test` invocation and replacement with `test:unit`. While this is a workflow text change (not a code artifact), the template's Supersession Inventory note says "each row is mirrored in Architecture & Component Changes" — and the Architecture section for WS-5 mentions narrowing `test`->`test:unit` — but the Supersession table has no row for it. Strictly the table should note the deletion of the `test` invocation in build Step 13 as a `DELETE (narrow)` or carry a comment that this is covered by the WS-5 Architecture entry. The gap is minor but the template's default-DELETE rule applies to deleted text that changes build behaviour.

## OPTIONAL

### O-1: WS7-1 task references "Step 8 OBSERVE_MODE decision" in Done-when but the plan body consistently calls it "Step 1 OBSERVE_MODE decision" (lines 142-145)

WS7-1 Done-when reads: "Step 8 OBSERVE_MODE decision lists the soak entry…" — but the plan body, design, and Architecture section all call this "Step 1 OBSERVE_MODE decision (line 142-145)." This is a likely off-by-one or copy-paste error in the task text. An implementer reading only the runbook task would look for a non-existent "Step 8" and potentially modify the wrong location. Should read "Step 1 OBSERVE_MODE decision."

### O-2: The `debug-reproduce` build scope in WS6-1 states guard is `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live` but does not enumerate what "Step 4 area" means precisely enough for an atomic change

"Step 4 area" is not a named heading in `bkit-debug.md`. The Architecture section gives more detail ("before the diagnose subagent is invoked") but the Runbook task only says "Step 4 area." An implementer may insert the mini-step at the wrong position relative to the Gate 4 assertion. Consider specifying the insertion position as "immediately before the `@bkit-debug-failure-diagnose` invocation within Step 4" and noting the line number.

### O-3: WS2-1 Done-when requires "6-row tier table" but the design's taxonomy shows the table has 6 data rows AND bkit-repo has a note about absent `:live`/smoke scripts OUTSIDE the markers — the task does not provide a content-assertion verification for the "outside markers" requirement

The Done-when for WS2-1 states the bkit-absent note must be "outside the markers" but provides no grep/command to verify this. A simple grep like `rg -A2 'absent by design' .agents/templates/docs/testing.md` that returns content NOT preceded by `bkit:start` would suffice. Without it an implementer could accidentally embed the bkit-repo-specific note inside the managed block (violating the bkit-repo-vs-consumer scoping rule).

### O-4: WS3-1 task specifies documenting the turbo `--dry-run` fallback decision in "the workflow step text" but does not name WHICH workflow step

WS3-1 Done-when: "the chosen path AND the resolved turbo version + observed `--dry-run` exit semantics are recorded in the workflow step text." It does not say whether this is in `bkit-debug.md` Step 2 comment, `bkit-build.md` Worktree Setup comment, or both. Given the resolver is added to both workflows (WS3-2 and WS3-3), the documentation should land in both; the task should say so explicitly.

### O-5: The plan's out-of-scope section covers `test:smoke`/`:live` script BODIES but does not address whether the plan adds `test:unit`/`test:integration`/`test:e2e` script bodies to `bkit/package.json`

The scope boundary enforced by the session prompt is "bkit ships SCAFFOLD/CONVENTION ONLY." The plan's own `package.json` today only has `test` (bkit's suite runner). The plan adds `check:bkit`, `check:dist`, `lint`, `check` umbrella aggregates, and explicitly keeps `test` as the bkit suite runner (not folded into live tiers). WS1-1 adds the aggregates but does not address whether `test:unit`, `test:integration`, `test:e2e` stubs are added to bkit's own `package.json`. The Out-of-Scope section says "writing live test BODIES" is out of scope, but the mocked tier stubs would also be "adding new scripts." The plan is silent; this could cause an implementer to silently add stubs. A clarifying out-of-scope line for mocked tier stubs would close the ambiguity.

### O-6: Gate WS-1 grep pattern does NOT exclude `.agents/workflows.md` catalog rows that are owned by WS-8, which means running the gate grep after WS-1 (but before WS-8) will show false-positive hits

Gate WS-1: `rg '\b(typecheck|format:check)\b' ...` without excluding the `.agents/workflows.md` catalog rows (lines 621/646/972/975) owned by WS-8. This means if the implementer runs the Gate WS-1 verification in sequence (as instructed by the sequencing rule), the gate will fail even when WS-1 is correctly complete, because WS-8 hasn't run yet. The gate grep should either add a sequencing note ("this gate passes only after WS-8") or add exclusion flags for the known WS-8-owned lines. The current text says "reviewed; EVERY remaining hit is EITHER a back-compat probe alias...OR a converted reference-doc mention" which implies manual review of the grep output, but an automated gate that fails on valid WS-8-deferred hits will create confusion.

### O-7: `docs/decisions.md` DE entries (Task 0a, 0b) are "append" tasks but no Done-when grep verifies the entry number or content pattern

Task 0a Done-when: "a new DE-* row exists in `docs/decisions.md`." Task 0b similarly. Neither provides a grep anchor such as `rg 'B1.*back-compat|back-compat.\*probe' docs/decisions.md`. Without it the Done-when is satisfied by any DE row, including a truncated or incorrect one. Low-risk but worth a content-pattern grep.

## OUT OF SCOPE

### S-1: Plan-level suggestion — a `lint:no-tier-terms`-style CI guard for discovery loops

The plan's own Out-of-Scope section notes: "A `lint:no-tier-terms`-style CI guard that fails when a discovery loop lists a bare legacy script name without its renamed pair would have caught CRITICAL-1 (C-5 above); worth a separate tooling issue." This is correctly deferred and already documented in the plan's Out-of-Scope section. No action needed in this plan.

### S-2: gether consumer live test body population

The scope boundary explicitly excludes writing live test bodies for the `gether` consumer repo. This is mentioned in the plan's Out-of-Scope section. No action needed in this plan.

### S-3: Future major dropping the legacy `typecheck`/`format:check` probe aliases

Deferred to `docs/pending.md` per the plan's Out-of-Scope section. Correctly handled.

### S-4: Per-paid-endpoint soak iteration cap tighter than `MAX_DEBUG_ATTEMPT`

Deferred to `docs/pending.md` per the plan's Out-of-Scope section. Correctly handled.
