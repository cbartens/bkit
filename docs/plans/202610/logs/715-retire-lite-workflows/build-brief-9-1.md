# Brief: group 9 — Challenge round 1 findings

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
- Group 7: Guidance retirement — done
  - TASK 14: Remove lite guidance from the rules, prompts and reference docs — done
  - TASK 15: Rewrite the root README and roadmap guidance; document the held handoff and the manual batch recipe — done
- Group 8: Dist, dogfood mirrors and the gate — done
  - TASK 16: Rebuild `dist/`, refresh the dogfood mirrors and run the gate — done
- Group 9: Challenge round 1 findings — this group
  - TASK 18: A low-disk `bkit worktrees setup` that meets a hook-started `max` sweep now blocks for up to `LOCK_STALE_MS + pollMs` (3605s) with one log line, outliving the agent's shell-call timeout and the 3600s step timeout, so build Step 2 is killed mid-wait instead of getting the routed exit 12 — open
  - TASK 19: A `publish=false` build that hits the Failure Path or a Decision Pause runs `workflows handover --push`, which `git add -A`s, commits and pushes `feat/{FID}` to `origin`, so code the owner chose to hold (e.g. an embargoed fix in a public repo) is published irreversibly — open

## The work

<!-- bkit:task 18 start -->
- [ ] **TASK 18:** A low-disk `bkit worktrees setup` that meets a hook-started `max` sweep now blocks for up to `LOCK_STALE_MS + pollMs` (3605s) with one log line, outliving the agent's shell-call timeout and the 3600s step timeout, so build Step 2 is killed mid-wait instead of getting the routed exit 12
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/disk.ts:554` · **Round:** 1
  - **DONE WHEN:** `ensureDiskSpace` waits for a running sweep only up to a bounded `maxWaitMs` (a named wait in `.bkit/core/engine/shared/timeouts.ts`, per `.bkit/workflows.md` § Retry / timeout / iteration constants "Waits live in `TIMEOUTS`"), set well under a single agent shell call, then returns the existing "another sweep ... re-run once it ends" refusal so `worktrees setup` exits 12 instead of hanging; `waitForLock` takes that bound instead of hard-coding `LOCK_STALE_MS + pollMs`; the detached `--auto` sweep keeps its long wait.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/disk.test.ts` `worktree setup's low-disk sweep stops waiting after maxWaitMs while a live sweep holds the lock` fails on `ensureDiskSpace({ cwd, minFreeGb: 1e9, pollMs: 10, maxWaitMs: 100, log })` with a fresh `holdLock(process.pid)` that is never released: today the option is ignored, the call waits ~3605s and the test times out instead of resolving with a message containing `another sweep`
<!-- bkit:task 18 end -->

<!-- bkit:task 19 start -->
- [ ] **TASK 19:** A `publish=false` build that hits the Failure Path or a Decision Pause runs `workflows handover --push`, which `git add -A`s, commits and pushes `feat/{FID}` to `origin`, so code the owner chose to hold (e.g. an embargoed fix in a public repo) is published irreversibly
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:92` · **Round:** 1
  - **DONE WHEN:** Failure Path step 5 (`.bkit/core/workflows/bkit-build.md:90-92`) and the Decision Pause owner-wait step 8 (`.bkit/core/workflows/bkit-build.md:228-230`) branch on `{PUBLISH}`: when it is false they commit the record locally (or link it with `--ref`) and never pass `--push`, so no step of a held run pushes `feat/{FID}`; the publish=true path keeps `--push` unchanged; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:310` is updated to match.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch` fails on both handover fences calling `--push` with no `{PUBLISH}` = false branch, so a held run pushes `feat/{FID}`
<!-- bkit:task 19 end -->
