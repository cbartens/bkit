Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Plan Review

Reviewer 1 — tightness-and-scope-discipline pass on `plan-v1-draft.md` (re-run, Phase 1+2+3 bundled v2.0.0 ship).

## CRITICAL

### C1 — Phase 3 supersession of `tier3Hashes` contradicts Phase 2 dispatch for `byte-equal-text`

`Supersession Inventory` row for `tier3Hashes` (line 258) justifies the writer-drop with: *"`stripTier2JsonScope` + marker extraction make `tier3Hashes` redundant for safe-delete decisions."* But Phase 2 (lines 627–628, 636) explicitly retains `format: "byte-equal-text"` files (`.cursor/Dockerfile`) using *"hash-or-byte-equal delete (preserve if consumer modified)"* — that hash check is exactly what `tier3Hashes` powers in `bkit-uninstall.ts:196` (`shouldDeleteTier3`).

So `tier3Hashes` is NOT redundant — it's still needed for the `byte-equal-text` safe-delete branch. The plan's *writer drops; reader keeps for one minor* (Task 25) is technically OK because new installs simply won't have hashes for `byte-equal-text` files — meaning `shouldDeleteTier3` falls back to "preserve" — but the **justification** in the supersession inventory is wrong, and Task 25 needs to spell out the trade-off:

> v2.0.0 fresh installs lose the ability to safe-delete `byte-equal-text` files (`.cursor/Dockerfile`) on uninstall — they're now always preserved unless `--force`. Pre-v2.0.0 consumers retain hash-based decisions until first re-install.

Without this disclosure, the dropped-writer behaviour silently weakens uninstall safety in one corner of the manifest. Either (a) rename `tier3Hashes` → `byteEqualHashes` and keep emitting them for `byte-equal-text` files, or (b) document the regression as an accepted trade-off and update Task 25's verification step. The status quo "writer drops entirely" + supersession inventory's "redundant" claim are inconsistent.

### C2 — Phase 2 manifest reclassification ambiguity for `.claude/hooks/preflight.sh`, `.cursor/hooks/preflight.sh`, `.cursor/rules/00-shared-rules.mdc`

Current manifest (`bkit-manifest.ts:50–60`) tags these as `tier: 1`. Plan's tier-to-format mapping (lines 614–620) puts old `tier: 1` text files at `format: "markered-text"`, requiring Phase 2 markers. But:

- `.claude/hooks/preflight.sh` and `.cursor/hooks/preflight.sh` are NOT in Group A (line 87 of plan-input.md only lists `.cursor/rules/00-shared-rules.mdc`).
- Plan-input.md §3 Decision 1 does NOT list the two `preflight.sh` files for marker addition.
- Task 17 (Group A) does NOT list them.

Either the plan must add them to Group A explicitly (markers on shell scripts using `# bkit:start` / `# bkit:end`), OR reclassify them as `format: "byte-equal-text"` (whole-file replacement, no markers needed). The current tier-to-format mapping table promises markers exist on these files, but Task 17 never adds them — `bkit check` will then fail on `format: "markered-text"` files that have no markers.

Resolve: add the two `preflight.sh` files to Task 17 OR change the tier-to-format mapping for them to `byte-equal-text`. Recommend the latter — they're small bkit-canonical scripts, fully overwritten today.

### C3 — Group A coverage missing `.gitignore`, `.prettierignore`, `.husky/pre-commit`

Plan-input.md §3 Decision 1 lists Group A as: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/*.yml` (4 files), `.agents/{rules,docs,friction,skills}.md` (4 files), `docs/plans/template.md`. The plan-v1-draft Task 17 matches this list exactly — *but* the tier-to-format mapping (line 616) reclassifies old `tier: 2` files (`.gitignore`, `.prettierignore`, `.husky/pre-push`, `.husky/pre-commit`) as `format: "markered-text"`. `.husky/pre-push` is verified-existing-markers (Task 18a). The other three (`.gitignore`, `.prettierignore`, `.husky/pre-commit`) need either: (a) confirmation that markers already exist on them today, or (b) explicit Phase 2 marker-addition tasks.

Spot-check: I have not read those three files in this review. If the plan's "tier 2 = managed-block" classification meant *markers already exist*, then it's fine. But the plan should state this explicitly — *"verified existing markers on `.gitignore`, `.prettierignore`, `.husky/pre-commit`; no Phase 2 task needed"* — to avoid drift between the dispatch refactor (Task 19/20) and template state. Right now the manifest will dispatch them as `markered-text` while the templates may or may not have markers.

Resolve: append a Task 17a (or extend Task 18a) — *"Verify markers on `.gitignore`, `.prettierignore`, `.husky/pre-commit`; add if absent"* with explicit grep verification.

### C4 — `slop-scan.config.json` "required core rules" enumeration deferred to build agent

Line 600 says: *"The build agent records the precise list of rule keys in DE-16 at task execution time."* Task 18b says: *"Confirm template's required rules list; record exact rule keys in DE-16."* This delegates a scope decision (which rules are bkit-mandated vs consumer-overridable) to build-time discovery. Per plan-input.md §3 Decision 1, `slop-scan.config.json` *requires* "bkit's required core rules" — those rules MUST be enumerated in the plan, not at build time, otherwise the test in Task 22 (*"`slop-scan.config.json` deep-tree contains the enumerated bkit core rules"*) has no fixture to assert against.

Resolve: pre-read `.agents/templates/slop-scan.config.json` and inline the rule-key list in this plan (or a sub-section under Phase 2 Templates). If the build agent must enumerate at execution time, the plan must specify the **invariant** (e.g. *"every key under `rules` in the v1.1.1 template is bkit-mandated"*).

### C5 — Splittability boundary leaks Task 0c into Phase 1 sub-plan but Task 4b into Phase 1 too — Phase 2 dispatch refactor depends on `stripTier2JsonScope` from Task 4b

The Splittability note (line 753) lists Task 4b in Phase 1, which is correct (it adds `stripTier2JsonScope` for the Phase 1 JSON branch). But Phase 2 Task 20 (single-dispatch on `entry.format`) uses `stripTier2JsonScope` for the `format: "json"` branch in `bkit-uninstall.ts`. If sub-plans split, sub-plan B (Phase 2) must declare a hard prereq on sub-plan A (Phase 1) Task 4b, OR Task 4b must be lifted into the shared "Phase 1 prereqs for Phase 2" section. The current plan's split-boundary text doesn't make this explicit.

Resolve: in the Splittability note, add: *"Sub-plan B HARD-DEPENDS on sub-plan A Tasks 4b (stripTier2JsonScope) and 19-prereqs (manifest schema)."*

### C6 — Acceptance Scenario "Edge Cases" table (line 111) for `tier3Hashes` is wrong

Edge case row at line 111: *"Phase 3: consumer's `.bkit-version` retains `tier3Hashes` field after schema cleanup → Preserved as a deprecated-but-tolerated field for one minor version. parseBkitVersion reads it as `{}` if absent; writers stop emitting it post-v2.0.0."*

But `tier3Hashes` is read by `bkit-uninstall.ts:124, 196, 316` and powers `shouldDeleteTier3`. If the schema reader retains parsing but the writer stops emitting, then **fresh v2.0.0 installs** will have empty `tier3Hashes` for new files — the safe-delete decision for `byte-equal-text` files (`.cursor/Dockerfile`) becomes "always preserve" on uninstall (since `tier3Hashes[entry.path] === undefined` triggers the preserve branch at line 197). That's a behavioural regression in uninstall safety, not just a backward-compat thing. The edge-case row needs to call this out, or Task 25 needs to retain the writer for `byte-equal-text` files (renaming the field for clarity, e.g. `byteEqualHashes`).

This is the same root issue as C1 surfaced from a different angle. Resolving C1 resolves C6.

## OPTIONAL

### O1 — Phase 1 net-deletion target (≥ 200 LOC) is no longer plan-scope-stable now that Phase 2 is bundled

Task 7 verification (line 781) says: *"Run `git diff --stat dev..HEAD -- '.agents/scripts/' '.agents/templates/'` to confirm Phase 1 net deletion ≥ 200 LOC."* But by the time the build agent reaches Gate 2, all three phases have run, and Phase 2 marker boilerplate inflates `.agents/templates/`. The diff-stat command will conflate Phase 1 deletions and Phase 2 additions.

Recommendation: Task 7 should run `git diff --stat dev..HEAD -- '.agents/scripts/'` ONLY (Phase 1 deletions are scripts-side, not template-side). Or capture Phase 1 net at a Phase-1-completion checkpoint before starting Phase 2.

### O2 — Task 14a "version bump prereq" ordering is correct but fragile

Task 14a is in the "Documentation" sub-section (line 805) but is hard-blocking on Task 5 (line 777). The plan correctly flags this, but a stronger guard would be to move Task 14a to "Phase 1 — Pre-implementation" alongside Task 0c. As-is, a build agent reading top-to-bottom hits Task 5 before Task 14a and may run install with the wrong version.

Recommendation: lift Task 14a above Task 5 (Phase 1 — Pre-implementation, after Task 0c, before Task 1).

### O3 — `tier2-text-drift` advisory key naming inconsistency

Line 641 says: *"rename to `markered-block-drift` or similar in Phase 3 doc-block; advisory key string retained for backward-compat."* But Tasks 21, 23 emit the advisory under the legacy `tier2-text-drift` key. The "Phase 3 doc-block rename" is unimplemented as a code task — the doc-block rename without a code rename is just inconsistent terminology (the whole point of Phase 3 cleanup). Either commit to renaming the advisory key in Phase 3 (with one-version backward-compat parsing), or drop the doc-block rename and admit `tier2-text-drift` is the canonical name.

Recommendation: pick one. Either rename to `markered-block-drift` cleanly in Phase 3 with a Task 26a *"rename advisory key"* + test update, OR document `tier2-text-drift` as the permanent name despite the Tier-collapse. Current state is half-renamed.

### O4 — Cursor v1 schema migration mechanic — fixture realism

Task 5 rewrites the template, and Task 9's upgrade-chain integration tests use the new fixture. However, the AFTER state for `.cursor/hooks.json` (line 502) drops the decorative top-level `hooks` (per Decision 3 = KEEP). Per the AFTER snippet, the consumer file post-migration has the keyed-object shape with `sessionStart` + `sessionStop` arrays. But Decision 3 said *"KEEP decorative echoes."* Where do the echoes appear in the AFTER fixture? The current AFTER (lines 496–506) doesn't show them. If the echoes are kept, they need to be inside `sessionStart`/`sessionStop` (which they appear to be — `echo '[bkit] session started'` is the command — that's the echo). OK on re-read, this is consistent. No change needed; flagging only because the wording in §6 (line 109) is ambiguous.

### O5 — `bkit-tiers.ts` doc-block rewrite scope

Task 26 (line 841): *"Rewrite header to single-model semantics; delete the Tier 1/2 distinction section."* `grep -n "Tier [12]" .agents/scripts/bkit-tiers.ts` returns zero matches as the verification. But the *file name* `bkit-tiers.ts` itself encodes "Tier" terminology and is not renamed by the plan. If Phase 3 retires Tier terminology, the file should be renamed (e.g. `bkit-json-containment.ts` or `bkit-formats.ts`). Renaming is a heavier change but consistent with the Phase 3 charter.

Recommendation: either rename `bkit-tiers.ts` → `bkit-json.ts` in Phase 3 (with a transitional re-export), or explicitly out-of-scope the filename in the plan's Out-of-Scope section. As-is, the half-cleanup leaves a misleadingly-named module.

### O6 — Atomic-write pattern verification missing from runbook

Task 4 (line 773) specifies *"atomic-write (temp + rename)"* but the verification step is just `pnpm tsc --noEmit` + `pnpm vitest run bkit-modules.test.ts`. There's no test for the atomic-write property (mid-write crash → file fully pre or fully post). Suggest adding a unit test in `bkit-modules.test.ts` that mocks `fs.renameSync` to throw and asserts the original file is untouched.

Not blocking — atomic-write is a correctness invariant, not a feature; standard fs primitives suffice. But a mocked-failure test would be cheap.

### O7 — `lint:no-tier-terms` exclusion list maintenance

Task 28 (line 845) excludes `docs/decisions.md` and `docs/knowledge.md` historical entries. Implementation suggested: `grep -v` filters or a small Node script. The grep approach will need maintenance every time a new historical entry is added under a superseded section. A scoped Node script that walks doc files and skips entries inside `superseded` blocks is more durable.

Recommendation: implement as a Node script (`.agents/scripts/lint-no-tier-terms.ts`) with a documented heuristic — *"skip lines under a heading that contains `superseded` or under DE-/KN- headers tagged with `(superseded ...)`."*

## OUT OF SCOPE

### OOS1 — Renaming `bkit-tiers.ts` to drop "tiers" terminology

Filename rename (e.g. `bkit-json.ts` or `bkit-formats.ts`) is a follow-up. Tracked in O5 as optional. If excluded, document in Out-of-Scope section.

### OOS2 — `.bkitignore` semantics under format-aware containment

Plan-input.md §2.3 mentions `.bkitignore` is retained as the explicit per-file/per-key opt-out. Plan-v1-draft does not detail how `.bkitignore` interacts with the new dispatcher (does ignoring a JSON file skip `deepContains`? Does it skip marker validation?). Fine to defer if no current consumer uses `.bkitignore`, but worth a follow-up issue.

### OOS3 — Telemetry on migration log lines

The migration emits `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)`. There's no aggregation / count of migrations across consumer fleet. Plan-review-2 (test-coverage focus) may pick this up; flagging here as a "post-v2.0.0 nice-to-have" only.

### OOS4 — `bkit upgrade --prune` flag implementation

Already deferred per Plan-Phase Decision 1 and tracked in `docs/pending.md` per Task 16. No action needed.

### OOS5 — Decorative `.cursor/hooks.json` echoes drop

Already deferred per Plan-Phase Decision 3 and tracked in `docs/pending.md` per Task 16. No action needed.

---

**Summary judgement:** Plan correctly bundles Phase 1+2+3, removes Task 0a (Cursor spike), and carries forward all eight plan-v3 critical fixes (deepContains semantics, manifest reclassification, stripTier2JsonScope, atomic-write, schema-flip, static fixture, preflight advisories, Cursor v1 keyed-object). Splittability boundary is clean *if* C5 prereq is documented. Six CRITICAL items are scope-correctness bugs (tier3Hashes regression silently weakens uninstall safety; Group A misses three files; required-rules enumeration deferred to build time). None are FAIL-level — plan does not drift from source or violate template — but they MUST be patched before promoting to plan-v2-reviewed.md.
