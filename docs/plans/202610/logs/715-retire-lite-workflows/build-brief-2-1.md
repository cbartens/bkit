# Brief: group 2 — Runtime publish resolution and summary line

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
- Group 2: Runtime publish resolution and summary line — this group
  - TASK 4: Resolve `{PUBLISH}` in `bkit status route` — open
  - TASK 5: Write the `Publish:` and `Docs:` lines into the build summary — open
- Group 3: Install seed and the retired-lite migration — next
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

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Parse and validate `bkit.workflows.build.publish` in settings — `.bkit/core/engine/shared/settings.ts`, `dist/cli.js`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Resolve `publish` from prompt, config and runtime | `.bkit/core/engine/commands/workflow/status.ts` (`status route`) | `grep -n "ROUTE_FIELDS" .bkit/core/engine/commands/workflow/status.ts`; `grep -n "debugStart" .bkit/core/engine/commands/workflow/status.ts`; `grep -n "promptFile" .bkit/core/engine/commands/workflow/fids.ts`; `grep -n "runtime assert" .bkit/core/engine/commands/workflow/runtime.ts` | `status route --prompt-file` already turns prompt tokens into routing fields (`debugMode`, `repro`, `gates`); `runtime assert` emits `runtime` from the `runtime-resolved` row | EXTEND | Add `publish` / `publishSource` to `ROUTE_FIELDS` and resolve token → `buildPublish.local` / `.remote` by runtime, coercing a non-LOCAL `false`. No new verb. |
| Write the held line into the summary | `.bkit/core/engine/commands/workflow/summary.ts` | `grep -n "buildSummary" .bkit/core/engine/commands/workflow/summary.ts`; `grep -n "SummaryInput" .bkit/core/engine/commands/workflow/summary.ts`; `grep -n "Publish" .bkit/core/engine/commands/workflow/summary.ts` | `buildSummary` already emits the Plan-tasks and Challenge sections | EXTEND | Add `publish` to `SummaryInput` and the `Publish:` / `Docs:` lines in the build section. |
| Record the held ending and publish flag | `.bkit/core/engine/commands/workflow/workflows.ts` (closeWorkflow, CloseInput) | `grep -n "ending:" .bkit/core/engine/commands/workflow/workflows.ts`; `grep -n "CloseInput" .bkit/core/engine/commands/workflow/workflows.ts`; `grep -n "outcomeRow" .bkit/core/engine/commands/workflow/workflows.ts` | The close already builds `outcomeRow` and accepts per-workflow flags | EXTEND | Add `--ending` / `--publish`, write both onto the `workflow-done` and outcome rows, validate `held`. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/status.ts`

- **Existence Check:** file exists; `ROUTE_FIELDS`, `debugStart` and the `route` verb's `--prompt-file` handling are here.
- Add `publish` to `ROUTE_FIELDS`, extend the `route` verb's output (`publish`, `publishSource` = `token` | `local` | `remote` | `coerced`), and add a sibling `publishRoute(runs, promptText, config)` that reads the last `runtime-resolved` row's `runtime`, takes the first of `publish=true` / `publish=false` in the prompt, else `runtime === "LOCAL" ? buildPublish.local : buildPublish.remote`, and coerces a non-LOCAL `false` to `true`. A prompt value that matches neither token falls through to the config. With no `runtime-resolved` row it throws `CommandError(EXIT_ROUTE_MISSING, …)` naming build Step 2 instead of defaulting. Widen the `--prompt-file` guard from `--workflow=debug` to `debug` and `build`; the debug fields attach only for `debug`. The `--prompt-file` help and `output` contract name `publish` and `publishSource`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`

- **Existence Check:** file exists; `SummaryInput` and `buildSummary` are here.
- Add `publish?: boolean`; in the build section emit `Publish: held` when false and `Publish: pr` when true/absent (today's handoff text stays for true), plus `Docs: not synced (ship syncs on landing)` when false and nothing when true.

Reuse Inventory rows left out: 0; Architecture entries left out: 1 — read them in docs/plans/202610/715-retire-lite-workflows-plan.md § Reuse Inventory and § Architecture & Component Changes.
