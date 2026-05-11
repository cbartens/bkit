Verdict: PASS

<!-- verdict:end -->

# Ship Update Docs — BAR-167

## Scope

Ship-phase doc-extraction subagent for BAR-167 (bkit v2.0.0 — drop `__bkit__` envelope; template ownership via markers + JSON containment). Squash-merge `da8dcfc` on `origin/dev` 2026-05-11T10:11:09Z via PR #20. Sole writer per protocol: `docs/completed.md`.

## Inputs Read

- `docs/plans/active/bar-167-drop-envelope-hybrid-plan.md` (split index; sub-plans 1/2/3 already drafted).
- `docs/plans/logs/bar-167-drop-envelope-hybrid/build-summary.md` (Verdict: SHIP — 6 MAJOR challenge findings remediated, 787 tests pass).
- `docs/plans/logs/bar-167-drop-envelope-hybrid/build-challenge-reconcile.md` (6 MAJOR + 11 MINOR findings catalogue).
- `docs/plans/logs/bar-167-drop-envelope-hybrid/ship-conflict-resolve.md` (4 rebase rounds across 50/50 commits — all mechanical: `package.json` 2.0.0 vs 1.1.2 one-sided, `bkit-modules.ts` `getPkgRoot` re-export, CHANGELOG additive, `dist/bkit-modules.js` compiled, 11 mirror files via `git checkout --theirs`).
- `docs/plans/logs/bar-167-drop-envelope-hybrid/ship-input.md`.
- `.agents/friction.md` (no open BAR-167 friction entries — friction file lives at `.agents/friction.md`, NOT `docs/friction.md` per repo layout).
- `docs/completed.md`, `docs/knowledge.md`, `docs/decisions.md`, `docs/pending.md` (all referencing BAR-167).
- `git log --oneline --stat origin/dev..HEAD` (clean — no unmerged work).

## Actions

### 1. `docs/completed.md` — No change required

The BAR-167 entry was **already present** at lines 78–83 (written during an earlier docs pass). Entry summarises:
- Phase 1 envelope drop + `deepContains` / `writeTier2JsonContained` / `migrateLegacyBkitEnvelope`.
- Phase 2 markers on 12 Group A + 3 Group B templates + manifest `tier` → `format` schema.
- Phase 3 terminology sweep + `tier3Hashes` writer narrow + `lint:no-tier-terms`.
- Cross-references DE-16, DE-17, DE-18, KN-15, KN-16, KN-17. New scripts (`bkit-paths.ts`, `bkit-templates.test.ts`, `lint-no-tier-terms.ts`) and deleted (`bkit-tier1-defaults.ts`) catalogued.

**Note:** The existing entry pre-dates the build-challenge cycle remediation (6 MAJOR fixes) and the rebase-merge ship cycle. It does NOT mention:
- CI fix `workflow_dispatch:` addition to `ci.yml` template (per ship-input.md).
- KN-18 (manifest format must match install dispatch) and KN-19 (malformed-JSON throw) which were added post-entry.
- The duplicate KN-16 ID collision (see Pending Items Surfaced below).

Optional follow-up amendment listed under Pending Items Surfaced — append-only policy means this would be a NEW entry, not an edit, so left for orchestrator/synthesizer judgement.

### 2. `.agents/friction.md` — No BAR-167 entries found

The `docs/friction.md` path referenced in the task brief does NOT exist in this repo — friction log lives at `.agents/friction.md` per the bkit-managed structure. Greppped `.agents/friction.md` for BAR-167 / bar-167: no matches. No Recovery/Status updates needed.

The closest friction is the BAR-155 entry `bkit-ship Step 2 bare git rebase fails on branches with merge commits` (Status `OPEN`) which BAR-169 ships fixed for; that is BAR-155's friction record, not BAR-167's.

### 3. `docs/plans/logs/bar-167-drop-envelope-hybrid/ship-update-docs.md` — Created (this file)

## Pending Items Surfaced (for human review — sole-writer policy)

These touch docs OTHER agents own per sole-writer rule. Surfacing for the orchestrator / synthesizer:

### A. `docs/knowledge.md` — KN-16 ID collision

`docs/knowledge.md` contains TWO entries numbered `KN-16`:
- Line 215: `KN-16: Multi-section output format — EOF-append landing section must be last (2026-05-09)` — from BAR-155.
- Line 240: `KN-16: bkit-modules.ts format dispatch alignment — writeTier2 for markered-text, not writeTier1 (BAR-167 Phase 2) (2026-05-11)` — from BAR-167.

Per `docs/knowledge.md` § Rules `ID: KN-{N} — next = max(grep 'KN-\d+') + 1`, the BAR-167 entry should have been `KN-18` (since the prior max was `KN-17` at that time). The renumbering to `KN-18` would then bump the actual `KN-18` (manifest format) to `KN-19`, and `KN-19` (malformed-JSON throw) to `KN-20`. The completed.md entry refers to KN-17 only; downstream references to "KN-18 / KN-19" use the current (collision-tainted) IDs.

Recommended remediation by knowledge.md sole-writer: renumber the second `KN-16` to `KN-18`, the existing `KN-18` to `KN-19`, the existing `KN-19` to `KN-20`. Update `Related:` blocks accordingly.

### B. `docs/pending.md` — open BAR-167 deferrals

Grep `docs/pending.md` for BAR-167 surfaced four open deferrals (lines 143–181), all `Status: deferred`:

1. **Cursor v1 keyed-object schema deeper validation** (BAR-167, DE-7, DE-16) — only triggers if Task 0a spike ever fails; currently dormant since Phase 1 passed cleanly.
2. **bkit upgrade --prune flag** (BAR-167, DE-18) — feature follow-up; needs prior-template-version tracking not yet implemented.
3. **Drop decorative `.cursor/hooks.json` echo commands** (BAR-167, DE-18) — Plan-Phase Decision 3 kept echoes; revisit only on consumer feedback.
4. **BAR-167 Phase 2 indented YAML marker drift detection not implemented** (BAR-167) — `ci.yml` 6-space-indented markers fall outside `ALLOWED_PREFIXES`; `detectTier2TextDrift` returns `null`. Tests at `bkit-modules.integration.test.ts:1216` and `bkit-modules.upgrade.integration.test.ts:331` document the boundary.

All four are pre-existing (filed during build) and no action required at ship time — they are correctly classified as deferred. Surfaced here per protocol Step 7.

### C. `docs/completed.md` — optional amendment

The existing BAR-167 entry (lines 78–83) does not list:
- Squash SHA `da8dcfc` (currently lists "PR #18 + sub-plan PRs" — the actual merged PR is #20).
- CI workflow_dispatch fix (added to bkit-self `ci.yml` and consumer template).
- 6 MAJOR build-challenge remediation findings.
- 11 MINOR deferred findings (MINOR-1..MINOR-11 from build-challenge-reconcile.md).
- Rebase cycle observation (50/50 commits, 4 rounds of mechanical conflicts).
- KN-18 / KN-19 (or whatever ID resolution lands) and the duplicate KN-16 issue.

Per append-only rule this would NOT be an edit of the existing entry; orchestrator could file a follow-up amendment entry or the existing entry can stand as-is (the core scope facts are correct — these are deltas from the post-build phases).

### D. `docs/decisions.md` — DE-18 already present

`DE-18: BAR-167 — Drop \`__bkit__\` envelope; adopt deep-containment ownership model (2026-05-11)` is recorded (line 199). DE-17 (line 186) is currently labelled BAR-169 (rebase-conflict tiered auto-recovery), not the Cursor v1 schema ADR the completed.md entry references. Cross-check: the completed.md entry says "DE-17 (Cursor v1 schema ADR)" but the actual DE-17 in decisions.md is BAR-169's rebase-recovery ADR. The Cursor v1 schema decision lives in DE-7 (now marked superseded by DE-18). Possible mis-link in completed.md narrative — surfaced for confirmation.

## Notes

- Append-only policy preserved: no edits to `docs/completed.md` (entry pre-existed; protocol Step 6 says "If cycle delivered shipped scope → APPEND" — the entry has already been appended).
- Stale-doc scan: no doc references stale file paths post-merge. `bkit-tier1-defaults.ts` deletion is reflected in `docs/architecture.md`, `docs/knowledge.md` KN-17, `CHANGELOG.md`. New scripts `bkit-paths.ts`, `bkit-templates.test.ts`, `lint-no-tier-terms.ts` registered in completed.md.
- Parallel-worker boundary: this agent ran in parallel with ship-summary subagent per session prompt. Did NOT reference other worker outputs to avoid circular reasoning.

## Blockers

None.
