# Brief: group 7 — Guidance retirement

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
- Group 6: Build workflow branch and gates — done
  - TASK 12: Branch `bkit-build.md` on the resolved publish ending — done
  - TASK 13: Verify the held ending and its deferred landing against real boundaries — done
- Group 7: Guidance retirement — this group
  - TASK 14: Remove lite guidance from the rules, prompts and reference docs — open
  - TASK 15: Rewrite the root README and roadmap guidance; document the held handoff and the manual batch recipe — open
- Group 8: Dist, dogfood mirrors and the gate — next
  - TASK 16: Rebuild `dist/`, refresh the dogfood mirrors and run the gate — open

## The work

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
  - **UPDATE:** `README.md`: add the `/bkit-build #N publish=false` hold row beside the default `/bkit-build #N` row; document the held handoff (the lite row, sign-off, FAQ, "run fewer steps" and `.bkit/lite.md` doc-row text were already removed from `README.md` by commit `7c9b909ea`, so only keep them absent)
  - **UPDATE:** `README.md`: add the manual batch recipe — build held, then land the batches yourself with `git` — stating both limitations (one head commit means post-merge auto-debug sees only the last FID; never batch migrations) and that the user owns the push, PR, CI gate, sweep and docs sync
  - **UPDATE:** `docs/roadmap.md`: rewrite item 20's `lite:build` to `/bkit-build`
  - **READ:** `§ Documentation` in `README.md`: the table that links `.bkit/lite.md`
  - **DEPENDS ON:** 14
  - **DONE WHEN:** `grep -niE '(:lite|lite\.md|[Ll]ite workflows?)' README.md docs/roadmap.md` returns nothing; `pnpm vitest run .bkit/core/engine/audits/templates/templates.test.ts` passes; the README carries a batch recipe section naming both limitations
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the root README points small changes at /bkit-build` fails while the `/bkit-build #N publish=false` hold row is absent or a lite link or command is present
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the root README carries the held handoff` fails while `Publish: held` / `Docs: not synced` are absent
    - `.bkit/core/engine/audits/templates/templates.test.ts` `the root README carries the manual batch recipe with both limitations` fails while the recipe, the last-FID limitation or the no-batched-migrations rule is missing

<!-- bkit:task 15 end -->

### Earlier tasks this group depends on

- TASK 8 (group 4, done): Drop the retired lite doc from the install docs — `.bkit/core/.bkit/README.md`, `.bkit/core/.agents/docs.md`
- TASK 9 (group 4, done): Teach `bkit uninstall` the retired lite path — `.bkit/core/engine/commands/install/uninstall.ts`, `.bkit/core/engine/commands/install/uninstall.test.ts`, `dist/cli.js`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Remove lite guidance from the rules and prompts | `.bkit/core/.agents/rules.md` | `grep -rn "lite" .bkit/core/.agents`; `grep -rn "lite" .bkit/core/prompts`; `grep -rn "lite" .bkit/core/.bkit` | The rules bullets already name every `next:*` label; each prompt already recommends `/bkit-build` or `/bkit-debug` | EXTEND | Rewrite each line to the plain labels and the full-workflow command; remove the lite doc reads. |
| Remove lite rows from the shipped reference docs | `.bkit/core/.bkit/README.md` | the same `grep -rn "lite" .bkit/core/.bkit` | The README's change row, tier tables and install-writes list name lite | EXTEND | Drop the lite rows; point the change row at `/bkit-plan` / `/bkit-build`. |
| Update the workflow, tracker and template reference docs | `.bkit/core/.bkit/workflows.md` | the same `grep -rn "lite" .bkit/core/.bkit` | The command table's build Output reads "PR to `dev`"; the tracker / template rows name `build:lite` | EXTEND | Add the held alternative to the build Output and remove the lite rows. |
| Update the change issue form | `.github/ISSUE_TEMPLATE/bkit-change.yml` | `grep -n "build:lite" .github/ISSUE_TEMPLATE/bkit-change.yml .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml` | Both copies name `build:lite` | EXTEND | Delete the lite line in both the repo copy and the shipped template. |
| Document the ending in the root README | `README.md` | `grep -ni "lite" README.md`; `grep -ni "lite" docs/roadmap.md`; `grep -ni "lite" docs/migrations.md` | The root README already documents each command and the three sign-offs | EXTEND | Replace the lite row and FAQ sentences with `/bkit-build #N` / `publish=false`; add the held handoff and the manual batch recipe (one head commit / last FID only; never batch migrations; the user owns push, PR, CI gate, sweep and docs sync). |

Reuse Inventory rows left out: 1; Architecture entries left out: 16 — read them in docs/plans/202610/715-retire-lite-workflows-plan.md § Reuse Inventory and § Architecture & Component Changes.
