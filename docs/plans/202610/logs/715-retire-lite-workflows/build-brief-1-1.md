# Brief: group 1 — Publish setting, repo info and advisories

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

- Group 1: Publish setting, repo info and advisories — this group
  - TASK 1: Parse and validate `bkit.workflows.build.publish` in settings — open
  - TASK 2: Print the resolved publish values from `repo info` — open
  - TASK 3: Report the two publish advisories from `bkit check` — open
- Group 2: Runtime publish resolution and summary line — next
  - TASK 4: Resolve `{PUBLISH}` in `bkit status route` — open
  - TASK 5: Write the `Publish:` and `Docs:` lines into the build summary — open
- Group 3: Install seed and the retired-lite migration — later
  - TASK 6: Seed `build.publish` on install and upgrade — open
  - TASK 7: Retire the lite payload in one install transition — open
- Group 4: Lite payload removal and uninstall doctrine — later
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

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Parse and validate `bkit.workflows.build.publish` in settings
  - **UPDATE:** `BkitConfig` in `.bkit/core/engine/shared/settings.ts`: add the `BuildPublish` type and a flat `buildPublish` field
  - **UPDATE:** `CONFIG_DEFAULTS` in `.bkit/core/engine/shared/settings.ts`: `buildPublish` = `{ remote: true, local: true }`
  - **UPDATE:** `readBkitConfig` in `.bkit/core/engine/shared/settings.ts`: parse `workflows.build.publish`; `remote` resolves `true`; `local` accepts only a boolean; a non-object block resolves both defaults
  - **UPDATE:** `invalidTaskCaps` in `.bkit/core/engine/shared/settings.ts`: add sibling `invalidBuildPublish` returning `build`, `build.publish`, `build.publish.local` — never `build.publish.remote`, which the preflight advisory owns
  - **UPDATE:** `dist/cli.js`: rebuilt by `pnpm build` and staged in the same commit
  - **READ:** `record` in `.bkit/core/engine/shared/settings.ts`: the object guard the parser uses
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/shared/settings.test.ts` passes with the five new cases; `invalidBuildPublish` is exported; `pnpm build` succeeds and its `dist/` diff is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/shared/settings.test.ts` `defaults build.publish to true` fails on a false or missing `local` / `remote` default
    - `.bkit/core/engine/shared/settings.test.ts` `reads an explicit publish.local false` fails on `false` being coerced to `true`
    - `.bkit/core/engine/shared/settings.test.ts` `coerces publish.remote false to true` fails on `remote` returning `false`
    - `.bkit/core/engine/shared/settings.test.ts` `lists every invalid build.publish key` fails on an invalid key being silently accepted
    - `.bkit/core/engine/shared/settings.test.ts` `reports a non-object publish block` fails when `"publish": false` parses silently

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Print the resolved publish values from `repo info`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/repo.ts`: the `repo info` verb emits `buildPublishRemote` and `buildPublishLocal`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/repo.ts`: document both keys in the command's `output` block
  - **UPDATE:** `dist/cli.js`: rebuilt by `pnpm build` and staged in the same commit
  - **READ:** `config.tasks` in `.bkit/core/engine/commands/workflow/repo.ts`: the pattern for printing a `bkit.workflows` block
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/repo.test.ts` passes; `pnpm build` succeeds and its `dist/` diff is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/repo.test.ts` `prints buildPublishRemote and buildPublishLocal` fails on either key being absent
    - `.bkit/core/engine/commands/workflow/repo.test.ts` `prints the publish defaults when package.json omits them` fails on `null` or a missing key

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Report the two publish advisories from `bkit check`
  - **UPDATE:** `detectInvalidTaskCaps` in `.bkit/core/engine/checks/before/repo.ts`: add `detectBuildPublish` beside it, reading raw `bkit.workflows.build.publish`; one finding per key — `bkit-build-publish-remote` for `remote !== true` on an object block, `bkit-build-publish-invalid` for a non-object block or a non-boolean `local`, never both for one key
  - **UPDATE:** `runPreflight` in `.bkit/core/engine/checks/before/index.ts`: push the new finding into `advisories`
  - **UPDATE:** `dist/cli.js`: rebuilt by `pnpm build` and staged in the same commit
  - **READ:** `bkitWorkflows` in `.bkit/core/engine/checks/before/repo.ts`: the raw-package.json helper
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/checks/before/repo.test.ts .bkit/core/engine/checks/before/index.test.ts` passes with the five detector cases and the wiring case; `pnpm build` succeeds and its `dist/` diff is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/before/repo.test.ts` `reports bkit-build-publish-remote for publish.remote false` fails on no advisory
    - `.bkit/core/engine/checks/before/repo.test.ts` `reports bkit-build-publish-invalid for a non-boolean publish.local` fails on silence
    - `.bkit/core/engine/checks/before/repo.test.ts` `reports bkit-build-publish-invalid for a non-object publish block` fails on silence
    - `.bkit/core/engine/checks/before/repo.test.ts` `stays quiet for a valid or absent build.publish` fails on a false finding
    - `.bkit/core/engine/checks/before/repo.test.ts` `reports only the remote advisory when remote is false and local is valid` fails when both advisories fire for one block
    - `.bkit/core/engine/checks/before/index.test.ts` `collects build publish advisories into advisories` fails when the detector is not wired

<!-- bkit:task 3 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Read / validate `build.publish` | `.bkit/core/engine/shared/settings.ts` | `grep -n "tasks" .bkit/core/engine/shared/settings.ts`; `grep -n "askSettings" .bkit/core/engine/shared/settings.ts`; `grep -n "readBkitConfig" .bkit/core/engine/shared/settings.ts`; `grep -n "invalidTaskCaps" .bkit/core/engine/checks/before/repo.ts`; `docs/capabilities.md` searched for a config capability | `readBkitConfig`, `tasks`, `invalidTaskCaps` — cover every other `bkit.workflows` block | EXTEND | Add a flat `buildPublish` block parsed beside `tasks`; add `invalidBuildPublish` following `invalidTaskCaps`. |
| Print the resolved ending in `repo info` | `.bkit/core/engine/commands/workflow/repo.ts` | `grep -n "tasks" .bkit/core/engine/commands/workflow/repo.ts`; `grep -n "config.tasks" .bkit/core/engine/commands/workflow/repo.ts` | the `repo info` verb already prints `tasks` | EXTEND | Add `buildPublishRemote` / `buildPublishLocal` to the emitted object and the output contract. |
| Advisory for a refused remote value | `.bkit/core/engine/checks/before/repo.ts` | `grep -n "detectInvalidTaskCaps" -A45 .bkit/core/engine/checks/before/repo.ts`; `grep -n "advisories.push" .bkit/core/engine/checks/before/index.ts` | `detectInvalidTaskCaps`, `detectTaskCapFormStale` — the same raw-package.json detector shape | EXTEND | Add `detectBuildPublish` returning `bkit-build-publish-remote` / `bkit-build-publish-invalid`; wire it in `runPreflight`. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/shared/settings.ts`

- **Existence Check:** file exists; `BkitConfig` is flat (`tasks`, `asks`, `worktreeCopy`), `CONFIG_DEFAULTS`, `readBkitConfig`, `invalidTaskCaps` already there.
- Add `BuildPublish` (`{ remote: true; local: boolean }`) and `buildPublish: BuildPublish` to `BkitConfig`, `CONFIG_DEFAULTS.buildPublish`, parse in `readBkitConfig` from `record(record(workflows.build).publish)`, and export `invalidBuildPublish(raw: unknown): string[]` returning dotted keys for the block shape and `local` only (`build`, `build.publish`, `build.publish.local`). `remote` is never in that list: `detectBuildPublish` owns it, so one value cannot yield two findings. `remote` always resolves `true`; `local` defaults `true`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/repo.ts`

- **Existence Check:** file exists; the `repo info` verb emits `tasks`.
- Emit `buildPublishRemote: config.buildPublish.remote` and `buildPublishLocal: config.buildPublish.local`; add both to the command's `output` documentation.

#### [MODIFY] `.bkit/core/engine/checks/before/index.ts`

- **Existence Check:** file exists; `runPreflight` wires every advisory detector.
- Push the new finding into `advisories`; no blocker.

Reuse Inventory rows left out: 0; Architecture entries left out: 1 — read them in docs/plans/202610/715-retire-lite-workflows-plan.md § Reuse Inventory and § Architecture & Component Changes.
