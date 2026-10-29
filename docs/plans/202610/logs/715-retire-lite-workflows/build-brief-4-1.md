# Brief: group 4 — Lite payload removal and uninstall doctrine

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
- Group 4: Lite payload removal and uninstall doctrine — this group
  - TASK 8: Drop the retired lite doc from the install docs — open
  - TASK 9: Teach `bkit uninstall` the retired lite path — open
- Group 5: Close row, telemetry ending and stats view — next
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

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Drop the retired lite doc from the install docs
  - **UPDATE:** `.bkit/core/.bkit/README.md`: drop `lite.md` from the Tier-2 exception (line 244) and the install-writes list (line 279)
  - **UPDATE:** `.bkit/core/.agents/docs.md`: delete the `.bkit/lite.md` index row
  - **READ:** `.bkit/core/engine/install/manifest.ts`: Task 17 removed the `.bkit/lite.md` entry; the docs must match it
  - **DEPENDS ON:** 17
  - **DONE WHEN:** `grep -n lite.md .bkit/core/.bkit/README.md .bkit/core/.agents/docs.md` prints no line naming the retired doc
  - **TEST FIRST:** n/a — documentation edits only; the deletion and its tests moved to Task 17, and the migration running without the payload doc is covered by Task 7's inline-fixture cases

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

### Earlier tasks this group depends on

- TASK 7 (group 3, done): Retire the lite payload in one install transition — `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`, `docs/migrations.md`, `dist/cli.js`
- TASK 17 (group 3, done): Delete the shipped `lite.md` source doc so the install payload test passes — `.bkit/core/engine/install/manifest.ts`, `.bkit/core/engine/install/manifest.test.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `dist/cli.js`, `.bkit/core/.bkit/lite.md`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Strip the retired lite doc on uninstall | `.bkit/core/engine/commands/install/uninstall.ts` (`CORE_TEMPLATE_DOCTRINE`) | `grep -n "CORE_TEMPLATE_DOCTRINE" -A10 .bkit/core/engine/commands/install/uninstall.ts`; `grep -rn "shortcuts" .bkit/core/engine/commands/install/uninstall.test.ts` | The list already carries the retired `.agents/shortcuts.md` path for 5.1.0–5.2.4 installs | EXTEND | Add the `.bkit/lite.md` retired entry so an un-upgraded 5.2.5–6.0.0 install has its managed block stripped too. |
| Remove lite rows from the shipped reference docs | `.bkit/core/.bkit/README.md` | the same `grep -rn "lite" .bkit/core/.bkit` | The README's change row, tier tables and install-writes list name lite | EXTEND | Drop the lite rows; point the change row at `/bkit-plan` / `/bkit-build`. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/install/uninstall.ts`

- **Existence Check:** file exists; `CORE_TEMPLATE_DOCTRINE` lists the retired `.agents/shortcuts.md` path at line 381.
- Add `{ path: ".bkit/lite.md", format: "markered-text", module: "core" }` beside it, so `bkit uninstall` on an un-upgraded 5.2.5–6.0.0 install strips the managed block and keeps consumer lines.

#### [MODIFY] `.bkit/core/engine/commands/install/uninstall.test.ts`

- **Existence Check:** file exists; the doctrine table's cases live here.
- Add the retired `.bkit/lite.md` case: managed block stripped, consumer section kept.

#### [MODIFY] `.bkit/core/.bkit/README.md`

- **Existence Check:** file exists; the change row (line 52), the Tier-1/Tier-2 table (244) and the install-writes list (279) name lite.
- Task 8 owns the tier rows: drop `lite.md` from the Tier-2 exception and the install-writes list. Task 14 owns the change row and the usage text: rewrite the change row to `/bkit-plan` or `/bkit-build` only and add the held build usage and its manual batch recipe.

#### [MODIFY] `.bkit/core/.agents/docs.md`

- **Existence Check:** file exists; the index row for `.bkit/lite.md` is at line 30.
- Delete the row.
