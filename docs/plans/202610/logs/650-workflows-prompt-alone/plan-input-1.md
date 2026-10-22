# Plan input

## Session prompt

/bkit-plan #650

## Issue #650 — Run workflows from the prompt alone, without issue, design or plan

### Problem

In a repo with a wired tracker, `/bkit-design`, `/bkit-plan`, `/bkit-build`, `/bkit-debug` and `/bkit-ship` all stop at Step 1 when the prompt names no issue: `No issue ID in the session prompt.` → STOP. So you can't point `/bkit-debug` at red CI on `dev` without first finding or filing an issue to hang the run on.

A missing design or plan is already only a warning (#490 — Run build and ship from the session prompt when there is no plan — https://github.com/cbartens/bkit/issues/490). The issue is the last required input.

### Outcome

Every workflow runs on the prompt alone. A missing issue, design or plan prints a warning and the run continues. `/bkit-debug` runs on any branch except `main`, `dev` included. `/bkit-ship` keeps refusing `dev` and `main` and never opens or merges a PR from `dev` into `main`; releases stay manual.

### Success criteria

- `/bkit-debug ci failures on dev`, run on `dev` with the GitHub tracker wired and no issue named: prints a warning that names the missing issue, then diagnoses, fixes and lands the fix on `dev`. It does not stop.
- The same holds for design, plan, build and ship: no issue → warning → run continues from the prompt.
- An issue-less run makes no tracker calls tied to an issue (labels, comments, board, issue reads), and none of them fail the run.
- An issue-less run gets a valid FID (the run's log-folder name) in a tracker-wired repo. It can never be misread as an issue id.
- The no-issue warning is the first line of every final message the workflow returns.
- `/bkit-ship` on `dev` or `main` refuses with a message saying releases stay manual. No ship path can merge into `main`.

### Constraints and non-goals

- Workflows still never create tracker issues (#486 — Stop auto-creating tracker issues — https://github.com/cbartens/bkit/issues/486).
- An issue named in the prompt still behaves exactly as today. The `none` tracker behaves as today.
- `main` stays refused as the working branch for every workflow.
- `/bkit-ship` and `utility-new-release` stay separate. `utility-new-release` is bkit-internal; releasing `dev` → `main` stays manual.
- `/bkit-auto` stays issue-only: CI always dispatches it with an issue or PR.
- Works for github, linear and jira trackers alike, and on every host (Claude, Cursor, OpenCode, Codex).

### Decisions already made

- Missing issue / design / plan → warning, never a stop, in all five workflows.
- Issue-less FID = `{branch-suffix}-{slug}` (e.g. `dev-ci-failures`), the shape the `none` tracker already uses.
- `/bkit-ship` refuses to open or merge a PR from `dev` into `main`.
- The warning prints on the console and is the first line of the final message returned to the user.
- Implementation plan: see the plan comment below; built directly, with no `/bkit-design` or `/bkit-plan` run.

### References

- `.bkit/core/workflows/bkit-{design,plan,build,debug,ship}.md` Step 1 sub-step 2 (the STOP)
- `.bkit/core/.bkit/workflows.md` § Best-effort runs (no issue, no plan); § No tracker-issue creation
- `.bkit/wording.md` `workflow-issue-id-missing`
- `.bkit/core/engine/commands/workflow/fids.ts` (FID shape per tracker)
- `.bkit/core/engine/commands/workflow/worktrees.ts` (ship refuses `dev` / `main`)
- #486 — Stop auto-creating tracker issues — https://github.com/cbartens/bkit/issues/486
- #490 — Run build and ship from the session prompt when there is no plan — https://github.com/cbartens/bkit/issues/490

## Implementation plan

We're doing this straight from this plan, with no `/bkit-design` or `/bkit-plan` run. It's built from a line-by-line survey of all five workflows, the engine and the tests.

### Decisions (Christian, 2026-10-22)

1. **Run-folder name (FID) with no issue:** `{branch-suffix}-{slug}`, the same shape the `none` tracker uses. Example: `dev-ci-failures`.
2. **`/bkit-ship` vs `utility-new-release`:** they stay separate. `utility-new-release` is bkit-internal.
3. **`/bkit-ship` never opens or merges a PR from `dev` into `main`.** Releases stay manual. Ship keeps refusing `dev` and `main`, and the refusal says so plainly. This **replaces** the "release PR" outcome in the issue body; the body is updated to match.
4. **The no-issue warning** prints on the console at Step 1 **and** is the first line of every final message the workflow returns to the user.

### Decisions I'm proposing (say if you disagree)

- **Recover the issue from the FID when one is embedded.** With no issue in the prompt, the run first checks whether the prompt names a FID, or whether the branch is `feat/{FID}`. If that FID carries an issue id (e.g. `feat/650-foo`), the run uses that issue. Only when there's none at all does it run issue-less. Otherwise a known issue would be silently ignored.
- **Issue-less FIDs can never look like an issue.** When minting, all-number words are dropped from both the branch suffix and the slug. That guarantees the FID can't match the github (`123-…`) or linear/jira (`abc-12-…`) shape, so `123-foo` can't later be misread as issue #123. The engine rejects a tracker-shaped FID when no issue is given.
- **Keep the related-issues search** (debug, design, plan) when there's no issue. It looks for _other_ similar issues, so it doesn't need one. Only Jira's `key != {ISSUE_ID}` clause is dropped when the issue is empty, because left in it makes the query invalid.
- **Plan can still use a design without an issue.** Name the design's FID or path in the prompt; that already works.
- **`/bkit-debug` on `dev` works in its own worktree and lands like design and plan do.** It doesn't work in your main checkout. Debug on `dev` works on a local `feat/{FID}` branch off `origin/dev` and lands onto `dev` through `bkit branches land` (squash and push; when the runtime can't push `dev`, it opens a PR to `dev` instead). Then it waits for `dev`'s CI on the landed commit. This fixes four problems with debug on `dev` that exist today:
  - (a) `git add -A` in the main checkout sweeps your unrelated files into its commits;
  - (b) a plain `git push origin dev` pushes every local `dev` commit, not just its own;
  - (c) it never waits for `dev`'s CI, but Gate 11 claims it did;
  - (d) the Step 1 PR lookup can pick up an open `dev` → `main` release PR and rename it.

  This breaks the "debug never creates a branch" rule for `dev` only. Other branches keep working in place.

### Engine (`.bkit/core/engine/commands/workflow/`)

- **`fids check` and `steps gate` take `--issue=<id or "">`.**
  - Flag absent: same behaviour as today.
  - Non-empty: the FID must match the tracker shape.
  - Empty, with a tracker wired: the FID must match the `none` shape **and must not** match the tracker shape. It exits 1 with a clear message otherwise.
  - Every workflow's Gate 1 and Step 1 pass `--issue="{ISSUE_ID}"`.
- **`prs.ts` `prMarker` (used by `prs open` and `branches land`):** with a tracker wired and no issue, write `<!-- bkit:fid={FID} -->`, checked by the same FID rule. Delete the duplicate `FID_FORMAT` / `ISSUE_FORMAT` and use `fids.ts` `FID_PATTERNS`.
- **`fids.ts` `fromMarker` / `fromBranch`:** with a tracker wired, also accept an issue-less FID (`none` marker, or a `feat/{FID}` that isn't tracker-shaped) and return `issueId: null`. Everything still goes through `SLUG`, so the traversal/injection guard holds.
- **`prs merge`:** refuse any PR whose base isn't `dev`. Today nothing re-checks the base after ship's Step 2, so a PR retargeted to `main` mid-run would be merged into `main`. `prs open` also refuses `--base=main`.
- **`worktrees setup`:**
  - Clear refusal when ship runs on `dev` or `main`: `refusing to ship dev: /bkit-ship ships a feature branch into dev only; it never opens a PR from dev into main or merges into main, releases stay manual. Name the feature branch to ship.` The `refusing to ship ${target}` prefix stays, because `worktrees.test.ts` pins it.
  - Replace the misleading "commit or stash local changes" message when the `feat/{FID}` branch simply doesn't exist.
  - Refuse `main` in place for design, plan and build too; today only `dev` is refused there.
  - Debug on `dev` → worktree on `feat/{FID}` off `origin/dev` (see the debug decision above).
- **`bkit-auto` stays issue-only.** With no issue there's no `bkit:auto` label to check, and the `bkit-cloud.yml` FID guard already rejects issue-less FIDs. I'll verify both fail closed, with a test.
- Rebuild and commit `dist/` (`pnpm bkit:check:dist` gates it).

### Shared wording (`.bkit/wording.md` → `pnpm wording:sync`)

All five workflows change together, so the shared clauses change once at the source:

- `workflow-issue-id-missing` / `-none`: from "log … STOP" to "set `ISSUE_ID=""`, emit the warning, continue; never create a tracker issue".
- `workflow-issue-read-none`: becomes a template covering both "no tracker wired" and "no issue named".
- `workflow-fid-mint` / `workflow-fid-unset`: moved out of the `false` blocks so they apply under every tracker; slug from the prompt; all-number words dropped.
- `workflow-gate-issue-id`: "issue resolved, or the no-issue warning emitted".

Old wording moves to each clause's `retired` block.

### Workflows (`.bkit/core/workflows/bkit-{design,plan,build,debug,ship}.md`)

**Same in all five:**

- **New header bullet `**No issue:**`, in a `bkit:tracker true` block** (so `none` renders as today). When `ISSUE_ID` is empty, skip:
  - every tracker MCP read and write;
  - every comment post;
  - every `bkit issues labels` / `issues comment` / `issues text` block;
  - the gate items those back.

  None of this ever goes to Failure Path. The `{PLACEHOLDERS}` header line gets the qualifier "`{ISSUE_ID}` may be empty", as `bkit-auto.md` already has.

- **Step 1:**
  - sub-step 2: no ID → recover it from a named FID or `feat/{FID}`, else `ISSUE_ID=""` plus the warning, and continue;
  - sub-step 3: empty issue → empty inputs, built from the prompt alone;
  - mint: issue-less shape;
  - `fids check` and Gate 1 pass `--issue`.
- **Explicit `**Skip if** ISSUE_ID empty` at each site where a bash block would otherwise exit non-zero.** That's every `issues labels --board=… --issue=` block, which exits 2 when a GitHub board is configured, plus the Failure Path tracker writes and `prs open` / `branches land` (drop `--issue`).
- **Final message:** the warning goes first. This covers:
  - Close-step final return;
  - the summary-FAIL display (design 10, plan 11, build 17, debug 10, ship 6);
  - Failure Path's STOP.

  `Append issue link […]` is skipped when the issue is empty, so it doesn't render as `[ ]()`.

- **Gate items** that back skipped calls read "skipped when `ISSUE_ID` empty".

**Per workflow:**

- **design:** Step 11 (workstream suggestions) runs only with an issue, because it comments on the issue.
- **plan:** `fids design` stays. It's a local lookup, and it's how a design named in the prompt gets found.
- **build:**
  - Step 1.4 blocker check skipped.
  - **Step 18.9's kill-switch check is skipped when there's no issue.** With empty labels it would otherwise end the run before the final message.
- **debug:**
  - Same kill-switch fix at Step 11.9.
  - On `dev` or `main`: no PR lookup, so `PUSH_MODE` is LOCAL.
  - The `dev` worktree-and-land flow.
- **ship:**
  - Fix the branch-naming warning check (L236). An empty `ISSUE_ID` makes "branch does not contain `{ISSUE_ID}`" always true, so the warning never fires.
  - Clear refusal text for `dev` / `main`.
  - Step 14.3 labels skipped. Today it would send an _already merged_ run to Failure Path.

### Docs (sources under `.bkit/core/.bkit/`, plus `.bkit/core/AGENTS.md`)

- **`workflows.md`:**
  - L151 / 152 / 174, and the Step 1 rows (L843 / 867 / 893 / 931 / 984);
  - § FID generation ("No issue →");
  - § Best-effort runs (no issue → warning, continue);
  - § Branch eligibility (ship never `dev` → `main`; debug on `dev` lands);
  - the ship naming-warning rows.
- **`trackers.md`:** L74 `issue-id-extraction`, L75 `fid-format`, L86-87 PR marker, L157 / 163.
- **`lite.md` L25:** "no issue named → skip the tracker lines".
- **`AGENTS.md` router (L33):** drop `STOP with No issue ID provided.`
- **Also:**
  - `docs/testing.md` rows L587 / L606;
  - a `CHANGELOG.md` entry;
  - a `docs/decisions.jsonl` entry recording why the issue rule changed (it reverses part of #486 — Stop auto-creating tracker issues — https://github.com/cbartens/bkit/issues/486; the never-create rule stays).

### Tests

- **`fids.test.ts`:**
  - `--issue=""` rows;
  - "embeds no … issue id" rows flip to `issueId: null`;
  - `none`-marker fallback under every tracker;
  - tracker-shaped issue-less FIDs rejected.
- **`steps.test.ts`:** Gate FID check with `--issue`.
- **`prs.test.ts`:**
  - FID-only marker with a tracker wired;
  - `prs merge` refuses a non-`dev` base;
  - `prs open` refuses `--base=main`.
- **`worktrees.test.ts`:**
  - new refusal text;
  - `main` refused in place for design / plan / build;
  - debug-on-`dev` worktree.
- **`auto-fid-guard.test.ts`:** malicious FIDs through the new fallbacks; bkit-auto fails closed with no issue.
- **`workflow-shape.test.ts`:**
  - no wired-tracker block STOPs on a missing issue;
  - `fids check` / `steps gate` carry `--issue`;
  - the `**No issue:**` bullet sits in a `true` block.
- **`close-squash.integration.test.ts`:** issue-less land.
- **Unchanged expectations to keep green:**
  - `ship-invariants.test.ts` (Step 10 label re-read before `prs merge`; `issues labels` after `workflows start`);
  - `wording.test.ts`;
  - `render/trackers.test.ts`, with `none` output unchanged.

### Order of work (each wave reviewed before commit)

1. **Engine and its tests**, plus `dist/`.
2. **`wording.md`, the five workflows and `wording:sync`.**
3. **Debug-on-`dev` landing, ship hardening.**
4. **Docs, mirrors** (`pnpm build` → `pnpm bkit upgrade` → `git config core.bare false`), **full verification:**
   - `pnpm vitest run` (full, not scoped), `tsc`, `pnpm bkit check`, `pnpm bkit:check:dist`;
   - dogfood a packed tarball in a fresh scratch consumer with a github tracker. Render each workflow and run `fids check`, `steps gate` and `prs open --dry` issue-less.

### Open points

- **Linear cloud preflight.** `.bkit/core/hooks/preflight-linear.sh:13-18` hard-stops a background Linear agent that has no `LINEAR_ISSUE_ID`. Leave it (cloud dispatch always comes from an issue), or relax it to match? My suggestion: leave it, since it guards how Cursor cloud agents get launched, not the workflows.
- **Resume continuity.** An issue-less re-run with different prompt wording mints a new FID, so attempt counts restart. Naming the FID in the prompt keeps continuity, the same as `none` today. No change planned.

## Open questions: answered (Christian, 2026-10-22)

These replace the "Decisions I'm proposing" and "Open points" sections of the plan comment above. Everything else in the plan stands.

<!-- prettier-ignore -->
| # | Question | Answer |
| --- | --- | --- |
| 1 | How does `/bkit-debug` work on `dev`? | **In place, but safer.** Not a worktree-and-land. See below. |
| 2 | No issue in the prompt, but the FID carries one (e.g. `feat/650-foo`) | **Use that issue.** The run reads, labels and comments on it as if the prompt had named it. |
| 3 | Stop an issue-less FID looking like an issue (`123-fix` → #123, `fix-2-retry` → `FIX-2`) | **Drop all-number words** from the branch suffix and slug when minting (`dev-123-ci-failures` → `dev-ci-failures`). As a backstop, the engine rejects a tracker-shaped FID when no issue is given. |
| 4 | Engine guard against merging into `main` | **Guard merge and open.** `bkit prs merge` refuses any PR whose base isn't `dev`; `bkit prs open` refuses `--base=main`. |
| 5 | Related-issues search with no issue (debug, design, plan) | **Keep it.** When the issue is empty, Jira's `key != {ISSUE_ID}` clause is dropped. |
| 6 | `.bkit/core/hooks/preflight-linear.sh` stops Linear cloud agents with no `LINEAR_ISSUE_ID` | **Leave it.** It only controls how cloud agents get launched from Linear, which always happens from an issue. |
| 7 | An issue-less re-run with different wording mints a new FID, so the attempt counter restarts | **No change.** Document in § Best-effort runs that naming the FID in the prompt keeps continuity. The warning line names the FID so it's easy to reuse. |

### Q1 in detail: debug on `dev` stays in the main checkout

Debug keeps working on `dev` in place, with no new branch and no worktree. It fixes the four ways that goes wrong today:

1. **Commits only its own files.** At Step 2, debug records the files already modified or untracked in the checkout. Its commits (`steps finish`, `workflows close`) then leave those paths out, instead of `git add -A`. If debug needs to change a file that was already dirty before it started, it stops and asks rather than mixing the two sets of changes.
2. **Pushes only its own commits.** Debug records where local `dev` stood at the start. If local `dev` was already ahead of `origin/dev` (unpushed commits that aren't debug's), it lands only its own commits. It replays them onto `origin/dev` in a throwaway checkout, the same way the handover already lands a run's record on `dev`, rather than pushing local `dev` wholesale. With nothing ahead, a plain push of its own commits is enough.
3. **Waits for `dev`'s CI.** After pushing, debug waits for the CI run on the pushed commit and treats red the same way it treats a red PR run. Gate 11's "CI-Dispatch gate ran" becomes true on `dev`.
4. **Never looks up a PR on `dev` or `main`.** `PUSH_MODE` is LOCAL there, with no `prs probe`, so an open `dev` → `main` release PR can't be picked up or retitled.

"Debug never creates a branch" stays true.
