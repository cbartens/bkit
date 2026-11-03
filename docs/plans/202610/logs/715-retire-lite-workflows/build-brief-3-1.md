# Brief: group 3 — Install seed and the retired-lite migration

Plan: 715 — Retire lite workflows; add build publish true/false Implementation Plan

## Why and what

### Context & Goals

Two coupled changes in bkit's own workflow surface. The five lite paste prompts (`design:lite` … `ship:lite`) and their payload doc `.bkit/lite.md` are a second implementation of every phase: they skip the gates, worktree isolation, PR, CI and audit trail, they write no status row, and nothing tests them. #650 (workflows run from the prompt alone) and #705 (build converts an issue into a plan) removed the gap they filled. The part worth keeping — a worktree, plan convert, plan current, per-group verify, gaps remediation, holistic verify, challenge and tests — stays in the one full workflow.

The real need lite covered was "build this locally and do not publish it yet". This plan makes only build's ending configurable through `package.json` `bkit.workflows.build.publish` (`remote` and `local`, both `true` by default) and a plain-text `publish=true` / `publish=false` session token. `publish=false` holds: no branch push, no PR, no CI, no docs sync, worktree and branch kept, lock released, ending `held`. Every other runtime resolves `publish.remote`, which accepts only `true`, so a cloud run always publishes.

Source of truth: issue #715 body (final scope; it supersedes the two design comments). No design doc and no audit report exist for this FID.

**Related Issues:**

- #541 — Shortcuts: inspiration-style copy-paste prompts (.agents/shortcuts.md) (closed)
- #650 — Run workflows from the prompt alone, without issue, design or plan (closed)
- #705 — Build: plan-convert plan-current get their own numbered steps comments (open)
- #442 — Run only the workflow steps a task actually needs (closed)
- #663 — Workflow prompt process token optimisation (closed)

---

### Narrative

Two changes, one decision:

1. **Retire the lite workflow surface** — `.bkit/lite.md` and the five paste prompts (`design:lite` … `ship:lite`). bkit keeps one path per phase.
2. **Add a `publish` setting to `/bkit-build`** — a true/false choice at the end of a local build: publish (push `feat/{FID}`, open the PR) or hold (push nothing, keep the worktree). Remote builds always publish.

### Success Criteria

Copied word for word from issue #715 § Success criteria.

- `bkit install` and `bkit upgrade` leave no bkit-managed lite block, and consumer content below `bkit:end` in the old file is preserved.
- No current doc, prompt, workflow or label rule names a `<phase>:lite` workflow or a `next:*:lite` label. Historical ledgers, `CHANGELOG.md` and closed issues are exempt.
- Every "small change" recommendation in the shipped docs points at `/bkit-build #N`.
- `publish` defaults to `{ remote: true, local: true }`; `publish.local: false` holds; `publish.remote: false` is refused with an advisory.
- A `publish=false` run: no push, no PR, no CI, worktree and branch kept, lock released, ending `held`, issue `In review` with the "built locally, not published" comment, summary `Publish: held` and `Docs: not synced`.
- A `publish=true` run behaves exactly as today.
- A non-LOCAL run with `publish=false` coerces to `true` with a visible warning.
- `/bkit-ship <ref>` lands a held build end to end.
- `pnpm bkit:gate:static-unit` and `bkit check` pass.

**Plan acceptance detail** (how this plan makes each criterion true; none of it replaces the list above):

- `publish.remote: false` is refused with the `bkit-build-publish-remote` advisory and still resolves `true`, so a cloud run publishes; `publish.local: false` holds.
- The held close writes `ending: held` and `publish: false` on both the `workflow-done` row and the outcome row; `Docs: not synced` appears in the summary and the final message.
- The two static checks run in Task 16, after `pnpm build`, `bkit install` and `pnpm instructions:sync` refresh `dist/`, the dogfood mirrors and `.bkit/instructions.md`.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| A batch publish command (`bkit ship --batch`) | Issue #715 § Out of scope; with no PR there is no merge, and a batch verb would be a second landing workflow | Future issue; the manual recipe ships as docs |
| Moving docs sync from ship into build or into the PR | Issue #715 § Out of scope; changes ship's step order and the PR path | A separate decision, design first |
| Changing build's verification steps, challenge sizing, plan-convert, worktree model or `dev` push rules | Issue #715 § Out of scope; the plan keeps every one of them | Unchanged |
| Debug's `PUSH_MODE` or debug behaviour | Issue #715 § Out of scope; only build gains the ending | Unchanged |
| Deleting existing `next:*:lite` GitHub label definitions | Issue #715 § Out of scope; unused definitions are harmless | A consumer's tracker hygiene |
| Migrating or loading a consumer's lite content beyond preserving its section | Issue #715 § Out of scope; lite docs are retired, not converted | A consumer's own docs |
| Dated audit reports (`docs/audits/**`) and `CHANGELOG.md` still naming lite workflows | Issue #715 § Success criteria exempts historical records; rewriting a report would falsify the record | Historical records |

## Where it fits

- Group 1: Publish setting, repo info and advisories — done
  - TASK 1: Parse and validate `bkit.workflows.build.publish` in settings — done
  - TASK 2: Print the resolved publish values from `repo info` — done
  - TASK 3: Report the two publish advisories from `bkit check` — done
- Group 2: Runtime publish resolution and summary line — done
  - TASK 4: Resolve `{PUBLISH}` in `bkit status route` — done
  - TASK 5: Write the `Publish:` and `Docs:` lines into the build summary — done
- Group 3: Install seed and the retired-lite migration — this group
  - TASK 6: Seed `build.publish` on install and upgrade — open
  - TASK 7: Retire the lite payload in one install transition — open
- Group 4: Lite payload removal and uninstall doctrine — next
  - TASK 8: Delete the lite payload and prove the upgrade keeps consumer content — open
  - TASK 9: Teach `bkit uninstall` the retired lite path — open
- Group 5: Close row, telemetry ending and stats view — later
  - TASK 10: Record `ending: held` and `publish: false` on the close — open
  - TASK 11: Derive and display the held ending in stats / harvest — open
- Group 6: Build workflow branch and gates — later
  - TASK 12: Branch `bkit-build.md` on the resolved publish ending — open
  - TASK 13: Verify the held ending and its deferred landing against real boundaries — open
- Group 7: Guidance retirement — later
  - TASK 14: Remove lite guidance from the rules, prompts and reference docs — open
  - TASK 15: Rewrite the root README and roadmap guidance; document the held handoff and the manual batch recipe — open
- Group 8: Dist, dogfood mirrors and the gate — later
  - TASK 16: Rebuild `dist/`, refresh the dogfood mirrors and run the gate — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Seed `build.publish` on install and upgrade
  - **UPDATE:** `SEEDED_BKIT_DEFAULTS` in `.bkit/core/engine/install/modules/core.ts`: merge `publish` beside the ask blocks — `build: { ...askBlocks().build, publish: { remote: true, local: true } }`
  - **UPDATE:** `dist/cli.js`: rebuilt by `pnpm build` and staged in the same commit
  - **READ:** `askBlocks` in `.bkit/core/engine/install/modules/core.ts`: the spread the seed merges beside
  - **READ:** `addMissingKeys` in `.bkit/core/engine/install/modules/core.ts`: the descent rule that preserves an existing value
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/install/modules/core.integration.test.ts` passes with the four seed cases; `pnpm build` succeeds and its `dist/` diff is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `seeds build.publish on install` fails on the key being absent
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `keeps an existing publish.local false on upgrade` fails when the value is overwritten
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `seeds publish without dropping the ask blocks` fails when `build.verify` / `build.challenge` / `build.tests` disappear
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `seeds publish when the bkit block has no build` fails on a missing `build` block staying empty

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Retire the lite payload in one install transition
  - **UPDATE:** `migrateShortcutsToLite` in `.bkit/core/engine/install/modules/core.ts`: rename to `migrateRetiredLite` (same call site), covering `.agents/shortcuts.md` and `.bkit/lite.md`; write the stub with a `RETIRED_LITE_STUB_SENTINEL = "<!-- bkit:retired-lite-stub -->"` first line; a destination with no single managed block and the sentinel returns with no write and no log, one without the sentinel warns without naming `<!-- bkit:end -->`; create the merge destination when `.bkit/lite.md` is absent instead of the unconditional `fs.readFileSync(dst, "utf-8")` read at line 358; do not gate on `getBkitDocsRoot()/lite.md` existing; exclude the seeded `## Project Lite Workflows` heading the way the old function excludes `## Project Shortcuts`
  - **UPDATE:** `BKIT_CANONICAL_DOCS` in `.bkit/core/engine/install/modules/core.ts`: remove `"lite.md"` so the docs loop stops writing it before the migration runs
  - **UPDATE:** `DOCS` in `.bkit/core/engine/install/modules/core.integration.test.ts`: remove `"lite.md"`; rewrite the migration block against inline stub fixtures, dropping `renderedLite()` so nothing reads the source doc
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: add the 5.2.4-shaped upgrade case
  - **UPDATE:** `docs/migrations.md`: replace the lite-moved row with the lite-retired row (both release ranges, the stub sentinel, uninstall behaviour)
  - **UPDATE:** `dist/cli.js`: rebuilt by `pnpm build` and staged in the same commit
  - **READ:** `migrateShortcutsToLite` in `.bkit/core/engine/install/modules/core.ts`: the managed-block extraction, heading filter, append and warning it already performs
  - **DEPENDS ON:** 6
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/install/modules/core.integration.test.ts .bkit/core/engine/commands/install/upgrade.integration.test.ts` passes with the ten migration cases; a second real install over its own stub records zero writes and logs no manual-fix line; each fixture sets `GIT_DIR` / `GIT_WORK_TREE` to its own temp repo (never the checkout); `pnpm build` succeeds and its `dist/` diff is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `strips the managed block and keeps consumer lines` fails when the consumer lines are lost
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `deletes .bkit/lite.md when it holds only the seeded heading` fails on an empty stub remaining
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `merges .agents/shortcuts.md consumer lines into the stub` fails when the old lines are dropped
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `creates the stub when the shortcuts merge finds no lite.md` fails on a throw from reading a missing destination
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves a blockless or two-block lite.md untouched and logs` fails when the file is rewritten or deleted
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `logs no fix and writes nothing on a second install over its own stub` fails while the stub re-enters the blockless warning
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `is idempotent across a second install` fails on a second recorded write
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `records the same write set in a dry run` fails when dry-run parity breaks
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `installs no lite.md and still mirrors every other canonical doc` fails when the file is written or a doc is dropped
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade from a 5.2.4 lite.md keeps the consumer section` fails when the section is lost

<!-- bkit:task 7 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Parse and validate `bkit.workflows.build.publish` in settings — `.bkit/core/engine/shared/settings.ts`, `dist/cli.js`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Seed the block on install / upgrade | `.bkit/core/engine/install/modules/core.ts` (SEEDED_BKIT_DEFAULTS, askBlocks, addMissingKeys) | `grep -n "SEEDED_BKIT_DEFAULTS" .bkit/core/engine/install/modules/core.ts`; `grep -n "askBlocks" -A10 .bkit/core/engine/install/modules/core.ts`; `grep -n "addMissingKeys" .bkit/core/engine/install/modules/core.ts` | SEEDED_BKIT_DEFAULTS spreads `...askBlocks()` into `workflows`; addMissingKeys descends into a block both sides hold | EXTEND | Seed `publish` merged beside the ask blocks (`build: { ...askBlocks().build, publish: … }`); a present value is never touched. |
| Stop mirroring the lite doc in canonical docs | `.bkit/core/engine/install/modules/core.ts` (BKIT_CANONICAL_DOCS) | the same `grep -rn "lite.md" .bkit/core/engine/install` | One canonical-doc list entry at line 263 | EXTEND | Remove `"lite.md"`; the source doc moves to `[DELETE]`. |
| Preserve consumer lite content | `.bkit/core/engine/install/modules/core.ts` (migrateShortcutsToLite) | `grep -n "migrateShortcutsToLite" -A45 .bkit/core/engine/install/modules/core.ts`; same in `.bkit/core/engine/install/modules/core.integration.test.ts` | The existing migration already strips a managed block and appends consumer lines | EXTEND | Replace the two-file shortcut migration with one `migrateRetiredLite` that covers `.agents/shortcuts.md` and `.bkit/lite.md`, then delete the old function and its row. |
| Record the migration row and ledger rows | `docs/migrations.md` | `grep -n "^## Migrations" -A10 docs/migrations.md` | The migrations table already holds one row per migration; `bkit ledgers append` writes the decision / deferral rows | EXTEND | Replace the lite-moved row with the lite-retired row (both release ranges, uninstall behaviour); the 4 decision and 7 deferral rows are already appended. |

### Architecture entries

#### [DELETE] `migrateShortcutsToLite` in `.bkit/core/engine/install/modules/core.ts`

- Reason: `migrateRetiredLite` covers its input (`.agents/shortcuts.md`) and the retired `.bkit/lite.md` in one idempotent migration; the old function, its constants and its describe block are removed in Task 7.

Reuse Inventory rows left out: 0; Architecture entries left out: 4 — read them in docs/plans/202610/715-retire-lite-workflows-plan.md § Reuse Inventory and § Architecture & Component Changes.
