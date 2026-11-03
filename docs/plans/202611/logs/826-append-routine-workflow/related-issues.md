## #758 — Workflow optimisation: tracker, roadmap and ledgers (done) (closed)

Completed workflow-optimisation issues about tracker reads and writes, labels, the roadmap, ledgers and telemetry, that have no other parent.

Closed: every sub-issue is closed. Open work in this area is under #750 — Workflow optimisation (https://github.com/cbartens/bkit/issues/750).

## #387 — Close workflows leave stats.jsonl uncommitted after push (closed)

## Problem

After design/plan (and similarly build/debug) close, the main checkout is left with **uncommitted edits** to `.bkit/stats.jsonl` — typically a `counter` row, `compliance` rows from `bkit comply`, and an `outcome` row.

Repro (observed after `#384` design close on `dev`):

1. Run `/bkit-design` through Close Workflow.
2. `docs({FID}): design DONE bkit [skip ci]` lands on `dev` and is pushed.
3. Working tree still shows `M .bkit/stats.jsonl` with new lines such as:
   - `kind:"counter"` / `step:"design-close-workflow"` (`DESIGN_ATTEMPT`)
   - `kind:"compliance"` / `step:"close-gate"` (`no-mirror-edit`, `skip-ci-not-head`)
   - `kind:"outcome"` / `step:"design-close-workflow"`

Those rows are load-bearing telemetry (`merge=union`, harvested, folded into close comments) but never enter the DONE commit, so they strand until a later manual commit or ship sweep.

### Why

Ordering + tree mismatch:

1. **Counter** is appended to `$REPO_ROOT/.bkit/stats.jsonl` (main checkout) while the feat commit runs in the **worktree** — `git add -A` there never stages the main-tree file.
2. Design/plan squash stray allow-list permits `docs/plans/…`, ledger jsonl, and `.bkit/friction.jsonl`, but **not** `.bkit/stats.jsonl`.
3. `bkit-workflow-telemetry.sh` (writes compliance + outcome, then prints the report) is invoked **after** the DONE commit + `git push origin dev`, when building the tracker comment body.

Ship already avoids this: it writes counter/outcome **before** `docs({FID}): ship DONE`, stages `.bkit/stats.jsonl` on the pathspec commit, pushes, then runs **summary-only** for the comment.

## Suggested change

Mirror ship’s close bookkeeping on design/plan (and align build/debug):

1. After the local `docs({FID}): {phase} DONE bkit [skip ci]` commit exists (so `skip-ci-not-head` grades the real HEAD subject), run the telemetry **write** path (`comply` + outcome; keep counter in the same window).
2. Stage `.bkit/stats.jsonl` into that close (amend the unpushed DONE commit, or a second `[skip ci]` commit on local `dev`) and **allow-list** `.bkit/stats.jsonl` in the squash stray filter (same class as `.bkit/friction.jsonl`).
3. Push once with stats included.
4. For the tracker comment, call `pnpm bkit telemetry summary --phase={phase}` only — do **not** re-append via `bkit-workflow-telemetry.sh` after push.

Constraint: compliance must see the DONE commit’s subject, so write-after-DONE / before-push — not before the DONE commit exists. Outcome/counter only need local HEAD; they do not need the remote push.

### Touch points

- `.cursor/commands/bkit-{design,plan,build,debug}.md` (+ Claude / `.bkit/workflows/` mirrors)
- `.bkit/scripts/bkit-workflow-telemetry.sh` (or split write vs summary callers)
- Stray allow-lists in design/plan close squash
- Ship already correct — use as reference; avoid regressing its pathspec commit

## Acceptance

- [ ] After a successful design (and plan) close + push, `git status` on the main checkout is clean with respect to `.bkit/stats.jsonl` (no stranded counter/compliance/outcome rows).
- [ ] Those rows are present in the pushed DONE commit (or an immediately preceding `[skip ci]` bookkeeping commit on the same push).
- [ ] Tracker close comment still embeds a telemetry report (summary read of committed rows).
- [ ] `skip-ci-not-head` / `no-mirror-edit` still grade the DONE HEAD before push.
- [ ] Build/debug close no longer leaves post-PR stranded `stats.jsonl` writes (same write-then-commit / summary-only-for-comment split), or document an intentional exception with a follow-up issue.
- [ ] Ship close remains pathspec-clean (`.bkit/stats.jsonl` still committed; no double-append).

## Out of scope

- Changing stats schema / `kind` shapes.
- Rollup/archive of `stats.jsonl` (`MAX_ROWS_BEFORE_ROLLUP`).
- Making compliance gating (stays advisory / fail-open).

## Fix landed on `dev`

Commit: [`a7e84537`](https://github.com/cbartens/bkit/commit/a7e84537) — `fix(387): commit close telemetry before push across workflows`

### What changed

Mirrored ship’s write-then-commit pattern across the non-ship closes:

<!-- prettier-ignore -->
| Phase | Write site | Commit | Tracker comment |
| --- | --- | --- | --- |
| **design / plan** | After local `docs(…): DONE` on `$REPO_ROOT` | `docs({FID}): close telemetry bkit [skip ci]` (pathspec `.bkit/stats.jsonl`) before `git push origin dev` | `pnpm bkit telemetry summary --phase={phase}` only |
| **build / debug** | Worktree `$(git rev-parse --show-toplevel)/.bkit/stats.jsonl` (counter + `bkit-workflow-telemetry.sh`) | Included in loud `chore({FID}): close-workflow` via `git add -A` | summary-only |
| **ship** | unchanged (already correct) | pathspec DONE | summary-only |

### Details

1. **`bkit-workflow-telemetry.sh`** — `STATS` now targets show-toplevel (current tree), not `$REPO_ROOT` alone, so worktree closes can stage the ledger.
2. **design/plan STRAY allow-list** — added `.bkit/stats.jsonl` beside friction: `^\.bkit/(friction|stats)\.jsonl$`.
3. **Counter move (design/plan)** — no longer appended from the worktree (that left `$REPO_ROOT` dirty); written on main after DONE, then committed with compliance/outcome.
4. **`.bkit/workflows.md`** — documented commit-before-push + summary-only comment rule (#387).
5. **Gates** — close checklists assert telemetry committed / summary-only comment.
6. **Wiring tests** — `bkit-comply-gate-wiring.test.ts` asserts one pre-push write-script call + summary-only comment (ship parity).
7. **Mirrors** — regenerated `.claude/commands/` + `.cursor/commands/` via `pnpm bkit install --claude --cursor`; template script synced.
8. **Residue** — prior stranded `#384` design close rows committed into this fix so working tree is clean.

### Verification

- `vitest` wiring + telemetry script tests green; full pre-push suite green on commit/push.

## Timing + CI safety (follow-up)

### Are `stats.jsonl` updates as late as possible?

**As late as possible without a second push that could cancel CI — yes. Literally the last workflow step — no.**

<!-- prettier-ignore -->
| Phase | When stats are written + committed | What still runs after |
| --- | --- | --- |
| **design / plan** | After local `docs(…): DONE`, then `docs({FID}): close telemetry bkit [skip ci]`, then **one** `git push origin dev` | Worktree/branch cleanup → tracker comment (summary **read** only) → final return |
| **build / debug** | Into the **loud** `chore({FID}): close-workflow` commit (no `[skip ci]`), then that push | PR create → CI-Dispatch gate → tracker comment (summary-only) → final return |
| **ship** | Unchanged: pathspec on `docs({FID}): ship DONE bkit [skip ci]`, single push | Tracker comment (summary-only) → final return |

Cannot move writes after the tracker comment / final return without another commit+push. For build/debug, cannot move writes to *after* CI starts without a follow-up push on the PR head.

### Do they interfere with CI / cancel in-flight runs?

**No — by construction.**

Known hazard (documented for ship): a later push onto a branch that already has an in-flight Actions run can cancel that run (e.g. skip-ci / bookkeeping push after a loud push — same class as the #785 cancelled #784 incident).

<!-- prettier-ignore -->
| Path | Why safe |
| --- | --- |
| **design / plan** | Both `DONE` and `close telemetry` carry `bkit [skip ci]`. **Single** `git push origin dev` — tip is skip-ci. No CI run is started by this close path, so there is nothing to cancel. |
| **build / debug** | Stats ride **inside** the loud close-workflow HEAD (HEAD-Subject Assertion still forbids suppressors). **One** loud push fires CI. There is **no** post-CI `[skip ci]` stats push on top of that HEAD. |
| **Would be unsafe** | Loud push → CI starts → later `[skip ci]` stats-only push on the same branch/PR head → can cancel the in-flight run. **Not what we ship.** |

Ship close remains post-merge bookkeeping (`[skip ci]` DONE after squash CI already dispatched from the merge) — same pattern as before #387.

### Intentional placement rule

- **Commit-before-push** so `.bkit/stats.jsonl` is never stranded.
- **No write after the CI-triggering push** on build/debug.
- **Tracker comments = summary-only** (`pnpm bkit telemetry summary`) — never re-append via `bkit-workflow-telemetry.sh` after push.

## Follow-up: path idiom unification

Addressed review: docs must describe **current state only** (no issue IDs), and close/ledger mechanisms must match across workflows.

### Docs

- Removed `Commit-before-push (#387)` / any issue-id wording from `.bkit/workflows.md`.
- Documented the single path idiom under § Telemetry Ledgers:
  - `REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")`
  - `WT=$(git rev-parse --show-toplevel)` (or `WT="$REPO_ROOT"` when the block only uses `git -C "$REPO_ROOT"`)
  - `STATUS="$WT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"`
  - `STATS="$WT/.bkit/stats.jsonl"` · `FRICTION="$WT/.bkit/friction.jsonl"`
  - `docs/{deferrals,failures,knowledge,decisions}.jsonl` → `"$WT/docs/…"`
- Same close pathspec on main for design/plan/ship: `docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.jsonl .bkit/stats.jsonl`
- Pre-worktree allow-list matches that ledger pair.

### Workflow alignment

<!-- prettier-ignore -->
| Surface | Change |
| --- | --- |
| **design / plan** | Write counter + `bkit-workflow-telemetry.sh` **before** DONE; single DONE commit with ship-identical pathspec (dropped separate `close telemetry` commit) |
| **build / debug** | Close preamble uses `WT=` + `STATS="$WT/.bkit/stats.jsonl"` (same idiom); worktree still `git add -A` (sandbox) |
| **ship** | Close uses `WT="$REPO_ROOT"` after switch-to-dev; `STATUS`/`STATS`/`FRICTION`/`docs/*.jsonl` all under `$WT`; pathspec unchanged |
| **`bkit-workflow-telemetry.sh`** | Same `REPO_ROOT`/`WT`/`STATUS`/`STATS` preamble (no issue-id comments) |

### Unchanged on purpose

- Build/debug stay on `git add -A` inside the worktree (post-worktree sandbox rule) — path *resolution* matches; staging *command* differs because cwd is the sandbox.
- Locks remain on `$REPO_ROOT/.../.lock` (absolute main-tree inode).
