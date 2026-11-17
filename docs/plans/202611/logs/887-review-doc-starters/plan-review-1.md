Verdict: CONCERNS
Failures: 1
Redesign: false
Fingerprint: a6cedc35fa1ed1a805cf98b3a67b2871c87f03d4d36aa8413afd1a9e9e1221b2
<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

Scope: `plan-v1-draft.md` (13 tasks, 4 groups) checked against `plan-input-2.md` (the issue body plus the owner's answers), `docs/architecture.md`, `docs/testing.md`, the active knowledge rows in `related-knowledge.md`, the `887-*` rows in `docs/decisions.jsonl` / `docs/deferrals.jsonl`, and the code the tasks touch. No design artifact exists (`docs/plans/*/887-*-design.md` matches no file), so the design-coverage checks (steps 5 and 11) do not apply. The issue body is the source.

Dependency graph: no cycles. No task uses an artefact that only a later task produces. No group leaves a test failing for a later group to fix. Group 1 (Tasks 1-2) writes doctrine only. Group 2 (Tasks 3-5) depends on the shape rules from Task 1. Task 8 depends on 3 and 7. Task 13 depends on 1-12. The `.bkit/*.md` root mirrors stay stale until Task 13 refreshes them, which is safe: `gateguard-dogfood.integration.test.ts` and `catalogue.test.ts` read the core sources (`.bkit/core/.bkit/authoring.md`, `getCoreRoot()`), not the mirrors.

## CRITICAL

1. **(plan edit)** Task 1 widens a rule that covers every bkit doc, but no task brings bkit's own docs into line with it. `plan-v1-draft.md:529` changes the § Docs "Rules header" rule in `.bkit/core/.bkit/authoring.md` so the box must carry **Not here** and **Update when** (also `plan-v1-draft.md:391`, `:533`). § Docs (`authoring.md:226`) applies to `.agents/**`, `.bkit/*.md` and `docs/*.md`. Today none of those files has a Not here or Update when line; for example, the Purpose-only boxes at line 4 of `docs/deployments.md`, `docs/data-schema.md`, `docs/testing.md` and `docs/security.md`. Once Task 1 lands, every existing doc breaks a rule in its own authoring file. That contradicts Success Criterion 2 ("bkit's own docs/ copies follow the new rules"), and the issue's Task 1 does not ask for the rule to cover all docs. This is expansion with no source and no task to finish it. Other new shared rules have the same problem: `docs/technology.md` types the Vitest version (`5.x`) against "name the file that holds a value". Fix, either: (a) limit the Not here / Update when requirement, and the other new starter rules, to the project-doc starters in `.bkit/templates/docs/*.md` and the adopted project docs; or (b) add tasks that bring every `.agents/**`, `.bkit/*.md` and `docs/*.md` file into line, with tests. (a) matches the issue's scope.

## OPTIONAL

- Task 1 also edits § Which Sections Apply so its `docs/*.md` row names `.bkit/templates/docs/*.md`. That edit is redundant, because the table already says "A path matches at any depth" (`authoring.md:14`), so `.bkit/templates/docs/*.md` already matches `docs/*.md`. Dropping it saves a row change in a table that `gateguard-dogfood.integration.test.ts` parses.
- Task 1 DONE WHEN should name `.bkit/core/engine/hooks/gateguard-dogfood.integration.test.ts`. That test parses the § Docs `- **Lead:**` rules and the § Which Sections Apply rows at hook time. Any new § Docs rule must keep the Lead / Why / Example shape, or the parse fails.
- Task 2 DONE WHEN should name `.bkit/core/engine/tools/instructions.test.ts`. `.bkit/core/.bkit/templates.md` is a doc surface for the near-copy clause check, and the adoption-order edit can trip it.
- The DONE WHEN of Tasks 4-8 should name `shipped-docs-refs.test.ts`. Plan line 409 states the no-`#NN` rule for the starters, but only some DONE WHEN lines say which test enforces it.
- Task 3: `dogfood-templates.test.ts` anchors the components region on `["## Repository purpose", null]` (lines 484-601). Put the new `## Constraints` and `## Open questions` sections after `## Repository purpose`, or update that region in the same task. Otherwise the dogfood span covers the wrong text.
- Task 3: for the components "If it does not apply" line, the issue body (which wins) and review § 3.12 disagree. The plan follows the issue body, which is correct; adding one line in the plan saying so would stop the build agent re-opening the question.
- Task 7: `UNAUDITED_DOC_SECTIONS` in `.bkit/core/engine/audits/templates/templates.test.ts` is checked with exact equality. Tasks 4-8 remove `## Project facts to record` from six starters, so each task must remove its key from that list in the same task. If they wait for a later task, the group gate fails. The plan implies this, but no DONE WHEN says it outright.
- Task 13 should list `.bkit/version` under UPDATE. The mirror refresh re-pins it (knowledge row `dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit`).
- Task 12: `formatTemplateChanges(changes, cwd?)` gains an optional argument. Making it required, with `upgrade.ts` passing `process.cwd()`, gets rid of the untested no-cwd path. This fits "End-state over diff-size".

## OUT OF SCOPE

- The GateGuard "docs/*.md authoring" advisory (`.bkit/core/hooks/gateguard-engine.js:90-128`) does not fire for `.bkit/templates/docs/*.md` edits. That gap sits in the hook, and this plan does not touch hooks.

## SUGGESTED SCOPE EXPANSION

Deferral keys below are shortened. Each full key starts `864-move-project-docs-challenge-low-bkit-core-engine-` followed by the file part (for example `install-project-docs-ts-303`), except `864-move-project-docs-challenge-low-bkit-instructions-md-3393` (`docs/deferrals.jsonl:239-250`).

- `864-install-project-docs-ts-303` (open deferral): when two indexed rows share a basename, the first one wins. Overlaps Task 12's `findIndexedEquivalent` change. Recommend: consider it alongside Task 12.
- `864-install-project-docs-ts-230` (open deferral): `ROW_RE` misses index rows that have no backticks. Same surface as Task 12. Recommend: consider it.
- `864-checks-after-tools-ts-440` / `-441` (open deferrals): `readStarterText` follows symlinks when it reads a starter. Touches the starter reads that Tasks 3-9 change. Recommend: leave deferred unless the human adds them.
- `864-checks-after-tools-ts-506` / `-507` (open deferrals): the ambiguous advisory shows a raw path. Overlaps Task 11's advisory text. Recommend: consider it alongside Task 11.
- `864-checks-after-tools-test-ts-621` (open deferral): an out-of-tree fixture that cannot fail. Same test file as Task 12. Recommend: consider it.
- `864-bkit-instructions-md-3393` (open deferral): the `doc-indexed-equivalent` clause never defines "valid". Overlaps Task 12's affirmative regex. Recommend: consider it alongside Task 12.
- `864-uninstall-ts-406`, `864-summary-ts-611`, `864-summary-ts-620` (open deferrals): next to the project-docs surfaces, but not touched by this plan. Recommend: leave deferred.
- #863 (open, in review, listed in `related-issues.md`): its work is on the project-docs surfaces. Recommend: check whether it has landed before the build starts, to avoid merge conflicts.
- `related-failures.md`: no overlap.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** (plan edit) Task 1 widens the § Docs Rules header rule (Not here / Update when) to every .agents/**, .bkit/*.md and docs/*.md file with no task bringing bkit's own docs into line
  **Severity:** CRITICAL · **Class:** expansion · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:529` · **Round:** 1
  - **DONE WHEN:** Task 1 limits the Not here / Update when requirement (and the other new starter rules) to .bkit/templates/docs/*.md and adopted project docs, or the runbook gains tested tasks that bring every .agents/**, .bkit/*.md and docs/*.md file into line, so Success Criterion 2 holds when Task 1 lands
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
