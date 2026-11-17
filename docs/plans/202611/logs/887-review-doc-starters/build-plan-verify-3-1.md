Verdict: CONCERNS
Failures: 4
Fixable: true
Tasks: 9
Loosened: none
Fingerprint: 695813b059faa6bd380e9a72ea48496b5ede1c02cde9987e0634a4bca50ddc1e
<!-- verdict:end -->

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode is Group. Tasks 6-9 were judged against `build-diff-3-1.md`, the changes in commits `44c36e606` and `40b2b5432`. The brief has no `Deviations` section, `build-plan-current.md` lists no affected tasks, and no decision record exists for this group.
- These six test files passed, 802 tests in all: `.bkit/core/engine/install/project-docs.test.ts`, `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/checks/after/tools.test.ts` and `.bkit/core/engine/audits/templates/templates-content.test.ts`.
- These static DONE WHEN checks hold:
  - No starter in `.bkit/templates/docs/` has `## Project facts to record`.
  - "promote after the capstone" appears in neither `project-docs.ts` nor `tools.ts`.
  - `UNAUDITED_DOC_SECTIONS` holds no `Project facts to record` key.
  - `testing.md` has one `## Test first`, after `## What each tier must do`, marked bkit practice.
  - The `## Tiers this project has` rows spell the seven tier names exactly as § Which tier does a behaviour need? does.
  - `dist/install/project-docs.js` and `dist/checks/after/tools.js` are committed in `40b2b5432` and match the source edits.
- The test-first audit (`build-tests-green-3-1.md`) reads `Enforced: true`, `Gaps: 0` and `Unproven: 0`, with all ten `TEST FIRST` tests red and then green. It has no `Updated tests`, `Already landed` or `delete-still-referenced` section.
- Every Derived Test Matrix row for Tasks 6-9 is named in its task's DONE WHEN. No Documentation Updates row belongs to Group 3. `docs/observability.md` does not apply, because the group adds no runtime error path.
- `templates-content.test.ts` was changed so its regex also accepts `Generated document.`. That fixes the test Task 9's planned opener change broke; it is not a loosened planned test.
- Task 9 is satisfied.
- Tasks 6, 7 and 8 pass their DONE WHEN tests but are left off `Tasks`. Their bkit-practice rules-box line leaves out the plan's "stay separate sections. Do not rename, merge or compress them" wording (Breaking Changes, Edge Case row 120). Task 8 also leaves stale host lead-ins in the rollback runbooks.
- Out-of-scope finds, not gaps:
  - `.bkit/templates/docs/design.md:43` (Group 2) has the same shortened bkit-practice line.
  - The `--no-verify` line was also removed from the testing rules box. No task asked for that, though `.agents/rules.md` § Pre-push still owns the rule.
  - `.agents/docs.md` project rows still carry the old scopes. Task 14 (Group 4) owns that sync.

## Identified Gaps Log

4 gaps.

- TASK 6: `.bkit/templates/docs/security.md:46` — the rules-box bkit-practice line reads "Keep it and its heading, and put the project's own rules in its `### This project` slot." It omits the plan's line (Breaking Changes, bkit-practice rules-box line): "Sections marked **bkit practice** keep their heading text and stay separate sections. Do not rename, merge or compress them, because bkit's CI template, advisories and audits cite them by name." So Edge Case row 120 (ship-time update agents reorganise or compress an adopted `docs/security.md`) has no "stay separate / do not merge or compress" rule to follow — Fixable: true
- TASK 7: `.bkit/templates/docs/testing.md:53` — the rules-box bkit-practice line says only "Keep it, because ... cite its heading by name". It omits "stay separate sections. Do not rename, merge or compress them" from the plan's line (Breaking Changes, bkit-practice rules-box line), which Edge Case row 120 relies on for an adopted `docs/testing.md` — Fixable: true
- TASK 8: `.bkit/templates/docs/deployments.md:44` — the same bkit-practice line as testing. It omits "stay separate sections. Do not rename, merge or compress them" from the plan's line (Breaking Changes, bkit-practice rules-box line), which Edge Case row 120 relies on for an adopted `docs/deployments.md` — Fixable: true
- TASK 8: `.bkit/templates/docs/deployments.md:95,104,155` — the commands were turned into `[e.g., …]` text, but their lead-ins were left stale. Line 95 still says "The commands use Vercel as the example." although no Vercel command is left. Line 104 ends "For example, on Vercel:" and is followed by a host-neutral `[e.g., …]` placeholder. Line 155 repeats itself ("Name only your own app-managed schemas. Name each schema your migrations create."). The UPDATE line asks for the host-specific steps to become `[e.g., …]` text. That leaves these lead-ins misleading — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 6: bkit-practice rules-box line omits the stay-separate / do-not-merge rule
  **Severity:** MEDIUM · **Class:** missing-edge-case · **Fixable:** true · **Location:** `.bkit/templates/docs/security.md:46` · **Round:** 1
  - **DONE WHEN:** The security rules-box bkit-practice line carries the plan wording: Sections marked **bkit practice** keep their heading text and stay separate sections. Do not rename, merge or compress them, because bkit's CI template, advisories and audits cite them by name.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 7: bkit-practice rules-box line omits the stay-separate / do-not-merge rule
  **Severity:** MEDIUM · **Class:** missing-edge-case · **Fixable:** true · **Location:** `.bkit/templates/docs/testing.md:53` · **Round:** 1
  - **DONE WHEN:** The testing rules-box bkit-practice line carries the plan wording: Sections marked **bkit practice** keep their heading text and stay separate sections. Do not rename, merge or compress them, because bkit's CI template, advisories and audits cite them by name.
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** TASK 8: bkit-practice rules-box line omits the stay-separate / do-not-merge rule
  **Severity:** MEDIUM · **Class:** missing-edge-case · **Fixable:** true · **Location:** `.bkit/templates/docs/deployments.md:44` · **Round:** 1
  - **DONE WHEN:** The deployments rules-box bkit-practice line carries the plan wording: Sections marked **bkit practice** keep their heading text and stay separate sections. Do not rename, merge or compress them, because bkit's CI template, advisories and audits cite them by name.
  - **TEST FIRST:**
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** TASK 8: stale host lead-ins around the [e.g., ...] runbook steps
  **Severity:** LOW · **Class:** incomplete-update · **Fixable:** true · **Location:** `.bkit/templates/docs/deployments.md:104` · **Round:** 1
  - **DONE WHEN:** In .bkit/templates/docs/deployments.md, line 95 no longer claims the commands use Vercel, step 1 no longer ends "For example, on Vercel:" before a host-neutral placeholder, and step 2 of the dev runbook has no repeated schema sentence; project-docs.test.ts still passes
  - **TEST FIRST:**
<!-- bkit:task 4 end -->
