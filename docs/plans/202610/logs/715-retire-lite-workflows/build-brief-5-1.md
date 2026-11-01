# Brief: group 5 — Close row, telemetry ending and stats view

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
- Group 5: Close row, telemetry ending and stats view — this group
  - TASK 10: Record `ending: held` and `publish: false` on the close — open
  - TASK 11: Derive and display the held ending in stats / harvest — open
- Group 6: Build workflow branch and gates — next
  - TASK 12: Branch `bkit-build.md` on the resolved publish ending — open
  - TASK 13: Verify the held ending and its deferred landing against real boundaries — open
- Group 7: Guidance retirement — later
  - TASK 14: Remove lite guidance from the rules, prompts and reference docs — open
  - TASK 15: Rewrite the root README and roadmap guidance; document the held handoff and the manual batch recipe — open
- Group 8: Dist, dogfood mirrors and the gate — later
  - TASK 16: Rebuild `dist/`, refresh the dogfood mirrors and run the gate — open

## The work

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

### Earlier tasks this group depends on

- TASK 5 (group 2, done): Write the `Publish:` and `Docs:` lines into the build summary — `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `dist/cli.js`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Record the held ending and publish flag | `.bkit/core/engine/commands/workflow/workflows.ts` (closeWorkflow, CloseInput) | `grep -n "ending:" .bkit/core/engine/commands/workflow/workflows.ts`; `grep -n "CloseInput" .bkit/core/engine/commands/workflow/workflows.ts`; `grep -n "outcomeRow" .bkit/core/engine/commands/workflow/workflows.ts` | The close already builds `outcomeRow` and accepts per-workflow flags | EXTEND | Add `--ending` / `--publish`, write both onto the `workflow-done` and outcome rows, validate `held`. |
| Type the new close fields | `.bkit/core/engine/ledgers/status.ts` (`StatusEvent`) | `grep -n "workflow-done" -A4 .bkit/core/engine/ledgers/status.ts` | The `workflow-done` variant lists `workflow`, `at`, `parentSha` only | EXTEND | Add optional `ending` / `publish` so the emitted row and the canonical union agree. |
| Accept the new ending in telemetry | `.bkit/core/engine/ledgers/telemetry.ts` (OUTCOME_ENDINGS, RUN_ENDINGS, payload types, `validate`) | `grep -n "OUTCOME_ENDINGS" .bkit/core/engine/ledgers/telemetry.ts`; `grep -n "RUN_ENDINGS" .bkit/core/engine/ledgers/telemetry.ts`; `grep -n "outcome ending must be" .bkit/core/engine/ledgers/telemetry.ts`; `grep -n "ending" scripts/harvest/bkit-harvest.mjs` | The ending enums already hold `close-failed`, `failed`, `decision-pause`, `stopped`; the outcome message at line 1671 is hardcoded | EXTEND | Add `held` to both sets and unions, type `publish`, validate it as a boolean and build the message from `OUTCOME_ENDINGS`. |
| Derive the held ending from the run log | `scripts/harvest/bkit-harvest.mjs` (endingOf) | `grep -n "endingOf" -A30 scripts/harvest/bkit-harvest.mjs`; `grep -n "endings =" scripts/harvest/bkit-harvest.mjs` | endingOf already derives `done` / `close-failed` / `failed` / `decision-pause` / `stopped` | EXTEND | Return `held` when the run's `workflow-done` row carries `ending: held`; add the report column. |
| Keep the ledger schema doc current | `.bkit/core/.bkit/jsonl.md` | `grep -n "ending" .bkit/core/.bkit/jsonl.md`; `grep -n "outcome\` \|" .bkit/core/.bkit/jsonl.md` | § Per-Kind Fields pins `outcome` and `run` `ending` to the current closed sets | EXTEND | Add `held` to both enum rows and `publish?:boolean` to `outcome`. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** file exists; `CloseInput`, `closeWorkflow`, `outcomeRow` and the `summary` / `close` command specs are here.
- Add `ending?: "done" | "held"` and `publish?: boolean` to `CloseInput`; flags `--ending` (validate `done` / `held`) and `--publish` (validate `true` / `false`); write both onto the `workflow-done` row and the outcome row (ending defaults `done`, publish absent when unset). Add `--publish` to the `summary` verb and thread it into `SummaryInput`.

#### [MODIFY] `scripts/harvest/bkit-harvest.mjs`

- **Existence Check:** file exists; `endingOf` and the ending columns are here.
- Return `held` when the run's last `workflow-done` row carries `ending: "held"`; add `held` to the report's ending list and its legend.

Reuse Inventory rows left out: 0; Architecture entries left out: 3 — read them in docs/plans/202610/715-retire-lite-workflows-plan.md § Reuse Inventory and § Architecture & Component Changes.
