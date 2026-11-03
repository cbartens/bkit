# Brief: group 6 — Build workflow branch and gates

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
- Group 3: Install seed and the retired-lite migration — done
  - TASK 6: Seed `build.publish` on install and upgrade — done
  - TASK 7: Retire the lite payload in one install transition — done
  - TASK 17: Delete the shipped `lite.md` source doc so the install payload test passes — done
- Group 4: Lite payload removal and uninstall doctrine — done
  - TASK 8: Drop the retired lite doc from the install docs — done
  - TASK 9: Teach `bkit uninstall` the retired lite path — done
- Group 5: Close row, telemetry ending and stats view — done
  - TASK 10: Record `ending: held` and `publish: false` on the close — done
  - TASK 11: Derive and display the held ending in stats / harvest — done
- Group 6: Build workflow branch and gates — this group
  - TASK 12: Branch `bkit-build.md` on the resolved publish ending — open
  - TASK 13: Verify the held ending and its deferred landing against real boundaries — open
- Group 7: Guidance retirement — next
  - TASK 14: Remove lite guidance from the rules, prompts and reference docs — open
  - TASK 15: Rewrite the root README and roadmap guidance; document the held handoff and the manual batch recipe — open
- Group 8: Dist, dogfood mirrors and the gate — later
  - TASK 16: Rebuild `dist/`, refresh the dogfood mirrors and run the gate — open

## The work

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

### Earlier tasks this group depends on

- TASK 4 (group 2, done): Resolve `{PUBLISH}` in `bkit status route` — `.bkit/core/engine/commands/workflow/status.ts`, `dist/cli.js`
- TASK 5 (group 2, done): Write the `Publish:` and `Docs:` lines into the build summary — `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `dist/cli.js`
- TASK 10 (group 5, done): Record `ending: held` and `publish: false` on the close — `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/ledgers/telemetry.ts`, `.bkit/core/.bkit/jsonl.md`, `docs/observability.md`, `dist/cli.js`

Reuse Inventory rows left out: 4; Architecture entries left out: 4 — read them in docs/plans/202610/715-retire-lite-workflows-plan.md § Reuse Inventory and § Architecture & Component Changes.
