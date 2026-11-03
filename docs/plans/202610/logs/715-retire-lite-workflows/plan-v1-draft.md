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

- `bkit install` and `bkit upgrade` leave no bkit-managed lite block, and consumer content below `bkit:end` in the old file is preserved.
- No current doc, prompt, workflow or label rule names a `<phase>:lite` workflow or a `next:*:lite` label. Historical ledgers, `CHANGELOG.md` and closed issues are exempt.
- Every "small change" recommendation in the shipped docs points at `/bkit-build #N`.
- `publish` defaults to `{ remote: true, local: true }`; `publish.local: false` holds; `publish.remote: false` is coerced to `true` with an advisory.
- A `publish=false` run: no push, no PR, no CI, worktree and branch kept, lock released, ending `held`, issue `In review` with the "built locally, not published" comment, summary `Publish: held` and `Docs: not synced`.

### Process Sketch

- **WHEN** a developer runs `/bkit-build 715-… publish=false` on a LOCAL runtime **→ THEN** the same plan-convert, execute, verify, gaps, holistic, challenge and test steps run, and the run ends `held` with nothing pushed.
- **WHEN** the same build ends held **→ THEN** the worktree and `feat/715-…` stay, the lock is released, the issue is `In review` with a "built locally, not published" comment, and `build-summary.md` reads `Publish: held`.
- **WHEN** a developer runs `/bkit-build 715-…` with no token and `publish.local` absent **→ THEN** `publish` resolves `true` and the run pushes, opens the PR and hands off to `/bkit-ship` exactly as today.
- **WHEN** a run resolves `publish=false` on a non-LOCAL runtime **→ THEN** it coerces to `true` and emits a visible warning rather than holding an ephemeral branch.
- **WHEN** a consumer with `publish.remote: false` runs `bkit check` **→ THEN** the `bkit-build-publish-remote` advisory tells them remote builds always publish a PR.
- **WHEN** an existing install carries `.bkit/lite.md` with its own lines below `bkit:end` **→ THEN** `bkit upgrade` strips the managed block, keeps those lines in a consumer-owned stub, and a fresh install writes no lite doc at all.

### Concrete Example

**Setup:** A developer on a laptop (`runtime` = `LOCAL`) with bkit 6.0.0 installed, `bkit.workflows.build.publish` absent from `package.json`, and issue #715 open. They want to build and test the change locally but land several small changes together later.

**Steps:**

1. Developer runs `/bkit-build 715-retire-lite-workflows publish=false` → `bkit repo info` prints `buildPublishRemote: true`, `buildPublishLocal: true`; `runtime assert` prints `runtime: LOCAL`; the run resolves `{PUBLISH} = false` from the token.
2. Build proceeds through worktree setup, plan convert, execute, verify, gaps remediation, holistic verify, challenge and run tests → every step records its row; no shortcut steps are taken.
3. Step 15 writes `build-summary.md` with `Publish: held` → the run skips the open-PR probe and the branch push.
4. Step 16 closes with `--ending=held --publish=false`, records the `workflow-done` row and the outcome row, releases the lock, sets the issue `In review`, and posts a "built locally, not published" comment.
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
| Held run with no open PR and no CI | Step 16 must not probe for a PR, must not push, and must not run `runs dispatch`; only the local close commit and lock release happen. |
| Held run's close gate | Gate 16 checks `build-close-workflow` only; `build-create-pr` has no row because no PR exists. |
| Consumer `.bkit/lite.md` with lines below `bkit:end` | The managed block is stripped; the consumer lines move under a retired-lite stub heading; the file is never deleted while it holds content. |
| Consumer `.bkit/lite.md` with no consumer lines | The file is deleted. |
| Consumer `.agents/shortcuts.md` still present (5.1.0–5.2.4 install) | Its consumer lines (minus `## Project Shortcuts`) merge into the stub; the old file is deleted. |
| `.bkit/lite.md` with no single managed block | Left byte-for-byte in place; install / upgrade logs the manual fix. |
| A consumer edits a lite prompt and expects it to keep working | The managed block is gone after upgrade; the full workflow is the only path, and the edit survives only as consumer prose in the stub. |
| `publish=true` run | Behaviour byte-identical to 6.0.0: probe, push `feat/{FID}`, open the PR, dispatch CI, hand off to `/bkit-ship`. |
| `/bkit-ship <ref>` on a held build | Ship pushes the branch, opens the PR if none exists, gates on CI and merges — the deferred guarantee. |

### Derived Test Matrix

`Type` = a tier from `docs/testing.md`. `Task` = the one runbook task whose `DONE WHEN` holds the test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Defaults `build.publish` to `{ remote: true, local: true }` when absent | Unit | `.bkit/core/engine/shared/settings.test.ts` | 1 |
| Reads an explicit `publish.local: false` without coercing it | Unit | `.bkit/core/engine/shared/settings.test.ts` | 1 |
| Coerces `publish.remote: false` to `true` and lists it as invalid | Unit | `.bkit/core/engine/shared/settings.test.ts` | 1 |
| Lists every invalid `build.publish` key (non-object block, non-boolean `local`, non-true `remote`) | Unit | `.bkit/core/engine/shared/settings.test.ts` | 1 |
| `repo info` prints `buildPublishRemote` and `buildPublishLocal` | Unit | `.bkit/core/engine/commands/workflow/repo.test.ts` | 2 |
| `repo info` prints the publish defaults when `package.json` omits the block | Unit | `.bkit/core/engine/commands/workflow/repo.test.ts` | 2 |
| `bkit check` reports `bkit-build-publish-remote` for a false `remote` | Unit | `.bkit/core/engine/checks/before/repo.test.ts` | 3 |
| `bkit check` reports `bkit-build-publish-invalid` for a non-boolean `local` | Unit | `.bkit/core/engine/checks/before/repo.test.ts` | 3 |
| `bkit check` stays quiet for a valid or absent `build.publish` | Unit | `.bkit/core/engine/checks/before/repo.test.ts` | 3 |
| `runPreflight` collects the publish advisories into `advisories` | Unit | `.bkit/core/engine/checks/before/index.test.ts` | 3 |
| Fresh install seeds `build.publish` with both keys true | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade keeps an existing `publish.local: false` and never overwrites it | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Seeding `publish` keeps the `build.verify` / `build.challenge` / `build.tests` ask blocks | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| The install manifest no longer lists `.bkit/lite.md` | Unit | `.bkit/core/engine/install/manifest.test.ts` | 5 |
| The manifest keeps `prompts.md` as the only markered-text core doc | Unit | `.bkit/core/engine/install/manifest.test.ts` | 5 |
| A fresh install writes no `.bkit/lite.md` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 5 |
| A fresh install still mirrors every other canonical doc | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 5 |
| The managed group-A doc list excludes `.bkit/lite.md` | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 5 |
| The migration strips the managed block and keeps consumer lines in a stub | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| The migration deletes `.bkit/lite.md` when it holds no consumer lines | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| The migration merges `.agents/shortcuts.md` consumer lines and deletes the old file | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| A blockless `.bkit/lite.md` is left byte-for-byte and the fix is logged | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| The migration is idempotent across a second install | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 6 |
| `bkit upgrade` from a 5.2.4 `lite.md` keeps the consumer section | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 6 |
| A held build's summary writes `Publish: held` | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 7 |
| A normal build's summary writes `Publish: pr` | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 7 |
| `publish` does not change the summary verdict or next-step command | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 7 |
| `workflows summary --publish=false` reaches `buildSummary` as `publish: false` | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 7 |
| A held close writes `ending: held` and `publish: false` on the `workflow-done` row | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 8 |
| A normal close still writes no `ending` override and no `publish` field | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 8 |
| An unknown `--ending` value is refused with a usage error | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 8 |
| Telemetry accepts `held` in `OUTCOME_ENDINGS` and `RUN_ENDINGS` | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 8 |
| The outcome row keeps `publish: false` | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 8 |
| Harvest derives `held` from a `workflow-done` row carrying `ending: held` | Unit | `scripts/harvest/bkit-harvest.test.mjs` | 9 |
| The harvest report counts a `held` run in its own column | Unit | `scripts/harvest/bkit-harvest.test.mjs` | 9 |
| Harvest keeps a normal `done` run as `done` | Unit | `scripts/harvest/bkit-harvest.test.mjs` | 9 |
| The per-run telemetry view shows an `ending: held` row | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 9 |
| `bkit-build.md` resolves publish from token → config → runtime, with the non-LOCAL coercion warning | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 10 |
| The held close skips the PR probe, branch push and CI dispatch and releases the lock | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 10 |
| The `publish=true` close path keeps probe, push, PR and CI dispatch | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 10 |
| Gate 16 checks `build-close-workflow` only on the held path | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 10 |
| The `bkit-build` none-render baseline matches after the publish branch | Unit | `.bkit/core/engine/render/trackers.test.ts` | 10 |
| No shipped prompt or workflow names a lite workflow | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 11 |
| No shipped rule or prompt instructs a `next:*:lite` label | Unit | `.bkit/core/engine/tools/instructions-sources.test.ts` | 11 |
| The change issue form names no lite workflow | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 11 |
| The shipped reference docs list no lite doc | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 11 |
| The root README points every small-change recommendation at `/bkit-build #N` and links no lite doc | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 12 |
| The root README carries the manual batch caveat and the held handoff | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 12 |
| Full static + unit + integration gate passes | Static | `pnpm bkit:gate:static-unit-integration` | 12 |
| `bkit check` passes on the repo after install | Static | `node dist/cli.js check` | 12 |

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
- **Assumption:** `readBkitConfig` is the only reader build's Step 1 uses for config values → if wrong, a second path could resolve a different `publish`; `repo info` is named as the single source in the plan and tested.
- **Assumption:** A consumer's `.bkit/lite.md` uses exactly one `bkit:start` / `bkit:end` block (install wrote it) → if a consumer hand-merged a second block, the migration leaves the file in place and logs the fix instead of guessing.
- **Assumption:** `publish=false` never needs to push the run's record to `dev`; the issue's close row and ending live in the worktree's `status.jsonl` → if wrong, `/bkit-ship` or a later debug run reads a stale `dev`; ship already tolerates a feature branch that is not on `dev`.
- **Assumption:** The close comment can carry the held wording without a new comment kind → if wrong, the issue gets the normal close comment plus a "built locally, not published" line; the wording is still visible.
- **Assumption:** Upgrade is the only path that must clean a consumer install → a fresh install cannot have `.bkit/lite.md`; the install test proves it.

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
| A `bkit builds --held` listing verb | `#715` § No batch command (manual recipe only) | Task 12 docs | Keep deferred — no consumer need yet |
| Retire the `.agents/shortcuts.md` migration entirely (5.1.0–5.2.4 is old) | `docs/migrations.md` § Migrations | Task 6 | Keep in the merged migration — the preserved lines still matter |
| `bkit plan --publish` for plan/design closes | `#715` § Out of scope | Task 10 workflow text | Keep deferred — design/plan always push their record |
| A `publish` value on `bkit status meta` for resume | `#715` § Resume is unchanged | Task 8, Task 10 | Keep deferred — the token is re-read on resume; no new state |

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. `publish` is read from a local `package.json`, the session token is plain text in the prompt, and the close comment copies fixed wording. The retired lite doc's consumer lines are preserved verbatim and never executed.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** no package added or removed; `package.json` and `pnpm-lock.yaml` stay in sync.
- [x] **Dependency Versions:** `pnpm bkit:deps:outdated` run 2026-10-28 — `vitest`/`@vitest/coverage-v8` 5.0.3 → 5.0.5, `oxlint` 1.87.0 → 1.89.0, `@types/node` 24.19.2 → 26.6.5, `vite` 6.4.4 → 8.3.4. None blocks this plan; no upgrade is bundled (major bumps are their own cycle). Node v24.16.0, pnpm 10.34.6, package `@cbartens/bkit@6.0.0`.
- [x] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`; every capability extends an existing file, no parallel implementation.
- [x] **User Context:** worktree, source, tests and docs are readable; no user information is missing (the two vocabulary questions are surfaced above with defaults).
- [x] **Project Context:** `docs/decisions.jsonl` rows for `541-shortcuts-inspiration-style-prompts` and `tracker-labels-debug-phase-next-labels` read and superseded; `docs/knowledge.jsonl` searched for `lite` / `manifest` (the rendered-mirror and install-dispatch gotchas apply); `docs/migrations.md`, `docs/testing.md`, `docs/capabilities.md` read.
- [x] **Testing & Quality:** tiers per `docs/testing.md` — Unit for pure config/parse/text checks, Integration for install and migration (real temp dirs, no mocks), Static for the gate; no E2E or @live behaviour exists in this repo.
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

- **ADD:** `OutcomePayload.publish?: boolean` (telemetry, optional; absent on every existing row).
- **MODIFY:** `OutcomePayload.ending` and `RunPayload.ending` gain `"held"`.
- **ADD:** `bkit.workflows.build.publish` (`{ remote: true, local: boolean }`) in `package.json`; seeded on install / upgrade when missing.
- No ledger data migration: older rows without `publish` normalise to absent, and readers already tolerate a missing optional field.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Read / validate `build.publish` | `.bkit/core/engine/shared/settings.ts` | `grep -n "tasks" .bkit/core/engine/shared/settings.ts`; `grep -n "askSettings" .bkit/core/engine/shared/settings.ts`; `grep -n "readBkitConfig" .bkit/core/engine/shared/settings.ts`; `grep -n "invalidTaskCaps" .bkit/core/engine/checks/before/repo.ts`; `docs/capabilities.md` searched for a config capability | `readBkitConfig`, `taskCaps`, `invalidTaskCaps` — cover every other `bkit.workflows` block | EXTEND | Add a `build.publish` block parsed beside `tasks` / `asks`; add `invalidBuildPublish` following `invalidTaskCaps`. |
| Print the resolved ending in `repo info` | `.bkit/core/engine/commands/workflow/repo.ts` | `grep -n "tasks" .bkit/core/engine/commands/workflow/repo.ts`; `grep -n "config.tasks" .bkit/core/engine/commands/workflow/repo.ts` | the `repo info` verb already prints `tasks` | EXTEND | Add `buildPublishRemote` / `buildPublishLocal` to the emitted object and the output contract. |
| Advisory for a refused remote value | `.bkit/core/engine/checks/before/repo.ts` | `grep -n "detectInvalidTaskCaps" -A45 .bkit/core/engine/checks/before/repo.ts`; `grep -n "advisories.push" .bkit/core/engine/checks/before/index.ts` | `detectInvalidTaskCaps`, `detectTaskCapFormStale` — the same raw-package.json detector shape | EXTEND | Add `detectBuildPublish` returning `bkit-build-publish-remote` / `bkit-build-publish-invalid`; wire it in `runPreflight`. |
| Seed the block on install / upgrade | `.bkit/core/engine/install/modules/core.ts` (SEEDED_BKIT_DEFAULTS, addMissingKeys) | `grep -n "SEEDED_BKIT_DEFAULTS" .bkit/core/engine/install/modules/core.ts`; `grep -n "addMissingKeys" .bkit/core/engine/install/modules/core.ts` | SEEDED_BKIT_DEFAULTS already seeds `tasks` and every ask block; addMissingKeys descends into an existing `build` block | EXTEND | Seed `publish` inside the existing `build` block; a present value is never touched. |
| Stop listing the lite doc in the manifest | `.bkit/core/engine/install/manifest.ts` | `grep -rn "lite.md" .bkit/core/engine/install` | One manifest entry for `.bkit/lite.md` | EXTEND | Remove the manifest entry; keep `prompts.md` as the only markered-text core doc. |
| Stop mirroring the lite doc in canonical docs | `.bkit/core/engine/install/modules/core.ts` (BKIT_CANONICAL_DOCS) | the same `grep -rn "lite.md" .bkit/core/engine/install` | One canonical-doc list entry | EXTEND | Remove `"lite.md"` from BKIT_CANONICAL_DOCS; the source doc moves to `[DELETE]`. |
| Preserve consumer lite content | `.bkit/core/engine/install/modules/core.ts` (migrateShortcutsToLite) | `grep -n "migrateShortcutsToLite" -A45 .bkit/core/engine/install/modules/core.ts`; same in `.bkit/core/engine/install/modules/core.integration.test.ts` | The existing migration already strips a managed block and appends consumer lines | EXTEND | Replace the two-file shortcut migration with one `migrateRetiredLite` that covers `.agents/shortcuts.md` and `.bkit/lite.md`, then delete the old function and its row. |
| Write the held line into the summary | `.bkit/core/engine/commands/workflow/summary.ts` | `grep -n "buildSummary" .bkit/core/engine/commands/workflow/summary.ts`; `grep -n "SummaryInput" .bkit/core/engine/commands/workflow/summary.ts`; `grep -n "Publish" .bkit/core/engine/commands/workflow/summary.ts` | `buildSummary` already emits the Plan-tasks and Challenge sections | EXTEND | Add `publish` to `SummaryInput` and a `Publish:` line in the build section. |
| Record the held ending and publish flag | `.bkit/core/engine/commands/workflow/workflows.ts` (closeWorkflow, CloseInput) | `grep -n "ending:" .bkit/core/engine/commands/workflow/workflows.ts`; `grep -n "CloseInput" .bkit/core/engine/commands/workflow/workflows.ts`; `grep -n "outcomeRow" .bkit/core/engine/commands/workflow/workflows.ts` | The close already builds `outcomeRow` and accepts per-workflow flags | EXTEND | Add `--ending` / `--publish`, write both onto the `workflow-done` and outcome rows, validate `held`. |
| Accept the new ending in telemetry | `.bkit/core/engine/ledgers/telemetry.ts` (OUTCOME_ENDINGS, RUN_ENDINGS, payload types) | `grep -n "OUTCOME_ENDINGS" .bkit/core/engine/ledgers/telemetry.ts`; `grep -n "RUN_ENDINGS" .bkit/core/engine/ledgers/telemetry.ts`; `grep -n "ending" scripts/harvest/bkit-harvest.mjs` | The ending enums already hold `close-failed`, `failed`, `decision-pause`, `stopped` | EXTEND | Add `held` to both sets and unions; show the ending row in the per-run view. |
| Derive the held ending from the run log | `scripts/harvest/bkit-harvest.mjs` (endingOf) | `grep -n "endingOf" -A30 scripts/harvest/bkit-harvest.mjs`; `grep -n "endings =" scripts/harvest/bkit-harvest.mjs` | endingOf already derives `done` / `close-failed` / `failed` / `decision-pause` / `stopped` | EXTEND | Return `held` when the run's `workflow-done` row carries `ending: held`; add the report column. |
| Branch the build ending | `.bkit/core/workflows/bkit-build.md` | `grep -n "Step 15 — Summary" .bkit/core/workflows/bkit-build.md`; `grep -n "Step 16 — Close" .bkit/core/workflows/bkit-build.md`; `grep -n "prs probe" .bkit/core/workflows/bkit-build.md`; `grep -n "branches push" .bkit/core/workflows/bkit-build.md`; `grep -n "runs dispatch" .bkit/core/workflows/bkit-build.md` | Steps 15 and 16 already sequence probe, push, PR and dispatch | EXTEND | Resolve `{PUBLISH}` after `runtime assert`; guard Steps 15/16 on it; add the held close fence and final-return lines. |
| Remove lite guidance from the rules and prompts | `.bkit/core/.agents/rules.md` | `grep -rn "lite" .bkit/core/.agents`; `grep -rn "lite" .bkit/core/prompts`; `grep -rn "lite" .bkit/core/.bkit` | The rules bullets already name every `next:*` label; each prompt already recommends `/bkit-build` or `/bkit-debug` | EXTEND | Rewrite each line to the plain labels and the full-workflow command; remove the lite doc reads. |
| Remove lite rows from the shipped reference docs | `.bkit/core/.bkit/README.md` | the same `grep -rn "lite" .bkit/core/.bkit` | The README's change row, tier tables and install-writes list name lite | EXTEND | Drop the lite rows; point the change row at `/bkit-plan` / `/bkit-build`. |
| Update the workflow, tracker and template reference docs | `.bkit/core/.bkit/workflows.md` | the same `grep -rn "lite" .bkit/core/.bkit` | The command table's build Output reads "PR to `dev`"; the tracker / template rows name `build:lite` | EXTEND | Add the held alternative to the build Output and remove the lite rows. |
| Update the change issue form | `.github/ISSUE_TEMPLATE/bkit-change.yml` | `grep -n "build:lite" .github/ISSUE_TEMPLATE/bkit-change.yml .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml` | Both copies name `build:lite` | EXTEND | Delete the lite line in both the repo copy and the shipped template. |
| Document the ending in the root README | `README.md` | `grep -n "lite" README.md`; `grep -n "lite" docs/roadmap.md`; `grep -n "lite" docs/migrations.md` | The root README already documents each command and the three sign-offs | EXTEND | Replace the lite row and FAQ sentences with `/bkit-build #N` / `publish=false`; add the held handoff and manual batch caveat. |
| Record the migration row and ledger rows | `docs/migrations.md` | `grep -n "^## Migrations" -A10 docs/migrations.md` | The migrations table already holds one row per migration; `bkit ledgers append` writes the decision / deferral rows | EXTEND | Replace the lite-moved row with the lite-retired row; the 4 decision and 7 deferral rows are already appended. |
| Keep the shipped rules index current | `.bkit/instructions.md` | `grep -n "instructions" package.json`; head of `.bkit/instructions.md` | `pnpm instructions:sync` already rewrites the generated copies | EXTEND | No hand edit: run `pnpm instructions:sync` after the rules / prompts change and commit the regenerated file. |

## Architecture & Component Changes

Files grouped by area. No new file is created; every change extends an existing artifact or deletes a retired one.

**Ledger rows:** `715-lite-workflows-retired`, `715-build-publish-setting`, `541-shortcuts-inspiration-style-prompts`, `tracker-labels-debug-phase-next-labels`, `715-no-batch-publish-verb`, `715-build-docs-sync-stays-in-ship`, `715-build-verification-unchanged`, `715-debug-publish-mode-unchanged`, `715-tracker-label-definitions-unchanged`, `715-consumer-lite-content-migration`, `715-historical-audit-report-mentions`

### Database Migrations

None — no database. The install migration is a file migration in `core.ts`, recorded in `docs/migrations.md`.

### Config, CLI and checks

`settings.ts` gains a `BuildPublish` block parsed beside `tasks`, with `remote` typed `true` and `local` a boolean; `invalidBuildPublish` reports every raw invalid key. `repo info` prints both resolved values. Two new advisories ride the existing preflight: `bkit-build-publish-remote` (remote present and not `true`) and `bkit-build-publish-invalid` (block not an object, or `local` not a boolean). Install seeds `{remote: true, local: true}` inside the existing `build` ask block, so an install that predates the key gets it and an explicit value survives.

#### [MODIFY] `.bkit/core/engine/shared/settings.ts`

- **Existence Check:** file exists; `CONFIG_DEFAULTS`, `readBkitConfig`, `invalidTaskCaps` already there.
- Add `BuildPublish` to `BkitConfig` (`build: { publish: { remote: true; local: boolean } }`), `CONFIG_DEFAULTS.build.publish`, parse in `readBkitConfig` from `record(record(workflows.build).publish)`, and export `invalidBuildPublish(raw: unknown): string[]` returning dotted keys (`build`, `build.publish`, `build.publish.remote`, `build.publish.local`). `remote` always resolves `true`; `local` defaults `true`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/repo.ts`

- **Existence Check:** file exists; the `repo info` verb emits `tasks`.
- Emit `buildPublishRemote: config.build.publish.remote` and `buildPublishLocal: config.build.publish.local`; add both to the command's `output` documentation.

#### [MODIFY] `.bkit/core/engine/checks/before/repo.ts`

- **Existence Check:** file exists; `detectInvalidTaskCaps` is the closest detector.
- Add `detectBuildPublish(cwd)` reading raw `bkit.workflows.build.publish` (via the existing `bkitWorkflows` helper) and returning `bkit-build-publish-remote` for a set `remote !== true`, else `bkit-build-publish-invalid` for a non-object block or a non-boolean `local`. Action text names the exact key and the default, inline (no doc link).

#### [MODIFY] `.bkit/core/engine/checks/before/index.ts`

- **Existence Check:** file exists; `runPreflight` wires every advisory detector.
- Push the new finding into `advisories`; no blocker.

### Install payload and migration

`.bkit/core/.bkit/lite.md` is deleted; its manifest entry, canonical-docs entry, README tier rows and doc-index row go with it. `migrateShortcutsToLite` is replaced by `migrateRetiredLite`, which strips the managed block from a consumer's `.bkit/lite.md`, merges any `.agents/shortcuts.md` consumer lines, writes a consumer-owned stub only when lines remain, deletes an empty file, leaves a blockless file untouched with a logged fix, and records its writes for dry-run parity.

#### [DELETE] `.bkit/core/.bkit/lite.md`

- The five paste prompts and the lite doctrine are retired; full workflows are the only path. Consumer copies are not deleted while they hold consumer lines (see the migration).

#### [MODIFY] `.bkit/core/engine/install/manifest.ts`

- **Existence Check:** file exists; `.bkit/lite.md` is a `markered-text` core entry at line 149.
- Remove the entry; keep `prompts.md` as the only markered-text core doc.

#### [MODIFY] `.bkit/core/engine/install/modules/core.ts`

- **Existence Check:** file exists; `BKIT_CANONICAL_DOCS` lists `lite.md`; `migrateShortcutsToLite` is exported and called by `runBkitDocs`.
- Remove `"lite.md"` from `BKIT_CANONICAL_DOCS`; replace `migrateShortcutsToLite` with `migrateRetiredLite(dryRun, ws, logPrefix)` (same call site) implementing the merge/stub/delete/log rules; remove the old function and its constants.

#### [DELETE] `migrateShortcutsToLite` in `.bkit/core/engine/install/modules/core.ts`

- Reason: `migrateRetiredLite` covers its input (`.agents/shortcuts.md`) and the retired `.bkit/lite.md` in one idempotent migration; the old function, its constants and its describe block are removed in Task 6.

#### [MODIFY] `.bkit/core/engine/install/modules/core.integration.test.ts`

- **Existence Check:** file exists; the canonical-docs `DOCS` list and the shortcuts-migration describe block are here.
- Remove `lite.md` from `DOCS`; rewrite the migration block against `.bkit/lite.md` fixtures (consumer lines, empty, shortcuts merge, blockless, idempotent, dry-run parity).

#### [MODIFY] `.bkit/core/engine/install/manifest.test.ts`

- **Existence Check:** file exists; it asserts the `.bkit/lite.md` entry today.
- Replace that assertion with one that the entry is absent and `prompts.md` is the only markered-text core doc.

#### [MODIFY] `.bkit/core/engine/audits/templates/templates.test.ts`

- **Existence Check:** file exists; `GROUP_A_MD_FILES` lists `[CORE_ROOT, ".bkit/lite.md"]`.
- Remove the entry; the managed-block audit then covers every remaining group-A doc.

#### [MODIFY] `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

- **Existence Check:** file exists.
- Add the 5.2.4-shaped upgrade case (managed `.bkit/lite.md` plus consumer lines) asserting the stub keeps the consumer section after `upgrade`.

### Build workflow and telemetry

`bkit-build.md` resolves `{PUBLISH}` once after `runtime assert`, warns on a coerced remote run, guards Steps 15/16, and adds the held close fence. `workflows summary` gains `--publish`; `workflows close` gains `--ending` / `--publish`; both rows and the telemetry enums carry `held`. Harvest derives the ending from the `workflow-done` row so the run report shows it.

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** file exists; Step 1 holds the caps, Step 2 records the runtime, Step 15 writes the summary and pushes, Step 16 probes, closes, pushes, opens the PR and dispatches CI.
- Step 1: also hold `buildPublishRemote` / `buildPublishLocal`; Step 2 sub-step 3: after `runtime assert`, hold `{RUNTIME}` and resolve `{PUBLISH}` = token (`publish=true` / `publish=false`, substring) → `RUNTIME` = `LOCAL` ? `publish.local` : `publish.remote`; a non-LOCAL `false` coerces to `true` with a visible warning. Step 15: pass `--publish={PUBLISH}`; skip the PR probe and `branches push` when false. Step 16: when false, skip the probe / scan-diff / roadmap mirror / push / dispatch, run `workflows close --ending=held --publish=false --record-step --message=… --number=16 --title="Built locally, not published" --final-return --line=…`, release the lock, set the issue `In review`, post the "built locally, not published" comment, and run only the `build-close-workflow` gate; when true, keep the existing path.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`

- **Existence Check:** file exists; `SummaryInput` and `buildSummary` are here.
- Add `publish?: boolean`; in the build section emit `Publish: held` when false and `Publish: pr` when true/absent (today's handoff text stays for true).

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** file exists; `CloseInput`, `closeWorkflow`, `outcomeRow` and the `summary` / `close` command specs are here.
- Add `ending?: "done" | "held"` and `publish?: boolean` to `CloseInput`; flags `--ending` (validate `done` / `held`) and `--publish` (validate `true` / `false`); write both onto the `workflow-done` row and the outcome row (ending defaults `done`, publish absent when unset). Add `--publish` to the `summary` verb and thread it into `SummaryInput`.

#### [MODIFY] `.bkit/core/engine/ledgers/telemetry.ts`

- **Existence Check:** file exists; `OUTCOME_ENDINGS`, `RUN_ENDINGS`, `OutcomePayload`, `RunPayload` and the per-run view are here.
- Add `"held"` to both sets and unions; declare `publish?: boolean` on `OutcomePayload`; show an `ending: held` row in the per-run view next to the existing `close-failed` row.

#### [MODIFY] `scripts/harvest/bkit-harvest.mjs`

- **Existence Check:** file exists; `endingOf` and the ending columns are here.
- Return `held` when the run's last `workflow-done` row carries `ending: "held"`; add `held` to the report's ending list and its legend.

### Documentation

The retired surface is removed from every current doc, prompt and rule; the publish ending is documented in the root README, the reference README and the workflow reference.

#### [DELETE] `next:*:lite` label instruction in `.bkit/core/.agents/rules.md`

- **Existence Check:** the bullet exists in the shipped rules source.
- Reason: no lite workflow exists; the plain `next:*` labels replace it. Task 11 removes the matching lines from the audit, roadmap and tracker prompts too.

#### [DELETE] `build:lite` / `debug:lite` recommendations in the docs and prompts

- **Existence Check:** the strings exist in the root README, the reference docs, the audit / roadmap / tracker prompts and the change form.
- Reason: no lite workflow exists; the recommendations become `/bkit-build` / `/bkit-debug`. Task 11 removes every instance.

#### [MODIFY] `README.md`

- **Existence Check:** file exists; the command table, "three sign-offs", "run fewer steps", FAQ and documentation table name lite workflows.
- Replace the lite row with `/bkit-build #N publish=false` (hold) and keep `/bkit-build #N` as the default; rewrite the sign-off and FAQ sentences; remove the `.bkit/lite.md` documentation row; document the manual batch caveat (one head commit, last FID only, do not batch migrations) and the held handoff.

#### [MODIFY] `.bkit/core/.bkit/README.md`

- **Existence Check:** file exists; the change row, Tier-1/Tier-2 table and install-writes list name lite.
- Rewrite the change row to `/bkit-plan` or `/bkit-build` only; drop `lite.md` from the Tier-2 exception and the install-writes list; add the held build usage and its manual batch caveat.

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
- Replace that row with one "Lite workflows retired" row: where (`core.ts` `migrateRetiredLite`), what it rewrites (managed block stripped; shortcuts lines merged; stub kept; empty file deleted; blockless file left with a logged fix), releases (5.1.0 and up), test (`core.integration.test.ts`; `upgrade.integration.test.ts`).

#### [MODIFY] `docs/roadmap.md`

- **Existence Check:** file exists; item 20 recommends `lite:build`.
- Rewrite it to `/bkit-build` for the label work.

#### [MODIFY] `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `.bkit/instructions.md`

- **Existence Check:** files exist; the ledger rows are appended and `instructions.md` is generated.
- Ledger rows are appended (see `**Ledger rows:**`); `pnpm instructions:sync` regenerates `.bkit/instructions.md` after the rules / prompts edits.

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
| `docs/migrations.md` | Replace the lite-moved row with the lite-retired row (where, what, releases, test). |
| `docs/architecture.md` | None — no topology change. |
| `docs/technology.md` | None — no framework or convention change. |
| `docs/data-schema.md` | None — no database; the JSONL shape change is recorded under Data Schema Integration and in `telemetry.ts`. |
| `docs/testing.md` | None — the new tests use the existing Unit / Integration / Static tiers and file names. |
| `docs/observability.md` | Record the new `ending: held` and optional `publish` on the close outcome row (and the `workflow-done` row that feeds harvest). |
| `docs/roadmap.md` | Rewrite item 20's `lite:build` to `/bkit-build`. |
| `README.md` | Remove the lite row and every lite reference; document `publish=false`, the held handoff, and the manual batch caveat. |
| `.bkit/core/.bkit/README.md` | Rewrite the change row and install-writes tables; add held build usage and the batch caveat. |
| `.bkit/core/.bkit/workflows.md` | Build Output gains the held alternative; add publish resolution to the contract notes. |
| `.bkit/core/.bkit/trackers.md` | Remove lite from issue shapes and the audit next-step mapping. |
| `.bkit/core/.bkit/templates.md` | Remove `build:lite` from the change-form row and the plan-convert note. |
| `.bkit/core/.bkit/authoring.md` | Drop `.bkit/lite.md` from the self-contained exception list. |
| `.bkit/core/.bkit/prompts.md` | Remove lite from the audit-generate and roadmap agent rows. |
| `.bkit/core/.agents/rules.md` | Plain `next:*` only; no `:lite` suffix; workflow labels for full workflows only. |
| `.bkit/core/.agents/docs.md` | Delete the `.bkit/lite.md` index row. |
| `.bkit/core/prompts/bkit-audit-generate.md`, `bkit-utility-update-roadmap.md`, `bkit-utility-update-tracker.md` | Remove every lite recommendation and `:lite` label rule. |
| `.github/ISSUE_TEMPLATE/bkit-change.yml`, `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml` | Delete the `build:lite` line. |
| `.bkit/instructions.md` | Regenerate with `pnpm instructions:sync`; commit the generated diff. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | n/a — no database | Code-only. |
| **Code** | `git revert` the merge commit(s) | Restores the lite payload and the old manifest / migration in one step. A consumer who already upgraded keeps the stub (consumer-owned); the reverted install does not re-add the managed block, so no duplicate is possible. |
| **Risk window** | The window between a consumer's `bkit upgrade` and a rolled-back release | The migration is additive to consumer content only; no managed lite block survives, and a reverted release cannot recreate one over the stub. Ship the rollback as a normal release; a consumer's already-upgraded stub stays consumer-owned. |

## Agent Execution Runbook

Build order: config → install → build workflow → docs. No task creates a file; every `CREATE` is absent by design.

<!-- bkit:group 1 start -->

### GROUP 1: Publish setting, repo info and advisories

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Parse and validate `bkit.workflows.build.publish` in settings
  - **UPDATE:** `BkitConfig` in `.bkit/core/engine/shared/settings.ts`: add `build: { publish: { remote: true; local: boolean } }`
  - **UPDATE:** `CONFIG_DEFAULTS` in `.bkit/core/engine/shared/settings.ts`: `build.publish` = `{ remote: true, local: true }`
  - **UPDATE:** `readBkitConfig` in `.bkit/core/engine/shared/settings.ts`: parse `workflows.build.publish`; `remote` resolves `true`; `local` accepts only a boolean
  - **UPDATE:** `invalidTaskCaps` in `.bkit/core/engine/shared/settings.ts`: add sibling `invalidBuildPublish` returning `build`, `build.publish`, `build.publish.remote`, `build.publish.local`
  - **READ:** `record` in `.bkit/core/engine/shared/settings.ts`: the object guard the parser uses
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/shared/settings.test.ts` passes with the four new cases; `invalidBuildPublish` is exported
  - **TEST FIRST:**
    - `.bkit/core/engine/shared/settings.test.ts` `defaults build.publish to true` fails on a false or missing `local` / `remote` default
    - `.bkit/core/engine/shared/settings.test.ts` `reads an explicit publish.local false` fails on `false` being coerced to `true`
    - `.bkit/core/engine/shared/settings.test.ts` `coerces publish.remote false to true` fails on `remote` returning `false`
    - `.bkit/core/engine/shared/settings.test.ts` `lists every invalid build.publish key` fails on an invalid key being silently accepted

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Print the resolved publish values from `repo info`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/repo.ts`: the `repo info` verb emits `buildPublishRemote` and `buildPublishLocal`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/repo.ts`: document both keys in the command's `output` block
  - **READ:** `config.tasks` in `.bkit/core/engine/commands/workflow/repo.ts`: the pattern for printing a `bkit.workflows` block
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/repo.test.ts` passes; `node dist/cli.js repo info` prints both keys
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/repo.test.ts` `prints buildPublishRemote and buildPublishLocal` fails on either key being absent
    - `.bkit/core/engine/commands/workflow/repo.test.ts` `prints the publish defaults when package.json omits them` fails on `null` or a missing key

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Report the two publish advisories from `bkit check`
  - **UPDATE:** `detectInvalidTaskCaps` in `.bkit/core/engine/checks/before/repo.ts`: add `detectBuildPublish` beside it, reading raw `bkit.workflows.build.publish`
  - **UPDATE:** `runPreflight` in `.bkit/core/engine/checks/before/index.ts`: push the new finding into `advisories`
  - **READ:** `bkitWorkflows` in `.bkit/core/engine/checks/before/repo.ts`: the raw-package.json helper
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/checks/before/repo.test.ts .bkit/core/engine/checks/before/index.test.ts` passes with the three detector cases and the wiring case
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/before/repo.test.ts` `reports bkit-build-publish-remote for publish.remote false` fails on no advisory
    - `.bkit/core/engine/checks/before/repo.test.ts` `reports bkit-build-publish-invalid for a non-boolean publish.local` fails on silence
    - `.bkit/core/engine/checks/before/repo.test.ts` `stays quiet for a valid or absent build.publish` fails on a false finding
    - `.bkit/core/engine/checks/before/index.test.ts` `collects build publish advisories into advisories` fails when the detector is not wired

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### GROUP 2: Install seed and lite payload retirement

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Seed `build.publish` on install and upgrade
  - **UPDATE:** `SEEDED_BKIT_DEFAULTS` in `.bkit/core/engine/install/modules/core.ts`: add `publish` inside the existing `build` block, keeping the ask blocks
  - **READ:** `addMissingKeys` in `.bkit/core/engine/install/modules/core.ts`: the descent rule that preserves an existing value
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/install/modules/core.integration.test.ts` passes with the three seed cases
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `seeds build.publish on install` fails on the key being absent
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `keeps an existing publish.local false on upgrade` fails when the value is overwritten
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `seeds publish without dropping the ask blocks` fails when `build.verify` / `build.challenge` / `build.tests` disappear

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Remove the lite doc from the shipped payload
  - **DELETE:** `.bkit/core/.bkit/lite.md`: the retired lite payload and its five paste prompts
  - **UPDATE:** `.bkit/core/engine/install/manifest.ts`: remove the `.bkit/lite.md` entry; keep `prompts.md` markered-text
  - **UPDATE:** `BKIT_CANONICAL_DOCS` in `.bkit/core/engine/install/modules/core.ts`: remove `"lite.md"`
  - **UPDATE:** `DOCS` in `.bkit/core/engine/install/modules/core.integration.test.ts`: remove `"lite.md"`
  - **UPDATE:** `GROUP_A_MD_FILES` in `.bkit/core/engine/audits/templates/templates.test.ts`: remove `[CORE_ROOT, ".bkit/lite.md"]`
  - **UPDATE:** `.bkit/core/engine/install/manifest.test.ts`: replace the lite-presence assertion with absence + `prompts.md` markered-text
  - **UPDATE:** `.bkit/core/.bkit/README.md`: drop `lite.md` from the Tier-1/Tier-2 tables and the install-writes list
  - **UPDATE:** `.bkit/core/.agents/docs.md`: delete the `.bkit/lite.md` index row
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/install/manifest.test.ts .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/install/modules/core.integration.test.ts` passes; `ls .bkit/core/.bkit/lite.md` fails
  - **TEST FIRST:**
    - `.bkit/core/engine/install/manifest.test.ts` `no longer lists .bkit/lite.md` fails while the entry remains
    - `.bkit/core/engine/install/manifest.test.ts` `keeps prompts.md markered-text` fails when the markered-text branch is broken
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `installs no .bkit/lite.md` fails when the file is written
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `mirrors every other canonical doc` fails when one doc is dropped
    - `.bkit/core/engine/audits/templates/templates.test.ts` `audits every managed group-A doc without lite.md` fails while `lite.md` is enumerated

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Replace the shortcuts migration with `migrateRetiredLite`
  - **UPDATE:** `migrateShortcutsToLite` in `.bkit/core/engine/install/modules/core.ts`: replace with `migrateRetiredLite`, same call site, covering `.agents/shortcuts.md` and `.bkit/lite.md`
  - **UPDATE:** `docs/migrations.md`: replace the lite-moved row with the lite-retired row
  - **UPDATE:** `.bkit/core/engine/install/modules/core.integration.test.ts`: rewrite the shortcuts-migration block for the new migration (stub, empty delete, shortcuts merge, blockless, idempotent, dry-run parity)
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: add the 5.2.4-shaped upgrade case
  - **READ:** `migrateShortcutsToLite` in `.bkit/core/engine/install/modules/core.ts`: the managed-block extraction and append it already performs
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/install/modules/core.integration.test.ts .bkit/core/engine/commands/install/upgrade.integration.test.ts` passes; a second install writes nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `strips the managed block and keeps consumer lines` fails when the consumer lines are lost
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `deletes .bkit/lite.md when it holds no consumer lines` fails on an empty stub remaining
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `merges .agents/shortcuts.md consumer lines into the stub` fails when the old lines are dropped
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves a blockless lite.md untouched and logs` fails when the file is rewritten or deleted
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `is idempotent across a second install` fails on a second recorded write
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade from a 5.2.4 lite.md keeps the consumer section` fails when the section is lost

<!-- bkit:task 6 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### GROUP 3: Summary, close row and telemetry ending

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Write the `Publish:` line into the build summary
  - **UPDATE:** `SummaryInput` in `.bkit/core/engine/commands/workflow/summary.ts`: accept `publish?: boolean`
  - **UPDATE:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: emit `Publish: held` / `Publish: pr`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: the `summary` verb adds optional `--publish` and threads it into the input
  - **READ:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: the existing build section builder
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/summary.test.ts .bkit/core/engine/commands/workflow/workflows.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `writes Publish: held when publish is false` fails on the line being absent
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `writes Publish: pr by default` fails on a held or absent line
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `keeps the verdict and next step unchanged by publish` fails when publish alters the verdict
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `passes publish into the summary input` fails when the flag is ignored

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Record `ending: held` and `publish: false` on the close
  - **UPDATE:** `CloseInput` in `.bkit/core/engine/commands/workflow/workflows.ts`: add `ending?: "done" | "held"` and `publish?: boolean`
  - **UPDATE:** `closeWorkflow` in `.bkit/core/engine/commands/workflow/workflows.ts`: write both fields onto the `workflow-done` and outcome rows
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: the `close` command spec adds `--ending` and `--publish` with validation
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: `OUTCOME_ENDINGS`, `RUN_ENDINGS`, `OutcomePayload` and `RunPayload` accept `held` and optional `publish`
  - **READ:** `outcomeRow` in `.bkit/core/engine/commands/workflow/workflows.ts`: the row object that gains the fields
  - **DEPENDS ON:** 7
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/ledgers/telemetry.test.ts` passes; a held close emits one `workflow-done` row with `ending: held`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `records ending held and publish false on the workflow-done row` fails on the row saying done
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `defaults the close row to ending done` fails when a normal close gains held
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `refuses an unknown ending` fails when any string is accepted
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `accepts held in outcome and run endings` fails when validation rejects it
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `keeps publish false on the outcome row` fails when the flag is dropped

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Derive and display the held ending in stats / harvest
  - **UPDATE:** `endingOf` in `scripts/harvest/bkit-harvest.mjs`: return `held` when the run's last `workflow-done` row carries `ending: "held"`
  - **UPDATE:** `scripts/harvest/bkit-harvest.mjs`: the ending list and legend add `held`
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: the per-run view shows an `ending: held` row
  - **READ:** `endingOf` in `scripts/harvest/bkit-harvest.mjs`: the existing end-row precedence
  - **DEPENDS ON:** 8
  - **DONE WHEN:** `pnpm test:harvest` and `pnpm vitest run .bkit/core/engine/ledgers/telemetry.test.ts` pass; a held run appears under `held` in the report
  - **TEST FIRST:**
    - `scripts/harvest/bkit-harvest.test.mjs` `derives held from a workflow-done row ending held` fails on done or stopped
    - `scripts/harvest/bkit-harvest.test.mjs` `counts held runs in the workflow report` fails when the column is missing
    - `scripts/harvest/bkit-harvest.test.mjs` `keeps a normal done run as done` fails when every run reads held
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `shows an ending row for a held close` fails when the row is omitted

<!-- bkit:task 9 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### GROUP 4: Build workflow branch and guidance

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Branch `bkit-build.md` on the resolved publish ending
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Step 1 — Start Workflow: hold `buildPublishRemote` / `buildPublishLocal`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Step 2 — Worktree Setup: after `runtime assert`, hold `{RUNTIME}` and resolve `{PUBLISH}` (token → config → runtime), warning on a coerced non-LOCAL `false`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Step 15 — Summary: pass `--publish={PUBLISH}`; skip the PR probe and branch push when false
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Step 16 — Close Workflow & Create PR: add the held close fence (skip the probe / scan-diff / roadmap mirror / push / dispatch; close with `--ending=held --publish=false --record-step`, release the lock, set the issue `In review`, post the "built locally, not published" comment, `build-close-workflow` gate only, held final message) and keep the publish=true path
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerate with `pnpm vitest -u .bkit/core/engine/render/trackers.test.ts`
  - **DEPENDS ON:** 7, 8
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/render/trackers.test.ts` passes; the none baseline matches after `-u`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `resolves publish from the token, config and runtime` fails when the resolution block is absent
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `skips push, PR and CI on a held close` fails when the held branch still pushes
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `keeps the publish=true close path` fails when the PR path is removed
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `warns when a non-LOCAL run resolves publish false` fails when the coercion is silent
    - `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` fails on a stale baseline

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Remove lite guidance from the shipped rules, prompts and reference docs
  - **UPDATE:** `.bkit/core/.agents/rules.md`: the Tracker next labels and Tracker workflow labels bullets name plain `next:*` only
  - **UPDATE:** `.bkit/core/.agents/docs.md`: delete the `.bkit/lite.md` index row
  - **UPDATE:** `.bkit/core/prompts/bkit-audit-generate.md`: remove every lite recommendation and `:lite` rule
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-roadmap.md`: remove the lite recommendation
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-tracker.md`: remove the `:lite` rule and the `.bkit/lite.md` read
  - **UPDATE:** `.bkit/core/.bkit/trackers.md`: remove lite from the issue-shape table and the audit next-step mapping
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: remove `build:lite` from the change-form row and the plan-convert note
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: drop `.bkit/lite.md` from the self-contained exception list
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: remove lite from the audit-generate and roadmap agent rows
  - **UPDATE:** `.bkit/core/.bkit/README.md`: drop lite from the change row, the tier tables and the install-writes list
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: change the build Output to the held alternative and add the publish resolution
  - **UPDATE:** `.github/ISSUE_TEMPLATE/bkit-change.yml`: delete the `build:lite` line
  - **UPDATE:** `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml`: delete the `build:lite` line
  - **READ:** `.bkit/core/.bkit/README.md`: the "What install writes" tier table that names `lite.md`
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `grep -rn "lite" .bkit/core/.agents .bkit/core/prompts .bkit/core/.bkit .github/ISSUE_TEMPLATE/bkit-change.yml .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml` returns nothing; `pnpm instructions:sync` leaves a clean diff; `pnpm vitest run .bkit/core/engine/tools/instructions-sources.test.ts .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/audits/workflows/workflow-shape.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `no shipped prompt or workflow names a lite workflow` fails while `:lite` remains
    - `.bkit/core/engine/tools/instructions-sources.test.ts` `no shipped rule or prompt instructs a next:*:lite label` fails while the rule remains
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the change issue form names no lite workflow` fails while `build:lite` remains
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the shipped reference docs list no lite doc` fails while `lite.md` is listed

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Rewrite the root README and roadmap guidance; document the held handoff
  - **UPDATE:** `README.md`: replace the lite command-table row with `/bkit-build #N publish=false`; rewrite the sign-off, "run fewer steps" and FAQ sentences; remove the `.bkit/lite.md` doc row; document the manual batch caveat and the held handoff
  - **UPDATE:** `docs/roadmap.md`: rewrite item 20's `lite:build` to `/bkit-build`
  - **UPDATE:** `.bkit/core/.bkit/README.md`: add the held build usage and the manual batch caveat beside the build commands
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: build Output gains the held branch + worktree alternative
  - **READ:** `README.md`: the "Documentation" table that links `.bkit/lite.md`
  - **DEPENDS ON:** 11
  - **DONE WHEN:** `grep -n "lite" README.md docs/roadmap.md` returns nothing; `pnpm vitest run .bkit/core/engine/audits/templates/templates.test.ts` passes; `pnpm bkit:gate:static-unit-integration` and `node dist/cli.js check` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the root README points small changes at /bkit-build` fails while a lite link or command remains
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the root README carries the manual batch caveat` fails while the caveat is absent
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the root README carries the held handoff` fails while `Publish: held` / `Docs: not synced` are absent

<!-- bkit:task 12 end -->

<!-- bkit:group 4 end -->

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

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (the deepest declared gate) and `pnpm build && node dist/cli.js check` pass.
- [ ] **Test Synchronization:** `pnpm vitest -u .bkit/core/engine/render/trackers.test.ts` regenerates `bkit-build.none.txt` after the workflow edit; review the diff (only the publish branch).
- [ ] **Build Configuration:** no test-only file enters the production build; `tsc` already excludes test files per `tsconfig.json`.
- [ ] **Unit (`settings.test.ts`, `repo.test.ts`, `checks/before/*`, `summary.test.ts`, `workflows.test.ts`, `telemetry.test.ts`, `manifest.test.ts`, `templates.test.ts`, `instructions-sources.test.ts`, `workflow-shape.test.ts`):** new cases run green; no snapshot is accepted without review.
- [ ] **Integration (`core.integration.test.ts`, `upgrade.integration.test.ts`):** fresh install, upgrade from the 5.2.4 fixture, and the migration cases pass against real temp dirs with no mocks.
- [ ] **Apply local migrations:** `bkit install` in the repo regenerates `.claude/`, `.cursor/`, `.codex/`, `.agents/` and `.opencode/` mirrors and seeds `build.publish`; `pnpm instructions:sync` regenerates `.bkit/instructions.md`.
- [ ] **Run all tests:** `pnpm vitest run` (full suite, never scoped to the changed files) and `pnpm test:harvest` pass.
- [ ] **Dist freshness:** `pnpm build && git add dist/` in the same commit as the engine change; `pnpm bkit:check:dist` shows no drift.
- [ ] **Dogfood:** on a fresh scratch consumer, `bkit install` writes no `.bkit/lite.md`; on a fixture with a 5.2.4 `lite.md` plus consumer lines, `bkit upgrade` keeps the section in the stub; `bkit repo info` prints `buildPublishRemote: true` and `buildPublishLocal: true`.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result, on-disk footprint).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** On this repo, run `/bkit-build 715-retire-lite-workflows publish=false` and confirm the final message starts `Publish: held`, nothing was pushed (`git status` shows the branch only local), the worktree and `feat/715-…` remain, and the issue is `In review` with the "built locally, not published" comment.
- [ ] **Step 2:** Run `/bkit-ship 715-retire-lite-workflows` from that held state and confirm it pushes the branch, opens the PR if none exists, gates on CI and merges.
- [ ] **Step 3:** With `bkit.workflows.build.publish.local: false` and no token, run `/bkit-build 715-retire-lite-workflows` and confirm it holds; then set `publish.remote: false` and run `bkit check` to see `bkit-build-publish-remote`.
- [ ] **Step 4:** On a clone of a 5.2.4 install, run `bkit upgrade` and confirm `.bkit/lite.md` keeps the consumer section under the retired heading and no managed block remains.

<!-- bkit:end -->
