# Build starts on a plan-closed branch Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

A build resumes `feat/{FID}`, the branch the plan phase pushed and left on the remote, and rebases it onto `origin/dev`. The plan close already landed the feature's plan files on `dev`, so the same plan-log files exist on both sides and git reports an add/add conflict. `bkit branches rebase` (`resolveRebase` in `.bkit/core/engine/commands/workflow/branches.ts`) classifies those files as `refuse`, aborts, and the build never starts (seen three times: failures keys `951-build-rebase-plan-v2-reviewed-add-add-conflict`, `916-build-rebase-add-add-conflict-plan-logs`, `912-build-rebase-add-add-plan-v2-reviewed`).

Decided by the owner on 2026-11-17: the engine keeps `dev`'s copy of a plan-log file that exists on both sides, and the build starts. The rule stays narrow: only files under the feature's own `docs/plans/{YYYYMM}/logs/{FID}/` folder and its `docs/plans/{YYYYMM}/{FID}-plan.md` take `dev`'s copy; any other conflict still stops the build. The planning branch is not deleted at plan close, and the build does not keep refusing with a clearer message.

**Related Issues:**

- #994 — Build cannot start: the planning branch is kept at plan close and the build's rebase hits add/add conflicts in plan logs (open)
- #1050 — Host-made worktrees: gaps left after setup adopts them (lands first; both change `worktrees.ts`)
- #345 — Failures triage (parent tracker)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

An owner starts a build on a feature whose planning branch was left on the remote after the plan close. The build's rebase meets the plan files that both `dev` and the branch hold, keeps `dev`'s copy of each, and the build starts with no stop and no hand repair.

### Success Criteria

- A build started after a plan close that kept its branch does not stop on an add/add conflict in that feature's plan-log files or its plan file.
- Each such file ends up with `dev`'s content, and the rebase log says so (`RESOLVED {path} — took the rebase target's copy`).
- A conflict in any other file (code, another feature's plan logs, a plan file on a branch not named `feat/{FID}`) still stops the build, and the refusal reason names the rule.
- The ledger row `951-build-rebase-plan-v2-reviewed-add-add-conflict` is closed with a CLOSED row appended through `bkit ledgers append`.

### Process Sketch

- **WHEN** `bkit worktrees setup` resumes `feat/{FID}` and its rebase onto `origin/dev` stops on an add/add conflict in `docs/plans/{YYYYMM}/logs/{FID}/plan-v2-reviewed.md` **→ THEN** setup exits 3 with the rebase in progress, as today.
- **WHEN** `bkit branches rebase` runs **→ THEN** it takes the rebase target's copy of each file of this feature's own plan-log folder and plan file, unions `status.jsonl`, finishes the rebase and exits 0; the next `setup` run exits 0.
- **IF** the same rebase also conflicts in a code file, in another feature's plan log, or the branch is not `feat/{FID}` **→ THEN** the rebase is refused and aborted, and the reason names the plan-file rule.

### Concrete Example

**Setup:** `feat/42-thing` holds `docs/plans/202610/logs/42-thing/plan-v2-reviewed.md` ("branch copy") and `docs/plans/202610/42-thing-plan.md`; `origin/dev` holds both paths with other content ("dev copy") from the plan close.

**Steps:**

1. Build runs `bkit worktrees setup` → exit 3, rebase stopped on the two add/add paths.
2. Build runs `bkit branches rebase` → `RESOLVED` lines for both paths, `COMPLETE`, exit 0.
3. Build runs `bkit worktrees setup` again → exit 0, no sentinel.

**Outcome:** both files read "dev copy" in the worktree, `git status` is clean, the build proceeds.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| The branch added the log in one commit and changed it in a later commit | Each replayed commit's conflict takes `dev`'s copy; the rebase completes |
| Both copies are byte-identical (the `951` sighting) | The commit empties and is skipped, as today |
| `status.jsonl` in the feature's log folder conflicts | It is still unioned, not replaced by `dev`'s copy |
| Another feature's plan log, or `{FID}-other` sharing the id as a prefix, conflicts | Refused and aborted |
| The branch is not named `feat/{FID}` | No plan-log rule applies; refused as today |
| The same conflict inside `sync --merge` (ship Step 4) | Unchanged: not part of this plan |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `classifyConflict` returns the plan-log shape only for this feature's log folder (any depth) and `{FID}-plan.md`, keeps `status.jsonl` a ledger, and refuses other features, prefix-sharing ids, `{FID}-design.md` and any path when no feature id is given | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| a plan log both sides added is settled on the rebase target's copy and the rebase completes (including a byte-identical copy that empties its commit) | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| a plan log added in one commit and changed in a later one takes the target's copy in both rounds | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| the feature's plan file takes the target's copy while `status.jsonl` in the same pass is unioned | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| another feature's plan log is refused and the reason names the plan-file rule | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| a code conflict beside the plan logs is refused with the plan log left unresolved and the reason naming the rule | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| a branch not named `feat/{FID}` gets no plan-log rule | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| a plan-closed branch with a leftover push: `setup` stops, `branches rebase` keeps `dev`'s copy, `setup` then starts (real remote, real worktree) | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 2 |
| a code conflict beside the plan logs still stops the start with the sentinel and a reason naming the rule | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 2 |
| does not silently drop a later branch edit to the plan file when dev changed an adjacent line | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 6 |
| names the kept branch copy in the rebase log by an outbox-relative path, never an absolute one | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 7 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

None. No new file, route, table or CLI flag. One new conflict shape name inside the engine (`planlog`, a value of `ConflictKind`); `Resolution.how` reuses its existing `dev` value, so the `bkit branches rebase` JSON gains no new enum member.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Assumption:** `dev`'s copy wins for every replayed commit that touches the feature's own plan files, including a later commit that changed the file on the branch (modify/modify, not only add/add) → a build-phase edit to `{FID}-plan.md` or a log made on the branch before a rebase, with `dev`'s copy also changed since the plan close, is replaced by `dev`'s copy. This follows the owner's 2026-11-17 decision ("keeps `dev`'s copy").
- **Assumption:** the plan close writes `docs/plans/{YYYYMM}/{FID}-plan.md` and `docs/plans/{YYYYMM}/logs/{FID}/**` only (read from `canonicalDocs` and the land audit in `branches.ts`) → a plan close that also writes another path would still stop a build on that path.
- **Assumption:** the rebased branch name `feat/{FID}` is the feature id (the same rule `rebaseVerb` and `regenerateVerb` use) → a branch named otherwise gets no plan-log rule.
- **Assumption:** `worktrees.ts` needs no change: its resume rebase already leaves the conflict in progress for `bkit branches rebase`, and the workflow re-runs `setup` afterwards → if `setup` itself had to resolve the conflict, a code change in `worktrees.ts` would be added.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- **A refusal that names the file and one fix command** (the issue's second option): rejected by the owner's 2026-11-17 decision.
- **Delete the planning branch at plan close:** rejected by the same decision; the branch stays.
- **A resolver in `worktrees.ts`'s resume rebase:** rejected: it would be a second way to settle a conflict beside `classifyConflict`.
- **Why the planning branch is kept at plan close** (the issue's third success criterion, a decision row) is left out of this run: the reason is not written down and the owner has to confirm it first.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| A decision row saying why the planning branch is kept at plan close | The reason is not recorded anywhere; the owner must confirm it before it is written | A follow-up on #994 after the owner confirms the reason |
| The same plan-log rule in `sync --merge` (`resolvePath`, ship Step 4 and the docs merge) | The issue is about the build start's rebase; `docs` policy already takes `dev` for `docs/` paths and `full` policy hands the rest to a person | Keep deferred until a sighting shows it |
| Changes to `worktrees.ts` | The resume rebase needs none (see the assumption above) | n/a |
| Deleting a leftover planning branch | Owner decision of 2026-11-17 | n/a |

## Suggested Scope Expansion

None.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The resolver only picks a side for paths inside one feature's own plan folder, derived from the rebased branch name through a literal prefix (`feat/`) and an escaped match.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package added.
- [ ] **Dependency Versions:** unchanged.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** files read: `branches.ts`, `branches.test.ts`, `worktrees.ts`, `worktrees.integration.test.ts`.
- [ ] **Project Context:** `docs/failures.jsonl` rows 951 / 916 / 912 read.
- [ ] **Project Documents:** assessed through `.agents/docs.md`; see `Documentation Consultation`.
- [ ] **Prerequisite Plans:** #1050 lands first (both change `worktrees.ts`; this plan changes no line of it).

### Conditional

- [ ] **Architecture & UI:** no UI.
- [ ] **Deployments & Setup:** the built `dist/` and rendered copies are refreshed in TASK 4.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes | `docs/architecture.md` (searched for conflict and rebase wording: none) | covered | None. The change sits inside an existing engine command. |
| technology | `docs/technology.md` | yes | `docs/technology.md` (conventions only) | covered | None. |
| security | `docs/security.md` | no — no auth, input or secret surface | `none` | none | None. Not applicable. |
| testing | `docs/testing.md` | yes | `docs/testing.md` rows for `branches.test.ts` (line ~966), `worktrees.integration.test.ts` (lines ~865 and ~964) | covered | Update both rows in TASK 3. |
| data-schema | `docs/data-schema.md` | no — no database | `none` | none | None. Not applicable. |
| design | `docs/design.md` | no — no UI | `none` | none | None. Not applicable. |
| observability | `docs/observability.md` | no — no new log name; the rebase log gains one `RESOLVED` line shape | `none` | none | None. |
| deployments | `docs/deployments.md` | yes | `docs/deployments.md` line ~309 (Path B `sync --merge` text) | covered | Unchanged: `sync --merge` is out of scope. |
| workflow conflict tiers | `.bkit/core/.bkit/workflows.md` | yes | `.bkit/core/.bkit/workflows.md` § conflict recovery tiers (Tier 2 row, line ~835) | covered | Update the Tier 2 row in TASK 3. |
| cli | `.bkit/core/.bkit/cli.md` | yes | `.bkit/core/.bkit/cli.md` `rebase` row (line 94, generated from the verb's `summary`) | covered | Regenerate with `pnpm cli:sync` in TASK 3. |

Carry each required read and each doc update into the runbook task that needs it (`READ:` and `UPDATE:` lines).

## Documentation Warnings

None

## Data Schema Integration

None — no database.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Classify a feature's plan-log conflict as auto-resolvable | `.bkit/core/engine/commands/workflow/branches.ts` | `grep -n classifyConflict .bkit/core/engine/commands/workflow/*.ts`; read `classifyConflict`, `LEDGERS`, `REGISTERS`, `resolveRebase`, `resolvePath` | `classifyConflict` in `branches.ts` — already settles ledgers, lockfiles, registers, embeds and the install record for rebase and sync | EXTEND | One new kind (`planlog`) and an optional feature-id argument on the existing function; no second classifier |
| Take the rebase target's copy of a conflicted file (delete it when the target deleted it) | `.bkit/core/engine/commands/workflow/branches.ts` | read `resolvePath` docs-policy block (`checkout --theirs` / `rm`), `lockfileResolve`, `registerResolve` | the `docs` policy block in `resolvePath` — same logic, merge direction only | EXTEND | Extract it as `takeDevSide(top, file, dev)`; `resolvePath` and `resolveRebase` both call it |
| Read the feature id of the branch being rebased | `.bkit/core/engine/commands/workflow/branches.ts` | read `rebaseOrigHead`, `rebaseInProgress`, `rebaseVerb`, `currentBranch` (empty while a rebase runs) | `rebaseOrigHead` — reads `orig-head` out of the rebase state directory | EXTEND | Generalise its state-file read so `head-name` is read the same way |
| Refusal reason names the rule | `.bkit/core/engine/commands/workflow/branches.ts` | read `NOT_RESOLVABLE`, `REBASE_HOW` | `NOT_RESOLVABLE` — the reason text for every refused path | EXTEND | Add the plan-file clause to the existing sentence |
| End-to-end proof through the build start | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | read the resume describe (`bkit worktrees setup — mint (resume)`), `fixture`, `advanceDev`, `setup` | the resume conflict test (`a conflict is left in progress for the resolver`) | EXTEND | A new case beside it that adds `branches rebase` and a second `setup` |
| Close the open failures row | `docs/failures.jsonl` | `grep -n 951-build-rebase docs/failures.jsonl`; read `.bkit/core/.bkit/jsonl.md` § Write Idiom | the OPEN row `951-build-rebase-plan-v2-reviewed-add-add-conflict` | EXTEND | A same-key CLOSED row appended with `bkit ledgers append`, never an edit |

## Architecture & Component Changes

**Ledger rows:** None

### Database Migrations

None

### Engine: conflict classification and resolution

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts`

- **Existence Check:** the file exists (4012 lines).
- `ConflictKind` gains `"planlog"`. `classifyConflict(file, embeds, fid?)` returns `"planlog"` after the ledger check (so `status.jsonl` stays a ledger) when `fid` is given and the path is under `docs/plans/{YYYYMM}/logs/{fid}/` or is `docs/plans/{YYYYMM}/{fid}-plan.md` (`fid` escaped, whole-path match, `{YYYYMM}` six digits). No `fid`, no `planlog`.
- `takeDevSide(top, file, dev)` extracted from `resolvePath`'s `docs` policy block; both callers use it.
- `resolveRebase` reads the feature id from the rebase state (`head-name`, `refs/heads/feat/{fid}`), passes it to `classifyConflict`, settles `planlog` with `takeDevSide(top, f, "ours")`, records `how: "dev"` and logs `RESOLVED {path} — took the rebase target's copy`.
- `NOT_RESOLVABLE` names the plan-file clause: "or a plan file of this feature's own branch". `resolvePath` (sync) passes no feature id and keeps its behaviour.
- The `rebase` verb's `summary` and `resolved` output text mention the new shape (TASK 3).

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.test.ts`

- **Existence Check:** the file exists.
- New classification case and a new describe for a plan-closed branch with a leftover push, with a fixture on a `feat/{fid}` branch.

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

- **Existence Check:** the file exists.
- Two cases through `setup` and `branches rebase` against a real bare remote. `advanceDev` creates parent folders for a nested path.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

None

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` | Tier 2 row: add this feature's own plan-log folder and `{FID}-plan.md` to what `bkit branches rebase` settles on the rebase target's copy; Tier 3 row stays |
| `.bkit/core/.bkit/cli.md` | Regenerated `rebase` row (from the verb's `summary`) |
| `docs/testing.md` | `branches.test.ts` and `worktrees.integration.test.ts` rows name the new cases |
| `docs/failures.jsonl` | CLOSED row for `951-build-rebase-plan-v2-reviewed-add-add-conflict` (TASK 5) |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database. |
| **Code** | `git revert {COMMIT}` | Restores the refusal; the failures row can be reopened with a same-key OPEN row. |
| **Risk window** | None | The rule applies only to paths inside one feature's own plan folder during a rebase. |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

**Implementation Tasks:**

<!-- bkit:group 1 start -->

### TASK GROUP 1: Plan-log conflicts settled on the rebase target's copy

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Classify a feature's own plan files as the plan-log conflict shape
  - **UPDATE:** `classifyConflict` in `.bkit/core/engine/commands/workflow/branches.ts`: optional third argument `fid`; returns `"planlog"` after the ledger check for `docs/plans/{YYYYMM}/logs/{fid}/**` and `docs/plans/{YYYYMM}/{fid}-plan.md`, and never without `fid`
  - **UPDATE:** `ConflictKind` in `.bkit/core/engine/commands/workflow/branches.ts`: adds `"planlog"`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: a case in `branches rebase: classification`
  - **READ:** `LEDGER_PATTERNS` in `.bkit/core/engine/commands/workflow/branches.ts`: the ledger check that must still win for `status.jsonl`
  - **DONE WHEN:** `classifyConflict("docs/plans/202611/logs/994-x/plan-v2-reviewed.md", new Map(), "994-x")` and the feature's `-plan.md` return `"planlog"`; `status.jsonl` in that folder returns `"ledger"`; another feature's log, a prefix-sharing id, `994-x-design.md` and every path without `fid` return `"refuse"`; the rest of `branches.test.ts` classification cases still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `classifies only the feature's own plan files as the plan-log shape` fails on `classifyConflict` ignoring the feature id and returning `refuse`, so the assertion "planlog" is not met

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Settle plan-log conflicts on the target's copy in `bkit branches rebase`, and prove the build start
  - **UPDATE:** `resolveRebase` in `.bkit/core/engine/commands/workflow/branches.ts`: reads the feature id of the branch being rebased, passes it to `classifyConflict`, settles a `planlog` path with `takeDevSide(top, f, "ours")`, records `how: "dev"`, logs `RESOLVED {path} — took the rebase target's copy`
  - **UPDATE:** `resolvePath` in `.bkit/core/engine/commands/workflow/branches.ts`: the `docs` policy block calls the extracted `takeDevSide(top, file, "theirs")`, behaviour unchanged
  - **UPDATE:** `resolvePath` in `.bkit/core/engine/commands/workflow/branches.ts`: the extracted helper `takeDevSide(top, file, dev)` checks out `--ours` / `--theirs` and adds the file, or `git rm`s it when that side deleted it (extracted, not new logic)
  - **UPDATE:** `rebaseOrigHead` in `.bkit/core/engine/commands/workflow/branches.ts`: its state-file read is generalised so a `rebasedFid` helper reads `head-name` from `rebase-merge` / `rebase-apply` and returns `{fid}` for `refs/heads/feat/{fid}`, else null
  - **UPDATE:** `NOT_RESOLVABLE` in `.bkit/core/engine/commands/workflow/branches.ts`: the reason adds "a plan file of this feature's own branch"; `REBASE_HOW` beside it covers `dev`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: a describe for a plan-closed branch with a leftover push, with a `feat/{fid}` fixture (two commits on the branch, a squashed copy on `main`)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`: two cases in `bkit worktrees setup — mint (resume)`; `advanceDev` makes parent folders
  - **READ:** `rebaseVerb` in `.bkit/core/engine/commands/workflow/branches.ts`: the caller of `resolveRebase` that must keep working
  - **READ:** `.bkit/core/engine/commands/workflow/worktrees.ts`: the resume rebase at `rebase --rebase-merges`, which stays unchanged
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a rebase of `feat/{fid}` onto a target holding the same plan log, in one commit or across two, completes with `dev`'s content, `how: "dev"` and exit 0; `status.jsonl` is unioned in the same pass; a code conflict, another feature's log or a branch not named `feat/{fid}` is refused, aborted, and its `reason` contains "plan file of this feature"; through a real remote and worktree `setup` exits 3, `branches rebase` exits 0 and a second `setup` exits 0; the existing `sync` docs-policy cases in `branches.test.ts` still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `takes the rebase target's copy of a plan log both sides added, and completes the rebase` fails on the rebase being refused, the exit code being 3 so the check "expected 3 to be 0" shows
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `takes the target's copy in each round when the branch changed the plan log in a later commit` fails on the second replayed commit's conflict stopping the rebase, "expected 3 to be 0"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass` fails on the plan file refusing the whole set, "expected 3 to be 0"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `refuses another feature's plan log and names the rule in the reason` fails on the refusal reason lacking the plan-file clause, "plan file of this feature"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `refuses a code conflict beside the plan logs, leaving the plan log unresolved` fails on the reason lacking the plan-file clause, "plan file of this feature"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `gives a branch not named feat/{fid} no plan-log rule` fails on the reason lacking the plan-file clause, "plan file of this feature"
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts` fails on `branches rebase` refusing the plan log, "expected 3 to be 0"
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `a code conflict beside the plan logs still stops the start, and the reason names the rule` fails on the reason lacking the plan-file clause, "plan file of this feature"

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Docs, built output and the failures row

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Describe the new shape in the verb help and the docs
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

- [x] **TASK 4:** Rebuild `dist/` and refresh the rendered copies
  - **UPDATE:** `dist/commands/workflow/branches.js`: rebuilt by `pnpm build`
  - **UPDATE:** `.bkit/workflows.md`: rewritten by `pnpm tsx .bkit/core/engine/cli.ts upgrade` from the doc source, with `.bkit/cli.md` and the other rendered copies
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `pnpm build` exits 0 and `dist/commands/workflow/branches.js` handles the plan-log shape; the upgrade run leaves `bkit check` exit 0; `git status` shows only the files this plan lists, `dist/` and the rendered copies
  - **TEST FIRST:** n/a — a build and a render of existing sources, no behaviour change

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Close the open failures row `951-build-rebase-plan-v2-reviewed-add-add-conflict`
  - **UPDATE:** `docs/failures.jsonl`: one appended `failure` row with the same `key`, `status` `CLOSED`, `severity` `MEDIUM`, a `remediation` saying `bkit branches rebase` settles this feature's own plan files on the rebase target's copy, written with `bkit ledgers append --ledger=failures --rows=<file>` and never by editing a line
  - **READ:** `.bkit/core/.bkit/jsonl.md`: § Write Idiom and the `failure` fields
  - **DEPENDS ON:** 2, 4
  - **DONE WHEN:** `bkit ledgers query --ledger=failures --key=951-build-rebase-plan-v2-reviewed-add-add-conflict` reports status `CLOSED`, and `git diff docs/failures.jsonl` shows only one added line
  - **TEST FIRST:** n/a — a ledger append, no behaviour change

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 6 start -->

- [x] **TASK 6:** A resumed build whose plan edits (task ticks, appended challenge tasks, logs) touch lines `dev` also changed loses the whole commit's edits to that file, non-overlapping hunks included, and `branches rebase` exits 0
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:605` · **Round:** 1
  - **DONE WHEN:** Owner direction (a), decision file `build-decision-1-1.md`: `resolveRebase` still settles a `planlog` conflict on the rebase target's copy (decision row `994-build-keeps-dev-copy-of-plan-logs` unchanged), and the rebase still completes with the exit it has now. When the branch's copy of the file (stage 3, the commit being replayed) differs from the target's copy, that branch copy is first written aside, the same way `carryLeftovers` in `.bkit/core/engine/commands/workflow/worktrees.ts` keeps a differing leftover: the same `dropped-logs/{time}/{path}` place under the feature's outbox folder, never deleted. Reuse that code path: extract its keep-aside directory and copy into one helper that `carryLeftovers` and `resolveRebase` both call; add no second mechanism. The `RESOLVED {path}` log line names the kept path. A branch copy identical to the target's keeps nothing. A target-deleted file whose branch copy exists is kept aside the same way before the delete.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `does not silently drop a later branch edit to the plan file when dev changed an adjacent line` fails on `branches rebase` exiting 0 with the branch's non-overlapping `[x] TASK 3` tick missing from `docs/plans/202611/994-x-plan.md`. Setup: the plan is committed on `main` first, a `feat/994-x` commit ticks TASK 1 and TASK 3, and a `main` commit edits the line under TASK 1. The test passes only when the rebase refuses (`r.code` 3), or when the `[x] TASK 3` tick survives, either in the plan file or in a kept copy of the branch's version that `r.err` names.

<!-- bkit:task 6 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 2 findings

<!-- bkit:task 7 start -->

- [x] **TASK 7:** A plan-log conflict whose branch copy differs makes `bkit branches rebase` write the absolute outbox path (`/Users/{name}/.../.git/bkit-outbox/{FID}/dropped-logs/...`) into `{LOG_DIR}/rebase-resolve-log.md`, a tracked plan log the build commits and ship lands on public `dev`, so the operator's OS user name and checkout layout enter permanent git history
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:637` · **Round:** 2
  - **DONE WHEN:** the `RESOLVED {path}` line names the kept copy through `outboxRel` (`.bkit/core/engine/commands/lib.ts:1190`, "relative to the main checkout, never a home path"), as `.git/bkit-outbox/{FID}/dropped-logs/{time}/{path}`, so no line `branches rebase` appends to `--log-file` holds an absolute path; the test `keeps a differing branch copy larger than 1 MiB aside and names it` resolves the named path against the repo before its `statSync`; `docs/security.md` § PII ("Keep consumer names and paths out of tracked records") holds for the rebase log
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `names the kept branch copy in the rebase log by an outbox-relative path, never an absolute one` fails on the `--log-file=docs/plans/202611/logs/994-x/rebase-resolve-log.md` line reading `kept at {dir}/.git/bkit-outbox/994-x/dropped-logs/...` (`path.isAbsolute` true) for `feat/994-x` with a differing branch copy of `plan-v2-reviewed.md` (verified in a scratch repo with `dist/cli.js branches rebase`: exit 0, the log file untracked and not ignored)

<!-- bkit:task 7 end -->
<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row (none).
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran. A later task that names an earlier task's test takes it over: the build reports the takeover and does not refuse it.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** the rebase log carries one `RESOLVED` line per settled plan file.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Test Synchronization:** `branches.test.ts` (sync docs-policy cases unchanged) and `worktrees.integration.test.ts`.
- [ ] **Build Configuration:** test files stay out of `dist/` as today (`tsc` config unchanged).
- [ ] **Branches and worktrees (`.bkit/core/engine/commands/workflow/branches.test.ts`, `worktrees.integration.test.ts`):** the cases above, on real git repos and a real bare remote.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch clone, keep a planning branch after a plan close, start a build, and see `bkit branches rebase` print `RESOLVED` for the plan files and the build go on.
