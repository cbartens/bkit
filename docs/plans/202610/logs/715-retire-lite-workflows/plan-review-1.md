Verdict: FAIL
Failures: 7

<!-- verdict:end -->

# Plan Review

Lens: Tightness, dependency correctness, design-coverage.

## CRITICAL

1. **Acceptance contract drifts from the issue.** The plan's `## Success Criteria` (`plan-v1-draft.md` 41-45) has five bullets; issue #715 `## Success criteria` (`plan-input-1.md` 546-554) has nine. Missing: `publish=true` behaves exactly as today; a non-LOCAL `publish=false` coerces with a visible warning; `/bkit-ship <ref>` lands a held build end to end; `pnpm bkit:gate:static-unit` and `bkit check` pass. Bullet 4 also changes the issue's "refused with an advisory" to "coerced to `true` with an advisory". The protocol requires the issue's criteria word for word. Fix: copy all nine bullets verbatim; keep any extra detail beneath them, not in place of them.

2. **Task 5's `DONE WHEN` cannot pass.** `core.integration.test.ts` `renderedLite()` (`1141-1143`) reads `path.join(getBkitDocsRoot(), "lite.md")`. Task 5 deletes `.bkit/core/.bkit/lite.md` and runs that whole file in its `DONE WHEN` (`651`); the read throws ENOENT and the migration describe block fails. Task 6, which rewrites that block (`666`), depends on Task 5 (`669`), so the repair lands after the failure. Fix: inline the fixture in Task 5's test rewrite, or reorder Task 6 before Task 5. A task must not leave its broken test to a later task.

3. **Task 11's `DONE WHEN` grep is uncheckable.** `grep -rn "lite" .bkit/core/.agents .bkit/core/prompts .bkit/core/.bkit ...` (`782`) matches the word "literal": `.bkit/core/.agents/rules.md:45` ("string literals"), `.bkit/core/prompts/*.md`, and `.bkit/core/.bkit/workflows.md` ("literal tab", "literal `{PLACEHOLDER}`"). The command can never return nothing without editing unrelated prose, which would also violate scope discipline. Fix: narrow it to `grep -rnE '(:lite|lite\.md|[Ll]ite workflows?)'`, or pipe through `grep -v literal`.

4. **`docs/observability.md` has a Documentation Updates row but no runbook task.** `plan-v1-draft.md:541` requires recording `ending: held` and optional `publish`; Gate 3 (`821`) requires every `Documentation Updates` row done. No task `UPDATE` names the file. Fix: add the edit to Task 8 (telemetry) or Task 11 (docs), with a `DONE WHEN` check.

5. **Three files have duplicate owners, so later `UPDATE` lines have no target.** `.bkit/core/.agents/docs.md` "delete the `.bkit/lite.md` index row" appears in Task 5 (`650`) and Task 11 (`768`); `.bkit/core/.bkit/README.md` tier and install-writes edits appear in Task 5 (`649`), Task 11 (`776`) and Task 12 (`796`); `.bkit/core/.bkit/workflows.md` build Output appears in Task 11 (`777`) and Task 12 (`797`). Task 11's delete of an already-deleted docs row cannot find its old text. Fix: assign each edit once: docs row and README tier tables to Task 5; README held usage and caveat to Task 12; workflows build Output to Task 11.

6. **The held path still fails Gate 15.** `.bkit/core/workflows/bkit-build.md:853-859` lists "Open-PR probe ran" and "Summary commit pushed". The held path skips both, but Task 10 only changes Step 15 and Gate 16 (`398`; edge case `81`). Fix: make Gate 15's checklist conditional in Task 10 and add a `workflow-shape.test.ts` assertion for it.

7. **Task 12 runs `bkit check` before `bkit install`, so the check cannot pass.** `bkit check` exits 1 on any would-write (`commands/install/check.ts:38-60`); `docs/knowledge.jsonl` `rendered-mirror-diff-nonempty-by-construction-tracker-resolution` says the authoritative mirror-drift check is `bkit check` exiting 0 with no `DRIFT DETECTED` and `bkit install` reporting 0 writes. Task 12's `DONE WHEN` (`800`) runs `node dist/cli.js check` after Task 11 and Task 12 edit the rules, prompts and reference docs; the root `.agents/`, `.bkit/`, `.claude/`, `.cursor/` and `.opencode/` copies are stale until `bkit install` runs. The plan's `bkit install` step sits in the Verification Plan (`838`), after the runbook. Fix: add `bkit install` and `pnpm instructions:sync` to Task 11 or Task 12 before the check, or move the `bkit check` requirement to Gate 4 after the install.

## OPTIONAL

1. Task 10's `DEPENDS ON: 7, 8` omits Task 2. Build Step 1 holds `buildPublishRemote` / `buildPublishLocal`, which Task 2 produces. The order is already correct (2 < 10), but the dependency should be recorded for traceability.
2. Task 8's `DEPENDS ON: 7` is spurious. Summary's `--publish` and close's `--ending` / `--publish` are separate verbs in the same file; keep the dependency only if merge order needs it.
3. Task 10 should name the token source explicitly (`{SESSION_DIR}/prompt.md`, following the `grill=false` pattern). "token" alone leaves the read command unspecified.
4. `.agents/rules.md` § Workflow edits says "update `.bkit/workflows.md` in the same change; index drift = regression". Task 10 edits `bkit-build.md`; Task 11 and Task 12 edit `.bkit/core/.bkit/workflows.md` later. Move the index edit into Task 10, or state that Task 11 and Task 12 land before the gate.
5. Task 12 replaces the "small change" row with `/bkit-build #N publish=false`. The issue's criterion 3 says every small-change recommendation points at `/bkit-build #N`. Keep the default row and add the held option separately.
6. Task 12's `grep -n "lite" README.md docs/roadmap.md` is case-sensitive. "Lite workflows" at `README.md:482` would slip through. Add `-i`.
7. Matrix row 144 combines "manual batch caveat" and "held handoff"; Task 12's `TEST FIRST` splits them into two tests. Split the row so each test maps to one row.
8. Matrix rows 145-146 use a command (`pnpm ...`, `node dist/cli.js check`) as the "target file". Move them to the Verification Plan or name a file.
9. The edge case "`bkit.workflows.build.publish` absent, or `build` absent" (`78`) has no Task 4 upgrade test. A fresh install covers the empty `bkit` block; an upgrade from a `bkit` block without `build` does not. Add one seed case.
10. Task 12 runs the full gate before `bkit install` regenerates `.claude/`, `.cursor/`, `.opencode/`, `.agents/` and `.bkit/*` mirrors. Add the install and `instructions:sync` steps to Task 11 or Task 12, or move the gate after them.
11. Task 6's replacement `docs/migrations.md` row omits the uninstall behaviour the old row documents (`uninstall.ts` `CORE_TEMPLATE_DOCTRINE` keeps `.agents/shortcuts.md`). Keep that sentence.
12. Stale comments still name the retired doc: `.bkit/core/engine/install/manifest.ts:140` ("prompts.md and lite.md are markered-text") and `.bkit/core/engine/commands/install/uninstall.ts:381` ("Retired path of `.bkit/lite.md`"). Update both in Task 5 or Task 6.
13. Task 10's Gate 16 text says "run only the `build-close-workflow` gate", but the Gate 16 block (`964-981`) still runs both gates. Make the branch explicit, or rely on matrix row 137 to force it.
14. `docs/migrations.md` "releases (5.1.0 and up)" is loose. The shortcuts path is 5.1.0-5.2.4 and lite is 5.2.4-6.0.0; state both ranges.
15. Task 4's seed needs a merge. `askBlocks()` spreads `build` after the object (`core.ts:455-486`), so adding `publish` "inside the existing `build` block" must merge with the ask blocks. Name the merge so the ask-block promise in test 109 holds.
16. Task 10's resolution order should read "token; else `LOCAL` ? `publish.local` : `publish.remote`". That makes the runtime choose the key and applies the non-LOCAL coercion only to the token.
17. Tasks 1-10 edit engine `.ts` files; `.agents/rules.md` § Engine builds requires `pnpm build && git add dist/` in the same commit. The plan only builds `dist/` in the Verification Plan. Assign the build to the task or group that changes engine code, or state that the runbook's commits are squashed before the gate.
18. Task 10 edits `bkit-build.md` without a `READ` of `.bkit/authoring.md` § Prompts and Workflows and § Workflows Only; `.agents/rules.md` § Workflow edits requires it. `docs/knowledge.jsonl` `kn-43-prettier-blank-lines-around-bkit-tracker-markers...` warns that prettier re-adds blanks around top-level tracker markers and two-digit steps escape list items. Add the read and gate the edit on the render diff.

## OUT OF SCOPE

None beyond the plan's own `Out of Scope` and `Suggested Scope Expansion` tables. The seven deferred items each have a matching `docs/deferrals.jsonl` row, and no exempt row is needed by a success criterion, matrix row or design item.

## SUGGESTED SCOPE EXPANSION

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `main-checkout-left-core-bare-true` | `related-failures.md` line 5 (HIGH, open) | `bkit install` and the full gate in the repo checkout | Add a pre-flight `git config core.bare` assertion, or run the gate only in the worktree; the failure records `core.bare=true` breaking git commands during a pre-push gate. |
| Full-gate timeout cluster: `instructions-retired-clause-timeout-under-full-gate`, `resolve-push-base-uses-last-green-run-timeout-under-full-gate`, `resolve-push-base-falls-back-gh-fails-timeout-under-full-gate`, `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate` | `related-failures.md` lines 2, 3, 6, 7 (LOW, open) | Task 11 and Task 12 run `pnpm bkit:gate:static-unit-integration` | Add a retry or timeout budget, or document the known flakes so a timeout is not read as a plan failure. |
| `650-debug-dev-ci-live-round-trip` | `related-deferrals.md` line 8 (MEDIUM, hard-blocked) | Ship and debug CI, not this local publish path | Keep deferred; it needs a real GitHub Actions round trip and does not touch build's local ending. |

`related-issues.md` is `None`; the remaining deferral rows (`363`, `380`, `381`, `384`, `442`, `504`, `639`, `700`, `701`, `gate-prompts-md`, `archived-plan-artifacts`) do not overlap this plan's surfaces. `audit-security-npm-publish-ungated-for-write-collaborators` and `friction-jsonl-row-written-with-unexpanded-shell-substitution` (closed) also do not overlap.
