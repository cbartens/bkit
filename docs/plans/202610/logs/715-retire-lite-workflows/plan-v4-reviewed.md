Verdict: PASS
<!-- verdict:end -->

# 715 — Retire lite workflows; add build publish true/false Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

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

### Process Sketch

- **WHEN** a developer runs `/bkit-build 715-… publish=false` on a LOCAL runtime **→ THEN** the same plan-convert, execute, verify, gaps, holistic, challenge and test steps run, and the run ends `held` with nothing pushed.
- **WHEN** the same build ends held **→ THEN** the worktree and `feat/715-…` stay, the lock is released, the issue is `In review` with a "built locally, not published" comment, and `build-summary.md` reads `Publish: held`.
- **WHEN** a developer runs `/bkit-build 715-…` with no token and `publish.local` absent **→ THEN** `publish` resolves `true` and the run pushes, opens the PR and hands off to `/bkit-ship` exactly as today.
- **WHEN** a run resolves `publish=false` on a non-LOCAL runtime **→ THEN** it coerces to `true` and emits a visible warning rather than holding an ephemeral branch.
- **WHEN** a consumer with `publish.remote: false` runs `bkit check` **→ THEN** the `bkit-build-publish-remote` advisory tells them remote builds always publish a PR.
- **WHEN** an existing install carries `.bkit/lite.md` with its own lines below `bkit:end` **→ THEN** `bkit upgrade` strips the managed block, keeps those lines in a consumer-owned stub, and a fresh install writes no lite doc at all.
- **WHEN** a build resumes after Step 2 **→ THEN** Step 2 runs again and `bkit status route --prompt-file` re-derives `publish` from the resumed prompt and config, never from a shell variable.

### Concrete Example

**Setup:** A developer on a laptop (`runtime` = `LOCAL`) with bkit 6.0.0 installed, `bkit.workflows.build.publish` absent from `package.json`, and issue #715 open. They want to build and test the change locally but land several small changes together later.

**Steps:**

1. Developer runs `/bkit-build 715-retire-lite-workflows publish=false` → `bkit repo info` prints `buildPublishRemote: true`, `buildPublishLocal: true`; Step 2's `bkit status route --prompt-file` prints `runtime: LOCAL` and `publish: false`; the orchestrator holds `{PUBLISH} = false`.
2. Build proceeds through worktree setup, plan convert, execute, verify, gaps remediation, holistic verify, challenge and run tests → every step records its row; no shortcut steps are taken.
3. Step 15 writes `build-summary.md` with `Publish: held` and `Docs: not synced (ship syncs on landing)` → the run skips the open-PR probe and the branch push, and Gate 15's probe/push lines do not apply.
4. Step 16 closes with `--ending=held --publish=false`, records the `workflow-done` row and the outcome row, appends the roadmap row in the worktree through `roadmap feature` (no `mirror`), releases the lock, sets the issue `In review`, and posts a "built locally, not published" comment.
5. The final message prints the held handoff with the branch, the worktree and `Docs: not synced (ship syncs on landing)`.

**Outcome:** `feat/715-…` and `.worktrees/715-…` exist locally with every commit and `build-summary.md`; nothing reached `origin`; the issue says `In review`; `/bkit-ship 715-…` is the documented way to land it later.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `publish=false` token on `CLOUD_CLAUDE`, `CLOUD_CURSOR`, `GITHUB_ACTION` or `UNKNOWN` | Coerce to `true`, emit a visible warning, and take the normal push/PR path — a held branch would vanish with the VM. |
| `publish.remote: false` in `package.json` | Parse to `true`; `bkit check` reports `bkit-build-publish-remote` ("remote builds always publish a PR"). |
| `publish.local: "no"` (or any non-boolean) | Parse to `true`; `bkit check` reports `bkit-build-publish-invalid`. |
| `bkit.workflows.build.publish` absent, or `build` absent | Both keys take `true`; no advisory. |
| Token and config disagree, e.g. `publish=true` with `local: false` | The session token wins for that run; config is untouched. |
| A resume whose new prompt omits the token | Step 2 re-derives `publish` from `publish.local`; a one-run `publish=false` token does not survive a resume, so a durable hold is `publish.local: false` or a repeated token. |
| `publish.remote: false` beside a valid `local` | One finding for one key: `bkit-build-publish-remote` cites `build.publish.remote`; `bkit-build-publish-invalid` is never also reported for it. |
| Held run with no open PR and no CI | Step 16 must not probe for a PR, must not push, and must not run `runs dispatch`; the local roadmap fold, the local close commit and the lock release happen. |
| Held run's close gate | Gate 16 checks `build-close-workflow` only; `build-create-pr` has no row because no PR exists. |
| Held run's roadmap row | The close appends it in the worktree with `bkit roadmap feature --root="{WORKTREE_PATH}" --workflow=build --fid={FID}` and re-renders `docs/roadmap.md` there; `roadmap mirror` (which lands the row on `dev`) never runs on this path. |
| A `publish` block that is not an object, e.g. `"publish": false` | Parse to `{ remote: true, local: true }`; `bkit check` reports `bkit-build-publish-invalid` naming `build.publish`. |
| Held run's Gate 15 | The open-PR probe and the summary push lines read "when `{PUBLISH}` is true"; the held path's summary commit stays local. |
| `publish=maybe`, or a value that is neither `true` nor `false` | No token match; resolution falls through to config, and the prompt holds a value the run never reads. |
| `bkit status route --prompt-file` on a run with no `runtime-resolved` row | Exits 4 (`EXIT_ROUTE_MISSING`) with the message that build Step 2 writes the runtime row first; build never defaults `publish`. |
| The `publish` token appears in the issue text, not the prompt | Ignored — only `{SESSION_DIR}/prompt.md` is read. |
| Consumer `.bkit/lite.md` with lines below `bkit:end` | The managed block is stripped; the consumer lines move under a retired-lite stub heading whose first line is the `<!-- bkit:retired-lite-stub -->` sentinel; the file is never deleted while it holds content. |
| Consumer `.bkit/lite.md` with no consumer lines | The file is deleted. |
| A second install or upgrade over the stub the migration wrote | Silent and write-free: the sentinel plus no managed block is the "already retired" branch, so the manual-fix warning does not reappear. |
| Consumer `.agents/shortcuts.md` still present (5.1.0–5.2.4 install) | Its consumer lines (minus `## Project Shortcuts`) merge into the stub; the old file is deleted. |
| `.agents/shortcuts.md` holds consumer lines but `.bkit/lite.md` is absent | The merge target is created before the append; the migration never reads a missing destination. |
| `.bkit/lite.md` with no single managed block and no sentinel | Left byte-for-byte in place; install / upgrade logs the manual fix, worded without pointing at a managed block. |
| A consumer edits a lite prompt and expects it to keep working | The managed block is gone after upgrade; the full workflow is the only path, and the edit survives only as consumer prose in the stub. |
| `publish=true` run | Behaviour byte-identical to 6.0.0: probe, push `feat/{FID}`, open the PR, dispatch CI, hand off to `/bkit-ship`. |
| `/bkit-ship <ref>` on a held build | Ship pushes the branch, opens the PR if none exists, gates on CI and merges — the deferred guarantee. |
| A user combining two held builds by hand | The README recipe lands one head commit, so post-merge auto-debug sees only the last FID, and migrations are never batched; the push, PR, CI gate, sweep and docs sync are the user's. |

### Derived Test Matrix

`Type` = a tier from `docs/testing.md`. `Task` = the one runbook task whose `DONE WHEN` holds the test. Suite-wide gate commands live in `Verification Plan`, not here. The held-close rows are `Integration` against a real temporary Git repo, remote and worktree, with a fixture whose feature branch is local-only so "origin refs unchanged" means the close added nothing. The deferred-landing rows are `Integration` against a real bare origin driven through a test-local recording `gh` `PATH` shim written by the test (`pr list` / `create` / `view` / `merge` answered and every argv recorded), which delegates the `gh api …/actions/…` calls `bkit runs gate` makes to the repo's documented `tests/fixtures/gh` stub — that stub answers `pr view` and `gh api` only, so it cannot serve the PR surface on its own. This repo declares no `test:live` lane.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Defaults `build.publish` to `{ remote: true, local: true }` when absent | Unit | `.bkit/core/engine/shared/settings.test.ts` | 1 |
| Reads an explicit `publish.local: false` without coercing it | Unit | `.bkit/core/engine/shared/settings.test.ts` | 1 |
| Coerces `publish.remote: false` to `true` | Unit | `.bkit/core/engine/shared/settings.test.ts` | 1 |
| Lists every invalid `build.publish` key (non-object block, non-boolean `local`) | Unit | `.bkit/core/engine/shared/settings.test.ts` | 1 |
| Reports a non-object `build.publish` block as invalid | Unit | `.bkit/core/engine/shared/settings.test.ts` | 1 |
| `repo info` prints `buildPublishRemote` and `buildPublishLocal` | Unit | `.bkit/core/engine/commands/workflow/repo.test.ts` | 2 |
| `repo info` prints the publish defaults when `package.json` omits the block | Unit | `.bkit/core/engine/commands/workflow/repo.test.ts` | 2 |
| `bkit check` reports `bkit-build-publish-remote` for a false `remote` | Unit | `.bkit/core/engine/checks/before/repo.test.ts` | 3 |
| `bkit check` reports `bkit-build-publish-invalid` for a non-boolean `local` | Unit | `.bkit/core/engine/checks/before/repo.test.ts` | 3 |
| `bkit check` reports `bkit-build-publish-invalid` for a non-object `publish` block | Unit | `.bkit/core/engine/checks/before/repo.test.ts` | 3 |
| `bkit check` stays quiet for a valid or absent `build.publish` | Unit | `.bkit/core/engine/checks/before/repo.test.ts` | 3 |
| `bkit check` reports the remote advisory alone for a false `remote` beside a valid `local` | Unit | `.bkit/core/engine/checks/before/repo.test.ts` | 3 |
| `runPreflight` collects the publish advisories into `advisories` | Unit | `.bkit/core/engine/checks/before/index.test.ts` | 3 |
| `status route --prompt-file` lets the `publish` token override `publish.local` | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 4 |
| `status route` calls `publish.local` on `LOCAL` when the prompt holds no token | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 4 |
| `status route` coerces `publish=false` to `true` on a non-LOCAL runtime | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 4 |
| `status route --prompt-file` accepts `--workflow=build` | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 4 |
| `status route` ignores a `publish=maybe` token and falls through to config | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 4 |
| `status route` refuses to resolve `publish` without a `runtime-resolved` row | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 4 |
| `status route` prints `publishSource` as `token` / `local` / `remote` / `coerced` | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 4 |
| A held build's summary writes `Publish: held` | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 5 |
| A normal build's summary writes `Publish: pr` | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 5 |
| `publish` does not change the summary verdict or next-step command | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 5 |
| A held build's summary writes `Docs: not synced (ship syncs on landing)` | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 5 |
| `workflows summary --publish=false` reaches `buildSummary` as `publish: false` | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 5 |
| Fresh install seeds `build.publish` with both keys true | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| Upgrade keeps an existing `publish.local: false` and never overwrites it | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| Seeding `publish` keeps the `build.verify` / `build.challenge` / `build.tests` ask blocks | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| Upgrade seeds `build.publish` when the `bkit` block has no `build` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| The migration strips the managed block and keeps consumer lines in a stub | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| The migration deletes `.bkit/lite.md` when it holds only the seeded heading | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| The migration merges `.agents/shortcuts.md` consumer lines and deletes the old file | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| The shortcuts merge creates the stub when `.bkit/lite.md` is absent | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| A second install over the retired stub logs no manual-fix warning and writes nothing | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| A blockless or two-block `.bkit/lite.md` is left byte-for-byte and the fix is logged | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| The migration is idempotent across a second install and writes nothing | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| A dry run records the same write set as a real install | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| A fresh install writes no `.bkit/lite.md` and mirrors every other canonical doc | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| `bkit upgrade` from a 5.2.4 `lite.md` keeps the consumer section | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 7 |
| The install manifest no longer lists `.bkit/lite.md` and keeps `prompts.md` as the only markered-text core doc | Unit | `.bkit/core/engine/install/manifest.test.ts` | 8 |
| The migration still runs when the package `.bkit/core/.bkit/lite.md` is absent | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 8 |
| The managed group-A doc list excludes `.bkit/lite.md` | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 8 |
| `bkit uninstall` strips the managed lite block from an un-upgraded install | Unit | `.bkit/core/engine/commands/install/uninstall.test.ts` | 9 |
| A held close writes `ending: held` and `publish: false` on the `workflow-done` row | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 10 |
| A normal close still writes no `ending` override and no `publish` field | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 10 |
| An unknown `--ending` value is refused with a usage error | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 10 |
| Telemetry accepts `held` in `OUTCOME_ENDINGS` and `RUN_ENDINGS` | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 10 |
| The outcome row keeps `publish: false` | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 10 |
| Telemetry rejects a non-boolean `publish` on an outcome row | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 10 |
| Harvest derives `held` from a `workflow-done` row carrying `ending: held` | Unit | `scripts/harvest/bkit-harvest.test.mjs` | 11 |
| The harvest report counts a `held` run in its own column | Unit | `scripts/harvest/bkit-harvest.test.mjs` | 11 |
| Harvest keeps a normal `done` run as `done` | Unit | `scripts/harvest/bkit-harvest.test.mjs` | 11 |
| The per-run telemetry view shows an `ending: held` row | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 11 |
| `bkit stats` counts a held `outcome` row in its kind totals | Unit | `.bkit/core/engine/commands/stats.test.ts` | 11 |
| `bkit-build.md` resolves publish through `status route` from token → config → runtime | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 12 |
| `bkit-build.md` re-derives publish on resume instead of reading a shell variable | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 12 |
| `bkit-build.md` warns when a non-LOCAL run resolves publish false | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 12 |
| The held close skips the PR probe, branch push and CI dispatch and releases the lock | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 12 |
| The held close appends the roadmap row with `roadmap feature` and never runs `roadmap mirror` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 12 |
| The `publish=true` close path keeps probe, push, PR and CI dispatch | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 12 |
| Gate 15's probe and push lines are conditional on the held path | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 12 |
| Gate 16 checks `build-close-workflow` only on the held path | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 12 |
| The `bkit-build` none-render baseline matches after the publish branch | Unit | `.bkit/core/engine/render/trackers.test.ts` | 12 |
| The instructions store drops the retired `bkit-build` standing lines | Unit | `.bkit/core/engine/tools/instructions-coverage.test.ts` | 12 |
| The held close leaves `origin/dev` and every remote ref unchanged, keeps the branch and worktree, and releases the lock | Integration | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` | 13 |
| The held close records `ending: held` / `publish: false` rows, `Publish: held` + `Docs: not synced` in the summary, and the roadmap row only in the worktree | Integration | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` | 13 |
| `/bkit-ship` pushes the held branch to the bare origin and opens a PR against `dev`, recording the `pr create` base and head | Integration | `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` | 13 |
| `/bkit-ship` gates on CI at the PR head and merges the pinned head, recording `--match-head-commit` | Integration | `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` | 13 |
| No shipped prompt or workflow names a lite workflow | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 14 |
| No shipped rule or prompt instructs a `next:*:lite` label | Unit | `.bkit/core/engine/tools/instructions-sources.test.ts` | 14 |
| The change issue form names no lite workflow | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 14 |
| The shipped reference docs list no lite doc | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 14 |
| The instructions store holds no lite clause text | Unit | `.bkit/core/engine/tools/instructions-sources.test.ts` | 14 |
| The root README points every small-change recommendation at `/bkit-build #N` and links no lite doc | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 15 |
| The root README carries the manual batch recipe with both limitations | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 15 |
| The root README carries the held handoff | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 15 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

<!-- prettier-ignore -->
| Kind | Name / change | Compatibility |
| --- | --- | --- |
| Config (new) | `bkit.workflows.build.publish.remote` (`true` only) | Absent → `true`. An explicit `false` parses `true` and raises `bkit-build-publish-remote`. |
| Config (new) | `bkit.workflows.build.publish.local` (`true` \| `false`) | Absent → `true`; invalid → `true` plus `bkit-build-publish-invalid`. |
| Session token (new) | `publish=true` / `publish=false` in the session prompt | Plain text, substring match (so `[publish=false]` works). Never read from issue text. |
| CLI (new flags) | `bkit workflows close --ending=<done\|held> --publish=<true\|false>` | Both optional; absent = today's `ending: done` and no `publish` field. |
| CLI (new flag) | `bkit workflows summary --publish=<true\|false>` | Optional; absent = today's summary with no Publish line. |
| CLI (new output keys) | `bkit repo info` → `buildPublishRemote`, `buildPublishLocal` | Additive; existing keys unchanged. |
| Telemetry (widened enum) | outcome / run `ending` gains `held`; outcome row gains optional `publish` | Readers that reject unknown endings must add `held`; old rows unaffected. |
| Advisory ids (new) | `bkit-build-publish-remote`, `bkit-build-publish-invalid` | Additive advisories; no blocker. |
| Payload (removed) | `.bkit/lite.md` is no longer a managed doc; `manifest.ts` no longer lists it; `BKIT_CANONICAL_DOCS` no longer mirrors it | No managed lite block remains. Consumer content survives in a consumer-owned stub. |
| Migration (replaced) | `migrateShortcutsToLite` is replaced by `migrateRetiredLite` | One migration covers both `.agents/shortcuts.md` (5.1.0–5.2.4) and `.bkit/lite.md`; idempotent; recorded in `docs/migrations.md`. |
| Docs (removed) | `next:*:lite` guidance in rules, prompts and reference docs; `<phase>:lite` names | Existing GitHub label definitions are not deleted; only new writes stop. |
| Interface (docs) | Build's Output changes from "PR to `dev`" to "PR to `dev` (publish=true, default) or held branch + worktree (publish=false)" | No code consumer; docs only. |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

- **Open Question:** The issue body uses `publish: true|false` and ending `held`; the 2026-10-28T00:32 comment sketched `"remote": "pr", "local": "local"`. Which vocabulary ships? → Issue title ("add build publish true/false") and the body's "Final scope" note settle it; recorded as a decision row.
  - **Options:** A) Booleans (`true`/`false`, ending `held`) — matches the final body and the title · B) Strings (`"pr"`/`"local"`, ending `local`) — matches the earlier sketch only · C) Accept both, normalise — doubles the config surface and gives two names per state.
  - **Recommended:** A) Booleans — one vocabulary in config, prompt, summary and ending; the body declares itself the spec.
  - **Default if unanswered:** A) Booleans.
- **Open Question:** Where do a consumer's own lines below the retired `.bkit/lite.md` `bkit:end` go? → The success criterion requires preservation, not a destination.
  - **Options:** A) Keep `.bkit/lite.md` on disk as a consumer-owned stub with a retired heading — no other doc gains consumer workflow text · B) Append the lines to `.bkit/prompts.md` below its consumer section — mixes workflow guidance into model pins · C) Refuse the upgrade and print a manual move instruction — blocks every upgrade on a human edit.
  - **Recommended:** A) Stub — preserves the text where the consumer wrote it and needs no second doc.
  - **Default if unanswered:** A) Stub.
- **Assumption:** `runtime assert` already distinguishes `LOCAL` from every cloud runtime, so publish resolution needs no new detection → if wrong, a cloud run could resolve `publish.local` and hold an ephemeral branch; the visible coercion warning is the backstop.
- **Assumption:** `bkit status route` reads `package.json` (via `readBkitConfig`), the run's `runtime-resolved` row and the session prompt, so it is the only place build's `publish` is resolved → if wrong, a second path could resolve a different `publish`; the matrix's three `status.test.ts` cases and `repo info` pin it.
- **Assumption:** `.bkit/workflows.md` § Workflow commands forbids carrying a value across fenced bash blocks, so `{PUBLISH}` must come from a command's stdout each run → if wrong, Step 15/16 could read an unset placeholder; build's Resume clause runs Steps 1-2 on every resume, and the shape test asserts the command read.
- **Assumption:** A consumer's `.bkit/lite.md` uses exactly one `bkit:start` / `bkit:end` block (install wrote it) → if a consumer hand-merged a second block, the migration leaves the file in place and logs the fix instead of guessing.
- **Assumption:** `publish=false` never needs to push the run's record to `dev`; the issue's close row and ending live in the worktree's `status.jsonl` → if wrong, `/bkit-ship` or a later debug run reads a stale `dev`; ship already tolerates a feature branch that is not on `dev`.
- **Assumption:** The close comment can carry the held wording without a new comment kind → if wrong, the issue gets the normal close comment plus a "built locally, not published" line; the wording is still visible.
- **Assumption:** A one-run `publish=false` token is read only from `{SESSION_DIR}/prompt.md`, so a resume whose new prompt omits it falls back to `publish.local` → if wrong, a resumed held build could publish while the owner still believes it is held; the `workflow-done` row's `publish` field records which ending actually ran, and `publish.local: false` is the durable form the README names.
- **Assumption:** Upgrade is the only path that must clean a consumer install → a fresh install cannot have `.bkit/lite.md`; the install test proves it.
- **Assumption:** The held close's roadmap write is a worktree commit, not a push, because it runs `bkit roadmap feature --root="{WORKTREE_PATH}"` (append + re-render, no `pushToDev`) instead of `roadmap mirror` → if wrong, `/bkit-ship` sweeps a feature with no `BUILT` row; Task 13's real-remote boundary test asserts both remote refs unchanged and the local row present.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- **Lite workflow with a smaller fixed step set (the first sketch).** Rejected: it is still a second implementation, it still skips the worktree and the gates, and a "lenient" setting would need `step-skipped` rows and verdict continuity (#442's blueprint) just to stay honest. The retained value is not fewer steps; it is the same steps with a different ending.
- **`publish` as `"pr" | "local"` strings.** Rejected: the issue title and its final body use `true`/`false`; two vocabularies in one plan would leak into the token, the summary and the ending.
- **A `bkit ship --batch` verb.** Rejected in the issue: with no PR there is no merge, so ship's remaining jobs are per-feature quality steps; a batch verb would be a second landing workflow and an unreviewed post-hoc-CI push. Document the manual recipe instead.
- **Move docs sync into build or into the PR.** Rejected: a held build may never land, so the sync would describe intended state; keeping it in ship also avoids a double run when a held build is later shipped.
- **Delete `.bkit/lite.md` outright.** Rejected: destroys consumer lines the install wrote below `bkit:end`. The stub migration is the only shape that satisfies the success criterion.
- **Recommendation for a later phase:** if held builds become common, a `bkit builds --held` listing verb could group them; it is not needed for this plan and would duplicate ship's sweep.

## Out of Scope

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

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| A `bkit builds --held` listing verb | `#715` § No batch command (manual recipe only) | Task 15 docs | Keep deferred — no consumer need yet |
| Retire the `.agents/shortcuts.md` migration entirely (5.1.0–5.2.4 is old) | `docs/migrations.md` § Migrations | Task 7 | Keep in the merged migration — the preserved lines still matter |
| `bkit plan --publish` for plan/design closes | `#715` § Out of scope | Task 12 workflow text | Keep deferred — design/plan always push their record |
| A `publish` value on `bkit status meta` for resume | `#715` § Resume is unchanged | Task 4, Task 12 | Keep deferred — `status route` re-derives it every run; no new state |
| `main-checkout-left-core-bare-true` (HIGH, open) | `plan-review-1.md` § SUGGESTED SCOPE EXPANSION; `related-failures.md` line 5 | `bkit install` and the full gate in the repo checkout (Task 16) | Keep deferred — a `core.bare=true` pre-flight assertion is repo hygiene, not this feature; the runbook runs the gate in the worktree |
| Full-gate timeout cluster (`instructions-retired-clause-timeout-under-full-gate`, `resolve-push-base-uses-last-green-run-timeout-under-full-gate`, `resolve-push-base-falls-back-gh-fails-timeout-under-full-gate`, `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate`) | `plan-review-1.md` § SUGGESTED SCOPE EXPANSION; `related-failures.md` lines 2, 3, 6, 7 (LOW, open) | `pnpm bkit:gate:static-unit-integration` in Task 16 | Keep deferred — known flakes, no retry budget in this plan; a timeout is reported as itself, not as a plan failure |
| `650-debug-dev-ci-live-round-trip` (MEDIUM, hard-blocked) | `plan-review-1.md` § SUGGESTED SCOPE EXPANSION; `related-deferrals.md` line 8 | Ship and debug CI, not the local publish path | Keep deferred — needs a real GitHub Actions round trip |

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. `publish` is read from a local `package.json`, the session token is plain text in the prompt, and the close comment copies fixed wording. The retired lite doc's consumer lines are preserved verbatim and never executed.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** no package added or removed; `package.json` and `pnpm-lock.yaml` stay in sync.
- [x] **Dependency Versions:** `pnpm bkit:deps:outdated` run 2026-10-28 — `vitest`/`@vitest/coverage-v8` 5.0.3 → 5.0.5, `oxlint` 1.87.0 → 1.89.0, `@types/node` 24.19.2 → 26.6.5, `vite` 6.4.4 → 8.3.4. None blocks this plan; no upgrade is bundled (major bumps are their own cycle). Node v24.16.0, pnpm 10.34.6, package `@cbartens/bkit@6.0.0`.
- [x] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`; every capability extends an existing file, no parallel implementation.
- [x] **User Context:** worktree, source, tests and docs are readable; no user information is missing (the two vocabulary questions are surfaced above with defaults).
- [x] **Project Context:** `docs/decisions.jsonl` rows for `541-shortcuts-inspiration-style-prompts` and `tracker-labels-debug-phase-next-labels` read and superseded; `docs/knowledge.jsonl` searched for `lite` / `manifest` (the rendered-mirror and install-dispatch gotchas apply); `docs/migrations.md`, `docs/testing.md`, `docs/capabilities.md` read.
- [x] **Testing & Quality:** tiers per `docs/testing.md` — Unit for pure config/parse/text checks, Integration for install, migration and the held close / deferred landing against real temp dirs, repos and remotes with no mocks, Static for the gate. The repo declares no `test:live` lane; the GitHub-only surface of the landing row runs through a test-local recording `gh` shim that delegates `gh api …/actions/…` to the documented `tests/fixtures/gh` stub.
- [x] **Prerequisite Plans:** None — #650 (`2b512c910`) and #705 (`483552f82`) are on `origin/dev`.

### Conditional

- [x] **Secrets & Env Vars:** n/a — no secret, token or service-account role is introduced.
- [x] **Schema State:** n/a — no database; the persisted shapes are `package.json` and NDJSON ledgers, covered under Data Schema Integration.
- [x] **Architecture & UI:** n/a for UI; no topology change (existing engine modules only).
- [x] **Observability:** the close outcome row gains `ending: held` and optional `publish`; no new log line or span.
- [x] **Notifications:** n/a — the held comment uses the existing issue-comment channel; no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Security & Privacy checked:** `None` justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision`; no `NEW` row is needed.
- [ ] **Gate 1 - Verified:** Core items checked; every Conditional item is justified n/a.

## Data Schema Integration

This repo has no database. The persisted shapes this feature reads and writes are `package.json` config, the NDJSON status / telemetry ledgers and the build summary / comment text.

### Data Schema Usage

- **Input (Read):** `package.json` `bkit.workflows.build.publish.remote`, `.local`; `status.jsonl` `runtime-resolved.runtime`; the session prompt text.
- **Output (Write):** `.bkit/stats.jsonl` outcome row `ending: "held"` and optional `publish: false`; `status.jsonl` `workflow-done` row `ending: "held"` and `publish: false`; `build-summary.md` `Publish:` line; `.bkit/lite.md` consumer-owned stub.

### Data Schema Changes

- **ADD:** `OutcomePayload.publish?: boolean` (telemetry, optional; absent on every existing row), validated as a boolean when present.
- **MODIFY:** `OutcomePayload.ending` and `RunPayload.ending` gain `"held"`, and the hardcoded `outcome ending must be done|close-failed` message reads from `OUTCOME_ENDINGS`.
- **MODIFY:** `StatusEvent`'s `workflow-done` variant gains optional `ending?: "done" | "held"` and `publish?: boolean`, matching the row `closeWorkflow` writes.
- **ADD:** `bkit.workflows.build.publish` (`{ remote: true, local: boolean }`) in `package.json`; seeded on install / upgrade when missing, read as `BkitConfig.buildPublish`.
- No ledger data migration: older rows without `publish` normalise to absent, and readers already tolerate a missing optional field.
- `.bkit/core/.bkit/jsonl.md` § Per-Kind Fields and `docs/observability.md` record the widened `ending` enums and the optional `publish`.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Read / validate `build.publish` | `.bkit/core/engine/shared/settings.ts` | `grep -n "tasks" .bkit/core/engine/shared/settings.ts`; `grep -n "askSettings" .bkit/core/engine/shared/settings.ts`; `grep -n "readBkitConfig" .bkit/core/engine/shared/settings.ts`; `grep -n "invalidTaskCaps" .bkit/core/engine/checks/before/repo.ts`; `docs/capabilities.md` searched for a config capability | `readBkitConfig`, `tasks`, `invalidTaskCaps` — cover every other `bkit.workflows` block | EXTEND | Add a flat `buildPublish` block parsed beside `tasks`; add `invalidBuildPublish` following `invalidTaskCaps`. |
| Print the resolved ending in `repo info` | `.bkit/core/engine/commands/workflow/repo.ts` | `grep -n "tasks" .bkit/core/engine/commands/workflow/repo.ts`; `grep -n "config.tasks" .bkit/core/engine/commands/workflow/repo.ts` | the `repo info` verb already prints `tasks` | EXTEND | Add `buildPublishRemote` / `buildPublishLocal` to the emitted object and the output contract. |
| Resolve `publish` from prompt, config and runtime | `.bkit/core/engine/commands/workflow/status.ts` (`status route`) | `grep -n "ROUTE_FIELDS" .bkit/core/engine/commands/workflow/status.ts`; `grep -n "debugStart" .bkit/core/engine/commands/workflow/status.ts`; `grep -n "promptFile" .bkit/core/engine/commands/workflow/fids.ts`; `grep -n "runtime assert" .bkit/core/engine/commands/workflow/runtime.ts` | `status route --prompt-file` already turns prompt tokens into routing fields (`debugMode`, `repro`, `gates`); `runtime assert` emits `runtime` from the `runtime-resolved` row | EXTEND | Add `publish` / `publishSource` to `ROUTE_FIELDS` and resolve token → `buildPublish.local` / `.remote` by runtime, coercing a non-LOCAL `false`. No new verb. |
| Advisory for a refused remote value | `.bkit/core/engine/checks/before/repo.ts` | `grep -n "detectInvalidTaskCaps" -A45 .bkit/core/engine/checks/before/repo.ts`; `grep -n "advisories.push" .bkit/core/engine/checks/before/index.ts` | `detectInvalidTaskCaps`, `detectTaskCapFormStale` — the same raw-package.json detector shape | EXTEND | Add `detectBuildPublish` returning `bkit-build-publish-remote` / `bkit-build-publish-invalid`; wire it in `runPreflight`. |
| Seed the block on install / upgrade | `.bkit/core/engine/install/modules/core.ts` (SEEDED_BKIT_DEFAULTS, askBlocks, addMissingKeys) | `grep -n "SEEDED_BKIT_DEFAULTS" .bkit/core/engine/install/modules/core.ts`; `grep -n "askBlocks" -A10 .bkit/core/engine/install/modules/core.ts`; `grep -n "addMissingKeys" .bkit/core/engine/install/modules/core.ts` | SEEDED_BKIT_DEFAULTS spreads `...askBlocks()` into `workflows`; addMissingKeys descends into a block both sides hold | EXTEND | Seed `publish` merged beside the ask blocks (`build: { ...askBlocks().build, publish: … }`); a present value is never touched. |
| Stop listing the lite doc in the manifest | `.bkit/core/engine/install/manifest.ts` | `grep -rn "lite.md" .bkit/core/engine/install` | One manifest entry for `.bkit/lite.md` at line 149 and its comment at 140 | EXTEND | Remove the manifest entry and the stale comment; keep `prompts.md` as the only markered-text core doc. |
| Stop mirroring the lite doc in canonical docs | `.bkit/core/engine/install/modules/core.ts` (BKIT_CANONICAL_DOCS) | the same `grep -rn "lite.md" .bkit/core/engine/install` | One canonical-doc list entry at line 263 | EXTEND | Remove `"lite.md"`; the source doc moves to `[DELETE]`. |
| Strip the retired lite doc on uninstall | `.bkit/core/engine/commands/install/uninstall.ts` (`CORE_TEMPLATE_DOCTRINE`) | `grep -n "CORE_TEMPLATE_DOCTRINE" -A10 .bkit/core/engine/commands/install/uninstall.ts`; `grep -rn "shortcuts" .bkit/core/engine/commands/install/uninstall.test.ts` | The list already carries the retired `.agents/shortcuts.md` path for 5.1.0–5.2.4 installs | EXTEND | Add the `.bkit/lite.md` retired entry so an un-upgraded 5.2.5–6.0.0 install has its managed block stripped too. |
| Preserve consumer lite content | `.bkit/core/engine/install/modules/core.ts` (migrateShortcutsToLite) | `grep -n "migrateShortcutsToLite" -A45 .bkit/core/engine/install/modules/core.ts`; same in `.bkit/core/engine/install/modules/core.integration.test.ts` | The existing migration already strips a managed block and appends consumer lines | EXTEND | Replace the two-file shortcut migration with one `migrateRetiredLite` that covers `.agents/shortcuts.md` and `.bkit/lite.md`, then delete the old function and its row. |
| Write the held line into the summary | `.bkit/core/engine/commands/workflow/summary.ts` | `grep -n "buildSummary" .bkit/core/engine/commands/workflow/summary.ts`; `grep -n "SummaryInput" .bkit/core/engine/commands/workflow/summary.ts`; `grep -n "Publish" .bkit/core/engine/commands/workflow/summary.ts` | `buildSummary` already emits the Plan-tasks and Challenge sections | EXTEND | Add `publish` to `SummaryInput` and the `Publish:` / `Docs:` lines in the build section. |
| Record the held ending and publish flag | `.bkit/core/engine/commands/workflow/workflows.ts` (closeWorkflow, CloseInput) | `grep -n "ending:" .bkit/core/engine/commands/workflow/workflows.ts`; `grep -n "CloseInput" .bkit/core/engine/commands/workflow/workflows.ts`; `grep -n "outcomeRow" .bkit/core/engine/commands/workflow/workflows.ts` | The close already builds `outcomeRow` and accepts per-workflow flags | EXTEND | Add `--ending` / `--publish`, write both onto the `workflow-done` and outcome rows, validate `held`. |
| Type the new close fields | `.bkit/core/engine/ledgers/status.ts` (`StatusEvent`) | `grep -n "workflow-done" -A4 .bkit/core/engine/ledgers/status.ts` | The `workflow-done` variant lists `workflow`, `at`, `parentSha` only | EXTEND | Add optional `ending` / `publish` so the emitted row and the canonical union agree. |
| Accept the new ending in telemetry | `.bkit/core/engine/ledgers/telemetry.ts` (OUTCOME_ENDINGS, RUN_ENDINGS, payload types, `validate`) | `grep -n "OUTCOME_ENDINGS" .bkit/core/engine/ledgers/telemetry.ts`; `grep -n "RUN_ENDINGS" .bkit/core/engine/ledgers/telemetry.ts`; `grep -n "outcome ending must be" .bkit/core/engine/ledgers/telemetry.ts`; `grep -n "ending" scripts/harvest/bkit-harvest.mjs` | The ending enums already hold `close-failed`, `failed`, `decision-pause`, `stopped`; the outcome message at line 1671 is hardcoded | EXTEND | Add `held` to both sets and unions, type `publish`, validate it as a boolean and build the message from `OUTCOME_ENDINGS`. |
| Derive the held ending from the run log | `scripts/harvest/bkit-harvest.mjs` (endingOf) | `grep -n "endingOf" -A30 scripts/harvest/bkit-harvest.mjs`; `grep -n "endings =" scripts/harvest/bkit-harvest.mjs` | endingOf already derives `done` / `close-failed` / `failed` / `decision-pause` / `stopped` | EXTEND | Return `held` when the run's `workflow-done` row carries `ending: held`; add the report column. |
| Branch the build ending | `.bkit/core/workflows/bkit-build.md` | `grep -n "Step 15 — Summary" .bkit/core/workflows/bkit-build.md`; `grep -n "Step 16 — Close" .bkit/core/workflows/bkit-build.md`; `grep -n "runtime assert" .bkit/core/workflows/bkit-build.md`; `grep -n "Open-PR probe ran" .bkit/core/workflows/bkit-build.md`; `grep -n "roadmap mirror" .bkit/core/workflows/bkit-build.md` | Steps 1, 2, 15 and 16 already sequence probe, push, PR and dispatch; Step 2 discards `runtime assert` stdout | EXTEND | Hold `publish` from `status route`; guard Steps 15/16 and Gate 15 on it; add the held close fence and final-return lines. |
| Record the roadmap row locally on the held close | `.bkit/core/workflows/bkit-build.md` (`roadmap feature`) | `grep -n "roadmap mirror" .bkit/core/workflows/bkit-build.md`; `grep -n "roadmap feature" .bkit/core/workflows/bkit-ship.md`; `grep -n "export function appendFeature" .bkit/core/engine/commands/workflow/roadmap.ts` | The close runs `roadmap mirror`, which appends then lands the row on `dev` through `pushToDev`; `roadmap feature --root --workflow --fid` appends and re-renders without pushing, and ship Step 6 already runs it | EXTEND | The held branch runs `roadmap feature --root="{WORKTREE_PATH}"`; `roadmap mirror` stays on the `publish=true` path. |
| Prove the held close and the deferred landing against real boundaries | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`, `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` | `grep -n "initFixture\|--bare\|landLine" .bkit/core/engine/audits/workflows/close-squash.integration.test.ts`; `grep -n "extractStep6Line\|spawnSync" .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts`; `grep -n "pr view\|gh pr\|exit 1" tests/fixtures/gh/bin/gh`; `grep -n '"pr",' .bkit/core/engine/commands/workflow/prs.ts` | `close-squash.integration.test.ts` already runs a shipped close line against a real repo, remote and worktree; `ship-verdict.integration.test.ts` already runs a shipped ship line against real fs and the built CLI; `tests/fixtures/gh` answers `pr view` and `gh api` only, and `prs.ts` also calls `pr list` / `create` / `merge` | EXTEND | Add a local-only feature branch option and the held-close cases to the close harness; add a recording `gh` shim beside the existing `stub` / `realBkit` helpers that delegates Actions calls to the fixture; no new test file. |
| Remove lite guidance from the rules and prompts | `.bkit/core/.agents/rules.md` | `grep -rn "lite" .bkit/core/.agents`; `grep -rn "lite" .bkit/core/prompts`; `grep -rn "lite" .bkit/core/.bkit` | The rules bullets already name every `next:*` label; each prompt already recommends `/bkit-build` or `/bkit-debug` | EXTEND | Rewrite each line to the plain labels and the full-workflow command; remove the lite doc reads. |
| Remove lite rows from the shipped reference docs | `.bkit/core/.bkit/README.md` | the same `grep -rn "lite" .bkit/core/.bkit` | The README's change row, tier tables and install-writes list name lite | EXTEND | Drop the lite rows; point the change row at `/bkit-plan` / `/bkit-build`. |
| Update the workflow, tracker and template reference docs | `.bkit/core/.bkit/workflows.md` | the same `grep -rn "lite" .bkit/core/.bkit` | The command table's build Output reads "PR to `dev`"; the tracker / template rows name `build:lite` | EXTEND | Add the held alternative to the build Output and remove the lite rows. |
| Update the change issue form | `.github/ISSUE_TEMPLATE/bkit-change.yml` | `grep -n "build:lite" .github/ISSUE_TEMPLATE/bkit-change.yml .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml` | Both copies name `build:lite` | EXTEND | Delete the lite line in both the repo copy and the shipped template. |
| Document the ending in the root README | `README.md` | `grep -ni "lite" README.md`; `grep -ni "lite" docs/roadmap.md`; `grep -ni "lite" docs/migrations.md` | The root README already documents each command and the three sign-offs | EXTEND | Replace the lite row and FAQ sentences with `/bkit-build #N` / `publish=false`; add the held handoff and the manual batch recipe (one head commit / last FID only; never batch migrations; the user owns push, PR, CI gate, sweep and docs sync). |
| Record the migration row and ledger rows | `docs/migrations.md` | `grep -n "^## Migrations" -A10 docs/migrations.md` | The migrations table already holds one row per migration; `bkit ledgers append` writes the decision / deferral rows | EXTEND | Replace the lite-moved row with the lite-retired row (both release ranges, uninstall behaviour); the 4 decision and 7 deferral rows are already appended. |
| Keep the instructions store current | `.bkit/instructions.md` (Clauses, Local Instructions) | `grep -n "tracker-next-labels" -A20 .bkit/instructions.md`; `grep -n "^## Local Instructions" -A2 .bkit/instructions.md`; `grep -n "lite" .bkit/instructions.md` | Clause texts (`tracker-next-labels`, `tracker-workflow-labels`, the `doc-local-section` carrier) and Local Instructions entries carry the lite wording; `pnpm instructions:sync` does not rewrite either | EXTEND | Hand-edit the clause `text` blocks (move the old text to `retired`), the lite carrier and the `bkit-build` / prompt local entries, then run `pnpm instructions:sync`. |
| Keep the ledger schema doc current | `.bkit/core/.bkit/jsonl.md` | `grep -n "ending" .bkit/core/.bkit/jsonl.md`; `grep -n "outcome\` \|" .bkit/core/.bkit/jsonl.md` | § Per-Kind Fields pins `outcome` and `run` `ending` to the current closed sets | EXTEND | Add `held` to both enum rows and `publish?:boolean` to `outcome`. |

## Architecture & Component Changes

Files grouped by area. No new file is created; every change extends an existing artifact or deletes a retired one.

**Ledger rows:** `715-lite-workflows-retired`, `715-build-publish-setting`, `541-shortcuts-inspiration-style-prompts`, `tracker-labels-debug-phase-next-labels`, `715-no-batch-publish-verb`, `715-build-docs-sync-stays-in-ship`, `715-build-verification-unchanged`, `715-debug-publish-mode-unchanged`, `715-tracker-label-definitions-unchanged`, `715-consumer-lite-content-migration`, `715-historical-audit-report-mentions`

### Database Migrations

None — no database. The install migration is a file migration in `core.ts`, recorded in `docs/migrations.md`.

### Config, CLI and checks

`settings.ts` gains a flat `buildPublish` block parsed beside `tasks`, with `remote` typed `true` and `local` a boolean; `invalidBuildPublish` reports the block-shape and `local` keys only. Advisory precedence is one finding per offending key, never two for one value: a non-object `publish` block → `bkit-build-publish-invalid` naming `build.publish` (nothing about `remote`, which is unreadable); a non-boolean `local` → `bkit-build-publish-invalid` naming `build.publish.local`; a set `remote !== true` → `bkit-build-publish-remote` naming `build.publish.remote`, and that key is never also reported as invalid. `repo info` prints both resolved values. `bkit status route --prompt-file` gains the routing field `publish`, so the token, config and runtime resolve in one command rather than in prose; its `--prompt-file` guard widens from `debug` only to `debug` and `build`, and it refuses (exit 4, `EXIT_ROUTE_MISSING`) rather than defaulting when the run has no `runtime-resolved` row. Install seeds `{remote: true, local: true}` merged beside the ask blocks, so an install that predates the key gets it and an explicit value survives.

#### [MODIFY] `.bkit/core/engine/shared/settings.ts`

- **Existence Check:** file exists; `BkitConfig` is flat (`tasks`, `asks`, `worktreeCopy`), `CONFIG_DEFAULTS`, `readBkitConfig`, `invalidTaskCaps` already there.
- Add `BuildPublish` (`{ remote: true; local: boolean }`) and `buildPublish: BuildPublish` to `BkitConfig`, `CONFIG_DEFAULTS.buildPublish`, parse in `readBkitConfig` from `record(record(workflows.build).publish)`, and export `invalidBuildPublish(raw: unknown): string[]` returning dotted keys for the block shape and `local` only (`build`, `build.publish`, `build.publish.local`). `remote` is never in that list: `detectBuildPublish` owns it, so one value cannot yield two findings. `remote` always resolves `true`; `local` defaults `true`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/repo.ts`

- **Existence Check:** file exists; the `repo info` verb emits `tasks`.
- Emit `buildPublishRemote: config.buildPublish.remote` and `buildPublishLocal: config.buildPublish.local`; add both to the command's `output` documentation.

#### [MODIFY] `.bkit/core/engine/commands/workflow/status.ts`

- **Existence Check:** file exists; `ROUTE_FIELDS`, `debugStart` and the `route` verb's `--prompt-file` handling are here.
- Add `publish` to `ROUTE_FIELDS`, extend the `route` verb's output (`publish`, `publishSource` = `token` | `local` | `remote` | `coerced`), and add a sibling `publishRoute(runs, promptText, config)` that reads the last `runtime-resolved` row's `runtime`, takes the first of `publish=true` / `publish=false` in the prompt, else `runtime === "LOCAL" ? buildPublish.local : buildPublish.remote`, and coerces a non-LOCAL `false` to `true`. A prompt value that matches neither token falls through to the config. With no `runtime-resolved` row it throws `CommandError(EXIT_ROUTE_MISSING, …)` naming build Step 2 instead of defaulting. Widen the `--prompt-file` guard from `--workflow=debug` to `debug` and `build`; the debug fields attach only for `debug`. The `--prompt-file` help and `output` contract name `publish` and `publishSource`.

#### [MODIFY] `.bkit/core/engine/checks/before/repo.ts`

- **Existence Check:** file exists; `detectInvalidTaskCaps` is the closest detector.
- Add `detectBuildPublish(cwd)` reading raw `bkit.workflows.build.publish` (via the existing `bkitWorkflows` helper) and returning `bkit-build-publish-remote` for a set `remote !== true` on an object block, else `bkit-build-publish-invalid` for a non-object block or a non-boolean `local`. One key yields one finding: `remote` is never reported as invalid, and a non-object block is never reported as remote. Action text names the exact key and the default, inline (no doc link).

#### [MODIFY] `.bkit/core/engine/checks/before/index.ts`

- **Existence Check:** file exists; `runPreflight` wires every advisory detector.
- Push the new finding into `advisories`; no blocker.

### Install payload and migration

One install transition retires the payload. In the same task, `migrateRetiredLite` replaces `migrateShortcutsToLite`, the canonical-docs entry disappears, and every migration case is rewritten against inline fixtures. That ordering is load-bearing: the docs loop writes canonical docs before the migration runs, and a half-step would re-add the managed block after the migration stripped it. `migrateRetiredLite` strips the managed block from a consumer's `.bkit/lite.md`, merges any `.agents/shortcuts.md` consumer lines (creating the destination when it is absent), writes a consumer-owned stub only when lines remain, deletes a file whose only content below `bkit:end` is the seeded `## Project Lite Workflows` heading, and records its writes for dry-run parity.

The stub opens with a fixed sentinel line, `<!-- bkit:retired-lite-stub -->`. On every later run the migration meets that stub again, and a file with the sentinel and no managed block is the "already retired" branch: it returns with no write and no log, so `bkit install`, `bkit upgrade` and `bkit check` stay silent and the second install records zero writes. A blockless or multi-block file without the sentinel is left byte-for-byte with a logged fix whose text no longer sends the consumer into a managed block this change removed. `migrateRetiredLite` does not gate on the package payload doc existing, so the migration keeps working after the source doc is deleted. The manifest entry, the source doc, its group-A audit row, the reference README tier rows and the doc-index row follow in the next task; `uninstall.ts` learns the retired path in the one after.

#### [DELETE] `.bkit/core/.bkit/lite.md`

- The five paste prompts and the lite doctrine are retired; full workflows are the only path. Consumer copies are not deleted while they hold consumer lines (see the migration).

#### [MODIFY] `.bkit/core/engine/install/manifest.ts`

- **Existence Check:** file exists; `.bkit/lite.md` is a `markered-text` core entry at line 149, and the comment at line 140 names it.
- Remove the entry and rewrite the line-140 comment to name `prompts.md` only.

#### [MODIFY] `.bkit/core/engine/install/modules/core.ts`

- **Existence Check:** file exists; `BKIT_CANONICAL_DOCS` lists `lite.md` at line 263; `migrateShortcutsToLite` is exported and called by `runBkitDocs` at line 305; `SEEDED_BKIT_DEFAULTS` spreads `...askBlocks()` into `workflows` at line 488.
- Remove `"lite.md"` from `BKIT_CANONICAL_DOCS`; replace `migrateShortcutsToLite` with `migrateRetiredLite(dryRun, ws, logPrefix)` (same call site) implementing the merge/stub/delete/log rules; remove the old function, its `RETIRED_SHORTCUTS_HEADING` seeding assumption and its describe block. Write the stub with a `RETIRED_LITE_STUB_SENTINEL = "<!-- bkit:retired-lite-stub -->"` first line, and when the destination has no single managed block: sentinel present → return with no write and no log; sentinel absent → warn with a message that does not reference `<!-- bkit:end -->`. Create the merge destination with `fs.writeFileSync` when `.bkit/lite.md` is absent, replacing the unconditional `fs.readFileSync(dst, "utf-8")` read at line 358. Do not gate the replacement on `getBkitDocsRoot()/lite.md` existing; exclude the seeded `## Project Lite Workflows` heading the way the old function excludes `## Project Shortcuts`. Seed `publish` as `build: { ...askBlocks().build, publish: { remote: true, local: true } }` so the ask blocks survive.

#### [DELETE] `migrateShortcutsToLite` in `.bkit/core/engine/install/modules/core.ts`

- Reason: `migrateRetiredLite` covers its input (`.agents/shortcuts.md`) and the retired `.bkit/lite.md` in one idempotent migration; the old function, its constants and its describe block are removed in Task 7.

#### [MODIFY] `.bkit/core/engine/commands/install/uninstall.ts`

- **Existence Check:** file exists; `CORE_TEMPLATE_DOCTRINE` lists the retired `.agents/shortcuts.md` path at line 381.
- Add `{ path: ".bkit/lite.md", format: "markered-text", module: "core" }` beside it, so `bkit uninstall` on an un-upgraded 5.2.5–6.0.0 install strips the managed block and keeps consumer lines.

#### [MODIFY] `.bkit/core/engine/commands/install/uninstall.test.ts`

- **Existence Check:** file exists; the doctrine table's cases live here.
- Add the retired `.bkit/lite.md` case: managed block stripped, consumer section kept.

#### [MODIFY] `.bkit/core/engine/install/modules/core.integration.test.ts`

- **Existence Check:** file exists; the canonical-docs `DOCS` list and the `migrateShortcutsToLite` describe block (`renderedLite()` reads the source doc at line 1143) are here.
- Remove `lite.md` from `DOCS`; rewrite the migration block against inline stub fixtures (consumer lines, empty, shortcuts merge, shortcuts merge with the destination absent, blockless, second run over the stub, idempotent, dry-run parity), dropping `renderedLite()` so no test reads the deleted source doc.

#### [MODIFY] `.bkit/core/engine/install/manifest.test.ts`

- **Existence Check:** file exists; it asserts the `.bkit/lite.md` entry today.
- Replace that assertion with one that the entry is absent and `prompts.md` is the only markered-text core doc.

#### [MODIFY] `.bkit/core/engine/audits/templates/templates.test.ts`

- **Existence Check:** file exists; `GROUP_A_MD_FILES` lists `[CORE_ROOT, ".bkit/lite.md"]`.
- Remove the entry; the managed-block audit then covers every remaining group-A doc.

#### [MODIFY] `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

- **Existence Check:** file exists.
- Add the 5.2.4-shaped upgrade case (managed `.bkit/lite.md` plus consumer lines) asserting the stub keeps the consumer section after `upgrade`.

#### [MODIFY] `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`

- **Existence Check:** file exists; `initFixture` builds a real repo, bare remote and `.worktrees/{FID}`, and pushes `feat/{FID}` at line 102; `landLine`, `runClose`, `remoteDev` and `expectBranchKept` are the helpers a new describe reuses.
- Add a `pushFeature?: boolean` option to `initFixture` (default `true`) so the held-close describe starts with a local-only `feat/{FID}`; add a `build` held-close describe that runs the shipped Step 15 summary line and the Step 16 held-close fence as written from `bkit-build.md` against that fixture, then asserts `origin/dev` and every remote ref are unchanged, `feat/{FID}` and the worktree remain, the lock file is gone, `status.jsonl` holds `ending: held` / `publish: false`, `build-summary.md` holds `Publish: held` and `Docs: not synced`, and `docs/roadmap.md` plus `.bkit/issues.jsonl` changed in the worktree only.

#### [MODIFY] `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts`

- **Existence Check:** file exists; `extractStep6Line` extracts one shipped `bkit` line from a named step; `stub` and `realBkit` write executable stand-ins into `tmpDir`. `tests/fixtures/gh/bin/gh` answers `pr view` (line 56) and `gh api` only, and exits 1 for every other call, so it cannot serve `pr list` (`prs.ts:114`), `pr create` (`:323`), `pr merge` (`:489`) or `pr edit` (`:1167`).
- Add `extractStepLine(stepHeading: RegExp, prefix: string)` beside `extractStep6Line`, and a `writeGhShim()` that writes `tmpDir/bin/gh` (mode `0o755`): it appends each argv to `tmpDir/gh-calls.jsonl`, answers `pr list --head <branch>` with `[]` before a create and the created PR after it, answers `pr create` by printing `https://github.com/{OWNER_REPO}/pull/1` as its last stdout line (`prs.ts:348` reads that line as the URL, then re-reads the PR by it), answers `pr view` with `{ number: 1, url, state, baseRefName: "dev", headRefName, headRefOid: <pushed head>, title, mergeCommit: null }` (`PR_FIELDS`), answers `pr merge` with exit 0 and flips the recorded state to `MERGED`, and execs `tests/fixtures/gh/bin/gh` for any `gh api …/actions/…` argv so `bkit runs gate` keeps its Actions fixtures. Prepend `tmpDir/bin` to `PATH` for the spawned lines.
- Add a deferred-landing describe that runs the Step 2 no-PR route (`prs probe --head=` exit 1 → `branches push --mode=plain --set-upstream` → `prs open`, `bkit-ship.md` lines 237-247), then Step 10's `runs gate` (`bkit-ship.md:537`) and `prs merge --match-head` (`:558`) lines. Assert the bare origin holds the branch at the gate head, the recorded `pr create` argv carries `--base dev` and `--head feat/{FID}`, and the recorded `pr merge` argv carries `--squash` and `--match-head-commit <gate head>`.

`.bkit/core/engine/commands/workflow/step-table.test.ts:349` uses `lite` only as a deliberately unknown workflow id in `resume("lite", …)`; it stays a valid unknown id after retirement, so the file is unchanged.

### Build workflow and telemetry

`bkit-build.md` holds `{PUBLISH}` from `bkit status route --prompt-file` after the runtime row is written, warns on a coerced remote run, guards Steps 15/16 and Gate 15, and adds the held close fence. Steps 1-2 always run again on resume, so the value is re-derived from the command on every run — never carried in a shell variable. On the held path the close appends the roadmap row with `roadmap feature --root="{WORKTREE_PATH}"` (no `dev` push) instead of `roadmap mirror`. `workflows summary` gains `--publish`; `workflows close` gains `--ending` / `--publish`; both rows and the telemetry enums carry `held`. Harvest derives the ending from the `workflow-done` row so the run report shows it.

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** file exists; Step 1 holds the caps, Step 2 sub-step 3 writes the runtime row then discards `runtime assert` stdout with `>/dev/null` (line 331), Step 15 probes and pushes (lines 827-848), Step 16 probes, closes, pushes, opens the PR and dispatches CI, Gate 15 (lines 853-859) lists "Open-PR probe ran" and "Summary commit pushed".
- Step 1: hold the caps (drop the `repo info` publish hold — `status route` resolves the value). Step 2 sub-step 3: after `runtime row`, run `"{BKIT}" status route --workflow=build --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md"` and hold `publish` as `{PUBLISH}` and `publishSource` as `{PUBLISH_SOURCE}` (drop the `>/dev/null` on `runtime assert` so the runtime prints for the narration; the route command is what resolves the value); a coerced value narrates the visible warning. Step 15: pass `--publish={PUBLISH}`; when false, skip the PR probe and `branches push` and mark Gate 15's probe/push lines "(publish=true only)". Step 16: when false, skip the probe / scan-diff / push / PR / dispatch, run `workflows close --ending=held --publish=false --record-step --message=… --number=16 --title="Built locally, not published" --final-return --line=…`, append the roadmap row with `roadmap feature --root="{WORKTREE_PATH}" --workflow=build --fid={FID}` (never `roadmap mirror`), release the lock, set the issue `In review`, post the "built locally, not published" comment, and run only the `build-close-workflow` gate — the Gate 16 block states which checklist lines apply; when true, keep the existing path with `roadmap mirror`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`

- **Existence Check:** file exists; `SummaryInput` and `buildSummary` are here.
- Add `publish?: boolean`; in the build section emit `Publish: held` when false and `Publish: pr` when true/absent (today's handoff text stays for true), plus `Docs: not synced (ship syncs on landing)` when false and nothing when true.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** file exists; `CloseInput`, `closeWorkflow`, `outcomeRow` and the `summary` / `close` command specs are here.
- Add `ending?: "done" | "held"` and `publish?: boolean` to `CloseInput`; flags `--ending` (validate `done` / `held`) and `--publish` (validate `true` / `false`); write both onto the `workflow-done` row and the outcome row (ending defaults `done`, publish absent when unset). Add `--publish` to the `summary` verb and thread it into `SummaryInput`.

#### [MODIFY] `.bkit/core/engine/ledgers/status.ts`

- **Existence Check:** file exists; `StatusEvent` types `workflow-done` as `{ type; workflow; at; parentSha? }` at line 57.
- Add optional `ending?: "done" | "held"` and `publish?: boolean` to that variant, so the emitted row and the canonical union agree.

#### [MODIFY] `.bkit/core/engine/ledgers/telemetry.ts`

- **Existence Check:** file exists; `OUTCOME_ENDINGS` (line 588), `RUN_ENDINGS` (line 783), `OutcomePayload`, `RunPayload`, `validate` and the per-run view are here; the outcome message at line 1671 is hardcoded.
- Add `"held"` to both sets and unions; declare `publish?: boolean` on `OutcomePayload`; validate it as a boolean when present; build the outcome message from `OUTCOME_ENDINGS`; show an `ending: held` row in the per-run view next to the existing `close-failed` row.

#### [MODIFY] `scripts/harvest/bkit-harvest.mjs`

- **Existence Check:** file exists; `endingOf` and the ending columns are here.
- Return `held` when the run's last `workflow-done` row carries `ending: "held"`; add `held` to the report's ending list and its legend.

#### [MODIFY] `.bkit/core/.bkit/jsonl.md` and `docs/observability.md`

- **Existence Check:** both exist; `jsonl.md` pins the `outcome` and `run` `ending` enums at lines 104 and 112; `observability.md` describes the run ending at line 225.
- Add `held` to both enums and `publish?:boolean` to `outcome`; state in both that a held run is a normal close with the branch kept and no CI.

`bkit stats` (`commands/stats.ts`, `commands/analysis.ts`) buckets every `outcome` row by `kind` in `computeCounts`, not by `ending`, so a held row counts exactly like a normal close and needs no code change; the recording the issue asks for is the outcome row above. Task 11 pins that with a `stats.test.ts` case, so the issue's `bkit stats` line is measured rather than assumed.

### Documentation

The retired surface is removed from every current doc, prompt and rule; the publish ending is documented in the root README, the reference README and the workflow reference.

#### [DELETE] `next:*:lite` label instruction in `.bkit/core/.agents/rules.md`

- **Existence Check:** the bullet exists in the shipped rules source.
- Reason: no lite workflow exists; the plain `next:*` labels replace it. Task 14 removes the matching lines from the audit, roadmap and tracker prompts too.

#### [DELETE] `build:lite` / `debug:lite` recommendations in the docs and prompts

- **Existence Check:** the strings exist in the root README, the reference docs, the audit / roadmap / tracker prompts and the change form.
- Reason: no lite workflow exists; the recommendations become `/bkit-build` / `/bkit-debug`. Task 14 removes every instance in the rules, prompts and reference docs; Task 15 removes the root README and roadmap ones.

#### [MODIFY] `README.md`

- **Existence Check:** file exists; the command table (line 97), "three sign-offs" (354), "run fewer steps" (413), the sign-off FAQ (443) and the documentation table (482) name lite workflows.
- Replace the lite row with `/bkit-build #N publish=false` (hold) beside the default `/bkit-build #N` row; rewrite the sign-off and FAQ sentences; remove the `.bkit/lite.md` documentation row; document the held handoff.
- Add the manual batch recipe the issue asks for (`#715` § No batch command): combine held builds, then land them yourself with `git` — with both known limitations stated (one head commit means post-merge auto-debug sees only the last FID; never batch migrations) and the user's ownership of the push, PR, CI gate, sweep and docs sync named.

#### [MODIFY] `.bkit/core/engine/commands/workflow/issues.test.ts`

- **Existence Check:** lines 233 and 239 use `next:plan:lite` as a fixture label in the "a new phase drops the old phase" case.
- Swap both to `next:plan`; the assertion keeps `remove: ["bkit:design", "next:plan", "bkit:failed"]` because a phase start drops every label starting with `NEXT_LABEL_PREFIX` (`issues.ts:241`), so no behaviour or expectation changes.

#### [MODIFY] `.bkit/core/.bkit/README.md`

- **Existence Check:** file exists; the change row (line 52), the Tier-1/Tier-2 table (244) and the install-writes list (279) name lite.
- Task 8 owns the tier rows: drop `lite.md` from the Tier-2 exception and the install-writes list. Task 14 owns the change row and the usage text: rewrite the change row to `/bkit-plan` or `/bkit-build` only and add the held build usage and its manual batch recipe.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** file exists; the command table's build Output reads "PR to `dev`".
- Change the build Output to "PR to `dev` (default) or held branch + worktree (`publish=false`)"; add the publish resolution to the contract notes.

#### [MODIFY] `.bkit/core/.bkit/trackers.md`

- **Existence Check:** file exists; the issue-shape table and the "build:lite checks nothing" line name lite.
- Rewrite the change row's command to `/bkit-plan #N` or `/bkit-build #N`; delete the lite note; remove `build:lite` / `debug:lite` from the audit next-step mapping.

#### [MODIFY] `.bkit/core/.bkit/templates.md`

- **Existence Check:** file exists; the change-form row and the plan-convert note name `build:lite`.
- Rewrite both to `/bkit-build #N` with no lite alternative.

#### [MODIFY] `.bkit/core/.bkit/authoring.md`

- **Existence Check:** file exists; the self-contained exception list names `.bkit/lite.md`.
- Remove `.bkit/lite.md` from the exception list.

#### [MODIFY] `.bkit/core/.agents/rules.md`

- **Existence Check:** file exists; the Tracker next labels and Tracker workflow labels bullets name `:lite` and "full or lite".
- Rewrite both bullets to the five plain labels; no `:lite` suffix; workflow labels only when a full workflow starts.

#### [MODIFY] `.bkit/core/.agents/docs.md`

- **Existence Check:** file exists; the index row for `.bkit/lite.md` is at line 30.
- Delete the row.

#### [MODIFY] `.bkit/core/prompts/bkit-audit-generate.md`

- **Existence Check:** file exists; its Rules block and `Next Step` mapping name lite workflows.
- Remove the `:lite` suffix rule and the `build:lite` / `debug:lite` branch; every change maps to `/bkit-build` or `/bkit-debug`.

#### [MODIFY] `.bkit/core/prompts/bkit-utility-update-roadmap.md`

- **Existence Check:** file exists; Step 11 and the output template recommend `<phase>:lite`.
- Remove the lite recommendation; recommend `/bkit-<phase>` only.

#### [MODIFY] `.bkit/core/prompts/bkit-utility-update-tracker.md`

- **Existence Check:** file exists; its Rules block, Read line and label step name lite.
- Remove the `:lite` suffix rule and the `.bkit/lite.md` read; label every issue with one plain `next:*` per shape.

#### [MODIFY] `.bkit/core/.bkit/prompts.md`

- **Existence Check:** file exists; the audit-generate and roadmap agent rows name lite workflows.
- Rewrite both rows to remove the lite recommendation.

#### [MODIFY] `.github/ISSUE_TEMPLATE/bkit-change.yml` and `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml`

- **Existence Check:** both files exist; line 14 names `build:lite`.
- Remove the lite line; the form names `/bkit-plan` and `/bkit-build` only.

#### [MODIFY] `docs/migrations.md`

- **Existence Check:** file exists; the `Migrations` table holds the "Lite workflows moved to `.bkit/lite.md`" row.
- Replace that row with one "Lite workflows retired" row: where (`core.ts` `migrateRetiredLite`; `uninstall.ts` `CORE_TEMPLATE_DOCTRINE`), what it rewrites (managed block stripped; shortcuts lines merged; stub kept; empty file deleted; blockless file left with a logged fix; uninstall strips the old file like any managed doc), releases (`.agents/shortcuts.md` 5.1.0–5.2.4; `.bkit/lite.md` 5.2.4–6.0.0), test (`core.integration.test.ts`; `upgrade.integration.test.ts`).

#### [MODIFY] `docs/roadmap.md`

- **Existence Check:** file exists; item 20 recommends `lite:build`.
- Rewrite it to `/bkit-build` for the label work.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** file exists; `## Clauses` holds `tracker-next-labels` (line 818) and `tracker-workflow-labels` (838) with lite wording, the `doc-local-section` carrier lists `lite` (line 5731), the authoring self-contained exception names `.bkit/lite.md` (line 6646), the `Next Step` clause names `build:lite` / `debug:lite` (line 7544), and the `bkit-build` Local Instructions entries carry the Step 15/16 lines. `pnpm instructions:sync` rewrites neither the clause texts nor the local entries.
- Hand-edit each clause's `text` block and move the old text under `retired`; drop the `lite` carrier and the `.bkit/lite.md` exception; rewrite the `Next Step` clause and the `bkit-build`, `bkit-audit-generate`, `bkit-utility-update-roadmap` and `bkit-utility-update-tracker` local entries; then run `pnpm instructions:sync`.

#### [MODIFY] `docs/decisions.jsonl` and `docs/deferrals.jsonl`

- **Existence Check:** files exist; the ledger rows are appended.
- Ledger rows are appended (see `**Ledger rows:**`).

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/core/.bkit/lite.md` (five paste prompts and the lite doctrine) | The five full workflows, with `/bkit-build` `publish` | DELETE | The prompts skip gates, worktree isolation, PR, CI and the audit trail; #650 / #705 removed the gap they filled. |
| `migrateShortcutsToLite` in `.bkit/core/engine/install/modules/core.ts` | `migrateRetiredLite` | DELETE | The destination doc is retired; the replacement covers both the old shortcuts file and the retired lite doc in one idempotent migration. |
| `next:*:lite` label instruction | Plain `next:*` labels | DELETE | The lite workflows no longer exist; a hint at one mis-routes the issue. Existing GitHub label definitions stay (out of scope). |
| `build:lite` / `debug:lite` recommendations in docs and prompts | `/bkit-build` / `/bkit-debug` | DELETE | Same reason: no lite workflow to run. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | None — no new gotcha beyond the migration behaviour already recorded in `docs/migrations.md`. |
| `docs/decisions.jsonl` | Four rows: supersede `541-shortcuts-inspiration-style-prompts` and `tracker-labels-debug-phase-next-labels`; record `715-build-publish-setting` and `715-lite-workflows-retired`. |
| `docs/deferrals.jsonl` | Seven `scope-declared` rows for this plan's `Exempt` items (batch verb, docs sync, build verification, debug, label definitions, consumer content, historical reports). |
| `docs/migrations.md` | Replace the lite-moved row with the lite-retired row (where, what, the stub sentinel, releases, test). |
| `docs/architecture.md` | None — no topology change. |
| `docs/technology.md` | None — no framework or convention change. |
| `docs/data-schema.md` | None — no database; the JSONL shape change is recorded under Data Schema Integration and in `telemetry.ts`. |
| `docs/testing.md` | None — the new tests use the existing Unit / Integration tiers and file names. |
| `docs/observability.md` | Record the new `ending: held` and optional `publish` on the close outcome row (and the `workflow-done` row that feeds harvest). |
| `.bkit/core/.bkit/jsonl.md` | Add `held` to the `outcome` and `run` `ending` enums; add `publish?:boolean` to `outcome`. |
| `docs/roadmap.md` | Rewrite item 20's `lite:build` to `/bkit-build`. |
| `README.md` | Remove the lite row and every lite reference; document `publish=false`, the held handoff, and the manual batch recipe (one head commit / last FID only; never batch migrations; the user owns push, PR, CI gate, sweep and docs sync). |
| `.bkit/core/.bkit/README.md` | Task 8 drops `lite.md` from the tier table and install-writes list; Task 14 rewrites the change row and adds the held build usage and the manual batch recipe. |
| `.bkit/core/.bkit/workflows.md` | Build Output gains the held alternative; add publish resolution to the contract notes. |
| `.bkit/core/.bkit/trackers.md` | Remove lite from issue shapes and the audit next-step mapping. |
| `.bkit/core/.bkit/templates.md` | Remove `build:lite` from the change-form row and the plan-convert note. |
| `.bkit/core/.bkit/authoring.md` | Drop `.bkit/lite.md` from the self-contained exception list. |
| `.bkit/core/.bkit/prompts.md` | Remove lite from the audit-generate and roadmap agent rows. |
| `.bkit/core/.agents/rules.md` | Plain `next:*` only; no `:lite` suffix; workflow labels for full workflows only. |
| `.bkit/core/.agents/docs.md` | Delete the `.bkit/lite.md` index row. |
| `.bkit/core/prompts/bkit-audit-generate.md`, `bkit-utility-update-roadmap.md`, `bkit-utility-update-tracker.md` | Remove every lite recommendation and `:lite` label rule. |
| `.github/ISSUE_TEMPLATE/bkit-change.yml`, `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml` | Delete the `build:lite` line. |
| `.bkit/instructions.md` | Hand-edit the clause texts and Local Instructions entries, then run `pnpm instructions:sync`; commit the diff. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | n/a — no database | Code-only. |
| **Code** | `git revert` the merge commit(s) | Restores the lite payload and the old manifest / migration in one step. A consumer who already upgraded keeps the stub (consumer-owned); the reverted install does not re-add the managed block, so no duplicate is possible. |
| **Risk window** | The window between a consumer's `bkit upgrade` and a rolled-back release | The migration is additive to consumer content only; no managed lite block survives, and a reverted release cannot recreate one over the stub. Ship the rollback as a normal release; a consumer's already-upgraded stub stays consumer-owned. |

## Agent Execution Runbook

Build order: config → runtime resolution → install → close row → build workflow → docs → mirrors. No task creates a file; every `CREATE` is absent by design.

<!-- bkit:group 1 start -->

### GROUP 1: Publish setting, repo info and advisories

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

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### GROUP 2: Runtime publish resolution and summary line

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Resolve `{PUBLISH}` in `bkit status route`
  - **UPDATE:** `ROUTE_FIELDS` in `.bkit/core/engine/commands/workflow/status.ts`: add `publish`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: add `publishRoute(runs, promptText, config)` reading the last `runtime-resolved` row's `runtime`, the prompt tokens `publish=true` / `publish=false`, else `LOCAL` → `buildPublish.local` and any other runtime → `buildPublish.remote`; a non-LOCAL `false` resolves `true`; a token matching neither value falls through to config; no runtime row throws `CommandError(EXIT_ROUTE_MISSING, …)` naming build Step 2
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: widen the `--prompt-file` guard to accept `--workflow=build` as well as `debug`, attaching the debug fields only for `debug`; the `route` verb's `output` block documents `publish` and `publishSource` (`token` | `local` | `remote` | `coerced`); `run` emits both
  - **UPDATE:** `dist/cli.js`: rebuilt by `pnpm build` and staged in the same commit
  - **READ:** `debugStart` in `.bkit/core/engine/commands/workflow/status.ts`: the prompt-token pattern the new resolver follows
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/status.test.ts` passes with the seven new cases; `pnpm build` succeeds and its `dist/` diff is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `lets the publish token override publish.local` fails when the config value wins
    - `.bkit/core/engine/commands/workflow/status.test.ts` `reads publish.local on LOCAL without a token` fails when the remote key is read instead
    - `.bkit/core/engine/commands/workflow/status.test.ts` `coerces publish false to true on a non-LOCAL runtime` fails when a cloud runtime resolves false
    - `.bkit/core/engine/commands/workflow/status.test.ts` `accepts --prompt-file with --workflow=build` fails on the debug-only usage error
    - `.bkit/core/engine/commands/workflow/status.test.ts` `ignores publish=maybe and falls through to config` fails when a malformed token is honoured
    - `.bkit/core/engine/commands/workflow/status.test.ts` `refuses publish without a runtime-resolved row` fails when it defaults instead of exiting 4
    - `.bkit/core/engine/commands/workflow/status.test.ts` `prints publishSource for token, local, remote and coerced` fails on a missing or constant source

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Write the `Publish:` and `Docs:` lines into the build summary
  - **UPDATE:** `SummaryInput` in `.bkit/core/engine/commands/workflow/summary.ts`: accept `publish?: boolean`
  - **UPDATE:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: emit `Publish: held` / `Publish: pr`, and `Docs: not synced (ship syncs on landing)` only when `publish` is false
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: the `summary` verb adds optional `--publish` and threads it into the input
  - **UPDATE:** `dist/cli.js`: rebuilt by `pnpm build` and staged in the same commit
  - **READ:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: the existing build section builder
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/summary.test.ts .bkit/core/engine/commands/workflow/workflows.test.ts` passes; `pnpm build` succeeds and its `dist/` diff is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `writes Publish: held when publish is false` fails on the line being absent
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `writes Publish: pr by default` fails on a held or absent line
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `writes Docs: not synced on a held summary` fails on the docs line being absent
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `keeps the verdict and next step unchanged by publish` fails when publish alters the verdict
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `passes publish into the summary input` fails when the flag is ignored

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### GROUP 3: Install seed and the retired-lite migration

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

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### GROUP 4: Lite payload removal and uninstall doctrine

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Delete the lite payload and prove the upgrade keeps consumer content
  - **DELETE:** `.bkit/core/.bkit/lite.md`: the retired lite payload and its five paste prompts
  - **UPDATE:** `.bkit/core/engine/install/manifest.ts`: remove the `.bkit/lite.md` entry and the line-140 comment naming it; keep `prompts.md` markered-text
  - **UPDATE:** `.bkit/core/engine/install/manifest.test.ts`: replace the lite-presence assertion with absence plus `prompts.md` as the only markered-text core doc
  - **UPDATE:** `GROUP_A_MD_FILES` in `.bkit/core/engine/audits/templates/templates.test.ts`: remove `[CORE_ROOT, ".bkit/lite.md"]`
  - **UPDATE:** `.bkit/core/engine/install/modules/core.integration.test.ts`: add the case that `migrateRetiredLite` still runs with the package `.bkit/core/.bkit/lite.md` absent
  - **UPDATE:** `.bkit/core/.bkit/README.md`: drop `lite.md` from the Tier-2 exception (line 244) and the install-writes list (line 279)
  - **UPDATE:** `.bkit/core/.agents/docs.md`: delete the `.bkit/lite.md` index row
  - **READ:** `GROUP_A_MD_FILES` in `.bkit/core/engine/audits/templates/templates.test.ts`: the source-format audit that would read the deleted file
  - **DEPENDS ON:** 7
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/install/modules/core.integration.test.ts .bkit/core/engine/install/manifest.test.ts` passes; `ls .bkit/core/.bkit/lite.md` fails
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates.test.ts` `audits every managed group-A doc without lite.md` fails while `lite.md` is enumerated
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrates with the package lite doc absent` fails when the migration gates on the payload doc
    - `.bkit/core/engine/install/manifest.test.ts` `no longer lists .bkit/lite.md and keeps prompts.md markered-text` fails while the entry remains or the branch breaks

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Teach `bkit uninstall` the retired lite path
  - **UPDATE:** `CORE_TEMPLATE_DOCTRINE` in `.bkit/core/engine/commands/install/uninstall.ts`: add `{ path: ".bkit/lite.md", format: "markered-text", module: "core" }` and correct the line-381 comment that mislabels the `.agents/shortcuts.md` entry
  - **UPDATE:** `.bkit/core/engine/commands/install/uninstall.test.ts`: add the retired `.bkit/lite.md` case (managed block stripped, consumer section kept)
  - **UPDATE:** `dist/cli.js`: rebuilt by `pnpm build` and staged in the same commit
  - **READ:** `CORE_TEMPLATE_DOCTRINE` in `.bkit/core/engine/commands/install/uninstall.ts`: the retired-path pattern it already applies to `.agents/shortcuts.md`
  - **DEPENDS ON:** 7
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/install/uninstall.test.ts` passes; `pnpm build` succeeds and its `dist/` diff is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/uninstall.test.ts` `strips a managed lite.md block and keeps the consumer section` fails while the retired path is unlisted

<!-- bkit:task 9 end -->

<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### GROUP 5: Close row, telemetry ending and stats view

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Record `ending: held` and `publish: false` on the close
  - **UPDATE:** `CloseInput` in `.bkit/core/engine/commands/workflow/workflows.ts`: add `ending?: "done" | "held"` and `publish?: boolean`
  - **UPDATE:** `closeWorkflow` in `.bkit/core/engine/commands/workflow/workflows.ts`: write both fields onto the `workflow-done` and outcome rows
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: the `close` command spec adds `--ending` and `--publish` with validation
  - **UPDATE:** `StatusEvent` in `.bkit/core/engine/ledgers/status.ts`: the `workflow-done` variant gains optional `ending` and `publish`
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: `OUTCOME_ENDINGS`, `RUN_ENDINGS`, `OutcomePayload` and `RunPayload` accept `held` and optional `publish`; `validate` rejects a non-boolean `publish`; the outcome message reads from `OUTCOME_ENDINGS`
  - **UPDATE:** `§ Per-Kind Fields` in `.bkit/core/.bkit/jsonl.md`: add `held` to both ending enums and `publish?:boolean` to `outcome`
  - **UPDATE:** `docs/observability.md`: record the `held` ending and the optional `publish` beside the existing run-ending text
  - **UPDATE:** `dist/cli.js`: rebuilt by `pnpm build` and staged in the same commit
  - **READ:** `outcomeRow` in `.bkit/core/engine/commands/workflow/workflows.ts`: the row object that gains the fields
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/ledgers/telemetry.test.ts` passes; `pnpm typecheck` and `pnpm build` pass with the `dist/` diff staged; a held close emits one `workflow-done` row with `ending: held`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `records ending held and publish false on the workflow-done row` fails on the row saying done
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `defaults the close row to ending done` fails when a normal close gains held
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `refuses an unknown ending` fails when any string is accepted
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `accepts held in outcome and run endings` fails when validation rejects it
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `keeps publish false on the outcome row` fails when the flag is dropped
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `rejects a non-boolean publish` fails when a string passes validation

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Derive and display the held ending in stats / harvest
  - **UPDATE:** `endingOf` in `scripts/harvest/bkit-harvest.mjs`: return `held` when the run's last `workflow-done` row carries `ending: "held"`
  - **UPDATE:** `scripts/harvest/bkit-harvest.mjs`: the ending list and legend add `held`
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: the per-run view shows an `ending: held` row
  - **UPDATE:** `.bkit/core/engine/commands/stats.test.ts`: add the case proving a held `outcome` row counts in the `outcome` kind total — `computeCounts` tallies `ev.kind` only, so `stats.ts` / `analysis.ts` need no code change
  - **UPDATE:** `dist/cli.js`: rebuilt by `pnpm build` and staged in the same commit
  - **READ:** `endingOf` in `scripts/harvest/bkit-harvest.mjs`: the existing end-row precedence
  - **READ:** `computeCounts` in `.bkit/core/engine/commands/analysis.ts`: the kind tally that needs no ending branch
  - **DEPENDS ON:** 10
  - **DONE WHEN:** `pnpm test:harvest`, `pnpm vitest run .bkit/core/engine/ledgers/telemetry.test.ts .bkit/core/engine/commands/stats.test.ts` pass; `pnpm build` succeeds and its `dist/` diff is staged; a held run appears under `held` in the report
  - **TEST FIRST:**
    - `scripts/harvest/bkit-harvest.test.mjs` `derives held from a workflow-done row ending held` fails on done or stopped
    - `scripts/harvest/bkit-harvest.test.mjs` `counts held runs in the workflow report` fails when the column is missing
    - `scripts/harvest/bkit-harvest.test.mjs` `keeps a normal done run as done` fails when every run reads held
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `shows an ending row for a held close` fails when the row is omitted
    - `.bkit/core/engine/commands/stats.test.ts` `counts a held outcome row in its kind total` fails when the held row is dropped or filed under a new kind

<!-- bkit:task 11 end -->

<!-- bkit:group 5 end -->

<!-- bkit:group 6 start -->

### GROUP 6: Build workflow branch and gates

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Branch `bkit-build.md` on the resolved publish ending
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Step 2 — Worktree Setup: after `runtime row`, run `status route --workflow=build --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md"` and hold `publish` as `{PUBLISH}` and `publishSource` as `{PUBLISH_SOURCE}`; drop the `>/dev/null` on `runtime assert`; narrate the visible coercion warning when `{PUBLISH_SOURCE}` = `coerced`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Step 15 — Summary: pass `--publish={PUBLISH}`; skip the PR probe and branch push when false; mark Gate 15's probe and push lines `(publish=true only)`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Step 16 — Close Workflow & Create PR: add the held close fence (skip the probe / scan-diff / push / PR / dispatch; close with `--ending=held --publish=false --record-step`, append the roadmap row with `roadmap feature --root="{WORKTREE_PATH}" --workflow=build --fid={FID}` and never `roadmap mirror`, release the lock, set the issue `In review`, post the "built locally, not published" comment, `build-close-workflow` gate only, held final message) and state in the Gate 16 block which checklist lines apply on each path
  - **UPDATE:** `.bkit/instructions.md`: retire the `bkit-build` Local Instructions entries whose text leaves the step and add the new publish lines
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerate with `pnpm vitest -u .bkit/core/engine/render/trackers.test.ts`
  - **READ:** `§ Prompts and Workflows` in `.bkit/authoring.md`: the workflow-editing rules this step obeys
  - **READ:** `§ Workflows Only` in `.bkit/authoring.md`: the workflow-only rules a `bkit-build.md` edit also obeys
  - **READ:** `.bkit/core/workflows/bkit-build.md`: the Resume contract clause that runs Steps 1-2 on every resume, and the Step 16 `roadmap mirror` line
  - **DEPENDS ON:** 4, 5, 10
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/tools/instructions-coverage.test.ts` passes; the reviewed `-u` baseline diff (part of `Verification Plan`) shows only the publish branch
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `resolves publish through status route` fails when Step 2 resolves it in prose
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `re-derives publish on resume` fails when `{PUBLISH}` is read from an earlier bash block
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `warns when a non-LOCAL run resolves publish false` fails when the coercion is silent
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `skips push, PR and CI on a held close` fails when the held branch still pushes
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `keeps the publish=true close path` fails when the PR path is removed
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `appends the held roadmap row without roadmap mirror` fails when the held path keeps `roadmap mirror`
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `makes Gate 15 conditional on the held path` fails while the probe/push lines stay unconditional
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `runs only the close gate on the held path` fails while Gate 16 names both gates
    - `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` fails on a stale baseline
    - `.bkit/core/engine/tools/instructions-coverage.test.ts` `every standing line has an entry` fails while a retired Step 15/16 line keeps its entry

<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** Verify the held ending and its deferred landing against real boundaries
  - **UPDATE:** `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`: add a `pushFeature?: boolean` option to `initFixture` (default `true`; the held case passes `false` so `feat/{FID}` is local-only before the close) and a `build` held-close describe that runs the shipped Step 15 summary line then the shipped Step 16 held-close fence as written
  - **UPDATE:** `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts`: add `extractStepLine(stepHeading, prefix)` beside `extractStep6Line` and a `writeGhShim()` that records every `gh` argv to `tmpDir/gh-calls.jsonl`, answers `pr list` / `pr create` / `pr view` / `pr merge` (a `pr create` prints the PR URL as its last stdout line; `pr view` returns `PR_FIELDS` with `baseRefName: "dev"`), and execs `tests/fixtures/gh/bin/gh` for `gh api …/actions/…`; prepend `tmpDir/bin` to `PATH`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts`: add the deferred-landing describe — Step 2's no-PR route, then Step 10's `runs gate` and `prs merge --match-head` lines, against a real bare origin
  - **READ:** `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`: `initFixture`, `landLine`, `runClose`, `remoteDev` and `expectBranchKept` the new describe reuses
  - **READ:** `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts`: `extractStep6Line`, `stub` and `realBkit`, the extraction and stand-in pattern the new helpers follow
  - **READ:** `tests/fixtures/gh/bin/gh`: the `pr view` handler at line 56 and the non-`gh api` exit 1 guard the shim must sit in front of
  - **DEPENDS ON:** 10, 12
  - **DONE WHEN:** `pnpm build && pnpm vitest run .bkit/core/engine/audits/workflows/close-squash.integration.test.ts .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` passes; each fixture sets `GIT_DIR` / `GIT_WORK_TREE` to its own temp repo and asserts `git --git-dir=<bare> for-each-ref` before and after; the recorded `gh-calls.jsonl` proves `pr create` ran with base `dev` and `pr merge` with `--match-head-commit`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` `held close leaves origin refs unchanged, keeps the branch and worktree, releases the lock` fails when any push, branch delete or lock remains
    - `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` `held close records the rows, summary and worktree-only roadmap row` fails when a row, the `Docs: not synced` line or the local-only roadmap row is missing
    - `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` `ship pushes the held branch and opens a dev PR` fails when the bare origin lacks the head or the recorded create names another base
    - `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` `ship gates on CI and merges the pinned head` fails when the recorded merge drops `--match-head-commit` or names another head

<!-- bkit:task 13 end -->

<!-- bkit:group 6 end -->

<!-- bkit:group 7 start -->

### GROUP 7: Guidance retirement

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** Remove lite guidance from the rules, prompts and reference docs
  - **UPDATE:** `.bkit/core/.agents/rules.md`: the Tracker next labels and Tracker workflow labels bullets name plain `next:*` only
  - **UPDATE:** `.bkit/core/prompts/bkit-audit-generate.md`: remove every lite recommendation and `:lite` rule
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-roadmap.md`: remove the lite recommendation
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-tracker.md`: remove the `:lite` rule and the `.bkit/lite.md` read
  - **UPDATE:** `.bkit/core/.bkit/trackers.md`: remove lite from the issue-shape table and the audit next-step mapping
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: remove `build:lite` from the change-form row and the plan-convert note
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: drop `.bkit/lite.md` from the self-contained exception list
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: remove lite from the audit-generate and roadmap agent rows
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: change the build Output to the held alternative and add the publish resolution to the contract notes
  - **UPDATE:** `.bkit/core/.bkit/README.md`: rewrite the change row (line 52) to `/bkit-plan` or `/bkit-build` only, and add the held build usage and the manual batch recipe beside the build commands
  - **UPDATE:** `.github/ISSUE_TEMPLATE/bkit-change.yml`: delete the `build:lite` line
  - **UPDATE:** `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml`: delete the `build:lite` line
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.test.ts`: swap the `next:plan:lite` fixture label at lines 233 and 239 for `next:plan`; the expected `remove` list and labels stay identical because a phase start drops every `next:*` label
  - **UPDATE:** `.bkit/instructions.md`: rewrite the `tracker-next-labels` / `tracker-workflow-labels` clause texts (old text under `retired`), drop the `lite` carrier and the `.bkit/lite.md` exception, rewrite the `Next Step` clause and the prompt local entries
  - **READ:** `§ Issue shapes` in `.bkit/core/.bkit/trackers.md`: the rows the prompts must keep naming
  - **DEPENDS ON:** 8, 9
  - **DONE WHEN:** `grep -rnE '(:lite|lite\.md|[Ll]ite workflows?)' .bkit/core/.agents .bkit/core/prompts .bkit/core/.bkit .github/ISSUE_TEMPLATE/bkit-change.yml .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml` returns nothing (the retired-lite stub heading is consumer-side, not in these sources); `grep -rn ':lite' .bkit/core/engine` returns nothing; `pnpm instructions:sync` leaves a clean diff; `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/tools/instructions-sources.test.ts .bkit/core/engine/tools/instructions.test.ts .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/commands/workflow/issues.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `no shipped prompt or workflow names a lite workflow` fails while `:lite` remains
    - `.bkit/core/engine/tools/instructions-sources.test.ts` `no shipped rule or prompt instructs a next:*:lite label` fails while the rule remains
    - `.bkit/core/engine/tools/instructions-sources.test.ts` `the clause store holds no lite text` fails while a clause `text` block keeps the suffix
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the change issue form names no lite workflow` fails while `build:lite` remains
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the shipped reference docs list no lite doc` fails while `lite.md` is listed

<!-- bkit:task 14 end -->

<!-- bkit:task 15 start -->

- [ ] **TASK 15:** Rewrite the root README and roadmap guidance; document the held handoff and the manual batch recipe
  - **UPDATE:** `README.md`: add the `/bkit-build #N publish=false` hold row beside the default `/bkit-build #N` row; rewrite the sign-off, "run fewer steps" and FAQ sentences; remove the `.bkit/lite.md` doc row; document the held handoff
  - **UPDATE:** `README.md`: add the manual batch recipe — build held, then land the batches yourself with `git` — stating both limitations (one head commit means post-merge auto-debug sees only the last FID; never batch migrations) and that the user owns the push, PR, CI gate, sweep and docs sync
  - **UPDATE:** `docs/roadmap.md`: rewrite item 20's `lite:build` to `/bkit-build`
  - **READ:** `§ Documentation` in `README.md`: the table that links `.bkit/lite.md`
  - **DEPENDS ON:** 14
  - **DONE WHEN:** `grep -niE '(:lite|lite\.md|[Ll]ite workflows?)' README.md docs/roadmap.md` returns nothing; `pnpm vitest run .bkit/core/engine/audits/templates/templates.test.ts` passes; the README carries a batch recipe section naming both limitations
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the root README points small changes at /bkit-build` fails while a lite link or command remains
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the root README carries the held handoff` fails while `Publish: held` / `Docs: not synced` are absent
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the root README carries the manual batch recipe with both limitations` fails while the recipe, the last-FID limitation or the no-batched-migrations rule is missing

<!-- bkit:task 15 end -->

<!-- bkit:group 7 end -->

<!-- bkit:group 8 start -->

### GROUP 8: Dist, dogfood mirrors and the gate

<!-- bkit:task 16 start -->

- [ ] **TASK 16:** Rebuild `dist/`, refresh the dogfood mirrors and run the gate
  - **UPDATE:** `dist/cli.js`: rebuilt by `pnpm build` and staged in the same commit as the engine changes
  - **UPDATE:** `.bkit/version`: refreshed by the repo's own install
  - **UPDATE:** `.bkit/lite.md`: deleted by `migrateRetiredLite` on the repo's own install (it has no consumer lines below `## Project Lite Workflows`)
  - **UPDATE:** `.bkit/jsonl.md`: refreshed by the repo's own install
  - **UPDATE:** `.agents/rules.md`: refreshed by the repo's own install, with the host mirrors
  - **READ:** `.bkit/core/.bkit/README.md`: the `pnpm build && node dist/cli.js install` dogfood command, and `validateModuleFlagsForVerb` in `.bkit/core/engine/cli.ts` for the required host flags
  - **DEPENDS ON:** 12, 13, 14, 15
  - **DONE WHEN:** `pnpm build` then `node dist/cli.js install --claude --cursor --codex --antigravity --opencode=openrouter` leaves `node dist/cli.js check` at exit 0 with no `DRIFT DETECTED` and 0 writes; a second identical install records 0 writes; `.bkit/lite.md` does not exist; `pnpm instructions:sync` leaves a clean diff; `pnpm bkit:gate:static-unit` and `pnpm bkit:gate:static-unit-integration` pass; `pnpm test:harvest` passes
  - **TEST FIRST:** n/a — dist and mirror regeneration plus the suite-wide gate; the behaviour tests live in Tasks 1-15

<!-- bkit:task 16 end -->

<!-- bkit:group 8 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** no `[NEW]` file was added; every `EXTEND` landed in its named artifact; no gate weakened.
- [ ] **Every task has a test or a TEST EXCEPTION:** every planned test recorded a red before its code and is unchanged since; test-order gaps cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 - Verified:** every box above checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test sits in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests fixed; full suite green (`pnpm vitest run`).
- [ ] **Sweep new tests:** every task's `DONE WHEN` tests exist and pass.
- [ ] **Verify observability:** the new `ending: held` / `publish` fields are written and readable; no new log line is needed.
- [ ] **Update documentation:** every `Documentation Updates` row done.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row done; `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** every box above checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (the deepest declared gate) after Task 16's `pnpm build` + flagged `bkit install`, and `pnpm bkit:gate:static-unit` + `node dist/cli.js check` (issue #715's two checks) both pass.
- [ ] **Test Synchronization:** `pnpm vitest -u .bkit/core/engine/render/trackers.test.ts` regenerates `bkit-build.none.txt` after the workflow edit; review the diff (only the publish branch).
- [ ] **Build Configuration:** no test-only file enters the production build; `tsc` already excludes test files per `tsconfig.json`.
- [ ] **Unit (`settings.test.ts`, `repo.test.ts`, `status.test.ts`, `checks/before/*`, `summary.test.ts`, `workflows.test.ts`, `telemetry.test.ts`, `stats.test.ts`, `manifest.test.ts`, `uninstall.test.ts`, `templates.test.ts`, `instructions-sources.test.ts`, `instructions-coverage.test.ts`, `workflow-shape.test.ts`, `issues.test.ts`):** new cases run green; no snapshot is accepted without review.
- [ ] **Integration (`core.integration.test.ts`, `upgrade.integration.test.ts`, `close-squash.integration.test.ts`, `ship-verdict.integration.test.ts`):** fresh install, upgrade from the 5.2.4 fixture, the migration cases, the held close and the deferred landing pass against real temp dirs, repos and remotes with no mocks; the GitHub surface of the landing runs through the test-local recording `gh` shim, which delegates `gh api …/actions/…` to `tests/fixtures/gh`.
- [ ] **Apply local migrations:** `pnpm build` then `node dist/cli.js install --claude --cursor --codex --antigravity --opencode=openrouter` in the repo regenerates `.claude/`, `.cursor/`, `.codex/`, `.agents/` and `.opencode/` mirrors, seeds `build.publish`, deletes the root `.bkit/lite.md` and refreshes `.bkit/version`; a second identical install records 0 writes and prints no manual-fix line; `pnpm instructions:sync` leaves a clean diff.
- [ ] **Run all tests:** `pnpm vitest run` (full suite, never scoped to the changed files) and `pnpm test:harvest` pass.
- [ ] **Dist freshness:** `pnpm build && git add dist/` in the same commit as the engine change; `pnpm bkit:check:dist` shows no drift.
- [ ] **Dogfood:** on a fresh scratch consumer, `bkit install --claude --opencode=openrouter` writes no `.bkit/lite.md`; on a fixture with a 5.2.4 `lite.md` plus consumer lines, `bkit upgrade` keeps the section in the stub and a second `bkit upgrade` over that stub is silent with 0 writes; `bkit uninstall` on that fixture leaves the consumer section and no managed block; `bkit repo info` prints `buildPublishRemote: true` and `buildPublishLocal: true`.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result, on-disk footprint).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** On this repo, run `/bkit-build 715-retire-lite-workflows publish=false` and confirm the final message starts `Publish: held`, nothing was pushed (`git status` shows the branch only local), the worktree and `feat/715-…` remain, and the issue is `In review` with the "built locally, not published" comment.
- [ ] **Step 2:** Run `/bkit-ship 715-retire-lite-workflows` from that held state and confirm it pushes the branch, opens the PR if none exists, gates on CI and merges.
- [ ] **Step 3:** With `bkit.workflows.build.publish.local: false` and no token, run `/bkit-build 715-retire-lite-workflows` and confirm it holds; then set `publish.remote: false` and run `bkit check` to see `bkit-build-publish-remote`.
- [ ] **Step 4:** On a clone of a 5.2.4 install, run `bkit upgrade` and confirm `.bkit/lite.md` keeps the consumer section under the retired heading and no managed block remains; run `bkit upgrade` again and confirm it prints no manual-fix line and writes nothing.

<!-- bkit:end -->
