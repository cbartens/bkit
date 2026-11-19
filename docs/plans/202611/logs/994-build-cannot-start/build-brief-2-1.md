# Brief: group 2 — Docs, built output and the failures row

Plan: Build starts on a plan-closed branch Implementation Plan

## Why and what

### Context & Goals

A build resumes `feat/{FID}`, the branch the plan phase pushed and left on the remote, and rebases it onto `origin/dev`. The plan close already landed the feature's plan files on `dev`, so the same plan-log files exist on both sides and git reports an add/add conflict. `bkit branches rebase` (`resolveRebase` in `.bkit/core/engine/commands/workflow/branches.ts`) classifies those files as `refuse`, aborts, and the build never starts (seen three times: failures keys `951-build-rebase-plan-v2-reviewed-add-add-conflict`, `916-build-rebase-add-add-conflict-plan-logs`, `912-build-rebase-add-add-plan-v2-reviewed`).

Decided by the owner on 2026-11-17: the engine keeps `dev`'s copy of a plan-log file that exists on both sides, and the build starts. The rule stays narrow: only files under the feature's own `docs/plans/{YYYYMM}/logs/{FID}/` folder and its `docs/plans/{YYYYMM}/{FID}-plan.md` take `dev`'s copy; any other conflict still stops the build. The planning branch is not deleted at plan close, and the build does not keep refusing with a clearer message.

**Related Issues:**

- #994 — Build cannot start: the planning branch is kept at plan close and the build's rebase hits add/add conflicts in plan logs (open)
- #1050 — Host-made worktrees: gaps left after setup adopts them (lands first; both change `worktrees.ts`)
- #345 — Failures triage (parent tracker)

---

### Narrative

An owner starts a build on a feature whose planning branch was left on the remote after the plan close. The build's rebase meets the plan files that both `dev` and the branch hold, keeps `dev`'s copy of each, and the build starts with no stop and no hand repair.

### Success Criteria

- A build started after a plan close that kept its branch does not stop on an add/add conflict in that feature's plan-log files or its plan file.
- Each such file ends up with `dev`'s content, and the rebase log says so (`RESOLVED {path} — took the rebase target's copy`).
- A conflict in any other file (code, another feature's plan logs, a plan file on a branch not named `feat/{FID}`) still stops the build, and the refusal reason names the rule.
- The ledger row `951-build-rebase-plan-v2-reviewed-add-add-conflict` is closed with a CLOSED row appended through `bkit ledgers append`.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| A decision row saying why the planning branch is kept at plan close | The reason is not recorded anywhere; the owner must confirm it before it is written | A follow-up on #994 after the owner confirms the reason |
| The same plan-log rule in `sync --merge` (`resolvePath`, ship Step 4 and the docs merge) | The issue is about the build start's rebase; `docs` policy already takes `dev` for `docs/` paths and `full` policy hands the rest to a person | Keep deferred until a sighting shows it |
| Changes to `worktrees.ts` | The resume rebase needs none (see the assumption above) | n/a |
| Deleting a leftover planning branch | Owner decision of 2026-11-17 | n/a |

## Where it fits

- Group 1: Plan-log conflicts settled on the rebase target's copy — done
  - TASK 1: Classify a feature's own plan files as the plan-log conflict shape — done
  - TASK 2: Settle plan-log conflicts on the target's copy in `bkit branches rebase`, and prove the build start — done
- Group 2: Docs, built output and the failures row — this group
  - TASK 3: Describe the new shape in the verb help and the docs — open
  - TASK 4: Rebuild `dist/` and refresh the rendered copies — open
  - TASK 5: Close the open failures row `951-build-rebase-plan-v2-reviewed-add-add-conflict` — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Describe the new shape in the verb help and the docs
  - **UPDATE:** `branchesCommand` in `.bkit/core/engine/commands/workflow/branches.ts`: the `rebase` verb's `summary` and `output.resolved`: add the feature's own plan files (taken from the rebase target) to the list; `how` text reads `union|lockfile|register|embed|record|dev`
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the generated `rebase` row, rewritten by `pnpm cli:sync`, never by hand
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the Tier 2 row of the conflict recovery tiers (line ~835)
  - **UPDATE:** `docs/testing.md`: the `branches.test.ts` row (line ~966) and the `worktrees.integration.test.ts` rows (lines ~865 and ~964) name the new cases
  - **READ:** `.bkit/authoring.md`: the rules for editing the doc sources
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `pnpm cli:sync` leaves no further diff and `.bkit/core/engine/tools/cli-doc.test.ts` passes; the Tier 2 row names this feature's plan-log folder and `{FID}-plan.md`; both `docs/testing.md` rows name the new cases
  - **TEST FIRST:** n/a — help text and docs; the existing `cli-doc.test.ts` drift test is the check and is not a new behaviour test

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Rebuild `dist/` and refresh the rendered copies
  - **UPDATE:** `dist/commands/workflow/branches.js`: rebuilt by `pnpm build`
  - **UPDATE:** `.bkit/workflows.md`: rewritten by `pnpm tsx .bkit/core/engine/cli.ts upgrade` from the doc source, with `.bkit/cli.md` and the other rendered copies
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `pnpm build` exits 0 and `dist/commands/workflow/branches.js` handles the plan-log shape; the upgrade run leaves `bkit check` exit 0; `git status` shows only the files this plan lists, `dist/` and the rendered copies
  - **TEST FIRST:** n/a — a build and a render of existing sources, no behaviour change

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Close the open failures row `951-build-rebase-plan-v2-reviewed-add-add-conflict`
  - **UPDATE:** `docs/failures.jsonl`: one appended `failure` row with the same `key`, `status` `CLOSED`, `severity` `MEDIUM`, a `remediation` saying `bkit branches rebase` settles this feature's own plan files on the rebase target's copy, written with `bkit ledgers append --ledger=failures --rows=<file>` and never by editing a line
  - **READ:** `.bkit/core/.bkit/jsonl.md`: § Write Idiom and the `failure` fields
  - **DEPENDS ON:** 2, 4
  - **DONE WHEN:** `bkit ledgers query --ledger=failures --key=951-build-rebase-plan-v2-reviewed-add-add-conflict` reports status `CLOSED`, and `git diff docs/failures.jsonl` shows only one added line
  - **TEST FIRST:** n/a — a ledger append, no behaviour change

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 2 (group 1, done): Settle plan-log conflicts on the target's copy in `bkit branches rebase`, and prove the build start — `.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/engine/commands/workflow/branches.test.ts`, `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Classify a feature's plan-log conflict as auto-resolvable | `.bkit/core/engine/commands/workflow/branches.ts` | `grep -n classifyConflict .bkit/core/engine/commands/workflow/*.ts`; read `classifyConflict`, `LEDGERS`, `REGISTERS`, `resolveRebase`, `resolvePath` | `classifyConflict` in `branches.ts` — already settles ledgers, lockfiles, registers, embeds and the install record for rebase and sync | EXTEND | One new kind (`planlog`) and an optional feature-id argument on the existing function; no second classifier |
| Take the rebase target's copy of a conflicted file (delete it when the target deleted it) | `.bkit/core/engine/commands/workflow/branches.ts` | read `resolvePath` docs-policy block (`checkout --theirs` / `rm`), `lockfileResolve`, `registerResolve` | the `docs` policy block in `resolvePath` — same logic, merge direction only | EXTEND | Extract it as `takeDevSide(top, file, dev)`; `resolvePath` and `resolveRebase` both call it |
| Read the feature id of the branch being rebased | `.bkit/core/engine/commands/workflow/branches.ts` | read `rebaseOrigHead`, `rebaseInProgress`, `rebaseVerb`, `currentBranch` (empty while a rebase runs) | `rebaseOrigHead` — reads `orig-head` out of the rebase state directory | EXTEND | Generalise its state-file read so `head-name` is read the same way |
| Refusal reason names the rule | `.bkit/core/engine/commands/workflow/branches.ts` | read `NOT_RESOLVABLE`, `REBASE_HOW` | `NOT_RESOLVABLE` — the reason text for every refused path | EXTEND | Add the plan-file clause to the existing sentence |
| Close the open failures row | `docs/failures.jsonl` | `grep -n 951-build-rebase docs/failures.jsonl`; read `.bkit/core/.bkit/jsonl.md` § Write Idiom | the OPEN row `951-build-rebase-plan-v2-reviewed-add-add-conflict` | EXTEND | A same-key CLOSED row appended with `bkit ledgers append`, never an edit |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts`

- **Existence Check:** the file exists (4012 lines).
- `ConflictKind` gains `"planlog"`. `classifyConflict(file, embeds, fid?)` returns `"planlog"` after the ledger check (so `status.jsonl` stays a ledger) when `fid` is given and the path is under `docs/plans/{YYYYMM}/logs/{fid}/` or is `docs/plans/{YYYYMM}/{fid}-plan.md` (`fid` escaped, whole-path match, `{YYYYMM}` six digits). No `fid`, no `planlog`.
- `takeDevSide(top, file, dev)` extracted from `resolvePath`'s `docs` policy block; both callers use it.
- `resolveRebase` reads the feature id from the rebase state (`head-name`, `refs/heads/feat/{fid}`), passes it to `classifyConflict`, settles `planlog` with `takeDevSide(top, f, "ours")`, records `how: "dev"` and logs `RESOLVED {path} — took the rebase target's copy`.
- `NOT_RESOLVABLE` names the plan-file clause: "or a plan file of this feature's own branch". `resolvePath` (sync) passes no feature id and keeps its behaviour.
- The `rebase` verb's `summary` and `resolved` output text mention the new shape (TASK 3).
